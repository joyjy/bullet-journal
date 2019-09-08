const noteSpec = {
    id: 1,
    text: "text",
    parent: { id: 1, text: "text"},
    notes: [],
    state: {},
    tags: [{
        id: 1,
        text: "tag",
        start: 1,
        end: 1,
    }],
    scheduld: {}
}

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
                if(state != 'empty'){
                    tokens.push({ type: state, text: text.substring(start, end)})
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
            default:
                if(state == 'empty'){ // text start
                    tokens.push({ type: state, text: text.substring(start, end)})
                    start = end;
                    state = 'text'
                }else if(state == 'start'){
                    start = end;
                    state = 'text'
                }
                break;
        }
        end++;
    }
    
    if(start < end){
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
                    htmlContent += '<span class="tag">' + token.text +'</span>'
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