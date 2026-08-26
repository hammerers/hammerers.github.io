'use strict';

hexo.extend.filter.register('after_render:html', function(str) {
  if (typeof str !== 'string') return str;
  const injection = [
    '<link rel="stylesheet" href="/css/custom.css">',
    '<link rel="stylesheet" href="/css/bg-settings.css">',
    '<script src="/js/bg-settings.js" defer></script>'
  ].join('\n  ');

  return str.replace(/<\/head>/i, injection + '\n</head>');
});
