import User from '../models/User';
import Org from '../models/Orginization';
import {NodeMailer} from '../utils/NodeMailer';
import * as Jwt from 'jsonwebtoken';
import {getEnvironmentVariables} from '../environment/env';
const express = require('express');
var cookies = require("cookie-parser");
const app = express();
const stripe = require('stripe')('Your stripe secret key'); // Secret key
const mongoose=require('mongoose')


export class OrgController {
//.............................List of all organization..........................................................
        static async getallorg(req,res){
                try {
                        const orgs=await Org.find({we_check:true});
                        const user=await User.findOne({_id:req.userId});
                        res.render('org',{orgs:orgs,name:user["username"]});
                }
                catch (e){
                       throw (e)
                };
        }
//.............................................................................................................

//..............................Get a perticular organization...................................................
static async getoneorg(req,res) {
        let OrgId = req.params.id
        try {
                let org = await Org.findById(OrgId);
                const username= await User.findOne({_id:req.userId})
                return res.render('orgdetail',{photo:org["profile_pic_url"], name:org["username"],about:org["about"],id:org["_id"],username:username["username"]});
                
        }catch(err){
                throw err;
        }
}
//...........................................................................................................

 //............................Getting the id from the token of the entered donator......................................
        static async fetchId(req,res,next){
                //const authHeader = req.headers.authorization;
                //const token = authHeader ? authHeader.slice(7, authHeader.length) : null;
                const token=req.cookies.jwt;
                Jwt.verify(token, getEnvironmentVariables().jwt_secret, function(err, decodedToken) {
                        if(err) {  next(err) }
                        else {
                                req.userId = decodedToken.user_id;
                                req.usermail = decodedToken.email       // Add to req object
                                console.log(req.userId)
                                next();
                        }
                });
        }
//..................................................................................................................

//...............................Getting donor's data................................................................
        static async donordata(req,res){
                let userid =req.userId
                const user = await User.findById(userid)
                try {
                        res.render('donate',{id:req.params.id,name:user["username"],address:user["address"],phone:user["phone"]});
                }catch (e){
                        throw (e)
                }

        }
//................................................................................................................

//....................................................Donor to Org transaction...................................

        static async donateKind(req,res){
                let userId=req.userId;
                return res.render('donate',{id:userId});
        }
        static async kindpost(req,res){
                let orgId = req.params.id
                let userid =req.userId

                const targetorg = await Org.findById(orgId)
                const uu= targetorg
                const  on= targetorg["username"]
                const email = targetorg["email"]

                const targetUser = await User.findById(userid)

                const email2 = targetUser["email"]
                const donorDonating = await User.findOneAndUpdate({_id:userid},{

                $push:
                {
                        description :{
                             name: on ,
                             describe :   req.body.description
                        }
                }
                })
                try{
                        const targetuser = await User.findById(userid)
                        const u = targetuser["username"]
                        const a = targetuser["address"]
                        const p = targetuser["phone"]
                        const i = targetuser["_id"]

                        const user = await Org.findOneAndUpdate({_id: orgId}, {
                                $push: {

                        donation:{
                                name: u,
                                phone: p,
                                address: a,
                                userID: userid,
                                description: req.body.description
                        }
                                }
                         },
                {new: true});
                         NodeMailer.sendEmail({
                                to: [email] , subject: 'Donation received!',
                                html: `<h1> You have received a donation request from ${email2}</h1>`
                        })
                         res.render('payment');
                }catch (e){
                        throw (e);
                }
        }
//..........................................................................................................................

//..........................List of donations donated by donor...................................................................
        static async  donationList(req,res) {
            let userid = req.userId
            const user = await User.findOne({_id: userid})
            res.send(user["description"])
        }
//..............................................................................................................................

//..............................Stripe payment..................................................................................



       static async donateCash(req,res){
               res.render('cash',{id:req.params.id});
       }
       static payment(req,res){
           try {
               stripe.customers
                   .create({
                       name: req.body.name,
                       email: req.body.email,
                       source: req.body.stripeToken
                   })
                   .then(customer =>
                       stripe.charges.create({
                           amount: req.body.amount * 100,
                           currency: "inr",
                           customer: customer.id
                       })
                   )
                   .then(() => res.render("payment"))
                   .catch(err => console.log(err));
           } catch (err) {
               res.send(err);
           }
       }
       static async reDirect(req,res,next){
        if(req.cookies.jwt){
                var ID;
                const token=req.cookies.jwt;
                Jwt.verify(token, getEnvironmentVariables().jwt_secret, function(err, decodedToken) {
                    if(err) {  next(err) }
                    else {
                        ID = decodedToken.user_id;
                    }
                });
                let userid = ID;
                const user = await User.findById(userid)
                const org = await Org.findById(userid);
                if(!user&&!org){
                    res.send("<h1>You are not authorized.</h1>");
                }
                else if(user){
                    res.redirect('/api/org/all');
                }
                else if(org){
                    res.render("orgHome",{name:org["username"],donations:org["donation"],id:org["_id"]})
                }else{
                    res.render("home");
                }
        }else{
                res.render("home");
        }
       }
       static async verifyorganization(req,res){
               try{
                        if(req.query.username==="abc@zyx" && req.query.password==="avadakadabra"){
                                const org=await Org.find({});
                                res.render('admin',{orgs:org});
                        }
                        else{
                                res.send("<h2>Invalid username or password</h2>");
                        }
               }catch(e){
                        res.send(e);
               }
       }
//..................................................................................................................

//.........................................Contributions Page.......................................................//
       static async seeContributions(req,res){
               const id = req.params.id;
               let org = await Org.findById(id);
               let datas=[];
               for(let i of org['link']){
                       let arr=i.split("$");
                       datas.push({
                               link:arr[0],
                               description:arr[1]
                       });
               }
               res.render('contributions',{data:datas});
       }
       static async seeContributionsAll(req,res){
        const id = req.params.id;
        let org = await Org.findById(id);
        let datas=[];
        for(let i of org['link']){
                let arr=i.split("$");
                datas.push({
                        link:arr[0],
                        description:arr[1]
                });
        }
        res.render('contributionsall',{data:datas});
}
}
