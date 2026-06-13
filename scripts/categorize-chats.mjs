/**
 * DeepSeek Chat 会话分类脚本 v2 (二级分类)
 *
 * 根据标题关键词，将会话归类到 大类/子类 文件夹
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHATS_DIR = path.join(__dirname, '..', 'deepseek-chats');

/** 分类规则: [大类, 子类] → 关键词列表 */
const RULES = [
  { key: ['编程开发', 'Vue生态'],    kw: ['Vue', 'vue', 'keep-alive', 'keepalive', '路由', '组件', '模板', 'hook', 'Hook', 'computed', 'watch', 'methods', 'props', 'Vue3', 'Vue2', 'Vue Router', 'Vue-Flow', 'vue-flow', '前端转AI', '前端', '仪表盘', '低代码', '<template>', 'template'] },
  { key: ['编程开发', 'JavaScript'],  kw: ['JavaScript', 'JS ', 'JS获取', 'JS正则', 'JS表格', 'JS计算', 'JS实现', 'JS清空', 'JS字符串', 'JS数组', 'JS对象', 'JS函数', 'JS日志', 'JS树形', 'JS生成', '函数', '递归', '数组', '对象', '正则', 'Promise', 'async', 'await', 'toObject', 'includes', '闭包', '字符串', '数字', '日期', '判断', '求和', '列表元素', '乘以', '列表排序', 'IPv4', '代码问题', '代码优化', '代码重构', 'const ', 'function ', 'Preserving Query', 'try_files', 'fieldInfo', 'deptQueryVoList', 'getProjectList', 'table-view', 'namespaceYt', 'box-shadow', 'filter-opa', 'echart', '柱状图', 'const list', 'function getProjectList', '[class^', 'manage/businessSubLine', '$namespace', '_manage'] },
  { key: ['编程开发', 'Nginx与部署'], kw: ['Nginx', 'nginx', 'Docker', '部署', 'Deploy', 'deploy', 'try_files', 'rewrite', 'location', 'gzip', 'Cache-Control', 'logrotate', '隔离发布', 'PC端', '移动端'] },
  { key: ['编程开发', 'CSS与样式'],   kw: ['CSS', 'SCSS', 'scss', 'Tailwind', 'tailwind', 'overflow', 'box-shadow', 'filter', '暗黑模式', '布局', 'div', '圆角', '粘性定位'] },
  { key: ['编程开发', 'Element UI'],  kw: ['el-', 'el-table', 'el-cascader', 'el-date', 'el-select', 'el-tooltip', 'el-input', 'el-form', '表单', '表单动态', '表单字段', '校验', '弹窗', '流程提示'] },
  { key: ['编程开发', 'Conan项目'],   kw: ['Conan', 'conan', '工具站'] },
  { key: ['编程开发', '工程工具'],    kw: ['Git', 'git', 'Vite', 'vite', 'Webpack', 'npm', 'Node.js', 'pnpm', 'WSL', '离线安装', '环境变量', '打包', 'npx', 'skills', 'Coding Plan', 'Coding'] },
  { key: ['编程开发', 'Web API'],      kw: ['Chrome', 'User-Agent', 'userAgent', 'Platform.js', 'localStorage', 'requestAnimationFrame', 'Intersection', 'Observer', 'beforeunload', 'usePageLeave', '滚动监听', '点击事件', 'Platform', '用户代理', '大数据', 'table-view', 'table_view'] },
  { key: ['编程开发', '其他'],        kw: [] },

  { key: ['生活杂谈', '人文历史'],    kw: ['历史', '文化', '哲学', '哲理', '故事', '古代', '新中国', '朝代', '思想流派', '中国共产党', '十五五', '抗战', '资本家', '本质', '睁眼看世界', '唐僧', '扫塔', '堂兄妹', '表兄妹', '三十而立', '含义', '定义', '脑仁', 'PMO', 'pmo', 'Understanding', 'User sends', 'User shares', '明朝', '皇帝', '全局BP', '规则', '赛事'] },
  { key: ['生活杂谈', '科技数码'],    kw: ['6G', '充电宝', '电脑', '手机', '宽带', '键盘', '快捷键', 'VSCode', 'Windows', 'windows', 'ripgrep', '天气', '能见度', '行李箱', '隐形眼镜', '汽车', '买车', '江苏移动', '多版本', 'Chrome', '美团', '代理', '代理项目'] },
  { key: ['生活杂谈', '日常闲聊'],    kw: ['女生', '聊天', '话题', '共情', '游戏', '动漫', '国风', '仙侠', '角色设定', '囧次元', '吉他', '秘密', '水升华', '凝华', '0.333', '1/3', '证明', '近距离', '差异', '掘金', '小册', '名表', '世界顶级', '推荐', '指南', '川漂', '贾维斯', '管家', '励志', '名言', '网页'] },
  { key: ['生活杂谈', '其他'],        kw: [] },

  { key: ['理财投资', '资产与财务'],  kw: ['资产', '负债', '财务', '经济', 'GDP', '工资', '薪资', '理财', '资金管理', '预算', '收入'] },
  { key: ['理财投资', '投资产品'],    kw: ['黄金', '白银', '基金', '定投', '纳斯达克', 'QDII', 'ETF', '比特币', '股票', '特斯拉', '英伟达', '积存金', '份子钱', '金银币', '收藏'] },
  { key: ['理财投资', '保险社保'],    kw: ['社保', '养老金', '退休', '保险', '养老', '攒够'] },
  { key: ['理财投资', '房产与贷款'],  kw: ['买房', '租房', '房价', '利息', '分期', '利率', '年化', '本金', '彩票', '大乐透', '彩票店'] },
  { key: ['理财投资', '其他'],        kw: [] },

  { key: ['副业创业', '自媒体创作'],  kw: ['公众号', '带货', '自媒体', '图文', '写作', '视频', '内容创作', 'QQ群', '电子书', '副业'] },
  { key: ['副业创业', 'App与产品'],   kw: ['App', 'app', '产品', '打卡', '教程', '小程序', 'TaskMate', '搭子', '搭建', '接单', '赚钱', '变现', '工具站', 'Coding Plan'] },
  { key: ['副业创业', '电商'],        kw: ['电商', '淘宝', '拼多多', '一件代发', '虚拟店铺', '跨境', '蓝海', '信息差', '门店', '门窗', '对公账户'] },
  { key: ['副业创业', '其他'],        kw: [] },

  { key: ['AI与工具', 'Claude Code'], kw: ['Claude', 'claude', 'claude-mem'] },
  { key: ['AI与工具', 'DeepSeek'],    kw: ['DeepSeek', 'deepseek', 'R1', '深度求索'] },
  { key: ['AI与工具', 'AI应用'],      kw: ['AI ', 'AI辅助', 'AI应用', 'AI赋能', 'AI划词', 'AI创业', 'AI生成', 'AI日报', 'AI开发', '大模型', 'token', 'Token', 'API中转', 'OpenClaw'] },
  { key: ['AI与工具', '其他'],        kw: [] },

  { key: ['健康生活', '健身训练'],    kw: ['训练', '运动', '健身', '肌肉', '腹部', '核心', '拉伸', '体重', '减脂', '增肌', 'BMI', '练背', '运动记录'] },
  { key: ['健康生活', '饮食营养'],    kw: ['饮食', '蛋白', '碳水', '热量', '牛奶', '燕麦', '乳糖', '喝水', '饮水', '今日吃', '菜单'] },
  { key: ['健康生活', '医疗健康'],    kw: ['牙套', '牙齿', '智齿', '拔牙', '心脏', '彩超', '体检', '大脑', '解剖', '养生', '梳头', '摄影'] },
  { key: ['健康生活', '生活作息'],    kw: ['睡眠', '早睡', '作息', '习惯', '咀嚼'] },
  { key: ['健康生活', '其他'],        kw: [] },

  { key: ['日常工具', '效率工具'],    kw: ['待办', '清单', 'Todo', 'todo', '番茄钟', '记事本', '倒数', '倒计时', '密码本', '密码', '日历', '时间', '转换', '记账', '无痛记账'] },
  { key: ['日常工具', '趣味工具'],    kw: ['舒尔特', '称呼', '亲戚', '填字', '挑战', '100倒数', '生成器', '随机', '计算器', '工具网站', '菜单', '实用工具', '创意', '励志', '名言'] },
  { key: ['日常工具', '其他'],        kw: [] },

  { key: ['个人规划', '目标与规划'],  kw: ['规划', '目标', '未来', '转型', '职业', '2026', '2025', '展望'] },
  { key: ['个人规划', '自我认知'],    kw: ['自我认知', '性格', '能力', '人生', '学习', '方法', '改变', '程序员', '失业'] },
  { key: ['个人规划', '其他'],        kw: [] },
];

/**
 * 匹配最合适的分类
 */
function match(title) {
  const lower = title.toLowerCase();

  for (const rule of RULES) {
    if (rule.kw.length === 0) continue; // skip fallback rules
    for (const kw of rule.kw) {
      if (title.includes(kw) || lower.includes(kw.toLowerCase())) {
        return rule.key;
      }
    }
  }
  return null;
}

/**
 * 找一级大类的 fallback（放到该大类的「其他」）
 */
function getFallback(title, parentName) {
  const lower = title.toLowerCase();
  // 检查标题是否包含该大类的任何关键词
  for (const rule of RULES) {
    if (rule.key[0] === parentName && rule.kw.length > 0) {
      for (const kw of rule.kw) {
        if (title.includes(kw) || lower.includes(kw.toLowerCase())) {
          return [parentName, '其他'];
        }
      }
    }
  }
  return null;
}

/**
 * 通过内容特征判断大类
 */
function guessParent(title, content) {
  const sample = (title + ' ' + content.slice(0, 300)).toLowerCase();

  // 代码特征
  if (/```|function\s+\w+\s*\(/.test(content) || /<template>/.test(content) ||
      /import\s+.*from/.test(sample) || /const\s+\w+\s*=/.test(sample) ||
      /\.vue/.test(sample) || /\.js/.test(sample) || /npx\s/.test(sample)) return '编程开发';

  // 理财特征
  if (sample.includes('投资') || sample.includes('收益') || sample.includes('利率') ||
      sample.includes('财务') || sample.includes('资产') || sample.includes('黄金') ||
      sample.includes('基金') || sample.includes('社保')) return '理财投资';

  // 健康特征
  if (sample.includes('训练') || sample.includes('饮食') || sample.includes('蛋白') ||
      sample.includes('健身') || sample.includes('牙') || sample.includes('睡眠')) return '健康生活';

  // AI特征
  if (sample.includes('claude') || sample.includes('deepseek') || sample.includes('ai ') ||
      sample.includes('大模型') || sample.includes('sk')) return 'AI与工具';

  // 副业特征
  if (sample.includes('副业') || sample.includes('创业') || sample.includes('公众号') ||
      sample.includes('电商') || sample.includes('赚钱') || sample.includes('淘宝')) return '副业创业';

  // 规划特征
  if (sample.includes('规划') || sample.includes('目标') || sample.includes('职业') ||
      sample.includes('未来') || sample.includes('人生')) return '个人规划';

  return null;
}

function main() {
  const files = fs.readdirSync(CHATS_DIR).filter(f => f.endsWith('.md'));
  console.log(`共计 ${files.length} 个文件\n`);

  const stats = {};
  let unclassified = [];

  for (const file of files) {
    const filePath = path.join(CHATS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/^# (.+)/);
    const title = (titleMatch ? titleMatch[1].trim() : file).replace(/\.md$/, '');

    let targetDir = match(title);

    // 标题没匹配 → 内容特征猜大类
    if (!targetDir) {
      const parent = guessParent(title, content);
      if (parent) targetDir = getFallback(title, parent);
    }

    // 还是没匹配 → 放到「未分类」
    if (!targetDir) targetDir = ['未分类'];

    // 创建并移动
    const fullTargetDir = path.join(CHATS_DIR, ...targetDir);
    if (!fs.existsSync(fullTargetDir)) {
      fs.mkdirSync(fullTargetDir, { recursive: true });
    }
    const targetPath = path.join(fullTargetDir, file);
    if (!fs.existsSync(targetPath)) {
      fs.renameSync(filePath, targetPath);
    }

    const key = targetDir.join('/');
    stats[key] = (stats[key] || 0) + 1;
    if (targetDir.length === 1 && targetDir[0] === '未分类') {
      unclassified.push({ file, title });
    }
  }

  console.log('=== 二级分类结果 ===\n');
  const grouped = {};
  for (const [key, count] of Object.entries(stats).sort()) {
    const parts = key.split('/');
    const parent = parts[0], child = parts[1] || '(未分)';
    if (!grouped[parent]) grouped[parent] = {};
    grouped[parent][child] = count;
  }

  for (const [parent, children] of Object.entries(grouped)) {
    console.log(`  ${parent}:`);
    for (const [child, count] of Object.entries(children)) {
      const icon = child === '其他' ? '📦' : '└─';
      console.log(`    ${icon} ${child}: ${count} 个`);
    }
  }

  if (unclassified.length > 0) {
    console.log(`\n=== 未分类文件 (${unclassified.length}) ===`);
    for (const { file, title } of unclassified) {
      console.log(`  ${title}`);
    }
  }

  console.log('\n✅ 二级分类完成！');
}

main();