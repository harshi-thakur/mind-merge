import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from '@/components/sidebar/workspace-dropdown';
import NativeNavigation from '@/components/sidebar/native-navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import FoldersDropdownList from '@/components/sidebar/folders-dropdown-list';
import UserCard from '@/components/sidebar/user-card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {  getUserId,getFolders, getWorkspaces } from '@/lib/mongoDb/queries';
import Link from 'next/link';
import Logo from '../../../public/Logo.png';
import Image from 'next/image';

interface SidebarProps {
  params: { workspaceId: string };
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = async({ params, className }) => {
  const session = await getServerSession(authOptions);
  if(!session?.user) return;
  const userId= await getUserId(session?.user.email+"");
  const {privateWorkspaces,sharedWorkspaces,collaboratingWorkspaces}= await getWorkspaces(userId);
  const workspaceFolderData= await  getFolders(params.workspaceId);
  //get all the different workspaces private collaborating shared
  return (
    <aside
    className={twMerge(
      'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
      className
    )}
    >
      <Link
        href={'/'}
        className="w-full flex gap-2
        justify-left items-center"
      >
        <Image
          src={Logo}
          alt="Logo"
          width={25}
          height={25}
        />
        <span
          className="font-semibold
          dark:text-white
        "
        >
         Mind-merge
        </span>
      </Link>
      <div>
        <WorkspaceDropdown
          userId={userId}
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find((workspace) => workspace._id === params.workspaceId)}
        />
        <NativeNavigation myWorkspaceId={params.workspaceId} />
        <ScrollArea
          className="overflow-scroll relative
          h-[450px]
        "
        >
          <div
            className="pointer-events-none 
          w-full 
          absolute 
          bottom-0 
          h-20 
          bg-gradient-to-t 
          from-background 
          to-transparent 
          z-40"
          />
          <FoldersDropdownList
            workspaceFolders={workspaceFolderData || []}
            workspaceId={params.workspaceId}
          />
        </ScrollArea>
      </div>
      <UserCard  />
    </aside>
  );
};

export default Sidebar;