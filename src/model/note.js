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
            cursor: {
                text: 0,
                content: -1
            }
        }
        this.notes = [];
    }
}