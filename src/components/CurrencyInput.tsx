import React from 'react';

import CurrencyInputField, { CurrencyInputProps } from 'react-currency-input-field';

// Wrapper to always use Brazilian Real formatting and output number
export type CustomCurrencyInputProps = Omit<
    CurrencyInputProps,
    'prefix' | 'intlConfig' | 'allowNegativeValue' | 'decimalsLimit' | 'decimalSeparator' | 'groupSeparator'
> & {
    value: number | string | undefined;
    onValueChange: (value: number) => void;
};

export const CurrencyInput: React.FC<CustomCurrencyInputProps> = ({ value, onValueChange, ...rest }) => {
    return (
        <CurrencyInputField
            prefix='R$ '
            intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
            allowNegativeValue={false}
            decimalsLimit={2}
            decimalSeparator=','
            groupSeparator='.'
            value={value}
            onValueChange={(_value, _name, values) => {
                // values.value is a string or undefined, parse to number or fallback to 0
                onValueChange(Number(values?.value || 0));
            }}
            {...rest}
            className={rest.className || 'w-full rounded border p-2 text-2xl font-bold text-purple-600'}
        />
    );
};
