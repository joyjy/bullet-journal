<template>
    <div class="note-control">
        <v-menu open-on-hover offset-y nudge-left="25%" nudge-top="1%" open-delay="100">
            <template v-slot:activator="{ on }">
                <div>
                    <div class="note-bullet" v-on="on"></div>
                </div>
            </template>
            <v-list subheader dense>
                <v-list-item>
                    <v-list-item-title>
                        <router-link :to="{ name:'note', params:{ id: note.id }}" >Focus</router-link>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
export default {
    props:['note'],
    data: () => ({
    }),
}
</script>

<style>
.note-control {
    cursor: pointer;
    margin-right: .25rem;
    display: flex;
}

.note-bullet{
    width: 1rem;
    height: 1rem;
    border: .25rem solid #fafafa;
    background-color: #666;
    border-radius: 50%;
}

.note-bullet:hover{
    border-color: #bbb
}
</style>