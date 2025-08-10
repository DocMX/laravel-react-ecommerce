import CartItem from '@/Components/App/CartItem';
import CurrencyFormatter from '@/Components/Core/CurrencyFormatter';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { GroupedCartItems, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CreditCardIcon, ShoppingBagIcon } from 'lucide-react';

export default function Index({
    csrf_token,
    cartItems,
    totalQuantity,
    totalPrice,
}: PageProps<{ cartItems: Record<number, GroupedCartItems> }>) {
    const hasItems = Object.keys(cartItems).length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Your Cart" />

            <div className="container mx-auto p-8">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🛒 Your Shopping Cart</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Review your items and proceed to secure checkout
                    </p>
                </header>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            {!hasItems ? (
                                <div className="flex flex-col items-center py-10 text-gray-500">
                                    <ShoppingBagIcon className="size-12 mb-4" />
                                    <p>Your cart is empty</p>
                                    <Link href="/" className="mt-4 text-primary font-medium underline">
                                        Continue shopping
                                    </Link>
                                </div>
                            ) : (
                                Object.values(cartItems).map((group, index) => (
                                    <div
                                        key={group.user.id}
                                        className={`mb-8 rounded-xl p-4 ${
                                            index % 2 === 0
                                                ? 'bg-gray-50 dark:bg-gray-700/50'
                                                : 'bg-transparent'
                                        }`}
                                    >
                                        {/* Vendor header */}
                                        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                                            <Link
                                                href="/"
                                                className="text-lg font-semibold text-primary hover:underline"
                                            >
                                                {group.user.name}
                                            </Link>

                                            <form
                                                action={route('cart.checkout')}
                                                method="post"
                                                className="mt-2 md:mt-0"
                                            >
                                                <input type="hidden" name="_token" value={csrf_token} />
                                                <input type="hidden" name="vendor_id" value={group.user.id} />
                                                <button className="btn btn-outline btn-sm flex items-center gap-2">
                                                    <CreditCardIcon className="size-4" />
                                                    Pay only for this seller
                                                </button>
                                            </form>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-4">
                                            {group.items.map((item) => (
                                                <CartItem item={item} key={item.id} />
                                            ))}
                                        </div>

                                        {/* Subtotal */}
                                        <div className="mt-4 text-right font-medium text-gray-700 dark:text-gray-300">
                                            Subtotal ({group.items.length} items):{' '}
                                            <CurrencyFormatter
                                                amount={group.items.reduce(
                                                    (sum, i) => sum + i.quantity * i.price,
                                                    0
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {hasItems && (
                        <aside className="w-full lg:w-80">
                            <div className="rounded-2xl bg-gray-100 dark:bg-gray-700 p-6 shadow-md sticky top-6">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                <p className="text-lg font-semibold mb-6">
                                    Total ({totalQuantity} items):{' '}
                                    <CurrencyFormatter amount={totalPrice} />
                                </p>
                                <form action={route('cart.checkout')} method="post">
                                    <input type="hidden" name="_token" value={csrf_token} />
                                    <PrimaryButton className="w-full rounded-full flex items-center justify-center gap-2">
                                        <CreditCardIcon className="size-5" />
                                        Proceed to Checkout
                                    </PrimaryButton>
                                </form>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
