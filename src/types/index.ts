export type ExpenseItem = {
    id: string;
    name: string;
    amount: number;
};

export type ExpenseCategory = {
    category: string;
    items: ExpenseItem[];
};

export type Installment = {
    id: string;
    description: string;
    totalAmount: number;
    remainingInstallments: number;
    monthlyAmount: number;
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
    installments: Installment[];
};

export type CsvTransaction = {
    date: string;
    title: string;
    amount: number;
    fingerprint: string;
};

export type CategorizedTransaction = {
    id: string;
    date: string;
    title: string;
    amount: number;
    fingerprint: string;
    categoryName: string | 'weekly_budget' | 'unplanned' | 'skipped';
    itemId: string | null;
    categoryLabel: string;
    batchId: string;
};

export type TitleMapping = {
    titleNormalized: string;
    categoryName: string;
    itemId: string | null;
    categoryLabel: string;
};

export type TrackingData = {
    transactions: CategorizedTransaction[];
    titleMappings: TitleMapping[];
};
