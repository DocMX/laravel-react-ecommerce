import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import VendorDetails from './Partials/VendorDetails';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        Configuración de Perfil
                    </h2>
                    <p className="text-sm text-white/80 mt-1">
                        Administra tu cuenta y personaliza tu experiencia.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <section className="py-10 bg-gray-50 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        
                        {/* Secciones izquierda */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Información de perfil */}
                            <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Información de Perfil
                                </h3>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            {/* Cambiar contraseña */}
                            <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Cambiar Contraseña
                                </h3>
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            {/* Eliminar cuenta */}
                            <div className="rounded-2xl border border-red-200 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                                    Eliminar Cuenta
                                </h3>
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>

                        {/* Columna derecha - Vendor Details */}
                        <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Información del Vendedor
                            </h3>
                            <VendorDetails />
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
