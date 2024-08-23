'use client';
import type { NextRequest } from "next/server";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from "@/components/icons"
import { signIn } from "next-auth/react";
import { cn } from '@/lib/utils';
import { buttonVariants } from "@/components/ui/button"

const Login = (req: NextRequest) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (formData) => {
    const { email, password } = formData;
    const res = await signIn("credentials", {
      redirect: false,
      username: email,
      password: password,
      callbackUrl: 'http://localhost:3000/dashboard'
    });
    if (res?.url) router.replace(res.url);
    if (res?.error) {
      console.error("Invalid email or password");
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
       SignUp
      </Link>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
             Enter to WorkSpace
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email & password
            </p>
          </div>
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
                {!isLoading ? 'Sign Up' : <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </form>
          </Form>
          <div className="relative flex justify-center text-xs uppercase text-center">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Button variant="outline" type="button" disabled={isLoading} onClick={() => signIn("github", { redirect: false })}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} onClick={() => signIn("google", { redirect: false })}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}

          Google
        </Button>
        <div className="relative flex justify-center items-center   text-center">
          <p className="bg-background px-2 text-muted-foreground">
            Not have an account..
          </p>
          <Link href="/signup" className='text-lg inline-block'>
            SignUp
          </Link>

        </div>
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
    </div >
    </>
  );
};

export default Login;

