import { isObject } from '@vue/shared';
import { track,trigger} from "./effect"
import {reactive } from './reactive'

export const enum ReactiveFlags {
    IS_RECEIVE = '__v_isReactive'
}

export const baseHandlers = {
    get(target: object,key: PropertyKey,receiver: any){
        if(key === ReactiveFlags.IS_RECEIVE){
            return true;
        }
        // 收集依赖.
        track(target,'get',key)
        // 解决多层对象代理，深度代理
        let result = Reflect.get(target,key,receiver)
        if(isObject(result)){
            return reactive(result)
        }
        return result;
    },
    set(target: any,key: string,value: any,receiver: any){
        // 拿到旧的值
        let oldValue = target[key]
        let result = Reflect.set(target,key,value,receiver)
        if(oldValue !== value){
            // 不一致，更新
            trigger(target,'set',key,value,oldValue)
        }

        return result;
    }
}