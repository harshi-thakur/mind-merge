'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Logo from '../../../public/Logo.png';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/modeToggle';
import { useSession } from 'next-auth/react';
import LogoutButton from '../global/logout-button';
import { LogOut } from 'lucide-react';

const routes = [
  { title: 'Features', href: '#features' },
  { title: 'Reasources', href: '#resources' },
  { title: 'Pricing', href: '#pricing' },
  { title: 'Testimonials', href: '#testimonial' },
];

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Alert Dialog',
    href: '#',
    description:
      'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '#',
    description:
      'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '#',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '#',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '#',
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '#',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

const Header = () => {
  const [path, setPath] = useState('#products');
  const session= useSession();
  return (
    <header
      className="p-4
      flex
      justify-center
      items-center
  "
    >
      <Link
        href={'/'}
        className="w-full flex gap-2
        justify-left items-center"
      >
        <Image
          src={Logo}
          alt="Logo"
          width={50}
          height={50}
        />
        <span
          className="font-semibold
          dark:text-white
        "
        >
         Mind-merge
        </span>
      </Link>
      <NavigationMenu className="hidden lg:block">
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#resources')}
              className={`
                ${path === '#resources'?'dark:text-white':'dark:text-white/40'} 
                font-normal text-xl
              `}
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul
                className="grid
                gap-3
                p-6
                md:w-[400px]
                ld:w-[500px]
                lg:grid-cols-[.75fr_1fr]
                "
              >
                <li className="row-span-3">
                  <span
                    className="flex h-full w-full select-none
                  flex-col
                  justify-end
                  rounded-md
                  bg-gradient-to-b
                  from-muted/50
                  to-muted
                  p-6 no-underline
                  outline-none
                  focus:shadow-md
                  "
                  >
                    Welcome
                  </span>
                </li> 
                <ListItem
                  href="#"
                  title="Introduction"
                  className=''
                >
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem
                  href="#"
                  title="Installation"
                >
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem
                  href="#"
                  title="Typography"
                >
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#pricing')}
              className={`
                 ${path === '#pricing'?'dark:text-white':'dark:text-white/40'}
                font-normal
                text-xl': true
              `}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4  md:grid-row-2  ">
                <ListItem
                  title="Pro Plan"
                  href={'#'}
                >
                  Unlock full power with collaboration.
                </ListItem>
                <ListItem
                  title={'free Plan'}
                  href={'#'}
                >
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuContent>
              <ul
                className="grid w-[400px]
              gap-3
              p-4
              md:w-[500px]
              md:grid-cols-2 
              lg:w-[600px]
              "
              >
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={`
                ${path === '#testimonials'?'dark:text-white':'dark:text-white/40'} 
                font-normal text-xl
              `}
            >
              Testimonial
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <aside
        className="flex
        w-full
        gap-2
        justify-end
      "
      > 
      <ModeToggle/>
      {session.status=='unauthenticated'&&<>
        <Link href={'/login'}>
          <Button variant="outline">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            variant="outline"
            className="whitespace-nowrap"
          >
            Sign Up
          </Button>
        </Link>
        </>
    }
    {session.status=='authenticated'&&<>
        <Link href={'/dashboard'}>
          <Button variant="outline">
            Dashboard
          </Button>
        </Link>
        <LogoutButton>
          <div className="flex items-center">
            <LogOut />
          </div>
        </LogoutButton>
        </>
    }
      </aside>
    </header>
  );
};

export default Header;

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={`
             block select-none space-y-1 font-medium leading-none
          `}
          {...props}
        >
          <div className="text-black dark:text-white text-sm font-medium leading-none">
            {title}
          </div>
          <p
            className="dark:group-hover:text-white/70 group-hover:text-black/70
            line-clamp-2
            text-sm
            leading-snug
            dark:text-white/40 text-black/40
          "
          >
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = 'ListItem';
