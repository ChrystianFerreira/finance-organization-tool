'use client';

import { useState } from 'react';

import { useFinancial } from '@/context/FinancialContext';
import { Installment } from '@/types';

import { v4 as uuidv4 } from 'uuid';

type InstallmentsFormProps = {
    onNext: () => void;
    onBack: () => void;
};

export const InstallmentsForm = ({ onNext, onBack }: InstallmentsFormProps) => {
    const { data, updateData } = useFinancial();
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [remainingInstallments, setRemainingInstallments] = useState('');

    const handleAddInstallment = () => {
        if (!description || !totalAmount || !remainingInstallments) return;

        const monthlyAmount = Number(totalAmount) / Number(remainingInstallments);

        const newInstallment: Installment = {
            id: uuidv4(),
            description,
            totalAmount: Number(totalAmount),
            remainingInstallments: Number(remainingInstallments),
            monthlyAmount
        };

        updateData({
            installments: [...(data.installments || []), newInstallment]
        });

        // Reset form
        setDescription('');
        setTotalAmount('');
        setRemainingInstallments('');
    };

    const handleRemoveInstallment = (id: string) => {
        updateData({
            installments: data.installments.filter((item) => item.id !== id)
        });
    };

    const totalMonthlyInstallments = data.installments?.reduce((acc, curr) => acc + curr.monthlyAmount, 0) || 0;

    return (
        <div className='rounded-lg bg-white p-6 shadow-md'>
            <div className='mb-6'>
                <h2 className='mb-2 text-2xl font-bold text-gray-800'>Parcelamentos</h2>
                <p className='mb-4 text-gray-600'>
                    Acesse o aplicativo do seu banco e verifique sua próxima fatura do cartão de crédito. Insira aqui
                    apenas os parcelamentos que ainda não foram totalmente pagos. Isso nos ajudará a calcular com
                    precisão seu orçamento mensal.
                </p>
            </div>

            <div className='mb-6 grid gap-4'>
                <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>Descrição</label>
                    <input
                        type='text'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className='w-full rounded-md border p-2'
                        placeholder="Ex: TV Samsung 50'"
                    />
                </div>

                <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>Valor Total</label>
                    <input
                        type='number'
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className='w-full rounded-md border p-2'
                        placeholder='2000'
                    />
                </div>

                <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>Parcelas Restantes</label>
                    <input
                        type='number'
                        value={remainingInstallments}
                        onChange={(e) => setRemainingInstallments(e.target.value)}
                        className='w-full rounded-md border p-2'
                        placeholder='10'
                    />
                </div>

                <button
                    onClick={handleAddInstallment}
                    className='rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'>
                    Adicionar Parcelamento
                </button>
            </div>

            {data.installments && data.installments.length > 0 && (
                <div className='mb-6'>
                    <h3 className='mb-2 text-lg font-semibold text-gray-800'>Parcelamentos Cadastrados</h3>
                    <div className='rounded-md bg-gray-50 p-4'>
                        {data.installments.map((installment) => (
                            <div key={installment.id} className='flex items-center justify-between py-2'>
                                <div>
                                    <p className='font-medium'>{installment.description}</p>
                                    <p className='text-sm text-gray-600'>
                                        {installment.remainingInstallments}x de R${' '}
                                        {installment.monthlyAmount.toFixed(2)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveInstallment(installment.id)}
                                    className='text-red-600 hover:text-red-800'>
                                    Remover
                                </button>
                            </div>
                        ))}
                        <div className='mt-4 border-t pt-4'>
                            <p className='font-semibold'>
                                Total mensal em parcelamentos: R$ {totalMonthlyInstallments.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className='mt-6 flex justify-between'>
                <button onClick={onBack} className='px-4 py-2 text-gray-600 hover:text-gray-800'>
                    Voltar
                </button>
                <button
                    onClick={onNext}
                    className='rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700'>
                    Continuar
                </button>
            </div>
        </div>
    );
};
