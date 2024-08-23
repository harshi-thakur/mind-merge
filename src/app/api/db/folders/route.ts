import { createFolder, deleteFolder, getFolderDetails, getFolders, updateFolder } from "@/lib/mongoDb/queries";
import { NextResponse } from "next/server";
export const POST = async (request: any) => {
    const res= await request.json();
    try{
        const id =await createFolder(res);
        return new NextResponse(JSON.stringify({ id: id }), { status: 200 });
    }catch(err){
        return new NextResponse(JSON.stringify({ id: '' }),{ status: 500 });
    }

}
export const PUT= async (request: any) => {
    const res= await request.json();
    try{
        await updateFolder(res.obj,res.folderId);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}

export const GET=async(request: any) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const workspaceId = searchParams.get("workspaceId");
    const folderId = searchParams.get("folderId");
    if (workspaceId) {
        const folders = await getFolders(workspaceId);
        return new NextResponse(JSON.stringify({folders: folders }), { status: 200 });
    }
    if (folderId) {
        const folders = await getFolderDetails(folderId);
        return new NextResponse(JSON.stringify({folders: folders }), { status: 200 });
    }
    return new NextResponse(JSON.stringify({ folders: [] }), { status: 400 });

}
export const DELETE= async (request: any) => {
    const res= await request.json();
    try{
        await deleteFolder(res.id);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}