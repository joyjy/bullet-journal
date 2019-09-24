<template>
    <v-content >
        <v-tabs dark @change="view = $event">
            <v-tab>Account</v-tab>
            <v-tab>Display</v-tab>
            <v-tab>Help</v-tab>
        </v-tabs>
        <v-container v-if="view == 0" fluid>
            <v-row>
                <v-col>{{ $store.state.user.name }}</v-col>
            </v-row>
            <v-row>
                <v-col>{{ $store.state.user.account }}</v-col>
            </v-row>
        </v-container>
        <v-container v-else-if="view == 1" fluid>
            <v-row>
                <v-col>Display</v-col>
            </v-row>
        </v-container>
        <v-container v-else-if="view == 2" fluid>
            <v-row>
                <v-col></v-col>
            </v-row>
        </v-container>
    </v-content>
</template>

<script>

export default {
    data: () => ({
        view:0
    }),
    methods: {
    }
}
</script>

<style>

</style>