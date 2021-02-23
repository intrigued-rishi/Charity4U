import * as jwt from 'jsonwebtoken';
import Org from '../models/Orginization';
import {getEnvironmentVariables} from "../environment/env";

export class ListController {
    //...................................fetch the entered organization's id........................................
    static async fetchId(req,res,next){
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.slice(7, authHeader.length) : null;
        jwt.verify(token, getEnvironmentVariables().jwt_secret, function(err, decodedToken) {
            if(err) {  next(err) }
            else {
                req.userId = decodedToken.user_id;
                req.usermail = decodedToken.email       // Add to req object
                console.log(req.userId)
                next();
            }
        });
    }
//.........................................................................................................................

 //......................................shows list of donations on oganization's side.....................................
    static async  listofdonations(req,res){
        let userid = req.userId
        const abs = await Org.findOne({_id:userid})
        res.send(abs["donation"])

    }
 //..........................................................................................................................
}
