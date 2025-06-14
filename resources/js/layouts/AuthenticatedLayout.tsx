
import Navbar from '@/Components/App/Navbar';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
interface SuccessMessage {
  id: number;
  message: string;
}

export default function AuthenticatedLayout({
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const props= usePage().props;
    //const user = usePage().props.auth.user;

    const [successMessage, setSuccessMessages] = useState<SuccessMessage[]>([]);
    const timeoutRefs = useRef<{[key: number]:ReturnType<typeof setTimeout> }>({}); //store timeouts by message ID
    
    //const [showingNavigationDropdown, setShowingNavigationDropdown] =
    //    useState(false);

    useEffect(()=>{
        if (props.success.message) {
            const newMessage = {
                ...props.success,
                id: props.success.time, //Use time as unique identifier
            };
            
            //Add the new message to the list
            setSuccessMessages((prevMessages)=> [newMessage, ...prevMessages]);

            //Set a timeout for this specific message
            const timeoutId=setTimeout(() => {
                //use a functional update to ensure the latest state is used
                setSuccessMessages((prevMessages)=>
                prevMessages.filter((msg)=>msg.id !== newMessage.id));
                
                //Clear timeout from refs after execution
                delete timeoutRefs.current[newMessage.id];
            }, 5000);

            //Store the timeout ID in the ref
            timeoutRefs.current[newMessage.id] = timeoutId;
        }
    },[props.success]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />

            {props.error && (
                <div className='container mx-auto px-8 mt-8' >
                    <div className='alert alert-error'>
                        {props.error}
                    </div>
                </div>
            )}

            {successMessage.length > 0 && (
                <div className="toast toast-top toast-end z-[1000] mt-16">
                    {successMessage.map((msg) =>(
                        <div className="alert alert-success" key={msg.id}>
                            <span>{msg.message}</span>
                        </div>
                    ))}
                </div>
            )}

            <main>{children}</main>
        </div>
    );
}
