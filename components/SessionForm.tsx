// components/form/SessionCreationFormField.tsx
'use client';

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'select';
  options?: string[]; // for select input
}

const SessionCreationFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  options = []
}: SessionFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label">{label}</FormLabel>
          <FormControl>
            {type === 'select' ? (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="input">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                className="input"
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SessionCreationFormField;
