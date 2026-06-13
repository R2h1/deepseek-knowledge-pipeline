---
title: JavaScript 实用代码笔记
tags: [JavaScript, 前端, 代码片段, 工具函数, 数组, 日期, 字符串]
created: 2026-06-13
sources: [JavaScript 相关 63 个会话 - 见末尾列表]
---

# JavaScript 实用代码笔记

> 这些是从日常开发中积累的实用 JavaScript 代码片段，涵盖了数组、日期、字符串、对象处理等高频场景。

---

## 一、数组操作

### 1.1 数组分组

```javascript
/**
 * 按指定 key 对数组分组
 * @param {Array} arr - 源数组
 * @param {string} key - 分组依据的字段名
 * @returns {Object} 分组后的对象
 */
function groupBy(arr, key) {
  return arr.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {})
}

// 示例
const data = [
  { type: 'fruit', name: 'apple' },
  { type: 'fruit', name: 'banana' },
  { type: 'veg', name: 'carrot' }
]
groupBy(data, 'type')
// { fruit: [{...}, {...}], veg: [{...}] }
```

### 1.2 数组去重（按属性）

```javascript
/**
 * 按指定属性去重
 */
function uniqueBy(arr, key) {
  const seen = new Set()
  return arr.filter(item => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

// 简单数组去重
const unique = [...new Set([1, 2, 2, 3, 3, 4])] // [1, 2, 3, 4]
```

### 1.3 列表排序

```javascript
/**
 * 多字段排序：先按 key 降序，id 在末尾
 */
function customSort(arr) {
  return arr.sort((a, b) => {
    // 按 key 降序
    if (a.key !== b.key) return b.key - a.key
    // key 相同时，id 排在后面
    if (a.id === '末尾标记') return 1
    if (b.id === '末尾标记') return -1
    return a.id - b.id
  })
}
```

### 1.4 列表元素求和

```javascript
const items = [10, 20, 30, 40]
const sum = items.reduce((a, b) => a + b, 0) // 100

// 乘以系数后求和
const total = items.reduce((sum, n) => sum + n * 0.0133, 0)
```

### 1.5 截取最后一个元素

```javascript
const arr = [1, 2, 3, 4, 5]
arr.at(-1)      // 5（ES2022）
arr.slice(-1)[0] // 5
arr[arr.length - 1] // 5
```

### 1.6 生成唯一背景色（根据工号）

```javascript
function getColorByEmployeeId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = hash % 360
  return `hsl(${h}, 60%, 70%)`
}
```

---

## 二、日期与时间

### 2.1 获取当月天数

```javascript
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}
// getDaysInMonth(2026, 6) → 30（6月有30天）
```

### 2.2 获取今年所有月份

```javascript
function getAllMonthsOfYear(year) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }))
}
```

### 2.3 获取月份的非周六日天数

```javascript
function getWeekdayCount(year, month) {
  let count = 0
  const days = new Date(year, month, 0).getDate()
  for (let day = 1; day <= days; day++) {
    const dow = new Date(year, month - 1, day).getDay()
    if (dow !== 0 && dow !== 6) count++ // 周日=0, 周六=6
  }
  return count
}
```

### 2.4 日期范围选择器限制

```javascript
// 限制结束日期不能早于开始日期
// 限制开始日期不能晚于结束日期
// 限制可选范围为 30 天内

const MAX_RANGE_DAYS = 30
const disabledDate = (date, startDate) => {
  if (!startDate) return false
  const diff = Math.abs(date.diff(startDate, 'days'))
  return diff > MAX_RANGE_DAYS
}
```

### 2.5 判断年月是否在范围内

```javascript
function isWithinRange(year, month, startDate, endDate) {
  const date = new Date(year, month - 1)
  return date >= new Date(startDate) && date <= new Date(endDate)
}
```

---

## 三、字符串处理

### 3.1 首字母大写

```javascript
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
// capitalize('hello') → 'Hello'

// 字符串中每个单词首字母大写
const capitalizeWords = str =>
  str.replace(/\b\w/g, char => char.toUpperCase())
```

### 3.2 正则替换括号内容

```javascript
// 移除括号及括号内内容
str.replace(/[（）()].*?[（）()]/g, '')

// 提取括号内的内容
str.match(/[（(](.*?)[）)]/g)
```

### 3.3 字符串取后四位

```javascript
const lastFour = str.slice(-4)
// 或
const lastFour2 = str.substring(str.length - 4)
```

### 3.4 判断有效非负数值

```javascript
function isValidNonNegative(value) {
  return /^\d+(\.\d+)?$/.test(value)
}
// isValidNonNegative('123') → true
// isValidNonNegative('12.5') → true
// isValidNonNegative('-1') → false
// isValidNonNegative('abc') → false
```

### 3.5 判断合法日期字符串

```javascript
function isValidDate(dateStr) {
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date)
}
```

---

## 四、对象与转换

### 4.1 枚举值转英文键

```javascript
const enumMap = {
  STATUS_PENDING: '待处理',
  STATUS_PROCESSING: '处理中',
  STATUS_DONE: '已完成'
}

// 中文转英文键
function getEnumKey(chineseValue) {
  return Object.keys(enumMap).find(key => enumMap[key] === chineseValue)
}

// 递归添加叶子列下标字段
function addColumnIndex(columns, parentIndex = '') {
  return columns.map((col, i) => ({
    ...col,
    colIndex: parentIndex ? `${parentIndex}-${i}` : `${i}`,
    children: col.children ? addColumnIndex(col.children, col.colIndex) : undefined
  }))
}
```

### 4.2 URL 参数压缩与解压

```javascript
// 压缩：将多个参数合并为简短字符串
function compressParams(params) {
  return btoa(JSON.stringify(params))
}

// 解压
function decompressParams(compressed) {
  return JSON.parse(atob(compressed))
}
```

### 4.3 树形结构扁平化

```javascript
function flattenTree(tree, childrenKey = 'children') {
  return tree.reduce((acc, node) => {
    const children = node[childrenKey] || []
    return acc.concat(node, flattenTree(children, childrenKey))
  }, [])
}
```

### 4.4 路由配置转为绝对路径数组

```javascript
function flattenRoutes(routes, parentPath = '/') {
  return routes.reduce((paths, route) => {
    const fullPath = route.path.startsWith('/')
      ? route.path
      : `${parentPath}${route.path}`.replace(/\/\//g, '/')
    paths.push(fullPath)
    if (route.children) {
      paths.push(...flattenRoutes(route.children, fullPath))
    }
    return paths
  }, [])
}
```

---

## 五、数学与计算

### 5.1 精确小数加法

```javascript
// 解决 0.1 + 0.2 !== 0.3 的问题
function preciseAdd(a, b) {
  const factor = Math.pow(10, Math.max(
    (String(a).split('.')[1] || '').length,
    (String(b).split('.')[1] || '').length
  ))
  return (a * factor + b * factor) / factor
}
```

### 5.2 四舍五入保留两位小数

```javascript
const round2 = num => Math.round(num * 100) / 100

// 保留指定位数
const roundTo = (num, decimals) =>
  Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
```

### 5.3 整数千分位逗号分割

```javascript
const formatNumber = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
// 1234567 → '1,234,567'
```

---

## 六、DOM 与事件

### 6.1 固定右侧可拖动按钮

```javascript
// 实现一个固定在页面右侧的可拖动按钮
let isDragging = false
const btn = document.getElementById('dragBtn')

btn.addEventListener('mousedown', (e) => {
  isDragging = true
  const offsetX = e.clientX - btn.offsetLeft
  const offsetY = e.clientY - btn.offsetTop

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', () => {
    isDragging = false
    document.removeEventListener('mousemove', onMove)
  })
})
```

### 6.2 触发元素点击事件的多种方法

```javascript
// 方法 1：直接调用
element.click()

// 方法 2：dispatchEvent
element.dispatchEvent(new MouseEvent('click', {
  bubbles: true,
  cancelable: true
}))

// 方法 3：模拟用户点击
const event = new PointerEvent('pointerdown', { bubbles: true })
element.dispatchEvent(event)
```

---

## 七、日志与分析

### 7.1 计算接口耗时

```javascript
console.time('API_REQUEST')
fetch(url)
  .then(res => res.json())
  .then(data => {
    console.timeEnd('API_REQUEST')
    // 输出: API_REQUEST: 236ms
  })
```

### 7.2 日志分析（统计接口耗时分布）

```javascript
function analyzeApiLogs(logs) {
  return logs.reduce((stats, log) => {
    const api = log.url
    if (!stats[api]) stats[api] = { count: 0, totalTime: 0, max: 0 }
    stats[api].count++
    stats[api].totalTime += log.duration
    stats[api].max = Math.max(stats[api].max, log.duration)
    return stats
  }, {})
}
```

---

## 八、其他实用模式

### 8.1 `!a || !b` 与 `!(a && b)` 等价

```javascript
// !a || !b 等价于 !(a && b)
// 德摩根定律：NOT(A AND B) = (NOT A) OR (NOT B)

// 例：判断两个值都不能为空
if (!a || !b) { /* 至少一个为空 */ }
// 等价于
if (!(a && b)) { /* a和b不同时存在 */ }
```

### 8.2 `includes` 简化多条件判断

```javascript
// 不推荐
if (status === 'a' || status === 'b' || status === 'c') { }

// 推荐
if (['a', 'b', 'c'].includes(status)) { }
```

### 8.3 判断是否纯包含指定操作

```javascript
const VALID_OPERATIONS = ['cancel-order', 'refund', 'modify']
function isValidOperation(ops) {
  return ops.every(op => VALID_OPERATIONS.includes(op))
}
```

### 8.4 根据工号生成唯一背景色

```javascript
function getColorById(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) * 31 + hash
  }
  const hue = ((hash % 360) + 360) % 360
  return `hsl(${hue}, 55%, 75%)`
}
```

---

**关联的 DeepSeek 会话（可删除）：**
以下 63 个 JavaScript 相关会话均在本篇覆盖，按子主题分类：

**数组/数据操作：** 数组分组处理, 列表排序：按key降序，id在末尾, 列表元素乘以0.0133后求和, 按指定属性去重数组对象, 截取最后一个元素, 有一个数组实现一个方法给每个项生成一个 number, 后端返回了一个历史记录数组, const list = [等

**日期/时间：** 获取月份天数, JS获取今年所有月份数组, JS获取月份天数, 获取一个月的非周六日的天数, 日期选择器日期限制逻辑分析, 统计年份选项范围实现, 判断年月是否在投资时间范围内

**字符串/正则：** 首字母大写, JS字符串取后四位, 正则替换括号, 正则匹配 console.log, 整数千分位逗号分割, 字符串首字母大写方法总结, IPv4输入框校验, 判断有效非负数值, 判断合法日期字符串

**数学/计算：** 精确小数加法, 四舍五入保留两位小数, JS表格小数求和, JS计算三个金额比例总和, 列表元素乘以0.0133, 函数逻辑差异分析

**对象/路由/转换：** 枚举值转换英文键, 递归添加叶子列下标字段, 树形结构扁平化, 路由配置转为绝对路径数组, toObject 方法, URL参数压缩与解压, Preserving Query Parameters

**DOM/事件：** JS实现固定右侧可拖动按钮, 触发元素点击事件, 滚动监听显示元素, 容器滚动条居中显示

**工具/杂项：** includes 简化多条件判断, !a||!b 等价于 !(a&&b), 根据工号生成唯一背景色, 代码问题分析, Git变动内容, box-shadow, fieldInfo, getProjectList, deptQueryVoList, 用户代理字符串, 生成指定年份12个月字符串等

（具体文件名可在 `deepseek-chats/编程开发/JavaScript/` 目录查看，均可安全删除）