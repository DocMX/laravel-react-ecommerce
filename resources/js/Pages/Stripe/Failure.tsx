import { Head, Link } from "@inertiajs/react";
import { XCircleIcon } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Failure() {
  return (
    <AuthenticatedLayout>
      <Head title="Payment Failed" />

      <div className="w-[480px] mx-auto py-8 px-4">
        <div className="flex flex-col gap-2 items-center">
          <div className="text-6xl text-red-600">
            <XCircleIcon className="size-24" />
          </div>
          <div className="text-3xl">
            Payment Failed
          </div>
        </div>
        <div className="my-6 text-lg text-center">
          Unfortunately, your payment could not be processed.<br />
          Please try again or contact support if the issue persists.
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <Link href={route('dashboard')} className="btn">
            Back to Home
          </Link>
          <Link href="#" className="btn btn-primary">
            Try Again
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
