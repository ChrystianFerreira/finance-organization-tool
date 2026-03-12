'use client';

import { ExpenseCategory } from '@/types';
import { formatCurrency } from '@/utils';

type SpendingProgressProps = {
    categories: ExpenseCategory[];
    spentByItem: Record<string, number>;
    weeklyBudget: number;
    weeklyBudgetSpent: number;
    unplannedSpent: number;
};

function ProgressBar({ spent, budgeted }: { spent: number; budgeted: number }) {
    const ratio = budgeted > 0 ? spent / budgeted : 0;
    const percentage = Math.min(ratio * 100, 100);
    const color = ratio >= 1 ? 'bg-red-500' : ratio >= 0.75 ? 'bg-amber-500' : 'bg-green-500';

    return (
        <div className='flex items-center gap-3'>
            <div className='h-2 flex-1 rounded-full bg-gray-200'>
                <div
                    className={`h-2 rounded-full transition-all ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className='w-36 text-right text-xs text-gray-500'>
                {formatCurrency(spent)} / {formatCurrency(budgeted)}
            </span>
        </div>
    );
}

export const SpendingProgress = ({
    categories,
    spentByItem,
    weeklyBudget,
    weeklyBudgetSpent,
    unplannedSpent
}: SpendingProgressProps) => {
    const hasAnySpending =
        Object.values(spentByItem).some((v) => v > 0) || weeklyBudgetSpent > 0 || unplannedSpent > 0;

    if (!hasAnySpending) return null;

    const categoriesWithSpending = categories
        .map((cat) => ({
            ...cat,
            items: cat.items.filter((item) => item.amount > 0 || (spentByItem[item.id] ?? 0) > 0)
        }))
        .filter((cat) => cat.items.length > 0);

    return (
        <div className='rounded-xl bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-bold text-gray-800'>Gastos Reais vs Orçado</h2>

            <div className='flex flex-col gap-5'>
                {categoriesWithSpending.map((category) => (
                    <div key={category.category}>
                        <h3 className='mb-2 text-sm font-semibold text-gray-500'>{category.category}</h3>
                        <div className='flex flex-col gap-2'>
                            {category.items.map((item) => (
                                <div key={item.id}>
                                    <p className='mb-0.5 text-sm font-medium text-gray-700'>{item.name}</p>
                                    <ProgressBar spent={spentByItem[item.id] ?? 0} budgeted={item.amount} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {weeklyBudgetSpent > 0 && (
                    <div>
                        <h3 className='mb-2 text-sm font-semibold text-gray-500'>Orçamento Semanal</h3>
                        <p className='mb-0.5 text-sm font-medium text-gray-700'>Gastos livres</p>
                        <ProgressBar spent={weeklyBudgetSpent} budgeted={weeklyBudget * 5} />
                    </div>
                )}

                {unplannedSpent > 0 && (
                    <div className='border-t pt-4'>
                        <h3 className='mb-1 text-sm font-semibold text-amber-600'>Gastos não planejados</h3>
                        <p className='text-lg font-bold text-amber-700'>{formatCurrency(unplannedSpent)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
