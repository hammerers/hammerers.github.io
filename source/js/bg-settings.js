(function () {
  'use strict';

  // 默认配置项
  const DEFAULT_SETTINGS = {
    image: '/images/background.gif',
    mode: 'cover',        // 'cover' | 'contain' | 'repeat'
    mask: 0,              // 0% ~ 90%
    scale: 100,           // 50% ~ 200%
    posX: 50,             // 0% ~ 100%
    posY: 50,             // 0% ~ 100%
    blur: 0               // 0px ~ 40px
  };

  // 读取已保存的设置 (滑块与模式记忆持久化，图片路径以当前 DEFAULT_SETTINGS.image 配置为主)
  function loadSettings() {
    try {
      const saved = localStorage.getItem('hexo_bg_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Object.assign({}, DEFAULT_SETTINGS, parsed, { image: DEFAULT_SETTINGS.image });
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  // 保存设置到 localStorage
  function saveSettings(settings) {
    try {
      localStorage.setItem('hexo_bg_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  let settings = loadSettings();

  // 应用 CSS 变量到网页根节点
  function applyStyles() {
    const root = document.documentElement;
    root.style.setProperty('--bg-image', `url("${settings.image}")`);
    root.style.setProperty('--bg-mask-opacity', (settings.mask / 100).toString());
    root.style.setProperty('--bg-scale', (settings.scale / 100).toString());
    root.style.setProperty('--bg-trans-x', `${(settings.posX - 50) * 0.5}vw`);
    root.style.setProperty('--bg-trans-y', `${(settings.posY - 50) * 0.5}vh`);
    root.style.setProperty('--bg-blur', `${settings.blur}px`);

    if (settings.mode === 'repeat') {
      root.style.setProperty('--bg-repeat', 'repeat');
      root.style.setProperty('--bg-size', 'auto');
    } else if (settings.mode === 'contain') {
      root.style.setProperty('--bg-repeat', 'no-repeat');
      root.style.setProperty('--bg-size', 'contain');
    } else {
      root.style.setProperty('--bg-repeat', 'no-repeat');
      root.style.setProperty('--bg-size', 'cover');
    }
  }

  // 初始化 DOM 结构
  function initDOM() {
    // 1. 注入全屏背景层和遮罩层
    if (!document.getElementById('custom-bg-layer')) {
      const bgLayer = document.createElement('div');
      bgLayer.id = 'custom-bg-layer';
      document.body.appendChild(bgLayer);
    }
    if (!document.getElementById('custom-bg-mask')) {
      const bgMask = document.createElement('div');
      bgMask.id = 'custom-bg-mask';
      document.body.appendChild(bgMask);
    }

    // 2. 注入顶部导航栏菜单项中的设置按钮
    function injectTopNavButton() {
      if (document.getElementById('top-nav-settings-btn')) return;
      const menu = document.querySelector('ul.main-menu.menu') || document.querySelector('.site-nav');
      if (menu) {
        const li = document.createElement('li');
        li.className = 'menu-item menu-item-settings';
        li.innerHTML = '<a href="javascript:void(0);" id="top-nav-settings-btn" rel="section"><i class="fa fa-cog fa-fw"></i> 设置</a>';
        menu.appendChild(li);

        li.querySelector('#top-nav-settings-btn').addEventListener('click', (e) => {
          e.preventDefault();
          toggleDrawer();
        });
      }
    }

    // 3. 注入右侧垂直长条抽屉与遮罩
    if (!document.getElementById('bg-settings-drawer')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'bg-settings-backdrop';
      document.body.appendChild(backdrop);

      const drawer = document.createElement('div');
      drawer.id = 'bg-settings-drawer';
      drawer.innerHTML = `
        <div class="drawer-header">
          <div class="drawer-title"><i class="fa fa-sliders-h"></i> 设置</div>
          <button id="drawer-close-btn" class="drawer-close-btn" title="关闭">✕</button>
        </div>

        <div class="drawer-content">
          <!-- 填充模式分段选择器 -->
          <div class="drawer-section">
            <label class="drawer-section-title">填充模式</label>
            <div class="drawer-mode-group">
              <button class="drawer-mode-btn ${settings.mode === 'cover' ? 'active' : ''}" data-mode="cover">
                <i class="fa fa-expand"></i> 填充
              </button>
              <button class="drawer-mode-btn ${settings.mode === 'contain' ? 'active' : ''}" data-mode="contain">
                <i class="fa fa-compress"></i> 完整
              </button>
              <button class="drawer-mode-btn ${settings.mode === 'repeat' ? 'active' : ''}" data-mode="repeat">
                <i class="fa fa-th"></i> 平铺
              </button>
            </div>
          </div>

          <!-- 5 项调节滑块 (单行横向排布：icon、名称、可拉动滑块、数值) -->
          <div class="drawer-section">
            <label class="drawer-section-title">参数调节</label>
            
            <div class="drawer-slider-row">
              <i class="slider-icon fa fa-adjust"></i>
              <span class="slider-name">遮罩</span>
              <input type="range" id="input-mask" class="drawer-slider" min="0" max="90" value="${settings.mask}">
              <span class="slider-value" id="val-mask">${settings.mask}%</span>
            </div>

            <div class="drawer-slider-row">
              <i class="slider-icon fa fa-search-plus"></i>
              <span class="slider-name">缩放</span>
              <input type="range" id="input-scale" class="drawer-slider" min="50" max="200" value="${settings.scale}">
              <span class="slider-value" id="val-scale">${settings.scale}%</span>
            </div>

            <div class="drawer-slider-row">
              <i class="slider-icon fa fa-arrows-alt-h"></i>
              <span class="slider-name">横向</span>
              <input type="range" id="input-pos-x" class="drawer-slider" min="0" max="100" value="${settings.posX}">
              <span class="slider-value" id="val-pos-x">${settings.posX}%</span>
            </div>

            <div class="drawer-slider-row">
              <i class="slider-icon fa fa-arrows-alt-v"></i>
              <span class="slider-name">纵向</span>
              <input type="range" id="input-pos-y" class="drawer-slider" min="0" max="100" value="${settings.posY}">
              <span class="slider-value" id="val-pos-y">${settings.posY}%</span>
            </div>

            <div class="drawer-slider-row">
              <i class="slider-icon fa fa-tint"></i>
              <span class="slider-name">模糊</span>
              <input type="range" id="input-blur" class="drawer-slider" min="0" max="40" value="${settings.blur}">
              <span class="slider-value" id="val-blur">${settings.blur}px</span>
            </div>
          </div>
        </div>

        <!-- 底部重置 -->
        <div class="drawer-footer">
          <button id="drawer-reset-btn" class="drawer-reset-btn">
            <i class="fa fa-redo-alt"></i> 重置
          </button>
        </div>
      `;
      document.body.appendChild(drawer);

      // 事件绑定
      backdrop.addEventListener('click', closeDrawer);
      document.getElementById('drawer-close-btn').addEventListener('click', closeDrawer);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
      });

      // 绑定模式按钮
      const modeBtns = drawer.querySelectorAll('.drawer-mode-btn');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          settings.mode = btn.dataset.mode;
          modeBtns.forEach(b => b.classList.toggle('active', b === btn));
          saveSettings(settings);
          applyStyles();
        });
      });

      // 绑定滑块事件
      function bindSlider(id, key, unit, valId) {
        const input = document.getElementById(id);
        const valElem = document.getElementById(valId);
        input.addEventListener('input', (e) => {
          const v = parseInt(e.target.value, 10);
          settings[key] = v;
          valElem.textContent = v + unit;
          saveSettings(settings);
          applyStyles();
        });
      }

      bindSlider('input-mask', 'mask', '%', 'val-mask');
      bindSlider('input-scale', 'scale', '%', 'val-scale');
      bindSlider('input-pos-x', 'posX', '%', 'val-pos-x');
      bindSlider('input-pos-y', 'posY', '%', 'val-pos-y');
      bindSlider('input-blur', 'blur', 'px', 'val-blur');

      // 重置按钮
      document.getElementById('drawer-reset-btn').addEventListener('click', () => {
        settings = Object.assign({}, DEFAULT_SETTINGS);
        saveSettings(settings);
        applyStyles();

        document.getElementById('input-mask').value = settings.mask;
        document.getElementById('val-mask').textContent = settings.mask + '%';
        document.getElementById('input-scale').value = settings.scale;
        document.getElementById('val-scale').textContent = settings.scale + '%';
        document.getElementById('input-pos-x').value = settings.posX;
        document.getElementById('val-pos-x').textContent = settings.posX + '%';
        document.getElementById('input-pos-y').value = settings.posY;
        document.getElementById('val-pos-y').textContent = settings.posY + '%';
        document.getElementById('input-blur').value = settings.blur;
        document.getElementById('val-blur').textContent = settings.blur + 'px';

        modeBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.mode === settings.mode);
        });
      });
    }

    injectTopNavButton();
  }

  function toggleDrawer() {
    const drawer = document.getElementById('bg-settings-drawer');
    const backdrop = document.getElementById('bg-settings-backdrop');
    if (drawer && backdrop) {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }
  }

  function openDrawer() {
    const drawer = document.getElementById('bg-settings-drawer');
    const backdrop = document.getElementById('bg-settings-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('bg-settings-drawer');
    const backdrop = document.getElementById('bg-settings-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    }
  }

  // 绑定头像点击跳转 GitHub 个人主页
  function initAvatarLink() {
    const avatar = document.querySelector('.site-author-image');
    if (avatar && !avatar.closest('a')) {
      const link = document.createElement('a');
      link.href = 'https://github.com/hammerers';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = '访问 Hammerers 的 GitHub 主页';
      link.style.display = 'inline-block';
      link.style.borderBottom = 'none';
      avatar.parentNode.insertBefore(link, avatar);
      link.appendChild(avatar);
    }
  }

  // 页面加载完成后立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyStyles();
      initDOM();
      initAvatarLink();
    });
  } else {
    applyStyles();
    initDOM();
    initAvatarLink();
  }
})();
