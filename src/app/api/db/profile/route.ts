import { getProfile, getUsersFromSearch, updateProfile } from "@/lib/mongoDb/queries";
import { NextResponse } from "next/server";

export const GET = async (request: any) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    if (userId) {
        const user = await getProfile(userId);
        return new NextResponse(JSON.stringify({ user: user }), { status: 200 });
    }
    else if(email){
        console.log(email);
        const users = await getUsersFromSearch(email);
        return new NextResponse(JSON.stringify({ users: users }), { status: 200 });
    }
    return new NextResponse(JSON.stringify({ user: {} }), { status: 400 });
}
export const PUT=async(request:any)=>{
    const res= await request.json();
    try{
        await updateProfile(res.obj,res.email);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}