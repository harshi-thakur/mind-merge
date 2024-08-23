export const dynamic = 'force-dynamic';

import QuillEditor from '@/components/quill-editor/quill-editor';
import { getFileDetails } from '@/lib/mongoDb/queries';
import { redirect } from 'next/navigation';
import React from 'react';
const File = async ({ params }: { params: { fileId: string } }) => {
  let data= await getFileDetails(params.fileId);
  data=JSON.parse(JSON.stringify(data))
  if (!data) redirect('/dashboard');

  return (
    <div className="relative ">
      <QuillEditor
        dirType="file"
        fileId={params.fileId}
        dirDetails={data[0] || {}}
      />
      {/* {params.fileId} */}
    </div>
  );
};

export default File;