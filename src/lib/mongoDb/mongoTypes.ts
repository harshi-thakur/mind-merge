import { Types } from 'mongoose';

export type User = {
    _id: string;
    user_name?: string;
    email: string;
    password?: string;
    verified: boolean;
    avatar_url?: string;
};

export type Verify = {
    user_id: string;
    hash_code?: string;
};

export type Workspace = {
    _id: string;
    workspaceOwner: string;
    title: string;
    iconId: string;
    data:  string|null;
    inTrash?: string;
    logo?: string|null;
    bannerUrl?: string;
};

export type Folder = {
    _id: string;
    title: string;
    iconId: string;
    data:  string|null;
    inTrash?: string;
    bannerUrl?: string;
    workspaceId: string;
};

export type File = {
    _id: string;
    title: string;
    iconId: string;
    data: string|null;
    inTrash?: string;
    bannerUrl?: string;
    workspaceId: string;
    folderId: string;
};

export type Collaborator = {
    _id: string;
    workspaceId: string;
    userId: string;
};
