import PrimaryButton from '@/Components/Core/PrimaryButton';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verify Email" />

            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Please verify your email by clicking the link we sent. Didn’t get it? Request another.
            </p>

            {status === 'verification-link-sent' && (
                <p className="mb-4 text-sm text-green-600 dark:text-green-400">
                    A new verification link has been sent.
                </p>
            )}

            <form onSubmit={submit} className="flex items-center justify-between mt-4">
                <PrimaryButton disabled={processing}>
                    Resend Email
                </PrimaryButton>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                    Log Out
                </Link>
            </form>
        </GuestLayout>
    );
}
