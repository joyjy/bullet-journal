<template>
    <v-content >
        <v-tabs dark @change="view = $event">
            <v-tab>Account</v-tab>
            <v-tab>Common</v-tab>
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
                <v-col>Note</v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-radio-group v-model="noteClickType" row label="Note click: ">
                        <v-radio label="Single Click" value="sgl"></v-radio>
                        <v-radio label="Double Click" value="dbl"></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
            <v-row>
                <v-col>Agenda</v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-radio-group v-model="agendaWeekStart" row label="Week start: ">
                        <v-radio label="Sunday" value="0"></v-radio>
                        <v-radio label="Monday" value="1"></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
        </v-container>
        <v-container v-else-if="view == 2" fluid>
            <v-row>
                <v-col>Data</v-col>
            </v-row>
            <v-row>
                <v-col cols="1">
                    <v-btn @click="exportJson">Export</v-btn>
                </v-col>
                <v-col>
                    <v-file-input accept=".json" label="Import" @change="importJson"></v-file-input>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-file-input accept=".opml" label="Import Workflowy OPML" @change="importWorkflowy"></v-file-input>
                </v-col>
            </v-row>
        </v-container>
    </v-content>
</template>

<script>

import opml from "@/lib/opml"

export default {
    data: () => ({
        view:0
    }),
    computed:{
        noteClickType: {
            get(){
                return this.$store.state.settings.note.clickType;
            },
            set(value){
                this.$store.commit("updateSettings", {
                    select: (state) => state.note,
                    key: "clickType",
                    value: value,
                })
            }
        },
        agendaWeekStart: {
            get(){
                return this.$store.state.settings.agenda.weekStart.toString();
            },
            set(value){
                this.$store.commit("updateSettings", {
                    select: (state) => state.agenda,
                    key: "weekStart",
                    value: Number.parseInt(value),
                })
            }
        },
    },
    methods: {
        exportJson(){
            let dataStr = JSON.stringify(this.$store.state);
            let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            let exportFileDefaultName = 'data.json';

            let linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        },
        importJson(file){

            var reader = new FileReader();
            reader.onload = () =>{
                let data = JSON.parse(reader.result);
                this.$store.dispatch("merge", data)
            };
            reader.readAsText(file);
        },
        importWorkflowy(file){
            var reader = new FileReader();
            reader.onload = () =>{
                this.$store.dispatch("merge", { notes: opml.toNotes(reader.result) })
            };
            reader.readAsText(file);
        }
    }
}
</script>

<style>

</style>