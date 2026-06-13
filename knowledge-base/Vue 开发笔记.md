---
title: Vue 开发笔记：组件、路由、状态管理与最佳实践
tags: [Vue, Vue3, 前端, 组件, 路由, keep-alive]
created: 2026-06-13
sources: [Vue 相关 45 个会话 - 见末尾列表]
---

# Vue 开发笔记

> Vue 3 + Composition API 已成为主流。以下是在实际项目中积累的实用模式。

---

## 一、Vue 3 基础

### 1.1 Composition API 核心模式

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const double = computed(() => count.value * 2)

// 监听
watch(count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})

// 方法
function increment() {
  count.value++
}
</script>
```

### 1.2 `watch` vs `computed` 区别

| | computed | watch |
|--|---------|-------|
| 用途 | 派生新值 | 执行副作用 |
| 缓存 | 有缓存 | 无缓存 |
| 返回值 | 返回新值 | 不返回 |
| 适用 | 需要显示的数据转换 | 需要触发操作、API 调用 |

---

## 二、组件模式

### 2.1 组件通信

```vue
// 父 → 子：props
// 子 → 父：emit
// 任意组件：provide/inject
// 复杂状态：Pinia

// 父组件
<template>
  <Child :title="title" @update="handleUpdate" />
</template>

// 子组件
<script setup>
const props = defineProps({ title: String })
const emit = defineEmits(['update'])
</script>
```

### 2.2 组件的三种核心状态

每个组件都应考虑三种状态：

```vue
<script setup>
const { data, error, isLoading } = await useFetch('/api/data')

// loading 状态 → 骨架屏/加载指示器
// empty 状态 → "暂无数据"占位
// error 状态 → 错误提示 + 重试按钮
// success 状态 → 正常渲染
</script>

<template>
  <Loading v-if="isLoading" />
  <Empty v-else-if="!data?.length" />
  <Error v-else-if="error" @retry="fetchData" />
  <DataList v-else :items="data" />
</template>
```

### 2.3 封装通用表单组件

以 el-select 二次封装为例：

```vue
<script setup>
// 通用 Select 组件封装
const props = defineProps({
  options: Array,       // [{label, value}]
  modelValue: [String, Number],
  multiple: Boolean,
  clearable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])
const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
</script>

<template>
  <el-select v-model="value" :multiple="multiple" :clearable="clearable">
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>
```

### 2.4 封装埋点组件

```vue
<script setup>
import { onMounted } from 'vue'
import { useTracking } from '@/composables/useTracking'

const props = defineProps({
  pageName: String,
  moduleName: String
})

const { track } = useTracking()

onMounted(() => {
  track('page_view', { page: props.pageName, module: props.moduleName })
})
</script>

<template>
  <div :data-page="pageName">
    <slot />
  </div>
</template>
```

---

## 三、路由

### 3.1 路由守卫控制权限

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [ /* ... */ ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.role && !hasRole(to.meta.role)) {
    next('/403')
  } else {
    next()
  }
})
```

### 3.2 动态添加路由

```javascript
// 权限菜单过滤
function filterRoutesByPermission(routes, permissions) {
  return routes.filter(route => {
    if (route.meta?.permission) {
      return permissions.includes(route.meta.permission)
    }
    if (route.children) {
      route.children = filterRoutesByPermission(route.children, permissions)
      return route.children.length > 0
    }
    return true
  })
}

// 动态添加
router.addRoute(parentName, routeConfig)
```

### 3.3 路由配置转为绝对路径数组

```javascript
function flattenRoutes(routes, parentPath = '/') {
  return routes.reduce((paths, route) => {
    const fullPath = route.path.startsWith('/')
      ? route.path
      : `${parentPath}/${route.path}`.replace(/\/\//g, '/')
    paths.push(fullPath)
    if (route.children) {
      paths.push(...flattenRoutes(route.children, fullPath))
    }
    return paths
  }, [])
}
```

---

## 四、keep-alive 缓存策略

### 4.1 基本用法

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cacheList">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
const cacheList = ref(['Home', 'List', 'Detail'])
</script>
```

### 4.2 keep-alive `include` 为空数组

```javascript
// include = [] 时 → 所有组件都不缓存（等于没有 keep-alive）
// include = ['A', 'B'] → 只缓存 A 和 B
// 不设置 include → 缓存所有组件
```

### 4.3 动态控制缓存

```vue
<script setup>
const route = useRoute()
const cacheList = ref([])

// 只在需要缓存的页面才加入缓存
watch(() => route.name, (name) => {
  if (name === 'List' && !cacheList.value.includes('List')) {
    cacheList.value.push('List')
  }
})
</script>
```

### 4.4 Tab 页签缓存

```vue
<script setup>
// 关闭 tab 时移除缓存
function closeTab(tabName) {
  const idx = cacheList.value.indexOf(tabName)
  if (idx > -1) cacheList.value.splice(idx, 1)
}

// 切换 tab 时重新加入缓存
function switchTab(tabName) {
  if (!cacheList.value.includes(tabName)) {
    cacheList.value.push(tabName)
  }
}
</script>
```

---

## 五、Intersection Observer（滚动加载）

### 5.1 自定义 Hook

```javascript
// composables/useIntersectionObserver.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(options = {}) {
  const target = ref(null)
  const isIntersecting = ref(false)

  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      isIntersecting.value = entry.isIntersecting
    }, { threshold: 0.1, ...options })

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { target, isIntersecting }
}
```

### 5.2 滚动加载列表

```vue
<script setup>
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const { target, isIntersecting } = useIntersectionObserver()
const page = ref(1)
const list = ref([])

watch(isIntersecting, (visible) => {
  if (visible) {
    loadMore()
  }
})

async function loadMore() {
  const data = await fetchList({ page: page.value })
  list.value.push(...data)
  page.value++
}
</script>

<template>
  <div v-for="item in list" :key="item.id">{{ item.name }}</div>
  <div ref="target">加载中...</div>
</template>
```

---

## 六、Element Plus 常见问题

### 6.1 el-table 校验失败自动定位

```javascript
// 校验失败时滚动到第一个错误位置
function scrollToFirstError() {
  nextTick(() => {
    const firstError = document.querySelector('.el-form-item__error')
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
```

### 6.2 el-date-picker 禁用日期

```vue
<el-date-picker
  :disabled-date="disabledDate"
  v-model="date"
/>

<script setup>
function disabledDate(time) {
  // 禁用今天之前的日期
  return time.getTime() < Date.now() - 86400000
  // 禁用特定月份
  // return time.getMonth() === 5 // 6月
}
</script>
```

### 6.3 el-tooltip 限制挂载容器

```vue
<el-tooltip
  content="提示内容"
  :teleported="false"
  popper-class="custom-tooltip"
>
  <button>悬停</button>
</el-tooltip>
```

---

## 七、Vue 暗黑模式

```vue
<script setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? '🌙 暗黑' : '☀️ 明亮' }}
  </button>
</template>
```

---

## 八、Vue 2 vs Vue 3 迁移

| 特性 | Vue 2 (Options API) | Vue 3 (Composition API) |
|------|-------------------|------------------------|
| 数据 | `data()` 返回对象 | `ref()` / `reactive()` |
| 方法 | `methods: { fn() {} }` | `function fn() {}` |
| 计算 | `computed: {}` | `computed(() => ...)` |
| 监听 | `watch: {}` | `watch(() => ..., ...)` |
| 生命周期 | `mounted() {}` | `onMounted(() => ...)` |
| 通信 | `this.$emit()` | `defineEmits()` |
| 插槽 | `slot-scope` | `v-slot` |

---

**关联的 DeepSeek 会话（可删除）：**
以下 45 个 Vue 相关会话均已覆盖，见 `deepseek-chats/编程开发/Vue生态/` 目录，均可安全删除。