import axios from "axios";
import api from "./config";
import {convertResponse, convertError}  from "./common"

export default {
    signup(){
        return Promise.resolve();
    },
    async signin(account, password){
        try {
            const response = await axios.post(api.base + "/auth", {
                account: account,
                password: password,
            });
            return convertResponse(response);
        }
        catch (error) {
            return convertError(error);
        }
    },
    async getUser(token){
        try {
            const response = await axios.get(api.base + "/user",{
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            return convertResponse(response);
        }
        catch (error) {
            return convertError(error);
        }
    },
    signout(){
        return Promise.resolve();
    }
}