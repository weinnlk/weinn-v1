<?php

namespace App\Filament\Resources\HomeContentItemResource\Pages;

use App\Filament\Resources\HomeContentItemResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditHomeContentItem extends EditRecord
{
    protected static string $resource = HomeContentItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
