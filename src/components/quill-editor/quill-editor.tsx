'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { ref, onValue, set,push, onDisconnect, remove } from 'firebase/database';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { File, Folder, Workspace } from '@/lib/mongoDb/mongoTypes';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import 'quill/dist/quill.snow.css';
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
import BannerUpload from '@/components/banner-upload/banner-upload';
import { XCircleIcon } from 'lucide-react';
import { useSocket } from '@/lib/providers/socket-provider';
import { deleteImage } from '@/lib/firebase/queries';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase/firebase.config';

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  fileId: string;
  dirType: 'file' | 'folder' |'workspace' ;
}
var TOOLBAR_OPTIONS = [
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

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirDetails,
  dirType,
  fileId,
}) => {
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const session=useSession();
  const [user,setUser]  = useState({_id:"",email:"",avatar_url:''});
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const pathname = usePathname();
  const [quill, setQuill] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<
    { _id: string; email: string; avatar_url: string }[]
  >([]);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);
  useEffect(()=>{
    // console.log(session?.data?.user?.email);
    fetch(`/api/db/profile?email=${session?.data?.user?.email}`,
      {method:'GET'}
    )
    .then((res)=>res.json())
    .then((data)=>{
      console.log(data);
      setUser(data.users[0]);
    });
  },[])
  const details = useMemo(() => {
    let selectedDir;
    if (dirType === 'file') {
      selectedDir = state.workspaces
        .find((Workspace) => Workspace._id === workspaceId)
        ?.folders.find((folder) => folder._id === folderId)
        ?.files.find((file) => file._id === fileId);
    }
    if (dirType === 'folder') {
      selectedDir = state.workspaces
        .find((Workspace) => Workspace._id === workspaceId)
        ?.folders.find((folder) => folder._id === fileId);
    }
    if (dirType === 'workspace') {
      selectedDir = state.workspaces.find(
        (Workspace) => Workspace._id === fileId
      );
    }

    if (selectedDir) {
      return selectedDir;
    }

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
    //   createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as Workspace | Folder | File;
  }, [state, workspaceId, folderId]);

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname
      .split('/')
      .filter((val) => val !== 'dashboard' && val);
    const workspaceDetails = state.workspaces.find(
      (Workspace) => Workspace._id === workspaceId
    );
    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : '';
    if (segments.length === 1) {
      return workspaceBreadCrumb;
    }

    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder._id === folderSegment
    );
    const folderBreadCrumb = folderDetails
      ? `/ ${folderDetails.iconId} ${folderDetails.title}`
      : '';

    if (segments.length === 2) {
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    }

    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      (file) => file._id === fileSegment
    );
    const fileBreadCrumb = fileDetails
      ? `/ ${fileDetails.iconId} ${fileDetails.title}`
      : '';

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [state, pathname, workspaceId]);

  //
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

  const restoreFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { inTrash: '' }, fileId, folderId, workspaceId },
      });
       await fetch('/api/db/files',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj: { inTrash: ''  },
          fileId: fileId
        })
      });
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: { folder: { inTrash: '' }, folderId: fileId, workspaceId },
      });
       await fetch('/api/db/folders',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj:{ inTrash: '' },
          folderId:fileId,// have to make sure it is folder id
        })
      });
    }
  };

  const deleteFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'DELETE_FILE',
        payload: { fileId, folderId, workspaceId },
      });
      await fetch('api/db/files',{
        method:'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({id:fileId}),
      });
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'DELETE_FOLDER',
        payload: { folderId: fileId, workspaceId },
      });
      await fetch('api/db/folders',{
        method:'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({id:fileId}),
      });
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  const iconOnChange = async (icon: string) => {
    if (!fileId) return;
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { iconId: icon }, workspaceId: fileId },
      });
      await fetch('/api/db/workspace',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj:{ iconId: icon },
          id:fileId,// have to make sure it is folder id
        })
      });
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { iconId: icon },
          workspaceId,
          folderId: fileId,
        },
      });
      await fetch('/api/db/folders',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj:{ iconId: icon },
          folderId:fileId,// have to make sure it is folder id
        })
      });
    }
    if (dirType === 'file') {
      if (!workspaceId || !folderId) return;

      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { iconId: icon }, workspaceId, folderId, fileId },
      });
      await fetch('/api/db/files',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj:{ iconId: icon },
          fileId:fileId,// have to make sure it is folder id
        })
      });
    }
  };

  const deleteBanner = async () => {
    if (!fileId) return;
    setDeletingBanner(true);
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'UPDATE_FILE',
        payload: { file: { bannerUrl: '' }, fileId, folderId, workspaceId },
      });
      await deleteImage(details.bannerUrl+"");
     
      await fetch('/api/db/files',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          obj:{  bannerUrl: '' },
          fileId:fileId,// have to make sure it is folder id
        })
      });
    }
    if (dirType === 'folder') {
      if (!workspaceId) return;
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: { folder: { bannerUrl: '' }, folderId: fileId, workspaceId },
      });
      await deleteImage(details.bannerUrl+"");
      
      await fetch('/api/db/folders',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
            obj:{  bannerUrl: '' },
          folderId:fileId,// have to make sure it is folder id
        })
      });
    }
    if (dirType === 'workspace') {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: {
          workspace: { bannerUrl: '' },
          workspaceId: fileId,
        },
      });
      await deleteImage(details.bannerUrl+"");
      
      await fetch('/api/db/workspace',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
        obj:{  bannerUrl: '' },
          id:fileId,// have to make sure it is folder id
        })
      });
    }
    setDeletingBanner(false);
  };

  useEffect(() => {
    if (!fileId) return;
    const fetchInformation = async () => {
      if (dirType === 'file') {
        const res= await fetch(`/api/db/files?fileId=${fileId}`,{
          method: 'GET',
        });
        const data= await res.json();
        const selectedDir= data.files;
        if (!selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir) {
          if (!workspaceId) return;
          return router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill === null) return;
        if (!selectedDir.data) return;
        quill.setContents(JSON.parse(selectedDir.data));
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { data: selectedDir.data },
            fileId,
            folderId: selectedDir.folderId,
            workspaceId,
          },
        });
      }
      if (dirType === 'folder') {
          const res= await fetch(`/api/db/folders?folderId=${fileId}`,{
            method: 'GET',
          });
          const data= await res.json();
          const selectedDir= data.folders;
        if ( !selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir) {
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (quill === null) return;
        if (!selectedDir.data) return;
        quill.setContents(JSON.parse(selectedDir.data));
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: fileId,
            folder: { data: selectedDir.data },
            workspaceId: selectedDir.workspaceId,
          },
        });
      }
      if (dirType === 'workspace') {
        const res= await fetch(`/api/db/workspace?workspaceId=${fileId}`,{
          method: 'GET',
        });
        const data= await res.json();
        const selectedDir= data.workspaces;
        if ( !selectedDir) {
          return router.replace('/dashboard');
        }
        if (!selectedDir || quill === null) return;
        if (!selectedDir.data) return;
        quill.setContents(JSON.parse(selectedDir.data));
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { data: selectedDir.data },
            // workspace: { data: JSON.stringify(selectedDir.data) },
            workspaceId: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, quill, dirType]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return;
    
    const socketHandler = (range: any, roomId: string, cursorId: string) => {
      if (roomId === fileId) {
        console.log("CURSOR");
        const cursorToMove = localCursors.find(
          (c: any) => c.cursors()?.[0]._id === cursorId
        );
        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };
    socket.on('receive-cursor-move', socketHandler);
    return () => {
      socket.off('receive-cursor-move', socketHandler);
    };
  }, [quill, socket, fileId, localCursors]);

  //rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    console.log("Room created");
    socket.emit('create-room', fileId);
  }, [socket, quill, fileId]);

  //Send quill changes to all clients
  useEffect(() => {
    if (quill === null || socket === null ||  !fileId || !user) return;

    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === 'user' && cursorId) {
          // console.log("Socket part");
          socket.emit('send-cursor-move', range, fileId, cursorId);
        }
      };
    };
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          if (dirType == 'workspace') {
            dispatch({
              type: 'UPDATE_WORKSPACE',
              payload: {
                workspace: { data: JSON.stringify(contents) },
                workspaceId: fileId,
              },
            });
             await fetch('/api/db/workspace', {
              method: 'PUT',
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                obj: { data: JSON.stringify(contents)  },
                id: fileId,
              }),
            });
          }
          if (dirType == 'folder') {
            if (!workspaceId) return;
            dispatch({
              type: 'UPDATE_FOLDER',
              payload: {
                folder: { data: JSON.stringify(contents) },
                workspaceId,
                folderId: fileId,
              },
            });
            await fetch('/api/db/folders',{
              method:"PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body:JSON.stringify({
                obj:{ data: JSON.stringify(contents)  },
                folderId:fileId,// have to make sure it is folder id
              })
            }); 
          }
          if (dirType == 'file') {
            if (!workspaceId || !folderId) return;
            dispatch({
              type: 'UPDATE_FILE',
              payload: {
                file: { data: JSON.stringify(contents) },
                workspaceId,
                folderId: folderId,
                fileId,
              },
            });
            await fetch('/api/db/files',{
              method:"PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body:JSON.stringify({
                obj:{ data: JSON.stringify(contents) },
                fileId:fileId,// have to make sure it is folder id
              })
            });
          }
        }
        setSaving(false);
      }, 850);
      // console.log("cnjiehfcibeuberu");
      socket.emit('send-changes', delta, fileId);
    };
    quill.on('text-change', quillHandler);
    quill.on('selection-change', selectionChangeHandler(user._id));

    return () => {
      quill.off('text-change', quillHandler);
      quill.off('selection-change', selectionChangeHandler(user._id));
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, user, details, folderId, workspaceId, dispatch]);

  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };
    socket.on('receive-changes', socketHandler);
    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);

  useEffect(() => {
    if (!fileId || quill === null || !user||user._id=='') return;
    // Reference to the room's collaborators in the database
    const roomRef = ref(db, `rooms/${fileId}/collaborators`);
    const userRef = ref(db, `rooms/${fileId}/collaborators/${user._id}`);
    console.log(user,);
    // Sync presence state with the database
    const syncPresence = onValue(roomRef, (snapshot) => {
      const newState = snapshot.val();
      console.log(newState);
      if(newState){
        const newCollaborators = Object.values(newState) as any;
        setCollaborators(newCollaborators);
        if (user) {
          const allCursors: any = [];
          newCollaborators.forEach(
            (collaborator: { _id: string; email: string; avatar_url: string }) => {
              if (collaborator._id !== user._id) {
                const userCursor = quill.getModule('cursors');
                userCursor.createCursor(
                  collaborator._id,
                  collaborator.email.split('@')[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                );
                console.log(userCursor);
                allCursors.push(userCursor);
              }
            }
          );
          setLocalCursors(allCursors);
        }
      }
    });
 
    // Track the current user in the database
    set(userRef, {
      id: user._id,
      email: user.email?.split('@')[0],
      avatar_url: user.avatar_url,
    });
  
    // Remove the user from the database on disconnect
    onDisconnect(userRef).remove();
  
    return () => {
      remove(userRef); // Clean up the user's data
      syncPresence(); // Unsubscribe from the syncPresence listener
    };
  }, [fileId, quill, user]);
  
  
  return (
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
                onClick={restoreFileHandler}
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
                onClick={deleteFileHandler}
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
          <div>{breadCrumbs}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators[0]&&collaborators?.map((collaborator) => (
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
              ))}
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
            <EmojiPicker getValue={iconOnChange}>
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
            <BannerUpload
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
            </BannerUpload>
            {details.bannerUrl && (
              <Button
                disabled={deletingBanner}
                onClick={deleteBanner}
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
            {dirType.toUpperCase()}
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

export default QuillEditor;