'use client';

import { useRef, useState } from 'react';

import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { useFinancial } from '@/context/FinancialContext';
import { useTracking, WorkingTransaction } from '@/hooks/useTracking';
import { CategorizedTransaction, CsvTransaction, TitleMapping } from '@/types';
import { calculateWeeklyBudget, calculateTotalExpenses } from '@/utils';
import { parseNubankCsv, ParseResult } from '@/utils/csvParser';

import { Decision, TransactionCard } from './TransactionCard';
import { TransactionSummary } from './TransactionSummary';

type Phase = 'upload' | 'review' | 'categorize' | 'confirm';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onImported: () => void;
};

export const ImportWizardModal = ({ isOpen, onClose, onImported }: Props) => {
    const { data, scenario } = useFinancial();
    const { applyAutoMappings, saveBatch } = useTracking();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [phase, setPhase] = useState<Phase>('upload');
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [workingTransactions, setWorkingTransactions] = useState<WorkingTransaction[]>([]);
    const [decisions, setDecisions] = useState<(Decision | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentIncome =
        data.income.type === 'fixed'
            ? data.income.fixedAmount || 0
            : scenario === 'pessimistic'
              ? data.income.minAmount || 0
              : data.income.maxAmount || 0;

    const totalExpenses = calculateTotalExpenses(data.fixedExpenses);
    const totalInstallments = data.installments?.reduce((acc, curr) => acc + curr.monthlyAmount, 0) || 0;
    const weeklyBudget = calculateWeeklyBudget(currentIncome, totalExpenses + totalInstallments, data.savingsGoal);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const result = parseNubankCsv(text);
            setParseResult(result);

            const mapped = applyAutoMappings(result.kept);
            setWorkingTransactions(mapped);
            setDecisions(
                mapped.map((txn) =>
                    txn.isAutoMapped
                        ? {
                              categoryName: txn.suggestedCategoryName!,
                              itemId: txn.suggestedItemId,
                              categoryLabel: txn.suggestedCategoryLabel!,
                              saveMapping: false
                          }
                        : null
                )
            );
            setCurrentIndex(0);
            setPhase('review');
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDecision = (index: number, decision: Decision) => {
        setDecisions((prev) => {
            const next = [...prev];
            next[index] = decision;

            return next;
        });
    };

    const handleConfirm = () => {
        const batchId = uuidv4();
        const categorized: CategorizedTransaction[] = [];
        const newMappings: TitleMapping[] = [];

        workingTransactions.forEach((txn, i) => {
            const decision = decisions[i];
            if (!decision) return;

            categorized.push({
                id: uuidv4(),
                date: txn.date,
                title: txn.title,
                amount: txn.amount,
                categoryName: decision.categoryName,
                itemId: decision.itemId,
                categoryLabel: decision.categoryLabel,
                batchId
            });

            if (decision.saveMapping && decision.categoryName !== 'skipped') {
                newMappings.push({
                    titleNormalized: txn.title.toLowerCase().trim(),
                    categoryName: decision.categoryName,
                    itemId: decision.itemId,
                    categoryLabel: decision.categoryLabel
                });
            }
        });

        saveBatch(categorized, newMappings);
        resetAndClose();
        onImported();
    };

    const resetAndClose = () => {
        setPhase('upload');
        setParseResult(null);
        setWorkingTransactions([]);
        setDecisions([]);
        setCurrentIndex(0);
        onClose();
    };

    const allDecided = decisions.every((d) => d !== null);
    const firstUndecidedIndex = decisions.findIndex((d) => d === null);

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <div className='relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl'>
                <div className='flex items-center justify-between border-b px-6 py-4'>
                    <h2 className='text-lg font-semibold text-gray-800'>Importar Gastos</h2>
                    <button type='button' onClick={resetAndClose} className='text-gray-400 hover:text-gray-600'>
                        <X size={20} />
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto p-6'>
                    {phase === 'upload' && (
                        <div className='flex flex-col items-center gap-4 py-12'>
                            <Upload size={48} className='text-gray-300' />
                            <p className='text-center text-gray-600'>
                                Selecione o arquivo CSV exportado do seu banco
                            </p>
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className='rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700'>
                                Selecionar arquivo .csv
                            </button>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='.csv'
                                onChange={handleFileSelect}
                                className='hidden'
                            />
                        </div>
                    )}

                    {phase === 'review' && parseResult && (
                        <div className='flex flex-col gap-6'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='rounded-lg bg-green-50 p-4 text-center'>
                                    <p className='text-2xl font-bold text-green-700'>{parseResult.kept.length}</p>
                                    <p className='text-sm text-green-600'>A categorizar</p>
                                </div>
                                <div className='rounded-lg bg-gray-50 p-4 text-center'>
                                    <p className='text-2xl font-bold text-gray-500'>{parseResult.skipped.length}</p>
                                    <p className='text-sm text-gray-400'>Ignoradas automaticamente</p>
                                </div>
                            </div>

                            {workingTransactions.some((t) => t.isAutoMapped) && (
                                <div className='rounded-lg bg-blue-50 p-3 text-sm text-blue-700'>
                                    {workingTransactions.filter((t) => t.isAutoMapped).length} transações já mapeadas
                                    automaticamente
                                </div>
                            )}

                            {parseResult.skipped.length > 0 && (
                                <details className='text-sm'>
                                    <summary className='cursor-pointer text-gray-400 hover:text-gray-600'>
                                        Ver transações ignoradas
                                    </summary>
                                    <ul className='mt-2 space-y-1 text-gray-400'>
                                        {parseResult.skipped.map((txn, i) => (
                                            <li key={i}>
                                                {txn.date} — {txn.title} — {txn.amount < 0 ? '' : ''}
                                                {Math.abs(txn.amount).toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}

                            <button
                                type='button'
                                onClick={() => setPhase('categorize')}
                                className='rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700'>
                                Começar
                            </button>
                        </div>
                    )}

                    {phase === 'categorize' && workingTransactions.length > 0 && (
                        <div className='flex flex-col gap-4'>
                            <div className='flex items-center justify-between text-sm text-gray-500'>
                                <span>
                                    {currentIndex + 1} de {workingTransactions.length} transações
                                </span>
                                <div className='h-1.5 w-32 rounded-full bg-gray-200'>
                                    <div
                                        className='h-1.5 rounded-full bg-green-600 transition-all'
                                        style={{
                                            width: `${((currentIndex + 1) / workingTransactions.length) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <TransactionCard
                                date={workingTransactions[currentIndex].date}
                                title={workingTransactions[currentIndex].title}
                                amount={workingTransactions[currentIndex].amount}
                                categories={data.fixedExpenses}
                                weeklyBudget={weeklyBudget}
                                decision={decisions[currentIndex]}
                                isAutoMapped={workingTransactions[currentIndex].isAutoMapped}
                                onDecide={(d) => handleDecision(currentIndex, d)}
                            />

                            <div className='flex justify-between'>
                                <button
                                    type='button'
                                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                                    disabled={currentIndex === 0}
                                    className='flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30'>
                                    <ChevronLeft size={16} /> Anterior
                                </button>

                                <div className='flex gap-2'>
                                    {currentIndex < workingTransactions.length - 1 ? (
                                        <button
                                            type='button'
                                            onClick={() => setCurrentIndex((i) => i + 1)}
                                            className='flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'>
                                            Próximo <ChevronRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type='button'
                                            disabled={!allDecided}
                                            onClick={() => setPhase('confirm')}
                                            className='rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50'>
                                            Revisar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!allDecided && firstUndecidedIndex !== currentIndex && (
                                <button
                                    type='button'
                                    onClick={() => setCurrentIndex(firstUndecidedIndex)}
                                    className='text-center text-xs text-green-600 hover:underline'>
                                    Ir para próxima pendente ({firstUndecidedIndex + 1}/{workingTransactions.length})
                                </button>
                            )}
                        </div>
                    )}

                    {phase === 'confirm' && (
                        <TransactionSummary
                            entries={workingTransactions.map((txn, i) => ({
                                date: txn.date,
                                title: txn.title,
                                amount: txn.amount,
                                decision: decisions[i]!
                            }))}
                            onEdit={(index) => {
                                setCurrentIndex(index);
                                setPhase('categorize');
                            }}
                            onConfirm={handleConfirm}
                            onBack={() => setPhase('categorize')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
