import { Product, VariationTypeOption } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

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
        
    },[product,selectedOptions]);
    return (
        <div>
            Test
        </div>
    );
}

export default Show;