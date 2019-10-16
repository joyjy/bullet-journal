<template>
    <v-stepper v-model="step" light style="max-width:800px">
        <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">Choose Template</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">Edit Template</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">Create Notebook</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
            <v-stepper-content step="1">
                <v-item-group class="template" mandatory :value="selectedTemplate">
                    <v-row>
                        <v-col v-for="(t,i) in templates" :key="t.name" cols="4">
                            <v-item v-slot:default="{active, toggle}">
                                <v-card :class="{selected: active}" @click="toggle($event);changeTemplate(i)">
                                    <v-card-title>{{ t.name }}</v-card-title>
                                    <v-card-text> {{ t.desc }} </v-card-text>
                                </v-card>
                            </v-item>
                        </v-col>
                    </v-row>
                </v-item-group>

                <v-row>
                    <v-col cols="auto" class="ml-auto">
                        <v-btn color="primary" @click="step = 2">
                            Next
                        </v-btn>
                    </v-col>
                </v-row>
            </v-stepper-content>

            <v-stepper-content step="2">

                <v-row no-gutters>
                    <v-col cols="7">
                        <v-text-field label="Name" v-model="name"></v-text-field>
                    </v-col>
                    <v-col cols="auto" class="ml-auto d-flex align-center font-italic">{{ `・${name} #notebook` }}</v-col>
                </v-row>

                <v-radio-group row :readonly="selectedTemplate<2" v-model="itemsSelectType">
                    <v-radio label="Filtered notes" value="filtered"></v-radio>
                    <v-radio label="Static notes" value="static"></v-radio>
                </v-radio-group>

                <!--day log settings-->
                <v-row v-if="selectedTemplate==0" no-gutters>
                    <v-col cols="5">
                        <v-text-field label="Day Format" v-model="format"></v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-checkbox label="Locale" v-model="locale" hide-details></v-checkbox>
                    </v-col>
                    <v-col cols="auto" class="ml-auto d-flex align-center font-italic">{{ `・${formatSample}` }}</v-col>
                </v-row>

                <v-row>
                    <v-col cols="auto" class="ml-auto">
                        <v-btn text @click="step=1">Back</v-btn>
                        <v-btn color="primary" @click="step = 3">
                            Next
                        </v-btn>
                    </v-col>
                </v-row>
            </v-stepper-content>

            <v-stepper-content step="3">
                <v-card>
                    
                </v-card>

                <v-row>
                    <v-col cols="auto" class="ml-auto">
                        <v-btn text @click="step=2">Back</v-btn>
                        <v-btn color="primary" @click="createNotebook">
                            Create
                        </v-btn>
                    </v-col>
                </v-row>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script>
import moment from 'moment'
export default {
    data () {
        return {
            templates: [{
                name: "Self",
                template: "diary",
                desc: "Journal, Routine and Punch",
                itemsSelectType: 'static'
            },{
                name: "GTD",
                desc: "Inbox, Next, Projects, Waiting for, Someday/Maybe",
                itemsSelectType: 'static',
            },{
                name: 'Grid',
                desc: 'View notes using grid cards',
            },{
                name: 'Table',
                desc: 'View notes using table',
            },{
                name: 'Kanban',
                desc: 'View notes using table',
            },{
                name: 'Freestyle',
                desc: 'All custom from empty',
            }],
            step: 1,
            selectedTemplate: 0,
            //----
            name: '',
            itemsSelectType: '', // filtered/static
            // day-log
            format: 'YYYY #MM-DD #ddd',
            locale: false,
        }
    },
    created(){
        this.changeTemplate(0)
    },
    computed:{
        formatSample(){
            let localeMoment = moment();
            if(this.locale){
                localeMoment.locale('zh-CN')
            }
            return localeMoment.format(this.format);
        }
    },
    methods:{
        changeTemplate(i){
            this.selectedTemplate = i;
            this.name = this.templates[i].name;
            this.itemsSelectType = this.templates[i].itemsSelectType || '';
        },
        createNotebook(){
            let payload = {
                name: this.name,
                template: this.templates[this.selectedTemplate],
            }
            if(this.selectedTemplate === 0){
                payload.params = {
                    dayFormat: this.format,
                    locale: this.locale,
                }
            }
            this.$store.dispatch("notebook/add", payload).then(() => {
                this.$router.push({name: 'notebook', params: {name: this.name}}).catch(err => {})
            })
        }
    }
}
</script>

<style>
.v-stepper{
  color: #212121; /*grey darken-4*/
}
</style>