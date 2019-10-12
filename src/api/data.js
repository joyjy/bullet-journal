import config from "@/config";
import axios from "axios";

import {reducer} from "@/store/modules" 

export default {
    save(state){
        let data = reducer(state);
        return axios.post(config.apiBase +"/data/", data, {
            headers: {
                Authorization: "Bearer " + state.user.token
            }
        })
    }
}