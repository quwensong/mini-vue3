import { isArray, isObject } from '@vue/shared';
import { createVnode, isVnode } from "./vnode";
/**
// 注意 type 有可能是 string 也有可能是对象
// 如果是对象的话，那么就是用户设置的 options
// type 为 string 的isVnode时候
// createVnode("div")
// type 为组件对象的时候
// createVnode(App)
 */
export function h(type:any, propsChildren?:any,children?: string | Array<any>){
    // debugger
    const LEN = arguments.length; 
    if(LEN === 2){ // h('div', { id: 'foo' })  + h('div', ['hello', h('span', 'hello')])
        if (isObject(propsChildren) && !isArray(propsChildren)) {
            // single vnode without props
            if (isVnode(propsChildren)) {
              return createVnode(type, null, [propsChildren])
            }
            // props without children
            return createVnode(type, propsChildren)
        } else {
          // h(Fragment,[h('h2',null,'66666'),h('h1',null,'77777777')] --> 这样子的话会自动把props赋值为 null
          // omit props
          return createVnode(type, null, propsChildren)
        }
    }else{
        if(LEN > 3){
            children = Array.prototype.slice.call(arguments, 2)
        }else if(LEN === 3 && isVnode(children)){ //等于三个  h('div',{} , h('span', 'hello'))
            children = [children]
        }
        return createVnode(type, propsChildren, children)
    }
}


/**
 * 
除了 type 外，其他参数都是可选的
h('div')
h('div', { id: 'foo' })

// attribute 和 property 都可以用于 prop
// Vue 会自动选择正确的方式来分配它
h('div', { class: 'bar', innerHTML: 'hello' })

// class 与 style 可以像在模板中一样
// 用数组或对象的形式书写
h('div', { class: [foo, { bar }], style: { color: 'red' } })

// 事件监听器应以 onXxx 的形式书写
h('div', { onClick: () => {} })

// children 可以是一个字符串
h('div', { id: 'foo' }, 'hello')

// 没有 prop 时可以省略不写
h('div', 'hello')
h('div', [h('span', 'hello')])

// children 数组可以同时包含 vnode 和字符串
h('div', ['hello', h('span', 'hello')])
 */
