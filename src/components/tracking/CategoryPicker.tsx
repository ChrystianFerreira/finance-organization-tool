'use client';

import { ExpenseCategory } from '@/types';
import { formatCurrency } from '@/utils';

import { Check } from 'lucide-react';

type Selection = {
    categoryName: string;
    itemId: string | null;
    categoryLabel: string;
};

type CategoryPickerProps = {
    categories: ExpenseCategory[];
    weeklyBudget: number;
    selected: Selection | null;
    onSelect: (selection: Selection) => void;
};

export const CategoryPicker = ({ categories, weeklyBudget, selected, onSelect }: CategoryPickerProps) => {
    const isSelected = (categoryName: string, itemId: string | null) =>
        selected?.categoryName === categoryName && selected?.itemId === itemId;

    return (
        <div className='flex max-h-72 flex-col gap-1 overflow-y-auto'>
            <p className='px-2 pt-1 text-xs font-semibold tracking-wide text-gray-400 uppercase'>Gastos Fixos</p>
            {categories.map((category) =>
                category.items
                    .filter((item) => item.amount > 0)
                    .map((item) => (
                        <button
                            key={item.id}
                            type='button'
                            onClick={() =>
                                onSelect({
                                    categoryName: category.category,
                                    itemId: item.id,
                                    categoryLabel: `${category.category} › ${item.name}`
                                })
                            }
                            className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                isSelected(category.category, item.id)
                                    ? 'bg-green-50 ring-1 ring-green-600'
                                    : 'hover:bg-gray-50'
                            }`}>
                            <span>
                                <span className='text-gray-400'>{category.category} › </span>
                                <span className='font-medium text-gray-800'>{item.name}</span>
                            </span>
                            <span className='flex items-center gap-2'>
                                <span className='text-xs text-gray-400'>{formatCurrency(item.amount)}</span>
                                {isSelected(category.category, item.id) && (
                                    <Check size={14} className='text-green-600' />
                                )}
                            </span>
                        </button>
                    ))
            )}

            <div className='my-1 border-t' />
            <p className='px-2 text-xs font-semibold tracking-wide text-gray-400 uppercase'>Orçamento semanal</p>
            <button
                type='button'
                onClick={() =>
                    onSelect({
                        categoryName: 'weekly_budget',
                        itemId: null,
                        categoryLabel: 'Orçamento semanal'
                    })
                }
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isSelected('weekly_budget', null) ? 'bg-green-50 ring-1 ring-green-600' : 'hover:bg-gray-50'
                }`}>
                <span className='font-medium text-gray-800'>Gastos livres</span>
                <span className='flex items-center gap-2'>
                    <span className='text-xs text-gray-400'>{formatCurrency(weeklyBudget)}/semana</span>
                    {isSelected('weekly_budget', null) && <Check size={14} className='text-green-600' />}
                </span>
            </button>

            <div className='my-1 border-t' />
            <p className='px-2 text-xs font-semibold tracking-wide text-gray-400 uppercase'>Outros</p>
            <button
                type='button'
                onClick={() =>
                    onSelect({
                        categoryName: 'unplanned',
                        itemId: null,
                        categoryLabel: 'Gasto não planejado'
                    })
                }
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isSelected('unplanned', null) ? 'bg-amber-50 ring-1 ring-amber-600' : 'hover:bg-gray-50'
                }`}>
                <span className='font-medium text-gray-800'>Nenhuma das opções</span>
                {isSelected('unplanned', null) && <Check size={14} className='text-amber-600' />}
            </button>

            <button
                type='button'
                onClick={() =>
                    onSelect({
                        categoryName: 'skipped',
                        itemId: null,
                        categoryLabel: 'Ignorado'
                    })
                }
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isSelected('skipped', null) ? 'bg-gray-100 ring-1 ring-gray-400' : 'hover:bg-gray-50'
                }`}>
                <span className='font-medium text-gray-500'>Ignorar</span>
                {isSelected('skipped', null) && <Check size={14} className='text-gray-500' />}
            </button>
        </div>
    );
};
