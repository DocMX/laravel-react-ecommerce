<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\RolesEnum;
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

        User::factory()->create([
            'name' => 'Vendor',
            'email' => 'vendor@example.com',
            //'password' => ''
        ])->assignRole(RolesEnum::Vendor->value);
        
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            //'password' => ''
        ])->assignRole(RolesEnum::Admin->value);
    }
}
