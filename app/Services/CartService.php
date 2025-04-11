<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\VariationType;
use App\Models\VariationTypeOption;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CartService
{
    private ?array $catchedCartItems = null;

    protected const COOKIE_NAME = 'cartItems';

    protected const COOKIE_LIFETIME = 60 * 24 * 354; //1 year

    public function addItemToCart(Product $product, int $quantity = 1,$optionIds = null)
    {
        if ($optionIds === null) {
           $optionIds = $product->variationTypes
                ->mapWithKeys(fn(VariationType $type) => [$type->id => $type->options[0]?->id])
                ->toArray();
        }
        ksort($optionIds);
        $price = $product -> getPriceForOptions($optionIds);
       
        if (Auth::check()) {
            $this->saveItemToDatabase($product->id,$quantity, $price, $optionIds);
        } else {
            
            $this->saveItemToCookies($product->id,$quantity, $price, $optionIds);
            
        }

    }

    public function updateItemQuantity(int $productId, int $quantity,$optionIds = null)
    {
        ksort($optionIds);
        if (Auth::check()) {
            $this->updateItemQuantityInDatabase($productId, $quantity, $optionIds);
        } else {
            $this->updateItemQuantityInCookies($productId, $quantity, $optionIds);
        }
    }

    public function removeItemFromCart(int $productId, $optionIds = null)
    {
       
        ksort($optionIds);
        if (Auth::check()) {
            $this->removeItemFromDatabase($productId, $optionIds);
        } else {
      
            $this->removeItemFromCookies($productId, $optionIds);
        }
        
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

                //dd($cartItems);

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
                        ->whereIn('id', $cartItem['option_ids'])
                        ->get()
                        ->keyBy('id');
                      


                    $imageUrl = null;
                    
                    foreach ($cartItem['option_ids'] as $option_id) {
                        $option = data_get($options,$option_id);
                        if (!$option) {
                            dd("Error: opción es NULL para el ID:", $option_id, "Opciones disponibles:", $options); // <--- Agrega esto aquí
                        }
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
                        'id' => md5(json_encode($cartItem)), //md5(json_encode($cartItem)) or Uuid::uuid4()->toString(), // Genera un UUID únicocodeholic genera uuid 
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
        } catch (\Throwable $e) {
            //($e->getMessage(), $e->getTrace());
            //throw $e;
            Log::error($e->getMessage() . PHP_EOL . $e->getTraceAsString());
        }

        return[];
    }

    public function getTotalQuantity(): int
    {
        $totalQuantity = 0;
        foreach ($this->getCartItems() as $item) {
            $totalQuantity += $item['quantity'];
        }

        return $totalQuantity;
    }

    public function getTotalPrice(): float
    {
        $total = 0;

        //Assuming $this->getCartItems() returns an array of cart items 
        foreach ($this->getCartItems() as $item) {
            $total += $item['quantity'] * $item['price'];
        }
        return $total;
    }

    public function updateItemQuantityInDatabase(int $productId, int $quantity, array $optionIds): void
    {
        $userId = Auth::id();
        ksort($optionIds);
        $cartItem = CartItem::where('user_id' , $userId)
            ->where('product_id' , $productId)
            ->whereRaw('variation_type_option_ids::jsonb = ?::jsonb', [json_encode($optionIds)])
            ->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => $quantity,
            ]);
        }
        
    }

    public function updateItemQuantityInCookies(int $productId, int $quantity, array $optionIds): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);

        //Use a unique key based on product ID and opton IDs
        $itemKey = $productId . '_' . json_encode($optionIds);

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] = $quantity;
        }

        //Save updated cart items back to the cookie
        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);

    }

    public function saveItemToDatabase(int $productId, int $quantity, $price, $optionIds): void
    {
        $userId = Auth::id();
        ksort($optionIds);

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->whereRaw('variation_type_option_ids::jsonb = ?::jsonb', [json_encode($optionIds)])
            ->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => DB::raw('quantity + ' . $quantity),
            ]);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'variation_type_option_ids' => json_encode($optionIds), // siempre guarda como json
            ]);
        }
        
    }
    
    public function saveItemToCookies(int $productId, int $quantity, $price, $optionIds): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);

        //Use a unique key based on product ID and option IDs
        $itemKey = $productId . '_' . json_encode($optionIds);
        //dd($optionIds, $quantity, $price);
        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] = $quantity;
            $cartItems[$itemKey]['price'] = $price;
        }  else {
            $cartItems[$itemKey] = [
                'user_id' => Str::uuid(),
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'option_ids' => $optionIds,
            ];
        }

        //Save updated cart items back to the cookie
        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
       
    }

    
    public function removeItemFromDatabase(int $productId,array $optionIds )
    {
        $userId = Auth::id();
        ksort($optionIds);

        CartItem::where('user_id' , $userId)
            ->where('product_id' , $productId)
            ->whereRaw('variation_type_option_ids::jsonb = ?::jsonb', [json_encode($optionIds)])
            ->delete();
    }

    public function removeItemFromCookies(int $productId,array $optionIds)
    {
        
        $cartItems = $this->getCartItemsFromCookies();
        
        ksort($optionIds);
       
        //Define the cart Key
        $cartKey = $productId . '_' . json_encode($optionIds);

        //Remove the item from the cart
        unset($cartItems[$cartKey]);

        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }

    public function getCartItemsFromDatabase()
    {
        $userId = Auth::id();
      
        $cartItems = CartItem::where('user_id', $userId)
            ->get()
            ->map(function ($cartItem) {
                return [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem-> product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'option_ids' => is_array($cartItem->variation_type_option_ids) 
                        ? $cartItem->variation_type_option_ids 
                        : json_decode($cartItem->variation_type_option_ids, true),
                ];
            })
            ->toArray();
            
        return $cartItems;
        
    }

    public function getCartItemsFromCookies()
    {
        $cartItems = json_decode(Cookie::get(self::COOKIE_NAME, '[]'), true);

        return $cartItems;
    }
    //TEST
    public function getCartItemsGrouped(): array
    {
        $cartItems = $this->getCartItems();

        return collect($cartItems)
            ->groupBy(fn ($item) => $item['user']['id'])
            ->map(fn ($items , $userId) => [
                'user' => $items->first()['user'],
                'items' => $items->toArray(),
                'totalQuantity' => $items->sum('quantity'),
                'totalPrice' => $items->sum(fn ($item) => $item['price'] * $item['quantity']),
            ])->toArray();
    }

    public function moveCartItemsToDatabase($userId): void
    {
        //Get the cart items from the cookie
        $cartItems = $this-> getCartItemsFromCookies();
        //dd($cartItems); 
        //Loop through the cart items and insert them into the database
        foreach ($cartItems as $itemKey => $cartItem) {
            //Check if the cart item already exists for the user
            $existingItem = CartItem::where('user_id', $userId)
                ->where('product_id', $cartItem['product_id'])
                ->whereRaw("variation_type_option_ids::text = ?", [json_encode($cartItem['option_ids'])])
                ->first();
           
            if ($existingItem) {
                //If the item exists, update the quantity
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $cartItem['quantity'],
                    'price' => $cartItem['price'], //Optional:update price if needed
                ]);
            } else {
                //If the item doesn't exist, create a new record
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $cartItem['product_id'],
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                    'variation_type_option_ids' => json_encode($cartItem['option_ids']),

                ]);
            }
            
        }

        //After transferring the items, delete the cart from the cookies
        Cookie::queue(self::COOKIE_NAME, '',-1); // Delete cookie by setting
    }
}
