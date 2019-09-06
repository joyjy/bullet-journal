<template>
    <div class="note-control">
        <v-menu open-on-hover offset-y nudge-left="21%" nudge-top="5%">
            <template v-slot:activator="{ on }">
                <v-btn small icon v-on="on">
                    <div class="note-bullet"></div>
                </v-btn>
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
.note-control{
    margin-right: .25rem
}

.note-bullet{
    width: 1rem;
    height: 1rem;
    border: .25rem solid #bbb;
    background-color: #666;
    border-radius: 50%;
}
</style>