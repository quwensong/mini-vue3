import { isObject } from "@vue/shared";
import { ReactiveFlags,baseHandlers } from "./baseHandlers";

// 实现同一个对象，代理多次就返回同一个代理
// 代理对象再次被代理时，可以直接返回
export function isReactive(value: any ){
    return !!(value && value[ReactiveFlags.IS_RECEIVE])
}


const reactiveMap = new WeakMap()

export function reactive(target:any):any{
    // console.log(target)
    if(!isObject(target)){
        return
    }
    if(isReactive(target)){
        return target;
    }
    let exisitTarget = reactiveMap.get(target)
    if(exisitTarget){
        return exisitTarget
    }
    const proxy =  new Proxy(target,baseHandlers)
    reactiveMap.set(target,proxy);
    return proxy;
}