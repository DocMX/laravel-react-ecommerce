import Checkbox from '@/Components/Core/Checkbox';
import InputError from '@/Components/Core/InputError';
import InputLabel from '@/Components/Core/InputLabel';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import TextInput from '@/Components/Core/TextInput';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Log in" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
                    
                    {/* Imagen lateral */}
                    <div className="hidden md:block bg-gradient-to-br from-purple-500 to-indigo-500 relative">
                        <img
                            src="https://images.unsplash.com/photo-1605902711622-cfb43c4437d7?auto=format&fit=crop&w=800&q=80"
                            alt="Login illustration"
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <h1 className="text-white text-3xl font-bold">Bienvenido de nuevo</h1>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="p-8">
                        {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Inicia sesión</h2>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                                    disabled={processing}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
                            </div>

                            <div className="flex items-center justify-between">
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-purple-600 hover:underline"
                                        disabled={processing}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                )}

                                <PrimaryButton
                                    className="flex items-center justify-center gap-2 px-6 py-2"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <FaSpinner className="animate-spin" />
                                    )}
                                    {processing ? 'Procesando...' : 'Ingresar'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
