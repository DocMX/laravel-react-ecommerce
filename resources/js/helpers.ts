import { CartItem } from "./types";

export const arraysAreEqual = <T>(arr1: T[], arr2: T[]) => {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((value, index) => value === arr2[index]);
}

export const productRoute = (item: CartItem) => {
    const params = new URLSearchParams();
    Object.entries(item.option_ids)
        .forEach(([typeId, optionId]) => {
            params.append(`options[${typeId}]`, optionId + '')
        })

    return route('product.show', item.slug) + '?' + params.toString();
}