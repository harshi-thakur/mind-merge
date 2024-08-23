import { startDb } from "./db";
import { collaborators, files, folders, users, verify, workspaces } from "./models";
import bcrypt from "bcryptjs";
import { Workspace, File, Folder,User } from "@/lib/mongoDb/mongoTypes"
export async function createUser(credential: {
  user_name?: string;
  email: string;
  password?: string;
  verified: boolean;
}) {
  await startDb();
  if (credential.password && !credential.verified) {//credential user
    const salt = await bcrypt.genSalt();
    const hashcode = await bcrypt.hash(credential.password, salt);
    await users.create({
      email: credential.email,
      password: hashcode,
      verified: false,
    });
  } else {
    await users.create({// google and github user
      user_name: credential.user_name,
      email: credential.email,
      verified: true,
    });
  }
}
export async function findUser(email: string) {
  await startDb();
  try {
    return await users.findOne({ email: email });
  } catch (err) {
    console.error(err);
  }
}

export async function getUserId(email: string) {
  await startDb();
  try {
    const userId = await users.findOne({ email: email }, "_id");
    return JSON.parse(JSON.stringify(userId));
  } catch (err) {
    console.error(err);
  }
}

export async function generateOTP(user_id: string) {
  await startDb();
  try {
    let verifyObject = await verify.findOne({ user_id: user_id });
    const myArray = new Uint32Array(1);
    crypto.getRandomValues(myArray);
    const otp = ("" + myArray[0]).substring(0, 6);
    const salt = await bcrypt.genSalt();
    const hash_code = await bcrypt.hash(otp, salt);
    if (verifyObject) {
      verifyObject.hash_code = hash_code; // Can implement stopping bulk otp
      await verifyObject.save();
    } else {
      await verify.create({
        user_id: user_id,
        hash_code: hash_code,
      });
    }
    return otp;
  } catch (err) {
    console.log(err);
  }
}
// export const getCollaborators=async (workspaceId:string){

// }
export const addCollaborators = async (users: any, workspaceId: string) => {
  try {
    for (const user of users) {
      // Check if the user is already a collaborator in the workspace
      const userExists = await collaborators.findOne({
        userId: user._id,
        workspaceId,
      });

      // If the user does not exist, insert them into the collaborators collection
      if (!userExists) {
        await new collaborators({
          workspaceId,
          userId: user._id,
        }).save();
      }
    }
    console.log('Collaborators added successfully.');
  } catch (error) {
    console.error('Error adding collaborators:', error);
  }
};

export const removeCollaborators = async (users: any, workspaceId: string) => {
  try {
    for (const user of users) {
      const result = await collaborators.findOneAndDelete({
        userId: user.id,
        workspaceId,
      });

      if (result) {
        console.log(`Collaborator with userId: ${user.id} removed from workspaceId: ${workspaceId}.`);
      } else {
        console.log(`Collaborator with userId: ${user.id} not found in workspaceId: ${workspaceId}.`);
      }
    }
    console.log('Collaborators removed successfully.');
  } catch (error) {
    console.error('Error removing collaborators:', error);
  }
}
export async function getHashedOTP(user_id: string) {
  await startDb();
  try {
    let verifyObject = await verify.findOne({ user_id: user_id });
    if (verifyObject) return verifyObject.hash_code;
    else "";
  } catch (err) {
    console.log(err);
  }
}
export async function createWorkspace(newWorkspace: Workspace) {
  await startDb();
  try {
    const workspace = new workspaces(newWorkspace);
    await workspace.save();
    return workspace._id;
  } catch (err) {
    console.log(err);
  }
}

export async function deleteFile(fileId: string) {
  await startDb();
  try {
    return await files.findOneAndDelete({ _id: fileId });
  } catch (err) {
    console.log(err);
  }
}
export async function deleteFolder(folderId: string) {
  await startDb();
  try {
    return await folders.findOneAndDelete({ _id: folderId });
  } catch (err) {
    console.log(err);
  }
}

export async function deleteWorkspace(workspaceId: string) {
  await startDb();
  try {
    return await workspaces.findOneAndDelete({ _id: workspaceId });
  } catch (err) {
    console.log(err);
  }
}
export async function getWorkspace(userId: string) {
  await startDb();
  try {
    return await workspaces.findOne({ workspaceOwner: userId }, "_id");
  } catch (err) {
    console.log(err);
  }
}

export async function getCollaboratingWorkspaces(userId: string): Promise<Workspace[]> {
  await startDb();
  try {
    if (!userId) return [];
    const collaboratingWorkspaces = await collaborators.where("userId").equals(userId).populate("workspaceId").exec();
    return JSON.parse(JSON.stringify(collaboratingWorkspaces));
  } catch (err) {
    console.log(err);
  }
  return [];
}
export async function getWorkspaces(userId: string): Promise<any> {
  await startDb();
  try {
    if (!userId) return [];
    const WorkspaceIds = await workspaces.find({ workspaceOwner: userId }, '_id');
    const sharedWorkspacesIds = await collaborators.find({ workspaceId: { $in: WorkspaceIds } }).distinct("workspaceId");
    const sharedWorkspaces= await workspaces.find({_id:{$in:sharedWorkspacesIds} ,workspaceOwner: userId}) as [];
    const privateWorkspaces= await workspaces.find({_id:{$nin:sharedWorkspacesIds},workspaceOwner: userId }) as [];
    const result = await collaborators.where("userId").equals(userId).populate("workspaceId").select('workspaceId').exec();
    const collaboratingWorkspaces= result.map(item=>item.workspaceId);
  
  //   const result= await workspaces.aggregate([{
  //     $facet:{
  //       privateWorkspaces:[
  //         {
  //           $match:{
  //           workspaceOwner:userId,
  //           // _id:{$nin:sharedWorkspacesIds}
  //           }
  //         }
  //       ],
  //       sharedWorkspaces:[
  //         {
  //           $match:{
  //           workspaceOwner:userId,
  //           _id:{$in:sharedWorkspacesIds}
  //           }
  //         }
  //       ],
  //     }
  // }]).exec();
  //  const {privateWorkspaces,sharedWorkspaces}=result[0];
  //  console.log(result[0]);
    return JSON.parse(JSON.stringify({
      privateWorkspaces:privateWorkspaces,
      sharedWorkspaces:sharedWorkspaces,
      collaboratingWorkspaces:collaboratingWorkspaces
    }));  
   
  } catch (err) {
    console.log(err);
  }
  return [];
}

export async function getFolders(workspaceId: string) {
  startDb();
  try {
    const workspaceFolder = await folders.find({ workspaceId: workspaceId });
    return JSON.parse(JSON.stringify(workspaceFolder));
  } catch (err) {
    console.log(err);
  }
}

export async function getPrivateWorkspaces(userId: string): Promise<Workspace[]> {
  startDb();
  try {
    if (!userId) return [];
    const collaboratedWorkspaceIds = await collaborators.find({ userId: userId }, 'workspaceId');
    const privateWorkspaces = await workspaces.find({ _id: { $nin: collaboratedWorkspaceIds }, workspaceOwner: userId });
    return JSON.parse(JSON.stringify(privateWorkspaces));
  } catch (err) {
    console.log(err);
  }
  return [];

}


export async function getFiles(folderId: string) {
  startDb();
  try {
    const reqFiles=await files.find({ folderId: folderId }).sort([['updatedAt', -1]]);
    return JSON.parse(JSON.stringify(reqFiles));
  } catch (err) {
    console.log(err);
    return [];
  }
}
export async function updateFile(obj: any, fileId: string) {
  await startDb();
  try {
    await files.findByIdAndUpdate(fileId, obj);
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}
export async function updateProfile(obj: any, email: string) {
  await startDb();
  try {
    await users.findOneAndUpdate({email:email}, obj);
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}
export async function getUsersFromSearch (email:string){
  if (!email) return [];
  await startDb();
  try {
    const searchedUser = await users.find({ email: new RegExp(`^${email}`, 'i') },'_id email avatar_url');
    return searchedUser;
  } catch (error) {
    console.error(error);
    return [];
  }
};
export async function updateFolder(obj: any, folderId: string) {
  await startDb();
  try {
  
    await folders.findByIdAndUpdate(folderId, obj).exec();
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}
export async function updateWorkspace(obj: any, workspaceId: string) {
  await startDb();
  try {
    await workspaces.findByIdAndUpdate(workspaceId, obj);
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}
export async function createFile(newFile: File) {
  await startDb();
  try {
    const file = new files(newFile);
    await file.save();
    return file._id;
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}

export async function createFolder(newFolder: Folder) {
  await startDb();
  try {
    const folder = new folders(newFolder);
    await folder.save();
    return folder._id;
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}

export async function getFileDetails(fileId: string) {
  await startDb();
  try {
    const fileDetails = await files.findById(fileId);
    return (JSON.parse(JSON.stringify(fileDetails)))as File[];
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}
export async function getFolderDetails(folderId: string) {
  await startDb();
  try {
    const folderDetails=(await folders.findById(folderId))as Folder[];
    return JSON.parse(JSON.stringify(folderDetails));
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}

export async function getWorkspaceDetails(workspaceId: string) {
  await startDb();
  try {
    const workspaceDetails=await workspaces.findById(workspaceId);
    return (JSON.parse(JSON.stringify(workspaceDetails)))as Workspace[];
  } catch (err) {
    console.log(err);
    throw new Error('');
  }
}
export async function getProfile(userId: string) {
  return users.findById(userId).select('avatarUrl email');
}
export async function getCollaborators(workspaceId: string) {
  await startDb();
  try {
    const collab= await collaborators.where("workspaceId")
                           .equals(workspaceId)
                           .populate("userId",'avatar_url email username')
                           .select('userId -_id')
                           .lean()
                           .exec() as[];
         return  collab.map((item:{userId:Partial<User>}) => item.userId);                 

  } catch (err) {
    console.log(err);
  }
}
