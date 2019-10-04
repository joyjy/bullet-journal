import Vue from "vue"
import _ from "lodash";

export default {
    namespaced: true,
    state: {
        list:[]
    },
    getters:{
        findByName: (state) => (name) => {
            return _.find(state.list, n => n.name === name);
        }
    },
    mutations: {
    }
}