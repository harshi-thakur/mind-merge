import mongoose,{Schema}  from "mongoose";
export const userSchema = new Schema({
    user_name: {
        type: String,
        default:'',
        required:false,
    },
    avatar_url:{
      type:String,
      default:'',
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        default:'',
        required:'',
    },
    verified:{
        type:Boolean,
        required:true,
    }
}, { timestamps: true });

export const verifySchema= new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    hash_code:{
        type:String,
        default:"",
    },
},{timestamps:true});


export const workspaceSchema = new Schema({
  workspaceOwner: {
    type: Schema.Types.ObjectId,
        ref: 'users',
      required:true
  },
  title: {
    type: String,
    required: true,
  },
  iconId: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    default:'',
  },
  inTrash: {
    type: String,
    default:'',
  },
  logo: {
    type: String,
    default:'',
  },
  bannerUrl: {
    type: String,
    default:'',
  },
}, { timestamps: true });


export const folderSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  iconId: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    default:'',
  },
  inTrash: {
    type: String,
    default:'',
  },
  bannerUrl: {
    type: String,
    default:'',
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'workspaces',
  },
}, { timestamps: true });


export const fileSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  iconId: {
    type: String,
    required: true,
  },
  data: {
    type: String,
    default:'',
  },
  inTrash: {
    type: String,
    default:'',
  },
  bannerUrl: {
    type: String,
    default:'',
  },
  workspaceId: {
    type: Schema.Types.ObjectId,  
    required: true,
    ref: 'workspaces',
  },
  folderId: {
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'folders',
  },
}, { timestamps: true });

export const collaboratorSchema = new Schema({
    workspaceId: {
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'workspaces',
    },
    userId: {
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'users',
    },
  }, { timestamps: true });

export const collaborators =  mongoose.models.collaborators||mongoose.model('collaborators', collaboratorSchema);
export const workspaces = mongoose.models.workspaces||mongoose.model('workspaces', workspaceSchema);
export const folders = mongoose.models.folders||mongoose.model('folders', folderSchema);
export const files = mongoose.models.files||mongoose.model('files', fileSchema);
export const users = mongoose.models.users||mongoose.model('users', userSchema);
export const verify =mongoose.models.verify||mongoose.model('verify', verifySchema);
