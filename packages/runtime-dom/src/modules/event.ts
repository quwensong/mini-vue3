function createInvokers(callback: (e: any) => any){
    const invoker = (e: any) => invoker.value(e)
    invoker.value = callback
    return invoker;
}
export function patchEvent(el: any,eventName: any,nextValue: any){
    // 先移除事件，再重新添加事件
    // console.log('00',el,'----',eventName,'----',nextValue)
    /**
     * @param invokers
     * {
     *  'click':btnClick,
     *  'mouseenter':btnMouseEnter,
     * .....
     * }
     */
    // debugger
    let invokers =  el._vui || (el._vui = {})
    let exits =  invokers[eventName]// 先看有没有缓存过

    if(exits && nextValue){ // 已经绑定过事件了
        exits.value = nextValue // 没有卸载函数，只是改变了invoker.value的值
    }else{// onClick -> click ，不存在就绑定事件
        let event =  eventName.slice(2).toLowerCase()
        if(nextValue){
            const invoker =  invokers[eventName] = createInvokers(nextValue) 
            el.addEventListener(event,invoker)
        }else if(exits){ // 如果存在旧的值，就要移除掉老的绑定事件
            el.removeEventListener(event,exits)
            invokers[eventName] = undefined;
        }
        
    }

}
// document.querySelector('html').addEventListener('click',function(e) {
//     console.log(e.composed);
//     console.log(e.composedPath());
//   });