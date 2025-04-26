"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { redirect } from "next/navigation";

// 1. Define the validation schema
const formSchema = z.object({
  type: z.string().min(1, "Please select a session type"),
  level: z.string().min(1, "Please select a difficulty level"),
  questions: z.string().min(1, "Please choose a number of questions"),
});

type FormValues = z.infer<typeof formSchema>;

const Page = () => {
  // 2. Hook with resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      level: "",
      questions: "",
    },
  });

  const onSubmit = async () => {
    const isValid = await form.trigger(); // Triggers validation manually
  
    if (!isValid) return;
  
    const values = form.getValues();
  
    try {
      const res = await fetch("https://asynclangai.vercel.app/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      const result = await res.json();
      console.log("Session created:", result);
      
    } catch (error) {
      console.error("Failed to create session:", error);
    }
    
    redirect('/')
  };

  return (
    <div className="auth-layout">
      <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
          <div className="flex flex-row gap-2 justify-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">

                {/* Session Type */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="type" className="label">Session Category</label>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(value) => form.setValue("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                  )}
                </div>

                {/* Difficulty Level */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="level" className="label">Session Difficulty Level</label>
                  <Select
                    value={form.watch("level")}
                    onValueChange={(value) => form.setValue("level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.level && (
                    <p className="text-sm text-red-500">{form.formState.errors.level.message}</p>
                  )}
                </div>

                {/* Number of Questions */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="questions" className="label">What is your preferred number of questions?</label>
                  <Select
                    value={form.watch("questions")}
                    onValueChange={(value) => form.setValue("questions", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.questions && (
                    <p className="text-sm text-red-500">{form.formState.errors.questions.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full flex justify-center items-center">
                  Create Session
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
