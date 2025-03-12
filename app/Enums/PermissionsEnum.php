<?php

namespace App\Enums;

enum PermissionsEnum: string
{
    case ApproveVendors = 'AproveVendors';
    case SellProducts = 'SellProducts';
    case BuyProducts = 'BuyProducts';

}
