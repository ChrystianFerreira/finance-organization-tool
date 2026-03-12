// @vitest-environment jsdom
import { ReactNode, createElement } from 'react';

import { TrackingContext, TrackingContextType } from '@/modules/expenses/context/TrackingContext';
import { useTracking } from '@/modules/expenses/hooks/useTracking';
import { CategorizedTransaction, TitleMapping, TrackingData } from '@/modules/expenses/types';
import { act, renderHook } from '@testing-library/react';

function createTransaction(overrides: Partial<CategorizedTransaction> = {}): CategorizedTransaction {
    return {
        id: 'txn-1',
        date: '2025-01-15',
        title: 'Supermercado',
        amount: 100,
        fingerprint: '2025-01-15|supermercado|100.00',
        categoryName: 'alimentacao',
        itemId: 'item-1',
        categoryLabel: 'Alimentacao',
        batchId: 'batch-1',
        ...overrides
    };
}

// Note: This wrapper uses mutable state outside React's lifecycle.
// After act() calls (saveBatch, clearMonth), use getData() to inspect
// the updated state — result.current.trackingData will be stale.
function createWrapper(initialData: TrackingData) {
    let currentData = initialData;
    const setTrackingData: TrackingContextType['setTrackingData'] = (value) => {
        if (typeof value === 'function') {
            currentData = value(currentData);
        } else {
            currentData = value;
        }
    };

    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(TrackingContext.Provider, { value: { trackingData: currentData, setTrackingData } }, children);

    return { wrapper, getData: () => currentData };
}

describe('useTracking - getSpentByItem', () => {
    it('should sum amounts by itemId for the given month', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ itemId: 'item-1', amount: 100 }),
                createTransaction({ id: 'txn-2', itemId: 'item-1', amount: 50 }),
                createTransaction({ id: 'txn-3', itemId: 'item-2', amount: 200 })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const spent = result.current.getSpentByItem('2025-01');

        expect(spent['item-1']).toBe(150);
        expect(spent['item-2']).toBe(200);
    });

    it('should ignore special categories (skipped, weekly_budget, unplanned)', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ categoryName: 'skipped', amount: 100 }),
                createTransaction({ id: 'txn-2', categoryName: 'weekly_budget', amount: 200 }),
                createTransaction({ id: 'txn-3', categoryName: 'unplanned', amount: 300 }),
                createTransaction({ id: 'txn-4', categoryName: 'alimentacao', amount: 50 })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const spent = result.current.getSpentByItem('2025-01');

        expect(Object.keys(spent)).toHaveLength(1);
        expect(spent['item-1']).toBe(50);
    });

    it('should ignore transactions with null itemId', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ itemId: null, amount: 100 }),
                createTransaction({ id: 'txn-2', itemId: 'item-1', amount: 50 })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const spent = result.current.getSpentByItem('2025-01');

        expect(Object.keys(spent)).toHaveLength(1);
        expect(spent['item-1']).toBe(50);
    });

    it('should filter by month', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ date: '2025-01-15', amount: 100 }),
                createTransaction({ id: 'txn-2', date: '2025-02-10', amount: 200 })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        expect(result.current.getSpentByItem('2025-01')['item-1']).toBe(100);
        expect(result.current.getSpentByItem('2025-02')['item-1']).toBe(200);
    });
});

describe('useTracking - getWeeklyBudgetSpent', () => {
    it('should sum only weekly_budget transactions for the month', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ categoryName: 'weekly_budget', amount: 150 }),
                createTransaction({ id: 'txn-2', categoryName: 'weekly_budget', amount: 100 }),
                createTransaction({ id: 'txn-3', categoryName: 'alimentacao', amount: 500 })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        expect(result.current.getWeeklyBudgetSpent('2025-01')).toBe(250);
    });

    it('should return 0 when no weekly_budget transactions exist', () => {
        const data: TrackingData = {
            transactions: [createTransaction({ categoryName: 'alimentacao', amount: 100 })],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        expect(result.current.getWeeklyBudgetSpent('2025-01')).toBe(0);
    });
});

describe('useTracking - getUnplannedSpent', () => {
    it('should sum only unplanned transactions for the month', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ categoryName: 'unplanned', amount: 80 }),
                createTransaction({ id: 'txn-2', categoryName: 'unplanned', amount: 120 }),
                createTransaction({ id: 'txn-3', categoryName: 'alimentacao', amount: 500 })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        expect(result.current.getUnplannedSpent('2025-01')).toBe(200);
    });
});

describe('useTracking - getAvailableMonths', () => {
    it('should return unique months sorted descending', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ date: '2025-01-10' }),
                createTransaction({ id: 'txn-2', date: '2025-03-05' }),
                createTransaction({ id: 'txn-3', date: '2025-01-20' }),
                createTransaction({ id: 'txn-4', date: '2025-02-15' })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        expect(result.current.getAvailableMonths()).toEqual(['2025-03', '2025-02', '2025-01']);
    });

    it('should exclude skipped transactions', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ date: '2025-01-10', categoryName: 'alimentacao' }),
                createTransaction({ id: 'txn-2', date: '2025-02-05', categoryName: 'skipped' })
            ],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        expect(result.current.getAvailableMonths()).toEqual(['2025-01']);
    });
});

describe('useTracking - applyAutoMappings', () => {
    it('should map transactions with known titles', () => {
        const mapping: TitleMapping = {
            titleNormalized: 'supermercado extra',
            categoryName: 'alimentacao',
            itemId: 'item-1',
            categoryLabel: 'Alimentacao'
        };

        const data: TrackingData = {
            transactions: [],
            titleMappings: [mapping]
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const transactions = [{ date: '2025-01-15', title: 'Supermercado Extra', amount: 150, fingerprint: 'fp1' }];

        const mapped = result.current.applyAutoMappings(transactions);

        expect(mapped[0].suggestedCategoryName).toBe('alimentacao');
        expect(mapped[0].suggestedItemId).toBe('item-1');
        expect(mapped[0].suggestedCategoryLabel).toBe('Alimentacao');
        expect(mapped[0].isAutoMapped).toBe(true);
    });

    it('should return null suggestions for unknown titles', () => {
        const data: TrackingData = {
            transactions: [],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const transactions = [{ date: '2025-01-15', title: 'Loja Desconhecida', amount: 50, fingerprint: 'fp1' }];

        const mapped = result.current.applyAutoMappings(transactions);

        expect(mapped[0].suggestedCategoryName).toBeNull();
        expect(mapped[0].suggestedItemId).toBeNull();
        expect(mapped[0].isAutoMapped).toBe(false);
    });

    it('should match case-insensitively', () => {
        const mapping: TitleMapping = {
            titleNormalized: 'uber trip',
            categoryName: 'transporte',
            itemId: 'item-2',
            categoryLabel: 'Transporte'
        };

        const data: TrackingData = {
            transactions: [],
            titleMappings: [mapping]
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const transactions = [{ date: '2025-01-15', title: '  UBER TRIP  ', amount: 25, fingerprint: 'fp1' }];

        const mapped = result.current.applyAutoMappings(transactions);

        expect(mapped[0].isAutoMapped).toBe(true);
        expect(mapped[0].suggestedCategoryName).toBe('transporte');
    });
});

describe('useTracking - filterNewTransactions', () => {
    it('should separate new from already imported transactions', () => {
        const existing = createTransaction({
            fingerprint: '2025-01-15|supermercado|100.00'
        });

        const data: TrackingData = {
            transactions: [existing],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const parsed = [
            { date: '2025-01-15', title: 'Supermercado', amount: 100, fingerprint: '2025-01-15|supermercado|100.00' },
            { date: '2025-01-16', title: 'Farmacia', amount: 45, fingerprint: '2025-01-16|farmacia|45.00' }
        ];

        const { newTransactions, alreadyImported } = result.current.filterNewTransactions(parsed);

        expect(newTransactions).toHaveLength(1);
        expect(newTransactions[0].title).toBe('Farmacia');
        expect(alreadyImported).toHaveLength(1);
        expect(alreadyImported[0].title).toBe('Supermercado');
    });

    it('should handle partial duplicates correctly', () => {
        const existing = createTransaction({
            fingerprint: '2025-01-15|compra|50.00'
        });

        const data: TrackingData = {
            transactions: [existing],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const parsed = [
            { date: '2025-01-15', title: 'Compra', amount: 50, fingerprint: '2025-01-15|compra|50.00' },
            { date: '2025-01-15', title: 'Compra', amount: 50, fingerprint: '2025-01-15|compra|50.00' }
        ];

        const { newTransactions, alreadyImported } = result.current.filterNewTransactions(parsed);

        expect(alreadyImported).toHaveLength(1);
        expect(newTransactions).toHaveLength(1);
    });

    it('should handle N-to-M duplicates correctly (2 existing, 3 in CSV)', () => {
        const fp = '2025-01-15|compra|50.00';
        const data: TrackingData = {
            transactions: [createTransaction({ fingerprint: fp }), createTransaction({ id: 'txn-2', fingerprint: fp })],
            titleMappings: []
        };

        const { wrapper } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const parsed = [
            { date: '2025-01-15', title: 'Compra', amount: 50, fingerprint: fp },
            { date: '2025-01-15', title: 'Compra', amount: 50, fingerprint: fp },
            { date: '2025-01-15', title: 'Compra', amount: 50, fingerprint: fp }
        ];

        const { newTransactions, alreadyImported } = result.current.filterNewTransactions(parsed);

        expect(alreadyImported).toHaveLength(2);
        expect(newTransactions).toHaveLength(1);
    });
});

describe('useTracking - saveBatch', () => {
    it('should add transactions and new mappings', () => {
        const data: TrackingData = {
            transactions: [],
            titleMappings: []
        };

        const { wrapper, getData } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const newTxn = createTransaction();
        const newMapping: TitleMapping = {
            titleNormalized: 'supermercado',
            categoryName: 'alimentacao',
            itemId: 'item-1',
            categoryLabel: 'Alimentacao'
        };

        act(() => {
            result.current.saveBatch([newTxn], [newMapping]);
        });

        const updated = getData();

        expect(updated.transactions).toHaveLength(1);
        expect(updated.titleMappings).toHaveLength(1);
    });

    it('should append to pre-existing transactions without replacing them', () => {
        const existingTxn = createTransaction({ id: 'existing-1', title: 'Existing' });
        const data: TrackingData = {
            transactions: [existingTxn],
            titleMappings: []
        };

        const { wrapper, getData } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const newTxn = createTransaction({ id: 'new-1', title: 'New' });

        act(() => {
            result.current.saveBatch([newTxn], []);
        });

        const updated = getData();

        expect(updated.transactions).toHaveLength(2);
        expect(updated.transactions[0].id).toBe('existing-1');
        expect(updated.transactions[1].id).toBe('new-1');
    });

    it('should update existing mappings instead of duplicating', () => {
        const existingMapping: TitleMapping = {
            titleNormalized: 'supermercado',
            categoryName: 'old-category',
            itemId: 'old-item',
            categoryLabel: 'Old'
        };

        const data: TrackingData = {
            transactions: [],
            titleMappings: [existingMapping]
        };

        const { wrapper, getData } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        const updatedMapping: TitleMapping = {
            titleNormalized: 'supermercado',
            categoryName: 'alimentacao',
            itemId: 'item-1',
            categoryLabel: 'Alimentacao'
        };

        act(() => {
            result.current.saveBatch([], [updatedMapping]);
        });

        const updated = getData();

        expect(updated.titleMappings).toHaveLength(1);
        expect(updated.titleMappings[0].categoryName).toBe('alimentacao');
    });
});

describe('useTracking - clearMonth', () => {
    it('should remove all transactions for the specified month', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ date: '2025-01-10' }),
                createTransaction({ id: 'txn-2', date: '2025-01-25' }),
                createTransaction({ id: 'txn-3', date: '2025-02-05' })
            ],
            titleMappings: []
        };

        const { wrapper, getData } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        act(() => {
            result.current.clearMonth('2025-01');
        });

        const updated = getData();

        expect(updated.transactions).toHaveLength(1);
        expect(updated.transactions[0].date).toBe('2025-02-05');
    });

    it('should preserve titleMappings when clearing a month', () => {
        const mapping: TitleMapping = {
            titleNormalized: 'supermercado',
            categoryName: 'alimentacao',
            itemId: 'item-1',
            categoryLabel: 'Alimentacao'
        };
        const data: TrackingData = {
            transactions: [createTransaction({ date: '2025-01-10' })],
            titleMappings: [mapping]
        };

        const { wrapper, getData } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        act(() => {
            result.current.clearMonth('2025-01');
        });

        const updated = getData();

        expect(updated.transactions).toHaveLength(0);
        expect(updated.titleMappings).toHaveLength(1);
        expect(updated.titleMappings[0].titleNormalized).toBe('supermercado');
    });

    it('should keep transactions from other months', () => {
        const data: TrackingData = {
            transactions: [
                createTransaction({ date: '2025-01-10' }),
                createTransaction({ id: 'txn-2', date: '2025-02-05' }),
                createTransaction({ id: 'txn-3', date: '2025-03-15' })
            ],
            titleMappings: []
        };

        const { wrapper, getData } = createWrapper(data);
        const { result } = renderHook(() => useTracking(), { wrapper });

        act(() => {
            result.current.clearMonth('2025-02');
        });

        const updated = getData();

        expect(updated.transactions).toHaveLength(2);
        expect(updated.transactions.map((t) => t.date)).toEqual(['2025-01-10', '2025-03-15']);
    });
});
