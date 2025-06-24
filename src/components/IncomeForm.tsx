import { useState } from 'react';

import { useFinancial } from '@/context/FinancialContext';
import { parseCurrency } from '@/utils';

import { DollarSign } from 'lucide-react';

export const IncomeForm = ({ onNext }: { onNext: () => void }) => {
    const { data, updateData } = useFinancial();
    const [incomeType, setIncomeType] = useState<'fixed' | 'variable'>(data.income.type);
    const [fixedAmount, setFixedAmount] = useState(data.income.fixedAmount?.toString() || '');
    const [minAmount, setMinAmount] = useState(data.income.minAmount?.toString() || '');
    const [maxAmount, setMaxAmount] = useState(data.income.maxAmount?.toString() || '');

    const handleSubmit = () => {
        const incomeData = {
            type: incomeType,
            ...(incomeType === 'fixed'
                ? { fixedAmount: parseCurrency(fixedAmount) }
                : {
                      minAmount: parseCurrency(minAmount),
                      maxAmount: parseCurrency(maxAmount)
                  })
        };

        updateData({ income: incomeData });
        onNext();
    };

    const isValid =
        incomeType === 'fixed'
            ? parseCurrency(fixedAmount) > 0
            : parseCurrency(minAmount) > 0 && parseCurrency(maxAmount) > parseCurrency(minAmount);

    return (
        <div className='mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg'>
            <div className='mb-6 flex items-center gap-3'>
                <DollarSign className='text-green-600' size={24} />
                <h2 className='text-2xl font-bold text-gray-800'>Qual é sua renda mensal?</h2>
            </div>

            <div className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                    <button
                        onClick={() => setIncomeType('fixed')}
                        className={`rounded-lg border-2 p-4 transition-colors ${
                            incomeType === 'fixed'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='font-semibold'>Renda Fixa</div>
                        <div className='text-sm text-gray-600'>Mesmo valor todo mês</div>
                    </button>

                    <button
                        onClick={() => setIncomeType('variable')}
                        className={`rounded-lg border-2 p-4 transition-colors ${
                            incomeType === 'variable'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='font-semibold'>Renda Variável</div>
                        <div className='text-sm text-gray-600'>Varia mensalmente</div>
                    </button>
                </div>

                {incomeType === 'fixed' ? (
                    <div>
                        <label className='mb-2 block text-sm font-medium text-gray-700'>Valor mensal líquido</label>
                        <input
                            type='text'
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(e.target.value)}
                            placeholder='R$ 0,00'
                            className='w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                        />
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium text-gray-700'>Renda mínima mensal</label>
                            <input
                                type='text'
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                placeholder='R$ 0,00'
                                className='w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                            />
                        </div>

                        <div>
                            <label className='mb-2 block text-sm font-medium text-gray-700'>Renda máxima mensal</label>
                            <input
                                type='text'
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                placeholder='R$ 0,00'
                                className='w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className='w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
                    Continuar
                </button>
            </div>
        </div>
    );
};
