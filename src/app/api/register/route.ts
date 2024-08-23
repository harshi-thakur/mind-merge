import sendEmail from "@/lib/email";
import { createUser, findUser, generateOTP,getHashedOTP } from "@/lib/mongoDb/queries";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const POST = async (request: any) => {
    const { email, password } = await request.json();
    let user = await findUser(email);
    if (user && user.verified)
        return new NextResponse(JSON.stringify({ message: "Email is already in use" }), { status: 400 });
    else {
        if (!user) {
            await createUser({ email: email, password: password, verified: false });
            user = await findUser(email);
        }
        const otp = await generateOTP(user._id + "");
        if (otp) {
            await sendEmail(email, otp);
            return new NextResponse(JSON.stringify({ message: "OTP sent to your email." }), { status: 200 });
        }
        else
            return new NextResponse(JSON.stringify({ message: "Failed to send OTP ." }), { status: 400 });

    }
}
export const GET = async (request: any) => {
    const url = new URL( request.url);
    const searchParams=new URLSearchParams(url.search);
    const email=searchParams.get("email");
    const pin=searchParams.get("pin");
    const user = await findUser(email+"");
    if (user && !user.verified) {
        const hash_code = await getHashedOTP(user._id);
        if (hash_code) {
            const verify = await bcrypt.compare(pin+"", hash_code);
            if (verify){
                user.verified=true;
                await user.save();
                return new NextResponse(JSON.stringify({ message: "Email Verified" }), { status: 200 });
            }
        }
        else
            return new NextResponse(JSON.stringify({ message: "Failed to verify ." }), { status: 400 });

    }
    // if()
}
