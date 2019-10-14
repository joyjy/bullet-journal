<template>
    <v-col :class="[{'view': view.title}]" :cols="view.colWidth">
        <template v-if="view.title">
            <v-row class="align-center" no-gutters>
                <v-subheader>{{ `${name || view.title}` }}</v-subheader>
                <v-btn v-show="!name" icon small class="ml-auto" @click="create">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-row>
        </template>

        <component v-if="view.component" :is="view.component.name" v-bind="props" class="mb-3"></component>
        <v-row v-else v-for="(row,i) in view.rows" :key=i no-gutters :style="{height:row.height }">
            <grid-view v-for="(view,j) in row.cols" :view="view" :key="j"></grid-view>
        </v-row>
    </v-col>
</template>

<script>
import NoteTreeRoot from "../../note/NoteTreeRoot";

export default {
    name: "grid-view",
    props: ['view'],
    data: () => ({
        name: '',
    }),
    components:{
        NoteTreeRoot,
    },
    computed: {
        props(){
            let props = this.view.component.props(this);
            return props;
        }
    },
    methods: {
        create(){

        }
    }
}
</script>

<style>
.view{
    border-bottom: 1px solid #cecece;
    border-right: 1px solid #cecece;
}
.view .v-subheader{
    height: auto;
    padding: 8px 16px 8px 16px;
}
</style>