import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout' ;
import { PageProps, PaginationProps, Product } from '@/types';
import { Head } from '@inertiajs/react';

export default function Home({ products }: PageProps<{ products: PaginationProps<Product> }>) {
    return (
        <AuthenticatedLayout>
            <Head title="Home" />

            <section className="h-[300px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center">
                <div className="text-center max-w-2xl px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Our Store</h1>
                    <p className="text-lg md:text-xl">
                        Explore our featured products and find the best deals tailored for you.
                    </p>
                    <button className="mt-6 btn btn-primary">Get Started</button>
                </div>
            </section>

            <section className="px-6 py-10">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Latest Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.data.map((product) => (
                        <ProductItem product={product} key={product.id} />
                    ))}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
