import { createContext, useContext } from 'react';

import { FinancialData } from '@/types';

export const FinancialContext = createContext<{
    data: FinancialData;
    updateData: (newData: Partial<FinancialData>) => void;
    scenario: 'optimistic' | 'pessimistic';
    setScenario: (scenario: 'optimistic' | 'pessimistic') => void;
} | null>(null);

export const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) throw new Error('useFinancial must be used within FinancialProvider');

    return context;
};
