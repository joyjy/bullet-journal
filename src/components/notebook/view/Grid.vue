<template>
    <v-col :class="{'pb-4': view.title}" :cols="view.colWidth">
        <v-subheader v-show="view.title">{{ `${name || view.title}` }}</v-subheader>

        <div v-if="view.space" ></div>
        <component v-else-if="component" :is="component.name" v-bind="props" @name="name=$event"></component>
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
        NoteTreeRoot
    },
    computed: {
        component(){
            if(this.view.component && this.props){
                return this.view.component;
            }
            return false;
        },
        props(){
            let props = this.view.component.props(this);
            return props;
        }
    },
}
</script>

<style>

</style>