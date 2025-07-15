<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function home(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'category' => 'nullable|exists:categories,id',
            'priceRange' => 'nullable|string',
            'sort' => 'nullable|in:latest,price_asc,price_desc,popular,rating'
        ]);

        $query = Product::query()
            ->forWebsite()
            ->with(['category', 'media'])
            ->when($request->category, function ($query, $category) {
                $query->filterByCategory($category);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%')
                        ->orWhereHas('category', function ($q) use ($search) {
                            $q->where('name', 'like', '%' . $search . '%');
                        });
                });
            })
            ->when($request->priceRange, function ($query, $priceRange) {
                $this->applyPriceFilter($query, $priceRange);
            })
            ->when($request->sort, function ($query, $sort) {
                $this->applySorting($query, $sort);
            }, function ($query) {
                $query->latest();
            });

        $products = $query->paginate(12)
            ->withQueryString(); 

        return Inertia::render('Home', [
            'products' => ProductListResource::collection($products),
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category', 'priceRange', 'sort'])
        ]);
    }

    protected function applyPriceFilter($query, $priceRange)
    {
        $range = explode('-', $priceRange);
        if (count($range) == 2) {
            $query->whereBetween('price', [(float)$range[0], (float)$range[1]]);
        } elseif (str_contains($priceRange, '+')) {
            $min = (float)str_replace('+', '', $priceRange);
            $query->where('price', '>=', $min);
        }
    }

    protected function applySorting($query, $sort)
    {
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->latest();
        }
    }

    public function show(Product $product)
    {
        return Inertia::render('Product/Show', [
            'product' => new ProductResource($product),
            'variationOptions' => request('options', [])
        ]);
    }
    
}
