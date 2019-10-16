<template>
    <v-container fluid>

        <h2>Profile</h2>
        <v-divider></v-divider>
        <v-row>
            <v-col cols="4">
                <v-row align="baseline">
                    <v-col cols="6">
                        Username
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="username" outlined hide-details dense required class="my-0 py-0" disabled>
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">Email</v-col>
                    <v-col>
                        {{ $store.state.user.account }}
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="2">
                <v-img class="grey lighten-2 ma-2 ml-auto" width="128" height="128">
                </v-img>
            </v-col>
        </v-row>

        <h3>Change password</h3>
        <v-divider></v-divider>
        <v-row align="baseline">
            <v-col cols="2">Old password</v-col>
            <v-col cols="4">
                <v-text-field v-model="password" outlined hide-details dense required disabled>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row align="baseline">
            <v-col cols="2">New password</v-col>
            <v-col cols="4">
                <v-text-field v-model="newPassword" outlined hide-details dense required disabled>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row align="baseline">
            <v-col cols="2">Comfirm new password</v-col>
            <v-col cols="4">
                <v-text-field v-model="comfirmPassword" outlined hide-details dense required disabled>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn outlined @click="" disabled>Change password</v-btn>
            </v-col>
        </v-row>

        <h3>Session</h3>
        <v-divider></v-divider>
        <v-row align="baseline">
            <v-col cols="4">
                <v-icon class="mx-1">mdi-desktop-mac</v-icon>
                <span class="font-weight-bold">xxx.xxx.xxx.xxx</span>, Location(Current)
            </v-col>
            <v-col cols="2">
                <v-btn outlined @click="signout" class="d-block ml-auto">Sign out</v-btn>
            </v-col>
        </v-row>

        <h3>Export</h3>
        <v-divider></v-divider>
        <v-row align="baseline">
            <v-col cols="auto">
                <v-btn outlined @click="exportData">Export</v-btn>
            </v-col>
            <v-col cols="auto" v-show="false">
                <v-btn outlined @click="">Import</v-btn>
            </v-col>
            <v-col class="auto" v-show="false">
                <a href="#">Import from other application</a>
            </v-col>
        </v-row>

        <template v-if="false">
        <h3>Delete</h3>
        <v-divider></v-divider>
        <v-row>
            <v-col>
                <v-btn outlined color="error">Delete account</v-btn>
            </v-col>
        </v-row>
        </template>
    </v-container>
</template>

<script>
import {mapMutations} from "vuex";
import {reducer} from "@/store/modules";

export default {
    data: () => ({
        password: '',
        newPassword: '',
        comfirmPassword: '',
    }),
    computed: {
        username:{
            get(){
                return this.$store.state.user.username;
            },
            set(value){

            }
        }
    },
    methods:{
        ...mapMutations({
            signout: "signOut"
        }),
        exportData(){
            let dataStr = JSON.stringify(reducer(this.$store.state));
            let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            let exportFileDefaultName = 'data.json';

            let linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        },
    }
}
</script>

<style>
</style>