'use client';

import { CategoryPicker } from '@/components/tracking/CategoryPicker';
import { ExpenseCategory } from '@/types';
import { formatCurrency } from '@/utils';

export type Decision = {
    categoryName: string;
    itemId: string | null;
    categoryLabel: string;
    saveMapping: boolean;
};

type TransactionCardProps = {
    date: string;
    title: string;
    amount: number;
    categories: ExpenseCategory[];
    weeklyBudget: number;
    decision: Decision | null;
    isAutoMapped: boolean;
    onDecide: (decision: Decision) => void;
};

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');

    return `${day}/${month}/${year}`;
}

export const TransactionCard = ({
    date,
    title,
    amount,
    categories,
    weeklyBudget,
    decision,
    isAutoMapped,
    onDecide
}: TransactionCardProps) => {
    const selected = decision
        ? { categoryName: decision.categoryName, itemId: decision.itemId, categoryLabel: decision.categoryLabel }
        : null;

    return (
        <div className='rounded-xl bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-start justify-between'>
                <div>
                    <p className='text-sm text-gray-400'>{formatDate(date)}</p>
                    <p className='mt-1 text-lg font-semibold text-gray-800'>{title}</p>
                </div>
                <p className='text-lg font-bold text-red-600'>{formatCurrency(amount)}</p>
            </div>

            {isAutoMapped && decision && (
                <div className='mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700'>
                    Mapeado automaticamente: <span className='font-medium'>{decision.categoryLabel}</span>
                </div>
            )}

            <p className='mb-2 text-sm font-medium text-gray-600'>Onde esse gasto se encaixa?</p>

            <CategoryPicker
                categories={categories}
                weeklyBudget={weeklyBudget}
                selected={selected}
                onSelect={(selection) =>
                    onDecide({
                        ...selection,
                        saveMapping: decision?.saveMapping ?? false
                    })
                }
            />
        </div>
    );
};
