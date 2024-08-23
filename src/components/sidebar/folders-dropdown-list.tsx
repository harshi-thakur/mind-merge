'use client';
import { useAppState } from '@/lib/providers/state-provider';
import{Folder} from'@/lib/mongoDb/mongoTypes'
import React, { useEffect, useState } from 'react';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Accordion } from '../ui/accordion';
import Dropdown from '@/components/sidebar/Dropdown';


interface FoldersDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {

  const { state, dispatch, folderId } = useAppState();
  const { toast } = useToast();
  const [folders, setFolders] = useState(workspaceFolders);

  //effec set initial satte server app state
  useEffect(() => {
    if (workspaceFolders.length > 0) {
      dispatch({
        type: 'SET_FOLDERS',
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files:
              state.workspaces
                .find((workspace) => workspace._id === workspaceId)
                ?.folders.find((f) => f._id === folder._id)?.files || [],
          })),
        },
      });
    }
  }, [workspaceFolders, workspaceId]);
  //state

  useEffect(() => {
    setFolders(
      state.workspaces.find((workspace) => workspace._id === workspaceId)
        ?.folders || []
    );
  }, [state]);

  //add folder
  const addFolderHandler = async ()=>{
    // if (folders.length >= 3) {
    //   setOpen(true);
    //   return;
    // }
    
   const res= await fetch('/api/db/folders', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        iconId: '📄',
        title: 'Untitled',
        workspaceId:workspaceId,
      }),
    });
    const data=await res.json();

    if (!data.id) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Could not create the folder',
      });
    } else {
      const newFolder: Folder = {
        _id:data.id,
        data: '',
        title: 'Untitled',
        iconId: '📄',
        inTrash: '',
        workspaceId:workspaceId,
        bannerUrl: '',
      };
      dispatch({
        type: 'ADD_FOLDER',
        payload: { workspaceId, folder: { ...newFolder, files: [] } },
      });
      toast({
        title: 'Success',
        description: 'Created folder.',
      });
    }
  };

  return (
    <>
      <div
        className="flex
        sticky 
        z-20 
        top-0 
        bg-background 
        w-full  
        h-10 
        group/title 
        justify-between 
        items-center 
        pr-4 
        text-Neutrals/neutrals-8
  "
      >
        <span
          className="text-Neutrals-8 
        font-bold 
        text-xs"
        >
          FOLDERS
        </span>
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group-hover/title:inline-block
            hidden 
            cursor-pointer
            hover:dark:text-white
          "
          />
        </TooltipComponent>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || '']}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder._id}
              title={folder.title}
              listType="folder"
              id={folder._id}
              iconId={folder.iconId}
            />
          ))}
      </Accordion>
    </>
  );
};

export default FoldersDropdownList;
