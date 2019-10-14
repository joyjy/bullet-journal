<template>
    <v-container fluid>
        <h2>Note</h2>
        <v-divider></v-divider>
        <v-row>
            <v-col>
                <v-radio-group v-model="noteClickType" row label="Note click: ">
                    <v-radio label="Single Click" value="sgl"></v-radio>
                    <v-radio label="Double Click" value="dbl"></v-radio>
                </v-radio-group>
            </v-col>
        </v-row>
        <h2>Tag</h2>
        <v-divider></v-divider>
        <h2>State</h2>
        <v-divider></v-divider>
        <h2>Agenda</h2>
        <v-divider></v-divider>
        <v-row>
            <v-col>
                <v-radio-group v-model="agendaWeekStart" row label="Week start: ">
                    <v-radio label="Sunday" value="0"></v-radio>
                    <v-radio label="Monday" value="1"></v-radio>
                </v-radio-group>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
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
    }
}
</script>

<style>

</style>