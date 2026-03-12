'use client';

import { useTracking } from '@/hooks/useTracking';
import { formatCurrency } from '@/utils';

import { ChevronDown } from 'lucide-react';

type SpendingHistoryProps = {
    month: string;
};

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');

    return `${day}/${month}/${year}`;
}

export const SpendingHistory = ({ month }: SpendingHistoryProps) => {
    const { trackingData } = useTracking();

    const monthTransactions = trackingData.transactions.filter(
        (txn) => txn.date.startsWith(month) && txn.categoryName !== 'skipped'
    );

    if (monthTransactions.length === 0) {
        return <p className='py-8 text-center text-sm text-gray-400'>Nenhuma transação importada para este mês.</p>;
    }

    const grouped = new Map<string, typeof monthTransactions>();
    for (const txn of monthTransactions) {
        const key = txn.categoryLabel;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(txn);
    }

    return (
        <div className='flex flex-col gap-3'>
            <h3 className='text-sm font-semibold text-gray-600'>Transações importadas ({monthTransactions.length})</h3>
            {Array.from(grouped.entries()).map(([label, txns]) => (
                <details key={label} className='rounded-lg border'>
                    <summary className='flex cursor-pointer items-center justify-between px-4 py-3 text-sm'>
                        <span className='font-medium text-gray-700'>{label}</span>
                        <span className='flex items-center gap-2 text-gray-500'>
                            {formatCurrency(txns.reduce((sum, t) => sum + t.amount, 0))}
                            <ChevronDown size={14} />
                        </span>
                    </summary>
                    <ul className='divide-y border-t text-sm'>
                        {txns.map((txn) => (
                            <li key={txn.id} className='flex items-center justify-between px-4 py-2'>
                                <span className='text-gray-500'>
                                    {formatDate(txn.date)} — {txn.title}
                                </span>
                                <span className='font-medium text-gray-700'>{formatCurrency(txn.amount)}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </div>
    );
};
