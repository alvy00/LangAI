"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { Loader2 } from "lucide-react";

const authFormSchema = (type: FormType) => {
    return z.object({
        name:
            type === "sign-up"
                ? z.string().min(2, "Name must be at least 2 characters")
                : z.string().optional(),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });
};

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            if (type === "sign-up") {
                const { name, email, password } = values;
                const userCredentials = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password,
                );
                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                });

                if (!result?.success) {
                    toast.error(result?.message || "Failed to create account");
                    return;
                }

                toast.success("Account created successfully!");
                router.push("/sign-in");
            } else {
                const { email, password } = values;
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password,
                );
                const idToken = await userCredential.user.getIdToken();

                if (!idToken) {
                    toast.error("Authentication token missing");
                    return;
                }

                await signIn({ email, idToken });

                toast.success("Welcome back!");
                router.push("/");
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.code
                ? error.code.replace("auth/", "").replace(/-/g, " ")
                : error.message;
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }

    const isSignIn = type === "sign-in";

    return (
        <div className="card-border lg:min-w-[566px] transition-all duration-300">
            <div className="flex flex-col gap-6 card py-14 px-10 shadow-lg">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex flex-row items-center gap-2">
                        <Image
                            src="/logo.svg"
                            alt="AsyncLangAI Logo"
                            height={32}
                            width={38}
                            priority
                        />
                        <h2 className="text-xl font-bold tracking-tight">
                            AsyncLangAI
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Practice English with an AI Agent
                    </p>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-5 mt-2"
                    >
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                label="Full Name"
                                placeholder="Enter your name"
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            label="Email Address"
                            placeholder="name@example.com"
                            type="email"
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="At least 6 characters"
                            type="password"
                        />

                        <Button
                            className="w-full btn transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isLoading
                                ? isSignIn
                                    ? "Signing In..."
                                    : "Creating Account..."
                                : isSignIn
                                  ? "Sign In"
                                  : "Create Account"}
                        </Button>
                    </form>
                </Form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                        {isSignIn
                            ? "Don't have an account yet?"
                            : "Already have an account?"}
                    </span>
                    <Link
                        href={isSignIn ? "/sign-up" : "/sign-in"}
                        className="font-semibold text-user-primary ml-1 hover:underline underline-offset-4"
                    >
                        {isSignIn ? "Sign up" : "Sign in"}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
