import { reactive } from "@vue/reactivity";
import { hasOwn } from "@vue/shared";

export function initProps(instance:any,rawProps:any){
    // debugger
    const props:any = {}
    const attrs:any = {}
    // 用户声明过的props配置项
    const options = instance.propsOptions || {}
    if(rawProps){
        
        for(let key in rawProps){
            const value = rawProps[key]
            if(hasOwn(options,key)){
                props[key] = value
            }else{
                attrs[key] = value
            }
        }
    }
    // 这里的props不希望组件内部被更改，但是props是响应式的，后续属性变化了，要更新视图，所以应该用浅层reactive---> shallowReactive
    instance.props = reactive(props)
    instance.attrs = attrs
}

export function hasPropsChanged(oldProps: any = {},newProps: any = {}){
    const nextKeys = Object.keys(newProps)
    // 1.比个数
    if(nextKeys.length !== Object.keys(oldProps).length){ //说明要更新
        return true
    }
    // 2.比对属性值是否一致
    for(let i = 0;i < nextKeys.length;i++){
        const key = nextKeys[i]
        if(newProps[key] !== oldProps[key]){
            return true
        }
    }
    // props:{a:{aaa:'sssss'}} ---- > props:{a:{aaa:'6666'}}
    return false

}
// 代理的原对象变化了，那么Proxy也会变化
export function updateProps(oldProps: any,newProps: any) {
    // 看一下属性有没有变化，1.值的变化 2.属性的个数
    for(const key in newProps){
        oldProps[key] = newProps[key]
    }
    for(const key in oldProps){
        if(!hasOwn(newProps,key)){
            delete oldProps[key]
        }
    }
}
        // let obj = {
        //     name:'444'
        // }

        // let props = new Proxy(obj,{
        //     get(target,key){
        //         return target[key]
        //     },
        //     set(target,key,value){
        //         target[key] = value
        //         return true
        //     }
        // })
        // console.log(props.name) // 444

        // setTimeout(()=>{
        //     obj.name = "8888"
        // },3000)


        // setTimeout(()=>{
        //     console.log(props.name) //8888
        // },6000)
