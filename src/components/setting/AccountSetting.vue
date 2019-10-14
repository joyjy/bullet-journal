<template>
    <v-container fluid>
    <h2>Profile</h2>
    <v-divider></v-divider>
    <v-row>
        <v-col cols="2">Username</v-col>
        <v-col>{{ $store.state.user.username }}</v-col>
    </v-row>
    <v-row>
        <v-col cols="2">Avatar</v-col>
        <v-col>{{ $store.state.user.profile }}</v-col>
    </v-row>
    <v-row>
        <v-col cols="2">Email</v-col>
        <v-col>
            {{ $store.state.user.account }}
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="2">Password</v-col>
        <v-col></v-col>
    </v-row>
    <h3>Session</h3>
    <v-divider></v-divider>
    <v-row>
        <v-col>
            <v-btn>Sign out</v-btn>
        </v-col>
    </v-row>
    <h3>Export</h3>
    <v-divider></v-divider>
    <v-row>
        <v-col>
            <v-btn>Export</v-btn>
        </v-col>
    </v-row>
    <h3>Delete</h3>
    <v-divider></v-divider>
    <v-row>
        <v-col>
            <v-btn>Delete account</v-btn>
        </v-col>
    </v-row>
</v-container>

</template>

<script>
export default {

}
</script>

<style>

</style>