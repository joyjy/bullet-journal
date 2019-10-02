import { Time } from "@/model/time";

class Token{
    constructor(type, origin, start, end){
        this.type = type;
        this.start = start;
        this.end = end;
        this.text = origin.substring(start, end);
    }
}

class Symbol{

    constructor(ch, index){
        this.ch = ch;
        this.index = index;
    }

    is(ch){
        if(ch === " "){
            return this.ch === " " || this.ch === "\xa0";
        }
        return this.ch === ch;
    }
}

const parseTime = function (state){

    let ch = state.text.charAt(0);

    if(ch === "[") {
        return;
    }

    let time = new Time();
    time.type = ch === "(" ? "stamp": "schedule"; // (stamp), <schedule>,

    let text = state.text;
    let regexp = /(\d{4}-\d{1,2}-\d{1,2})\.{0,1}|(\d{2}-\d{2})|(\d{2}:\d{2})~{0,1}/g;

    let matchGroups = text.matchAll(regexp);
    for (const group of matchGroups) {
        let value = group[2] || group[1] || group[0];
        if(value.includes(":")){ // time
            if(time.startTime === null){
                time.startTime = value;
            }else if(time.endTime === null){
                time.endTime = value;
            }
        }else{ // date
            if(time.startDate === null){
                time.startDate = value;
            }else if(time.endDate === null){
                time.endDate = value;
            }
        }
    }

    if(!time.startTime && (!time.startDate || time.endDate < time.startDate)){
        return;
    }

    return time;
}

export default {

    tokenize(text){
        let tokens = [];
        let symbols = [];
        symbols.peek = function() {
            if(this.length > 0){
                return this[this.length - 1];
            }
            return undefined;
        }
        symbols.popUntil = function(ch){
            let array = Array.isArray(ch)?ch:[ch];
            let pop = this.pop();
            while(!array.includes(pop.ch) && this.length > 0){
                pop = this.pop();
            }
            return pop;
        }

        let start = 0;
        let end = 0;
        let state = "$start";
        while(end < text.length){
            let ch = text.charAt(end);
            switch (ch) {
                case " ":
                case "\xa0":
                case "\n":
                    if(state === "$start" || state === "$split"){ // position has no content
                        state = "empty";
                    }else if(state === "text" || state === "tag"){ // no close symbol content
                        tokens.push(new Token(state, text, start, end));
                        start = end;
                        state = "empty";
                    }else if(state === "state"){ // with close symbol content
                        let peeked = symbols.peek();
                        // [state] must has no space or only one space [ ]
                        if(peeked.is(" ") /* more than one space */ || peeked.index < end-1 /* has text before */ ){
                            let poped = symbols.popUntil(["[", "(", "<"]);
                            state = "text";
                            start = end = poped.index; // restart from [ as "text"
                        }else{
                            symbols.push(new Symbol(ch, end)) // first & only [" "]
                        }
                    }
                    break;
                case "，":
                case "：":
                    if(state === "state"){
                        state = "text";
                    }
                    tokens.push(new Token(state, text, start, end));
                    start = end;
                    state = "$split";
                    break;
                case "#":
                case "@":
                    if(state === "$start" || state==="$split"){
                        if(start < end){
                            tokens.push(new Token("text", text, start, end));
                        }
                        state = "tag";
                        start = end;
                        symbols.push(new Symbol(ch, end));
                    }else if(state === "empty"){
                        tokens.push(new Token(state, text, start, end));
                        start = end;
                        state = "tag";
                        symbols.push(new Symbol(ch, end));
                    }
                    break;
                case "[":
                case "(":
                case "<":
                    if(state === "$start"){ // no need handle $split cause only self target it *NOW*
                        state = "state";
                        symbols.push(new Symbol(ch, end));
                    }else if(state === "empty"){ // act as text
                        tokens.push(new Token(state, text, start, end));
                        state = "text";
                        start = end;
                    }
                    break;
                case "]":
                case ")":
                case ">":
                    if(state === "state"){
                        let peeked = symbols.peek();
                        if(peeked.ch === " " || peeked.ch === "\xa0"){
                            symbols.pop();
                            peeked = symbols.peek();
                        }
                        let closed = ch === "]" && peeked.is("[") || ch === ")" && peeked.is("(") || ch ===">" && peeked.is("<");
                        if(!closed || closed && peeked.index === end-1){ // [] no content is not state
                            state = "text";
                        }
                        let token = new Token(state, text, start, end+1);
                        if(state === "state"){
                            token.time = parseTime(token);
                        }
                        tokens.push(token); // close symbol contains self
                        start = end+1;
                        state = "$split";
                    }else if(state === "empty"){ // act as text
                        tokens.push({ type: state, text: text.substring(start, end)});
                        state = "text";
                        start = end;
                    }
                    break;
                case "*":
                case "/":
                case "+":
                case "_":
                    let symbol = symbols.peek();
                    if(symbol && symbol.ch === ch){

                    }
                default:
                    if(state === "$start" || state === "$split"){
                        state = "text";
                    }else if(state === "empty"){
                        tokens.push(new Token(state, text, start, end));
                        state = "text";
                        start = end;
                    }else if(state === "state"){
                        let peeked = symbols.peek();
                        // [state] must has no space or only one space [ ]
                        if(peeked.is(" ") /* has space before */){ 
                            let poped = symbols.popUntil(["[", "(", "<"]);
                            state = "text";
                            start = end = poped.index; // restart from [ as "text"
                        }
                    }
                    break;
            }
            end++;
        }

        if(start < end){
            let symbol = symbols.peek();
            if(state === "tag" && symbol.is("#") && symbol.index === end-1){ // tag must has content
                state = "text";
            }else if(state === "state"){ // [state] must closed so not allow as $end status
                state = "text";
            }
            tokens.push(new Token(state, text, start, end));
        }

        return tokens;
    }
}