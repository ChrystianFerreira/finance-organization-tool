'use client';

import React, { useState } from 'react';

import { Dashboard } from '@/components/Dashboard';
import { ExpensesForm } from '@/components/ExpensesForm';
import { IncomeForm } from '@/components/IncomeForm';
import { SavingsGoalForm } from '@/components/SavingsGoalForm';
import { useLocalStorage } from '@/hooks/useLocalStorage';

import { FinancialContext } from '../context/FinancialContext';
import { FinancialData } from '../types';

const FinancialOrganizer = () => {
    const [step, setStep] = useLocalStorage('financial-organizer-step', 0);
    const [scenario, setScenario] = useLocalStorage<'optimistic' | 'pessimistic'>(
        'financial-organizer-scenario',
        'pessimistic'
    );
    const [data, setData] = useLocalStorage<FinancialData>('financial-organizer-data', {
        income: { type: 'fixed' },
        fixedExpenses: [],
        savingsGoal: 0
    });
    const updateData = (newData: Partial<FinancialData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    const resetData = () => {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            setData({
                income: { type: 'fixed' },
                fixedExpenses: [],
                savingsGoal: 0
            });
            setStep(0);
            setScenario('pessimistic');
        }
    };

    const steps = [
        { title: 'Renda', component: <IncomeForm onNext={() => setStep(1)} /> },
        {
            title: 'Gastos',
            component: <ExpensesForm onReset={resetData} onNext={() => setStep(2)} onBack={() => setStep(0)} />
        },
        { title: 'Economia', component: <SavingsGoalForm onNext={() => setStep(3)} onBack={() => setStep(1)} /> },
        { title: 'Resultado', component: <Dashboard onEdit={(editStep) => setStep(editStep)} onReset={resetData} /> }
    ];

    return (
        <FinancialContext.Provider value={{ data, updateData, scenario, setScenario }}>
            <div className='min-h-screen bg-gray-100'>
                <header className='bg-white shadow-sm'>
                    <div className='mx-auto max-w-6xl px-6 py-4'>
                        <h1 className='text-3xl font-bold text-gray-800'>Organizador Financeiro</h1>
                        <p className='mt-1 text-gray-600'>Organize suas finanças de forma simples e eficiente</p>
                    </div>
                </header>

                <main className='py-8'>
                    <div className='mx-auto max-w-6xl px-6'>
                        {step < 3 && (
                            <div className='mb-8'>
                                <div className='mb-4 flex items-center justify-between'>
                                    {steps.slice(0, 3).map((s, index) => (
                                        <div key={index} className='flex items-center'>
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                                    index <= step
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span
                                                className={`ml-2 text-sm ${index <= step ? 'text-green-600' : 'text-gray-400'}`}>
                                                {s.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className='h-2 w-full rounded-full bg-gray-200'>
                                    <div
                                        className='h-2 rounded-full bg-green-600 transition-all duration-300'
                                        style={{ width: `${((step + 1) / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {steps[step].component}
                    </div>
                </main>
            </div>
        </FinancialContext.Provider>
    );
};

export default FinancialOrganizer;
