import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CategorizedTransaction, CsvTransaction, TitleMapping, TrackingData } from '@/types';

export type WorkingTransaction = CsvTransaction & {
    suggestedCategoryName: string | null;
    suggestedItemId: string | null;
    suggestedCategoryLabel: string | null;
    isAutoMapped: boolean;
};

const INITIAL_TRACKING: TrackingData = {
    transactions: [],
    titleMappings: []
};

export function useTracking() {
    const [trackingData, setTrackingData] = useLocalStorage<TrackingData>(
        'financial-organizer-tracking',
        INITIAL_TRACKING
    );

    const applyAutoMappings = (transactions: CsvTransaction[]): WorkingTransaction[] => {
        return transactions.map((txn) => {
            const normalized = txn.title.toLowerCase().trim();
            const mapping = trackingData.titleMappings.find((m) => m.titleNormalized === normalized);

            return {
                ...txn,
                suggestedCategoryName: mapping?.categoryName ?? null,
                suggestedItemId: mapping?.itemId ?? null,
                suggestedCategoryLabel: mapping?.categoryLabel ?? null,
                isAutoMapped: !!mapping
            };
        });
    };

    const saveBatch = (categorized: CategorizedTransaction[], newMappings: TitleMapping[]) => {
        setTrackingData((prev) => {
            const updatedMappings = [...prev.titleMappings];

            for (const mapping of newMappings) {
                const existingIndex = updatedMappings.findIndex(
                    (m) => m.titleNormalized === mapping.titleNormalized
                );
                if (existingIndex >= 0) {
                    updatedMappings[existingIndex] = mapping;
                } else {
                    updatedMappings.push(mapping);
                }
            }

            return {
                transactions: [...prev.transactions, ...categorized],
                titleMappings: updatedMappings
            };
        });
    };

    const getSpentByItem = (month: string): Record<string, number> => {
        const result: Record<string, number> = {};

        for (const txn of trackingData.transactions) {
            if (!txn.date.startsWith(month)) continue;
            if (txn.categoryName === 'skipped' || txn.categoryName === 'weekly_budget' || txn.categoryName === 'unplanned') continue;
            if (!txn.itemId) continue;

            result[txn.itemId] = (result[txn.itemId] || 0) + txn.amount;
        }

        return result;
    };

    const getWeeklyBudgetSpent = (month: string): number => {
        return trackingData.transactions
            .filter((txn) => txn.date.startsWith(month) && txn.categoryName === 'weekly_budget')
            .reduce((sum, txn) => sum + txn.amount, 0);
    };

    const getUnplannedSpent = (month: string): number => {
        return trackingData.transactions
            .filter((txn) => txn.date.startsWith(month) && txn.categoryName === 'unplanned')
            .reduce((sum, txn) => sum + txn.amount, 0);
    };

    const getAvailableMonths = (): string[] => {
        const months = new Set<string>();
        for (const txn of trackingData.transactions) {
            if (txn.categoryName !== 'skipped') {
                months.add(txn.date.substring(0, 7));
            }
        }

        return Array.from(months).sort().reverse();
    };

    return {
        trackingData,
        applyAutoMappings,
        saveBatch,
        getSpentByItem,
        getWeeklyBudgetSpent,
        getUnplannedSpent,
        getAvailableMonths
    };
}
