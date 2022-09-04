import { isObject, isFunction } from '@vue/shared';
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";


// let a = {
//     n:'sss'
// }
// let apro = new Proxy(a,{})
// console.log(typeof apro) 输出----> object
        

// 递归访问对象属性
function traversal(value: any,set = new Set()) {//考虑如果对象中是否有循环引用
    if(!isObject(value)){ //如果不是引用数据类型
        return value
    }
    if(set.has(value)){
        return value
    }
    set.add(value)
    for(let key in value) {
        traversal(value[key],set)
    }
    return value
}


// 1. 用户传入的对象 source        cb:callback  用户传入的回调函数
export function watch(source: any,cb: any){
    let getter:any;
    // 对用户传入的数据对象进行循环，递归循环，只要循环就会访问到对象上面的每一个属性，
    // 从而调用属性的get,就会收集当前属性对应的effect ---> 
    // const state = reactive({name:'ddd,age:78})
    // watch(state,()=>{
            
    // })
    // name:[effect1,effect2....],  
    // age:[effect1,effect2....].....
       
    if(isReactive(source)){
        getter = () => traversal(source)
    }else if(isFunction(source)){
        getter = source
    }else{
        return 
    }
    let clear:any;
    const onClearup = (fn: any) => {
        clear = fn;
    }

    let oldValue: any;
    // 属性变化了，就会走 job 函数
    const job = () => {
        if(clear){
            clear();
        }
        const newValue = effect.run() 
        cb(newValue,oldValue,onClearup)
        oldValue = newValue
    }

    const effect = new ReactiveEffect(getter,job);

    oldValue = effect.run()

    return effect.run()

}