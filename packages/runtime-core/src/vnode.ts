import { isArray, isNumber, isObject,isString,ShapeFlags } from "@vue/shared";


export function isVnode(vnode: any){
    return !!(vnode?.__v_isVnode)
}

export function isSameVnode(oldVnode: any, newVnode: any){ //1.标签名相同 2.key相同

    return !!((oldVnode.type === newVnode.type) && (oldVnode.key === newVnode.key))

}

export const Text = Symbol("Text");
export const Fragment = Symbol("Fragment");

// 虚拟节点有： 组件类型、元素类型、文本类型
export function createVnode(type: any,props?: any,children?: string | Array<any>,patchFlag?: any){
    // 1.类型是字符串的时候再判断是不是dom元素节点
    // ShapeFlags.COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
    let shapeFlags = 
        isString(type) ? ShapeFlags.ELEMENT : 
        isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    let vnode = { // key标识虚拟节点的类型,每个虚拟节点对应一个真实节点:el
        el:null,
        type,
        props,
        children,
        key: props?.['key'],
        __v_isVnode: true,
        component:null,
        shapeFlags,
        patchFlag
    }
    if(children){
        let type:number = 0;
        if(isArray(children)){
            type = ShapeFlags.ARRAY_CHILDREN;
        }else if(isObject(children)){//说明这个组件带有插槽
            type = ShapeFlags.SLOTS_CHILDREN
        }else{
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN;
        }
        vnode.shapeFlags |= type
    }
    if(currentBlock && vnode.patchFlag){
        currentBlock.push(vnode)
    }

    return vnode;
}
let currentBlock: any[] | null = null;


export { createVnode as createElementVnode } 

export function openBlock(){  // 用一个数组收集多个动态节点
    currentBlock = []
}

export function createElementBlock(type: any,props?: any,children?: string | Array<any>,patchFlag?: undefined){
    return setupBlock(createVnode(type,props,children,patchFlag)) 
}

function setupBlock(vnode: any){
    vnode.dynamicChildren = currentBlock;
    currentBlock = null;
    return vnode;
}

// export function _createElementVnode(){

// }

export function toDisplayString(value:any){
    return isString(value) ? value : value === null ? '' : isObject(value) ? JSON.stringify(value) : String(value)

}

