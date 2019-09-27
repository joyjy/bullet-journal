<template>
    <v-container>
        <v-row v-for="group in groups" :key="group" no-gutters>
            <v-col cols="12" v-show="!isEmpty(group)">
                > {{group}}
            </v-col>
            <v-chip-group column>
                <v-chip v-for="tag in tags[group]" :key="tag.text"
                    label small @click="$eventbus.$emit('search', tag.text)">
                    <span class="font-weight-bold">{{ tag.text }}</span>
                    <span>({{ tag.count }})</span>
                </v-chip>
            </v-chip-group>
        </v-row>
    </v-container>
</template>

<script>
import _ from "lodash";

export default {
    data:() => ({
        groups: [ '#','@','¥']
    }),
    computed: {
        tags: function(){
            let tags = {};
            for(const group in this.$store.state.tag){
                let sortable = [];
                for (const tag in this.$store.state.tag[group]) {
                    sortable.push({text: tag, count: this.$store.state.tag[group][tag]});
                }
                tags[group] = _.sortBy(sortable, ['text']);
            }
            return tags;
        }
    },
    methods: {
        isEmpty: function(group){
            return _.isEmpty(this.tags[group])
        },
    }
}
</script>

<style>

</style>