import InputError from '@/Components/Core/InputError';
import InputLabel from '@/Components/Core/InputLabel';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import TextInput from '@/Components/Core/TextInput';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Register" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
                    
                    {/* Imagen lateral */}
                    <div className="hidden md:block bg-gradient-to-br from-purple-500 to-indigo-500 relative">
                        <img
                            src="https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=800&q=80"
                            alt="Register illustration"
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <h1 className="text-white text-3xl font-bold text-center px-4">
                                Únete a nuestra comunidad
                            </h1>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                            Crear cuenta
                        </h2>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Nombre" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Contraseña" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('login')}
                                    className="text-sm text-purple-600 hover:underline"
                                    disabled={processing}
                                >
                                    ¿Ya tienes cuenta?
                                </Link>

                                <PrimaryButton
                                    className="flex items-center justify-center gap-2 px-6 py-2"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <FaSpinner className="animate-spin" />
                                    )}
                                    {processing ? 'Procesando...' : 'Registrarme'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
