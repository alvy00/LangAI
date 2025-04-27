/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState, useEffect } from "react";
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
import { getCurrentUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  type: z.string().min(1, "Please select a session type"),
  level: z.string().min(1, "Please select a difficulty level"),
  amount: z.string().min(1, "Please choose a number of questions"),
});

type FormValues = z.infer<typeof formSchema>;
type User = {
  id: string;
};

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // 2. Hook with resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      level: "",
      amount: "",
    },
  });

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();

    if (!user) {
      console.error("User is not logged in");
      return;
    }

    setLoading(true); // Start loading state

    try {
      const res = await fetch("https://asynclangai.vercel.app/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: values.type,
          level: values.level,
          amount: values.amount,
          userid: user.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      const result = await res.json();
      toast.success("Session created successfully!");

    } catch (error) {
      toast.error(`Error creating session: ${error.message}`);
    } finally {
      setLoading(false); // Stop loading state
    }

    redirect("/"); // Redirect after session creation
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
                  <label htmlFor="amount" className="label">What is your preferred number of questions?</label>
                  <Select
                    value={form.watch("amount")}
                    onValueChange={(value) => form.setValue("amount", value)}
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
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex flex-col md:flex-row gap-4 mt-6">
                  <Button type="submit" className="btn-primary flex-1" disabled={loading}>  
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <p className="text-sm font-semibold text-black">Create Session</p>
                    )}
                  </Button>

                  <Button type="button" className="btn-secondary flex-1">
                    <Link href="/">
                      <p className="text-sm font-semibold text-primary-200">Back to Dashboard</p>
                    </Link>
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
