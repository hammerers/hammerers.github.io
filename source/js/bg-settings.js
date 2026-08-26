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
    
    // 纵向与横向平移变换：直接映射平移坐标，在任何屏幕分辨率下都能平滑拖拽画面
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

    // 2. 注入圆形转盘容器 (Hover 感应区 + 中心齿轮 + 顺时针旋转转盘)
    const dialContainer = document.createElement('div');
    dialContainer.id = 'bg-dial-container';
    dialContainer.innerHTML = `
      <!-- 中心齿轮按钮 (内圆核心，贴齐左下角 0,0) -->
      <div id="bg-dial-trigger" title="背景外观设置">
        <i class="fa fa-cog"></i>
      </div>

      <!-- 顺时针弹出 / 逆时针收回 纯射线罗盘扇盘 -->
      <div id="bg-dial-wheel">
        <!-- 最外环圆弧快捷按钮 (紧贴最外环空白弧线) -->
        <div class="dial-arc-item dial-arc-reset">
          <button class="dial-arc-btn dial-arc-reset-btn" id="dial-reset-btn" title="恢复默认设置">重置</button>
        </div>
        <div class="dial-arc-item dial-arc-cover">
          <button class="dial-arc-btn ${settings.mode === 'cover' ? 'active' : ''}" data-mode="cover">填充</button>
        </div>
        <div class="dial-arc-item dial-arc-contain">
          <button class="dial-arc-btn ${settings.mode === 'contain' ? 'active' : ''}" data-mode="contain">完整</button>
        </div>
        <div class="dial-arc-item dial-arc-repeat">
          <button class="dial-arc-btn ${settings.mode === 'repeat' ? 'active' : ''}" data-mode="repeat">平铺</button>
        </div>

        <!-- 5 根放射线滑块 (射线连接内圆与外圆环) -->
        <!-- 射线 1: 遮罩 (72°) -->
        <div class="dial-ray dial-ray-mask">
          <span class="dial-ray-label">遮罩</span>
          <input type="range" class="dial-ray-track" id="dial-mask" min="0" max="90" value="${settings.mask}">
          <span class="dial-ray-val" id="dial-val-mask">${settings.mask}%</span>
        </div>

        <!-- 射线 2: 缩放 (57°) -->
        <div class="dial-ray dial-ray-scale">
          <span class="dial-ray-label">缩放</span>
          <input type="range" class="dial-ray-track" id="dial-scale" min="50" max="200" value="${settings.scale}">
          <span class="dial-ray-val" id="dial-val-scale">${settings.scale}%</span>
        </div>

        <!-- 射线 3: 横向 (42°) -->
        <div class="dial-ray dial-ray-posx">
          <span class="dial-ray-label">横向</span>
          <input type="range" class="dial-ray-track" id="dial-pos-x" min="0" max="100" value="${settings.posX}">
          <span class="dial-ray-val" id="dial-val-pos-x">${settings.posX}%</span>
        </div>

        <!-- 射线 4: 纵向 (27°) -->
        <div class="dial-ray dial-ray-posy">
          <span class="dial-ray-label">纵向</span>
          <input type="range" class="dial-ray-track" id="dial-pos-y" min="0" max="100" value="${settings.posY}">
          <span class="dial-ray-val" id="dial-val-pos-y">${settings.posY}%</span>
        </div>

        <!-- 射线 5: 模糊 (12°) -->
        <div class="dial-ray dial-ray-blur">
          <span class="dial-ray-label">模糊</span>
          <input type="range" class="dial-ray-track" id="dial-blur" min="0" max="40" value="${settings.blur}">
          <span class="dial-ray-val" id="dial-val-blur">${settings.blur}px</span>
        </div>
      </div>
    `;
    document.body.appendChild(dialContainer);

    bindEvents(dialContainer);
  }

  function bindEvents(container) {
    const wheel = document.getElementById('bg-dial-wheel');

    // 模式切换按钮
    const modeBtns = wheel.querySelectorAll('.dial-arc-btn:not(.dial-arc-reset-btn)');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        settings.mode = btn.dataset.mode;
        applyStyles();
        saveSettings(settings);
      });
    });

    // 绑定滑块
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

    bindSlider('dial-mask', 'mask', '%', 'dial-val-mask');
    bindSlider('dial-scale', 'scale', '%', 'dial-val-scale');
    bindSlider('dial-pos-x', 'posX', '%', 'dial-val-pos-x');
    bindSlider('dial-pos-y', 'posY', '%', 'dial-val-pos-y');
    bindSlider('dial-blur', 'blur', 'px', 'dial-val-blur');

    // 重置按钮
    document.getElementById('dial-reset-btn').addEventListener('click', () => {
      settings = Object.assign({}, DEFAULT_SETTINGS);
      saveSettings(settings);
      applyStyles();

      document.getElementById('dial-mask').value = settings.mask;
      document.getElementById('dial-val-mask').textContent = settings.mask + '%';
      document.getElementById('dial-scale').value = settings.scale;
      document.getElementById('dial-val-scale').textContent = settings.scale + '%';
      document.getElementById('dial-pos-x').value = settings.posX;
      document.getElementById('dial-val-pos-x').textContent = settings.posX + '%';
      document.getElementById('dial-pos-y').value = settings.posY;
      document.getElementById('dial-val-pos-y').textContent = settings.posY + '%';
      document.getElementById('dial-blur').value = settings.blur;
      document.getElementById('dial-val-blur').textContent = settings.blur + 'px';

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
