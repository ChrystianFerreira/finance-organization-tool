import { parseNubankCsv } from '../utils/csvParser';

describe('parseNubankCsv', () => {
    it('should parse valid CSV with normal transactions', () => {
        const csv = `Date,Title,Amount
2025-01-15,Supermercado Extra,150.50
2025-01-16,Farmacia Droga Raia,45.90`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(2);
        expect(result.skipped).toHaveLength(0);
        expect(result.kept[0]).toEqual({
            date: '2025-01-15',
            title: 'Supermercado Extra',
            amount: 150.5,
            fingerprint: '2025-01-15|supermercado extra|150.50'
        });
        expect(result.kept[1]).toEqual({
            date: '2025-01-16',
            title: 'Farmacia Droga Raia',
            amount: 45.9,
            fingerprint: '2025-01-16|farmacia droga raia|45.90'
        });
    });

    it('should skip negative amounts (refunds)', () => {
        const csv = `Date,Title,Amount
2025-01-15,Supermercado Extra,150.50
2025-01-16,Estorno Compra,-50.00`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(1);
        expect(result.skipped).toHaveLength(1);
        expect(result.skipped[0].title).toBe('Estorno Compra');
    });

    it('should keep installment 1/N and skip installments 2+/N', () => {
        const csv = `Date,Title,Amount
2025-01-15,Netflix - Parcela 1/3,30.00
2025-02-15,Netflix - Parcela 2/3,30.00
2025-03-15,Netflix - Parcela 3/3,30.00`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(1);
        expect(result.kept[0].title).toBe('Netflix - Parcela 1/3');
        expect(result.skipped).toHaveLength(2);
    });

    it('should handle empty CSV (header only)', () => {
        const csv = 'Date,Title,Amount';

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(0);
        expect(result.skipped).toHaveLength(0);
    });

    it('should ignore blank and malformed lines', () => {
        const csv = `Date,Title,Amount

invalid-line-no-commas
2025-01-15,Compra,abc
2025-01-16,Restaurante,80.00
,
single-comma,only`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(1);
        expect(result.kept[0].title).toBe('Restaurante');
    });

    it('should generate correct fingerprints', () => {
        const csv = `Date,Title,Amount
2025-03-10,Uber Trip,25.99`;

        const result = parseNubankCsv(csv);

        expect(result.kept[0].fingerprint).toBe('2025-03-10|uber trip|25.99');
    });

    it('should parse decimal amounts correctly', () => {
        const csv = `Date,Title,Amount
2025-01-15,Compra A,0.50
2025-01-16,Compra B,1234.56`;

        const result = parseNubankCsv(csv);

        expect(result.kept[0].amount).toBe(0.5);
        expect(result.kept[1].amount).toBe(1234.56);
    });

    it('should handle titles with commas by using first/last comma split', () => {
        const csv = `Date,Title,Amount
2025-01-15,Loja X, Shopping Y,99.90`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(1);
        expect(result.kept[0].title).toBe('Loja X, Shopping Y');
        expect(result.kept[0].amount).toBe(99.9);
    });

    it('should keep transactions with zero amount', () => {
        const csv = `Date,Title,Amount
2025-01-15,Compra Teste,0.00
2025-01-16,Supermercado,50.00`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(2);
        expect(result.kept[0].amount).toBe(0);
        expect(result.skipped).toHaveLength(0);
    });

    it('should handle CSV with Windows line endings (\\r\\n)', () => {
        const csv = 'Date,Title,Amount\r\n2025-01-15,Supermercado,100.00\r\n2025-01-16,Farmacia,45.00\r\n';

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(2);
        expect(result.kept[0].title).toBe('Supermercado');
        expect(result.kept[1].title).toBe('Farmacia');
    });

    it('should handle different installment format patterns', () => {
        const csv = `Date,Title,Amount
2025-01-15,Compra Parcela 1/6,100.00
2025-01-15,Compra Parcela 3/6,100.00
2025-01-15,Outra - Parcela 1/12,50.00`;

        const result = parseNubankCsv(csv);

        expect(result.kept).toHaveLength(2);
        expect(result.kept.map((t) => t.title)).toEqual(['Compra Parcela 1/6', 'Outra - Parcela 1/12']);
        expect(result.skipped).toHaveLength(1);
    });
});
