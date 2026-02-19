'use client';

import { Pencil } from 'lucide-react';

import { formatCurrency } from '@/utils';

import { Decision } from './TransactionCard';

type SummaryEntry = {
    date: string;
    title: string;
    amount: number;
    decision: Decision;
};

type TransactionSummaryProps = {
    entries: SummaryEntry[];
    onEdit: (index: number) => void;
    onConfirm: () => void;
    onBack: () => void;
};

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');

    return `${day}/${month}`;
}

export const TransactionSummary = ({ entries, onEdit, onConfirm, onBack }: TransactionSummaryProps) => {
    const categorized = entries.filter((e) => e.decision.categoryName !== 'skipped');
    const skippedCount = entries.length - categorized.length;
    const total = categorized.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-800'>Revisão</h3>
                <p className='text-sm text-gray-500'>
                    {categorized.length} categorizadas · {skippedCount} ignoradas · Total:{' '}
                    <span className='font-medium text-gray-800'>{formatCurrency(total)}</span>
                </p>
            </div>

            <div className='max-h-96 overflow-y-auto rounded-lg border'>
                <table className='w-full text-sm'>
                    <thead className='sticky top-0 bg-gray-50'>
                        <tr className='text-left text-gray-500'>
                            <th className='px-3 py-2 font-medium'>Data</th>
                            <th className='px-3 py-2 font-medium'>Título</th>
                            <th className='px-3 py-2 text-right font-medium'>Valor</th>
                            <th className='px-3 py-2 font-medium'>Categoria</th>
                            <th className='px-3 py-2' />
                        </tr>
                    </thead>
                    <tbody className='divide-y'>
                        {entries.map((entry, index) => (
                            <tr
                                key={index}
                                className={entry.decision.categoryName === 'skipped' ? 'text-gray-300' : ''}>
                                <td className='whitespace-nowrap px-3 py-2'>{formatDate(entry.date)}</td>
                                <td className='max-w-48 truncate px-3 py-2'>{entry.title}</td>
                                <td className='whitespace-nowrap px-3 py-2 text-right'>
                                    {formatCurrency(entry.amount)}
                                </td>
                                <td className='px-3 py-2'>
                                    <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                            entry.decision.categoryName === 'skipped'
                                                ? 'bg-gray-100 text-gray-400'
                                                : entry.decision.categoryName === 'unplanned'
                                                  ? 'bg-amber-50 text-amber-700'
                                                  : entry.decision.categoryName === 'weekly_budget'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-green-50 text-green-700'
                                        }`}>
                                        {entry.decision.categoryLabel}
                                    </span>
                                </td>
                                <td className='px-3 py-2'>
                                    <button
                                        type='button'
                                        onClick={() => onEdit(index)}
                                        className='text-gray-400 hover:text-gray-600'>
                                        <Pencil size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-between'>
                <button
                    type='button'
                    onClick={onBack}
                    className='rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100'>
                    Voltar
                </button>
                <button
                    type='button'
                    onClick={onConfirm}
                    className='rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700'>
                    Confirmar e Salvar
                </button>
            </div>
        </div>
    );
};
