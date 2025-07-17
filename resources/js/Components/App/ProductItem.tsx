import { Product } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import CurrencyFormatter from '../Core/CurrencyFormatter';

export default function ProductItem({ product }: { product: Product }) {
    const form = useForm({
        option_ids: {},
        quantity: 1,
    });
    const hasStock = product.in_stock;
    const hasVariations = product.has_variations;

    const addToCart = () => {
        if (!hasStock) return;
        
        form.post(route('cart.store', product.id), {
            preserveScroll: true,
            preserveState: true,
            onError: (err) => {
                console.error('Error adding to cart:', err);
            },
        });
    };


    const getStockMessage = () => {
        if (hasVariations) {
            return hasStock ? 'Variations available' : 'Out of stock';
        } else {
            return product.quantity > 0 
                ? (product.quantity < 10 
                    ? `Last ${product.quantity} pieces!` 
                    : 'In stock')
                : 'Out of stock';
        }
    };

    const stockMessage = getStockMessage();
    const isLowStock = hasVariations 
        ? false
        : product.quantity > 0 && product.quantity < 10;

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <Link href={route('product.show', product.slug)}>
                <div className="relative w-full aspect-square overflow-hidden">
                    <img
                        src={product.image || '/images/placeholder-product.png'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!hasStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <Link href={route('product.show', product.slug)}>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 line-clamp-2">
                            {product.title}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>by </span>
                    <Link 
                        href="/" 
                        className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        {product.user?.name || 'Unknown'}
                    </Link>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        <CurrencyFormatter amount={product.price} />
                    </span>

                    <button
                        onClick={addToCart}
                        disabled={!hasStock}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center justify-center
                            ${!hasStock 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        {!hasStock ? (
                            'Out of Stock'
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
                {hasStock && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={isLowStock ? 'text-orange-500' : ''}>
                            {stockMessage}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}