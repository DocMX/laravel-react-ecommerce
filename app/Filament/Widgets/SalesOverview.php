<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Card;

class SalesOverview extends BaseWidget
{
    protected function getCards(): array
    {
        return [
            Card::make('Total Ventas', 'N/A')
                ->description('Ventas totales en el mes')
                ->color('success'),
            
            Card::make('Pedidos Pendientes', 'N/A')
                ->description('Órdenes sin procesar')
                ->color('warning'),
        ];
    }
}
