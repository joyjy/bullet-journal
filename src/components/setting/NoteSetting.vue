<template>
    <v-container fluid>

        <h2>Note</h2>
        <v-divider></v-divider>
        <v-row align="center">
            <v-col cols="2">
                Click type
            </v-col>
            <v-col>
                <v-radio-group v-model="noteClickType" row dense hide-details class="mt-0">
                    <v-radio value="sgl">
                        <template v-slot:label>
                            <span>Single</span>
                        </template>
                    </v-radio>
                    <v-radio value="dbl">
                        <template v-slot:label>
                            <span>Double</span>
                        </template></v-radio>
                </v-radio-group>
            </v-col>
        </v-row>
        <v-messages :value="['Effect on: 1. Click on note bullet to <strong>focus</strong>, 2. Click in note clickable content to <strong>search</strong>']"></v-messages>

        <v-row align="baseline" no-gutters class="py-1">
            <v-col cols="auto">
                <h3 class="mt-5">Tag</h3>
            </v-col>
            <v-col class="body-2 grey--text text--darken-1 ml-1">
                Text start with <kbd>#</kbd>, <kbd>@</kbd>, <kbd>:</kbd> will recognized as tags, 
                avaliable in <strong>note text</strong> &amp; <strong>note content</strong>.
            </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row>
            <v-col>
            </v-col>
        </v-row>

        <v-row align="baseline" no-gutters class="py-1">
            <v-col cols="auto">
                <h3 class="mt-5">State</h3>
            </v-col>
            <v-col class="body-2 grey--text text--darken-1 ml-1">
                Leading text wrap in <kbd>[]</kbd>, <kbd>()</kbd>, <kbd>&lt;&gt;</kbd> will recognized as state, 
                only avaliable in <strong>note text</strong>.
            </v-col>
        </v-row>
        <v-divider></v-divider>

        <v-row align="center">
            <v-col cols="2">
                Sequences
            </v-col>
            <v-col>
                <v-row v-for="(sequence, i) in $store.state.state.sequences" :key="i" no-gutters align="baseline">
                    <v-col cols="auto" class="mr-1" :key="'no.'+i">
                        {{i+1}}.
                    </v-col>
                    <template v-for="(state,j) in sequence">
                        <v-col cols="auto" class="mr-1" :key="state">
                            <span :class="['state', {'todo':j==0}, {'done':j==sequence.length-1}]">
                                {{ state.replace(" ", "\xa0") }}
                            </span>
                        </v-col>
                        <v-col cols="auto" class="mr-1" :key="j" v-if="j<sequence.length-1">
                            ->
                        </v-col>
                    </template>
                    <v-col>
                        <v-btn color="error" v-if="sequence[0]!='[ ]' && sequence[0]!='[TODO]'" text>
                            Delete
                        </v-btn>
                        <v-btn v-else text class="invisible">
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-messages :value="['When ⌘+click state, state goto next defined in sequence, last state will recognized as &quot;done&quot;.']"></v-messages>

        <v-row align="baseline">
            <v-col cols="2">
                Add/replace sequence
            </v-col>
            <v-col cols="4">
                <v-text-field v-model="sequence" :rules="sequenceRule" outlined dense required hide-details @keypress.enter="addSequence">
                </v-text-field>
            </v-col>
        </v-row>
        <v-messages :value="['Least 2 states like [state1], [state2]..., sequence considered to be the same by 1st state.']"></v-messages>

        <h3 class="mt-5">Agenda</h3>
        <v-divider></v-divider>
        <v-row>
            <v-col>
                <blockquote class="blockquote body-2 pt-0">
                    Timestamp likes <code>YYYY-MM-DD, MM-DD, YYYY-MM-DD.HH:mm, HH:mm</code>,
                    timespan using <kbd>~</kbd> to split.<br>
                    Timestamp in <kbd>()</kbd> will set note a <strong>time</strong>,
                    in <kbd>&lt;&gt;</kbd> will set note a <strong>schedule</strong>,
                    schedule support repeat with <kbd>+</kbd> and <kbd>++</kbd>
                </blockquote>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="2">
                Reapeat when
            </v-col>
            <v-col>
                note archived or state.done?
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="2">
                Schedule notification
            </v-col>
            <v-col>
            </v-col>
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
</template>

<script>
export default {
    data: () => ({
        sequence: "",
        sequenceRule: [
            v => !! v || 'required',
            v => /^((\[\S+\])\s*,\s*)+\[\S+\]$/gm.test(v) || "invalid"
        ],
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
    methods:{
        addSequence(){
            let sequence = this.sequence.split(",").map(s => s.trim()).filter(s => s.length > 0)
            console.log(sequence);
        }
    }
}
</script>

<style scoped>
.v-label>span{
    color: #212121;
}
.state{
    cursor: default;
}
</style>