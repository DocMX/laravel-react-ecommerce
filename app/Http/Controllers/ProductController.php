<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    // FUNCTION FOR PRODUCTS
    public function home()
    {
        $products = Product::query()
            ->forWebsite()
            ->paginate(12);

        return Inertia::render('Home',[
            'products' => ProductListResource::collection($products)
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('Product/Show',[
            'product'=> new ProductResource($product),
            'variationOptions' => request('options', [])
        ]);
    }
}
