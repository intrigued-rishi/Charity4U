import {OrgEnvironment} from "./org.env";
import {DonatorEnvironment} from "./donator.env";

export interface Environment{
    db_url : string,
    jwt_secret : string
}

export function getEnvironmentVariables() {
    if(process.env.NODE_ENV=='organization'){     //previously it was  if(process.env.NODE_ENV=='token')
        return OrgEnvironment
    }
    return DonatorEnvironment
}