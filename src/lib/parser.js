class Token{
    constructor(type, origin, start, end){
        this.type = type;
        this.start = start;
        this.end = end;
        this.text = origin.substring(start, end)
    }
}

class Symbol{

    constructor(ch, index){
        this.ch = ch;
        this.index = index;
    }

    is(ch){
        if(ch == ' '){
            return this.ch == ' ' || this.ch == '\xa0';
        }
        return this.ch == ch;
    }
}

const tokenize = function(text){
    let tokens = [];
    let symbols = [];
    symbols.peek = function() {
        if(this.length > 0){
            return this[this.length - 1]
        }
        return undefined;
    }
    symbols.popUntil = function(ch){
        let array = Array.isArray(ch)?ch:[ch];
        let pop = this.pop();
        while(array.includes(pop) && this.length > 0){
            pop = this.pop();
        }
        return pop;
    }

    // $start $end $split
    // text tag state empty

    let start = 0;
    let end = 0;
    let state = '$start';
    while(end < text.length){
        let ch = text.charAt(end);
        switch (ch) {
            case ' ':
            case '\xa0':
                if(state == '$start' || state == '$split'){ // position has no content
                    state = 'empty'
                }else if(state == 'text' || state == 'tag'){ // no close symbol content
                    tokens.push(new Token(state, text, start, end))
                    start = end;
                    state = "empty";
                }else if(state == 'state'){ // with close symbol content
                    let peeked = symbols.peek();
                    // [state] must has no space or only one space [ ]
                    if(peeked.is(' ') /* more than one space */ || peeked.index < end-1 /* has text before */ ){
                        let poped = symbols.popUntil(['[', '(', '<']);
                        state = 'text';
                        start = end = poped.index; // restart from [ as 'text'
                    }else{
                        symbols.push(new Symbol(ch, end)) // first & only [' ']
                    }
                }
                break;
            case '，':
            case '：':
                tokens.push(new Token(state, text, start, end))
                start = end;
                state = '$split';
                break;
            case '#':
            case '@':
            case '¥':
                if(state == '$start' || state=='$split'){
                    if(start < end){
                        tokens.push(new Token('text', text, start, end))
                    }
                    state = 'tag';
                    start = end;
                    symbols.push(new Symbol(ch, end))
                }else if(state == 'empty'){
                    tokens.push(new Token(state, text, start, end))
                    start = end;
                    state = 'tag';
                    symbols.push(new Symbol(ch, end))
                }
                break;
            case '[':
            case '(':
            case '<':
                if(state == '$start'){ // no need handle $split cause only self target it *NOW*
                    state = 'state'
                    symbols.push(new Symbol(ch, end));
                }else if(state == 'empty'){ // act as text
                    tokens.push(new Token(state, text, start, end))
                    state = 'text';
                    start = end;
                }
                break;
            case ']':
            case ')':
            case '>':
                if(state == 'state'){
                    let peeked = symbols.peek();
                    if((ch == ']' && peeked.is('[') || ch == ')' && peeked.is('(') || ch =='>' && peeked.is('<'))
                        && peeked.index == end-1){ // [] no content is not state
                        state = 'text';
                    }
                    tokens.push(new Token(state, text, start, end+1)) // close symbol contains self
                    start = end+1;
                    state = '$split'
                }else if(state == 'empty'){ // act as text
                    tokens.push({ type: state, text: text.substring(start, end)})
                    state = 'text'
                    start = end;
                }
                break;
            case '*':
            case '/':
            case '+':
            case '_':
                let symbol = symbols.peek();
                if(symbol && symbol.ch == ch){

                }
            default:
                if(state == '$start' || state == '$split'){
                    state = 'text'
                }else if(state == 'empty'){
                    tokens.push(new Token(state, text, start, end))
                    state = 'text'
                    start = end;
                }else if(state == 'state'){
                    let peeked = symbols.peek();
                    // [state] must has no space or only one space [ ]
                    if(peeked.is(' ') /* has space before */){ 
                        let poped = symbols.popUntil(['[', '(', '<']);
                        state = 'text';
                        start = end = poped.index; // restart from [ as 'text'
                    }
                }
                break;
        }
        end++;
    }
    
    if(start < end){
        let symbol = symbols.peek();
        if(state == 'tag' && symbol.is('#') && symbol.index == end-1){ // tag must has content
            state = 'text';
        }else if(state == 'state'){ // [state] must closed so not allow as $end status
            state = 'text'
        }
        tokens.push(new Token(state, text, start, end))
    }

    return tokens;
}

const addMatchTag = function(text, match, textOffset){
    if(!match || !match.matched || match.length == 0){
        return text.replace(/</g, '&lt;');
    }

    let start = match.start - textOffset;

    if(start >= 0 && start < text.length && match.length <= text.length - start){
        let left = text.substring(0, start);
        let center = text.substring(start, start+match.length);
        let right = text.substring(start+match.length, text.length);

        return left.replace(/</g, '&lt;') + '<span class="matched">' + center.replace(/</g, '&lt;') + '</span>' + right.replace(/</g, '&lt;');
    }

    return text.replace(/</g, '&lt;');
}

import moment from "moment";

const parseTime = function (text, note){
    let trySplit = text.lastIndexOf('-');
    if(trySplit > -1){
        let to = text.slice(trySplit, -1);
        console.log(to)
    }else{ // is time
        let time = moment(text, ["(h:m), <h:m>"]);
        if(note.baseDate){

        }else{
            let date = moment(note.id);
            time.set('year', date.year());
            time.set('month', date.month());
            time.set('date', date.date())
            
            return time.format("YYYY-MM-DD ddd HH:mm");
        }
    }
}

export default {
    parse: function(text) {
        let tokens = tokenize(text)
        return tokens;
    },
    html: function(note, match, type){
        if(type == 'content'){
            if(note.content){
                return note.content.replace(/</g, '&lt;');
            }
            return undefined;
        }

        if(!note.tokens || note.tokens.length == 0){
            return note.text.replace(/</g, '&lt;');
        }

        let htmlContent = "";
        let textOffset = 0;
        for (let i = 0; i < note.tokens.length; i++) {

            let token = note.tokens[i];

            switch (token.type) {
                case "tag":
                    htmlContent += '<span class="'+token.type+'">' + addMatchTag(token.text, match, textOffset) +'</span>'
                    break
                case "state":
                    let elClass = "state";
                    if(token.text[0] == '(' || token.text[0] == '<'){
                        note.time = parseTime(token.text, note);
                        if(note.time){
                            elClass += " time"
                        }
                    }else if(token.text == '[ ]' || token.text == '[\xa0]' || token.text == '[TODO]'){
                        elClass += " todo";
                    }else if(token.text == '[x]' || token.text == '[DONE]'){
                        elClass += " done"
                    }
                    htmlContent += '<span class="'+elClass+'">' + addMatchTag(token.text, match, textOffset) +'</span>'
                    break;
                case "text":
                case "empty":
                default:
                    htmlContent += addMatchTag(token.text, match, textOffset);
                    break;
            }

            textOffset += token.text.length;
        }

        return htmlContent;
    }
}