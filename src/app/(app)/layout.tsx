'use client';

import { type ReactNode } from 'react';

import { FinancialContext } from '@/context/FinancialContext';
import { TrackingContext } from '@/context/TrackingContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FinancialData, TrackingData } from '@/types';
import { defaultExpenseCategories } from '@/utils/defaultExpenses';

const initialData: FinancialData = {
    income: { type: 'fixed' },
    fixedExpenses: defaultExpenseCategories,
    savingsGoal: 0,
    installments: []
};

const initialTracking: TrackingData = {
    transactions: [],
    titleMappings: []
};

const AppLayout = ({ children }: { children: ReactNode }) => {
    const [scenario, setScenario] = useLocalStorage<'optimistic' | 'pessimistic'>(
        'financial-organizer-scenario',
        'pessimistic'
    );
    const [data, setData] = useLocalStorage<FinancialData>('financial-organizer-data', initialData);
    const [trackingData, setTrackingData] = useLocalStorage<TrackingData>(
        'financial-organizer-tracking',
        initialTracking
    );

    const updateData = (newData: Partial<FinancialData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    return (
        <FinancialContext.Provider value={{ data, updateData, scenario, setScenario }}>
            <TrackingContext.Provider value={{ trackingData, setTrackingData }}>{children}</TrackingContext.Provider>
        </FinancialContext.Provider>
    );
};

export default AppLayout;
