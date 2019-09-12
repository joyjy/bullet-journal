import Vue from "vue"
import _ from "lodash";

class UndoRedoHistory {

    constructor(){
        this.history = [];
        this.currentIndex = -1;
        this.record = true;
    }

    init(store){
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

    reset(){
      this.history.splice(0, this.currentIndex);
      this.currentIndex = -1;
      console.log("reset", this.history, this.currentIndex)
    }
  
    undo(state) {
      if(this.currentIndex == -1){
        return;
      }

      this.record = false;

      const prevState = this.history[this.currentIndex];
      switch(prevState.type){
        case "saveNote":
            prevState.payload.note.text = prevState.payload.before.text;
            prevState.payload.note.tokens = prevState.payload.before.tokens;
          break;
        case "addNote":
          this.store.commit("deleteNote", prevState.payload)
          break;
        case "deleteNote":
          this.store.commit("addNote", prevState.payload)
      }
      this.currentIndex--;

      this.record = true;
      console.log("undo", this.history, this.currentIndex)
    }
  
    redo() {
      const nextState = this.history[this.currentIndex + 1];
      //
      this.currentIndex++;
    }
}

const undoRedoHistory = new UndoRedoHistory();

const undoRedoPlugin = (store) => {
    
    undoRedoHistory.init(store);
  
    store.subscribe((mutation, state) => {

      if(!undoRedoHistory.record){
        return;
      }
      
      switch(mutation.type){
        case "replaceTag": // todo with saveNote
          break;
        case "saveNote":
        case "addNote":
        case "deleteNote":
            undoRedoHistory.addState(mutation);
      }

      if(mutation.payload && mutation.payload.init){
        undoRedoHistory.reset()
      }
    });
}

export { undoRedoHistory };
export default undoRedoPlugin;