# koa-safe-redirect

safe redirect middleware for koa 2.x

---

## how to use

### 1. install

```
npm install koa-safe-redirect --save
```
### 2. config url white list

```
// ./config/default.js

module.exports = {
  urlWhiteList: [
    /**
     * allow the hostname end with 'github.com'
     * like 'https://github.com/**'
     */
    /github\.com$/
  ]
}
```

### 3. use as middleware

```
const Koa = require('koa');
const safeRedirect = require('koa-safe-redirect')('urlWhiteList');

const app = new Koa();
app
  .use(safeRedirect)
  .use(async function (ctx, next) {
  // will get 403
  ctx.redirect('https://www.test.com');
  return await next();
});

```

---


## API

### white url strategy

Safe redirect get white list from ./config/{NODE_ENV}.js,same strategy with [node-config](https://github.com/lorenwest/node-config)

If config whitelist is empty or not an array,safe redirect will do nothing

#### RegExp

```
module.exports = {
  urlWhiteList: [
    /**
     * allow the hostname end with 'github.com'
     * like 'https://xxx.github.com/**'
     */
    /github\.com$/
  ]
}
```

#### String

```
module.exports = {
  urlWhiteList: [
    /**
     * only allow the hostname equal 'github.com'
     * like 'https://github.com/**'
     */
    'github.com'
  ]
}
```



### config name


#### use default

Default config name is 'whiteList'

```
// 1. config
module.exports = {
  'whiteList': [
    ...
  ]
}

// 2. init middleware
const safeRedirect = require('koa-safe-redirect')();
```

#### custom

```
// 1. config
module.exports = {
  'xxx': [
    ...
  ]
}

// 2. init middleware
const safeRedirect = require('koa-safe-redirect')('xxx');
```

