export const dynamic = 'force-dynamic';

import { getWorkspaceDetails } from '@/lib/mongoDb/queries';
import React from 'react';
import QuillEditor from '@/components/quill-editor/quill-editor';
import { redirect } from 'next/navigation';
import { getSession } from 'next-auth/react';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  const session =await getSession();
  // if(!session) redirect('/');
  const data = await getWorkspaceDetails(params.workspaceId);
  if (!data) redirect('/dashboard');
  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default Workspace;