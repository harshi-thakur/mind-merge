"use client"
import Image from "next/image"
import Link from "next/link"
import Logo from"../../../public/Logo.png";
export default function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <div className="container relative flex h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">  
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <Link href="/">
          <div className="relative z-20 flex items-center text-lg gap-4 font-medium">
         
          <Image
          src={Logo}
          alt="Logo"
          width={50}
          height={50}
        />
            Mind Merge
          </div>
              </Link>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        {children}
      </div>
    </>
  )
}