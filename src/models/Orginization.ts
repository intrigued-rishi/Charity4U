import * as mongoose from 'mongoose';
import {model} from 'mongoose';

import * as multer from 'multer';
import * as path from 'path';

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profile_pic_url: {type: String},
    ver_pic: {type: String, required: true},
    link: {type:Array, unique:false, sparse: false, default:[]},
    //description : {type : String, required : false},
    verified: {type: Boolean, required: true, default: false},
    address : {type: String, required: true},
    we_check: {type : Boolean, required: false , default : false},
    phone : {type: Number, required: true, unique:true},
    typeof: {type: String, required : false, default: "org"},
    verification_token: {type: Number, required: true},
    verification_token_time: {type: Date, required: true},
    username: {type: String, required: true},
    about:{type:String, required:true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()},
    donations:[String],
    donation: [{
        userID:mongoose.Schema.Types.ObjectId,
        name: String,
        phone:Number,
        address: String,
        description:String,
    }]

});


export default model('organization', userSchema);
