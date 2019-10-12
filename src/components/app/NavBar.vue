<template>
    <v-navigation-drawer app :mini-variant="!pinned && !hover" :expand-on-hover="!pinned" mini-variant-width="68"
      @mouseover.native="hover = true"
      @mouseleave.native="hover = false">
      <template v-slot:prepend>
        <v-list nav>
          <v-list-item two-line>
            <v-list-item-avatar class="align-self-center">
              <v-badge overlap color="error lighten-2">
                <template v-slot:badge>
                  <v-icon small>mdi-sync-off</v-icon>
                </template>
                <v-avatar color="grey lighten-3">
                  <span class="headline">{{ $store.getters.profile() }}</span>
                </v-avatar>
              </v-badge>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ $store.state.user.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-truncate" :style="{display:'inline-block'}">
                {{ $store.state.user.account }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption" :title="stat">
                {{ stat }}
              </v-list-item-subtitle>
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

        <v-list-group v-if="$store.state.saved.notes.length" prepend-icon="mdi-star" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Starred</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item v-for="n in $store.state.saved.notes"
            :key="n.id" :to="{name: 'note', params:{id:n.id}}">
            <v-list-item-content>
              <v-list-item-title>{{ n.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list-group>
        <v-list-item v-else>
          <v-list-item-icon>
            <v-icon>mdi-star</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Starred</v-list-item-title>
        </v-list-item>

        <v-list-group v-if="$store.state.saved.filters.length" prepend-icon="mdi-filter" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Saved Filter</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item v-for="text in $store.state.saved.filters" :key="text"
            @click="$router.push({name: 'note', query: {q: text}})"
            :class="{'v-list-item--active': $route.query.q === text}">
            <v-list-item-content>
              <v-list-item-title>{{ text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list-group>
        <v-list-item v-else>
          <v-list-item-icon>
            <v-icon>mdi-filter</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Saved Filter</v-list-item-title>
        </v-list-item>

        <v-list-item :to="{name:'agenda'}">
            <v-list-item-icon>
                <v-icon>mdi-calendar</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Agenda</v-list-item-title>
            <v-list-item-action @click.stop.prevent="">
                <v-tooltip right max-width="200">
                    <template v-slot:activator={on}>
                        <v-icon dense v-on="on">mdi-information-outline</v-icon>
                    </template>
                    <span>Note with (timestamp) or &lt;scheduled> will show in agenda view.</span>
                </v-tooltip>
            </v-list-item-action>
        </v-list-item>

        <v-list-group prepend-icon="mdi-book" value="true" no-action v-if="this.$store.state.user.account === 'joyjy2ah@gmail.com'">
            <template v-slot:activator>
                <v-list-item-title>Notebook</v-list-item-title>
            </template>

            <v-list-item v-for="notebook in $store.state.notebook.list" :key="notebook.name"
                @click="$router.push({name: 'notebook', params: {name: notebook.name}})">
                <v-list-item-title>
                    {{ notebook.name }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item @click="$eventbus.$emit('show-notebook-wizard', true)">
                <v-list-item-title>Add...</v-list-item-title>
                <v-list-item-action>
                    <v-tooltip right max-width="200">
                        <template v-slot:activator={on}>
                            <v-icon dense v-on="on">mdi-information-outline</v-icon>
                        </template>
                        <span>Notebook provides variety of view to organize notes.</span>
                    </v-tooltip>
                </v-list-item-action>
            </v-list-item>

        </v-list-group>

      </v-list>
      
      <template v-slot:append>
        <v-list nav dense>
          <v-list-item :to="{name:'setting'}">
            <v-list-item-icon>
              <v-icon>mdi-settings</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
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
        },
        stat: function(){
          return this.$store.state.flattern.length + " bullets, " + this.$store.state.tag.count + " tags."
        }
    }
}
</script>

<style>
#addNotebook{
    margin-top:-.5rem;
}
</style>