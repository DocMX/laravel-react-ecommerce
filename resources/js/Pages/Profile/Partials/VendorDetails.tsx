import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import Modal from '@/Components/Core/Modal';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import InputLabel from '@/Components/Core/InputLabel';

export default function VendorDetails({ className = '' }: { className?: string }) {
    const [showBecomeVendorConfirmation, setShowBecomeVendorConfirmation] = useState(false);
    const[successMessage, setSuccessMessage]= useState('');
    const user=usePage().props.auth.user;
    const token=usePage().props.csrf_token;

    const{
        //data,
        setData,
        //errors,
        post,
        processing,
        recentlySuccessful,
    }=useForm({
        store_name: user.vendor?.store_name || user.name,
        store_address: user.vendor?.store_address,
    });

    const onStoreNameChange=(ev: React.ChangeEvent<HTMLInputElement>) => 
    {
        setData('store_name', ev.target.value.toLocaleLowerCase().replace(/\s+/g,'-'))
    }

    const becomeVendor: FormEventHandler= (ev)=> {
        ev.preventDefault()

        post(route('vendor.store'),{
            preserveScroll:true,
            onSuccess: () => {
                closeModal()
                setSuccessMessage('You can now create and publish products.')
            },
            onError:(errors)=>{

            },
        })
        
    }

    const updateVendor:FormEventHandler = (ev)=>{
        ev.preventDefault()
        post(route('vendor.store'),{
           preserveScroll:true, 
           onSuccess: () => {
                closeModal()
                setSuccessMessage('Your details were updated.')
            },
            onError:(errors)=>{

            },
        })
        
    }

    const closeModal=()=>{
        setShowBecomeVendorConfirmation(false);
    }

    return(
        <section className={className}>
            {recentlySuccessful && <div className='toast toast-top toast-end'>
                <div className='alert alert-success'>
                    <span>{successMessage}</span>
                </div>
            </div>}

            <header>
                <h2 className='flex justify-between mb-8 text-lg font-medium text-gray-900 dart:text-gray-100'>
                    Vendor Details
                    {user.vendor?.status === 'pending' &&
                        <span className={'badge badge-warning'}>{user.vendor.status_label}</span>}
                    {user.vendor?.status === 'rejected' &&
                        <span className={'badge badge-error'}>{user.vendor.status_label}</span>}
                    {user.vendor?.status === 'approved' &&
                        <span className={'badge badge-success'}>{user.vendor.status_label}</span>}
                </h2>
            </header>

            <div>
                {!user.vendor && <PrimaryButton onClick={ev =>
                 setShowBecomeVendorConfirmation(true)} disabled={processing}>
                    Become a Vendor
                </PrimaryButton>}

                {user.vendor && (
                    <>
                        <form onSubmit={updateVendor}>
                            <InputLabel htmlFor='name' value='Store Name' />
                        </form>
                    </>
                )}
            </div>
        </section>
    );
}
