<template>
    <div>
        <v-subheader>Tags</v-subheader>
        <v-chip-group column>
            <v-chip v-for="tag in allTags" :key="tag.text"
                label small>
                <span class="font-weight-bold">{{ tag.text }}</span>
                <span>({{ tag.count }})</span>
            </v-chip>
        </v-chip-group>
    </div>
</template>

<script>
import _ from "lodash"

export default {
    computed: {
        allTags: function(){
            var sortable = [];
            for (var tag in this.$store.state.tag.flattern) {
                sortable.push({text: tag, count: this.$store.state.tag.flattern[tag]});
            }
            let tags = _.sortBy(sortable, ['text']);
            return tags;
        }
    }
}
</script>

<style>

</style>