'use client';
import {useAppState} from '@/lib/providers/state-provider';
import { UploadBannerFormSchema } from '@/lib/types';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Loader from '../global/Loader';
import { fetchRequest } from '@/lib/apiRequest';
import firebaseUpload from '@/lib/firebase/queries';


interface BannerUploadFormProps {
  dirType: 'workspace' | 'file' | 'folder';
  id: string;
}

const BannerUploadForm: React.FC<BannerUploadFormProps> = ({ dirType, id }) => {
  const { workspaceId, folderId, dispatch } = useAppState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      banner: '',
    },
  });
  const onSubmitHandler: SubmitHandler<
    z.infer<typeof UploadBannerFormSchema>
  > = async (values) => {
    const file = values.banner?.[0];
    if (!file || !id) return;
    try {
      let filePath = "";
      const uploadBanner = async () => {
            filePath= await firebaseUpload(file);
      };
      if (dirType === 'file') {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { bannerUrl: filePath},
            fileId: id,
            folderId,
            workspaceId,
          },
        });
        await fetchRequest("PUT","files",{body:{obj:{ bannerUrl: filePath },fileId:id}});
      } else if (dirType === 'folder') {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: id,
            folder: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await fetchRequest("PUT","folders",{body:{obj:{ bannerUrl: filePath },folderId:id}});
      } else if (dirType === 'workspace') {
        if (!workspaceId) return;
        await uploadBanner();
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await fetchRequest("PUT","workspace",{body:{obj:{ bannerUrl: filePath },id}});
      }
    } catch (error) {}
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-2"
    >
      <Label
        className="text-sm text-muted-foreground"
        htmlFor="bannerImage"
      >
        Banner Image
      </Label>
      <Input
        id="bannerImage"
        type="file"
        accept="image/*"
        disabled={isUploading}
        {...register('banner', { required: 'Banner Image is required' })}
      />
      <small className="text-red-600">
        {errors.banner?.message?.toString()}
      </small>
      <Button
        disabled={isUploading}
        type="submit"
      >
        {!isUploading ? 'Upload Banner' : <Loader />}
      </Button>
    </form>
  );
};

export default BannerUploadForm;