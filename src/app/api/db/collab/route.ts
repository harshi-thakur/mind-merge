import { addCollaborators, getCollaborators, removeCollaborators } from "@/lib/mongoDb/queries";
import { NextResponse } from "next/server";

export const GET = async (request: any) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const workspaceId = searchParams.get("workspaceId");
    if (workspaceId) {
        const collaborators = await getCollaborators(workspaceId);
        return new NextResponse(JSON.stringify({ collaborators: collaborators }), { status: 200 });
    }
    return new NextResponse(JSON.stringify({ collaborators: [] }), { status: 400 });
}

export const POST =async (request: any) => {
    const res= await request.json();
    try{
        await addCollaborators(res.users,res.workspaceId);
        return new NextResponse(JSON.stringify({ message: "TRUE" }), { status: 200 });
    }catch(err){
        return new NextResponse(JSON.stringify({ message: 'FALSE' }),{ status: 500 });
    }
}

export const DELETE= async (request: any) => {
    const res= await request.json();
    try{
        await removeCollaborators(res.users,res.workspaceId);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}