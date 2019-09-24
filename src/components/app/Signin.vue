<template>
    <v-container>
        <v-row align="center" justify="center">
            <v-col cols="3">
                <v-form v-model="valid" @submit="signIn">
                    <div>Sign in</div>
                    <v-input>
                        <v-text-field label="Email" v-model="email" required>
                        </v-text-field>
                    </v-input>
                    <v-input>
                        <v-text-field label="Password" v-model="password" type="password" required>
                        </v-text-field>
                    </v-input>
                    <v-btn type="submit" @click="signIn">Sign in</v-btn>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
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
            this.$store.dispatch("signIn", {email: this.email, password: this.password}).then((succeed) => {
                if(succeed){
                    this.$router.replace({name:'note'})
                }
            })
        }
    }
}
</script>

<style>

</style>