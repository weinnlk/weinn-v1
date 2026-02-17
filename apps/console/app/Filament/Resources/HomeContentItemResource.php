<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomeContentItemResource\Pages;
use App\Filament\Resources\HomeContentItemResource\RelationManagers;
use App\Models\HomeContentItem;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class HomeContentItemResource extends Resource
{
    protected static ?string $model = HomeContentItem::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('app')
                    ->options([
                        'guest' => 'guest',
                        'host' => 'host',
                    ])
                    ->required(),
                Forms\Components\Select::make('placement')
                    ->options([
                        'home_top_carousel' => 'home_top_carousel',
                        'home_mid' => 'home_mid',
                    ])
                    ->required(),
                Forms\Components\Select::make('type')
                    ->options([
                        'promo_hero' => 'promo_hero',
                        'article_modal' => 'article_modal',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('schema_version')
                    ->required()
                    ->numeric()
                    ->default(1),
                Forms\Components\TextInput::make('title')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('subtitle')
                    ->columnSpanFull()
                    ->rows(3),
                Forms\Components\TextInput::make('image_url')
                    ->url()
                    ->columnSpanFull(),
                Forms\Components\KeyValue::make('payload')
                    ->columnSpanFull()
                    ->reorderable()
                    ->addable()
                    ->deletable()
                    ->editableKeys()
                    ->keyLabel('Key')
                    ->valueLabel('Value')
                    ->required(),
                Forms\Components\TextInput::make('priority')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\Toggle::make('is_active')
                    ->required(),
                Forms\Components\DateTimePicker::make('starts_at'),
                Forms\Components\DateTimePicker::make('ends_at'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('app'),
                Tables\Columns\TextColumn::make('placement'),
                Tables\Columns\TextColumn::make('type'),
                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Image')
                    ->square(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('schema_version')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('priority')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('starts_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('ends_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('app')
                    ->options([
                        'guest' => 'guest',
                        'host' => 'host',
                    ]),
                Tables\Filters\SelectFilter::make('placement')
                    ->options([
                        'home_top_carousel' => 'home_top_carousel',
                        'home_mid' => 'home_mid',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'promo_hero' => 'promo_hero',
                        'article_modal' => 'article_modal',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->orderByDesc('priority')->orderByDesc('updated_at');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHomeContentItems::route('/'),
            'create' => Pages\CreateHomeContentItem::route('/create'),
            'edit' => Pages\EditHomeContentItem::route('/{record}/edit'),
        ];
    }
}
