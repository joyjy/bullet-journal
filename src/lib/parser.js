import lexer from "./lexer"

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

const textHtml = function(note, match){

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
                    if(token.time){
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

const contentHtml = function(note, match){
    if(note.content && note.content.text){
        return note.content.text.replace(/</g, '&lt;');
    }
    return undefined;
}

export default {
    parse: lexer.tokenize,
    html: function(note, match, type){
        if(type == 'content'){
            return contentHtml(note, match)
        }

        return textHtml(note, match);
    }
}