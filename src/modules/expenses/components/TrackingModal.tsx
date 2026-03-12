'use client';

import { useEffect, useState } from 'react';

import { getSelectableMonths } from '@/modules/common/utils';
import { useTracking } from '@/modules/expenses/hooks/useTracking';

import { ImportWizardModal } from './ImportWizardModal';
import { SpendingHistory } from './SpendingHistory';
import { Trash2, Upload, X } from 'lucide-react';

type TrackingModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

function formatMonthLabel(month: string): string {
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1);

    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export const TrackingModal = ({ isOpen, onClose }: TrackingModalProps) => {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const { getAvailableMonths, clearMonth } = useTracking();

    const availableMonths = getAvailableMonths();
    const selectableMonths = getSelectableMonths(availableMonths);
    const [selectedMonth, setSelectedMonth] = useState(selectableMonths[0]);

    useEffect(() => {
        if (!selectableMonths.includes(selectedMonth)) {
            setSelectedMonth(selectableMonths[0]);
        }
    }, [selectableMonths, selectedMonth]);

    const handleImported = () => {
        const updated = getAvailableMonths();
        if (updated.length > 0) {
            setSelectedMonth(updated[0]);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                <div className='relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl'>
                    <div className='flex items-center justify-between border-b px-6 py-4'>
                        <div>
                            <h2 className='text-lg font-semibold text-gray-800'>Acompanhamento de Gastos</h2>
                            <p className='text-sm text-gray-500'>Importe seu extrato e veja seu histórico</p>
                        </div>
                        <div className='flex items-center gap-3'>
                            <button
                                type='button'
                                onClick={() => setIsImportOpen(true)}
                                className='flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700'>
                                <Upload size={14} />
                                Importar gastos
                            </button>
                            <button type='button' onClick={onClose} className='text-gray-400 hover:text-gray-600'>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto p-6'>
                        <div className='mb-6 flex items-center gap-3'>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className='rounded-md border px-3 py-2 text-sm text-gray-700 capitalize'>
                                {selectableMonths.map((m) => (
                                    <option key={m} value={m}>
                                        {formatMonthLabel(m)}
                                    </option>
                                ))}
                            </select>
                            {availableMonths.includes(selectedMonth) && (
                                <button
                                    type='button'
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja limpar os gastos deste mês?')) {
                                            clearMonth(selectedMonth);
                                        }
                                    }}
                                    className='flex items-center gap-1 rounded-md px-2 py-2 text-sm text-red-500 hover:bg-red-50'>
                                    <Trash2 size={14} />
                                    Limpar mês
                                </button>
                            )}
                        </div>

                        <SpendingHistory month={selectedMonth} />
                    </div>
                </div>
            </div>

            <ImportWizardModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImported={handleImported}
            />
        </>
    );
};
