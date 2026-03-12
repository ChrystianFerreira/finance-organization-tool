import { useState } from 'react';

import { CurrencyInput } from '@/modules/common/components/CurrencyInput';
import { useFinancial } from '@/modules/common/context/FinancialContext';
import { ExpenseCategory } from '@/modules/common/types';
import { calculateTotalExpenses } from '@/modules/common/utils';

import { Plus, Receipt, Trash2 } from 'lucide-react';

const defaultCategories: ExpenseCategory[] = [
    { category: 'Habitação', items: [] },
    { category: 'Utilidades', items: [] },
    { category: 'Transporte', items: [] },
    { category: 'Essenciais', items: [] },
    { category: 'Assinaturas', items: [] },
    { category: 'Saúde', items: [] },
    { category: 'Outros', items: [] }
];

export const ExpensesForm = ({
    onNext,
    onBack,
    onReset
}: {
    onNext: () => void;
    onBack: () => void;
    onReset: () => void;
}) => {
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
            newExpenses[categoryIndex].items[itemIndex].amount = typeof value === 'number' ? value : 0;
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
                                    <CurrencyInput
                                        value={typeof item.amount === 'number' ? item.amount : 0}
                                        onValueChange={(val) =>
                                            updateExpenseItem(
                                                categoryIndex,
                                                itemIndex,
                                                'amount',
                                                typeof val === 'number' ? val : 0
                                            )
                                        }
                                        placeholder='R$ 0,00'
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
                        <span className='text-2xl font-bold text-blue-600'>{totalExpenses}</span>
                    </div>
                </div>

                <div className='mt-8 flex items-center justify-between'>
                    <button
                        onClick={onBack}
                        className='rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:text-gray-800'>
                        Voltar
                    </button>
                    <div className='text-lg font-semibold text-gray-700'>
                        Total:{' '}
                        <span className='text-blue-600'>
                            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className='rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700'>
                        Continuar
                    </button>
                </div>
                <button
                    onClick={onReset}
                    className='mt-4 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-red-600 hover:bg-red-100'>
                    Limpar todos os dados
                </button>
            </div>
        </div>
    );
};
