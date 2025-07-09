'use client';

import React, { useEffect } from 'react';

import { Dashboard } from '@/components/Dashboard';
import { DataControls } from '@/components/DataControls';
import { ExpensesForm } from '@/components/ExpensesForm';
import { IncomeForm } from '@/components/IncomeForm';
import { InstallmentsForm } from '@/components/InstallmentsForm';
import { useLocalStorage } from '@/hooks/useLocalStorage';

import { FinancialContext } from '../context/FinancialContext';
import { FinancialData } from '../types';
import { defaultExpenseCategories } from '../utils/defaultExpenses';

// Valor inicial para novos usuários
const initialData: FinancialData = {
    income: { type: 'fixed' },
    fixedExpenses: defaultExpenseCategories,
    savingsGoal: 0,
    installments: []
};

const FinancialOrganizer = () => {
    const [step, setStep] = useLocalStorage('financial-organizer-step', 0);
    const [scenario, setScenario] = useLocalStorage<'optimistic' | 'pessimistic'>(
        'financial-organizer-scenario',
        'pessimistic'
    );
    const [data, setData] = useLocalStorage<FinancialData>('financial-organizer-data', initialData);

    const updateData = (newData: Partial<FinancialData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    const resetData = () => {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            setData(initialData);
            setStep(0);
            setScenario('pessimistic');
        }
    };

    const handleDataImported = () => {
        setStep(3); // Ir para o dashboard após importar
    };

    const steps = [
        { title: 'Renda', component: <IncomeForm onNext={() => setStep(1)} /> },
        {
            title: 'Gastos',
            component: <ExpensesForm onReset={resetData} onNext={() => setStep(2)} onBack={() => setStep(0)} />
        },
        {
            title: 'Parcelamentos',
            component: <InstallmentsForm onNext={() => setStep(3)} onBack={() => setStep(1)} />
        },
        {
            title: 'Resultado',
            component: <Dashboard onEdit={(editStep) => setStep(editStep)} onReset={resetData} />
        }
    ];

    return (
        <FinancialContext.Provider value={{ data, updateData, scenario, setScenario }}>
            <div className='min-h-screen bg-gray-100'>
                <header className='bg-white shadow-sm'>
                    <div className='mx-auto max-w-6xl px-6 py-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-800'>Organizador Financeiro</h1>
                                <p className='mt-1 text-gray-600'>
                                    Organize suas finanças de forma simples e eficiente
                                </p>
                            </div>
                            <DataControls onDataImported={handleDataImported} />
                        </div>
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
