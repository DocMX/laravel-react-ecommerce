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

        // Asegurar que cada variación tenga los valores correctos como claves planas
        foreach ($variations as &$variation) {
            $variation['variation_type1_id'] = $variation['variation_type1']['id'] ?? null;
            $variation['variation_type1_name'] = $variation['variation_type1']['name'] ?? null;
            $variation['variation_type1_label'] = $variation['variation_type1']['label'] ?? null;

            $variation['variation_type2_id'] = $variation['variation_type2']['id'] ?? null;
            $variation['variation_type2_name'] = $variation['variation_type2']['name'] ?? null;
            $variation['variation_type2_label'] = $variation['variation_type2']['label'] ?? null;

            // Opcionalmente, eliminamos los arrays anidados
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
            $match = array_filter($existingData, function ($existingOption) use ($optionsIds) {
                return $existingOption['variation_type_option_ids'] === $optionsIds;
            });

            //if match is found, override quantity and price
            if (!empty($match)) {
                $existingEntry = reset($match);
                $product['quantity'] = $existingEntry['quantity'];
                $product['price'] = $existingEntry['price'];
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
}
