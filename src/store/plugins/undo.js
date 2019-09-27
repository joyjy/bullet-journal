import _ from "lodash";

class UndoRedoHistory {

    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.record = true;
    }

    init(store) {
        this.store = store;
    }

    addState(state) {
        // may be we have to remove redo steps
        if (this.currentIndex + 1 < this.history.length) {
            this.history.splice(this.currentIndex + 1);
        }
        this.history.push(state);
        this.currentIndex++;
    }

    reset() {
        this.history.splice(0, this.currentIndex);
        this.currentIndex = -1;
    }

    undo() {
        if (this.currentIndex === -1) {
            return;
        }

        let batched = false; 

        this.record = false;

        const prevState = this.history[this.currentIndex];
        console.log(prevState.type)
        switch (prevState.type) {
            case "saveText":
                let to = prevState.payload.note;
                let from = prevState.payload.before;

                this.store.commit("tag/remove", {tags: _.filter(to.tokens, ['type','tag'])});
                to.text = from.text;
                to.tokens = from.tokens;
                this.store.commit("tag/add", {tags: _.filter(from.tokens, ['type','tag'])});
                // todo cursor
                break;
            case "addNote":
                this.store.commit("deleteNote", prevState.payload);
                if(prevState.payload.keyboard){
                    this.store.commit("focus", {
                        note: prevState.payload.curNote,
                        position: prevState.payload.curPosition
                    });
                }
                if(prevState.payload.batchId){
                    let lastState = this.history[this.currentIndex-1];
                    batched = lastState.payload.batchId === prevState.payload.batchId;
                }
                break;
            case "deleteNote":
                this.store.commit("addNote", prevState.payload);
                this.store.commit("flattern")
                if(prevState.payload.keyboard){
                    this.store.commit("focus", {note: prevState.payload.note, position:0});
                }
                if(prevState.payload.batchId){
                    let lastState = this.history[this.currentIndex-1];
                    batched = lastState.payload.batchId === prevState.payload.batchId;
                    // todo cursor
                }
        }
        this.currentIndex--;

        this.record = true;

        if(batched){
            this.undo();
        }
    }

    redo() {
        // todo
        this.currentIndex++;
    }
}

const undoRedoHistory = new UndoRedoHistory();

const undoRedoPlugin = (store) => {

    undoRedoHistory.init(store);

    store.subscribe((mutation) => {

        if (!undoRedoHistory.record) {
            return;
        }

        switch (mutation.type) {
            case "saveText":
            case "addNote":
            case "deleteNote":
                undoRedoHistory.addState(mutation);
        }
    });
}

export { undoRedoHistory };
export default undoRedoPlugin;