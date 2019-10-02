import lexer from "./lexer";

const clarify = function(text){
    return text.replace(/</g, "&lt;");
}

const addMatchTag = function(text, match, textOffset, targetType){
    if(!match || !match.matched || match.ranges.length === 0){
        return clarify(text);
    }

    let matchedText = "";

    for (let i = 0; i < match.ranges.length; i++) {
        let [start, length, type] = match.ranges[i];

        if(type !== targetType){
            continue;
        }
        
        start = start - textOffset;

        if(start >= 0 && start < text.length && length <= text.length - start){
            let left = text.substring(0, start);
            let center = text.substring(start, start+length);
            let right = text.substring(start+length, text.length);

            matchedText += clarify(left) + '<span class="matched">' + clarify(center) + "</span>" + clarify(right);
        }
    }

    if(matchedText){
        return matchedText;
    }

    return clarify(text);
}

const urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

const parseHtml = function(type, tokens, match){

    if(tokens.length === 0){
        return "";
    }

    let htmlContent = "";
    let textOffset = 0;
    for (let i = 0; i < tokens.length; i++) {

        let token = tokens[i];

        switch (token.type) {
            case "tag":
                htmlContent += '<span class="'+token.type+'">' + addMatchTag(token.text, match, textOffset, type) +"</span>";
                break;
            case "state":
                let elClass = "state";
                if(token.text[0] === "(" || token.text[0] === "<"){
                    if(token.time){
                        elClass += " time";
                    }
                }else if(token.text === "[ ]" || token.text === "[\xa0]" || token.text === "[TODO]"){
                    elClass += " todo";
                }else if(token.text === "[x]" || token.text === "[DONE]"){
                    elClass += " done";
                }
                htmlContent += '<span class="'+elClass+'">' + addMatchTag(token.text, match, textOffset, type) +"</span>";
                break;
            case "empty":
                htmlContent += token.text;
                break;
            case "text":
                if (token.text.match(urlReg)) {
                    htmlContent += '<a class="link" href="'+token.text+'">'+addMatchTag(token.text, match, textOffset, type)+"</a>";
                } else {
                    htmlContent += addMatchTag(token.text, match, textOffset, type);
                }
                break;
            default:
                htmlContent += addMatchTag(token.text, match, textOffset, type);
                break;
        }

        textOffset += token.text.length;
    }

    return htmlContent;
}

export default {
    parse: lexer.tokenize,
    html(note, match, type){
        if(type === "content"){
            return parseHtml("content", note.content.tokens, match);
        }

        return parseHtml("text", note.tokens, match);
    }
}