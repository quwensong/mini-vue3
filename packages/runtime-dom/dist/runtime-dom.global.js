"use strict";
var VueRuntimeDom = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    LifeCYcleHooks: () => LifeCYcleHooks,
    ReactiveEffect: () => ReactiveEffect,
    Text: () => Text,
    activeEffect: () => activeEffect,
    computed: () => computed,
    createElementBlock: () => createElementBlock,
    createElementVnode: () => createVnode,
    createRenderer: () => createRenderer,
    createVnode: () => createVnode,
    effect: () => effect,
    getCurrentInstance: () => getCurrentInstance,
    getSequence: () => getSequence,
    h: () => h,
    isSameVnode: () => isSameVnode,
    isVnode: () => isVnode,
    onBeforeMount: () => onBeforeMount,
    onBeforeUpdate: () => onBeforeUpdate,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    openBlock: () => openBlock,
    reactive: () => reactive,
    ref: () => ref,
    render: () => render,
    renderOptions: () => renderOptions,
    toDisplayString: () => toDisplayString,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffect: () => triggerEffect,
    watch: () => watch
  });

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    insert(child, parent, anchor = null) {
      parent.insertBefore(child, anchor);
    },
    remove(child) {
      const parentNode = child.parentNode;
      if (parentNode) {
        parentNode.removeChild(child);
      }
    },
    setElementText(el, text) {
      el.textContent = text;
    },
    setText(node, text) {
      node.nodeValue = text;
    },
    querySelector(selector) {
      return document.querySelector(selector);
    },
    parentNode(node) {
      return node.parentNode;
    },
    nextSibling(node) {
      return node.nextSibling;
    },
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createText(text) {
      return document.createTextNode(text);
    }
  };

  // packages/runtime-dom/src/modules/class.ts
  function patchClass(el, nextValue) {
    if (nextValue == null) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  }

  // packages/runtime-dom/src/modules/event.ts
  function createInvokers(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
  }
  function patchEvent(el, eventName, nextValue) {
    let invokers = el._vui || (el._vui = {});
    let exits = invokers[eventName];
    if (exits && nextValue) {
      exits.value = nextValue;
    } else {
      let event = eventName.slice(2).toLowerCase();
      if (nextValue) {
        const invoker = invokers[eventName] = createInvokers(nextValue);
        el.addEventListener(event, invoker);
      } else if (exits) {
        el.removeEventListener(event, exits);
        invokers[eventName] = void 0;
      }
    }
  }

  // packages/runtime-dom/src/modules/style.ts
  function patchStyle(el, preValue, nextValue) {
    for (let key in nextValue) {
      el.style[key] = nextValue[key];
    }
    if (preValue) {
      for (let key in preValue) {
        if (nextValue[key] == null) {
          el.style[key] = null;
        }
      }
    }
  }

  // packages/runtime-dom/src/modules/attr.ts
  function patchAttr(el, key, nextValue) {
    if (nextValue) {
      el.setAttribute(key, nextValue);
    } else {
      el.removeAttribute(key);
    }
  }

  // packages/runtime-dom/src/patchProp.ts
  function patchProp(el, key, preValue, nextValue) {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, preValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
      patchEvent(el, key, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  }

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function clearupEffect(effect2) {
    const { deps } = effect2;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    effect2.deps.length = 0;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      this.deps = [];
      this.parent = null;
    }
    run() {
      if (!this.active) {
        return this.fn();
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        clearupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        clearupEffect(this);
      }
    }
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffects(dep);
  }
  function trackEffects(dep) {
    if (activeEffect) {
      let shouldTrack = !dep.has(activeEffect);
      if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
      }
    }
  }
  function trigger(target, type, key, value, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    let effects = depsMap.get(key);
    if (effects) {
      triggerEffect(effects);
    }
  }
  function triggerEffect(effects) {
    effects = new Set(effects);
    effects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }

  // packages/shared/src/index.ts
  function isObject(value) {
    return typeof value === "object" && value !== null;
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isString(value) {
    return typeof value === "string";
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (object, key) => {
    return hasOwnProperty.call(object, key);
  };

  // packages/reactivity/src/baseHandlers.ts
  var baseHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_RECEIVE */) {
        return true;
      }
      track(target, "get", key);
      let result = Reflect.get(target, key, receiver);
      if (isObject(result)) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, "set", key, value, oldValue);
      }
      return result;
    }
  };

  // packages/reactivity/src/reactive.ts
  function isReactive(value) {
    return !!(value && value["__v_isReactive" /* IS_RECEIVE */]);
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    if (isReactive(target)) {
      return target;
    }
    let exisitTarget = reactiveMap.get(target);
    if (exisitTarget) {
      return exisitTarget;
    }
    const proxy = new Proxy(target, baseHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/computed.ts
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.getter = getter;
      this.setter = setter;
      this._dirty = true;
      this.__v_isReadonly = true;
      this.__v_isRef = true;
      this._value = 999;
      this.effect = new ReactiveEffect(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffect(this.dep);
        }
      });
    }
    get value() {
      var _a;
      trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
      if (this._dirty) {
        this._dirty = false;
        this._value = (_a = this.effect) == null ? void 0 : _a.run();
      }
      return this._value;
    }
    set value(newVal) {
      this.setter(newVal);
    }
  };
  var computed = (getterOrOptions) => {
    let onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
      getter = getterOrOptions;
      setter = () => {
        console.warn("no set");
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
  };

  // packages/reactivity/src/ref.ts
  function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
  }
  var RefImpl = class {
    constructor(rawValue) {
      this.rawValue = rawValue;
      this.dep = /* @__PURE__ */ new Set();
      this.__v_isRef = true;
      this._value = toReactive(rawValue);
    }
    get value() {
      trackEffects(this.dep);
      return this._value;
    }
    set value(newValue) {
      if (newValue !== this.rawValue) {
        this._value = toReactive(newValue);
        this.rawValue = newValue;
        triggerEffect(this.dep);
      }
    }
  };
  function ref(value) {
    return new RefImpl(value);
  }
  function proxyRefs(object) {
    return new Proxy(object, {
      get(target, key, recevier) {
        let result = Reflect.get(target, key, recevier);
        return result.__v_isRef ? result.value : result;
      },
      set(target, key, value, recevier) {
        const oldValue = target[key];
        if (oldValue.__v_isRef) {
          oldValue.value = value;
          return true;
        } else {
          return Reflect.set(target, key, value, recevier);
        }
      }
    });
  }

  // packages/reactivity/src/watch.ts
  function traversal(value, set = /* @__PURE__ */ new Set()) {
    if (!isObject(value)) {
      return value;
    }
    if (set.has(value)) {
      return value;
    }
    set.add(value);
    for (let key in value) {
      traversal(value[key], set);
    }
    return value;
  }
  function watch(source, cb) {
    let getter;
    if (isReactive(source)) {
      getter = () => traversal(source);
    } else if (isFunction(source)) {
      getter = source;
    } else {
      return;
    }
    let clear;
    const onClearup = (fn) => {
      clear = fn;
    };
    let oldValue;
    const job = () => {
      if (clear) {
        clear();
      }
      const newValue = effect2.run();
      cb(newValue, oldValue, onClearup);
      oldValue = newValue;
    };
    const effect2 = new ReactiveEffect(getter, job);
    oldValue = effect2.run();
    return effect2.run();
  }

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr) {
    const len = arr.length;
    const result = [0];
    const p = new Array(len).fill(0);
    let start;
    let end;
    let middle;
    let resultLastIndex;
    for (let i2 = 0; i2 < len; i2++) {
      let arrI = arr[i2];
      if (arrI !== 0) {
        resultLastIndex = result[result.length - 1];
        if (arr[resultLastIndex] < arrI) {
          result.push(i2);
          p[i2] = resultLastIndex;
          continue;
        }
        start = 0;
        end = result.length - 1;
        while (start < end) {
          middle = (start + end) / 2 | 0;
          if (arr[result[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arr[result[end]] > arrI) {
          result[end] = i2;
          p[i2] = result[end - 1];
        }
      }
    }
    let i = result.length;
    let last = result[i - 1];
    while (i-- > 0) {
      result[i] = last;
      last = p[last];
    }
    return result;
  }

  // packages/runtime-core/src/scheduler.ts
  var queue = [];
  var isFlushing = false;
  var resolvePromise = Promise.resolve();
  function queueJob(job) {
    if (!queue.includes(job)) {
      queue.push(job);
    }
    if (!isFlushing) {
      isFlushing = true;
      resolvePromise.then(() => {
        isFlushing = false;
        let copyqueue = queue.slice(0);
        queue.length = 0;
        for (let i = 0; i < copyqueue.length; i++) {
          let job2 = copyqueue[i];
          job2();
        }
        copyqueue.length = 0;
      });
    }
  }

  // packages/runtime-core/src/vnode.ts
  function isVnode(vnode) {
    return !!(vnode == null ? void 0 : vnode.__v_isVnode);
  }
  function isSameVnode(oldVnode, newVnode) {
    return !!(oldVnode.type === newVnode.type && oldVnode.key === newVnode.key);
  }
  var Text = Symbol("Text");
  var Fragment = Symbol("Fragment");
  function createVnode(type, props, children, patchFlag) {
    let shapeFlags = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
    let vnode = {
      el: null,
      type,
      props,
      children,
      key: props == null ? void 0 : props["key"],
      __v_isVnode: true,
      component: null,
      shapeFlags,
      patchFlag
    };
    if (children) {
      let type2 = 0;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else if (isObject(children)) {
        type2 = 32 /* SLOTS_CHILDREN */;
      } else {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREN */;
      }
      vnode.shapeFlags |= type2;
    }
    if (currentBlock && vnode.patchFlag) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  var currentBlock = null;
  function openBlock() {
    currentBlock = [];
  }
  function createElementBlock(type, props, children, patchFlag) {
    return setupBlock(createVnode(type, props, children, patchFlag));
  }
  function setupBlock(vnode) {
    vnode.dynamicChildren = currentBlock;
    currentBlock = null;
    return vnode;
  }
  function toDisplayString(value) {
    return isString(value) ? value : value === null ? "" : isObject(value) ? JSON.stringify(value) : String(value);
  }

  // packages/runtime-core/src/componentProps.ts
  function initProps(instance, rawProps) {
    const props = {};
    const attrs = {};
    const options = instance.propsOptions || {};
    if (rawProps) {
      for (let key in rawProps) {
        const value = rawProps[key];
        if (hasOwn(options, key)) {
          props[key] = value;
        } else {
          attrs[key] = value;
        }
      }
    }
    instance.props = reactive(props);
    instance.attrs = attrs;
  }
  function hasPropsChanged(oldProps = {}, newProps = {}) {
    const nextKeys = Object.keys(newProps);
    if (nextKeys.length !== Object.keys(oldProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (newProps[key] !== oldProps[key]) {
        return true;
      }
    }
    return false;
  }
  function updateProps(oldProps, newProps) {
    for (const key in newProps) {
      oldProps[key] = newProps[key];
    }
    for (const key in oldProps) {
      if (!hasOwn(newProps, key)) {
        delete oldProps[key];
      }
    }
  }

  // packages/runtime-core/src/componentSlots.ts
  function initSlots(instance, children) {
    if (instance.vnode.shapeFlags & 32 /* SLOTS_CHILDREN */) {
      instance.slots = children;
    }
  }

  // packages/runtime-core/src/component.ts
  var currentInstance = null;
  var setCurrentInstance = (instance) => {
    currentInstance = instance;
  };
  var getCurrentInstance = () => {
    return currentInstance;
  };
  var publicPropertyMap = {
    $el: (i) => i.vnode.el,
    $emit: (i) => i.emit,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs
  };
  function createComponenntInstance(vnode) {
    const instance = {
      data: null,
      setup: null,
      setupState: null,
      vnode,
      isMounted: false,
      subTree: null,
      update: null,
      props: {},
      attrs: {},
      render: null,
      propsOptions: vnode.type.props,
      proxy: Proxy
    };
    return instance;
  }
  var publicInstanceProxy = {
    get(target, key) {
      if (key[0] !== "$") {
        const { data, props, setupState } = target;
        if (hasOwn(setupState, key)) {
          return setupState[key];
        } else if (data && hasOwn(data, key)) {
          return data[key];
        } else if (props && hasOwn(props, key)) {
          return props[key];
        }
      }
      const getter = publicPropertyMap[key];
      if (getter) {
        return getter(target);
      }
    },
    set(target, key, value) {
      const { data, props, setupState } = target;
      if (hasOwn(setupState, key)) {
        setupState[key] = value;
        return true;
      } else if (data && hasOwn(data, key)) {
        data[key] = value;
        return true;
      } else if (props && hasOwn(props, key)) {
        console.warn("\u4E0D\u80FD\u4FEE\u6539props!!! key ---->  " + key);
        return false;
      }
      return true;
    }
  };
  function setupComponent(instance) {
    let { props, type, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    instance.proxy = new Proxy(instance, publicInstanceProxy);
    const data = type.data;
    if (data) {
      if (!isFunction(data))
        return console.warn("data option must be a function");
      instance.data = reactive(data.call(instance.proxy));
    }
    const setup = type.setup;
    if (setup) {
      const setupContext = {
        emit: (event, ...args) => {
          const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
          const hander = instance.vnode.props[eventName];
          hander && hander(...args);
        }
      };
      setCurrentInstance(instance);
      const setupResult = setup(instance.props, setupContext);
      setCurrentInstance(null);
      if (isFunction(setupResult)) {
        instance.render = setupResult;
      } else if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
      }
    }
    if (!instance.render) {
      instance.render = type.render;
    }
  }

  // packages/runtime-core/src/renderer.ts
  function createRenderer(renderOptions2) {
    const {
      insert: hostInsert,
      remove: hostRemove,
      setElementText: hostSetElementText,
      setText: hostSetText,
      querySelector: hostQuerySelector,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      createElement: hostCreateElement,
      createText: hostCreateText,
      patchProp: hostPatchProp
    } = renderOptions2;
    const patchProps = (oldProps, newProps, el) => {
      for (let key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
      for (let key in oldProps) {
        if (newProps[key] == null) {
          hostPatchProp(el, key, oldProps[key], void 0);
        }
      }
    };
    const patchKeyedChildren = (c1, c2, el) => {
      var _a;
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (i <= e1 && i <= e2) {
        const vnode1 = c1[i];
        const vnode2 = c2[i];
        if (isSameVnode(vnode1, vnode2)) {
          patch(vnode1, vnode2, el);
        } else {
          break;
        }
        i += 1;
      }
      while (i <= e1 && i <= e2) {
        const vnode1 = c1[e1];
        const vnode2 = c2[e2];
        if (isSameVnode(vnode1, vnode2)) {
          patch(vnode1, vnode2, el);
        } else {
          break;
        }
        e1 -= 1;
        e2 -= 1;
      }
      if (i > e1) {
        if (i <= e2) {
          while (i <= e2) {
            const nextPosition = e2 + 1;
            const anchor = nextPosition < c2.length ? c2[nextPosition].el : null;
            patch(null, c2[i], el, anchor);
            i++;
          }
        }
      } else if (i > e2) {
        if (i <= e1) {
          while (i <= e1) {
            unmount(c1[i]);
            i += 1;
          }
        }
      }
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 <= e2; i2++) {
        keyToNewIndexMap.set((_a = c2[i2]) == null ? void 0 : _a.key, i2);
      }
      const toBePatch = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePatch).fill(0);
      for (let i2 = s1; i2 <= e1; i2++) {
        const oldChildVnode = c1[i2];
        let newIndex = keyToNewIndexMap.get(oldChildVnode == null ? void 0 : oldChildVnode.key);
        if (newIndex == void 0) {
          unmount(oldChildVnode);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
          patch(oldChildVnode, c2[newIndex], el);
        }
      }
      let incrementArr = getSequence(newIndexToOldIndexMap);
      let incrementArrEndIndex = incrementArr.length - 1;
      for (let i2 = toBePatch - 1; i2 >= 0; i2--) {
        let curIndex = i2 + s2;
        let current = c2[curIndex];
        const anchor = curIndex + 1 < c2.length ? c2[curIndex + 1].el : null;
        if (newIndexToOldIndexMap[i2] === 0) {
          patch(null, current, el, anchor);
        } else {
          if (i2 != incrementArr[incrementArrEndIndex]) {
            hostInsert(current.el, el, anchor);
          } else {
            incrementArrEndIndex -= 1;
          }
        }
      }
    };
    const pathChildren = (oldVnode, newVnode, el) => {
      if (Array.isArray(newVnode.children)) {
        for (let i = 0; i < newVnode.children.length; i++) {
          normalLize(newVnode.children, i);
        }
      }
      const c1 = oldVnode && oldVnode.children;
      const c2 = newVnode && newVnode.children;
      const prevShapeFlags = oldVnode.shapeFlags;
      const currShapeFlags = newVnode.shapeFlags;
      if (currShapeFlags & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlags & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlags & 16 /* ARRAY_CHILDREN */) {
          if (currShapeFlags & 16 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
            hostSetElementText(el, c2);
          }
        } else {
          if (prevShapeFlags & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (currShapeFlags & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    };
    const patchBlockChildren = (oldVnode, newVnode) => {
      for (let i = 0; i < newVnode.dynamicChildren.length; i++) {
        patchElement(oldVnode.dynamicChildren[i], newVnode.dynamicChildren[i]);
      }
    };
    const patchElement = (oldVnode, newVnode) => {
      let el = newVnode.el = oldVnode.el;
      let oldProps = oldVnode.props || {};
      let newProps = newVnode.props || {};
      let { patchFlag } = newVnode;
      if (patchFlag & 2 /* CLASS */) {
        if (oldVnode.class !== newVnode.class) {
          hostPatchProp(el, "class", null, newVnode.class);
        }
      } else {
        patchProps(oldProps, newProps, el);
      }
      if (newVnode.dynamicChildren > 0) {
        patchBlockChildren(oldVnode, newVnode);
      } else {
        pathChildren(oldVnode, newVnode, el);
      }
    };
    const processText = (oldVnode, newVnode, container) => {
      if (oldVnode == null) {
        hostInsert(newVnode.el = hostCreateText(newVnode.children), container);
      } else {
        const el = newVnode.el = oldVnode.el;
        if (oldVnode.children !== newVnode.children) {
          hostSetText(el, newVnode.children);
        }
      }
    };
    const processFragment = (oldVnode, newVnode, container, anchor = null) => {
      if (oldVnode == null) {
        mountChildren(newVnode.children, container);
      } else {
        pathChildren(oldVnode, newVnode, container);
      }
    };
    const processElement = (oldVnode, newVnode, container, anchor = null) => {
      if (oldVnode == null) {
        mountElement(newVnode, container, anchor);
      } else {
        patchElement(oldVnode, newVnode);
      }
    };
    const updateComponentPreRender = (instance, next) => {
      instance.next = null;
      instance.vnode = next;
      updateProps(instance.props, next.props);
    };
    const invokerLifeCycleHooks = (hooks) => {
      for (let i = 0; i < hooks.length; i++) {
        hooks[i]();
      }
    };
    const setupRenderEffect = (instance, container, anchor) => {
      const { render: render3 } = instance;
      const componentUpdateFn = () => {
        if (!instance.isMounted) {
          const { bm, m } = instance;
          const subTree = render3.call(instance.proxy, instance.proxy);
          if (bm) {
            invokerLifeCycleHooks(bm);
          }
          patch(null, subTree, container, anchor);
          instance.vnode.el = container;
          if (m) {
            invokerLifeCycleHooks(m);
          }
          instance.subTree = subTree;
          instance.isMounted = true;
        } else {
          const { next, bu, u } = instance;
          if (next) {
            updateComponentPreRender(instance, next);
          }
          const subTree = render3.call(instance.proxy, instance.proxy);
          if (bu) {
            invokerLifeCycleHooks(bu);
          }
          patch(instance.subTree, subTree, container, anchor);
          if (u) {
            invokerLifeCycleHooks(u);
          }
          instance.subTree = subTree;
        }
      };
      const effect2 = new ReactiveEffect(componentUpdateFn, () => {
        queueJob(instance.update);
      });
      let update = instance.update = effect2.run.bind(effect2);
      update();
    };
    const processComponent = (oldVnode, newVnode, container, anchor) => {
      if (oldVnode == null) {
        mountComponent(newVnode, container, anchor);
      } else {
        updateComponent(oldVnode, newVnode);
      }
    };
    const normalLize = (children, index) => {
      if (isString(children[index]) || isNumber(children[index])) {
        const TEXT_VNODE = createVnode(Text, null, children[index]);
        children[index] = TEXT_VNODE;
        return TEXT_VNODE;
      }
      return children[index];
    };
    const unmount = (vnode) => {
      hostRemove(vnode.el);
    };
    const unmountChildren = (children) => {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i]);
      }
    };
    const mountChildren = (children, container) => {
      for (let i = 0; i < children.length; i++) {
        let child = normalLize(children, i);
        patch(null, child, container);
      }
    };
    const mountElement = (vnode, container, anchor) => {
      let { type, props, children, shapeFlags } = vnode;
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        for (let key in props) {
          hostPatchProp(el, key, null, props[key]);
        }
      }
      if (shapeFlags & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlags & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
      hostInsert(el, container, anchor);
    };
    const mountComponent = (vnode, container, anchor) => {
      let instance = vnode.component = createComponenntInstance(vnode);
      setupComponent(instance);
      setupRenderEffect(instance, container, anchor);
    };
    const shouldUpdateComponent = (oldVnode, newVnode) => {
      const { props: oldProps } = oldVnode;
      const { props: newProps } = newVnode;
      if (oldProps === newProps) {
        return false;
      }
      return hasPropsChanged(oldProps, newProps);
    };
    const updateComponent = (oldVnode, newVnode) => {
      const instance = newVnode.component = oldVnode.component;
      if (shouldUpdateComponent(oldVnode, newVnode)) {
        instance.next = newVnode;
        instance.update();
      }
    };
    const patch = (oldVnode, newVnode, container, anchor = null) => {
      if (oldVnode === newVnode)
        return;
      if (oldVnode && !isSameVnode(oldVnode, newVnode)) {
        unmount(oldVnode);
        oldVnode = null;
      }
      const { type, shapeFlags } = newVnode;
      switch (type) {
        case Text:
          processText(oldVnode, newVnode, container);
          break;
        case Fragment:
          processFragment(oldVnode, newVnode, container, anchor);
          break;
        default:
          if (shapeFlags & 1 /* ELEMENT */) {
            processElement(oldVnode, newVnode, container, anchor);
          }
          if (shapeFlags & 6 /* COMPONENT */) {
            processComponent(oldVnode, newVnode, container, anchor);
          }
      }
    };
    const render2 = (vnode, container) => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  }

  // packages/runtime-core/src/h.ts
  function h(type, propsChildren, children) {
    const LEN = arguments.length;
    if (LEN === 2) {
      if (isObject(propsChildren) && !isArray(propsChildren)) {
        if (isVnode(propsChildren)) {
          return createVnode(type, null, [propsChildren]);
        }
        return createVnode(type, propsChildren);
      } else {
        return createVnode(type, null, propsChildren);
      }
    } else {
      if (LEN > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (LEN === 3 && isVnode(children)) {
        children = [children];
      }
      return createVnode(type, propsChildren, children);
    }
  }

  // packages/runtime-core/src/apiLifeCycle.ts
  var LifeCYcleHooks = /* @__PURE__ */ ((LifeCYcleHooks2) => {
    LifeCYcleHooks2["BEFORE_MOUNT"] = "bm";
    LifeCYcleHooks2["MOUNTED"] = "m";
    LifeCYcleHooks2["BEFORE_UPDATE"] = "bu";
    LifeCYcleHooks2["UPDATED"] = "u";
    return LifeCYcleHooks2;
  })(LifeCYcleHooks || {});
  function createHooks(type) {
    return (hook, target = currentInstance) => {
      if (target) {
        const hooks = target[type] || (target[type] = []);
        const wrappedHook = () => {
          setCurrentInstance(target);
          hook();
          setCurrentInstance(null);
        };
        hooks.push(wrappedHook);
      }
    };
  }
  var onBeforeMount = createHooks("bm" /* BEFORE_MOUNT */);
  var onMounted = createHooks("m" /* MOUNTED */);
  var onBeforeUpdate = createHooks("bu" /* BEFORE_UPDATE */);
  var onUpdated = createHooks("u" /* UPDATED */);

  // packages/runtime-dom/src/index.ts
  var renderOptions = Object.assign(nodeOps, { patchProp });
  function render(vnode, container) {
    createRenderer(renderOptions).render(vnode, container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
