import Banner from '@/Components/App/Banner';
import Footer from '@/Components/App/Footer';
import ProductItem from '@/Components/App/ProductItem';
import { Spinner } from '@/Components/ui/spinner';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps, PaginationProps, Product } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Home({
    products,
    categories,
    filters: initialFilters,
}: PageProps<{
    products: PaginationProps<Product>;
    categories: Array<{ id: number; name: string }>;
    filters?: {
        search?: string;
        category?: string;
        priceRange?: string;
        sort?: string;
    };
}>) {
    const [filters, setFilters] = useState({
        search: initialFilters?.search ?? '',
        category: initialFilters?.category ?? '',
        priceRange: initialFilters?.priceRange ?? '',
        sort: initialFilters?.sort ?? 'latest',
    });

    const [isLoading, setIsLoading] = useState(false);

    const applyFilters = async () => {
        setIsLoading(true);
        await router.get(route('home'), filters, {
            preserveState: true,
            replace: true,
        });
        setIsLoading(false);
    };

    const handleFilterChange = (title: string, value: string) => {
        const newFilters = { ...filters, [title]: value };
        setFilters(newFilters);

        if (title === 'search') {
            setIsLoading(true);
            router.get(route('home'), newFilters, {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const clearFilters = () => {
        const resetFilters = {
            search: '',
            category: '',
            priceRange: '',
            sort: 'latest',
        };
        setFilters(resetFilters);
        setIsLoading(true);
        router.get(route('home'), resetFilters, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Home" />
            <Banner />

            {/* Sección de Filtros */}
            <section className="bg-gray-50 px-6 py-8 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        {/* Buscador */}
                        <div className="w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full rounded-lg border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex w-full flex-wrap items-center justify-end gap-4">
                            <select
                                className="rounded-lg border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={filters.category ?? ''} 
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="rounded-lg border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={filters.sort || 'latest'}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="latest">Latest</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>

                            {/* Rango de precios */}
                            <select
                                className="rounded-lg border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={filters.priceRange || ''}
                                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                            >
                                <option value="">All Prices</option>
                                <option value="0-50">$0 - $50</option>
                                <option value="50-100">$50 - $100</option>
                                <option value="100-200">$100 - $200</option>
                                <option value="200-500">$200 - $500</option>
                                <option value="500+">$500+</option>
                            </select>

                            <button
                                onClick={applyFilters}
                                disabled={isLoading}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Applying...' : 'Apply Filters'}
                            </button>

                            <button
                                onClick={clearFilters}
                                disabled={isLoading}
                                className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="px-6 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Latest Products</h2>
                        <a href="#" className="text-indigo-600 hover:underline dark:text-indigo-400">
                            View All
                        </a>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    ) : products.data.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">No products found matching your filters.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {products.data.map((product) => (
                                <ProductItem product={product} key={product.id} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Discount Section */}
            <section className="bg-indigo-600 px-6 py-16 text-white">
                <div className="mx-auto max-w-7xl text-center">
                    <h2 className="mb-6 text-3xl font-bold md:text-4xl">Summer Sale - Up to 50% Off</h2>
                    <p className="mx-auto mb-8 max-w-3xl text-xl">Don't miss out on our biggest sale of the year. Limited time offer!</p>
                    <button className="rounded-full bg-white px-8 py-3 text-lg font-medium text-indigo-600 transition duration-300 hover:bg-gray-100">
                        Shop the Sale
                    </button>
                </div>
            </section>
            {/* Featured Categories */}
            <section className="bg-gray-50 px-6 py-12 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-8 text-center text-3xl font-bold text-gray-800 dark:text-gray-100">Shop by Category</h2>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-lg bg-white shadow-md transition duration-300 hover:shadow-lg dark:bg-gray-700"
                            >
                                <div className="h-40 bg-gray-200 dark:bg-gray-600"></div>
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Category {item}</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">20+ Products</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Testimonials */}
            <section className="bg-gray-50 px-6 py-12 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-gray-100">What Our Customers Say</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-4 h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Customer {item}</h4>
                                        <div className="mt-1 flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                                    magna aliqua."
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </AuthenticatedLayout>
    );
}
