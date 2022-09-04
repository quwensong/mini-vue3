import { isArray, isObject } from '@vue/shared';
import { ReactiveEffect, trackEffects, triggerEffect } from './effect';
import { reactive } from './reactive'


function toReactive(value: any){
    return isObject(value) ? reactive(value) : value;
}

class RefImpl {
    public dep:Set<ReactiveEffect> = new Set();
    public _value:any;
    public __v_isRef:boolean = true;

    constructor(public rawValue:any){
        this._value = toReactive(rawValue);
    }

    get value(){
        trackEffects(this.dep)
        return this._value;
    }
    set value(newValue:any){
        if(newValue !== this.rawValue){
            this._value = toReactive(newValue);
            this.rawValue = newValue;
            triggerEffect(this.dep)
        }
    }
}

class ObjectRefImpl{
    constructor(public object:any,public key:string){

    }
    get value(){
        return this.object[this.key]
    }
    set value(newVal){
        this.object[this.key] = newVal
    }
}

export function ref(value:any){
    return new RefImpl(value);

}

export function toRef(object: any,key: string){
    return new ObjectRefImpl(object,key)
}

// 只是将.value属性代理到原始类型上，toRefs只是做了代理，实际上还是访问的原代理对象object
export function toRefs(object: any){
    const result:any =  isArray(object) ? new Array(object.length) : {};
    
    for(let key in object){
        result[key] = toRef(object,key) 
    }
    return result;

}

export function proxyRefs(object:any){
    // debugger
    return new Proxy(object,{
        get(target,key,recevier){
            let result =  Reflect.get(target,key,recevier)
            return result.__v_isRef ? result.value : result
        },
        set(target,key,value,recevier){
            const oldValue = target[key];
            if(oldValue.__v_isRef){
                oldValue.value = value
                return true
            }else{
                return Reflect.set(target,key,value,recevier)
            }
        }
    })


}