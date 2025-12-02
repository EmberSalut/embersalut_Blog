// ==================== 默认链接数据 (仅用于首次加载) ====================
// 如果 LocalStorage 中没有数据，将使用此默认数据。
const DEFAULT_LINKS = [
    // --- 原始保留链接 ---
    { title: "魔戒 Mojie.App", url: "https://mojie.app/", icon: "fas fa-magic" },
    { title: "AnyLand", url: "https://anyland.xyz", icon: "fas fa-map-marked-alt" },
    { title: "GitHub", url: "https://github.com", icon: "fab fa-github" },
    { title: "AI Hub Mix", url: "https://aihubmix.com/", icon: "fas fa-robot" },
    { title: "YouTube", url: "https://www.youtube.com", icon: "fab fa-youtube" },
    { title: "海外抖音 (TikTok)", url: "https://www.tiktok.com", icon: "fab fa-tiktok" },

    // --- 新增链接 ---
    // 内部网络 NAS 地址
    { title: "内部网络 NAS (192.168.1.3)", url: "http://192.168.1.3", icon: "fas fa-server" },
    // 海南热带海洋学院教务处
    { title: "海南热带海洋学院教务处", url: "http://jwc.hntou.edu.cn/", icon: "fas fa-graduation-cap" },
    // X (原 Twitter)
    { title: "X (Twitter)", url: "https://x.com/home", icon: "fab fa-twitter" },
    // 知名 AI 网址
    { title: "ChatGPT", url: "https://chatgpt.com/", icon: "fas fa-comments" },
    { title: "Gemini", url: "https://gemini.google.com/", icon: "fas fa-brain" },
    { title: "Midjourney", url: "https://www.midjourney.com/", icon: "fas fa-palette" },
];

const STORAGE_KEY = 'myFreshLinksData_V2'; // 更改 key 以避免旧数据冲突

// ==================== LocalStorage 操作 ====================

/**
 * 从 LocalStorage 加载链接数据
 * @returns {Array} 链接数组
 */
function loadLinks() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (e) {
        console.error("加载本地存储失败", e);
    }
    // 如果没有数据或加载失败，返回默认数据
    return DEFAULT_LINKS;
}

/**
 * 保存链接数据到 LocalStorage
 * @param {Array} links 链接数组
 */
function saveLinks(links) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch (e) {
        console.error("保存本地存储失败", e);
    }
}


// ==================== 链接渲染、添加、删除逻辑 ====================

/**
 * 动态渲染链接卡片
 */
function renderLinks() {
    const linksContainer = document.getElementById('links-container');
    if (!linksContainer) return;

    const currentLinks = loadLinks();
    const fragment = document.createDocumentFragment();

    if (currentLinks.length === 0) {
        linksContainer.innerHTML = '<p class="no-links">当前收藏夹中没有链接，快添加一个吧！</p>';
        return;
    }

    currentLinks.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = "link-card-wrapper";
        
        // 链接本体
        const link = document.createElement('a');
        link.href = item.url;
        link.target = "_blank";
        link.className = "link-card";

        // 使用 FontAwesome 图标和标题
        link.innerHTML = `
            <i class="${item.icon || 'fas fa-link'}"></i>
            <span>${item.title}</span>
        `;
        
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = "delete-button";
        deleteBtn.setAttribute('data-index', index);
        deleteBtn.title = "删除此链接";
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', handleDelete);
        
        card.appendChild(link);
        card.appendChild(deleteBtn);
        fragment.appendChild(card);
    });

    linksContainer.innerHTML = ''; 
    linksContainer.appendChild(fragment);
}

/**
 * 处理链接添加
 */
function handleAdd(e) {
    e.preventDefault();

    const titleInput = document.getElementById('linkTitle');
    const urlInput = document.getElementById('linkUrl');
    const iconInput = document.getElementById('linkIcon');
    
    const newLink = {
        title: titleInput.value.trim(),
        url: urlInput.value.trim(),
        icon: iconInput.value.trim() || 'fas fa-link'
    };
    
    if (!newLink.title || !newLink.url) {
        alert("标题和网址不能为空！");
        return;
    }
    
    const currentLinks = loadLinks();
    currentLinks.push(newLink);
    saveLinks(currentLinks);

    document.getElementById('addLinkForm').reset();
    renderLinks();
    alert(`成功添加链接：${newLink.title}`);
}

/**
 * 处理链接删除
 */
function handleDelete(e) {
    e.preventDefault(); 
    e.stopPropagation();

    const index = e.currentTarget.getAttribute('data-index');
    if (confirm("确定要删除这个链接吗？")) {
        const currentLinks = loadLinks();
        
        // 确保索引有效
        if (index >= 0 && index < currentLinks.length) {
            currentLinks.splice(index, 1); 
            saveLinks(currentLinks);
            renderLinks();
        }
    }
}


// ==================== 辅助功能 (时间/搜索) 和初始化 ====================

/**
 * 实时显示当前时间
 */
function updateTime() {
    const now = new Date();
    // 使用更简洁的时间格式
    const options = { 
        year: 'numeric', month: 'numeric', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    const timeString = now.toLocaleDateString('zh-CN', options) + ' ' + now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}


/**
 * Google 搜索功能
 */
function performSearch() {
    const inputElement = document.getElementById('searchInput');
    const query = inputElement ? inputElement.value.trim() : '';

    if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        inputElement.value = '';
    }
}


// ==================== 初始化函数和事件监听 ====================

document.addEventListener('DOMContentLoaded', () => {
    // 渲染初始内容
    renderLinks();
    
    // 启动时间更新
    setInterval(updateTime, 1000);
    updateTime(); 

    // 绑定搜索回车键事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // 绑定添加链接表单提交事件
    const addLinkForm = document.getElementById('addLinkForm');
    if (addLinkForm) {
        addLinkForm.addEventListener('submit', handleAdd);
    }
});