<?php

namespace App\Services;

use App\Models\Product;
use App\Models\VariationTypeOption;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartService
{
    private ?array $catchedCartItems = null;

    protected const COOKIE_NAME = 'cartItems';

    protected const COOKIE_LIFETIME = 60 * 24 * 354; //1 year

    public function addItemToCart(Product $product, int $quantity = 1,$optionIds = null)
    {

    }

    public function updateItemQuantity(int $productId, int $quantity,$optionIds = null)
    {

    }

    public function removeItemFromCart(int $productId, $optionIds = null)
    {
        
    }

    public function getCartItems(): array
    {
        //we need to put this in try-catch, otherwise if something goes wrong
        // the website will not open at all.
        try {
            if ($this->catchedCartItems === null) {
                //If the user is authenticate, retrieve from the database
                if (Auth::check()) {
                    $cartItems = $this->getCartItemsFromDatabase();
                } else {
                    //If the user is a guest, retrieve from cookies.
                    $cartItems = $this->getCartItemsFromCookies();
                }

                $productIds = collect($cartItems)->map(fn($item) => $item['product_id']);
                $products = Product::whereIn('id', $productIds)
                    ->with('user.vendor')
                    ->forWebsite()
                    ->get()
                    ->keyBy('id');

                $cartItemData = [];
                foreach ($cartItems as $key => $cartItem) {
                    $product = data_get($products, $cartItem['product_id']);
                    if (!$product) continue;

                    $optionInfo = [];
                    $options = VariationTypeOption::with('variationType')
                        ->where('id', $cartItem['option_ids'])
                        ->get()
                        ->keyBy('id');

                    $imageUrl = null;

                    foreach ($cartItem['option_ids'] as $option_id) {
                        $option = data_get($options,$option_id);
                        if (!$imageUrl) {
                            $imageUrl = $option->getFirstMediaUrl('images', 'small');
                        }
                        $optionInfo[] = [
                            'id' => $option_id,
                            'name' => $option->name,
                            'type' => [
                                'id' => $option->variationType->id,
                                'name' => $option->variationType->name,

                            ],
                        ];
                    }

                    $cartItemData[] = [
                        'id' => $cartItem['id'],
                        'product_id' => $product->id,
                        'title'=> $product->title,
                        'slug'=> $product->slug,
                        'price'=> $cartItem['price'],
                        'quantity' => $cartItem['quantity'],
                        'option_ids' => $cartItem['option_ids'],
                        'options' => $optionInfo,
                        'image' => $imageUrl ?: $product->getFirstMediaUrl('images', 'small'),
                        'user' => [
                            'id' => $product->created_by,
                            'name' => $product->user->vendor->store_name,
                        ],
                    ];
                }
                $this->catchedCartItems = $cartItemData;
            }

            return $this->catchedCartItems;
        } catch (\Throwable $th) {
            Log::error($e->getMessage() . PHP_EOL . $e->getTraceAsString());
        }

        return[];
    }

    public function getTotalQuantity(): int
    {
        
    }

    public function getTotalPrice(): float
    {
        
    }

    public function updateItemQuantityInDatabase(int $productId, int $quantity, array $optionIds): void
    {
        
    }

    public function updateItemQuantityInCookies(int $productId, int $quantity, array $optionIds): void
    {
        
    }

    public function saveItemToDatabase(int $productId, int $quantity, $price): void
    {
        
    }
    
    public function saveItemToCookies(int $productId, int $quantity, $price): void
    {
        
    }

    
    public function removeItemFromDatabase(int $productId,array $optionIds ,int $quantity, $price): void
    {
        
    }

    public function removeItemToCookies(int $productId,array $optionIds, int $quantity, $price): void
    {
        
    }

    public function getCartItemsFromDatabase()
    {

    }

    public function getCartItemsFromCookies()
    {
        
    }
}
