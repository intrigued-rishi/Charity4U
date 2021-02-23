import * as mongoose from 'mongoose';
import {model} from 'mongoose';


const userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    verified: {type: Boolean, required: true, default: false},
    address : {type: String, required: true},
    phone : {type: Number, required: true, unique:true},
    typeof: {type: String, required : false, default: "don"},
    verification_token: {type: Number, required: true},
    verification_token_time: {type: Date, required: true},
    username: {type: String, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()},
     description:[{
         name:String,
         describe:String
     }]
});

export default model('donator', userSchema);
