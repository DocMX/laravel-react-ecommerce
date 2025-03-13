<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'department_id' => 1,  //Assuming department_id 1 is for Electronics
                'parent_id' => null,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fashion',
                'department_id' => 2,  //Assuming department_id 2 is for Fashion
                'parent_id' => null,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Computers',
                'department_id' => 1,  //parent is Electronics
                'parent_id' => 1,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Smartphones',
                'department_id' => 1,  //parent is Electronics
                'parent_id' => 1,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Laptops',
                'department_id' => 1,  //parent is Computers
                'parent_id' => 3,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Desktops',
                'department_id' => 1,  //parent is Computers
                'parent_id' => 3,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            //subcategories of smartphones (depth 2)
            [
                'name' => 'Android',
                'department_id' => 1,  //parent is Smartphones
                'parent_id' => 4,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Iphones',
                'department_id' => 1,  //parent is Smartphones
                'parent_id' => 4,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('categories')->insert($categories);
    }
}
