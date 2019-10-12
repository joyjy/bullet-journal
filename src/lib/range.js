const recurisePositionAndLengh = function(el, container, offset, length){
    for (let i = 0; i < el.childNodes.length; i++) {
        const child = el.childNodes[i];
        if(child.nodeType == Node.ELEMENT_NODE && child.firstChild.isSameNode(container)){
            return [offset, length];
        }else if(child.isSameNode(container)){
            return [offset, length];
        }else{
            let result = recurisePositionAndLengh(child, container, offset, length)
            if(result){
                return result;
            }
        }
        offset += child.textContent.length; // .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "_")
    }
}

const recuriseFocus = function(el, position, range){
    for (let i = 0; i < el.childNodes.length; i++) {
        if(position < 0){
            throw el, position;
        }
        const node = el.childNodes[i];
        if(position <= node.textContent.length){
            if(node.nodeType == Node.TEXT_NODE){
                range.setStart(node, position);
                range.setEnd(node, position);
                return;
            }else {
                recuriseFocus(node, position, range);
            }
            break;
        }else{
            position -= node.textContent.length;
        }
    }
}

export default {
    rect(el){
        if(!el){
            return;
        }
        if(!el.hasAttribute("contenteditable")){
            throw el;
        }
        let sel = window.getSelection && window.getSelection();
        if (!sel || sel.rangeCount == 0) {
            return;
        }

        let range = sel.getRangeAt(0);
        return range.getBoundingClientRect()
    },
    position(el){
        return this.positionAndLength(el)[0];
    },
    positionAndLength(el){
        if(!el.hasAttribute("contenteditable")){
            throw el;
        }

        let sel = window.getSelection && window.getSelection();
        if (!sel || sel.rangeCount == 0) {
            return [-1, 0];
        }

        let range = sel.getRangeAt(0);

        let container = range.commonAncestorContainer;
        let offset = range.startOffset;
        let length = range.endOffset - offset;
        if(container.isSameNode(el)){
            return [offset, length];
        }

        let result = recurisePositionAndLengh(el, container, offset, length);
        if(result){
            return result;
        }

        throw range;
    },
    focus(el, position){
        if(!el.hasAttribute("contenteditable")){
            throw el;
        }
        el.focus();
        if(position && position > 0){
            let range = document.createRange();//Create a range (a range is a like the selection but invisible)
            
            recuriseFocus(el, position, range);

            let selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
    }
}