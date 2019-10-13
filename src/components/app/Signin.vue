<template>
    <v-app>
        <v-container class="fill-height">
            <v-row>
                <v-col cols="12">
                    <v-row :justify="'center'">
                        <v-col cols="3">
                            <h3>Sign in</h3>
                            <v-form @submit.prevent="signIn" ref="form">
                                <v-input>
                                    <v-text-field label="Email" v-model="email" hide-details required>
                                    </v-text-field>
                                </v-input>
                                <v-input>
                                    <v-text-field label="Password" v-model="password" type="password" hide-details required>
                                    </v-text-field>
                                </v-input>
                                <v-btn color="primary" type="submit" class="d-block ml-auto mr-2" >Sign in</v-btn>
                            </v-form>
                        </v-col>
                    </v-row>
                    <v-row :justify="'center'" style="height:72px">
                        <v-alert type="error" v-show="!valid">{{ message }}</v-alert>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-app>
</template>

<script>
export default {
    data: () => ({
        valid: true,
        email: '',
        password: '',
        message: '',
    }),
    methods: {
        signIn(){
            if (!this.$refs.form.validate()) {
                return;
            }
            this.$store.dispatch("signIn", {
                email: this.email, 
                password: this.password
            }).then(({result, message}) => {
                if(result){
                    this.$router.replace({name:'note'})
                }else{
                    this.valid = result;
                    this.message = message;
                }
            })
        }
    }
}
</script>

<style>

</style>