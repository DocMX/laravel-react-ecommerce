<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Nuevo Usuario')
                ->icon('heroicon-o-user-plus'),
        ];
    }

    protected function getTableFilters(): array
    {
        return [
            \Filament\Tables\Filters\Filter::make('active')
                ->label('Solo activos')
                ->query(fn ($query) => $query->where('is_active', true)),

            \Filament\Tables\Filters\SelectFilter::make('role')
                ->label('Rol')
                ->options([
                    'admin' => 'Administrador',
                    'editor' => 'Editor',
                    'viewer' => 'Visualizador',
                ]),
        ];
    }

    protected function getTableColumns(): array
    {
        return [
            \Filament\Tables\Columns\TextColumn::make('id')->label('ID')->sortable(),
            \Filament\Tables\Columns\TextColumn::make('name')->label('Nombre')->searchable()->sortable(),
            \Filament\Tables\Columns\TextColumn::make('email')->label('Correo')->searchable()->sortable(),
            \Filament\Tables\Columns\TextColumn::make('role')
                ->colors([
                    'primary' => 'admin',
                    'warning' => 'editor',
                    'success' => 'viewer',
                ])
                ->label('Rol'),
            \Filament\Tables\Columns\IconColumn::make('is_active')
                ->boolean()
                ->label('Activo'),
            \Filament\Tables\Columns\TextColumn::make('created_at')
                ->dateTime()
                ->label('Creado'),
        ];
    }
}
