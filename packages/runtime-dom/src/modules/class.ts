export function patchClass(el: any,nextValue: string){
    if(nextValue == null){
        el.removeAttribute('class')
    }else{
        el.className = nextValue
    }
}