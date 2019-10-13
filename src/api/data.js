import api from "@/api/config";
import axios from "axios";

import {reducer} from "@/store/modules" 

export default {
    save(state){
        let data = reducer(state);
        return axios.post(api.base +"/data/", data, {
            headers: {
                Authorization: "Bearer " + state.user.token
            }
        })
    }
}