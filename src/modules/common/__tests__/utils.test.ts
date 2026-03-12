import {
    calculateTotalExpenses,
    calculateWeeklyBudget,
    formatCurrency,
    getSelectableMonths,
    parseCurrency
} from '../utils/index';

describe('formatCurrency', () => {
    it('should format a positive number as BRL', () => {
        expect(formatCurrency(1500)).toBe('R$\u00a01.500,00');
    });

    it('should format zero', () => {
        expect(formatCurrency(0)).toBe('R$\u00a00,00');
    });

    it('should format negative numbers', () => {
        expect(formatCurrency(-250.5)).toBe('-R$\u00a0250,50');
    });

    it('should format decimal values with two decimal places', () => {
        expect(formatCurrency(99.9)).toBe('R$\u00a099,90');
    });
});

describe('parseCurrency', () => {
    it('should parse a BRL formatted string', () => {
        expect(parseCurrency('R$ 1.500,00')).toBe(1500);
    });

    it('should parse a simple comma decimal string', () => {
        expect(parseCurrency('250,50')).toBe(250.5);
    });

    it('should return 0 for empty string', () => {
        expect(parseCurrency('')).toBe(0);
    });

    it('should return 0 for invalid string', () => {
        expect(parseCurrency('abc')).toBe(0);
    });

    it('should parse millions correctly', () => {
        expect(parseCurrency('R$ 1.500.000,00')).toBe(1500000);
    });

    it('should parse value without decimal separator', () => {
        expect(parseCurrency('1500')).toBe(1500);
    });
});

describe('calculateTotalExpenses', () => {
    it('should sum items across multiple categories', () => {
        const expenses = [
            {
                category: 'Moradia',
                items: [
                    { id: '1', name: 'Aluguel', amount: 2000 },
                    { id: '2', name: 'Condominio', amount: 500 }
                ]
            },
            {
                category: 'Transporte',
                items: [{ id: '3', name: 'Combustivel', amount: 300 }]
            }
        ];

        expect(calculateTotalExpenses(expenses)).toBe(2800);
    });

    it('should return 0 for empty array', () => {
        expect(calculateTotalExpenses([])).toBe(0);
    });

    it('should handle categories with no items', () => {
        const expenses = [{ category: 'Vazia', items: [] }];

        expect(calculateTotalExpenses(expenses)).toBe(0);
    });
});

describe('calculateWeeklyBudget', () => {
    it('should calculate (income - expenses - savings) / 5', () => {
        expect(calculateWeeklyBudget(5000, 3000, 500)).toBe(300);
    });

    it('should return negative when expenses exceed income', () => {
        expect(calculateWeeklyBudget(2000, 3000, 500)).toBe(-300);
    });

    it('should return 0 when income equals expenses + savings', () => {
        expect(calculateWeeklyBudget(3000, 2500, 500)).toBe(0);
    });
});

describe('getSelectableMonths', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-15'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should include months from current year up to current month', () => {
        const result = getSelectableMonths([]);

        expect(result).toHaveLength(6);
        expect(result[0]).toBe('2025-06');
        expect(result[result.length - 1]).toBe('2025-01');
    });

    it('should include extra months from data that are not in current year', () => {
        const result = getSelectableMonths(['2024-06', '2024-11']);

        expect(result).toContain('2024-06');
        expect(result).toContain('2024-11');
    });

    it('should be sorted in descending order', () => {
        const result = getSelectableMonths(['2024-01']);

        for (let i = 0; i < result.length - 1; i++) {
            expect(result[i] > result[i + 1]).toBe(true);
        }
    });

    it('should not duplicate months already in current year', () => {
        const result = getSelectableMonths(['2025-06']);
        const occurrences = result.filter((m) => m === '2025-06');

        expect(occurrences).toHaveLength(1);
    });
});
