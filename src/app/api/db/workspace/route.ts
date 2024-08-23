import { createWorkspace, deleteWorkspace,  getWorkspaceDetails, getWorkspaces, updateWorkspace } from "@/lib/mongoDb/queries";
import { NextResponse } from "next/server";
export const POST = async (request: any) => {
    const res= await request.json();
    try{
        const id =await createWorkspace(res);
        return new NextResponse(JSON.stringify({ id: id }), { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}

export const GET = async (request: any) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const userId = searchParams.get("userId");
    const workspaceId = searchParams.get("workspaceId");
    if (userId) {
        const {privateWorkspaces,sharedWorkspaces,collaboratingWorkspaces}= await getWorkspaces(userId);
        // const sharedWorkspaces = await getSharedWorkspaces(userId);
        // const collabWorkspaces = await getCollaboratingWorkspaces(userId);
        return new NextResponse(JSON.stringify({
            privateWorkspaces: privateWorkspaces,
            sharedWorkspaces:sharedWorkspaces,
            collaboratingWorkspaces:collaboratingWorkspaces }), { status: 200 });
    }
    if (workspaceId) {
        const workspaces = await getWorkspaceDetails(workspaceId);
        return new NextResponse(JSON.stringify({
            workspaces: workspaces,
        }), { status: 200 });
    }
    return new NextResponse(JSON.stringify({ privateWorkspaces: [],
        sharedWorkspaces:[],
    collabWorkspaces:[]}), { status: 400 });
}
export const PUT= async (request: any) => {
    const res= await request.json();
    try{
        await updateWorkspace(res.obj,res.id);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}
export const DELETE= async (request: any) => {
    const res= await request.json();
    try{
        await deleteWorkspace(res.id);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}