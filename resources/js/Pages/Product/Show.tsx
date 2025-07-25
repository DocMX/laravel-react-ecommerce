import Carousel from '@/Components/Core/Carousel';
import CurrencyFormatter from '@/Components/Core/CurrencyFormatter';
import { arraysAreEqual } from '@/helpers';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Product, VariationTypeOption } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useCallback ,useEffect, useMemo, useState } from 'react';

function Show({product, variationOptions}: 
    {product:Product, variationOptions:number[]}) {
    const form = useForm<{
        option_ids: Record<string, number>;
        quantity: number;
        price:number | null;
    }>({
        option_ids:{},
        quantity:1,
        price:null // TODO populate price on change
    })

    const {url} = usePage();
   
   
    const [selectedOptions,setSelectedOptions]= 
        useState<Record<number, VariationTypeOption>>([]);

    const images = useMemo(() =>{
        for (const typeId in selectedOptions){
            const option = selectedOptions[typeId];
            if (option.images.length > 0) return option.images;
        }
        return product.images;
    },[product,selectedOptions]);

    
    const computedProduct = useMemo(() => {

        const selectedOptionsIds = Object.values
            
            (selectedOptions)
                .map(op => op.id)
                .sort();
        for (const variation of product.variations){
            const optionIds = (variation.variation_type_option_ids)
            ? [...variation.variation_type_option_ids].sort()
            : [];
            if (arraysAreEqual(selectedOptionsIds, optionIds)) {
                return{
                    price: variation.price,
                    quantity: variation.quantity === null ? 
                        Number.MAX_VALUE: variation.quantity,
                }                
            }
        }
        return {
            price: product.price,
            quantity: product.quantity
        };
    },[product, selectedOptions]);

   
    const getOptionIdsMap = useCallback((newOptions: Record<number, VariationTypeOption>) =>{
        return Object.fromEntries(
            Object.entries(newOptions).map(([a, b]) => [a, b.id])
        )
    }, []);

    const chooseOption = useCallback((
        typeId: number,
        option: VariationTypeOption,
        updateRouter: boolean = true
    ) => {
        setSelectedOptions((prevSelectedOptions) =>{
            const newOptions= {
                ...prevSelectedOptions,
                [typeId]: option
            }

            if (updateRouter) {
                router.get(url, {
                    options: getOptionIdsMap(newOptions)
                }, {
                    preserveScroll:true,
                    preserveState: true
                })                
            }
            
            return newOptions
        })
    }, [url, getOptionIdsMap]);
    const { setData } = form;  // agregue y dividi el form.setData debido al Lint
    useEffect(() =>{
        for (const type of product.variationTypes){
            const selectedOptionsId: number = variationOptions[type.id];
            
            chooseOption(
                type.id,
                type.options.find(op => op.id == selectedOptionsId) || type.options[0],
                false
            )
        }
    }, [variationOptions, product.variationTypes, chooseOption]);

    const onQuantityChange = 
        (ev: React.ChangeEvent<HTMLSelectElement>) =>{
        form.setData('quantity', parseInt(ev.target.value))
    }
    
    const addToCart = () => {
        form.post(route('cart.store', product.id), {
            preserveScroll:true,
            preserveState: true,
            onError: (err) => {
                console.log(err)
            }
        })
    }

    const renderProductVariationTypes = () => {
        return (
            product.variationTypes.map((type) => (
                    <div key={type.id}>
                        
                        {type.type === 'Image' &&
                            <div className='flex gap-2 mb-4'>
                                {type.options.map(option =>(
                                    <div onClick={() => chooseOption(type.id,
                                        option)} key={option.id}>
                                        {option.images && 
                                            <img 
                                                src={option.images[0].thumb} 
                                                alt="" 
                                                className={`w-[50px] h-[50px] object-cover rounded-md border-2 cursor-pointer transition-all ${
                                                    selectedOptions[type.id]?.id === option.id ? 'outline outline-4 outline-primary' : 'border-gray-300'
                                                }`}
                                            />
                                        
                                        }
                                    </div>
                                ))}
                            </div>}
                        {type.type === 'Radio' &&
                            <div className='flex join mb-4'>
                                {type.options.map(option =>(
                                    <input onChange={() => chooseOption(type.id,
                                    option)}
                                        key={option.id}
                                        className='join-item btn'
                                        type="Radio"
                                        value={option.id}
                                        checked={selectedOptions[type.id]?.id === option.id}
                                        name={'variation_type_' + type.id}
                                        aria-label={option.name}/>
                                ))}
                            </div>}
                    </div>
                )
            )
        )
    }
    
    
    const renderAddToCartButton = () => {
        const isOutOfStock = computedProduct.quantity === 0;
        return ( <div className='mb-8 flex gap-4'>
                <select value={form.data.quantity}
                    onChange={onQuantityChange}
                    className="select select-bordered w-full" 
                    disabled={isOutOfStock}>

                    {Array.from({
                        length: Math.min(10, computedProduct.quantity)
                    }).map((el, i) =>(
                        <option value={i + 1} key={i + 1}>Quantity: {i + 1}</option>
                    ))}
                </select>
                <button
                    onClick={addToCart}
                    className='btn btn-primary'
                    disabled={isOutOfStock}
                 >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>

            </div>
            
        )
    }

    useEffect(() =>{
        const idsMap = Object.fromEntries(
            Object.entries(selectedOptions).map(([typeId, option]:
                [string, VariationTypeOption]) => [typeId,option.id])
        )
        setData('option_ids', idsMap)
        
    }, [selectedOptions, setData]);

    return (
        <AuthenticatedLayout>
            <Head title={product.title}/>

            <div className='container mx-auto p-8'>
                <div className='grid gap-8 grid-cols-1 lg:grid-cols-12'>
                    <div className='col-span-7'>
                        <Carousel images={images}/>
                    </div>
                    <div className='col-span-5'>
                        <h1 className='text-2xl mb-8'>{product.title}</h1>
                        <div>
                            <div className='text-3xl font-semibold'>
                                <CurrencyFormatter amount={computedProduct.price}/>
                            </div>
                        </div>
                        
                        {renderProductVariationTypes()}

                        {computedProduct.quantity != undefined && computedProduct.quantity
                        < 10 &&
                            <div className='text-error my-4'>
                                <span>Only {computedProduct.quantity} left</span>
                            </div>
                        }
                        {computedProduct.quantity === 0 && (
                            <div className='text-error my-4'>
                                <span>This product is currently out of stock.</span>
                            </div>
                        )}

                      
                        {renderAddToCartButton()}

                        <b className='text-xl'>About the Item</b>
                        <div className='wysiwyg-output'
                        dangerouslySetInnerHTML={{__html: product.description
                        }}/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Show;

