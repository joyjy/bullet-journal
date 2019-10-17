<template>
    <v-sheet light width="880" class="px-3">
        <v-container class="caption">
            <h3>Shorcut</h3>
            <v-divider></v-divider>
            <v-row>
                <v-col>
                    <h4>Editing</h4>
                    <v-row>
                        <v-col>
                            New note
                            <span title="enter">↵</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            New subnote
                            <span title="command">⌘</span><span title="enter">↵</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            New content
                            <span title="shift">⇧</span><span title="enter">↵</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Unfocus(in editing)
                            Esc
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Delete
                        </v-col>
                        <v-col cols="auto">
                            ⇧⌘⌫
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Duplicate
                        </v-col>
                        <v-col cols="auto">
                            ⇧⌘D
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Archive
                        </v-col>
                        <v-col cols="auto">
                            ⌘↵
                        </v-col>
                    </v-row>
                </v-col>
                <v-col>
                    <h4>Changing</h4>
                    <v-row>
                        <v-col>
                            Indent
                            
                            <span title="tab">⇥</span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Outdent
                            
                            <span title="shift">⇧</span><span title="tab">⇥</span><br>
                            Or press <span title="enter">↵</span> on an empty line
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Move up
                            
                            <span title="command">⌘</span><span title="up arrow">↑</span>
                        </v-col>
                        <v-col cols="auto">
                            ⇧⌘↑
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Move down
                            
                            <span title="command">⌘</span><span title="down arrow">↓</span>
                        </v-col>
                        <v-col cols="auto">
                            ⇧⌘↓
                        </v-col>
                    </v-row>
                </v-col>
                <v-col>
                    <h4>Navigation</h4>
                    <v-row>
                        <v-col>
                            Zoom in
                        </v-col>
                        <v-col cols="auto">
                            ⌘.
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Zoom out
                        </v-col>
                        <v-col cols="auto">
                            ⌘,
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Expand
                        </v-col>
                        <v-col cols="auto">
                            ⌘↓
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Collapse
                        </v-col>
                        <v-col cols="auto">
                            ⌘↑
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Show/hide completed
                        </v-col>
                        <v-col cols="auto">
                            ⌘O
                        </v-col>
                    </v-row>
Switch between pages⌘K
Navigate home⌘'
                </v-col>
                <v-col>
                    <h4>Misc</h4>
                    <v-row>
                        <v-col>
                        Search

                        Esc
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                        Save

                        <span title="command">⌘</span>s
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            Toggle help
                            
                            ?
                        </v-col>
                        <v-col cols="auto">
                            ⌘?
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            Star page
                        </v-col>
                        <v-col cols="auto">
                            ⇧⌘8
                        </v-col>
                    </v-row>
Bold⌘B
Italic⌘I
Underline⌘U
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script>
export default {
    data: () =>({
        command: ['⌘', 'command'],
        ctrl: ['^', 'ctrl'],
        shift: ['⇧', 'shift'],
        enter: ['↵', 'enter'],
        shotcuts: []
    }),
    created(){

    }
}
</script>

<style>

</style>