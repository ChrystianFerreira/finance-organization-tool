export type ExpenseItem = {
    id: string;
    name: string;
    amount: number;
};

export type ExpenseCategory = {
    category: string;
    items: ExpenseItem[];
};

export type FinancialData = {
    income: {
        type: 'fixed' | 'variable';
        fixedAmount?: number;
        minAmount?: number;
        maxAmount?: number;
    };
    fixedExpenses: ExpenseCategory[];
    savingsGoal: number;
};
