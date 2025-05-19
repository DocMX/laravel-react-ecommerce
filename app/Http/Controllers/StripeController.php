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

class StripeController extends Controller
{
    public function success(Request $request) 
    {
        $user = auth()->user();
       
        
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

        return Inertia::render('Stripe/Success',[
            'orders' => OrderViewResource::collection($orders)->collection->toArray(),
        ]);

    }

    public function failure() {
        return Inertia::render('Stripe/Failure');
    }

    public function webhook(Request $request)
    {
        //crear una para shopify en caso de cambiar el provedor de pagos
        $stripe = new \Stripe\StripeClient(config('app.stripe_secret_key'));

        $endpoint_secret = config('app.stripe_webhook_secret');

        $payload = $request->getContent();
        $sig_header = request()->header('Stripe-Signature');
        $event = null;

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sig_header,
                $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            Log::error($e);
            //invalid payload
            return response('Invalid Payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error($e);
            return response('Invalid Payload', 400);
        }

        //Handle the Event
        switch ($event->type) {
            case 'charge.updated':
                $charge = $event->data->object;
                $transactionId = $charge['balance_transaction'];
                $paymentIntent = $charge['payment_intent'];
                $balanceTransaction = $stripe->balanceTransactions->retrieve($transactionId);

                $orders = Order::where('payment_intent', $paymentIntent)
                    ->with('user', 'vendorUser')
                    ->get();
                    // Check if there are any orders before proceeding
                if ($orders->isEmpty()) {
                    Log::error('No orders found for payment intent: ' . $paymentIntent);
                    break;
                }
                $totalAmount = $balanceTransaction['amount'];
                $stripeFee = 0;
                foreach ($balanceTransaction['fee_details'] as $fee_detail) {
                    if ($fee_detail['type'] === 'stripe_fee') {
                        $stripeFee = $fee_detail['amount'];
                    }
                }
                $platformFreePercent = config('app.platform_fee_pct');


                foreach ($orders as $order) {
                    $vendorShare = $order->total_price / $totalAmount;

                    $order -> online_payment_commission = $vendorShare * $stripeFee;
                    $order -> website_commission = ($order->total_price - $order->online_payment_commission)/ 100 * $platformFreePercent;
                    $order->vendor_subtotal = $order->total_price - $order->online_payment_commission - $order -> website_commission;

                    $order->save();
                    //Todo send email to vendor
                    
                        Mail::to($order->vendorUser)->send(new NewOrderMail($order));
                    
                }
          
                    Mail::to($orders[0]->user)->send(new CheckoutCompleted($orders));
                
            case 'checkout.session.completed':
                $session = $event->data->object;
                $pi = $session['payment_intent'];

                //Find orders by session ID and set payment intent
                $orders = Order::query()
                    ->with(['orderItems'])
                    ->where(['stripe_session_id' => $session['id']])
                    ->get();
                
                $productsToDeletedFromCart = [];
                foreach ($orders as $order ) {
                    $order -> payment_intent = $pi;
                    $order -> status = OrderStatusEnum::Paid;
                    $order -> save();

                    $productsToDeletedFromCart = 
                        [
                            ...$productsToDeletedFromCart,
                            ...$order->orderItems->map(fn($item) => $item->product_id)->toArray()
                        ];

                    //Reduce product quantity
                    foreach ($order->orderItems as $orderItem) {
                        $options = $orderItem -> variation_type_option_ids; 
                        $product = $orderItem -> product;
                        if ($options) {
                            sort($options);
                            $variation = $product->variations()
                                ->whereJsonContains('variation_type_option_ids', $options) //->where('variation_type_option_ids', $options) insqllite
                                ->first();
                            if ($variation && $variation ->quantity != null) {
                                $variation->quantity-= $orderItem->quantity;
                                $variation->save();
                            }
                        }elseif ($product->quantity != null) {
                            $product->quantity-=$orderItem->quantity;
                            $product->save();
                        }
                    }
                }

                CartItem::query()
                    ->where('user_id', $order->user_id)
                    ->whereIn('product_id',  $productsToDeletedFromCart)
                    ->where('saved_for_later', false)
                    ->delete();
            default:
                echo 'Received unknow event type' . $event->type;
        }
        return response('', 200);
    }
    
}
