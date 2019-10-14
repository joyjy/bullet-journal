<template>
    <v-menu offset-y nudge-left="120" nudge-top="30" open-delay="800" close-delay="100">
        <template v-slot:activator="{ on }">
            <div class="toolbar">
                <v-btn text icon x-small v-on="on">
                    <v-icon>mdi-dots-horizontal</v-icon>
                </v-btn>
            </div>
        </template>
        <v-list subheader dense>
            <v-list-item>
                <v-list-item-title>
                    Show archived
                </v-list-item-title>
                <v-list-item-action>
                    <v-switch class="inline-form" v-model="displayArchived"></v-switch>
                </v-list-item-action>
            </v-list-item>
            <v-list-item>
                <v-list-item-title>
                    Sub in columns
                </v-list-item-title>
                <v-list-item-action>
                    <v-switch class="inline-form" v-model="displayColumn"></v-switch>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
export default {
    props: ['note'],
    computed: {
        displayColumn:{
            get(){ 
                return this.note.display.column;
            },
            set(value){
                this.$store.commit('display', {note:this.note, key:'column', value: value})
            }
        },
        displayArchived:{
            get(){
                return this.note.display.archived;
            },
            set(value){
                this.$store.commit('display', {note:this.note, key:'archived', value: value})
            }
        },
    }
}
</script>

<style>
</style>