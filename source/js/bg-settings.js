(function () {
  'use strict';

  // 默认配置项
  const DEFAULT_SETTINGS = {
    image: '/images/background.jpg',
    mode: 'cover',        // 'cover' | 'contain' | 'repeat'
    mask: 0,              // 0% ~ 90%
    scale: 100,           // 50% ~ 200%
    posX: 50,             // 0% ~ 100%
    posY: 50,             // 0% ~ 100%
    blur: 0               // 0px ~ 40px
  };

  // 读取已保存的设置
  function loadSettings() {
    try {
      const saved = localStorage.getItem('hexo_bg_settings');
      if (saved) {
        return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load bg settings:', e);
    }
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
    
    // 纵向与横向平移变换：直接映射平移坐标，保证任何屏幕分辨率下都能平滑拖拽画面
    const transX = ((settings.posX - 50) * 0.5).toFixed(2); // -25vw ~ +25vw
    const transY = ((settings.posY - 50) * 0.5).toFixed(2); // -25vh ~ +25vh
    root.style.setProperty('--bg-trans-x', `${transX}vw`);
    root.style.setProperty('--bg-trans-y', `${transY}vh`);
    root.style.setProperty('--bg-blur', `${settings.blur}px`);

    if (settings.mode === 'contain') {
      root.style.setProperty('--bg-size', 'contain');
      root.style.setProperty('--bg-repeat', 'no-repeat');
    } else if (settings.mode === 'repeat') {
      root.style.setProperty('--bg-size', 'auto');
      root.style.setProperty('--bg-repeat', 'repeat');
    } else {
      root.style.setProperty('--bg-size', 'cover');
      root.style.setProperty('--bg-repeat', 'no-repeat');
    }
  }

  // 初始化 DOM 结构
  function initDOM() {
    // 1. 注入背景图层与遮罩图层
    if (!document.getElementById('custom-bg-layer')) {
      const bgLayer = document.createElement('div');
      bgLayer.id = 'custom-bg-layer';
      document.body.prepend(bgLayer);
    }
    if (!document.getElementById('custom-bg-mask')) {
      const bgMask = document.createElement('div');
      bgMask.id = 'custom-bg-mask';
      document.body.prepend(bgMask);
    }

    // 2. 注入悬浮设置齿轮按钮
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'bg-setting-toggle';
    toggleBtn.title = '背景与外观设置';
    toggleBtn.innerHTML = '<i class="fa fa-cog"></i>';
    document.body.appendChild(toggleBtn);

    // 3. 注入设置模态面板
    const panel = document.createElement('div');
    panel.id = 'bg-setting-panel';
    panel.innerHTML = `
      <div class="bg-panel-header">
        <h3>应用设置</h3>
        <button class="bg-panel-close" id="bg-close-btn">&times;</button>
      </div>

      <!-- 模式切换: 填充 / 完整 / 平铺 -->
      <div class="bg-panel-modes">
        <button class="bg-mode-btn ${settings.mode === 'cover' ? 'active' : ''}" data-mode="cover">填充</button>
        <button class="bg-mode-btn ${settings.mode === 'contain' ? 'active' : ''}" data-mode="contain">完整</button>
        <button class="bg-mode-btn ${settings.mode === 'repeat' ? 'active' : ''}" data-mode="repeat">平铺</button>
      </div>

      <!-- 遮罩滑块 -->
      <div class="bg-slider-row">
        <span class="bg-slider-label">遮罩</span>
        <input type="range" class="bg-slider-track" id="slider-mask" min="0" max="90" value="${settings.mask}">
        <span class="bg-slider-value" id="val-mask">${settings.mask}%</span>
      </div>

      <!-- 缩放滑块 -->
      <div class="bg-slider-row">
        <span class="bg-slider-label">缩放</span>
        <input type="range" class="bg-slider-track" id="slider-scale" min="50" max="200" value="${settings.scale}">
        <span class="bg-slider-value" id="val-scale">${settings.scale}%</span>
      </div>

      <!-- 横向滑块 -->
      <div class="bg-slider-row">
        <span class="bg-slider-label">横向</span>
        <input type="range" class="bg-slider-track" id="slider-pos-x" min="0" max="100" value="${settings.posX}">
        <span class="bg-slider-value" id="val-pos-x">${settings.posX}%</span>
      </div>

      <!-- 纵向滑块 -->
      <div class="bg-slider-row">
        <span class="bg-slider-label">纵向</span>
        <input type="range" class="bg-slider-track" id="slider-pos-y" min="0" max="100" value="${settings.posY}">
        <span class="bg-slider-value" id="val-pos-y">${settings.posY}%</span>
      </div>

      <!-- 模糊滑块 -->
      <div class="bg-slider-row">
        <span class="bg-slider-label">模糊</span>
        <input type="range" class="bg-slider-track" id="slider-blur" min="0" max="40" value="${settings.blur}">
        <span class="bg-slider-value" id="val-blur">${settings.blur}px</span>
      </div>

      <!-- 底部恢复默认 -->
      <div class="bg-panel-footer">
        <button class="bg-reset-btn" id="bg-reset-btn">恢复默认</button>
      </div>
    `;
    document.body.appendChild(panel);

    // 事件绑定
    bindEvents(toggleBtn, panel);
  }

  function bindEvents(toggleBtn, panel) {
    // 切换面板显隐
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('active');
    });

    document.getElementById('bg-close-btn').addEventListener('click', () => {
      panel.classList.remove('active');
    });

    // 点击外部区域关闭面板
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== toggleBtn) {
        panel.classList.remove('active');
      }
    });

    // 模式切换按钮
    const modeBtns = panel.querySelectorAll('.bg-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        settings.mode = btn.dataset.mode;
        applyStyles();
        saveSettings(settings);
      });
    });

    // 绑定滑块更新
    function bindSlider(id, key, unit, valElemId) {
      const slider = document.getElementById(id);
      const valElem = document.getElementById(valElemId);
      slider.addEventListener('input', () => {
        const val = Number(slider.value);
        settings[key] = val;
        valElem.textContent = val + unit;
        applyStyles();
        saveSettings(settings);
      });
    }

    bindSlider('slider-mask', 'mask', '%', 'val-mask');
    bindSlider('slider-scale', 'scale', '%', 'val-scale');
    bindSlider('slider-pos-x', 'posX', '%', 'val-pos-x');
    bindSlider('slider-pos-y', 'posY', '%', 'val-pos-y');
    bindSlider('slider-blur', 'blur', 'px', 'val-blur');

    // 恢复默认按钮
    document.getElementById('bg-reset-btn').addEventListener('click', () => {
      settings = Object.assign({}, DEFAULT_SETTINGS);
      saveSettings(settings);
      applyStyles();

      // 同步 UI 状态
      document.getElementById('slider-mask').value = settings.mask;
      document.getElementById('val-mask').textContent = settings.mask + '%';
      document.getElementById('slider-scale').value = settings.scale;
      document.getElementById('val-scale').textContent = settings.scale + '%';
      document.getElementById('slider-pos-x').value = settings.posX;
      document.getElementById('val-pos-x').textContent = settings.posX + '%';
      document.getElementById('slider-pos-y').value = settings.posY;
      document.getElementById('val-pos-y').textContent = settings.posY + '%';
      document.getElementById('slider-blur').value = settings.blur;
      document.getElementById('val-blur').textContent = settings.blur + 'px';

      modeBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.mode === settings.mode);
      });
    });
  }

  // 页面加载完成后立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyStyles();
      initDOM();
    });
  } else {
    applyStyles();
    initDOM();
  }
})();
