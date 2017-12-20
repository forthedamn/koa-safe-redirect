
const config = require('config');
const urlUtil = require('url');
require('typeis');

function isValidate(url, whiteList) {
  url = urlUtil.parse(url);

  const hostname = url.hostname;

  // 只是 path 的话，直接 redirect
  if (!hostname) {
    return true;
  }

  return whiteList && whiteList.some && whiteList.some((whiteUrl) => {
    if (!whiteUrl) {
      console.warn('[safa-redirect] url white list should not contain empty url!');
      return false;
    }

    // 如果是字符串，url需要相等
    if (whiteUrl.typeis('String')) {
      return hostname === whiteUrl;
    }

    // 如果是正则
    if (whiteUrl.typeis('RegExp')) {
      return hostname.match(whiteUrl) && hostname.match(whiteUrl).length > 0;
    }

    console.warn('[safa-redirect] config white url is illegal! only string, regexp allowed');

    return false;
  });
}

module.exports = function (configName) {
  return async function safeRedirect(ctx, next) {
    const DEFAULT_CONFIG_NAME = 'whiteList';
    let whiteList = [];

    configName = configName || DEFAULT_CONFIG_NAME;

    if (Array.isArray(config[configName])) {
      // 如果主动设置默认白名单为空，则认为不需要验证
      if (config[configName].length === 0) {
        console.warn('[safa-redirect] whiteList is empty');
        return await next();
      }
      whiteList = config[configName];
    } else {
      console.warn('[safa-redirect] whiteList in config should be an array');
      return await next();
    }
    const temp = ctx.redirect.bind(ctx);

    ctx.redirect = function (url, alt) {
      if ('back' == url) url = ctx.get('Referrer') || alt || '/';
      url = url || '/';

      const isVali = isValidate(url, whiteList);

      if (!isVali) {
        ctx.status = 403;
        return;
      }

      temp(url, alt);
    };

    return await next();
  };
};
