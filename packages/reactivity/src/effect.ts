export let activeEffect:any = undefined

function clearupEffect(effect:ReactiveEffect){
    const { deps } = effect;
    for(let i = 0;i<deps.length;i++){
        deps[i].delete(effect)
    }
    effect.deps.length = 0;
}

export class ReactiveEffect{
    public active:boolean = true;//这个effect默认是激活状态
    public deps:Array<any> = [];//记录当前effect被哪些属性收集过，方便清理
    public parent = null;

    constructor(public fn: () => any,public scheduler?:() => any){}

    run(){
        if(!this.active){
            return this.fn()
        }
        try{
            this.parent = activeEffect
            activeEffect = this
            // 执行用户函数之前将之前收集的内容清空
            clearupEffect(this)
            return this.fn()
        }finally{
            activeEffect = this.parent
        }
    }
    stop(){
        if(this.active){
            this.active = false;
            clearupEffect(this);//停止effect的收集
        }
    }
}
// scheduler --> 调度器 --> 由用户自己决定如何更新
export function effect(fn: () => any,options:any={}){
    // fn可以根据状态变化自动重新执行，effect可以嵌套
    const _effect = new ReactiveEffect(fn,options.scheduler)
    _effect.run();//默认先执行一次

    const runner:any = _effect.run.bind(_effect) 
    runner.effect = _effect
    return runner;
}

const targetMap:WeakMap<object,Map<string,Set<ReactiveEffect>>> = new WeakMap();

export function track(target: object,type: any,key: any){
    if(!activeEffect) return;
    let depsMap:Map<string,Set<ReactiveEffect>> | undefined = targetMap.get(target);
    if(!depsMap){
        targetMap.set(target,depsMap=new Map())
    }
    let dep:Set<ReactiveEffect> | undefined = depsMap.get(key)
    if(!dep){
        depsMap.set(key,(dep = new Set()))
    }
    //把依赖放进Set数据结构里面
    trackEffects(dep)
}

export function trackEffects(dep:Set<ReactiveEffect>){
    if(activeEffect){
        let shouldTrack = !dep.has(activeEffect)
        if(shouldTrack){

            dep.add(activeEffect)

            activeEffect.deps.push(dep)
        }
    }
}

export function trigger(target: any,type: string,key: string,value: any,oldValue: any){
    const depsMap = targetMap.get(target)
    if(!depsMap){
        return
    }
    let effects = depsMap.get(key)
    if(effects){
        triggerEffect(effects)
    }
} 

export function triggerEffect(effects:Set<ReactiveEffect>){
    // 确保下面用到的是Set数据结构
    effects = new Set(effects)
        effects.forEach((effect:ReactiveEffect)=>{
            if(effect !== activeEffect){
                if(effect.scheduler){ // 如果用户传入了调度函数，执行用户的调度函数
                    effect.scheduler()
                }else{
                    effect.run() 
                }
               
            }
        })
}