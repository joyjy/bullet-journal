<template>
    <v-content >
        <v-tabs dark @change="view = $event">
            <v-tab>Account</v-tab>
            <v-tab>Display</v-tab>
            <v-tab>Data</v-tab>
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
                <v-col>Data</v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-btn @click="exportJson">Export</v-btn>
                </v-col>
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
        exportJson(){
            let dataStr = JSON.stringify(this.$store.state);
            let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            let exportFileDefaultName = 'data.json';

            let linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }
    }
}
</script>

<style>

</style>