<?php

namespace Database\Factories;

use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Enums\VendorStatusEnum;

class VendorFactory extends Factory
{
    protected $model = Vendor::class;

    public function definition(): array
    {
        return [
            'status' => VendorStatusEnum::Approved,
            'store_name' => $this->faker->company(),
            'store_address' => $this->faker->address(),
        ];
    }
}
