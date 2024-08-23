'use client';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import EmojiPicker from '@/components/global/emoji-picker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/state-provider';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';
import firebaseUpload from '@/lib/firebase/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form, FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import Loader from './global/Loader';
interface DashboardSetupProps {
    userId: string;
}


const DashboardSetup: React.FC<DashboardSetupProps> = ({ userId }) => {
    const { toast } = useToast();
    const router = useRouter();
    const { dispatch } = useAppState();
    const [selectedEmoji, setSelectedEmoji] = useState('💼');
    const [submitError, setSubmitError] = useState('');
    const form = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(CreateWorkspaceFormSchema),
        defaultValues: {
            logo: '',
            workspaceName: ''
        },
    });
    const fileRef = form.register("logo");
    const isLoading = form.formState.isSubmitting;
    const onSubmit: SubmitHandler<z.infer<typeof CreateWorkspaceFormSchema>> = async (formData) => {
        try {
            // let filePath = null;
            const filePath= await firebaseUpload(formData.logo[0]);
        // } catch (err) {
        //     toast({
        //         variant: 'destructive',
        //         title: 'Error! Could not upload your workspace logo',
        //     });
        // }
           
        // try {
        // if(filePath) return;
            const res=await fetch("/api/db/workspace", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    iconId: selectedEmoji,
                    title: formData.workspaceName,
                    workspaceOwner: userId ,
                    logo: filePath,
                }),
              });
              if(res.status==500) throw Error("");
              const data=await res.json();
              const newWorkspace = {
                _id:data.id,
                data: null,
                iconId: selectedEmoji,
                inTrash: '',
                title: formData.workspaceName,
                workspaceOwner: userId ,
                logo: filePath,
                bannerUrl: '',
            };
            dispatch({
                type: 'ADD_WORKSPACE',
                payload: { ...newWorkspace, folders: [] },
            });

            toast({
                title: 'Workspace Created',
                description: `${newWorkspace.title} has been created successfully.`,
            });
            router.replace(`/dashboard/${newWorkspace._id}`);
        } catch (error) {
            console.log(error, 'Error');
            toast({
                variant: 'destructive',
                title: 'Could not create your workspace',
                description:
                    "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
            });
        } finally {
            form.reset();

        };
    }
    return (
        <Card className="w-[800px] h-screen sm:h-auto">
            <CardHeader>
                <CardTitle className='text-center'>Create A Workspace</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onChange={() => {
                            if (submitError) setSubmitError('');
                        }}
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormDescription className='text-sm'>
                            Lets create a private workspace to get you started.You can add
                            collaborators later from the workspace settings tab.
                        </FormDescription>
                        <div className='flex justify-center gap-x-5'>
                            <div className="text-5xl h-16 w-16  flex justify-center items-center  mt-5 rounded-full border-primary border-2 ">
                                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                                    {selectedEmoji}
                                </EmojiPicker>
                            </div>
                            <div className='w-3/4'>
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="workspaceName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WorkspaceName</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Workspace Name" className="bg-accent" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="logo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    className='bg-accent'
                                                    placeholder="LOGO"
                                                    
                                                    {...fileRef}
                                                    accept='image/*'

                                                    onChange={(event) => {
                                                        field.onChange(event.target?.files?.[0] ?? undefined);
                                                    }
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="self-end">
                                    <Button
                                        disabled={isLoading}
                                        type="submit"
                                    >
                                        {/* Create Workspace */}
                                        {!isLoading ? 'Create Workspace' : <Loader />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
};
export default DashboardSetup;