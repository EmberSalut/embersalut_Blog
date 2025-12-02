// ==================== 配置与数据 ====================
const STORAGE_KEY = 'myDigitalGarden_v3';
const DEFAULT_LINKS = [
    { title: "GitHub", url: "https://github.com", icon: "fab fa-github" },
    { title: "ChatGPT", url: "https://chatgpt.com/", icon: "fas fa-robot" },
    { title: "YouTube", url: "https://www.youtube.com", icon: "fab fa-youtube" },
    { title: "Gmail", url: "https://mail.google.com", icon: "fas fa-envelope" },
    { title: "X (Twitter)", url: "https://x.com", icon: "fab fa-x-twitter" },
    { title: "Bilibili", url: "https://www.bilibili.com", icon: "fab fa-bilibili" },
    { title: "内部 NAS", url: "http://192.168.1.3", icon: "fas fa-server" },
];

// ==================== 核心逻辑 ====================

// 1. 数据加载与保存
function loadLinks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : DEFAULT_LINKS;
    } catch (e) {
        console.error("读取数据失败", e);
        return DEFAULT_LINKS;
    }
}

function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

// 2. 自动匹配图标 (Simple Heuristic)
function guessIcon(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('github')) return 'fab fa-github';
    if (lowerUrl.includes('google')) return 'fab fa-google';
    if (lowerUrl.includes('youtube')) return 'fab fa-youtube';
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return 'fab fa-x-twitter';
    if (lowerUrl.includes('bilibili')) return 'fab fa-bilibili';
    if (lowerUrl.includes('weibo')) return 'fab fa-weibo';
    if (lowerUrl.includes('zhihu')) return 'fab fa-zhihu';
    if (lowerUrl.includes('instagram')) return 'fab fa-instagram';
    if (lowerUrl.includes('tiktok')) return 'fab fa-tiktok';
    if (lowerUrl.includes('apple')) return 'fab fa-apple';
    if (lowerUrl.includes('microsoft')) return 'fab fa-microsoft';
    
    // 默认图标
    return 'fas fa-globe';
}

// 3. 渲染逻辑
function renderLinks() {
    const container = document.getElementById('links-container');
    const links = loadLinks();

    container.innerHTML = ''; // 清空

    if (links.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-sub); padding: 20px;">暂无链接，请点击上方“添加新链接”</div>';
        return;
    }

    links.forEach((link, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'link-card-wrapper';

        // 安全地构建 HTML，防止 XSS
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'link-card';
        a.target = '_blank';
        a.rel = 'noopener noreferrer'; // 安全性增强

        const icon = document.createElement('i');
        // 确保 icon 类名是安全的，虽然这里主要依赖 fontawesome
        icon.className = `icon-main ${link.icon || 'fas fa-link'}`;
        
        const span = document.createElement('span');
        span.textContent = link.title; // 使用 textContent 防止注入

        a.appendChild(icon);
        a.appendChild(span);

        // 删除按钮
        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.innerHTML = '<i class="fas fa-times"></i>';
        btn.title = '删除';
        btn.onclick = (e) => deleteLink(e, index);

        wrapper.appendChild(a);
        wrapper.appendChild(btn);
        container.appendChild(wrapper);
    });
}

// 4. 事件处理
function handleAdd(e) {
    e.preventDefault();
    const title = document.getElementById('linkTitle').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    let icon = document.getElementById('linkIcon').value.trim();

    if (!title || !url) return;

    // 智能补充协议头
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
        finalUrl = 'https://' + url;
    }

    // 智能匹配图标
    if (!icon) {
        icon = guessIcon(finalUrl);
    }

    const links = loadLinks();
    links.push({ title, url: finalUrl, icon });
    saveLinks(links);

    e.target.reset();
    renderLinks();
    
    // 自动收起面板
    toggleAddPanel(); 
}

function deleteLink(e, index) {
    e.stopPropagation(); // 防止触发链接跳转
    if (confirm('确定要移除这个链接吗？')) {
        const links = loadLinks();
        links.splice(index, 1);
        saveLinks(links);
        renderLinks();
    }
}

// ==================== 辅助功能 ====================

// 搜索
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
}

// 切换添加面板
function toggleAddPanel() {
    const panel = document.getElementById('addLinkPanel');
    panel.classList.toggle('hidden');
}

// 填充示例代码
function fillIconExample(el) {
    document.getElementById('linkIcon').value = el.innerText;
}

// 时间更新
function updateTime() {
    const now = new Date();
    const str = now.toLocaleDateString('zh-CN', { 
        month: 'long', day: 'numeric', weekday: 'long' 
    }) + ' ' + now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute:'2-digit' });
    document.getElementById('current-time').textContent = str;
}

// ==================== 主题管理 (Dark Mode) ====================
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = toggleBtn.querySelector('i');
    
    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-moon';
    }

    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    renderLinks();
    initTheme();
    updateTime();
    setInterval(updateTime, 1000);
    
    // 设置年份
    document.getElementById('year').textContent = new Date().getFullYear();

    // 绑定事件
    document.getElementById('addLinkForm').addEventListener('submit', handleAdd);
    document.getElementById('toggleAddPanel').addEventListener('click', toggleAddPanel);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});