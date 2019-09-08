export default {
    position(el){
        //console.log("position", el);
        if(!el.hasAttribute("contenteditable")){
            throw el;
        }

        let sel = window.getSelection && window.getSelection();
        if (!sel || sel.rangeCount == 0) {
            return -1;
        }

        let range = sel.getRangeAt(0);
        let container = range.commonAncestorContainer;
        let offset = range.startOffset;
        if(container.isSameNode(el)){
            return offset;
        }

        let childLength = container.textContent.length;
        while(!container.isSameNode(el)){
            container = container.parentNode;
            offset += container.textContent.length;
            offset -= childLength;
            childLength = container.textContent.length;
        }

        return offset;
    },
    focus(el, position){
        //console.log("focus", el, position)
        if(!el.hasAttribute("contenteditable")){
            throw el;
        }
        el.focus();
        if(position && position > 0){
            let range = document.createRange();//Create a range (a range is a like the selection but invisible)
            
            for (let i = 0; i < el.childNodes.length; i++) {
                if(position < 0){
                    throw el, position;
                }
                const node = el.childNodes[i];
                if(position <= node.textContent.length){
                    if(node.nodeType == Node.TEXT_NODE){
                        range.setStart(node, position);
                        range.setEnd(node, position);
                    }else{
                        range.setStart(node.firstChild, position);
                        range.setEnd(node.firstChild, position);
                    }
                    break;
                }else{
                    position -= node.textContent.length;
                }
            }

            let selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
    }
}