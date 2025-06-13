import CartItem from '@/Components/App/CartItem';
import CurrencyFormatter from '@/Components/Core/CurrencyFormatter';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { GroupedCartItems, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CreditCardIcon } from 'lucide-react';

export default function Index({
    csrf_token,
    cartItems,
    totalQuantity,
    totalPrice,
}: PageProps<{ cartItems: Record<number, GroupedCartItems> }>) {
    return (
        <AuthenticatedLayout>
            <Head title="Your Cart" />
            <div className="container mx-auto flex flex-col gap-4 p-8 lg:flex-row">
                <div className="card order-2 flex-1 bg-white dark:bg-gray-800">
                    <div className="card-body">
                        <h2 className="text-xl font-bold">Shopping Cart</h2>

                        {Object.keys(cartItems).length === 0 ? (
                            <div className="py-6 text-center text-gray-500">
                                You don't have any items yet.
                            </div>
                        ) : (
                            Object.values(cartItems).map((group) => (
                                <div key={group.user.id} className="mb-8 border-b border-gray-300 pb-6">
                                    {/* Encabezado del vendedor */}
                                    <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                                        <Link href="/" className="text-lg font-semibold text-primary underline">
                                            {group.user.name}
                                        </Link>

                                        <form action={route('cart.checkout')} method="post" className="mt-2 md:mt-0">
                                            <input type="hidden" name="_token" value={csrf_token} />
                                            <input type="hidden" name="vendor_id" value={group.user.id} />
                                            <button className="btn btn-outline btn-sm flex items-center gap-2">
                                                <CreditCardIcon className="size-4" />
                                                Pay Only for this seller
                                            </button>
                                        </form>
                                    </div>

                                    {/* Items del vendedor */}
                                    <div className="space-y-4">
                                        {group.items.map((item) => (
                                            <CartItem item={item} key={item.id} />
                                        ))}
                                    </div>

                                    {/* Subtotal por vendedor */}
                                    <div className="mt-4 text-right font-medium text-gray-700 dark:text-gray-300">
                                        Subtotal ({group.items.length} items):{' '}
                                        <CurrencyFormatter
                                            amount={group.items.reduce((sum, i) => sum + i.quantity * i.price, 0)}
                                        />
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Total general */}
                        {Object.keys(cartItems).length > 0 && (
                            <div className="mt-8 rounded-xl bg-gray-100 dark:bg-gray-700 p-6 text-right">
                                <p className="text-lg font-semibold mb-4">
                                    Total ({totalQuantity} items):{' '}
                                    <CurrencyFormatter amount={totalPrice} />
                                </p>
                                <form action={route('cart.checkout')} method="post">
                                    <input type="hidden" name="_token" value={csrf_token} />
                                    <PrimaryButton className="btn btn-primary rounded-full">
                                        <CreditCardIcon className="size-5 mr-2" />
                                        Proceed to Checkout
                                    </PrimaryButton>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
