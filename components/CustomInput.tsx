'use client';

import React from 'react';
import { Control, Controller, FieldPath } from 'react-hook-form';
import * as z from 'zod';
import { authFormSchema } from '@/lib/utils';

type FormSchema = ReturnType<typeof authFormSchema>;
type FormValues = z.infer<FormSchema>;

interface CustomInputProps {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
  placeholder: string;
}

const CustomInput = ({ control, name, label, placeholder }: CustomInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor={name} className="text-14 w-full max-w-[280px] font-medium text-gray-700">
            {label}
          </label>
          <div className="flex w-full flex-col">
            <input
              id={name}
              placeholder={placeholder}
              type={name === 'password' ? 'password' : 'text'}
              {...field}
              value={field.value as string ?? ''}
              className="input-class text-base font-normal rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {error && (
              <p className="text-12 text-red-500 mt-0.5">{error.message}</p>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default CustomInput;
