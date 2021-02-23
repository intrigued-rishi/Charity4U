import {validationResult} from 'express-validator';
import * as Jwt from 'jsonwebtoken';
import {getEnvironmentVariables} from '../environment/env';
import User from "../models/User";
import Org from "../models/Orginization";

export class GlobalMiddleWare {
 //.......................................Checks validation result..................................................
    static checkError(req, res, next) {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            next(new Error(error.array()[0].msg));
        } else {
            next();
        }
    }
//....................................................................................................................

//..................................Check whether an user is a donor..................................................
static async checkwhetherDonor(req,res,next){
    // const authHeader = req.headers.authorization;
    //const token = authHeader ? authHeader.slice(7, authHeader.length) : null;
    const token=req.cookies.jwt;
     Jwt.verify(token, getEnvironmentVariables().jwt_secret, function(err, decodedToken) {
         if(err) {  next(err) }
         else {
             req.userId = decodedToken.user_id;
             req.usermail = decodedToken.email       // Add to req object
         }
     });
     let userid =req.userId
     const org = await Org.findById(userid)
     const user = await User.findById(userid)
     if(!user){
         req.errorStatus = 401;
         next(new Error('User Not Authorised'))
         return
     }

     const d = user["typeof"]
    // const o = org["typeof"]

     if(d =="don"){
         next()
     }else{
         req.errorStatus = 401;
         next(new Error('User Not Authorised'))
     }

 }
//..................................................................................................................

//..................................Check whether an user is a organization................................................
    static async checkwhetherOrg(req,res,next){
        //const authHeader = req.headers.authorization;
        //const token = authHeader ? authHeader.slice(7, authHeader.length) : null;
        const token=req.cookies.jwt;
        Jwt.verify(token, getEnvironmentVariables().jwt_secret, function(err, decodedToken) {
            if(err) {  next(err) }
            else {
                req.userId = decodedToken.user_id;
                req.usermail = decodedToken.email       // Add to req object
                console.log(req.userId)
            }
        });
        let userid =req.userId
        const org = await Org.findById(userid)
        const user = await User.findById(userid)
        if(!org){
            req.errorStatus = 401;
            next(new Error('User Not Authorised'))
            return
        }

        const d = org["typeof"]
        // const o = org["typeof"]

        if(d =="org"){
            next()
        }else{
            req.errorStatus = 401;
            next(new Error('User Not Authorised'))
        }

    }
//...........................................................................................................

//..................................Global authentication...................................................
static async authenticate(req, res, next) {
    //const authHeader = req.headers.authorization;
    //const token = authHeader ? authHeader.slice(7, authHeader.length) : null;
    const token = req.cookies.jwt;
    try {
        Jwt.verify(token, getEnvironmentVariables().jwt_secret, ((err, decoded) => {
            if (err) {
                next(err)
            } else if (!decoded) {
                req.errorStatus = 401;
                next(new Error('User Not Authorised'))
            } else {
                req.user=decoded;
                req.token = token;
                next();
            }
        }))
    } catch (e) {
        req.errorStatus = 401;
        next(e);
    }
}
  static check(req,res,next){
      next();
  }
//......................................................................................................
}
