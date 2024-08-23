'use client';
import { Workspace } from '@/lib/mongoDb/mongoTypes';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface SelectedWorkspaceProps {
  workspace: Workspace;
  onClick?: (option: Workspace) => void;
}

const SelectedWorkspace: React.FC<SelectedWorkspaceProps> = ({
  workspace,
  onClick,
}) => {
 
  const [workspaceLogo, setWorkspaceLogo] = useState('');
  useEffect(() => {
    if (workspace.logo) {
      const path =workspace.logo;
      setWorkspaceLogo(path);
    }
  }, [workspace]);
  return (
    <Link
      href={`/dashboard/${workspace._id}`}
      onClick={() => {
        if (onClick) onClick(workspace);
      }}
      className="flex 
      rounded-md 
      hover:bg-muted 
      transition-all 
      flex-row 
      p-2 
      gap-4 
      justify-center 
      cursor-pointer 
      items-center 
      my-2"
    >
      <Image
        src={workspaceLogo}
        alt="workspace logo"
        width={26}
        height={26}
        objectFit="cover"
      />
      <div className="flex flex-col">
        <p
          className="text-lg 
        w-[170px] 
        overflow-hidden 
        overflow-ellipsis 
        whitespace-nowrap"
        >
          {workspace.title}
        </p>
      </div>
    </Link>
  );
};

export default SelectedWorkspace;
