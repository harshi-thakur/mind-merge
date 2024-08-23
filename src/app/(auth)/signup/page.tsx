'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Icons } from "@/components/icons"
import { cn } from '@/lib/utils';

const Signup = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (formData) => {
    const res=await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data=await res.json();
    if (res.status === 400) {
      setSubmitError(data.message);
    }
    if (res.status === 200) {
      router.push('/signup/verify?email='+formData.email);
    }
  };

  return (
    <>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="lg:p-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Form {...form}>
            <form
              onChange={() => {
                if (submitError) setSubmitError('');
              }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full sm:justify-center sm:w-[350px] space-y-6 flex flex-col"
            >
              <FormDescription className="text-foreground/60 text-center">
                An all-In-One Collaboration and Productivity Platform
              </FormDescription>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError && <FormMessage>{submitError}</FormMessage>}
              <Button
                type="submit"
                
                disabled={isLoading}
              >
                {!isLoading ? 'SignUp' : <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
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
  );
};

export default Signup;