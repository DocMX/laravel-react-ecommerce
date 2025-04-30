import { Product } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import CurrencyFormatter from '../Core/CurrencyFormatter';

export default function ProductItem({ product }: { product: Product }) {
    const form = useForm<{
        option_ids: Record<string, number>;
        quantity: number;
    }>({
        option_ids: {},
        quantity: 1,
    });

    const addToCart = () => {
        console.log('Opciones seleccionadas antes de añadir al carrito:', form.data.option_ids);
        form.post(route('cart.store', product.id), {
            preserveScroll: true,
            preserveState: true,
            onError: (err) => {
                console.log(err);
            },
        });
    };

    return (
        <div className="card bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link href={route('product.show', product.slug)}>
                <figure className="w-full aspect-square overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                </figure>
            </Link>

            <div className="card-body px-4 py-5">
                <h2 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h2>

                <p className="text-sm text-gray-500 mt-1">
                    by{' '}
                    <Link href="/" className="text-indigo-600 hover:underline">
                        {product.user.name}
                    </Link>
                    &nbsp;·&nbsp;
                    <Link href="/" className="text-indigo-600 hover:underline">
                        {product.department.name}
                    </Link>
                </p>

                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={addToCart}
                        className="btn btn-sm btn-primary px-4 py-2 text-sm font-medium"
                    >
                        Add to Cart
                    </button>
                    <span className="text-xl font-bold text-gray-800">
                        <CurrencyFormatter amount={product.price} />
                    </span>
                </div>
            </div>
        </div>
    );
}
