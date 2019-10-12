
export default {
    namespaced: true,
    state: {
        sequences:[
            ["[ ]", "[-]", "[x]"],
            ["[TODO]", "[DONE]"]
        ]
    },
    getters: {
        stateSequence: (state) => (token) => {
            for (let i = 0; i < state.sequences.length; i++) {
                const seq = state.sequences[i];
                for (let j = 0; j < seq.length; j++) {
                    if(token.text === seq[j]){
                        return [seq, j]
                    }
                }
            }
        },
        nextState:  (getters) => (note) => {
            if(note.tokens[0].type !== "state"){
                throw note;
            }
            let seq = getters.stateSequence(note.tokens[0]);
            if(seq){
                let sequence = seq[0];
                let i = seq[1];
                if(i < sequence.length -1){
                    return note.text.replace(sequence[i], sequence[i+1]);
                }
            }
        },
    },
    mutations:{

    }
}