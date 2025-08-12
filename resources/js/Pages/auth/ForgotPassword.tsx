import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import TextInput from '@/Components/Core/TextInput';
import InputError from '@/Components/Core/InputError';
import PrimaryButton from '@/Components/Core/PrimaryButton';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Forgot Password" />

            <div className="max-w-sm mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
                <img
                    src="/img/Waifu.webp"
                    alt="Clumsy anime waifu"
                    className="mx-auto mb-4 w-32 h-32 object-cover rounded-full shadow-md"
                />

                <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Forgot your password?
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enter your email and we’ll send you a reset link.
                </p>

                {status && <p className="mb-4 text-sm text-green-600">{status}</p>}

                <form onSubmit={submit} className="space-y-4 text-left">
                    <div>
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            placeholder="you@example.com"
                            className="w-full"
                            isFocused
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <PrimaryButton className="w-full" disabled={processing}>
                        Send Reset Link
                    </PrimaryButton>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
