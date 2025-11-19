// Settings Storage
const settings = {
    panicKey: 'Escape',
    panicUrl: 'https://classroom.google.com',
    autoCloak: false,
    cloakTitle: 'Google Classroom',
    cloakIcon: 'https://ssl.gstatic.com/classroom/favicon.png',
    antiClose: false,
    tabTitle: 'Trojan Proxy',
    tabIcon: '🛡️',
    proxyBackend: 'uv'
};

// Production proxy configuration - uses Ultraviolet
const isProduction = true;

// Initialize Ultraviolet Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js', {
                scope: '/service/'
            });
            console.log('✅ UV Service Worker registered');
        } catch (error) {
            console.error('❌ SW registration failed:', error);
        }
    }
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('trojanSettings');
    if (saved) {
        Object.assign(settings, JSON.parse(saved));
        applySettings();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('trojanSettings', JSON.stringify(settings));
}

// Apply settings to the page
function applySettings() {
    document.getElementById('panicKeyBtn').textContent = settings.panicKey;
    document.getElementById('panicUrl').value = settings.panicUrl;
    document.getElementById('autoCloakToggle').checked = settings.autoCloak;
    document.getElementById('cloakTitle').value = settings.cloakTitle;
    document.getElementById('cloakIcon').value = settings.cloakIcon;
    document.getElementById('antiCloseToggle').checked = settings.antiClose;
    document.getElementById('tabTitle').value = settings.tabTitle;
    document.getElementById('tabIcon').value = settings.tabIcon;
    document.getElementById('proxyType').value = settings.proxyBackend;
    
    updateTabInfo(settings.tabTitle, settings.tabIcon);
}

// Update tab title and icon
function updateTabInfo(title, icon) {
    document.title = title;
    
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    
    if (icon.startsWith('http')) {
        link.href = icon;
    } else {
        link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${icon}</text></svg>`;
    }
}

// Original tab info for auto cloak
let originalTitle = '';
let originalIcon = '';

// Auto cloak functionality
function setupAutoCloak() {
    originalTitle = document.title;
    
    document.addEventListener('visibilitychange', () => {
        if (settings.autoCloak) {
            if (document.hidden) {
                updateTabInfo(settings.cloakTitle, settings.cloakIcon);
            } else {
                updateTabInfo(originalTitle, settings.tabIcon);
            }
        }
    });
}

// Panic button functionality
document.addEventListener('keydown', (e) => {
    if (e.key === settings.panicKey) {
        window.location.href = settings.panicUrl;
    }
});

// Anti-close functionality
window.addEventListener('beforeunload', (e) => {
    if (settings.antiClose) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Modal functionality
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

// Panic key selection
const panicKeyBtn = document.getElementById('panicKeyBtn');
panicKeyBtn.addEventListener('click', () => {
    panicKeyBtn.textContent = 'Press any key...';
    
    const keyHandler = (e) => {
        e.preventDefault();
        settings.panicKey = e.key;
        panicKeyBtn.textContent = e.key;
        saveSettings();
        document.removeEventListener('keydown', keyHandler);
    };
    
    document.addEventListener('keydown', keyHandler);
});

// Save panic URL
document.getElementById('panicUrl').addEventListener('change', (e) => {
    settings.panicUrl = e.target.value;
    saveSettings();
});

// Auto cloak toggle
document.getElementById('autoCloakToggle').addEventListener('change', (e) => {
    settings.autoCloak = e.target.checked;
    saveSettings();
});

// Cloak title
document.getElementById('cloakTitle').addEventListener('change', (e) => {
    settings.cloakTitle = e.target.value;
    saveSettings();
});

// Cloak icon
document.getElementById('cloakIcon').addEventListener('change', (e) => {
    settings.cloakIcon = e.target.value;
    saveSettings();
});

// Anti-close toggle
document.getElementById('antiCloseToggle').addEventListener('change', (e) => {
    settings.antiClose = e.target.checked;
    saveSettings();
});

// Proxy backend selection
document.getElementById('proxyType').addEventListener('change', (e) => {
    settings.proxyBackend = e.target.value;
    saveSettings();
});

// Tab customization
document.getElementById('applyTabBtn').addEventListener('click', () => {
    settings.tabTitle = document.getElementById('tabTitle').value;
    settings.tabIcon = document.getElementById('tabIcon').value;
    updateTabInfo(settings.tabTitle, settings.tabIcon);
    originalTitle = settings.tabTitle;
    saveSettings();
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    let url;
    if (query.includes('.') && !query.includes(' ')) {
        url = query.startsWith('http') ? query : 'https://' + query;
    } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    }
    
    openProxy(url);
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Proxy container
const proxyContainer = document.getElementById('proxyContainer');
const proxyFrame = document.getElementById('proxyFrame');
const urlBar = document.getElementById('urlBar');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const closeProxyBtn = document.getElementById('closeProxyBtn');

function openProxy(url) {
    proxyContainer.classList.add('active');
    
    // Encode URL for Ultraviolet
    const encodedUrl = __uv$config.encodeUrl(url);
    const proxyUrl = __uv$config.prefix + encodedUrl;
    
    proxyFrame.src = proxyUrl;
    urlBar.value = url;
}

backBtn.addEventListener('click', () => {
    proxyFrame.contentWindow.history.back();
});

forwardBtn.addEventListener('click', () => {
    proxyFrame.contentWindow.history.forward();
});

refreshBtn.addEventListener('click', () => {
    proxyFrame.src = proxyFrame.src;
});

fullscreenBtn.addEventListener('click', () => {
    if (proxyContainer.requestFullscreen) {
        proxyContainer.requestFullscreen();
    } else if (proxyContainer.webkitRequestFullscreen) {
        proxyContainer.webkitRequestFullscreen();
    } else if (proxyContainer.msRequestFullscreen) {
        proxyContainer.msRequestFullscreen();
    }
});

closeProxyBtn.addEventListener('click', () => {
    proxyContainer.classList.remove('active');
    proxyFrame.src = '';
});

urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let url = urlBar.value.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        openProxy(url);
    }
});

// Quick apps functionality
const appsGrid = document.getElementById('appsGrid');

appsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.app-card');
    if (card) {
        const url = card.dataset.url;
        openProxy(url);
    }
});

// Edit apps functionality
const editBtn = document.getElementById('editBtn');
let editMode = false;

editBtn.addEventListener('click', () => {
    editMode = !editMode;
    editBtn.textContent = editMode ? 'Done' : 'Edit';
    
    if (editMode) {
        appsGrid.querySelectorAll('.app-card').forEach(card => {
            card.style.position = 'relative';
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: #ef4444;
                border: none;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.remove();
            });
            card.appendChild(deleteBtn);
        });
    } else {
        appsGrid.querySelectorAll('.app-card button').forEach(btn => btn.remove());
    }
});

// Initialize
async function init() {
    await registerServiceWorker();
    loadSettings();
    setupAutoCloak();
    console.log('🛡️ Trojan Proxy initialized - Created by Kiaan Iyer');
}

init();
