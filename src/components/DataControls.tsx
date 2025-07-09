'use client';

import { useRef } from 'react';

import { useFinancial } from '@/context/FinancialContext';
import { FinancialData } from '@/types';

import { Download, Upload } from 'lucide-react';

type DataControlsProps = {
    onDataImported: () => void;
};

export const DataControls = ({ onDataImported }: DataControlsProps) => {
    const { data, updateData, setScenario } = useFinancial();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `financas-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string) as FinancialData;

                // Validar se o arquivo tem a estrutura correta
                if (
                    'income' in importedData &&
                    'fixedExpenses' in importedData &&
                    'savingsGoal' in importedData &&
                    'installments' in importedData
                ) {
                    updateData(importedData);
                    setScenario(importedData.income.type === 'variable' ? 'pessimistic' : 'optimistic');
                    onDataImported();
                } else {
                    alert('Arquivo inválido. Por favor, selecione um arquivo JSON exportado por esta aplicação.');
                }
            } catch (error) {
                alert('Erro ao ler o arquivo. Certifique-se de que é um arquivo JSON válido.');
            }
        };
        reader.readAsText(file);

        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
    };

    return (
        <div className='ml-2 flex flex-wrap items-center gap-2 sm:ml-0'>
            <input type='file' ref={fileInputRef} onChange={handleFileChange} accept='.json' className='hidden' />
            <button
                onClick={handleImportClick}
                className='flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200'
                title='Importar dados'>
                <Upload size={16} />
                Importar
            </button>
            <button
                onClick={handleExport}
                className='flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200'
                title='Exportar dados'>
                <Download size={16} />
                Exportar
            </button>
        </div>
    );
};
