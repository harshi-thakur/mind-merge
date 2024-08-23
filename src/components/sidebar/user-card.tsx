import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import {ModeToggle} from '@/components/ui/modeToggle';
import { LogOut, UserIcon } from 'lucide-react';
import LogoutButton from '../global/logout-button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findUser } from '@/lib/mongoDb/queries';



const UserCard = async () => {
  const session= await getServerSession(authOptions);
  if (!session?.user) return;
  const dbUser =await findUser(session.user?.email+"");
  const user=JSON.parse(JSON.stringify(dbUser));
  return (
    <article
      className="hidden
      sm:flex 
      justify-between 
      items-center 
      px-4 
      py-2 
      dark:bg-Neutrals/neutrals-12
      rounded-3xl
  "
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
           <UserIcon/>
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <small
            className="w-[100px] 
          overflow-hidden 
          overflow-ellipsis
          "
          >
            {user.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <LogoutButton>
          <LogOut />
        </LogoutButton>
        <ModeToggle />
      </div>
    </article>
  );
};

export default UserCard;
