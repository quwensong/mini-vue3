import { reactive } from '@vue/reactivity';
import { hasOwn, isFunction, isObject } from "@vue/shared"
import { proxyRefs } from 'packages/reactivity/src/ref';
import { initProps } from "./componentProps"
import { initSlots } from './componentSlots';

export let currentInstance:any = null;
export const setCurrentInstance = (instance:any) => {currentInstance = instance}
export const getCurrentInstance = () => {return currentInstance}

const publicPropertyMap:any = {
    // 当用户调用 instance.proxy.$emit 时就会触发这个函数
    // i 就是 instance 的缩写 也就是组件实例对象
        $el: (i:any) => i.vnode.el, // $el 直到组件挂载完成 (mounted) 之前都会是 undefined
        $emit: (i: any) => i.emit,
        $slots: (i: any) => i.slots,
        $props: (i: any) => i.props,
        $attrs:(i: any)=> (i.attrs)
}

export interface Iinstance {
    data?:any, //当前组件的状态
    setup?:any,
    setupState?:null,// setup函数的返回结果
    vnode:any, // 当前组件的虚拟节点
    isMounted:boolean, //是否挂载
    subTree:any , //渲染的组件内容
    update:any,
    props?:any,
    attrs?:any,
    render:any,
    propsOptions?:any,
    next?:any,
    proxy:any,
    slots?:any
}


export function createComponenntInstance(vnode:any){

    const instance:Iinstance = {
        data:null, //当前组件的状态
        setup:null,
        setupState:null,//setup的状态
        vnode, // 当前组件的虚拟节点
        isMounted: false, //是否挂载
        subTree:null , //渲染的组件内容
        update:null,
        props:{},
        attrs:{},
        render:null,
        propsOptions:vnode.type.props,
        proxy:Proxy
    }
    return instance
}

const publicInstanceProxy = {
    get(target:any,key:string){
        // 优先级,如果data,props,setup都有一个同名属性,setup返回的该属性优先级最高
        if (key[0] !== "$") {
            // 说明不是访问 public api
            // 先检测访问的 key 是否存在于 setupState 中, 是的话直接返回
            const {data,props,setupState} = target;
            if(hasOwn(setupState,key)){
                return setupState[key];
            }else if(data && hasOwn(data,key)){
                return data[key];
            }
            else if(props && hasOwn(props,key)){
                return props[key];
            }
        }
        const getter = publicPropertyMap[key]
        if(getter){
            return getter(target)
        }
    },
    set(target:any,key:any,value:any){
        const {data,props,setupState} = target;
        if(hasOwn(setupState,key)){
            setupState[key] = value
            return true
        }else if(data && hasOwn(data,key)){
            data[key] = value;
            return true
        }
        else if(props && hasOwn(props,key)){
            console.warn('不能修改props!!!' + ' key ---->  ' +(key as String))
            return false;
        }
        return true
    }
}

export function setupComponent(instance:Iinstance){
    // 初始化属性
    // type 用户传入的自定义组件对象包含 ，data,setup,props,methods,render...
    let { props,type,children } = instance.vnode
    initProps(instance,props)//初始化props属性
    initSlots(instance,children)//初始化slot插槽
    // 插槽的原理，调用父组件传过来的 函数 ，调用，产生 虚拟 dom 进行替换

    // 创建实例的代理对象
    instance.proxy = new Proxy(instance,publicInstanceProxy)

    const data =  type.data
    if(data){
        if(!isFunction(data)) return console.warn('data option must be a function')
        //  debugger
        instance.data = reactive(data.call(instance.proxy))
    }
    const setup = type.setup
    if(setup){
        const setupContext = {
            emit:(event: any,...args: any)=>{
                const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
                // 找到虚拟父节点存放的props里面对应的事件，并且触发
                // return ()=>{
                //     return h('h',{onClick:() => emit('xxx','ok')},['hello  ',age.value]) --> 子
                // }
                // render(h(VueComp,{onXxx:(value)=>alert(value)}),app) --> 父
                const hander =  instance.vnode.props[eventName]
                hander && hander(...args)
            },

        }
        setCurrentInstance(instance)
        const setupResult = setup(instance.props,setupContext)
        setCurrentInstance(null)
        if(isFunction(setupResult)){
            instance.render = setupResult
        }else if(isObject(setupResult)){
            // 对内部的ref 取消.value
            instance.setupState = proxyRefs(setupResult)
        }
    }
    if(!instance.render){
        instance.render = type.render
    }

// 这个函数的主要作用就是，初次挂载的时候，收集依赖
//  const setupRenderEffect = (instance: any,container: any,anchor: any)=> {}
//  const { render } = instance
// render函数 保存到实例上面，后面会用到
// instance.render = type.render

}
// 插槽实例代码
// const VueComp = {
//     props:{
//         name:String
//     },
//     setup(props,{emit}) {
//         const age = ref('4444')
//         setTimeout(() =>{
//             age.value++
//         },3000)
//     },
//     render(){
//         return h(Fragment,{onClick:() => emit('xxx','ok')},[
//                 h('div',this.$slots.hhh())
//        ])
//     }
// }
// render(h(VueComp,null,{
//     hhh:()=> h('h1','ok')
// }),app)

