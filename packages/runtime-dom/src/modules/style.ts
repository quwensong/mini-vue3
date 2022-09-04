export function patchStyle(el: any,preValue: any,nextValue: any ){
    // 去除之前有的，之后没有的属性
    for(let key in nextValue){
        el.style[key] = nextValue[key];
    }

    if(preValue){
        for(let key in preValue){
            if(nextValue[key] ==  null){
                el.style[key] = null
            }
        }
    }
}