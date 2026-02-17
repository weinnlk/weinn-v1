<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\Booking;
use App\Models\Property;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('reservation_code')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\TextInput::make('status')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\TextInput::make('created_at')
                    ->disabled()
                    ->dehydrated(false),

                Forms\Components\TextInput::make('first_name')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\TextInput::make('last_name')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\TextInput::make('email')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\TextInput::make('phone')
                    ->disabled()
                    ->dehydrated(false),
                Forms\Components\TextInput::make('country')
                    ->disabled()
                    ->dehydrated(false),

                Forms\Components\Placeholder::make('guest')
                    ->content(fn (?Booking $record): string => $record?->guest?->id ?? $record?->guest_id ?? '-')
                    ->columnSpanFull(),
                Forms\Components\Placeholder::make('property')
                    ->content(fn (?Booking $record): string => $record?->property?->title ?? $record?->property_id ?? '-')
                    ->columnSpanFull(),
                Forms\Components\Placeholder::make('room_type')
                    ->content(fn (?Booking $record): string => $record?->roomType?->name ?? $record?->room_type_id ?? '-')
                    ->columnSpanFull(),

                Forms\Components\Section::make('Financials')
                    ->schema([
                        Forms\Components\TextInput::make('total_amount_lkr')
                            ->prefix('LKR')
                            ->disabled(),
                        Forms\Components\TextInput::make('commission_rate')
                            ->formatStateUsing(fn ($state) => $state === null ? null : (string) round(((float) $state) * 100, 4))
                            ->suffix('%')
                            ->disabled(),
                        Forms\Components\TextInput::make('commission_amount_lkr')
                            ->prefix('LKR')
                            ->disabled(),
                    ])->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reservation_code')
                    ->label('Code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->searchable(),
                Tables\Columns\TextColumn::make('first_name')
                    ->label('Guest'),
                Tables\Columns\TextColumn::make('last_name')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('email')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->searchable(),
                Tables\Columns\TextColumn::make('phone')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('property.title')
                    ->label('Property')
                    ->searchable(),
                Tables\Columns\TextColumn::make('roomType.name')
                    ->label('Room Type')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_amount_lkr')
                    ->label('Total (LKR)')
                    ->money('LKR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('commission_amount_lkr')
                    ->label('Commission')
                    ->money('LKR')
                    ->color('danger')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(fn (): array => Booking::query()
                        ->select('status')
                        ->whereNotNull('status')
                        ->distinct()
                        ->orderBy('status')
                        ->pluck('status', 'status')
                        ->all())
                    ->searchable(),
                Tables\Filters\SelectFilter::make('property_id')
                    ->label('Property')
                    ->options(fn (): array => Property::query()
                        ->selectRaw('id, COALESCE(title, id::text) as label')
                        ->orderBy('label')
                        ->pluck('label', 'id')
                        ->all())
                    ->searchable(),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn (Builder $query, $date) => $query->whereDate('created_at', '>=', $date))
                            ->when($data['until'] ?? null, fn (Builder $query, $date) => $query->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['property', 'roomType', 'guest'])->orderByDesc('created_at');
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
            'index' => Pages\ListBookings::route('/'),
            'view' => Pages\ViewBooking::route('/{record}'),
        ];
    }
}
