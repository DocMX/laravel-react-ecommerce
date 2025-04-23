<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeController extends Controller
{
    public function success() {}

    public function failure() {}

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

                $orders = Order::where('payment_intent', $paymentIntent)
                    ->get();
                $totalAmount = $balanceTransaction['amount'];
                $stripeFee = 0;
                // Send email to buyer
            case 'checkout.session.completed':
        }
    }
    //FOR SHOPIFY
    public function handleShopifyWebhook(Request $request)
    {
        // Verifica la firma del webhook (opcional pero recomendado)
        $hmacHeader = $request->header('X-Shopify-Hmac-Sha256');
        $data = $request->getContent();
        $calculatedHmac = base64_encode(hash_hmac('sha256', $data, config('app.shopify_webhook_secret'), true));

        if (!hash_equals($hmacHeader, $calculatedHmac)) {
            Log::warning('Shopify webhook signature mismatch');
            return response('Invalid Signature', 401);
        }

        $webhookData = json_decode($data, true);
        $topic = $request->header('X-Shopify-Topic');

        Log::info('Shopify Webhook Received', [
            'topic' => $topic,
            'data' => $webhookData,
        ]);

        switch ($topic) {
            case 'orders/paid':
                $orderId = $webhookData['id'];
                $paymentGateway = $webhookData['gateway'];
                $totalPrice = $webhookData['total_price'];

                // Aquí actualizas tu base de datos si necesitas guardar la información del pedido
                $order = Order::updateOrCreate(
                    ['shopify_order_id' => $orderId],
                    [
                        'status' => 'paid',
                        'payment_gateway' => $paymentGateway,
                        'total_price' => $totalPrice,
                    ]
                );

                // Notificar al usuario o enviar correo si es necesario
                // Mail::to($order->customer_email)->send(new OrderPaidNotification($order));

                break;

            default:
                Log::info("Unhandled Shopify Webhook Topic: {$topic}");
                break;
        }

        return response('Webhook Handled', 200);
    }
}
