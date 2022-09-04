
//  node节点操作
export const nodeOps = {
    /**
     * 
     * @param child 将要插入的节点
     * @param parent 父节点
     * @param anchor 被参照的节点（即要插在该节点之前）,当传入null时，新插入的元素将会插入到父元素的子元素列表末尾。
     */

    insert(child: any,parent: any,anchor = null){
        parent.insertBefore(child,anchor);
    },

    remove(child:any){
        const parentNode = child.parentNode;
        if(parentNode){
            parentNode.removeChild(child);
        }
    },
    // 文本节点 || 元素中的内容 textContent:设置节点的文本内容
    setElementText(el: any,text: any){
        el.textContent = text;
    },
    // nodeValue 属性设置或返回指定节点的节点值
    setText(node: any,text: any){
        node.nodeValue = text;
    },
    querySelector(selector: any){
        return document.querySelector(selector)
    },
    parentNode(node:any){
        return node.parentNode;
    },
    /**
    *    nextSibling 属性返回指定节点之后紧跟的节点，在相同的树层级中。
    *   被返回的节点以 Node 对象返回。
    *   注释：如果没有 nextSibling 节点，则返回值为 null。
    */
    nextSibling(node:any){
        return node.nextSibling
    },
    createElement(tagName: any){
        return document.createElement(tagName);
    },
    createText(text: any){
        return document.createTextNode(text);
    }

}