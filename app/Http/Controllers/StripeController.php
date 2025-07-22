<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Http\Resources\OrderViewResource;
use App\Mail\CheckoutCompleted;
use App\Mail\NewOrderMail;
use Illuminate\Support\Facades\Mail;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StripeController extends Controller
{
    public function success(Request $request)
    {
        $user = Auth::user();


        $session_id = $request->get('session_id');
        $orders = Order::where('stripe_session_id', $session_id)
            ->with(['vendorUser', 'orderItems.product'])
            ->get();
        //dd($orders );
        if ($orders->count() === 0) {
            abort(404);
        }

        foreach ($orders as $order) {
            if ($order->user_id !== $user->id) {
                abort(403);
            }
        }

        return Inertia::render('Stripe/Success', [
            'orders' => OrderViewResource::collection($orders)->collection->toArray(),
        ]);
    }

    public function failure()
    {
        return Inertia::render('Stripe/Failure');
    }

    public function webhook(Request $request)
    {
        // Validar el webhook rápidamente primero
        $endpoint_secret = config('app.stripe_webhook_secret');
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sig_header,
                $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid Stripe payload: ' . $e->getMessage());
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid Stripe signature: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        // Manejar el evento de forma asíncrona
        dispatch(function () use ($event) {
            $stripe = new \Stripe\StripeClient(config('app.stripe_secret_key'));

            switch ($event->type) {
                case 'charge.updated':
                    $this->handleChargeUpdated($event, $stripe);
                    break;

                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event);
                    break;

                default:
                    Log::info('Received unhandled event type: ' . $event->type);
            }
        });

        // Responde inmediatamente a Stripe
        return response('Webhook received', 200);
    }

    protected function handleChargeUpdated($event, $stripe)
    {
        $charge = $event->data->object;
        $transactionId = $charge['balance_transaction'];
        $paymentIntent = $charge['payment_intent'];

        try {
            $balanceTransaction = $stripe->balanceTransactions->retrieve($transactionId);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve balance transaction: ' . $e->getMessage());
            return;
        }

        $orders = Order::where('payment_intent', $paymentIntent)
            ->with('user', 'vendorUser')
            ->get();

        if ($orders->isEmpty()) {
            Log::error('No orders found for payment intent: ' . $paymentIntent);
            return;
        }

        $totalAmount = $balanceTransaction['amount'];
        $stripeFee = collect($balanceTransaction['fee_details'])
            ->where('type', 'stripe_fee')
            ->sum('amount');

        $platformFreePercent = config('app.platform_fee_pct', 0);

        foreach ($orders as $order) {
            $vendorShare = $order->total_price / $totalAmount;

            $order->online_payment_commission = $vendorShare * $stripeFee;
            $order->website_commission = ($order->total_price - $order->online_payment_commission) / 100 * $platformFreePercent;
            $order->vendor_subtotal = $order->total_price - $order->online_payment_commission - $order->website_commission;

            $order->save();

            // Enviar emails en segundo plano
            if ($order->vendorUser) {
                Mail::to($order->vendorUser)->queue(new NewOrderMail($order));
            }
        }

        if ($orders->isNotEmpty() && $orders[0]->user) {
            Mail::to($orders[0]->user)->queue(new CheckoutCompleted($orders));
        }
    }

    protected function handleCheckoutSessionCompleted($event)
    {
        $session = $event->data->object;
        $paymentIntent = $session['payment_intent'];

        $orders = Order::with(['orderItems', 'orderItems.product'])
            ->where('stripe_session_id', $session['id'])
            ->get();

        if ($orders->isEmpty()) {
            Log::error('No orders found for session ID: ' . $session['id']);
            return;
        }

        $productsToDeleteFromCart = [];

        foreach ($orders as $order) {
            $order->payment_intent = $paymentIntent;
            $order->status = OrderStatusEnum::Paid;
            $order->save();

            // Acumular IDs de productos para eliminar del carrito
            $productsToDeleteFromCart = array_merge(
                $productsToDeleteFromCart,
                $order->orderItems->pluck('product_id')->toArray()
            );

            // Reducir cantidades de productos/variaciones
            foreach ($order->orderItems as $orderItem) {
                $this->reduceProductQuantity($orderItem);
            }
        }

        // Eliminar productos del carrito
        if (!empty($productsToDeleteFromCart) && $orders->isNotEmpty()) {
            CartItem::where('user_id', $orders[0]->user_id)
                ->whereIn('product_id', array_unique($productsToDeleteFromCart))
                ->where('saved_for_later', false)
                ->delete();
        }
    }

    protected function reduceProductQuantity($orderItem)
    {
        $product = $orderItem->product;
        $options = $orderItem->variation_type_option_ids;

        try {
            if ($options) {
                sort($options);
                $variation = $product->variations()
                    ->whereJsonContains('variation_type_option_ids', $options)
                    ->first();

                if ($variation && !is_null($variation->quantity)) {
                    $variation->decrement('quantity', $orderItem->quantity);
                }
            } elseif (!is_null($product->quantity)) {
                $product->decrement('quantity', $orderItem->quantity);
            }
        } catch (\Exception $e) {
            Log::error('Failed to reduce product quantity: ' . $e->getMessage());
        }
    }
    public function connect()
    {
        $user = Auth::user();

        if (!$user->getStripeAccountId()) {
            $user->createStripeAccount(['type' => 'express']);
        }

        if (!$user->isStripeAccountActive()) {
            return redirect(!$user->getStripeAccountLink());
        }

        return back()->with('success', 'Your account is already connected.');
    }
}
