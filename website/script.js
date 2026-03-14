// Global state
let currentContent = '';
let currentContentType = 'markdown';
let currentTheme = 'dark';
let tocVisible = false;

// DOM elements
const editor = document.getElementById('editor');
const previewContent = document.getElementById('previewContent');
const contentTypeSelect = document.getElementById('contentType');
const themeSelect = document.getElementById('themeSelect');
const tocToggle = document.getElementById('tocToggle');
const tocSidebar = document.getElementById('tocSidebar');
const tocList = document.getElementById('tocList');
const clearBtn = document.getElementById('clearBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const previewWrapper = document.querySelector('.preview-content-wrapper');

// Toolbar buttons
const downloadMdBtn = document.getElementById('downloadMd');
const copyMdBtn = document.getElementById('copyMd');
const downloadImgBtn = document.getElementById('downloadImg');
const copyImgBtn = document.getElementById('copyImg');
const downloadHtmlBtn = document.getElementById('downloadHtml');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadSavedContent();
    updatePreview();
});

function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    applyTheme(currentTheme);
    themeSelect.value = currentTheme;

    // Initialize Mermaid
    mermaid.initialize({
        theme: ['dark', 'solarized', 'nord'].includes(currentTheme) ? 'dark' : 'default',
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif'
    });

    // Configure marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    // Load TOC preference
    const savedTocState = localStorage.getItem('tocVisible');
    if (savedTocState !== null) {
        tocVisible = savedTocState === 'true';
        updateTocVisibility();
    }
}

function setupEventListeners() {
    // Editor events
    editor.addEventListener('input', debounce(handleEditorChange, 300));
    editor.addEventListener('keydown', handleEditorKeydown);

    // Control events
    contentTypeSelect.addEventListener('change', handleContentTypeChange);
    themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
    tocToggle.addEventListener('click', toggleToc);
    clearBtn.addEventListener('click', clearEditor);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileImport);

    // Toolbar events
    downloadMdBtn.addEventListener('click', downloadMarkdown);
    copyMdBtn.addEventListener('click', copyMarkdown);
    downloadImgBtn.addEventListener('click', downloadImage);
    copyImgBtn.addEventListener('click', copyImage);
    downloadHtmlBtn.addEventListener('click', downloadHtml);

    // Fullscreen
    fullscreenToggle.addEventListener('click', toggleFullscreen);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);

    // Scroll sync
    let isSyncingScroll = false;

    editor.addEventListener('scroll', () => {
        if (isSyncingScroll) return;
        isSyncingScroll = true;
        const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        previewContent.scrollTop = ratio * (previewContent.scrollHeight - previewContent.clientHeight);
        isSyncingScroll = false;
    });

    previewContent.addEventListener('scroll', () => {
        if (isSyncingScroll) return;
        isSyncingScroll = true;
        const ratio = previewContent.scrollTop / (previewContent.scrollHeight - previewContent.clientHeight);
        editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
        isSyncingScroll = false;
    });

    // Auto-save
    setInterval(saveContent, 5000);
}

function handleEditorChange() {
    currentContent = editor.value;
    updatePreview();
    saveContent();
}

function handleEditorKeydown(e) {
    // Tab key handling
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;

        if (e.shiftKey) {
            // Remove indentation
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const line = value.substring(lineStart, value.indexOf('\n', start));
            if (line.startsWith('  ')) {
                editor.value = value.substring(0, lineStart) + line.substring(2) + value.substring(lineStart + line.length);
                editor.selectionStart = editor.selectionEnd = start - 2;
            }
        } else {
            // Add indentation
            editor.value = value.substring(0, start) + '  ' + value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 2;
        }

        handleEditorChange();
    }
}

function handleContentTypeChange() {
    currentContentType = contentTypeSelect.value;
    updatePreview();

    // Update editor placeholder
    const placeholders = {
        markdown: '在此输入 Markdown 内容...\n\n# 示例标题\n\n这是一个 **粗体** 文本示例。',
        html: '在此输入 HTML 内容...\n\n<h1>示例标题</h1>\n<p>这是一个 <strong>HTML</strong> 示例。</p>',
        svg: '在此输入 SVG 内容...\n\n<svg width="200" height="100">\n  <circle cx="50" cy="50" r="40" fill="red" />\n</svg>'
    };

    if (!currentContent) {
        editor.placeholder = placeholders[currentContentType];
    }
}

function handleGlobalKeydown(e) {
    // Ctrl/Cmd + S: Save (prevent default)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showToast('内容已自动保存', 'success');
    }

    // Ctrl/Cmd + D: Download Markdown
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadMarkdown();
    }

    // Ctrl/Cmd + Shift + C: Copy Markdown
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyMarkdown();
    }

    // Ctrl/Cmd + T: Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }

    // Ctrl/Cmd + B: Toggle TOC
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleToc();
    }
}

function updatePreview() {
    if (!currentContent.trim()) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <p>开始输入内容以查看预览</p>
            </div>
        `;
        return;
    }

    let html = '';

    try {
        switch (currentContentType) {
            case 'markdown':
                html = marked.parse(currentContent);
                break;
            case 'html':
                html = currentContent;
                break;
            case 'svg':
                html = currentContent;
                break;
        }

        previewContent.innerHTML = `<div class="markdown-body">${html}</div>`;

        // Process Mermaid diagrams
        processMermaidDiagrams();

        // Generate table of contents
        generateTableOfContents();

        // Add fade-in animation
        previewContent.classList.add('fade-in');
        setTimeout(() => previewContent.classList.remove('fade-in'), 500);

    } catch (error) {
        console.error('Preview error:', error);
        showToast('预览生成失败', 'error');
    }
}

function processMermaidDiagrams() {
    const codeBlocks = previewContent.querySelectorAll('pre code');
    const mermaidBlocks = [];

    codeBlocks.forEach(block => {
        const text = block.textContent.trim();
        if (isMermaidCode(text)) {
            const pre = block.parentElement;
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = text;
            pre.parentElement.replaceChild(div, pre);
            mermaidBlocks.push(div);
        }
    });

    if (mermaidBlocks.length > 0) {
        mermaid.init(undefined, mermaidBlocks);
    }
}

function isMermaidCode(text) {
    const mermaidKeywords = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'gantt', 'pie', 'erDiagram', 'journey',
        'mindmap', 'timeline', 'xychart'
    ];

    return mermaidKeywords.some(keyword => text.startsWith(keyword));
}

function generateTableOfContents() {
    const headers = previewContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    tocList.innerHTML = '';

    if (headers.length === 0) {
        return;
    }

    headers.forEach((header, index) => {
        // Generate ID if not exists
        if (!header.id) {
            header.id = `heading-${index}-${header.textContent
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '')}`;
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.textContent = header.textContent;
        a.className = `toc-${header.tagName.toLowerCase()}`;

        a.addEventListener('click', (e) => {
            e.preventDefault();

            // Scroll preview to header position within its scroll container
            const containerTop = previewContent.getBoundingClientRect().top;
            const headerTop = header.getBoundingClientRect().top;
            const offset = headerTop - containerTop + previewContent.scrollTop - 16;
            previewContent.scrollTo({ top: offset, behavior: 'smooth' });

            // Sync editor scroll proportionally
            const ratio = offset / (previewContent.scrollHeight - previewContent.clientHeight);
            editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);

            // Highlight active TOC item
            tocList.querySelectorAll('a').forEach(link => link.classList.remove('active'));
            a.classList.add('active');
        });

        li.appendChild(a);
        tocList.appendChild(li);
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function applyTheme(theme) {
    currentTheme = theme;
    document.body.className = theme + '-theme';
    localStorage.setItem('theme', theme);

    const darkMermaid = ['dark', 'solarized', 'nord'].includes(theme);
    mermaid.initialize({
        theme: darkMermaid ? 'dark' : 'default',
        startOnLoad: false,
        securityLevel: 'loose'
    });
    processMermaidDiagrams();

    showToast(`已切换到 ${theme} 主题`, 'success');
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        editor.value = ev.target.result;
        currentContent = ev.target.result;
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'html') contentTypeSelect.value = currentContentType = 'html';
        else if (ext === 'svg') contentTypeSelect.value = currentContentType = 'svg';
        else contentTypeSelect.value = currentContentType = 'markdown';
        updatePreview();
        saveContent();
        showToast(`已导入 ${file.name}`, 'success');
    };
    reader.readAsText(file);
    fileInput.value = '';
}

function toggleToc() {
    tocVisible = !tocVisible;
    updateTocVisibility();
    localStorage.setItem('tocVisible', tocVisible.toString());

    showToast(`目录已${tocVisible ? '显示' : '隐藏'}`, 'success');
}

function updateTocVisibility() {
    if (tocVisible) {
        tocSidebar.classList.add('visible');
        tocToggle.classList.add('active');
    } else {
        tocSidebar.classList.remove('visible');
        tocToggle.classList.remove('active');
    }
}

function clearEditor() {
    if (currentContent && !confirm('确定要清空所有内容吗？此操作无法撤销。')) {
        return;
    }

    editor.value = '';
    currentContent = '';
    updatePreview();
    saveContent();
    editor.focus();

    showToast('内容已清空', 'success');
}

// Export functions
function downloadMarkdown() {
    if (!currentContent) {
        showToast('没有内容可下载', 'error');
        return;
    }

    const blob = new Blob([currentContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Markdown 文件已下载', 'success');
}

function copyMarkdown() {
    if (!currentContent) {
        showToast('没有内容可复制', 'error');
        return;
    }

    navigator.clipboard.writeText(currentContent).then(() => {
        showToast('Markdown 已复制到剪贴板', 'success');
    }).catch(() => {
        showToast('复制失败', 'error');
    });
}

function downloadHtml() {
    const markdownBody = previewContent.querySelector('.markdown-body');
    if (!markdownBody) {
        showToast('没有内容可下载', 'error');
        return;
    }

    const html = generateFullHtml(markdownBody.innerHTML);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preview-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('HTML 文件已下载', 'success');
}

function downloadImage() {
    const markdownBody = previewContent.querySelector('.markdown-body');
    if (!markdownBody) {
        showToast('没有内容可下载', 'error');
        return;
    }

    const toast = showToast('正在生成图片...', 'loading', 0);

    // Temporarily style for better screenshot
    const originalStyle = markdownBody.style.cssText;
    markdownBody.style.padding = '40px';
    const isDark = ['dark', 'solarized', 'nord'].includes(currentTheme);
    markdownBody.style.backgroundColor = isDark ? '#0f0f0f' : '#fdfdfd';
    markdownBody.style.borderRadius = '12px';

    html2canvas(markdownBody, {
        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
        scale: 2,
        useCORS: true,
        logging: false,
        width: markdownBody.scrollWidth + 80,
        height: markdownBody.scrollHeight + 80
    }).then(canvas => {
        // Restore original style
        markdownBody.style.cssText = originalStyle;

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preview-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.update('图片已下载', 'success', 2000);
        });
    }).catch(error => {
        markdownBody.style.cssText = originalStyle;
        console.error('Screenshot error:', error);
        toast.update('图片生成失败', 'error', 3000);
    });
}

function copyImage() {
    const markdownBody = previewContent.querySelector('.markdown-body');
    if (!markdownBody) {
        showToast('没有内容可复制', 'error');
        return;
    }

    const toast = showToast('正在生成图片...', 'loading', 0);

    // Temporarily style for better screenshot
    const originalStyle = markdownBody.style.cssText;
    markdownBody.style.padding = '40px';
    const isDark = ['dark', 'solarized', 'nord'].includes(currentTheme);
    markdownBody.style.backgroundColor = isDark ? '#0f0f0f' : '#fdfdfd';
    markdownBody.style.borderRadius = '12px';

    html2canvas(markdownBody, {
        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
        scale: 2,
        useCORS: true,
        logging: false,
        width: markdownBody.scrollWidth + 80,
        height: markdownBody.scrollHeight + 80
    }).then(canvas => {
        // Restore original style
        markdownBody.style.cssText = originalStyle;

        canvas.toBlob(blob => {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                toast.update('图片已复制到剪贴板', 'success', 2000);
            }).catch(() => {
                toast.update('复制失败', 'error', 3000);
            });
        });
    }).catch(error => {
        markdownBody.style.cssText = originalStyle;
        console.error('Screenshot error:', error);
        toast.update('图片生成失败', 'error', 3000);
    });
}

function generateFullHtml(content) {
    const css = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                return '';
            }
        })
        .join('\n');

    const isDark = ['dark', 'solarized', 'nord'].includes(currentTheme);
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown 预览</title>
    <style>
        ${css}
        body {
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
            background: ${isDark ? '#0a0a0a' : '#fafafa'};
            color: ${isDark ? '#f0f0f0' : '#1a1a1a'};
        }
    </style>
</head>
<body class="${currentTheme}-theme">
    <div class="markdown-body">
        ${content}
    </div>
</body>
</html>`;
}

// Toast notification system
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>`,
        error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`,
        loading: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"></path>
        </svg>`
    };

    toast.innerHTML = `
        ${icons[type] || icons.success}
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    let autoCloseTimer = null;

    if (duration > 0) {
        autoCloseTimer = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    return {
        update: (newMessage, newType, newDuration) => {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
            }

            toast.querySelector('span').textContent = newMessage;
            if (newType) {
                toast.className = `toast ${newType} show`;
                toast.querySelector('svg').outerHTML = icons[newType] || icons.success;
            }

            if (newDuration > 0) {
                autoCloseTimer = setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                }, newDuration);
            }
        },
        close: () => {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
            }
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    };
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function saveContent() {
    localStorage.setItem('editorContent', currentContent);
    localStorage.setItem('contentType', currentContentType);
}

function loadSavedContent() {
    const savedContent = localStorage.getItem('editorContent');
    const savedType = localStorage.getItem('contentType');

    if (savedContent) {
        editor.value = savedContent;
        currentContent = savedContent;
    }

    if (savedType) {
        contentTypeSelect.value = savedType;
        currentContentType = savedType;
    }
}

// Loading animation for Mermaid
const originalMermaidRender = mermaid.render;
mermaid.render = function(...args) {
    const loadingToast = showToast('正在渲染图表...', 'loading', 0);

    return originalMermaidRender.apply(this, args).then(result => {
        loadingToast.close();
        return result;
    }).catch(error => {
        loadingToast.update('图表渲染失败', 'error', 3000);
        throw error;
    });
};