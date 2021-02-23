import * as express from 'express';                          //All the imports and requirements
import {getEnvironmentVariables} from './environment/env';   //
import * as mongoose from 'mongoose';                        //
import UserRouter from './routers/UserRouter';               //
import bodyParser = require('body-parser');                  //
import OrgRouter from "./routers/OrgRouter";                 //
import ListRouter from "./routers/ListRouter";
import {OrgController} from "./controllers/OrgController" ;             //
import { getMaxListeners } from 'process';
import {NodeMailer} from './utils/NodeMailer';
const path = require('path');  
const cookieParser=require('cookie-parser');                              //  All the imports and requirements

export class Server {
    public app: express.Application = express();

    constructor() {
        this.setConfigurations();//set all configurations
        this.setRoutes();        // set routes
        this.error404Handler();  //handles 404 error
        this.handleErrors();     //handles other errors
    }

    setConfigurations() {
        this.connectMongoDb();
        this.configureBodyParser();
        this.otherConfiguration();
    }

    otherConfiguration(){
        this.app.set('view engine', 'ejs');
      //  this.app.engine('html', require('ejs').renderFile);

        this.app.set('views',(path.join(__dirname, 'views')));
    }

    connectMongoDb() {
        const databaseUrl = getEnvironmentVariables().db_url;
        mongoose.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false}).then(() => {
            console.log('connected to database');
        });
    }

    configureBodyParser() {
        this.app.use(bodyParser.urlencoded({extended: true}));
    }

    setRoutes() {
        this.app.use(express.static('static'));
        this.app.use(cookieParser());
        this.app.use('/src/uploads', express.static('src/uploads'));
        //User Router starts(Login and register) for both organization and donor
        this.app.use('/api/user', UserRouter);
        //Organization's Route(Donator's side)
        this.app.use('/api/org', OrgRouter);
        //Donation received list rout
        this.app.use('/api/list', ListRouter);
        this.app.get("/",OrgController.reDirect);
        this.app.get("/contact",(req,res)=>{
            res.render("contact")
        })
        this.app.get("/about",(req,res)=>{
            res.render("aboutus")
        })
        this.app.get('/login/admin/zxcvbnm',(req,res)=>{
            res.render("loginadmin");
        })
        this.app.post("/contact/form",async (req,res)=>{
            try{
                await NodeMailer.sendEmail({
                    to: ["agnivghosh157@gmail.com","rishikeshcrever@gmail.com","jaydipdeyalok@gmail.com","dibyajyoti.bhs@gmail.com"], subject: 'Contact us',
                    html: `<h3>${req.body.name}</h3><h3>${req.body.phone}</h3><h3>${req.body.email}</h3><h3>${req.body.complain}</h3>`
                });
                res.redirect("/");
            }
            catch(e){
                throw e;
            }
        })
    }

    error404Handler() {
        this.app.use((req, res) => {
            res.status(404).json({
                message: 'Not Found',
                status_code: 404
            });
        })
    }

    handleErrors() {
        this.app.use((error, req, res, next) => {
            const errorStatus = req.errorStatus || 500;
            res.status(errorStatus).json({
                message: error.message || 'Something Went Wrong. Please Try Again',
                status_code: errorStatus
            })
        })
    }
}
