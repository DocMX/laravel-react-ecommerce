<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'User',
            'email' => 'user@example.com',
            //'password' => ''
        ])->assignRole(RolesEnum::User->value);

        $user = User::factory()->create([
            'name' => 'Vendor',
            'email' => 'vendor@example.com',
            //'password' => ''
        ]);
        $user->assignRole(RolesEnum::Vendor->value);
        VendorSeeder::factory()->create([
            'user_id' => $user->id,
            'status' => VendorStatusEnum::Approved,
            'store_name' => 'Vendor Store',
            'store_address' => fake()->address(),
        ]);
        
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            //'password' => ''
        ])->assignRole(RolesEnum::Admin->value);
    }
}
