import { ReactiveEffect } from '@vue/reactivity';
import { isString,isNumber} from '@vue/shared';
import { ShapeFlags,PatchFlags} from '@vue/shared';
import { getSequence } from './sequence';
import { queueJob} from './scheduler';
import { Text, createVnode, isSameVnode, Fragment } from './vnode';
import { updateProps ,hasPropsChanged} from './componentProps';
import { createComponenntInstance, Iinstance, setupComponent } from './component';


// import { Iinstance } from './component';
export function createRenderer(renderOptions: any){
    const {
        insert:hostInsert,
        remove:hostRemove,
        setElementText:hostSetElementText,
        setText:hostSetText,
        querySelector:hostQuerySelector,
        parentNode:hostParentNode,
        nextSibling:hostNextSibling,
        createElement:hostCreateElement,
        createText:hostCreateText,
        patchProp:hostPatchProp
    } = renderOptions
    // 比较新旧节点的属性
    const patchProps = (oldProps: any, newProps: any, el: any) => {
        // 新的里面有，直接用新的虚拟dom上面的属性
        for(let key in newProps){
            hostPatchProp(el,key,oldProps[key],newProps[key] )
        }
        // 老的有，新的没有，就移除掉旧的
        for(let key in oldProps){
            if(newProps[key] == null){
                // debugger
                hostPatchProp(el,key,oldProps[key],undefined)
            }
        }
    }
    // h('div', { oid:'oldid'},'旧节点') ---> oldVnode
    // h('div', { id: 'newid' }, '新节点') ----> newVnode
    // 被渲染成如下的真实dom
    // <div oid="oldid">
    //     旧节点
    // </div>

    // <div id="newid">
    //     新节点
    // </div>

    //  let el = newVnode.el = oldVnode.el
    // diff算法部分
    const patchKeyedChildren = (c1: any, c2: any, el:any) => {
        // debugger
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        //从前往后，遇到不同的就跳出
        while(i <= e1 && i <= e2){//有任何一方停止循环就跳出
            const vnode1 = c1[i];
            const vnode2 = c2[i];
            if(isSameVnode(vnode1, vnode2)){
                patch(vnode1,vnode2,el) //比较两个节点的属性和子节点
            }else{
                break;
            }
            i += 1;
        }
        // 从后往前
        while(i <= e1 && i <= e2){
            const vnode1 = c1[e1];
            const vnode2 = c2[e2];
            if(isSameVnode(vnode1, vnode2)){
                patch(vnode1,vnode2,el) //比较两个节点的属性和子节点
            }else{
                break;
            }
            e1 -= 1;
            e2 -= 1;
        }
        // i > e1 说明有新增的
        // i 和 e2 之间的是新增加的节点
        if(i > e1){
            if(i <= e2){
                while(i <= e2){
                    const nextPosition = e2 + 1
                    // 根据下一个节点的索引来看参照物，下一个有节点就往前插入，没有就往后插入
                    const anchor = nextPosition < c2.length ? c2[nextPosition].el : null
                    patch(null,c2[i],el,anchor)//创建新节点，扔到容器  el 中
                    i++
                }
            }
        // 卸载
        }else if(i > e2){
            if(i <= e1){
                while(i <= e1){
                    unmount(c1[i])
                    i += 1
                }
            }
        }

        // 乱序对比
        let s1 = i
        let s2 = i
        const keyToNewIndexMap = new Map()
        for(let i = s2; i <= e2; i++){
            keyToNewIndexMap.set(c2[i]?.key,i)
        }
        // 循环旧节点，看一下新的里面有没有，如果有，则要比较差异，没有要添加到列表中，老的有，新的没有就要删掉
        const toBePatch = e2 - s2 + 1 // 新节点的总个数，从后往前插入
        const newIndexToOldIndexMap = new Array(toBePatch).fill(0) // 记录是否比对过的映射表

        for(let i = s1; i <= e1; i++){
            const oldChildVnode = c1[i]
            let newIndex =  keyToNewIndexMap.get(oldChildVnode?.key)
            if(newIndex == undefined){ // 新的没有，老的有，卸载
                unmount(oldChildVnode)
            }else{ //如果都有，就比较差异
                // 新的节点位置 对应着  老的节点且patch过的位置，不包括老的节点没有，新的节点有的情况
                newIndexToOldIndexMap[newIndex - s2] = i + 1; // 标记当前patch过的位置
                patch(oldChildVnode,c2[newIndex],el)
            }
        }
        // 需要移动位置
        // 获取最长递增子序列
        let incrementArr =  getSequence(newIndexToOldIndexMap)
        // 递增子序列的最后一个索引 incrementArrEndIndex
        let incrementArrEndIndex = incrementArr.length - 1
        for(let i = toBePatch - 1 ; i >= 0 ; i--){
            let curIndex =  i + s2;
            let current =  c2[curIndex]; 
            const anchor = curIndex + 1 < c2.length ? c2[curIndex + 1].el : null;
            //参照物为当前节点的下一个虚拟节点绑定的 el ，因为是从后往前插入
            if(newIndexToOldIndexMap[i] === 0){ //要新创建一个节点
                patch(null,current,el,anchor)
            }else{// 说明可以复用旧节点，因为旧节点中一定存在与新节点 type 一样的节点
                if(i != incrementArr[incrementArrEndIndex] ){
                    hostInsert(current.el,el,anchor);
                }else{
                    incrementArrEndIndex -= 1;
                }
            }
            // 区分：哪些是新增加的，旧节点里面没有 ，看一下虚拟节点有没有 el
            
            // 最长递增子序列实现，vue2没有这个判断比如  c d e --->  e c d 其中c d 是不需要重新插入的，把 e 插入到 c 前面就行了
        }
    }
    /**
     * 只有type相同才会到这里来比较标签里面的内容
     * @param oldVnode 
     * @param newVnode 
     * @param el 就是上面那个旧节点最外层的div元素，为什么取旧的呢？是为了复用，因为标签名已经相同了，就没有必要再去创建一个新的div，直接在旧的元素上面修改就行了
     */
    const pathChildren = (oldVnode:  any,newVnode: any,el:any) => {
        if(Array.isArray( newVnode.children)){
            for(let i = 0; i < newVnode.children.length; i++) {
            normalLize(newVnode.children,i)// 先进行转化，如果是字符串 --> h('h2',{style:{color:'red'}},[h('span',null,'span的内容'),'文本类型'] 变成 --> h(Text,'文本类型')
            }
        }
        // 比较两个虚拟dom的内容
        const c1 = oldVnode && oldVnode.children
        const c2 = newVnode && newVnode.children 
        const prevShapeFlags = oldVnode.shapeFlags // 之前的类型
        const currShapeFlags = newVnode.shapeFlags // 新的类型
//  console.log(c1,c2)
        /**
         * // children可能是空的，可能是文本，也可能是一个数组
         * 空：h('div', { oid:'oldid'})
         * 文本：h('div', { oid:'oldid'},'文本内容')
         * 数组：h('div', { oid:'oldid'},[h('div',null,'哈哈哈'),'我是内容'])
         * 旧的children  新的children
         * 
         * 数组          文本     ---> 删除旧的children,设置文本内容
         * 文本          文本     ---> 更新文本即可
         * 空            文本     ---> 更新文本即可
         * 数组          数组     ---> diff算法 ---> 重点
         * 文本          数组     ---> 清空文本，进行挂载
         * 空            数组     ---> 进行挂载
         * 数组          空       ---> 删除所有children
         * 文本          空       ---> 清空文本
         * 空            空       ---> 无需处理  
         */
        // 现在是文本
        if(currShapeFlags & ShapeFlags.TEXT_CHILDREN){
            // console.log(oldVnode,newVnode)
            // 1.数组          文本     ---> 删除旧的children,设置文本内容
            if(prevShapeFlags & ShapeFlags.ARRAY_CHILDREN){ // 数组  文本
                // 删除所有旧的子节点
                unmountChildren(c1)
            }
            // 2.文本    文本     ---> 更新文本即可 + 3.空       文本     ---> 更新文本即可
            if(c1 !== c2){
                hostSetElementText(el,c2)
            }
        }else{
            // 之前是数组
            if(prevShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                // 4.数组          数组     ---> 之前是数组，现在也是数组  diff算法 ---> 重点 
                if(currShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                // diff算法
                patchKeyedChildren(c1,c2,el)
                // 5.文本/空          数组     ---> 之前是数组，现在不是数组 文本/空 ，删除以前的
                }else{
                    unmountChildren(c1)
                    hostSetElementText(el,c2)
                }
            }else{
                if(prevShapeFlags & ShapeFlags.TEXT_CHILDREN){
                    hostSetElementText(el,'')
                }
                if(currShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                    mountChildren(c2,el)
                }
            }
        }
    }
    const patchBlockChildren = (oldVnode:  any,newVnode: any) => {
        // debugger
        for(let i = 0 ; i < newVnode.dynamicChildren.length; i++){
            patchElement(oldVnode.dynamicChildren[i],newVnode.dynamicChildren[i])
        }
    }
    // 比较虚拟dom
    const patchElement = (oldVnode: any, newVnode: any) => {
        let el = newVnode.el = oldVnode.el
        let oldProps = oldVnode.props || {}
        let newProps = newVnode.props || {}
        
        let { patchFlag }  = newVnode

        if(patchFlag & PatchFlags.CLASS){
            if(oldVnode.class !== newVnode.class){
                hostPatchProp(el,'class',null,newVnode.class)
            }
        }else{
            // 比较完属性比儿子元素
            patchProps(oldProps,newProps,el)
        }


        if(newVnode.dynamicChildren > 0){// 数组的比较
            patchBlockChildren(oldVnode,newVnode)
        }else{// 树的递归比较
            pathChildren(oldVnode,newVnode,el)
        }
    }
    const processText = (oldVnode: any, newVnode: any,container: any) => {
        if(oldVnode == null){ //初次渲染
            // 创建一个文本节点将其插入进目标节点
            hostInsert((newVnode.el =  hostCreateText(newVnode.children)),container)
        }else{// 更新，复用，文本内容变化了，复用老的节点
            const el = newVnode.el = oldVnode.el
            if(oldVnode.children !== newVnode.children){
                hostSetText(el,newVnode.children)// 文本的更新
            }
        }
    }
    const processFragment = (oldVnode: any, newVnode: any,container: any,anchor: any = null)=> {
        // debugger
        if(oldVnode == null){
            mountChildren(newVnode.children,container)
        }else{
            pathChildren(oldVnode,newVnode,container)// 走的 diff算法
        }

    }
    // type相同才会走到这一步，也就是相同的标签或者组件才进行对比
    const processElement = (oldVnode: any, newVnode: any, container: any,anchor: any = null) => {
        if(oldVnode == null){ //初次挂载
            mountElement(newVnode,container,anchor)
        }else{ //更新
            //1.新老节点完全没关系，删掉旧的，添加新的
            //2.老的和新的一样，复用，属性可能不一样，再对比属性，更新属性
            //3.对比儿子节点
            patchElement(oldVnode,newVnode)
        }
    }
    // 
    const updateComponentPreRender = (instance: any,next: any) => {
        instance.next = null //next清空
        instance.vnode = next // 实例上最新的虚拟节点
        // next是新的虚拟节点 instance.next = newVnode //将新的虚拟节点放到 next属性上面
        // 新的props去替换老的
        updateProps(instance.props,next.props);

    }
    const invokerLifeCycleHooks = (hooks: any) => {
        for(let i = 0; i < hooks.length; i++){
            hooks[i]()
        }
    }
    // 这个函数的主要作用就是，初次挂载的时候，收集依赖
    const setupRenderEffect = (instance: any,container: any,anchor: any)=> {
        const { render } = instance
        // 这里就挂载的时候执行一次
        // console.log("setupRenderEffect就挂载(mounted)的时候执行一次")
        // console.log("componentUpdateFn函数才是更新的重点")

        // 下面这个更新函数是重点，挂载和更新都会走到这里来，只是挂载的时候会先收集依赖，
        // 调用reander函数的时候，之前reactive的代理对象就会开始收集render函数里面用到的
        // 属性 和 当前render函数之前的依赖关系，下面做了一个优化，当所有的同步任务，也就是组件状态（data,props...）
        // 都更新玩再调用 一次 componentUpdateFn 触发更新
        const componentUpdateFn = ()=> {
            if(!instance.isMounted) { // 初始化
                const { bm ,m } = instance
                // console.log(" // 初始化")
                //调用render函数干的两件事  1.得到虚拟dom 2.收集依赖
                
                const subTree = render.call(instance.proxy,instance.proxy) 
                // debugger
                if(bm){
                    invokerLifeCycleHooks(bm)
                }
                patch(null,subTree,container,anchor);
                // <--这里不确定是不是这样子写 -->
                // 设置 this.$el
                /**
                * 为保持一致性，我们推荐使用模板 ref 来直接访问元素而不是依赖 $el --> <input ref="input"> 
                * $el 直到组件挂载完成 (mounted) 之前都会是 undefined。
                * 对于单一根元素的组件，$el 将会指向该根元素。
                * 对于以文本节点为根的组件，$el 将会指向该文本节点。
                * 对于以多个元素为根的组件，$el 将是一个仅作占位符的 DOM 节点，Vue 使用它来跟踪组件在 DOM 中的位置 (文本节点或 SSR 激活模式下的注释节点)。
                */
                instance.vnode.el = container
                // <--这里不确定是不是这样子写 -- >
                if(m){
                    invokerLifeCycleHooks(m)
                }
                // 初次挂载完成，把当前虚拟节点保存在subTree以作为下一次更新 patch 的老节点
                instance.subTree = subTree;

                instance.isMounted = true;
            }else{
                const { next , bu ,u } = instance
                if(next){
                    // 更新前需要拿到最新的属性进行更新（组件更新前，需要做的事情）
                    // 这里还没进行更新，所以这里的 instance 是没更新前的节点，也就是旧虚拟节点，next是新的虚拟节点
                    updateComponentPreRender(instance,next)
                }
                // console.log(" // 组件内部更新")
                const subTree = render.call(instance.proxy,instance.proxy) //sunTree 是 render 函数里面的 h 函数调用的结果，是一个虚拟dom
                if(bu){
                    invokerLifeCycleHooks(bu)
                }
                patch(instance.subTree,subTree,container,anchor) //
                if(u){
                    invokerLifeCycleHooks(u)
                }
                instance.subTree = subTree
            }
        }
        // scheduler --> 调度器 --> 由用户自己决定如何更新
        // export function effect(fn: () => any,options:any={}){
        //     // fn可以根据状态变化自动重新执行，effect可以嵌套
        //     const _effect = new ReactiveEffect(fn,options.scheduler)
        //     _effect.run();//默认先执行一次

        //     const runner:any = _effect.run.bind(_effect) 
        //     runner.effect = _effect
        //     return runner;
        // }
        // 组件的异步更新
        // activeEffect --> ReactiveEffect 的实例对象 --> 下面的effect ---> 行为
        // Set集合，比如 name:[effect1,effect2]    effect.deps.push([effect1,effect2])
        // export function trackEffects(dep:Set<ReactiveEffect>){
        //     if(activeEffect){
        //         let shouldTrack = !dep.has(activeEffect)
        //         if(shouldTrack){
        //             dep.add(activeEffect)
        //             activeEffect.deps.push(dep)
        //         }
        //     }
        // }
        // 这里，就是页面初次挂载的时候会运行到，后面的更新操作都不会走到这里，调用的是上面的更新函数   componentUpdateFn
        const effect = new ReactiveEffect(componentUpdateFn,()=>{
            queueJob(instance.update)
        })
        let update =  instance.update =  effect.run.bind(effect)//调用 effect.run() 可以让组件强制重新渲染
        // 页面初始化的时候会执行一次，effect.run.bind(effect) 就是上面传进去的更新函数 componentUpdateFn 
        update()
    }
    const processComponent = (oldVnode: any, newVnode: any, container: any,anchor: any)=> {
        // console.log(oldVnode,newVnode)
        if(oldVnode == null){
            mountComponent(newVnode,container,anchor)
        }else{
            // 组件更新靠的是 props 的变化
            updateComponent(oldVnode,newVnode)
        }
    }
    const normalLize = (children: any,index: number) => {
        if(isString(children[index]) || isNumber(children[index])) {
            const TEXT_VNODE = createVnode(Text,null,children[index])
                children[index] = TEXT_VNODE
            return TEXT_VNODE
        }
        return children[index]
    }
    const unmount = (vnode:  any) => {
        hostRemove(vnode.el)
    }
    const unmountChildren = (children: any) => {
        for(let i = 0; i < children.length ;i++){
            unmount(children[i])
        }
    }
    const mountChildren = (children: string | any[],container: any) => {
        for(let i = 0; i < children.length; i++) {
            let child =  normalLize(children,i)// 先进行转化，如果是字符串 --> h('h2',{style:{color:'red'}},[h('span',null,'span的内容'),'文本类型'] 变成 --> h(Text,'文本类型')
            patch(null,child,container)
        }
    }
    const mountElement = (vnode: any,container: any,anchor: any) => {
        let { type,props,children,shapeFlags } = vnode;
        let el = vnode.el = hostCreateElement(type) // 将真实元素挂载到虚拟节点上,方便后续复用和更新
        if(props){
            for(let key in props){
                hostPatchProp(el,key,null,props[key])
            }
        }
        // 处理子节点和文本内容
        if(shapeFlags & ShapeFlags.TEXT_CHILDREN){ //子元素是本文，直接添加内容
            hostSetElementText(el,children)
        }else if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){ // 子元素是数组，递归处理，循环创建
            mountChildren(children,el)
        }   
        hostInsert(el,container,anchor)
    }
    const mountComponent = (vnode: any,container: any,anchor: any)=> {
        // 1.创造一个组件实例
        // data和props都是响应式的，都会收集依赖
        // instance.data = reactive(data.call(instance.proxy))
        // instance.props = reactive(props)

        // 这一步主要是创造instance ,取出 vnode.type.props 并且赋值给instance
        let instance = vnode.component =  createComponenntInstance(vnode)
        // 2.给实例赋值
        setupComponent(instance) // --> 这一步把 data 和 props 变为响应式 ,setup内的变量是用户调用rective和ref变成响应式的
        // 3.创建一个effect
        setupRenderEffect(instance,container,anchor) // 这一步开始 属性 和  effect 的依赖关系   
    }   // 也就是 data 和 props 里面的属性 和更新函数   componentUpdateFn 的依赖关系 
    const shouldUpdateComponent = (oldVnode: any,newVnode: any) => {
        const { props:oldProps } = oldVnode
        const { props:newProps } = newVnode

        if(oldProps === newProps){ // 新老属性一致就不用更新
            return false
        }
        return hasPropsChanged(oldProps, newProps)


    }
    
    const updateComponent = (oldVnode: any,newVnode: any) => {
        // instance的属性可以更改，
        const instance = (newVnode.component = oldVnode.component)//对于元素而言复用的是真实节点，对于组件来说，复用的是实例对象
        // 而 component 保存的就是当前虚拟dom对应的组件实例对象
        
        // 拿出各自虚拟dom中的属性进行比对，就像这里的 address,注意，这里是虚拟dom的，不是组件实例的
        // h(MyComp,{address:this.flag ? '地球' : '月球'})
  
        // 需要更新就强制调用组件的 update 方法
        if(shouldUpdateComponent(oldVnode,newVnode)){
            instance.next = newVnode //将新的虚拟节点放到 next属性上面
            // 统一调用update更新
            instance.update()
        }
    }
    const patch = (oldVnode: any,newVnode: any,container: any,anchor: any = null) => { // 核心的patch方法
        // debugger
        // 获取当前组件挂载的父节点
    

        if(oldVnode === newVnode) return;//若新老虚拟dom相同，直接返回
        if(oldVnode && !isSameVnode(oldVnode,newVnode)){// 判断两个虚拟节点是否相同 1)处理type不同
            unmount(oldVnode)// 删除旧节点
            oldVnode = null; // 把旧节点置为null就会自动走到创建新节点那一个循环去
        }
        const { type, shapeFlags}  = newVnode

        switch(type){
            case Text:
                processText(oldVnode,newVnode,container) // 2)处理的type都是 Text类型
                break;
            case Fragment:
                processFragment(oldVnode,newVnode,container,anchor) // 3) Fragment 类型
                break
            default: 
                if(shapeFlags & ShapeFlags.ELEMENT){ // 4)处理都是普通dom元素
                    processElement(oldVnode,newVnode,container,anchor)
                }
                if(shapeFlags & ShapeFlags.COMPONENT){ // 5) 渲染自定义组件
                    processComponent(oldVnode,newVnode,container,anchor)
                }
        }
        // newVnode.el = container
    }
    const render = (vnode: any,container: any) => {
        // console.log("🚀 ~ file: renderer.ts ~ line 8 ~ render ~ vnode,container", vnode,container)
        if(vnode == null){// 如果当前vnode为空 --> render(null)，说明是一个卸载逻辑
            if(container._vnode){
                unmount(container._vnode)
            }
        }else{// 初始化渲染 + 更新逻辑
            // container._vnode存放的是旧的虚拟dom,如果为空，表示是第一次渲染
            patch(container._vnode || null,vnode,container)
            
        }
        container._vnode = vnode 
    }
    return {
        render
    }
}
