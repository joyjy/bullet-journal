import lexer from "./lexer";

const clarify = function(text){
    return text.replace(/</g, "&lt;");
}

const addMatchTag = function(text, match, textOffset){
    if(!match || !match.matched || match.ranges.length === 0){
        return clarify(text);
    }

    let matchedText = "";

    for (let i = 0; i < match.ranges.length; i++) {
        const range = match.ranges[i];
        
        let start = range[0] - textOffset;

        if(start >= 0 && start < text.length && range[1] <= text.length - start){
            let left = text.substring(0, start);
            let center = text.substring(start, start+range[1]);
            let right = text.substring(start+range[1], text.length);

            matchedText += clarify(left) + '<span class="matched">' + clarify(center) + "</span>" + clarify(right);
        }
    }

    if(matchedText){
        return matchedText;
    }

    return clarify(text);
}

const textHtml = function(note, match){

    if(!note.tokens || note.tokens.length === 0){
        return clarify(note.text);
    }

    let htmlContent = "";
    let textOffset = 0;
    for (let i = 0; i < note.tokens.length; i++) {

        let token = note.tokens[i];

        switch (token.type) {
            case "tag":
                htmlContent += '<span class="'+token.type+'">' + addMatchTag(token.text, match, textOffset) +"</span>";
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
                htmlContent += '<span class="'+elClass+'">' + addMatchTag(token.text, match, textOffset) +"</span>";
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
        return clarify(note.content.text);
    }
    return undefined;
}

export default {
    parse: lexer.tokenize,
    html(note, match, type){
        if(type === "content"){
            return contentHtml(note, match);
        }

        return textHtml(note, match);
    }
}