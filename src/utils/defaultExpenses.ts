import { ExpenseCategory } from '@/types';

import { v4 as uuidv4 } from 'uuid';

export const defaultExpenseCategories: ExpenseCategory[] = [
    {
        category: 'Assinaturas',
        items: [
            { id: uuidv4(), name: 'iCloud', amount: 0 },
            { id: uuidv4(), name: 'Max', amount: 0 },
            { id: uuidv4(), name: 'Apple TV', amount: 0 },
            { id: uuidv4(), name: 'Netflix', amount: 0 },
            { id: uuidv4(), name: 'Clube de café', amount: 0 },
            { id: uuidv4(), name: 'Petz', amount: 0 }
        ]
    },
    {
        category: 'Essenciais',
        items: [
            { id: uuidv4(), name: 'Internet', amount: 0 },
            { id: uuidv4(), name: 'Mercado', amount: 0 },
            { id: uuidv4(), name: 'Aluguel ou Financiamento', amount: 0 }
        ]
    },
    {
        category: 'Utilidades',
        items: [
            { id: uuidv4(), name: 'Farmácia', amount: 0 },
            { id: uuidv4(), name: 'Cortes de cabelo', amount: 0 },
            { id: uuidv4(), name: 'Plano de celular', amount: 0 },
            { id: uuidv4(), name: 'Gás (1/3 do valor)', amount: 0 }
        ]
    },
    {
        category: 'Transporte',
        items: [
            { id: uuidv4(), name: 'Financiamento do carro', amount: 0 },
            { id: uuidv4(), name: 'Gasolina', amount: 0 }
        ]
    },
    {
        category: 'Saúde',
        items: [
            { id: uuidv4(), name: 'Plano de saúde', amount: 0 },
            { id: uuidv4(), name: 'Farmácia', amount: 0 }
        ]
    },
    { category: 'Outros', items: [] }
];
