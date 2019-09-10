import Vue from "vue"
import _ from "lodash";

class UndoRedoHistory {

    constructor(){
        this.history = [];
        this.currentIndex = -1;
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
      console.log("addState", this.history, this.currentIndex)
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

      this.recordMutation = false;

      const prevState = this.history[this.currentIndex];
      switch(prevState.type){
        case "saveNote":
            prevState.payload.note.text = prevState.payload.before.text;
            prevState.payload.note.tokens = prevState.payload.before.tokens;
            prevState.payload.note.display.cursor = -1; // todo
          break;
      }
      this.currentIndex--;

      this.recordMutation = true;
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

      switch(mutation.type){
        case "undo":
        case "focus":
        case "unfocus":
        case "replaceTag":
          break;
        default:
            console.log(mutation)
            undoRedoHistory.addState(mutation);
      }
      if(mutation.payload && mutation.payload.init){
        undoRedoHistory.reset()
      }
    });
}

export { undoRedoHistory };
export default undoRedoPlugin;