export { ShapeFlags } from './ShapeFlags'
export { PatchFlags } from './patchFlags'

export function isObject(value:any):boolean{
    return typeof value === 'object' && value !== null;
}

export function isFunction(value:any):boolean {
    return typeof value === 'function' 
}

export function isArray(value:any):boolean {
    return Array.isArray(value)
}

export function isString(value:any):boolean {
    return typeof value === 'string'
}

export function isNumber(value:any):boolean {
    return typeof value === 'number'
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (object: any,key: any)=>{
    return hasOwnProperty.call(object,key)
}
