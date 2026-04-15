// app.js

// Initialize Mermaid
mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'base',
  themeVariables: {
    primaryColor: '#f0f0f0',
    primaryTextColor: '#2d3436',
    primaryBorderColor: '#4ecdc4',
    lineColor: '#636e72',
    secondaryColor: '#ffe66d',
    tertiaryColor: '#ff6b6b'
  }
});

// Configure Marked to support syntax highlighting via Highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// State
let documentRegistry = [];
let allFiles = []; // flattened list for search
let currentActiveFile = null;

// DOM Elements
const documentNav = document.getElementById('documentNav');
const markdownContent = document.getElementById('markdownContent');
const tocNav = document.getElementById('tocNav');
const sidebarRight = document.getElementById('sidebarRight');
const tocToggle = document.getElementById('tocToggle');
const searchInput = document.getElementById('searchInput');

// Load document registry
async function init() {
  try {
    showLoading();
    const response = await fetch('documents.json');
    const data = await response.json();
    documentRegistry = data.categories.reverse(); // Reverse categories
    
    // Reverse files in each category
    documentRegistry.forEach(cat => {
      cat.files.reverse();
    });

    // Flatten files for search
    allFiles = documentRegistry.reduce((acc, cat) => {
      const filesWithCat = cat.files.map(f => ({...f, categoryName: cat.name}));
      return acc.concat(filesWithCat);
    }, []);

    renderSidebar(documentRegistry);
    hideLoading();
    
    // Load the most recent document by default (first in reversed list)
    if (documentRegistry.length > 0 && documentRegistry[0].files.length > 0) {
      const latestFile = documentRegistry[0].files[0];
      currentActiveFile = latestFile.path;
      loadDocument(latestFile.path);
    } else {
      markdownContent.innerHTML = '<div class="empty-state">Select a document from the sidebar to view.</div>';
    }
    
    // Setup event listeners
    setupEventListeners();

  } catch (error) {
    console.error('Failed to load documents:', error);
    markdownContent.innerHTML = '<div class="empty-state">Failed to load document registry.</div>';
  }
}

function showLoading() {
  markdownContent.innerHTML = '<div class="spinner"></div>';
}

function hideLoading() {
  // handled by content replacement
}

function renderSidebar(categories) {
  documentNav.innerHTML = '';
  
  categories.forEach((cat, index) => {
    const catEl = document.createElement('div');
    catEl.className = 'category';
    
    const catHeader = document.createElement('div');
    catHeader.className = 'category-header active';
    const catEmoji = cat.emoji ? `${cat.emoji} ` : '';
    catHeader.innerHTML = `
      <span>${catEmoji}${cat.name} <span class="badge" style="background:var(--bg-elevated);color:var(--text-muted);">${cat.files.length}</span></span>
      <span class="icon">▼</span>
    `;
    
    const fileList = document.createElement('div');
    fileList.className = 'category-files';
    
    cat.files.forEach(file => {
      const fileEl = document.createElement('div');
      fileEl.className = 'file-item';
      if (currentActiveFile === file.path) {
        fileEl.classList.add('active');
      }
      
      let badgeHtml = '';
      if (file.badge) {
        const badgeClass = file.badge.toLowerCase();
        badgeHtml = `<span class="badge ${badgeClass}">${file.badge}</span>`;
      }
      
      const fEmoji = file.emoji ? `${file.emoji} ` : '📄 ';
      fileEl.innerHTML = `${fEmoji}${file.title} ${badgeHtml}`;
      fileEl.addEventListener('click', () => {
        // Remove active class from all
        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
        fileEl.classList.add('active');
        currentActiveFile = file.path;
        loadDocument(file.path);
      });
      
      fileList.appendChild(fileEl);
    });
    
    catHeader.addEventListener('click', () => {
      fileList.classList.toggle('collapsed');
      const icon = catHeader.querySelector('.icon');
      if (fileList.classList.contains('collapsed')) {
        icon.textContent = '▶';
        catHeader.classList.remove('active');
      } else {
        icon.textContent = '▼';
        catHeader.classList.add('active');
      }
    });

    catEl.appendChild(catHeader);
    catEl.appendChild(fileList);
    documentNav.appendChild(catEl);
  });
}

// Search functionality
function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
      renderSidebar(documentRegistry);
      return;
    }
    
    const filteredCategories = documentRegistry.map(cat => {
      return {
        ...cat,
        files: cat.files.filter(f => f.title.toLowerCase().includes(query))
      }
    }).filter(cat => cat.files.length > 0);
    
    renderSidebar(filteredCategories);
  });

  tocToggle.addEventListener('click', () => {
    sidebarRight.classList.toggle('hidden');
    tocToggle.classList.toggle('active');
  });
}

async function loadDocument(path) {
  showLoading();
  try {
    console.log(`Fetching document: ${path}`);
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    
    // Custom renderer for marked to intercept headers for TOC
    const renderer = new marked.Renderer();
    const toc = [];
    
    renderer.heading = function(text, level, raw) {
      // Handle marked v7+ object argument
      let hText = text;
      let hLevel = level;
      let hRaw = raw;
      
      if (typeof text === 'object') {
        hText = text.text;
        hLevel = text.depth;
        hRaw = text.raw;
      }

      // Robust handling for missing raw text
      const anchorText = (hRaw || hText || '').toString();
      const anchor = anchorText.toLowerCase()
        .replace(/[^\w\\u4e00-\\u9fa5\s-]/g, '')
        .replace(/\s+/g, '-');
      
      toc.push({ level: hLevel, text: hText, anchor });
      return `<h${hLevel} id="${anchor}">${hText}</h${hLevel}>\n`;
    };

    // Override code block rendering
    renderer.code = function(code, language) {
      // Handle marked v7+ object argument
      let content = code;
      let lang = language;
      if (typeof code === 'object') {
        content = code.text;
        lang = code.lang;
      }

      if (lang === 'mermaid') {
        return `<div class="mermaid">${content}</div>`;
      }
      // Simple code block for stability
      return `<div style="position: relative;">
        <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
        <pre><code class="language-${lang || ''}">${content}</code></pre>
      </div>`;
    };

    // Parse markdown with custom renderer
    const tempHtml = marked.parse(markdown, { renderer: renderer });
    
    // Sanitize 
    let cleanHtml = tempHtml;
    if (typeof DOMPurify !== 'undefined') {
      cleanHtml = DOMPurify.sanitize(tempHtml, {
        ADD_TAGS: ['button'],
        ADD_ATTR: ['onclick', 'class', 'style']
      });
    }
    
    markdownContent.innerHTML = cleanHtml;
    
    // Generate TOC
    generateTOC(toc);
    
    // Render Highlight.js
    markdownContent.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el);
    });
    
    // Render Mermaid graphs
    const mermaidDivs = markdownContent.querySelectorAll('.mermaid');
    if (mermaidDivs.length > 0 && typeof mermaid !== 'undefined') {
      mermaidDivs.forEach((div, index) => {
        const id = `mermaid-${Date.now()}-${index}`;
        const content = div.textContent;
        div.innerHTML = ''; // Clear text
        mermaid.render(id, content).then((result) => {
          div.innerHTML = result.svg;
        }).catch(err => {
          console.error('Mermaid render error:', err);
          div.innerHTML = `<pre>Mermaid Error: ${err}</pre>`;
        });
      });
    }

  } catch (error) {
    console.error('Detailed error loading document:', error);
    markdownContent.innerHTML = `
      <div class="empty-state">
        <div style="text-align:center;">
          <h2 style="color:var(--color-primary);">Error</h2>
          <p>Failed to load document: ${path}</p>
          <p style="font-size: 0.8em; color: var(--text-muted);">${error.message}</p>
        </div>
      </div>
    `;
  }
}

function generateTOC(toc) {
  tocNav.innerHTML = '';
  if (toc.length === 0) {
    tocNav.innerHTML = '<div style="color:var(--text-muted);font-size:var(--font-size-sm);">No contents</div>';
    return;
  }
  
  toc.forEach(item => {
    // only show h1, h2, h3
    if(item.level > 3) return;
    
    const link = document.createElement('a');
    link.href = `#${item.anchor}`;
    link.className = `toc-link toc-level-${item.level}`;
    link.textContent = item.text;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(item.anchor);
      if (target) {
        // scroll with offset for header
        const offsetLeft = document.querySelector('.content-area').getBoundingClientRect().top;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    tocNav.appendChild(link);
  });
}

// Global copy function for code blocks
window.copyCode = function(btn) {
  const codeBlock = btn.nextElementSibling;
  const text = codeBlock.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = 'var(--color-secondary)';
    btn.style.color = 'white';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  });
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
