import {Router} from 'express';
import {UserController} from '../controllers/UserController';
import {UserValidators} from '../validators/UserValidators';
import {GlobalMiddleWare} from '../middlewares/GlobalMiddleWare';
import {Utils} from '../utils/Utils';
const multerUtils = require('../Utils/multer'); 
class UserRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }
//GlobalMiddleWare.checkError checks any global error
//GlobalMiddleWare.authenticate  checks whether an user(donor/org) has registered or not
//UserValidators.funName() function validates the user input while login or signup
// UserController.funName handles the request and response
    getRoutes() {
        this.router.get('/login/form',UserController.formLogin);
        this.router.get('/login/formOrg',UserController.formOrgLogin);
        this.router.get('/logout',GlobalMiddleWare.authenticate, UserController.logout);
        this.router.get('/logoutOrg',GlobalMiddleWare.authenticate, UserController.logoutOrg);
        this.router.get('/send/verification/email/donator/:email', UserController.resendVerificationEmail);
        this.router.get('/send/verification/email/organization/:email', UserController.resendVerificationEmailOrg);
        this.router.get('/login/donator', UserValidators.login(), GlobalMiddleWare.checkError, UserController.login);
        this.router.get('/login/organization', UserValidators.loginOrg(), GlobalMiddleWare.checkError, UserController.loginOrg);
        this.router.get('/all',UserController.dispall);
        this.router.get('/accept/:id/:orgid/:obid', GlobalMiddleWare.authenticate, GlobalMiddleWare.checkwhetherOrg,UserController.accept);
        this.router.get('/reject/:id/:orgid/:obid', GlobalMiddleWare.authenticate, GlobalMiddleWare.checkwhetherOrg, UserController.reject);
        this.router.get('/linkForm',GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherOrg, UserController.formLink);  
    }

    postRoutes() {
        this.router.post('/signup/donator', UserValidators.signUp(),GlobalMiddleWare.checkError, UserController.signUp,UserController.token);
        this.router.post('/signup/organization',multerUtils.uploadAvatar, UserValidators.signUpOrg(), GlobalMiddleWare.checkError, UserController.signUpOrg, UserController.tokenOrg);
        this.router.post('/submitLink',GlobalMiddleWare.authenticate, GlobalMiddleWare.checkwhetherOrg,UserController.linkSubmit);
    }

    patchRoutes() {
        this.router.post('/verify/donator', UserValidators.verifyUser(), GlobalMiddleWare.checkError,UserController.verify);
        this.router.post('/verify/organization', UserValidators.verifyUserOrg(), GlobalMiddleWare.checkError,UserController.verifyOrg);
        this.router.patch('/update/info', GlobalMiddleWare.authenticate, new Utils().multer.single('profile_pic_url'), UserValidators.updateProfilePic(), GlobalMiddleWare.checkError,
            UserController.updateProfilePic)
    }

    deleteRoutes() {

    }
}

export default new UserRouter().router;
