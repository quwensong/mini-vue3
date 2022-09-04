import { currentInstance, setCurrentInstance } from './component'


export const enum LifeCYcleHooks {
    BEFORE_MOUNT = 'bm',
    MOUNTED = "m",
    BEFORE_UPDATE = 'bu',
    UPDATED = 'u'
}

function createHooks(type:string){
    return (hook: any,target:any = currentInstance)=>{
        if(target){
            // debugger
            const hooks = target[type] || (target[type] = [])
            // 运用闭包保存 target 组件实例对象
            const wrappedHook = () => {
                setCurrentInstance(target)
                hook()
                setCurrentInstance(null)
            }
            hooks.push(wrappedHook)
        }
    }
}

export const onBeforeMount = createHooks(LifeCYcleHooks.BEFORE_MOUNT)
export const onMounted = createHooks(LifeCYcleHooks.MOUNTED)
export const onBeforeUpdate = createHooks(LifeCYcleHooks.BEFORE_UPDATE)
export const onUpdated = createHooks(LifeCYcleHooks.UPDATED)
