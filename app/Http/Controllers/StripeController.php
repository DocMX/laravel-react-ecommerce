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
use Stripe\Stripe;
use Stripe\Account;

class StripeController extends Controller
{
    //funcion para pago correcto
    public function success(Request $request)
    {
        $user = Auth::user();


        $session_id = $request->get('session_id');
        $orders = Order::where('stripe_session_id', $session_id)
            ->with(['vendorUser', 'orderItems.product'])
            ->get();
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
//funcion oara pago incorrecto
    //funcion para pago incorrecto
    //funcion para pago incorrecto
    //funcion para pago incorrecto      
    public function failure()
    {
        return Inertia::render('Stripe/Failure');
    }

    public function webhook(Request $request)
    {
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

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            if (!$user->stripe_account_id) {
                // 1. Crear la cuenta Express
                $account = Account::create([
                    'type' => 'express',
                    'email' => $user->email,
                    'business_profile' => [
                        'name' => $user->name,
                    ],
                    'capabilities' => [
                        'card_payments' => ['requested' => true],
                        'transfers' => ['requested' => true],
                    ],
                ]);

                $user->stripe_account_id = $account->id;
                $user->save();

                // 2. Crear enlace de onboarding (no login link)
                $accountLink = \Stripe\AccountLink::create([
                    'account' => $account->id,
                    'refresh_url' => route('stripe.connect'),
                    'return_url' => route('filament.admin.pages.dashboard'),
                    'type' => 'account_onboarding',
                ]);

                return inertia()->location($accountLink->url);
            }

            // 3. Si la cuenta existe pero no está activa
            if (!$user->stripe_account_active) {
                // Verificar estado de la cuenta primero
                $account = Account::retrieve($user->stripe_account_id);

                if ($account->details_submitted) {
                    // Si ya completó onboarding, crear login link
                    $link = Account::createLoginLink(
                        $user->stripe_account_id,
                        ['redirect_url' => route('filament.admin.pages.dashboard')]
                    );
                    return inertia()->location($link->url);
                } else {
                    // Si no completó onboarding, crear nuevo enlace
                    $accountLink = \Stripe\AccountLink::create([
                        'account' => $user->stripe_account_id,
                        'refresh_url' => route('stripe.connect'),
                        'return_url' => route('filament.admin.pages.dashboard'),
                        'type' => 'account_onboarding',
                    ]);
                    return inertia()->location($accountLink->url);
                }
            }

            return back()->with('success', 'Your account is already connected.');
        } catch (\Exception $e) {
            return back()->with('error', 'Stripe connection failed: ' . $e->getMessage());
        }
    }
    //funcion para verificar el estado de la cuenta hechopor copilot checar
    public function connectStatus()
    {
        $user = Auth::user();

        if (!$user->stripe_account_id) {
            return back()->with('error', 'You have not connected your Stripe account yet.');
        }

        try {
            $account = Account::retrieve($user->stripe_account_id);

            if ($account->details_submitted) {
                $user->stripe_account_active = true;
                $user->save();
                return back()->with('success', 'Your Stripe account is active.');
            } else {
                return back()->with('warning', 'Your Stripe account is not fully set up yet.');
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to retrieve Stripe account status: ' . $e->getMessage());
        }
    }
}
