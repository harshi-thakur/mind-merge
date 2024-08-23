'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import clsx from 'clsx';
import EmojiPicker from '../global/emoji-picker';
import { useToast } from '../ui/use-toast';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon, Trash } from 'lucide-react';
import { File } from '@/lib/mongoDb/mongoTypes';
import { useSession } from 'next-auth/react';


interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file';
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
  ...props
}) => {
  const { toast } = useToast();
  const  {data} = useSession();
  const { state, dispatch, workspaceId, folderId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  //folder Title synced with server data and local
  const folderTitle: string | undefined = useMemo(() => {
    if (listType === 'folder') {
      const stateTitle = state.workspaces
        .find((workspace) => workspace._id === workspaceId)
        ?.folders.find((folder) => folder._id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  //fileItitle

  const fileTitle: string | undefined = useMemo(() => {
    if (listType === 'file') {
      const fileAndFolderId = id.split('folder');
      const stateTitle = state.workspaces
        .find((workspace) => workspace._id === workspaceId)
        ?.folders.find((folder) => folder._id === fileAndFolderId[0])
        ?.files.find((file) => file._id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  //Navigate the user to a different page
  const navigatatePage = (accordionId: string, type: string) => {
    if (type === 'folder') {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === 'file') {
      router.push(
        `/dashboard/${workspaceId}/${folderId}/${
          accordionId.split('folder')[1]
        }`
      );
    }
  };

  //double click handler
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  //blur

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    const fId = id.split('folder');
    if (fId?.length === 1) {
      if (!folderTitle) return;
        const res = await fetch('/api/db/folders',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: {title: folderTitle },
          folderId:fId[0]
        })
      });
      if(res.status==200){
        toast({
          title: 'Success',
          description: 'Folder title changed.',
        });
      }
      else{
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the title for this folder',
        });
      }
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return;
      const res = await fetch('/api/db/files',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: {title: fileTitle },
          fileId:fId[1]
        })
      });
      if (res.status==500) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the title for this file',
        });
      } else
        toast({
          title: 'Success',
          description: 'File title changed.',
        });
    }
  };

  //onchanges
  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!workspaceId) return;
    if (listType === 'folder') {
      const res = await fetch('/api/db/folders',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: {iconId: selectedEmoji},
          folderId:id,
        })
      });
      if (res.status==500) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the emoji for this folder',
        });
      } else {
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            workspaceId,
            folderId: id,
            folder: { iconId: selectedEmoji },
          },
        });
        toast({
          title: 'Success',
          description: 'Update emoji for the folder',
        });
      }
    }
    if(listType==='file') {
      const fid = id.split('folder');
      const res = await fetch('/api/db/files',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: {iconId: selectedEmoji},
          fileId: fid[1],
        })
      });
      if (res.status==500) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not update the emoji for this file',
        });
      } else {
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { iconId: selectedEmoji },
            folderId:fid[0],
            workspaceId,
            fileId: fid[1],
          }
      })
        toast({
          title: 'Success',
          description: 'Update emoji for the folder',
        });
      }
    }
  };
  const folderTitleChange = (e: any) => {
    if (!workspaceId) return;
    const fid = id.split('folder');
    if (fid.length === 1) {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { title: e.target.value },
          folderId: fid[0],
          workspaceId,
        },
      });
    }
  };
  const fileTitleChange = (e: any) => {
    if (!workspaceId || !folderId) return;
    const fid = id.split('folder');
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          file: { title: e.target.value },
          folderId,
          workspaceId,
          fileId: fid[1],
        },
      });
    }
  };

  //move to trash
  const moveToTrash = async () => {
    if (!data?.user?.email || !workspaceId) return;
    const pathId = id.split('folder');
    if (listType === 'folder') {
      const res = await fetch('/api/db/folders',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: {inTrash: `Deleted by ${data.user?.email}`},
          folderId:pathId[0],
        })
      });
      if (res.status==500) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not move the folder to trash',
        });
      } else {
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folder: { inTrash: `Deleted by ${data?.user?.email}` },
            folderId: pathId[0],
            workspaceId,
          },
        });
        toast({
          title: 'Success',
          description: 'Moved folder to trash',
        });
      }
    }

    if (listType === 'file') {
      const res = await fetch('/api/db/files',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: { inTrash: `Deleted by ${data.user?.email}`  },
          fileId: pathId[1]
        })
      });
      if (res.status==500) {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: 'Could not move the folder to trash',
        });
      } else {
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { inTrash: `Deleted by ${data.user?.email}` },
            folderId: pathId[0],
            workspaceId,
            fileId: pathId[1],
          },
        });
        toast({
          title: 'Success',
          description: 'Moved folder to trash',
        });
      }
    }
  };

  const isFolder = listType === 'folder';
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
    {
      'group/folder': isFolder,
      'group/file': !isFolder,
    }
  );

  const listStyles = useMemo(
    () =>
      clsx('relative', {
        'border-none text-md': isFolder,
        'border-none ml-6 text-[16px] py-1': !isFolder,
      }),
    [isFolder]
  );

  const hoverStyles = useMemo(
    () =>
      clsx(
        'h-full hidden rounded-sm absolute right-0 items-center justify-center',
        {
          'group-hover/file:block': listType === 'file',
          'group-hover/folder:block': listType === 'folder',
        }
      ),
    [isFolder]
  );

  const addNewFile = async () => {
    if (!workspaceId) return;
    const res= await fetch('/api/db/files',{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: 'Untitled',
        iconId: '📄',
        folderId: id,
        workspaceId:workspaceId,
      })
    });
    const data= await res.json();
    if (!data.id) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Could not create a file',
      });
    } else {
      const newFile: File = {
        folderId: id,
        data: '',
        inTrash: '',
        title: 'Untitled',
        iconId: '📄',
        _id: data.id,
        workspaceId:workspaceId,
        bannerUrl: '',
      };
      dispatch({
        type: 'ADD_FILE',
        payload: { file: newFile, folderId: id, workspaceId },
      });
      toast({
        title: 'Success',
        description: 'File created.',
      });
    }
  };

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation();
        navigatatePage(id, listType);
      }}
      >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline 
        p-2 
        dark:text-muted-foreground 
        text-sm"
       
        // disabled={listType === 'file'}
        >
        <div className={groupIdentifies}>
            <div className="relative" >
              <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
            </div>
          <div
            className="flex 
          gap-4 
          items-center 
          justify-center 
          overflow-hidden"
          >
            <input
              type="text"
              value={listType === 'folder' ? folderTitle : fileTitle}
              className={clsx(
                'outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',
                {
                  'bg-muted cursor-text': isEditing,
                  'bg-transparent cursor-pointer': !isEditing,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={
                listType === 'folder' ? folderTitleChange : fileTitleChange
              }
            />
          </div>
          <div className={hoverStyles}>
            <TooltipComponent message={listType === 'folder'?'Delete Folder':'Delete File'}>
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
              />
            </TooltipComponent>
            {listType === 'folder' && !isEditing && (
              <TooltipComponent message="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                />
              </TooltipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
      {listType=='folder'&&<AccordionContent>
        {state.workspaces
          .find((workspace) => workspace._id === workspaceId)
          ?.folders.find((folder) => folder._id === id)
          ?.files.filter((file) => !file.inTrash)
          .map((file) => {
            const customFileId = `${id}folder${file._id}`;
            return (
              <Dropdown
                key={file._id}
                title={file.title}
                listType="file"
                id={customFileId}
                iconId={file.iconId}
              />
            );
          })}
      </AccordionContent>
  }
    </AccordionItem>
  );
};

export default Dropdown;
