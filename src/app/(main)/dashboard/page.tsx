import { redirect } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findUser, getWorkspace } from '@/lib/mongoDb/queries';

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  // if (!session?.user) redirect(`/`);
  const dbUser =await findUser(session?.user?.email+"");
  const user=JSON.parse(JSON.stringify(dbUser))
  const workspace=await getWorkspace(user._id);
    if(workspace) redirect(`/dashboard/${workspace._id}`);
    return (
        <div
          className="bg-background
        h-screen
        w-screen
        flex
        justify-center
        items-center
        "
        >
          <DashboardSetup
            userId={user._id}
          />
        </div>
    );
  // }
};

export default DashboardPage;