/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Controller, FieldValues } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'file'
}

const FormField = ({control, name, label, placeholder, type = 'text'}: FormFieldProps<T>) => {
  return (
    <Controller 
        control={control}
        name={name}
        render={({field}) => (
          <FormItem>
              <FormLabel className='label'>{label}</FormLabel>
              <FormControl>
                <Input 
                    className='input' 
                    placeholder={placeholder} 
                    type={type}
                    {...field}
                />
              </FormControl>
              <FormMessage />
          </FormItem>
        )}
    />
  )
}

export default FormField