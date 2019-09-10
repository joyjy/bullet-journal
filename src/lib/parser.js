const tokenize = function(text){
    let tokens = [];

    let start = 0;
    let end = 0;
    let state = 'start';
    while(end < text.length){
        let ch = text.charAt(end);
        switch (ch) {
            case ' ':
            case '\xa0':
                if(state == 'tag' || state == 'text'){
                    tokens.push({ type: state, text: text.substring(start, end)})
                    start = end;
                    state = "empty";
                }else if(state == 'state'){
                    tokens.push({ type: 'text', text: text.substring(start, end)})
                    start = end;
                    state = "empty";
                }
                break;
            case '#':
                if(state == 'empty'){
                    tokens.push({ type: state, text: text.substring(start, end)})
                    start = end;
                    state = 'tag';
                }
                break;
            case '[':
                if(state == 'start'){
                    state = 'state'
                }
                break;
            case ']':
                if(state == 'state'){
                    tokens.push({ type: state, text: text.substring(start, end+1)})
                    start = end+1;
                    state = 'split'
                }
                break;
            default:
                if(state == 'empty'){ // text start
                    tokens.push({ type: state, text: text.substring(start, end)})
                    start = end;
                    state = 'text'
                }else if(state == 'start' || state == 'split'){
                    start = end;
                    state = 'text'
                }
                break;
        }
        end++;
    }
    
    if(start < end){
        if(state == 'state'){
            state = 'text'
        }
        tokens.push({ type: state, text: text.substring(start, end)})
    }

    return tokens;
}

export default {
    parse: function(text) {
        let tokens = tokenize(text)
        return tokens;
    },
    html: function(note){
        if(!note.tokens || note.tokens.length == 0){
            return note.text;
        }

        let htmlContent = "";
        for (let i = 0; i < note.tokens.length; i++) {
            let token = note.tokens[i];
            switch (token.type) {
                case "tag":
                case "state":
                    htmlContent += '<span class="'+token.type+'">' + token.text +'</span>'
                    break;
                case "text":
                case "empty":
                default:
                    htmlContent += token.text;
                    break;
            }
        }

        return htmlContent;
    }
}