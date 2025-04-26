<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShopifyController extends Controller
{
    //this content dont have nothing to make in this project for the moment
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
