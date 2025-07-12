<?php

namespace App\Http\Controllers;

use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function profile(Vendor $vendor)
    {

    }

    public function store(Request  $request)
    {
        $request->validate([
            'store_name' => ['required', 'regex:/^[a-z0-9-]+$/', 'unique:vendors,store_name'],
            'store_address' => 'nullable',
        ], [
            'store_name.regex' => 'Store Name must only contain lowercase alphanumeric characters and dashes.',
        ]);

        $user = $request->user();
        $vendor = $user->vendor ?: new Vendor();
        $vendor->user_id = $user->id;
        $vendor->status = VendorStatusEnum::Approved->value; //cambiar esto despues a pending para que el admin apruebe igual pedir iD
        $vendor->store_name = $request->store_name;
        $vendor->store_address = $request->store_address;
        $vendor->save();

        $user->assignRole(RolesEnum::Vendor);
    }
}
