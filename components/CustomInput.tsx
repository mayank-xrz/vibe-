'use client';

import React from 'react';
import { Control, FieldPath } from 'react-hook-form';
import * as z from 'zod';
import { authFormSchema } from '@/lib/utils';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// authFormSchema is a function, so the inferred type must use ReturnType.
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
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5 w-full">
          <FormLabel className="text-14 w-full max-w-[280px] font-medium text-gray-700">
            {label}
          </FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                placeholder={placeholder}
                type={name === 'password' ? 'password' : 'text'}
                className="input-class"
                {...field}
                value={(field.value as string) ?? ''}
              />
            </FormControl>
            <FormMessage className="text-12 text-red-500 mt-0.5" />
          </div>
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
