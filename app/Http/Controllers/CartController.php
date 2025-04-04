<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;


class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(CartService $cartService)
    {
       return Inertia::render('Cart/Index', [
        'cartItems' => $cartService->getCartItemsGrouped(),
 
       ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Product $product, CartService $cartService)
    {
        $request->mergeIfMissing([
            'quantity' => 1
        ]);

        $data = $request->validate([
            'option_ids'=>['nullable', 'array'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cartService->addItemToCart(
            $product, 
            $data['quantity'], 
            $data['option_ids'],
        );

        return back()->with('success', 'Product added to cart succesfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product , CartService $cartService)
    {
        $request->validate([
            'quantity' => ['integer', 'min:1']
        ]);

        $optionIds = $request->input('option_ids'); //Get the option ID
        $quantity = $request->input('quantity'); //Get the new quantity

        $cartService->updateItemQuantity($product->id, $quantity, $optionIds);

        return back()->with('success','Quantity was updated');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request,Product $product , CartService $cartService)
    {
        $optionIds = $request -> input('options_ids');

        $cartService->removeItemFromCart($product->id, $optionIds);

        return back()->with('success','Product was removed from cart');
    }

    public function checkout()
    {
        
    }
}
