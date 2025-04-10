import React, {useState} from "react";
import { Link, router, useForm } from "@inertiajs/react";
import { CartItem as CartItemType } from "@/types";
import TextInput from "@/Components/Core/TextInput";
import CurrencyFormatter from "@/Components/Core/CurrencyFormatter";
import { productRoute } from "@/helpers";

export default function CartItem({item} : {item: CartItemType}) {
  return (
    <>
      <div key={item.id} className="flex gap-6 p-3">
        <Link href={productRoute(item)}
              className="w-32 min-w-32 min-h-32 flex justify-center self-start">
                <img src={item.image} alt="" className="max-w-full max-h-full"/>
        </Link>
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="mb-3 text-sm font-semibold">
              <Link href={productRoute(item)}>
                {item.title}
              </Link>
            </h3>
            <div className="text-xs">
              {item.options.map(option => (
                <div key={option.id}>
                  <strong className="text-bold">{option.type.name}:
                  </strong>
                  {option.name}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center mt-4">
              <div className="flex gap-2 items-center">
                <div className="text-sm">Quantity:</div>
                <div className={error ? 'tooltip tooltip-open tooltip-error'
                    : ''} data-tip={error}>
                    <TextInput type="number"
                               defaultValue={item.quantity}
                               onBlur={handleQuantityChange}
                               className="input-sm w-16">
                      
                    </TextInput>
                </div>
                <button>
                  
                </button>
              </div>
          </div>
        </div>
      </div>
      <div className="divider">

      </div>
    </>
  )
}