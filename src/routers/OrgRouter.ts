import {Router} from 'express';
import {GlobalMiddleWare} from '../middlewares/GlobalMiddleWare';
import {OrgController} from "../controllers/OrgController";

class UserRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }
/* GlobalMiddleWare.checkwhetherDonor checks whether an user has registered as a donor or not.. If he/she is registered as a donor then only
    he/she can access the listed routes  if an organizer try to fetch the rout it will show 401 error(unauthorised user) */
//Orgcontroller.funName handles the request and response
    getRoutes() {
        this.router.get('/all',GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor,OrgController.getallorg)//for all org in card view
       this.router.get('/all/:id',GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor,OrgController.getoneorg)//for one org according to id



        this.router.get('/all/kind/:id',GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor,OrgController.fetchId, OrgController.donordata)//after clicking kind button
        this.router.get('/donlist',GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor,GlobalMiddleWare.checkwhetherDonor,OrgController.donationList)//shows list of own donations to donor
        this.router.get('/login/admin/qwertyuiop',OrgController.verifyorganization)
        this.router.get('/contributions/:id',GlobalMiddleWare.authenticate, GlobalMiddleWare.checkwhetherDonor, OrgController.seeContributions);
        this.router.get('/dispall/contributions/:id',OrgController.seeContributionsAll);


    }

    postRoutes() {

        this.router.post('/all/kind/post/:id',GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor, OrgController.fetchId,OrgController.kindpost)//after clicking post button in kind

        this.router.get('/all/card/:id' , GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor,OrgController.donateCash)//payment form cash.ejs
       this.router.post('/all/card/pay/:id' , GlobalMiddleWare.authenticate,GlobalMiddleWare.checkwhetherDonor,OrgController.payment)//payment successful redirect to complete.ejs

       //this.router.post('/all/card/pay' ,OrgController.payment)
    }

    patchRoutes() {

    }

    deleteRoutes() {

    }
}

export default new UserRouter().router;
