<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeController extends Controller
{
    public function success()
    {

    }

    public function failure()
    {

    }

    public function webhook(Request $request)
    {
        //crear una para shopify en caso de cambiar el provedor de pagos
        $stripe = new \Stripe\StripeClient(config('app.stripe_secret_key'));

        $endpoint_secret = config('app.stripe_endpoint_secret');

        $payload = $request->getContent();
        $sig_header = request()->header('Stripe_Signature');
        $event = null;

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
           Log::error($e);
           //invalid payload
           return response('Invalid Payload', 400);
        } catch(\Stripe\Exception\SignatureVerificationException $e){
            Log::error($e);
            return response('Invalid Payload' , 400);
        }

        Log::info('================================');
        Log::info('================================');
        Log::info($event->type);
        Log::info($event);

        //Handle the Event
        switch ($event->type) {
            case 'carg.updated':
                $charge = $event->data->object;
                $transactionId = $charge['balance_transaction'];
                $paymentIntent = $charge['payment_intent'];
                $balanceTransaction = $stripe->balanceTransactions->retrieve($transactionId);

                $orders = Order::where('payment_intent',$paymentIntent)
                    ->get();
                $totalAmount = $balanceTransaction['amount'];
                $stripeFee = 0;
                // Send email to buyer
            case 'checkout.session.completed':
       
        }

    }
}
