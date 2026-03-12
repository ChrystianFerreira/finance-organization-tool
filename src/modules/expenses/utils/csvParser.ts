import { CsvTransaction } from '@/modules/expenses/types';

export type ParseResult = {
    kept: CsvTransaction[];
    skipped: CsvTransaction[];
};

const INSTALLMENT_REGEX = /[- ]+Parcela\s+(\d+)\/(\d+)/i;

export function parseNubankCsv(rawText: string): ParseResult {
    const lines = rawText.trim().split('\n');
    const kept: CsvTransaction[] = [];
    const skipped: CsvTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const firstComma = line.indexOf(',');
        const lastComma = line.lastIndexOf(',');

        if (firstComma === -1 || firstComma === lastComma) continue;

        const date = line.substring(0, firstComma).trim();
        const title = line.substring(firstComma + 1, lastComma).trim();
        const amount = parseFloat(line.substring(lastComma + 1).trim());

        if (isNaN(amount)) continue;

        const fingerprint = `${date}|${title.toLowerCase().trim()}|${amount.toFixed(2)}`;
        const transaction: CsvTransaction = { date, title, amount, fingerprint };

        if (amount < 0) {
            skipped.push(transaction);
            continue;
        }

        const installmentMatch = title.match(INSTALLMENT_REGEX);
        if (installmentMatch) {
            const currentInstallment = parseInt(installmentMatch[1]);
            if (currentInstallment > 1) {
                skipped.push(transaction);
                continue;
            }
        }

        kept.push(transaction);
    }

    return { kept, skipped };
}
