import { useState } from 'react';

import { useFinancial } from '@/context/FinancialContext';
import { calculateTotalExpenses, calculateWeeklyBudget, formatCurrency, parseCurrency } from '@/utils';

import { Calculator, CreditCard, Edit3, Target, TrendingDown, TrendingUp } from 'lucide-react';

export const Dashboard = ({ onEdit, onReset }: { onEdit: (step: number) => void; onReset: () => void }) => {
    const { data, updateData, scenario, setScenario } = useFinancial();
    const [isEditingSavings, setIsEditingSavings] = useState(false);
    const [savingsInput, setSavingsInput] = useState(data.savingsGoal.toString());

    const totalExpenses = calculateTotalExpenses(data.fixedExpenses);
    const totalMonthlyInstallments = data.installments?.reduce((acc, curr) => acc + curr.monthlyAmount, 0) || 0;

    const getCurrentIncome = () => {
        if (data.income.type === 'fixed') {
            return data.income.fixedAmount || 0;
        }

        return scenario === 'pessimistic' ? data.income.minAmount || 0 : data.income.maxAmount || 0;
    };

    const handleSavingsBlur = () => {
        const newValue = parseCurrency(savingsInput);
        updateData({ savingsGoal: newValue });
        setSavingsInput(newValue.toString());
        setIsEditingSavings(false);
    };

    const handleSavingsKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSavingsBlur();
        } else if (e.key === 'Escape') {
            setIsEditingSavings(false);
            setSavingsInput(data.savingsGoal.toString());
        }
    };

    const currentIncome = getCurrentIncome();
    const remaining = currentIncome - totalExpenses - data.savingsGoal - totalMonthlyInstallments;
    const weeklyBudget = calculateWeeklyBudget(
        currentIncome,
        totalExpenses + totalMonthlyInstallments,
        data.savingsGoal
    );
    const futureWeeklyBudget = calculateWeeklyBudget(currentIncome, totalExpenses, data.savingsGoal);

    const isVariableIncome = data.income.type === 'variable';
    const isNegative = remaining < 0;
    const hasInstallments = totalMonthlyInstallments > 0;

    return (
        <div className='mx-auto max-w-4xl space-y-6 p-6'>
            <div className='rounded-lg bg-white p-6 shadow-lg'>
                <div className='mb-6 flex items-center gap-3'>
                    <Calculator className='text-green-600' size={24} />
                    <h2 className='text-2xl font-bold text-gray-800'>Seu Orçamento Mensal</h2>
                </div>

                {isVariableIncome && (
                    <div className='mb-6 flex justify-center'>
                        <div className='flex rounded-lg bg-gray-100 p-1'>
                            <button
                                onClick={() => setScenario('pessimistic')}
                                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                                    scenario === 'pessimistic'
                                        ? 'bg-red-500 text-white'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}>
                                <TrendingDown className='mr-2 inline' size={16} />
                                Cenário Pessimista
                            </button>
                            <button
                                onClick={() => setScenario('optimistic')}
                                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                                    scenario === 'optimistic'
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}>
                                <TrendingUp className='mr-2 inline' size={16} />
                                Cenário Otimista
                            </button>
                        </div>
                    </div>
                )}

                <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
                    <div className='rounded-lg bg-green-50 p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium text-green-700'>Renda Mensal</span>
                            <button onClick={() => onEdit(0)} className='text-green-600 hover:text-green-800'>
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <div className='text-2xl font-bold text-green-600'>{formatCurrency(currentIncome)}</div>
                        {isVariableIncome && (
                            <div className='mt-1 text-xs text-green-600'>
                                {scenario === 'pessimistic' ? 'Mínima' : 'Máxima'}
                            </div>
                        )}
                    </div>

                    <div className='rounded-lg bg-blue-50 p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium text-blue-700'>Gastos Fixos</span>
                            <button onClick={() => onEdit(1)} className='text-blue-600 hover:text-blue-800'>
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <div className='text-2xl font-bold text-blue-600'>{formatCurrency(totalExpenses)}</div>
                    </div>

                    <div className='rounded-lg bg-orange-50 p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium text-orange-700'>Parcelamentos</span>
                            <button onClick={() => onEdit(2)} className='text-orange-600 hover:text-orange-800'>
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <div className='text-2xl font-bold text-orange-600'>
                            {formatCurrency(totalMonthlyInstallments)}
                        </div>
                    </div>

                    <div className='rounded-lg bg-purple-50 p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium text-purple-700'>Meta Economia</span>
                            <button
                                onClick={() => setIsEditingSavings(true)}
                                className='text-purple-600 hover:text-purple-800'>
                                <Edit3 size={16} />
                            </button>
                        </div>
                        {isEditingSavings ? (
                            <input
                                type='text'
                                value={savingsInput}
                                onChange={(e) => setSavingsInput(e.target.value)}
                                onBlur={handleSavingsBlur}
                                onKeyDown={handleSavingsKeyDown}
                                className='w-full rounded border p-2 text-2xl font-bold text-purple-600'
                                autoFocus
                            />
                        ) : (
                            <div className='text-2xl font-bold text-purple-600'>{formatCurrency(data.savingsGoal)}</div>
                        )}
                        <div className='mt-1 text-xs text-purple-600'>
                            Clique no ícone de edição para ajustar sua meta
                        </div>
                    </div>

                    <div className={`rounded-lg p-4 ${isNegative ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className={`text-sm font-medium ${isNegative ? 'text-red-700' : 'text-gray-700'}`}>
                                Sobra Total
                            </span>
                        </div>
                        <div className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                            {formatCurrency(remaining)}
                        </div>
                    </div>
                </div>

                <div
                    className={`rounded-lg p-6 ${isNegative ? 'border-2 border-red-200 bg-red-50' : 'border-2 border-yellow-200 bg-yellow-50'}`}>
                    <div className='text-center'>
                        <div className={`mb-2 text-sm font-medium ${isNegative ? 'text-red-700' : 'text-yellow-700'}`}>
                            {isNegative ? 'ATENÇÃO: Orçamento no vermelho!' : 'Orçamento semanal para gastos livres'}
                        </div>
                        <div className={`text-4xl font-bold ${isNegative ? 'text-red-600' : 'text-yellow-600'}`}>
                            {formatCurrency(weeklyBudget)}
                        </div>
                        <div className={`mt-2 text-sm ${isNegative ? 'text-red-600' : 'text-yellow-600'}`}>
                            {isNegative
                                ? 'Seus gastos excedem sua renda. Revise seus valores acima.'
                                : 'por semana (5 semanas por mês)'}
                        </div>
                    </div>
                </div>

                {hasInstallments && !isNegative && (
                    <div className='mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-6'>
                        <div className='text-center'>
                            <div className='mb-2 flex items-center justify-center gap-2 text-sm font-medium text-green-700'>
                                <CreditCard size={16} />
                                Orçamento semanal após quitar parcelamentos
                            </div>
                            <div className='text-4xl font-bold text-green-600'>
                                {formatCurrency(futureWeeklyBudget)}
                            </div>
                            <div className='mt-2 text-sm text-green-600'>
                                Seu orçamento semanal aumentará quando todas as parcelas forem pagas
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className='rounded-lg bg-white p-6 shadow-lg'>
                <h3 className='mb-4 text-lg font-semibold text-gray-800'>Resumo dos Gastos Fixos</h3>
                <div className='space-y-3'>
                    {data.fixedExpenses.map((category, index) => {
                        const categoryTotal = category.items.reduce((sum, item) => sum + item.amount, 0);
                        if (categoryTotal === 0) return null;

                        return (
                            <div key={index} className='flex items-center justify-between rounded bg-gray-50 p-3'>
                                <span className='font-medium text-gray-700'>{category.category}</span>
                                <span className='font-semibold text-gray-800'>{formatCurrency(categoryTotal)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {hasInstallments && (
                <div className='rounded-lg bg-white p-6 shadow-lg'>
                    <h3 className='mb-4 text-lg font-semibold text-gray-800'>Resumo dos Parcelamentos</h3>
                    <div className='space-y-3'>
                        {data.installments.map((installment) => (
                            <div
                                key={installment.id}
                                className='flex items-center justify-between rounded bg-gray-50 p-3'>
                                <div>
                                    <span className='font-medium text-gray-700'>{installment.description}</span>
                                    <span className='ml-2 text-sm text-gray-500'>
                                        ({installment.remainingInstallments}x)
                                    </span>
                                </div>
                                <span className='font-semibold text-gray-800'>
                                    {formatCurrency(installment.monthlyAmount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
