<template>
    <v-list nav>
        <v-list-item two-line>
            <v-menu offset-y>
                <template v-slot:activator="{ on }">
                    <v-list-item-avatar class="align-self-center">
                        <v-badge v-show="true" overlap color="error lighten-2">
                        <template v-slot:badge>
                            <v-icon small>mdi-sync-off</v-icon>
                        </template>
                        <v-avatar color="grey lighten-3" v-on="on">
                            <span class="headline">{{ $store.getters.profile() }}</span>
                        </v-avatar>
                        </v-badge>
                    </v-list-item-avatar>
                </template>

                <v-list dense subheader min-width="160">
                    <v-list-item @click="" two-line>
                        <v-list-item-content>
                            <v-list-item-title>Sync</v-list-item-title>
                            <v-list-item-subtitle>
                                
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-list-item-action-text>⌘s</v-list-item-action-text>
                        </v-list-item-action>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="$store.commit('signOut')">
                        <v-list-item-title>Signout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-list-item-content>
                <v-list-item-title>{{ $store.state.user.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate" :style="{display:'inline-block'}">
                {{ $store.state.user.account }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="caption" :title="stat">
                {{ stat }}
                </v-list-item-subtitle>
            </v-list-item-content>
            
            <v-list-item-action @click="$emit('pin')">
                <v-btn text icon>
                <v-icon v-if="pinned">mdi-pin</v-icon>
                <v-icon v-else>mdi-pin-outline</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
    </v-list>
</template>

<script>
export default {
    props: ["pinned"],
    computed:{
        stat: function(){
          return this.$store.state.flattern.length + " bullets, " + this.$store.state.tag.count + " tags."
        }
    }
}
</script>

<style>
.v-avatar{
    cursor: pointer;
}
</style>