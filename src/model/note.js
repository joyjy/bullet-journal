import _ from "lodash"

export class Note{
    constructor(text){
        this.id = _.now();
        this.text = '';
        this.tokens = [];
        this.content = {
            text: '',
            tokens: []
        }
        this.display = {
            collapse: false,
            text: {
                focus: false,
                cursor: 0,
            },
            content: {
                focus: false,
                cursor: -1,
            },
        }
        this.notes = [];
    }
}