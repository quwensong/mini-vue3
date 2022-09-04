import { ReactiveEffect, triggerEffect,trackEffects } from './effect';
import { isFunction } from '@vue/shared'
// 只读
// const count = ref(1)
// const plusOne = computed(() => count.value + 1)

// console.log(plusOne.value) // 2

// plusOne.value++ // 错误

class ComputedRefImpl{
    
    public effect:ReactiveEffect;
    public _dirty: boolean = true; //默认第一次调用属性的时候进行计算,用来判断该不该重新计算，为true说明这个值是脏的，说明依赖的变量变化了，那么就应该重新运行effect.fun()
    public __v_isReadonly:boolean = true;//计算属性默认是只读的
    public __v_isRef:boolean = true; 
    public _value:any = 999;
    public dep!: Set<ReactiveEffect>;

    constructor(public getter:any,public setter:any){
        // 将用户输入的getter放到effect中，getter函数返回结果用到的变量就会被这个effect收集起来
        //  export let activeEffect:any = undefined


        // ....创建ReactiveEffect实例对象，并且在构造函数内部把 创造出来的 实例 赋值给  activeEffect

        // this.parent = activeEffect
        // activeEffect = this
        this.effect =  new ReactiveEffect(getter,()=>{
            // 稍后此计算属性 effect 依赖的属性(getter里面的属性)变化会了 就会执行此调度函数
            // scheduler
            // 只要触发了这个函数说明响应式对象的值发生改变了
            // 那么就解锁，后续在调用 get 的时候就会重新执行，所以会得到最新的值

            if(!this._dirty){ // 
                this._dirty = true;
                // 实现=一个触发更新
                triggerEffect(this.dep)
            }
        })
    }
    // 类中的属性访问器，底层是 Object.defineProperty
    get value(){
        // debugger
        // 第一次运行计算属性，发现值是脏的，那么就运行getter，返回的值保存到计算实例对象的_value上，然后再给用户
        // 做依赖收集
        trackEffects(this.dep || (this.dep = new Set()))
        if(this._dirty){
            // debugger
            this._dirty = false;
            this._value = this.effect?.run();
            // const state = Reactive({count:2,end:999}) // 这一步，state已经是一个代理对象了
            // const plusOne = computed(() => state.count + state.end)
            // console.log(plusOne.value) // 1001
            // 这里已经收集依赖了，只要new ReactiveEffect() 就会产生一个
        }
        return this._value
    }
    set value(newVal){
        this.setter(newVal)
    }
}

export const computed = (getterOrOptions: any)=>{
   
    let onlyGetter = isFunction(getterOrOptions) 
    
    let getter:any;
    let setter:any;

    if(onlyGetter){
        getter = getterOrOptions
        setter = ()=>{ console.warn('no set') }
    }else{
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }

    return new ComputedRefImpl(getter, setter)
}