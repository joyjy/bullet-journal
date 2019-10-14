<template>
    <v-list nav>
        <v-list-item two-line>
            <v-menu offset-y>
                <template v-slot:activator="{ on }">
                    <v-list-item-avatar class="align-self-center">
                        <v-badge overlap :color="(syncStatus == 'syncing'?'green':'red')+' lighten-2'">
                            <template v-slot:badge>
                                <v-icon v-if="syncStatus == 'syncing'" small>mdi-sync</v-icon>
                                <v-icon v-else-if="syncStatus == 'disconnected'" small>mdi-sync-off</v-icon>
                            </template>
                            <v-avatar color="grey lighten-3" v-on="on">
                                <span class="headline">{{ profile() }}</span>
                            </v-avatar>
                        </v-badge>
                    </v-list-item-avatar>
                </template>

                <v-list dense subheader min-width="220">
                    <v-list-item @click="save" two-line>
                        <v-list-item-content>
                            <v-list-item-title>Sync</v-list-item-title>
                            <v-list-item-subtitle :key="seconds">
                                Last synced: {{ lastSyncedDesc() }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-list-item-action-text>⌘s</v-list-item-action-text>
                        </v-list-item-action>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="signout">
                        <v-list-item-title>Signout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-list-item-content>
                <v-list-item-title>{{ user.username }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate" :style="{display:'inline-block'}">
                    {{ user.account }}
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
import { mapGetters, mapMutations, mapActions, mapState } from "vuex"
import moment from 'moment'

export default {
    props: ["pinned"],
    data: () =>({
        seconds: 0,
        timer: null,
    }),
    mounted(){
        this.timer = setInterval(() => {this.seconds = moment().second()}, 500)
    },
    destroyed(){
        clearInterval(this.timer);
    },
    computed:{
        ...mapState({
            user: state => state.user,
            flattern: state => state.flattern,
            tags: state => state.tag,
            lastSynced: state => state.lastSynced,
            lastChanged: state => state.lastChanged,
        }),
        ...mapGetters(["profile"]),
        stat: function(){
            return this.flattern.length + " bullets, " + this.tags.count + " tags."
        },
        syncStatus: function(){
            if(this.lastSynced == 0){
                return "disconnected"
            }
            if(this.lastChanged > this.lastSynced){
                return "syncing"
            }
            return "synced"
        }
    },
    methods:{
        ...mapMutations({
            signout: "signOut"
        }),
        ...mapActions(["save"]),
        lastSyncedDesc(){
            if(this.lastSynced == 0){
                return "disconnected"
            }
            let now = moment();
            let last = moment(this.lastSynced);
            let diff = now.diff(last, "s")
            if(diff < 10){
                return "just now"
            }
            if(diff < 60){
                return "few seconds"
            }
            if(diff < 120){
                return "a minute ago"
            }
            if(now.isSame(last, "d")){
                return last.format("HH:mm")
            }
            return last.format("YYYY-MM-DD");
        }
    }
}
</script>

<style scoped>
.v-avatar{
    cursor: pointer;
}
.mdi-sync{
  -webkit-animation: progress-circular-rotate 1.4s linear infinite;
          animation: progress-circular-rotate 1.4s linear infinite;
  transform-origin: center center;
  transition: all 0.2s ease-in-out;
}
</style>