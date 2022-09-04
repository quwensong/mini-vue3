
export const enum PatchFlags {
  TEXT = 1,//动态文本节点
  CLASS = 1 << 1,//动态class
  STYLE = 1 << 2,//动态style
  PROPS = 1 << 3,//除了class、style的状态属性
  FULL_PROPS = 1 << 4,//有key,需要完整 diff
  HYDRATE_EVENTS = 1 << 5,// 挂载过事件的
  STABLE_FRAGMENT = 1 << 6,// 稳定序列，子节点序列不会变化
  KEYED_FRAGMENT = 1 << 7,// 子节点有 key 的fragment
  UNKEYED_FRAGMENT = 1 << 8,// 子节点没有 key 的fragment
  NEED_PATCH = 1 << 9,// 进行非props比较，ref比较
  DYNAMIC_SLOTS = 1 << 10,// 动态插槽
  DEV_ROOT_FRAGMENT = 1 << 11,
  HOISTED = -1,// 表示静态节点
  BAIL = -2//表示 diff 算法应该结束了
}

export const PatchFlagNames = {
  [PatchFlags.TEXT]: `TEXT`,
  [PatchFlags.CLASS]: `CLASS`,
  [PatchFlags.STYLE]: `STYLE`,
  [PatchFlags.PROPS]: `PROPS`,
  [PatchFlags.FULL_PROPS]: `FULL_PROPS`,
  [PatchFlags.HYDRATE_EVENTS]: `HYDRATE_EVENTS`,
  [PatchFlags.STABLE_FRAGMENT]: `STABLE_FRAGMENT`,
  [PatchFlags.KEYED_FRAGMENT]: `KEYED_FRAGMENT`,
  [PatchFlags.UNKEYED_FRAGMENT]: `UNKEYED_FRAGMENT`,
  [PatchFlags.NEED_PATCH]: `NEED_PATCH`,
  [PatchFlags.DYNAMIC_SLOTS]: `DYNAMIC_SLOTS`,
  [PatchFlags.DEV_ROOT_FRAGMENT]: `DEV_ROOT_FRAGMENT`,
  [PatchFlags.HOISTED]: `HOISTED`,
  [PatchFlags.BAIL]: `BAIL`
}
