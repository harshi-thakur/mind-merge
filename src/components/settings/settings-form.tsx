'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { useAppState } from '@/lib/providers/state-provider';
import { User, Workspace } from '@/lib/mongoDb/mongoTypes';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  User as UserIcon,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import CollaboratorSearch from '../global/collaborator-search';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import LogoutButton from '../global/logout-button';
import Link from 'next/link';
import { headers } from 'next/headers';
import { useSession } from 'next-auth/react';
import firebaseUpload from '@/lib/firebase/queries';
import Email from 'next-auth/providers/email';

const SettingsForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const session = useSession();
  const user= session.data?.user;
  const { state, workspaceId, dispatch } = useAppState();
  const [permissions, setPermissions] = useState('private');
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  //   const [loadingPortal, setLoadingPortal] = useState(false);

  //WIP PAYMENT PORTAL

  //   const redirectToCustomerPortal = async () => {
  //     setLoadingPortal(true);
  //     try {
  //       const { url, error } = await postData({
  //         url: '/api/create-portal-link',
  //       });
  //       window.location.assign(url);
  //     } catch (error) {
  //       console.log(error);
  //       setLoadingPortal(false);
  //     }
  //     setLoadingPortal(false);
  //   };
  //addcollborators
  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    await fetch("/api/db/collab", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        users: [profile],
        workspaceId: workspaceId,
      }),
    });
    setCollaborators([...collaborators, profile]);
  };

  //remove collaborators
  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions('private');
    }
    await fetch("/api/db/collab", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        users: [user],
        workspaceId: workspaceId,
      }),
    });
    setCollaborators(
      collaborators.filter((collaborator) => collaborator._id !== user._id)
    );
    router.refresh();
  };

  //on change
  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;
    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      // await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 500);
  };

  const onChangeWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const filePath= await firebaseUpload(file);

    if (filePath) {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { logo: filePath }, workspaceId },
      });
      await fetch('/api/db/workspace', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          obj: { logo: filePath },
          id: workspaceId,
        }),
      });
      setUploadingLogo(false);
    }
  };
  const onChangeProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfilePic(true);
    const filePath= await firebaseUpload(file);
    if (filePath) {
      await fetch('/api/db/profile', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          obj: { avatar_url: filePath },
          email: user?.email+"",
        }),
      });
      setUploadingProfilePic(false);
    }
  }
  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await fetch("/api/db/collab", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          users: collaborators,
          workspaceId: workspaceId,
        }),
      });;
    }
    setPermissions('private');
    setOpenAlertMessage(false);
  };

  const onPermissionsChange = (val: string) => {
    if (val === 'private') {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  //CHALLENGE fetching avatar details
  //WIP Payment Portal redirect

  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace._id === workspaceId
    );
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const res = await fetch(`/api/db/collab?workspaceId=${workspaceId}`,{
        method:'GET'
      });
      const data=await res.json();
      if (data) {
        setPermissions('shared');
        setCollaborators(data.collaborators);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
        Workspace
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Name
        </Label>
        <Input
          name="workspaceName"
          value={workspaceDetails ? workspaceDetails.title : ''}
          placeholder="Workspace Name"
          onChange={workspaceNameChange}
        />
        <Label
          htmlFor="workspaceLogo"
          className="text-sm text-muted-foreground"
        >
          Workspace Logo
        </Label>
        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          onChange={onChangeWorkspaceLogo}
          disabled={uploadingLogo}
        />
      </div>
      <>
        <Label htmlFor="permissions">Permissions</Label>
        <Select
          onValueChange={onPermissionsChange}
          value={permissions}
        >
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div
                  className="p-2
                  flex
                  gap-4
                  justify-center
                  items-center
                "
                >
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>
                      Your workspace is private to you. You can choose to share
                      it later.
                    </p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share></Share>
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <span>You can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {permissions === 'shared' && (
          <div>
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborator={(user) => {
                addCollaborator(user);
              }}
            >
              <Button
                type="button"
                className="text-sm mt-4"
              >
                <Plus />
                Add Collaborators
              </Button>
            </CollaboratorSearch>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                Collaborators {collaborators.length || ''}
              </span>
              <ScrollArea
                className="
            h-[120px]
            overflow-y-scroll
            w-full
            rounded-md
            border
            border-muted-foreground/20"
              >
                {collaborators.length ? (
                  collaborators.map((c) => (
                    <div
                      className="p-4 flex
                      justify-between
                      items-center
                "
                      key={c._id}
                    >
                      <div className="flex gap-4 items-center justify-end">
                        <Avatar>
                          <AvatarImage src="/avatars/7.png" />
                          <AvatarFallback>PJ</AvatarFallback>
                        </Avatar>
                        <div
                          className="text-sm 
                          gap-2
                          text-muted-foreground
                          overflow-hidden
                          overflow-ellipsis
                          w-[250px]
                        "
                        >
                          {c.email}
                        </div>
                      <Button
                        variant="secondary"
                        onClick={() => removeCollaborator(c)}
                      >
                        Remove
                      </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="absolute
                  right-0 left-0
                  top-0
                  bottom-0
                  flex
                  justify-center
                  items-center
                "
                  >
                    <span className="text-muted-foreground text-sm">
                      You have no collaborators
                    </span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
        <Alert variant={'destructive'}>
          <AlertDescription>
            Warning! deleting you workspace will permanantly delete all data
            related to this workspace.
          </AlertDescription>
          <Button
            type="submit"
            size={'sm'}
            variant={'destructive'}
            className="mt-4 
            text-sm
            bg-destructive/40 
            border-2 
            border-destructive"
            onClick={async () => {
              if (!workspaceId) return;
              await fetch('api/db/workspace',{
                method:'DELETE',
                headers: {
                  "Content-Type": "application/json",
                },
                body:JSON.stringify({id:workspaceId}),
              });
              toast({ title: 'Successfully deleted your workspae' });
              dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
              router.replace('/dashboard');
            }}
          >
            Delete Workspace
          </Button>
        </Alert>
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={20} /> Profile
        </p>
        <Separator />
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={''} />
            <AvatarFallback>
              <UserIcon/>
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ''}
            </small>
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              onChange={onChangeProfilePicture}
              disabled={uploadingProfilePic}
            />
          </div>
        </div>
        <LogoutButton>
          <div className="flex items-center">
            <LogOut />
          </div>
        </LogoutButton>
      </>
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDescription>
              Changing a Shared workspace to a Private workspace will remove all
              collaborators permanantly.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;