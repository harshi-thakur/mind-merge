import mongoose from "mongoose";
let ConnectionState: mongoose.ConnectionStates=0;
export async function startDb() {
    if(ConnectionState==1) return ;
    const uri ="mongodb+"+process.env.DB_URI;
    const db=await mongoose.connect(uri);
    ConnectionState=db.connections[0].readyState
    console.log('Connected to MongoDB');
}

