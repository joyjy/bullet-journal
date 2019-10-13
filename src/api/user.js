import api from "@/api/config";
import axios from "axios";

const convertResponse = (response) =>{ 
    return Promise.resolve({ 
        result: response.status == 200,
        message: response.data.message,
        data: response.data
    })
}
const convertError = (error) => {
    return Promise.resolve({
        result: false,
        message: error.response.data.message,
    });
}

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