<template>
  
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        notes: [
                {
                    id: 1,
                    text: 'hello',
                    notes: [
                        {
                            id:2,
                            parent: { id: 1, text: "hello"},
                            text:'world',
                            notes: []
                        }
                    ]
                }
            ],
        user: {},
        settings: {}
    },
    mutations: {
    },
    actions: {
    }})
</script>

<style>

</style>