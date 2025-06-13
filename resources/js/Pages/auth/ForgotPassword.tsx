import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import TextInput from '@/Components/Core/TextInput';
import InputError from '@/Components/Core/InputError';
import PrimaryButton from '@/Components/Core/PrimaryButton';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Forgot Password" />

            <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Forgot your password?
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    No problem. Just enter your email address below and we'll send you a link to reset your password.
                </p>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <PrimaryButton disabled={processing}>
                            Send Password Reset Link
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
