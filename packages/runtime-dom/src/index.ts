import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { createRenderer } from "@vue/runtime-core";

export const renderOptions = Object.assign(nodeOps,{ patchProp })


export function render(vnode: any,container: any){
    createRenderer(renderOptions).render(vnode,container);
}

export * from '@vue/runtime-core'
