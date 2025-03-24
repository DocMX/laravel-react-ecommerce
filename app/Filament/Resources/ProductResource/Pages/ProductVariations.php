<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Enums\ProductVariationTypeEnum;
use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class ProductVariations extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected static ?string $title = 'Variations';

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    public function form(Form $form): Form
    {
        $types = $this->record->variationTypes;
        $fields = [];
        foreach ($types as $type) {
            $fields[] = TextInput::make("variation_type{$type->id}_id")->hidden();
            $fields[] = TextInput::make("variation_type{$type->id}_name")
                ->label($type->name)
                ->disabled(); // Evita que se editen accidentalmente
        }

        return $form
            ->schema([
                Repeater::make('variations')
                    ->label(false)
                    ->collapsible()
                    ->addable(false)
                    ->defaultItems(1)
                    ->schema(array_merge($fields, [
                        TextInput::make('quantity')->label('Quantity')->numeric(),
                        TextInput::make('price')->label('Price')->numeric(),
                    ]))
                    ->columns(2)
                    ->columnSpan(2),
            ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $variations = $this->mergeCartesianWithExisting(
            $this->record->variationTypes,
            $this->record->variations->toArray()
        );
        foreach ($variations as &$variation) {
            $variation['variation_type1_id'] = $variation['variation_type1']['id'] ?? null;
            $variation['variation_type1_name'] = $variation['variation_type1']['name'] ?? null;
            $variation['variation_type1_label'] = $variation['variation_type1']['label'] ?? null;
            $variation['variation_type2_id'] = $variation['variation_type2']['id'] ?? null;
            $variation['variation_type2_name'] = $variation['variation_type2']['name'] ?? null;
            $variation['variation_type2_label'] = $variation['variation_type2']['label'] ?? null;
            unset($variation['variation_type1'], $variation['variation_type2']);
        }

        $data['variations'] = $variations;

        return $data;
    }


    private function mergeCartesianWithExisting($variationTypes, $existingData): array
    {
        $defaultQuantity = $this->record->quantity;
        $defaultPrice = $this->record->price;
        $cartesianProduct = $this->cartesianProduct($variationTypes, $defaultQuantity, $defaultPrice);
        $mergeResult = [];
        foreach ($cartesianProduct as $product) {

            //Extract option IDs from the current product combination as an array
            $optionsIds = collect($product)
                ->filter(fn($value, $key) => str_starts_with($key, 'variation_type'))
                ->map(fn($option) => $option['id'])
                ->values()
                ->toArray();
            //Find matching entry in existing data
            $match = array_values(array_filter($existingData ?? [], function ($existingOption) use ($optionsIds) {
                return isset($existingOption['variation_type_option_ids']) &&
                    $existingOption['variation_type_option_ids'] === $optionsIds;
            }));

            //if match is found, override quantity and price
            if (!empty($match)) {
                $existingEntry = $match[0] ?? null; // Evita errores de índice
                if ($existingEntry) {
                    $product['id'] = $existingEntry['id'] ?? null;
                    $product['quantity'] = $existingEntry['quantity'];
                    $product['price'] = $existingEntry['price'];
                }
            } else {
                //Set default quantity abd price if no match
                $product['quantity'] = $defaultQuantity;
                $product['price'] = $defaultPrice;
            }

            $mergeResult[] = $product;
        }

        return $mergeResult;
    }

    private function cartesianProduct($variationTypes, $defaultQuantity = null, $defaultPrice = null): array
    {
        $result = [[]];

        foreach ($variationTypes as $index => $variationType) {
            $temp = [];
            foreach ($variationType->options as $option) {
                //add the current option t all existing combinations
                foreach ($result as $combination) {
                    $newCombination = $combination + [
                        'variation_type' . ($variationType->id) => [
                            'id' => $option->id,
                            'name' => $option->name,
                            'label' => $variationType->name,
                        ],
                    ];

                    $temp[] = $newCombination;
                }
            }
            $result = $temp; //update results with the new combinations

        }
        //Add quantity and price to completed combinations
        foreach ($result as &$combination) {
            if (count($combination) === count($variationTypes)) {
                $combination['quantity'] = $defaultQuantity;
                $combination['price'] = $defaultPrice;
            }
        }
        return $result;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {

        if (isset($data['variations'])) {
            foreach ($data['variations'] as &$variation) {
                $variation['variation_type_1'] = [
                    'id'    => $variation['variation_type1_id'] ?? null,
                    'name'  => $variation['variation_type1_name'] ?? null,
                    'label' => $variation['variation_type1_label'] ?? null,
                ];

                $variation['variation_type_2'] = [
                    'id'    => $variation['variation_type2_id'] ?? null,
                    'name'  => $variation['variation_type2_name'] ?? null,
                    'label' => $variation['variation_type2_label'] ?? null,
                ];

                // Eliminar los campos originales para evitar redundancia
                unset(
                    $variation['variation_type1_id'],
                    $variation['variation_type1_name'],
                    $variation['variation_type1_label'],
                    $variation['variation_type2_id'],
                    $variation['variation_type2_name'],
                    $variation['variation_type2_label']
                );
            }
        }

        $formattedData = [];
        //aqui en teoria llega sin el id de una columna ya insertada
        foreach ($data['variations'] as $option) {

            $variationTypeOptionIds = [];

            foreach ($this->record->variationTypes as $variationType) {

                if (isset($option['variation_type_' . $variationType->id])) {
                    $variationTypeOptionIds[] = $option['variation_type_' . $variationType->id]['id'] ?? null;
                }
            }

            if (!empty($option['id'])) {
                // Si el 'id' está presente, lo dejamos tal cual
                $formattedData[] = [
                    'id' => $option['id'],
                    'variation_type_option_ids' => $variationTypeOptionIds,
                    'quantity' => $option['quantity'] ?? null,
                    'price' => $option['price'] ?? null,
                ];
            } else {
                // Si no hay 'id' (es un nuevo registro), lo omitimos y dejamos que la base de datos se encargue
                $formattedData[] = [
                    //'id' => null, // La base de datos lo asignará si es autoincremental
                    'variation_type_option_ids' => $variationTypeOptionIds,
                    'quantity' => $option['quantity'] ?? null,
                    'price' => $option['price'] ?? null,
                ];
            }
        }

        $data['variations'] = $formattedData;

        //dd($data['variations']); // Para depuración

        return $data;
    }




    protected function handleRecordUpdate(Model $record, array $data): Model
    {

        // Recuperamos las variaciones y las preparamos para el upsert
        $variations = $data['variations'];
        unset($data['variations']); // Limpiamos el arreglo original

        // Mapeamos las variaciones a la estructura correcta
        $variations = collect($variations)->map(function ($variation) {
            // Si el 'id' está presente, lo dejamos tal cual
            // Si no está presente, no agregamos el campo 'id' (lo manejamos dentro del if)
            if (isset($variation['id'])) {
                // Si el 'id' está presente, mantenemos el valor
                return [
                    'id' => $variation['id'],
                    'variation_type_option_ids' => json_encode($variation['variation_type_option_ids']),
                    'quantity' => $variation['quantity'],
                    'price' => $variation['price'],
                ];
            } else {
                // Si el 'id' no está presente, lo omitimos (se espera que la base de datos lo maneje como nuevo)
                return [
                    'variation_type_option_ids' => json_encode($variation['variation_type_option_ids']),
                    'quantity' => $variation['quantity'],
                    'price' => $variation['price'],
                ];
            }
        })->toArray();

        // Realizamos el upsert
        $record->variations()->upsert($variations, ['id'], [
            'variation_type_option_ids',
            'quantity',
            'price',
        ]);

        return $record;
    }
}
