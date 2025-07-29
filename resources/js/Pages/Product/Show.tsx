import Carousel from '@/Components/Core/Carousel';
import CurrencyFormatter from '@/Components/Core/CurrencyFormatter';
import { arraysAreEqual } from '@/helpers';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Product, VariationTypeOption } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

function Show({ product, variationOptions }: { product: Product; variationOptions: number[] }) {
    const form = useForm<{
        option_ids: Record<string, number>;
        quantity: number;
        price: number | null;
    }>({
        option_ids: {},
        quantity: 1,
        price: null, // TODO populate price on change
    });

    const { url } = usePage();

    const [selectedOptions, setSelectedOptions] = useState<Record<number, VariationTypeOption>>([]);

    const images = useMemo(() => {
        for (const typeId in selectedOptions) {
            const option = selectedOptions[typeId];
            if (option.images.length > 0) return option.images;
        }
        return product.images;
    }, [product, selectedOptions]);

    const computedProduct = useMemo(() => {
        const selectedOptionsIds = Object.values(selectedOptions)
            .map((op) => op.id)
            .sort();
        for (const variation of product.variations) {
            const optionIds = variation.variation_type_option_ids ? [...variation.variation_type_option_ids].sort() : [];
            if (arraysAreEqual(selectedOptionsIds, optionIds)) {
                return {
                    price: variation.price,
                    quantity: variation.quantity === null ? Number.MAX_VALUE : variation.quantity,
                };
            }
        }
        return {
            price: product.price,
            quantity: product.quantity,
        };
    }, [product, selectedOptions]);

    const getOptionIdsMap = useCallback((newOptions: Record<number, VariationTypeOption>) => {
        return Object.fromEntries(Object.entries(newOptions).map(([a, b]) => [a, b.id]));
    }, []);

    const chooseOption = useCallback(
        (typeId: number, option: VariationTypeOption, updateRouter: boolean = true) => {
            setSelectedOptions((prevSelectedOptions) => {
                const newOptions = {
                    ...prevSelectedOptions,
                    [typeId]: option,
                };

                if (updateRouter) {
                    router.get(
                        url,
                        {
                            options: getOptionIdsMap(newOptions),
                        },
                        {
                            preserveScroll: true,
                            preserveState: true,
                        },
                    );
                }

                return newOptions;
            });
        },
        [url, getOptionIdsMap],
    );
    const { setData } = form; // agregue y dividi el form.setData debido al Lint
    useEffect(() => {
        for (const type of product.variationTypes) {
            const selectedOptionsId: number = variationOptions[type.id];

            chooseOption(type.id, type.options.find((op) => op.id == selectedOptionsId) || type.options[0], false);
        }
    }, [variationOptions, product.variationTypes, chooseOption]);

    const onQuantityChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        form.setData('quantity', parseInt(ev.target.value));
    };

    const addToCart = () => {
        form.post(route('cart.store', product.id), {
            preserveScroll: true,
            preserveState: true,
            onError: (err) => {
                console.log(err);
            },
        });
    };

    const renderProductVariationTypes = () => {
        return product.variationTypes.map((type) => (
            <div key={type.id}>
                {type.type === 'Image' && (
                    <div className="mb-4 flex gap-2">
                        {type.options.map((option) => (
                            <div onClick={() => chooseOption(type.id, option)} key={option.id}>
                                {option.images && (
                                    <img
                                        src={option.images[0].thumb}
                                        alt=""
                                        className={`h-[50px] w-[50px] cursor-pointer rounded-md border-2 object-cover transition-all ${
                                            selectedOptions[type.id]?.id === option.id ? 'outline outline-4 outline-primary' : 'border-gray-300'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {type.type === 'Radio' && (
                    <div className="mb-4 flex join">
                        {type.options.map((option) => (
                            <input
                                onChange={() => chooseOption(type.id, option)}
                                key={option.id}
                                className="btn join-item"
                                type="Radio"
                                value={option.id}
                                checked={selectedOptions[type.id]?.id === option.id}
                                name={'variation_type_' + type.id}
                                aria-label={option.name}
                            />
                        ))}
                    </div>
                )}
            </div>
        ));
    };

    const renderAddToCartButton = () => {
        const isOutOfStock = computedProduct.quantity === 0;
        return (
            <div className="mb-8 flex gap-4">
                <select value={form.data.quantity} onChange={onQuantityChange} className="select-bordered select w-full" disabled={isOutOfStock}>
                    {Array.from({
                        length: Math.min(10, computedProduct.quantity),
                    }).map((el, i) => (
                        <option value={i + 1} key={i + 1}>
                            Quantity: {i + 1}
                        </option>
                    ))}
                </select>
                <button onClick={addToCart} className="btn btn-primary" disabled={isOutOfStock}>
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        );
    };

    useEffect(() => {
        const idsMap = Object.fromEntries(
            Object.entries(selectedOptions).map(([typeId, option]: [string, VariationTypeOption]) => [typeId, option.id]),
        );
        setData('option_ids', idsMap);
    }, [selectedOptions, setData]);

    return (
        <AuthenticatedLayout>
            <Head title={product.title} />

            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="mb-4 text-sm text-gray-500">
                    <span>Home</span> <span>Category</span> <span>{product.title}</span>
                </div>

                <div className="grid grid-cols-1 gap-8 rounded-lg p-6 shadow-sm lg:grid-cols-12">
                    {/* Gallery */}
                    <div className="col-span-7">
                        <div className="sticky top-4">
                            <Carousel images={images} />
                            <div className="mt-4 flex justify-center space-x-2">
                                {images.slice(0, 5).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.alt || img.thumb}
                                        className="h-16 w-16 cursor-pointer rounded border object-cover hover:border-blue-500"
                                        alt={`Thumbnail ${index}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="col-span-5">
                        {/* Condition and sold quantity */}
                        <div className="mb-2">
                            <span className="font-medium text-green-600">New</span>
                            <span className="ml-2 text-sm text-gray-500">| 125 sold</span>
                        </div>

                        {/* Title */}
                        <h1 className="mb-3 text-2xl font-medium">{product.title}</h1>

                        {/* Rating */}
                        <div className="mb-4 flex items-center">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-1 cursor-pointer text-sm text-blue-600 hover:underline">142 reviews</span>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                            <div className="text-3xl font-semibold">
                                <CurrencyFormatter amount={computedProduct.price} />
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="mr-2 line-through">$1,299.00</span>
                                <span className="text-green-600">15% OFF</span>
                            </div>
                            <div className="text-sm text-green-600">in 12x $83.33 interest-free</div>
                        </div>

                        {/* Shipping */}
                        <div className="mb-6 rounded p-3">
                            <div className="mb-1 flex items-center font-medium text-green-600">
                                <svg className="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Free shipping
                            </div>
                            <div className="text-sm">
                                <span>Arrives </span>
                                <span className="font-medium">Friday, Jul 5</span>
                                <span> to </span>
                                <span className="cursor-pointer underline">Miami 33101</span>
                            </div>
                        </div>

                        {/* Variations */}
                        {renderProductVariationTypes()}

                        {/* Stock */}
                        {computedProduct.quantity != undefined && computedProduct.quantity < 10 && (
                            <div className="my-4 rounded bg-red-50 p-2 text-error">
                                <span>Only {computedProduct.quantity} left - order soon!</span>
                            </div>
                        )}
                        {computedProduct.quantity === 0 && (
                            <div className="my-4 rounded bg-red-50 p-2 text-error">
                                <span>This product is currently out of stock.</span>
                            </div>
                        )}

                        {/* Add to cart */}
                        <div className="mb-8">{renderAddToCartButton()}</div>
                        <Link
                            href={route('cart.index')}
                            className="mb-6 block w-full rounded bg-yellow-400 px-4 py-2 text-center font-medium text-black hover:bg-yellow-500"
                        >
                            Buy Now
                        </Link>

                        {/* Payment methods */}
                        <div className="mb-6 border-t pt-4">
                            <div className="mb-2 text-sm text-gray-500">Payment methods</div>
                            <div className="flex space-x-2">
                                <img
                                    src="https://http2.mlstatic.com/storage/logos-api-admin/0db9f30c-a4d2-11ec-8ad0-6b4f473e447a.svg"
                                    className="h-6"
                                    alt="Visa"
                                />
                                <img
                                    src="https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2.svg"
                                    className="h-6"
                                    alt="Mastercard"
                                />
                                <img
                                    src="https://http2.mlstatic.com/storage/logos-api-admin/cbf3fd30-5c85-11ec-ae75-df2bef173be2.svg"
                                    className="h-6"
                                    alt="American Express"
                                />
                            </div>
                        </div>

                        {/* Return policy */}
                        <div className="mb-6 cursor-pointer text-sm text-blue-600 hover:underline">Free 30-day returns</div>
                    </div>
                </div>

                {/* Product details */}
                <div className="mt-4 rounded-lg p-6 shadow-sm">
                    <h2 className="mb-4 border-b pb-2 text-xl font-medium">About the Item</h2>
                    <div className="wysiwyg-output" dangerouslySetInnerHTML={{ __html: product.description }} />

                    {/* Features */}
                    <div className="mt-6">
                        <h3 className="mb-2 font-medium">Product Features:</h3>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>High-quality materials for durability</li>
                            <li>Easy to use and maintain</li>
                            <li>Includes 1-year manufacturer warranty</li>
                            <li>Energy efficient design</li>
                        </ul>
                    </div>
                </div>

                {/* Customer reviews */}
                <div className="mt-4 rounded-lg p-6 shadow-sm">
                    <h2 className="mb-4 border-b pb-2 text-xl font-medium">Customer Reviews</h2>
                    <div className="mb-4 flex items-center">
                        <div className="mr-4 text-3xl font-light">4.8</div>
                        <div>
                            <div className="mb-1 flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500">142 global ratings</div>
                        </div>
                    </div>

                    {/* Review filters */}
                    <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
                        {['All', '5 star', '4 star', '3 star', '2 star', '1 star'].map((filter) => (
                            <button key={filter} className="whitespace-nowrap rounded-full border px-3 py-1 text-sm hover:bg-gray-100">
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Sample review */}
                    <div className="mb-4 border-b pb-4">
                        <div className="mb-2 flex items-center">
                            <div className="mr-3 h-10 w-10 rounded-full bg-gray-300"></div>
                            <div>
                                <div className="font-medium">John D.</div>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mb-1 font-medium">Great product!</div>
                        <div className="mb-2 text-sm text-gray-600">Reviewed on June 15, 2023</div>
                        <div className="text-sm">
                            This product exceeded my expectations. The quality is excellent and it arrived sooner than expected. I would definitely
                            recommend it to others.
                        </div>
                    </div>

                    <button className="text-sm text-blue-600 hover:underline">See all reviews</button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Show;
