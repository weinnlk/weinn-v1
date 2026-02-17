<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PropertyResource\Pages;
use App\Filament\Resources\PropertyResource\RelationManagers;
use App\Models\Property;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PropertyResource extends Resource
{
    protected static ?string $model = Property::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'draft',
                        'submitted' => 'submitted',
                        'approved' => 'approved',
                        'rejected' => 'rejected',
                    ])
                    ->required(),
                Forms\Components\Select::make('host_id')
                    ->relationship('host', 'email')
                    ->searchable()
                    ->required(),
                Forms\Components\TextInput::make('title')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('location_text')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('rejected_reason')
                    ->columnSpanFull(),
                Forms\Components\DateTimePicker::make('submitted_at'),
                Forms\Components\DateTimePicker::make('approved_at'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('cover_photo')
                    ->getStateUsing(fn (Property $record): ?string => $record->photos->sortBy('sort_order')->first()?->uri)
                    ->square(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('location_text')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('host.email')
                    ->label('Host')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge(),
                Tables\Columns\TextColumn::make('submitted_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('approved_at')
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
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'draft',
                        'submitted' => 'submitted',
                        'approved' => 'approved',
                        'rejected' => 'rejected',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->requiresConfirmation()
                    ->visible(fn (Property $record): bool => $record->status !== 'approved')
                    ->action(function (Property $record): void {
                        $record->update([
                            'status' => 'approved',
                            'approved_at' => now(),
                            'rejected_reason' => null,
                        ]);

                        Notification::make()
                            ->title('Property approved')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('rejected_reason')
                            ->label('Reason')
                            ->required()
                            ->rows(4),
                    ])
                    ->visible(fn (Property $record): bool => $record->status !== 'rejected')
                    ->action(function (Property $record, array $data): void {
                        $record->update([
                            'status' => 'rejected',
                            'approved_at' => null,
                            'rejected_reason' => $data['rejected_reason'],
                        ]);

                        Notification::make()
                            ->title('Property rejected')
                            ->success()
                            ->send();
                    }),
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
        return parent::getEloquentQuery()->with(['host', 'photos']);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\PhotosRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProperties::route('/'),
            'edit' => Pages\EditProperty::route('/{record}/edit'),
        ];
    }
}
