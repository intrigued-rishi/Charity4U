import {Router} from 'express';
import {GlobalMiddleWare} from '../middlewares/GlobalMiddleWare';
import {ListController} from "../controllers/ListController";

class ListRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }

    getRoutes() {
        //fetch list of all donations on organization's side
        this.router.get('/donationList',GlobalMiddleWare.authenticate, GlobalMiddleWare.checkwhetherOrg,ListController.fetchId,ListController.listofdonations)




    }

    postRoutes() {



    }

    patchRoutes() {


    }

    deleteRoutes() {


    }
}

export default new ListRouter().router;
