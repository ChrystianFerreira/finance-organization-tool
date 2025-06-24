import { useState } from 'react';

import { useFinancial } from '@/context/FinancialContext';
import { parseCurrency } from '@/utils';

import { Target } from 'lucide-react';

export const SavingsGoalForm = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
    const { data, updateData } = useFinancial();
    const [savingsGoal, setSavingsGoal] = useState(data.savingsGoal?.toString() || '');

    const handleSubmit = () => {
        updateData({ savingsGoal: parseCurrency(savingsGoal) });
        onNext();
    };

    const isValid = parseCurrency(savingsGoal) > 0;

    return (
        <div className='mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg'>
            <div className='mb-6 flex items-center gap-3'>
                <Target className='text-purple-600' size={24} />
                <h2 className='text-2xl font-bold text-gray-800'>Meta de Economia Mensal</h2>
            </div>

            <div className='space-y-6'>
                <div className='rounded-lg bg-purple-50 p-4'>
                    <p className='mb-2 text-purple-700'>
                        <strong>Dica:</strong> Sua meta de economia inclui reserva de emergência e objetivos
                        financeiros.
                    </p>
                    <p className='text-sm text-purple-600'>
                        Este valor será descontado da sua renda junto com os gastos fixos para calcular quanto você pode
                        gastar livremente.
                    </p>
                </div>

                <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Quanto você quer economizar por mês?
                    </label>
                    <input
                        type='text'
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(e.target.value)}
                        placeholder='R$ 0,00'
                        className='w-full rounded-lg border border-gray-300 p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500'
                    />
                </div>

                <div className='flex gap-4'>
                    <button
                        onClick={onBack}
                        className='flex-1 rounded-lg bg-gray-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-600'>
                        Voltar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className='flex-1 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
                        Ver Resultado
                    </button>
                </div>
            </div>
        </div>
    );
};
