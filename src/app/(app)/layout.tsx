'use client';

import { type ReactNode } from 'react';

import { FinancialContext } from '@/context/FinancialContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FinancialData } from '@/types';
import { defaultExpenseCategories } from '@/utils/defaultExpenses';

const initialData: FinancialData = {
    income: { type: 'fixed' },
    fixedExpenses: defaultExpenseCategories,
    savingsGoal: 0,
    installments: []
};

const AppLayout = ({ children }: { children: ReactNode }) => {
    const [scenario, setScenario] = useLocalStorage<'optimistic' | 'pessimistic'>(
        'financial-organizer-scenario',
        'pessimistic'
    );
    const [data, setData] = useLocalStorage<FinancialData>('financial-organizer-data', initialData);

    const updateData = (newData: Partial<FinancialData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    return (
        <FinancialContext.Provider value={{ data, updateData, scenario, setScenario }}>
            {children}
        </FinancialContext.Provider>
    );
};

export default AppLayout;
