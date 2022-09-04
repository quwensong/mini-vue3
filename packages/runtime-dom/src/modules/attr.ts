export function patchAttr(el: any,key: string,nextValue: any){
    if(nextValue){
        el.setAttribute(key,nextValue);
    }else{
        el.removeAttribute(key);
    }
}