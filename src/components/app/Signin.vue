<template>
    <v-app>
        <v-container class="fill-height">
            <v-row justify="center">
                <v-col cols="3">
                    <h3>Sign in</h3>
                    <v-form v-model="valid" @submit.prevent="signIn">
                        <v-input>
                            <v-text-field label="Email" v-model="email" required hide-details>
                            </v-text-field>
                        </v-input>
                        <v-input>
                            <v-text-field label="Password" v-model="password" type="password" required hide-details>
                            </v-text-field>
                        </v-input>
                        <v-btn color="primary" type="submit" class="d-block ml-auto mr-2" >Sign in</v-btn>
                    </v-form>
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
        password: ''
    }),
    methods: {
        signIn(){
            this.$store.dispatch("signIn", {
                email: this.email, 
                password: this.password
            }).then(({succeed, message}) => {
                if(succeed){
                    this.$router.replace({name:'note'})
                }else{
                    this.valid = succeed;
                }
            })
        }
    }
}
</script>

<style>

</style>