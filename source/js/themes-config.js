/**
 * ================================================================
 * 博客主题预设配色配置文件 (Themes Configuration)
 * ----------------------------------------------------------------
 * 可以在 PRESET_THEMES 列表中任意添加、修改、重命名配色主题：
 * 每个主题包含：
 *   - id: 唯一标识
 *   - name: 主题名称
 *   - colors: 用于在 5:1 长方形中渲染展示的 5 个颜色
 *   - vars: 具体的样式映射变量：
 *       * bgBase: 最底层基底颜色 (调低透明度时透出的颜色)
 *       * accentLight: 边框浅色与微光
 *       * accentBright: 悬停高亮发光、Hover 按钮
 *       * primary: 主链接、滑块滑钮、主要按钮背景
 *       * textMain: 主标题、大字、深色文字
 * ================================================================
 */

window.PRESET_THEMES = [
  {
    id: 'ocean-cyan',
    name: '海洋浅青',
    colors: ['#caf0f8', '#90e0ef', '#00b4d8', '#0077b6', '#03045e'],
    vars: {
      bgBase: '#caf0f8',
      accentLight: '#90e0ef',
      accentBright: '#00b4d8',
      primary: '#0077b6',
      textMain: '#03045e'
    }
  },
  {
    id: 'sakura-pink',
    name: '落樱晨曦',
    colors: ['#fff0f3', '#ffccd5', '#ff758f', '#c9184a', '#590d22'],
    vars: {
      bgBase: '#fff0f3',
      accentLight: '#ffccd5',
      accentBright: '#ff758f',
      primary: '#c9184a',
      textMain: '#590d22'
    }
  },
  {
    id: 'matcha-green',
    name: '青竹抹茶',
    colors: ['#e8f5e9', '#a5d6a7', '#4caf50', '#2e7d32', '#1b5e20'],
    vars: {
      bgBase: '#e8f5e9',
      accentLight: '#a5d6a7',
      accentBright: '#4caf50',
      primary: '#2e7d32',
      textMain: '#1b5e20'
    }
  },
  {
    id: 'sunset-amber',
    name: '日落暖橙',
    colors: ['#fff8e7', '#fed9b7', '#f4a261', '#e76f51', '#264653'],
    vars: {
      bgBase: '#fff8e7',
      accentLight: '#fed9b7',
      accentBright: '#f4a261',
      primary: '#e76f51',
      textMain: '#264653'
    }
  },
  {
    id: 'midnight-purple',
    name: '星夜深紫',
    colors: ['#f3e8ff', '#e9d5ff', '#c084fc', '#9333ea', '#3b0764'],
    vars: {
      bgBase: '#f3e8ff',
      accentLight: '#e9d5ff',
      accentBright: '#c084fc',
      primary: '#9333ea',
      textMain: '#3b0764'
    }
  }
];
