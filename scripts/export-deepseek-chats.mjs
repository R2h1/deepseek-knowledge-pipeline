/**
 * DeepSeek Chat 会话导出脚本 (v2)
 *
 * 从 DeepSeek 拉取所有会话并保存为本地 Markdown 文件。
 * 优化: 用 session ID 前缀防止同名覆盖，处理特殊字符
 * 使用方法: node scripts/export-deepseek-chats.mjs
 */

const BASE_URL = 'https://chat.deepseek.com';
const OUTPUT_DIR = 'deepseek-chats';

// 从 Chrome 网络请求中获取的认证信息
const AUTH_TOKEN = 'Bearer bSR0tceKaUeus+1W2Ftd46d/HmbIOMVlJPBA4i8SlF1MJCtt+HQ5umMuwN7nzSgr';

const headers = {
  'Authorization': AUTH_TOKEN,
  'x-client-locale': 'zh_CN',
  'x-client-platform': 'web',
  'x-app-version': '2.0.0',
  'x-client-version': '2.0.0',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://chat.deepseek.com/',
};

function extractText(fragments) {
  return (fragments || [])
    .filter(f => f.type === 'REQUEST' || f.type === 'RESPONSE')
    .map(f => f.content || '')
    .join('\n\n');
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp * 1000);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 生成安全的文件名，加上 session ID 前缀防止同名覆盖
 */
function safeFilename(title, sessionId) {
  const prefix = sessionId.slice(0, 8);
  const clean = title
    .replace(/[/\\?%*:|"<>\n\r\t]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return `${prefix}_${clean || 'untitled'}`;
}

async function fetchAllSessions() {
  const sessions = [];
  let cursor = { pinned: false };
  let page = 0;

  while (true) {
    page++;
    const params = new URLSearchParams({ 'lte_cursor.pinned': 'false' });
    if (cursor.updated_at) {
      params.set('lte_cursor.updated_at', cursor.updated_at.toString());
    }
    const url = `${BASE_URL}/api/v0/chat_session/fetch_page?${params}`;
    console.log(`[会话列表] 正在获取第 ${page} 页...`);

    const resp = await fetch(url, { headers });
    const data = await resp.json();
    const items = data?.data?.biz_data?.chat_sessions || [];
    if (items.length === 0) break;

    sessions.push(...items);
    console.log(`[会话列表] 第 ${page} 页获取到 ${items.length} 条，累计 ${sessions.length} 条`);

    const last = items[items.length - 1];
    cursor.updated_at = last.updated_at;
    if (items.length < 50) break;
  }

  return sessions;
}

async function fetchSessionMessages(sessionId) {
  const url = `${BASE_URL}/api/v0/chat/history_messages?chat_session_id=${sessionId}`;
  const resp = await fetch(url, { headers });
  const data = await resp.json();
  return data?.data?.biz_data || null;
}

function sessionToMarkdown(sessionId, sessionInfo, messages) {
  const lines = [];

  lines.push(`# ${sessionInfo.title}`);
  lines.push('');
  lines.push(`> 会话ID：${sessionId}`);
  if (sessionInfo.inserted_at) lines.push(`> 创建时间：${formatDate(sessionInfo.inserted_at)}`);
  if (sessionInfo.updated_at) lines.push(`> 最后更新：${formatDate(sessionInfo.updated_at)}`);
  if (sessionInfo.model_type) lines.push(`> 模型类型：${sessionInfo.model_type === 'expert' ? '专家模式' : '快速模式'}`);
  lines.push(`> 消息数：${messages.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const msg of messages) {
    const role = msg.role === 'USER' ? '👤 **你**' : '🤖 **DeepSeek**';
    const time = formatDate(msg.inserted_at);
    const content = extractText(msg.fragments);

    lines.push(`### ${role} · ${time}`);
    lines.push('');
    lines.push(content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  console.log('='.repeat(50));
  console.log('DeepSeek Chat 会话导出工具 v2');
  console.log('='.repeat(50));
  console.log('');

  const fs = await import('fs');
  const path = await import('path');
  const outputDir = path.join(process.cwd(), OUTPUT_DIR);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 第一步：获取所有会话列表
  console.log('\n📋 第一步：获取所有会话列表');
  console.log('-'.repeat(40));
  const sessions = await fetchAllSessions();
  console.log(`\n✅ 共获取到 ${sessions.length} 条会话`);

  // 检查已导出的
  const existingFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.md'));
  const existingIds = new Set();
  for (const f of existingFiles) {
    const match = f.match(/^([a-f0-9]{8})_/);
    if (match) existingIds.add(match[1]);
  }
  console.log(`   本地已有 ${existingFiles.length} 个文件（${existingIds.size} 个唯一 ID）`);

  // 筛选未导出的
  const toExport = sessions.filter(s => !existingIds.has(s.id.slice(0, 8)));
  if (toExport.length === 0) {
    console.log('\n✅ 所有会话都已导出，无需重复下载');
    return;
  }
  console.log(`   需要新增下载 ${toExport.length} 个会话`);

  // 第二步：逐个获取会话内容并保存
  console.log('\n📝 第二步：下载会话内容');
  console.log('-'.repeat(40));

  let success = 0;
  let fail = 0;

  for (let i = 0; i < toExport.length; i++) {
    const session = toExport[i];
    const progress = `[${i + 1}/${toExport.length}]`;

    try {
      process.stdout.write(`\r${progress} 正在下载: ${(session.title || session.id).slice(0, 40)}...`);

      const data = await fetchSessionMessages(session.id);
      if (!data) { fail++; continue; }

      const messages = (data.chat_messages || [])
        .filter(m => m.status === 'FINISHED' && (m.role === 'USER' || m.role === 'ASSISTANT'));

      if (messages.length === 0) { fail++; continue; }

      const sessionInfo = { ...session, ...data.chat_session };
      const markdown = sessionToMarkdown(session.id, sessionInfo, messages);

      const filename = safeFilename(session.title || 'untitled', session.id);
      const filepath = path.join(outputDir, `${filename}.md`);
      fs.writeFileSync(filepath, markdown, 'utf-8');
      success++;
    } catch (err) {
      fail++;
      console.log(`\n❌ ${progress} 下载失败: ${(session.title || session.id).slice(0, 40)} - ${err.message}`);
    }
  }

  console.log('\n');
  console.log('='.repeat(50));
  const totalFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.md')).length;
  console.log(`📊 导出完成！`);
  console.log(`   ✅ 本次新增: ${success} 个会话`);
  console.log(`   ❌ 失败: ${fail} 个会话`);
  console.log(`   📁 总计: ${totalFiles} 个文件`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('程序运行失败:', err);
  process.exit(1);
});