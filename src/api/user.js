import config from "@/config";
import axios from "axios";

export default {
    signup(){
        return Promise.resolve();
    },
    signin(account, password){
        return axios.post(config.apiBase +"/auth", {
            username: account,
            password: password,
        }).then((r) => {
            return Promise.resolve({ 
                result: r.status == 200,
                message: r.data.message,
                data: {
                    expire: r.data.expire,
                    token: r.data.token,
                }
            })
        })
    },
    signout(){
        return Promise.resolve();
    }
}