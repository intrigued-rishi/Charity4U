import User from '../models/User';
import Org from '../models/Orginization';
import {Utils} from '../utils/Utils';
import {NodeMailer} from '../utils/NodeMailer';
import * as Jwt from 'jsonwebtoken';
import {getEnvironmentVariables} from '../environment/env';
import { ListController } from './ListController';
const path = require('path');
export class UserController {
//.........................................................Signup for the donator...........................................................
    static async signUp(req, res, next) {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const address = req.body.address;
        const phone = req.body.phone;
        const verificationToken = Utils.generateVerificationToken(); //generates verification token
        try {
            const hash = await Utils.encryptPassword(password);
            const data = {
                email: email,
                password: hash,
                username: username,
                verification_token: verificationToken,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                created_at: new Date(),
                updated_at: new Date(),
                address: address,
                phone: phone,
                link: []
            };
            let user = await new User(data).save(); //updates donor's schema

            //res.send(user);
            await NodeMailer.sendEmail({             //sends verification email
                to: [email] , subject: 'Email Verification',
                html: `<h1>${verificationToken}</h1>`     //the token is sent to mail

            })
            req.email=req.body.email;
            next();
        } catch (e) {
            next(e);
        }
    }
//......................................................................................................................................

    //Organization signup ...exactly same code as donor's signup except line 65 is replaced by Org as it has to be updated in organization schema
    static async signUpOrg(req, res, next) {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const address = req.body.address;
        const phone = req.body.phone;
        const about = req.body.about;
        const verificationToken = Utils.generateVerificationToken();
        try {
            const hash = await Utils.encryptPassword(password);
            const data = {
                email: email,
                password: hash,
                username: username,
                verification_token: verificationToken,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                created_at: new Date(),
                updated_at: new Date(),
                address: address,
                phone: phone,
                about:about,
                profile_pic_url:'/avatars/' + req.files[0].filename,
                ver_pic:'/avatars/' + req.files[1].filename
            };
            let user = await new Org(data).save();
            //res.send(user);
            await NodeMailer.sendEmail({
                to: [email] , subject: 'Email Verification',
                html: `<h1>${verificationToken}</h1>`
            })
            req.email=req.body.email
            next()
        } catch (e) {
            console.log(e);
        }
    }
//.......................................................................................................................................

//......................................Verify a donator using verification mail.........................................................
    static async verify(req, res, next) {
        const verificationToken = req.body.verification_token;
        try {
            const user = await User.findOneAndUpdate({
                 verification_token: verificationToken,
                //verification_token_time: {$gt: Date.now()}
            }, {verified: true, updated_at: new Date()}, {new: true});
            if (user) {
              //  res.send(user);
              res.redirect("/api/user/login/form")
            } else {
                res.send('InCorrect Verification token or verification token has expired');
            }
        } catch (e) {
            next(e);
        }
    }
//...............................................................................................................................


//......Organization verify ...exactly same code as verify except line 103 is replaced by Org as it has to be updated in organization schema ...
    static async verifyOrg(req, res, next) {
        const verificationToken = req.body.verification_token;
        const email = req.body.email;
        try {
            const user = await Org.findOneAndUpdate({
                 verification_token: verificationToken,
                //verification_token_time: {$gt: Date.now()}
            }, {verified: true, updated_at: new Date()}, {new: true});
            if (user) {
                //res.send(user);
                res.redirect("/api/user/login/formOrg")
            } else {
                res.send('InCorrect Verification token or verification token has expired');
            }
            next();
        } catch (e) {
            next(e);
        }
    }
//..............................................................................................................................

//.................................Resend verification mail to donor..............................................
    static async resendVerificationEmail(req, res, next) {
        const email = req.params.email;
        const verificationToken = Utils.generateVerificationToken();
        try {
            const user: any = await User.findOneAndUpdate({email: email}, {
                verification_token: verificationToken,
                //verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
            });
            if (user) {
                await NodeMailer.sendEmail({
                    to: [email], subject: 'Email Verification',
                    html: `<h1>${verificationToken}</h1>`
                });
                res.render('token',{email: email});
            } else {
                throw new Error('User Does Not Exist');
            }
        } catch (e) {
            next(e);
        }
    }

//.........Resend verification mail to organization same fn as above only schema change.............................................................................
    static async resendVerificationEmailOrg(req, res, next) {
        const email = req.params.email;
        const verificationToken = Utils.generateVerificationToken();
        try {
            const user: any = await Org.findOneAndUpdate({email: email}, {
                verification_token: verificationToken,
                //verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
            });
            if (user) {
                await NodeMailer.sendEmail({
                    to: [user.email], subject: 'Email Verification',
                    html: `<h1>${verificationToken}</h1>`
                });
                res.render('tokenOrg',{email: email});
            } else {
                throw new Error('Organisation Does Not Exist');
            }
        } catch (e) {
            next(e);
        }
    }
//............................................................................................................................

//............................................Donator's login.............................................................................
static async login(req, res, next) {
    const password = req.query.password;
    const user = req.user;
    try {
        await Utils.comparePassword({
            plainPassword: password,
            encryptedPassword: user.password
        });
        if(user.verified){
            const token = Jwt.sign({email: user.email, user_id: user._id},
                getEnvironmentVariables().jwt_secret, {expiresIn: '30d'});
            res.cookie('jwt',token,{httpOnly:true});
            const data = {token: token, user: user};
            const orgs=await Org.find({we_check:true});
            res.render('org',{orgs:orgs,name:user.username});
        }
        else{
            res.status(401).send("<h1>You are not authorized</h1>");
        }
    } catch (e) {
        next(e);
    }

}
//...............................................................................................................................

//.........................................Org login .. same function as above only schema change...............................
    static async loginOrg(req, res) {
        const password = req.query.password;
        const user = req.user;
        try {
            await Utils.comparePassword({
                plainPassword: password,
                encryptedPassword: user.password
            });
            const token = Jwt.sign({email: user.email, user_id: user._id},
                getEnvironmentVariables().jwt_secret, {expiresIn: '30d'});
            res.cookie('jwt',token,{httpOnly:true});
            const data = {token: token, user: user};
            //res.json(data);
            res.render('orgHome',{name:user.username,donations:user.donation,id:user._id});
        } catch (e) {
            console.log(e);
        }
    }
 //..............................................................................................................................

 //................For uploading pdf, image as proof of org after login.....................................................
    static async updateProfilePic(req, res, next) {
        const userId = req.user.user_id;
        const fileUrl = 'http://localhost:5000/' + req.file.path;
        try {
            const user = await Org.findOneAndUpdate({_id: userId}, {
                updated_at: new Date(),
                profile_pic_url: fileUrl
            }, {new: true});
           // res.send(user);
            next()
        } catch (e) {
            next(e);
        }
    }
    static async formLogin(req,res){
        if(req.cookies.jwt){
            res.send("<h1>You are already logged in</h1>")
        }
        else{
            res.render('logindonor');
        }
    }
    static async formOrgLogin(req,res){
        if(req.cookies.jwt){
            res.send("<h1>You are already logged in</h1>")
        }
        else{
            res.render('loginorg');
        }
    }
    static async token(req,res){
        res.render('token',{email: req.body.email});
    }
    static async tokenOrg(req,res){
        res.render('tokenOrg',{email: req.body.email});
    }
    //.....................................................logout function...........................................................//
    static async logout(req,res){
        try{
            if(req.cookies.jwt){
                res.clearCookie("jwt");
            }
            //await req.user.save();
            res.redirect("/");
        }
        catch(err){
            throw err;
        }
    }
    static async logoutOrg(req,res){
        try{
            if(req.cookies.jwt){
                res.clearCookie("jwt");
            }
            //await req.user.save();
            res.redirect("/");
        }
        catch(err){
            res.send(err)
        }
    }
    static async dispall(req,res){
        try{
            const orgs=await Org.find({we_check:true});
            res.render('dispall',{orgs: orgs});
        }
        catch (e){
            res.send(e)
     };
    }
    static async accept(req,res){
        try{
            const id=req.params.id;
            const orgid=req.params.orgid;
            const obid=req.params.obid;
            const user=await User.findById(id);
            let org=await Org.findById(orgid);
            const don=await org["donation"].id(obid)
            //res.render('back');
            const donor = await User.findById(don.userID);
            const email_donor = donor["email"];
            await org["donations"].push(email_donor);
            await org.save();
        await NodeMailer.sendEmail({             //sends verification email
            to: [user["email"]] , subject: 'Request accepted',
            html: `<h1>Organisation ${org["username"]} has accepted your proposal of donation of items: ${don["description"]} and will contact you soon!!</h1>`     //the token is sent to mail

        }) 
        await NodeMailer.sendEmail({             //sends verification email
            to: [org["email"]] , subject: 'Collect the items soon',
            html: `<h1>Please collect the items soon.<br>Name:${user["username"]}<br>Phone:${user["phone"]}<br>Address:${user["address"]}<br>Items:${don["description"]}</h1>`     //the token is sent to mail

        }) 
        
        const ORG = await Org.findOneAndUpdate({_id: orgid}, {
            $pull:{
                donation:{
                    userID: id,
                    _id: obid
                }
            }
        },
        {new: true});

        org=await Org.findById(orgid);
        res.render('orgHome',{name:org["username"],donations:org["donation"], id:org["_id"]});
        }
        catch(e){
            res.send(e)
        }
    }
    static async reject(req,res){
        try{
            const id=req.params.id;
            const orgid=req.params.orgid;
            const obid=req.params.obid;
            const user=await User.findById(id);
            let org=await Org.findById(orgid);
            const don=await org["donation"].id(obid)
        await NodeMailer.sendEmail({             //sends verification email
            to: [user["email"]]  , subject: 'Request declined',
            html: `<h1>Organisation ${org["username"]} has rejected your proposal of donation of items: ${don["description"]}</h1>`     //the token is sent to mail

        })
        const ORG = await Org.findOneAndUpdate({_id: orgid}, {
            $pull: {
            donation:{
                id:id,
                _id:obid
            }
        }
     },
    {new: true});
    org=await Org.findById(orgid);
    res.render('orgHome',{name:org["username"],donations:org["donation"], id:org["_id"]});
        }
        catch(e){
            res.send(e)
        }
    }

    //....................................................link submit page............................................................//
    static async formLink(req,res){
        res.render('linkUpload');
    }

    static async linkSubmit(req,res){
        try {
            let id = req.userId;
            const org = await Org.findById(id);
            if(org){
                for(let li of org['link']){
                    if(req.body.link==li){
                        res.redirect('/');
                        return;
                    }
                }
                let arr = req.body.link.split('src="');
                let str="";
                let temp = arr[1];
                for(let i=0;temp[i]!='"';i++){
                    str=str+temp[i];
                }
                str=str+'$'+req.body.description; 
                /*const orgs = await Org.findOneAndUpdate({_id:id},{

                    $push:
                    {
                            link :{
                                 name: str ,
                            }
                    }
                    })*/
                org['link'].push(str);
                const donations = org["donations"];
                const name = org["username"];
                for(let i of donations){
                    NodeMailer.sendEmail({
                        to: [i] , subject: 'Organization Donated!!',
                        html: `<h1>${name},</h1>where you donated sometime ago, has released a video.<br>Check out the video at our Website!!`
                    });
                }
                org["donations"]=[];
                await org.save();
            }
            res.redirect('/');
        } catch (error) {
            console.log(error);
        }
    }
}
