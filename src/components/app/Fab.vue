<template>
    <v-speed-dial fixed right bottom open-on-hover>
        <template v-slot:activator>
            <v-btn v-model="fab" color="cyan darken-2" dark fab>
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else>mdi-pencil</v-icon>
            </v-btn>
        </template>
        <v-btn fab dark small color="green">
          <v-icon>mdi-av-timer</v-icon>
        </v-btn>
        <v-btn fab dark small color="indigo" >
          <v-icon>mdi-alarm-check</v-icon>
        </v-btn>
        <v-btn fab dark small color="red">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-speed-dial>
</template>

<script>
export default {
    data: () => ({
        fab: false
    }),
}
</script>

<style>

</style>