<template>
    <v-navigation-drawer app :mini-variant="!pinned && !hover" :expand-on-hover="!pinned" mini-variant-width="64"
      @mouseover.native="hover = true"
      @mouseleave.native="hover = false">
      <template v-slot:prepend>
        <v-list>
          <v-list-item link two-line>
            <v-list-item-avatar>
              <v-avatar color="grey lighten-3">
                <span class="headline">J</span>
              </v-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>JoYJY</v-list-item-title>
              <v-list-item-subtitle>joyjy2ah@gmail.com</v-list-item-subtitle>
              <v-list-item-subtitle>{{$store.state.flattern.length}} bullet notes</v-list-item-subtitle>
            </v-list-item-content>
            
            <v-list-item-action @click="pinned = !pinned">
              <v-btn text icon>
                <v-icon v-if="pinned">mdi-pin</v-icon>
                <v-icon v-else>mdi-pin-outline</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </template>

      <v-divider></v-divider>

      <v-list nav dense>
        <v-list-item :to="{name:'note'}">
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-list-item-icon>
          <v-list-item-title>All Note</v-list-item-title>
        </v-list-item>

        <v-list-group prepend-icon="mdi-star" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Starred</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item v-for="n in $store.state.saved.notes"
            :key="n.id" :to="{name: 'note', params:{id:n.id}} ">
            <v-list-item-content>
              <v-list-item-title>{{ n.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list-group>

        <v-list-group prepend-icon="mdi-filter" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Saved Filter</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item v-for="text in $store.state.saved.filters"
            :key="text" :to="{name: 'note', query: {q: text}} ">
            <v-list-item-content>
              <v-list-item-title>{{ text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list-group>

        <v-list-item :to="{name:'agenda'}">
          <v-list-item-icon>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Agenda</v-list-item-title>
        </v-list-item>

        <v-list-group prepend-icon="mdi-book" value="true" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Notebook</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item :to="{name:'notebook', params:{name:'diary'}}">
            <v-list-item-content>
              <v-list-item-title>Diary</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list-group>

      </v-list>
    </v-navigation-drawer>
</template>

<script>
import Vue from 'vue'

export default {
    data: () => ({
      hover:false
    }),
    computed: {
        pinned:{
            get(){
                return this.$store.state.settings.drawer.pinned || false;
            },
            set(value){
              this.$store.commit("drawerPinned", value)
            }
        }
    }
}
</script>