import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";
import { patchAttr } from "./modules/attr";
// dom属性的操作 api
// <div class="preValue"></div> --> <div class="nextValue"></div> 
// <div @click="clickTest"></div> -->  <div onclick="clickTest2"></div>
/**
 * 
 * @param el dom元素
 * @param key 标签属性名，如上面的，class,onclick.....
 * @param preValue 之前的值 如上面所示
 * @param nextValue 之后的值 如上面所示
 */

export function patchProp(el: any,key: string,preValue: any,nextValue: any){
    if(key === 'class'){ // 类名 el.className
        patchClass(el,nextValue)
    }else if(key === 'style'){ // 样式 el.style
        // el style -> {color: 'white',fontWeight: 'bold} -> {color: 'black'},比较前后两次的差异
        patchStyle(el,preValue,nextValue)
    }else if(/^on[^a-z]/.test(key)){  // events addevenListener
    
        patchEvent(el,key,nextValue)
    }else{ // 普通属性 el.setAttribute
        patchAttr(el,key,nextValue)
    }






   


    
}





// 虚拟dom
// 如何创建真实dom
// dom diff 最长递增子序列
// 组件的实现，模板渲染 ，核心的组件更新

// 模板编译原理 + 代码转化 + 代码生成（编译优化）
