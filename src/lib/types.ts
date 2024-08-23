import { Socket, Server as NetServer } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { z } from 'zod';
const isStrong=new RegExp( /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{7,}$/);

export const FormSchema = z.object({
  email: z.string().describe('Email').email({ message: 'Invalid Email' }),
  password: z.string().describe('Password').min(7, {message: 'Minimum length is 7'}).regex(isStrong,{message:"Should contains atleast 1 character of UPPERCASE,lowercase,special and digit"}),
});
export const OTPSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})
export const CreateWorkspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .describe('Workspace Name')
    .min(1, 'Workspace name must be min of 1 character'),
  logo: z.any()
});
export const UploadBannerFormSchema = z.object({
  banner: z.string().describe('Banner Image'),
});
export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};