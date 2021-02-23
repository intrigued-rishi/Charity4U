import {Environment} from "./env";

export const OrgEnvironment : Environment = {
    db_url : 'mongodb+srv://mongodbuser:myuser@mongodb.2gpch.mongodb.net?retryWrites=true&w=majority',
   // jwt_secret : 'token'
    jwt_secret : 'organization'
};