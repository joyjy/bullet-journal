import axios from "axios";
import api from "./config";
import {convertResponse, convertError}  from "./common"

import {reducer} from "@/store/modules" 

export default {
    async getData(token){
        try {
            const response = await axios.get(api.base +"/data", {
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
    async saveData(state){
        if(!state.user.token){
            return;
        }
        let data = reducer(state);

        try {
            const response = await axios.post(api.base +"/data", data, {
                headers: {
                    Authorization: "Bearer " + state.user.token
                }
            });
            return convertResponse(response);
        }
        catch (error) {
            return convertError(error);
        }
    }
}