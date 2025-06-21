'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import {
    Calculator,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Edit3,
    Plus,
    Receipt,
    Target,
    Trash2,
    TrendingDown,
    TrendingUp
} from 'lucide-react';

// Types
interface ExpenseItem {
    id: string;
    name: string;
    amount: number;
}

interface ExpenseCategory {
    category: string;
    items: ExpenseItem[];
}

interface FinancialData {
    income: {
        type: 'fixed' | 'variable';
        fixedAmount?: number;
        minAmount?: number;
        maxAmount?: number;
    };
    fixedExpenses: ExpenseCategory[];
    savingsGoal: number;
}

// Utility functions
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

const calculateTotalExpenses = (expenses: ExpenseCategory[]): number => {
    return expenses.reduce((total, category) => {
        return total + category.items.reduce((catTotal, item) => catTotal + item.amount, 0);
    }, 0);
};

const calculateWeeklyBudget = (income: number, expenses: number, savings: number): number => {
    const remaining = income - expenses - savings;

    return remaining / 5; // 5 semanas por mês
};

// Context
const FinancialContext = createContext<{
    data: FinancialData;
    updateData: (newData: Partial<FinancialData>) => void;
    scenario: 'optimistic' | 'pessimistic';
    setScenario: (scenario: 'optimistic' | 'pessimistic') => void;
} | null>(null);

const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) throw new Error('useFinancial must be used within FinancialProvider');

    return context;
};

// Default expense categories
const defaultCategories: ExpenseCategory[] = [
    { category: 'Habitação', items: [] },
    { category: 'Utilidades', items: [] },
    { category: 'Transporte', items: [] },
    { category: 'Essenciais', items: [] },
    { category: 'Assinaturas', items: [] },
    { category: 'Saúde', items: [] },
    { category: 'Outros', items: [] }
];

// Components
const IncomeForm = ({ onNext }: { onNext: () => void }) => {
    const { data, updateData } = useFinancial();
    const [incomeType, setIncomeType] = useState<'fixed' | 'variable'>(data.income.type);
    const [fixedAmount, setFixedAmount] = useState(data.income.fixedAmount?.toString() || '');
    const [minAmount, setMinAmount] = useState(data.income.minAmount?.toString() || '');
    const [maxAmount, setMaxAmount] = useState(data.income.maxAmount?.toString() || '');

    const handleSubmit = () => {
        const incomeData = {
            type: incomeType,
            ...(incomeType === 'fixed'
                ? { fixedAmount: parseCurrency(fixedAmount) }
                : {
                      minAmount: parseCurrency(minAmount),
                      maxAmount: parseCurrency(maxAmount)
                  })
        };

        updateData({ income: incomeData });
        onNext();
    };

    const isValid =
        incomeType === 'fixed'
            ? parseCurrency(fixedAmount) > 0
            : parseCurrency(minAmount) > 0 && parseCurrency(maxAmount) > parseCurrency(minAmount);

    return (
        <div className='mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg'>
            <div className='mb-6 flex items-center gap-3'>
                <DollarSign className='text-green-600' size={24} />
                <h2 className='text-2xl font-bold text-gray-800'>Qual é sua renda mensal?</h2>
            </div>

            <div className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                    <button
                        onClick={() => setIncomeType('fixed')}
                        className={`rounded-lg border-2 p-4 transition-colors ${
                            incomeType === 'fixed'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='font-semibold'>Renda Fixa</div>
                        <div className='text-sm text-gray-600'>Mesmo valor todo mês</div>
                    </button>

                    <button
                        onClick={() => setIncomeType('variable')}
                        className={`rounded-lg border-2 p-4 transition-colors ${
                            incomeType === 'variable'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className='font-semibold'>Renda Variável</div>
                        <div className='text-sm text-gray-600'>Varia mensalmente</div>
                    </button>
                </div>

                {incomeType === 'fixed' ? (
                    <div>
                        <label className='mb-2 block text-sm font-medium text-gray-700'>Valor mensal líquido</label>
                        <input
                            type='text'
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(e.target.value)}
                            placeholder='R$ 0,00'
                            className='w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                        />
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div>
                            <label className='mb-2 block text-sm font-medium text-gray-700'>Renda mínima mensal</label>
                            <input
                                type='text'
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                placeholder='R$ 0,00'
                                className='w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                            />
                        </div>

                        <div>
                            <label className='mb-2 block text-sm font-medium text-gray-700'>Renda máxima mensal</label>
                            <input
                                type='text'
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                placeholder='R$ 0,00'
                                className='w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-500'
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className='w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
                    Continuar
                </button>
            </div>
        </div>
    );
};

const ExpensesForm = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
    const { data, updateData } = useFinancial();
    const [expenses, setExpenses] = useState<ExpenseCategory[]>(
        data.fixedExpenses.length > 0 ? data.fixedExpenses : defaultCategories
    );

    const addExpenseItem = (categoryIndex: number) => {
        const newExpenses = [...expenses];
        newExpenses[categoryIndex].items.push({
            id: Date.now().toString(),
            name: '',
            amount: 0
        });
        setExpenses(newExpenses);
    };

    const updateExpenseItem = (
        categoryIndex: number,
        itemIndex: number,
        field: 'name' | 'amount',
        value: string | number
    ) => {
        const newExpenses = [...expenses];
        if (field === 'name') {
            newExpenses[categoryIndex].items[itemIndex].name = value as string;
        } else {
            newExpenses[categoryIndex].items[itemIndex].amount =
                typeof value === 'string' ? parseCurrency(value) : value;
        }
        setExpenses(newExpenses);
    };

    const removeExpenseItem = (categoryIndex: number, itemIndex: number) => {
        const newExpenses = [...expenses];
        newExpenses[categoryIndex].items.splice(itemIndex, 1);
        setExpenses(newExpenses);
    };

    const handleSubmit = () => {
        updateData({ fixedExpenses: expenses });
        onNext();
    };

    const totalExpenses = calculateTotalExpenses(expenses);

    return (
        <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg'>
            <div className='mb-6 flex items-center gap-3'>
                <Receipt className='text-blue-600' size={24} />
                <h2 className='text-2xl font-bold text-gray-800'>Gastos Fixos Mensais</h2>
            </div>

            <div className='space-y-6'>
                {expenses.map((category, categoryIndex) => (
                    <div key={category.category} className='rounded-lg border border-gray-200 p-4'>
                        <div className='mb-4 flex items-center justify-between'>
                            <h3 className='text-lg font-semibold text-gray-700'>{category.category}</h3>
                            <button
                                onClick={() => addExpenseItem(categoryIndex)}
                                className='flex items-center gap-2 font-medium text-green-600 hover:text-green-700'>
                                <Plus size={16} />
                                Adicionar
                            </button>
                        </div>

                        <div className='space-y-3'>
                            {category.items.map((item, itemIndex) => (
                                <div key={item.id} className='flex items-center gap-3'>
                                    <input
                                        type='text'
                                        placeholder='Nome do gasto'
                                        value={item.name}
                                        onChange={(e) =>
                                            updateExpenseItem(categoryIndex, itemIndex, 'name', e.target.value)
                                        }
                                        className='flex-1 rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                    />
                                    <input
                                        type='text'
                                        placeholder='R$ 0,00'
                                        value={item.amount > 0 ? item.amount.toString() : ''}
                                        onChange={(e) =>
                                            updateExpenseItem(categoryIndex, itemIndex, 'amount', e.target.value)
                                        }
                                        className='w-32 rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                    />
                                    <button
                                        onClick={() => removeExpenseItem(categoryIndex, itemIndex)}
                                        className='text-red-500 hover:text-red-700'>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            {category.items.length === 0 && (
                                <div className='py-4 text-center text-gray-500'>
                                    Nenhum gasto adicionado nesta categoria
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className='rounded-lg bg-gray-50 p-4'>
                    <div className='flex items-center justify-between'>
                        <span className='text-lg font-semibold text-gray-700'>Total de Gastos Fixos:</span>
                        <span className='text-2xl font-bold text-blue-600'>{formatCurrency(totalExpenses)}</span>
                    </div>
                </div>

                <div className='flex gap-4'>
                    <button
                        onClick={onBack}
                        className='flex-1 rounded-lg bg-gray-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-600'>
                        Voltar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className='flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700'>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

const SavingsGoalForm = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
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

const Dashboard = ({ onEdit }: { onEdit: (step: number) => void }) => {
    const { data, scenario, setScenario } = useFinancial();

    const totalExpenses = calculateTotalExpenses(data.fixedExpenses);

    const getCurrentIncome = () => {
        if (data.income.type === 'fixed') {
            return data.income.fixedAmount || 0;
        }

        return scenario === 'pessimistic' ? data.income.minAmount || 0 : data.income.maxAmount || 0;
    };

    const currentIncome = getCurrentIncome();
    const remaining = currentIncome - totalExpenses - data.savingsGoal;
    const weeklyBudget = calculateWeeklyBudget(currentIncome, totalExpenses, data.savingsGoal);

    const isVariableIncome = data.income.type === 'variable';
    const isNegative = remaining < 0;

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

                <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
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

                    <div className='rounded-lg bg-purple-50 p-4'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm font-medium text-purple-700'>Meta Economia</span>
                            <button onClick={() => onEdit(2)} className='text-purple-600 hover:text-purple-800'>
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <div className='text-2xl font-bold text-purple-600'>{formatCurrency(data.savingsGoal)}</div>
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
        </div>
    );
};

// Main App Component
const FinancialOrganizer = () => {
    const [step, setStep] = useState(0);
    const [scenario, setScenario] = useState<'optimistic' | 'pessimistic'>('pessimistic');
    const [data, setData] = useState<FinancialData>({
        income: { type: 'fixed' },
        fixedExpenses: [],
        savingsGoal: 0
    });

    const updateData = (newData: Partial<FinancialData>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    const steps = [
        { title: 'Renda', component: <IncomeForm onNext={() => setStep(1)} /> },
        { title: 'Gastos', component: <ExpensesForm onNext={() => setStep(2)} onBack={() => setStep(0)} /> },
        { title: 'Economia', component: <SavingsGoalForm onNext={() => setStep(3)} onBack={() => setStep(1)} /> },
        { title: 'Resultado', component: <Dashboard onEdit={(editStep) => setStep(editStep)} /> }
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
