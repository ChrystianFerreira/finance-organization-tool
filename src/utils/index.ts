import { ExpenseCategory } from '@/types';

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

export const calculateTotalExpenses = (expenses: ExpenseCategory[]): number => {
    return expenses.reduce((total, category) => {
        return total + category.items.reduce((catTotal, item) => catTotal + item.amount, 0);
    }, 0);
};

export const calculateWeeklyBudget = (income: number, expenses: number, savings: number): number => {
    const remaining = income - expenses - savings;

    return remaining / 5; // 5 semanas por mês
};
