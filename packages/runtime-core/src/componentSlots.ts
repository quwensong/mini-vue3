import { ShapeFlags } from '@vue/shared';
import { Iinstance } from "./component";



export function initSlots(instance: Iinstance,children: any){
    if(instance.vnode.shapeFlags & ShapeFlags.SLOTS_CHILDREN){
        instance.slots = children
    }
}