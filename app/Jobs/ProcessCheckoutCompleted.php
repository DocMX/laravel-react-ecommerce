<?php

namespace App\Jobs;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Str;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessCheckoutCompleted implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $session;

    /**
     * Create a new job instance.
     */
    public function __construct($session)
    {
        $this->session = $session;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $userId = $this->session->metadata->user_id;

        $order = Order::create([
            'user_id' => $userId,
            'total_price' => $this->session->amount_total / 100,
            'payment_intent' => $this->session->payment_intent,
            'status' => 'paid',
        ]);

        $cartItems = CartItem::with('product')->where('user_id', $userId)->get();

        foreach ($cartItems as $cartItem) {
            $product = $cartItem->product;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $cartItem->quantity,
                'price' => $product->price,
            ]);

            // Reducir el stock del producto
            $product->decrement('stock', $cartItem->quantity);
        }

        // Eliminar carrito del usuario
        CartItem::where('user_id', $userId)->delete();
    }
}
