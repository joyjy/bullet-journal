<script>
export default {
    position(){
        let range = window.getSelection().getRangeAt(0);
        let el = range.commonAncestorContainer;
        if(el instanceof Text || el.hasAttribute("contenteditable")){
            return range.startOffset;
        }else{
            return 0;
        }
    },
    focus(el){
        if(!el){
            el = this.$el;
        }
        let text;
        if(el.hasAttribute("contenteditable")){
            text = el;
        }else{
            text = el.querySelectorAll('[contenteditable="true"]')[0];
        }
        text.focus();
        return text;
    },
    focusAt(position, el){
        let text = this.focus(el)
        let content = text.firstChild;
        if(content){
            let range = window.getSelection().getRangeAt(0);
            range.setStart(content, position);
            range.setEnd(content, position);
        }
    },
    focusAtEnd(el){
        let text = this.focus(el)
        let content = text.firstChild;

        if(content == null){
            return 0;
        }
        
        let range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {    
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            
            range.setStart(content, content.length);
            range.setEnd(content, content.length)

            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }

        return content.length;
    },
}
</script>