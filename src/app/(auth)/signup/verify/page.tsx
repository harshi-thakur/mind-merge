'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { OTPSchema } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp"
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Icons } from "@/components/icons"
import { cn } from '@/lib/utils';
import { toast } from "@/components/ui/use-toast"

export function Verify() {
    const router = useRouter();
    const searchParams=useSearchParams();
    const email=searchParams.get('email');
    const [submitError, setSubmitError] = useState('');
    const form = useForm<z.infer<typeof OTPSchema>>({
        resolver: zodResolver(OTPSchema),
        defaultValues: {
            pin: "",
        },
    });
    const isLoading = form.formState.isSubmitting;

    async function onSubmit(formData: z.infer<typeof OTPSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(formData, null, 2)}</code>
                </pre>
            ),
        });
        const res = await fetch(`/api/register/?pin=${formData.pin}&email=${email}`, {
            method: "GET",
        });
        const data = await res.json();
        if (res.status === 400) {
            setSubmitError(data.message);
        }
        if (res.status === 200) {
            router.replace('/login');
        }
    };


    return (
        <>
            <Link
                href="/signup"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute right-4 top-4 md:right-8 md:top-8"
                )}
            >
                Signup
            </Link>
            <div className="lg:p-8">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight mb-10">
                        Get Verified
                    </h1>
                </div>
                <div className="mx-auto flex w-full flex-col justify-center items-center space-y-6 sm:w-[350px]">
          <Form {...form}>
                        <form
                         onChange={() => {
                            if (submitError) setSubmitError('');
                          }} 
                        onSubmit={form.handleSubmit(onSubmit)} className=" sm:justify-center sm:w-[350px] space-y-6 flex flex-col">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem className='flex flex-col items-center'>
                                        <FormLabel className=''>One-Time Password</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormDescription className='text-foreground/60 text-center'>
                                            Please enter the one-time password sent to your phone.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {submitError && <FormMessage>{submitError}</FormMessage>}
                            <Button
                                type="submit"

                                disabled={isLoading}
                            >
                                {!isLoading ? 'Submit' : <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            </Button>
                        </form>
                    </Form>


                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </>
    )
}


export default Verify;