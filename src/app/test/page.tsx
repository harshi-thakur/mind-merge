'use client'
'use client';
import { useAppState } from '@/lib/providers/state-provider';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// import '@/components/quill-editor/quill.css';
import 'quill/dist/quill.snow.css';
// import 'quill/dist/quill.core.css';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import EmojiPicker from '@/components/global/emoji-picker';
// import BannerUpload from '@/components/banner-upload/banner-upload';
import { XCircleIcon } from 'lucide-react';

import {Folder,File,Workspace} from '@/lib/mongoDb/mongoTypes';

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  fileId: string;
  dirType: 'file' | 'folder' |'Workspace' ;
}
const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];
 const QuillTextEditor: React.FC<QuillEditorProps> = ({
  dirDetails,
  dirType,
  fileId,
}) => {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [saving, setSaving] = useState(false);
  const [quill, setQuill] = useState<any>(null);
  const user  = {_id:"66991e69e33e3c6a167ab36e"};
  const details={
    inTrash:false,
    bannerUrl:"https://firebasestorage.googleapis.com/v0/b/mind-merge-ecfae.appspot.com/o/328031459-2aa78caf-11d3-4846-968c-6813de042ec7.png?alt=media&token=c5ed907b-f4e6-4bbc-a83b-5de9e6755cdc",
    iconId:"💀",
    title:"The new Test Case"
  }
  useEffect(() => {
    if (quill === null || 
      // socket === null ||
       !fileId || !user) return;

    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === 'user' && cursorId) {
          // socket.emit('send-cursor-move', range, fileId, cursorId);
        }
      };
    };
  const quillHandler = (delta: any, oldDelta: any, source: any) =>{
    if (source !== 'user') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    const contents = quill.getContents();
    const quillLength = quill.getLength();
    saveTimerRef.current = setTimeout(async () => {
      console.log("hey saving...")
      // if (contents && quillLength !== 1 && fileId) {
      //   if (dirType == 'Workspace') {
      //     dispatch({
      //       type: 'UPDATE_WORKSPACE',
      //       payload: {
      //         Workspace: { data: JSON.stringify(contents) },
      //         workspaceId: fileId,
      //       },
      //     });
      //     await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
      //   }
      //   if (dirType == 'folder') {
      //     if (!workspaceId) return;
      //     dispatch({
      //       type: 'UPDATE_FOLDER',
      //       payload: {
      //         folder: { data: JSON.stringify(contents) },
      //         workspaceId,
      //         folderId: fileId,
      //       },
      //     });
      //     await updateFolder({ data: JSON.stringify(contents) }, fileId);
      //   }
      //   if (dirType == 'file') {
      //     if (!workspaceId || !folderId) return;
      //     dispatch({
      //       type: 'UPDATE_FILE',
      //       payload: {
      //         file: { data: JSON.stringify(contents) },
      //         workspaceId,
      //         folderId: folderId,
      //         fileId,
      //       },
      //     });
      //     await updateFile({ data: JSON.stringify(contents) }, fileId);
      //   }
      // }
      setSaving(false);
    }, 850);
    // socket.emit('send-changes', delta, fileId);
  };
  quill.on('text-change', quillHandler);
  // quill.on('selection-change', selectionChangeHandler(user._id));

  return () => {
    quill.off('text-change', quillHandler);
    // quill.off('selection-change', selectionChangeHandler);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  };
},[quill] 
// [quill, socket, fileId, user, details, folderId, workspaceId, dispatch]
);
  const wrapperRef = useCallback((wrapper: any) => {
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      Quill.register('modules/cursors', QuillCursors);
      const q = new Quill(editor, {
        theme: 'snow',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    }
  }, []);
  return(
    <>
    <div className="relative">
      {details.inTrash && (
        <article
          className="py-2 
        z-40 
        bg-[#EB5757] 
        flex  
        md:flex-row 
        flex-col 
        justify-center 
        items-center 
        gap-4 
        flex-wrap"
        >
          <div
            className="flex 
          flex-col 
          md:flex-row 
          gap-2 
          justify-center 
          items-center"
          >
            <span className="text-white">
              This {dirType} is in the trash.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent
              border-white
              text-white
              hover:bg-white
              hover:text-[#EB5757]
              "
              // onClick={restoreFileHandler}
            >
              Restore
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-transparent
              border-white
              text-white
              hover:bg-white
              hover:text-[#EB5757]
              "
              // onClick={deleteFileHandler}
            >
              Delete
            </Button>
          </div>
          <span className="text-sm text-white">{details.inTrash}</span>
        </article>
      )}
      <div
        className="flex 
      flex-col-reverse 
      sm:flex-row 
      sm:justify-between 
      justify-center 
      sm:items-center 
      sm:p-2 
      p-8"
      >
        {/* <div>{breadCrumbs}</div> */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10">
            {/* {collaborators?.map((collaborator) => (
              <TooltipProvider key={collaborator._id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar
                      className="
                  -ml-3 
                  bg-background 
                  border-2 
                  flex 
                  items-center 
                  justify-center 
                  border-white 
                  h-8 
                  w-8 
                  rounded-full
                  "
                    >
                      <AvatarImage
                        src={
                          collaborator.avatar_url ? collaborator.avatar_url : ''
                        }
                        className="rounded-full"
                      />
                      <AvatarFallback>
                        {collaborator.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{collaborator.email}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))} */}
          </div>
          {saving ? (
            <Badge
              variant="secondary"
              className="bg-orange-600 top-4
              text-white
              right-4
              z-50
              "
            >
              Saving...
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-emerald-600 
              top-4
            text-white
            right-4
            z-50
            "
            >
              Saved
            </Badge>
          )}
        </div>
      </div>
    </div>
    {details.bannerUrl && (
      <div className="relative w-full h-[200px]">
        <Image
          src={
            details.bannerUrl
          }
          fill
          className="w-full md:h-48
          h-20
          object-cover"
          alt="Banner Image"
        />
      </div>
    )}
    <div
      className="flex 
      justify-center
      items-center
      flex-col
      mt-2
      relative
    "
    >
      <div
        className="w-full 
      self-center 
      max-w-[800px] 
      flex 
      flex-col
       px-7 
       lg:my-8"
      >
        <div className="text-[80px]">
          <EmojiPicker 
          // getValue={iconOnChange}
          >
            <div
              className="w-[100px]
              cursor-pointer
              transition-colors
              h-[100px]
              flex
              items-center
              justify-center
              hover:bg-muted
              rounded-xl"
            >
              {details.iconId}
            </div>
          </EmojiPicker>
        </div>
        <div className="flex ">
          {/* <BannerUpload
            id={fileId}
            dirType={dirType}
            className="mt-2
            text-sm
            text-muted-foreground
            p-2
            hover:text-card-foreground
            transition-all
            rounded-md"
          >
            {details.bannerUrl ? 'Update Banner' : 'Add Banner'}
          </BannerUpload> */}
          {details.bannerUrl && (
            <Button
              // disabled={deletingBanner}
              // onClick={deleteBanner}
              variant="ghost"
              className="gap-2 hover:bg-background
              flex
              item-center
              justify-center
              mt-2
              text-sm
              text-muted-foreground
              w-36
              p-2
              rounded-md"
            >
              <XCircleIcon size={16} />
              <span className="whitespace-nowrap font-normal">
                Remove Banner
              </span>
            </Button>
          )}
        </div>
        <span
          className="
          text-muted-foreground
          text-3xl
          font-bold
          h-9
        "
        >
          {details.title}
        </span>
        <span className="text-muted-foreground text-sm">
          {/* {dirType.toUpperCase()} */}
          {"Folder"}
        </span>
      </div>
      <div
        id="container"
        className="max-w-[800px]"
        ref={wrapperRef}
      ></div>
    </div>
  </>
  );
};


export default QuillTextEditor;