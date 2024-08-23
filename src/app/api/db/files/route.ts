import { createFile, deleteFile, getFileDetails, getFiles, updateFile } from "@/lib/mongoDb/queries";
import { NextResponse } from "next/server";

export const GET = async (request: any) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const folderId = searchParams.get("folderId");
    const fileId = searchParams.get("fileId");
    if (folderId) {
        const files = await getFiles(folderId);
        return new NextResponse(JSON.stringify({ files: files }), { status: 200 });
    }
    if(fileId){
        const files = await getFileDetails(fileId);
        return new NextResponse(JSON.stringify({ files: files }), { status: 200 });
    }
    return new NextResponse(JSON.stringify({ files: [] }), { status: 400 });
}
export const POST =async (request: any) => {
    const res= await request.json();
    try{
        const id =await createFile(res);
        return new NextResponse(JSON.stringify({ id: id }), { status: 200 });
    }catch(err){
        return new NextResponse(JSON.stringify({ id: '' }),{ status: 500 });
    }
}
export const PUT= async (request: any) => {
    const res= await request.json();
    try{
        await updateFile(res.obj,res.fileId);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}
export const DELETE= async (request: any) => {
    const res= await request.json();
    try{
        await deleteFile(res.id);
        return new NextResponse(null, { status: 200 });
    }catch(err){
        return new NextResponse(null,{ status: 500 });
    }
}