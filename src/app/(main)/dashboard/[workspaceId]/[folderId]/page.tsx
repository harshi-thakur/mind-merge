export const dynamic = 'force-dynamic';

import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFolderDetails } from '@/lib/mongoDb/queries';
import { redirect } from 'next/navigation';
import { getSession } from 'next-auth/react';


const Folder = async ({ params }: { params: { folderId: string } }) => {
  const session =await getSession();
  // if(!session) redirect('/');
  let data = await getFolderDetails(params.folderId);
  data=JSON.parse(JSON.stringify(data))
  if (!data) redirect('/dashboard');
  return (
    <div className="relative ">
      <QuillEditor
        dirType="folder"
        fileId={params.folderId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default Folder;