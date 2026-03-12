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
