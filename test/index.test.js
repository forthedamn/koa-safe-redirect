require('jest');
const request = require('supertest');
const Koa = require('koa');
const redirect = require('../index')();
const config = require('config');

describe('ctx.redirect', () => {
  const configName = 'whiteList';
  const whiteListTemp = config[configName];
  afterEach(() => {
    config[configName] = whiteListTemp;
  });

  it('should get 302, without white list, when whitelist empty', (done) => {
    const app = new Koa();
    config[configName] = [];
    app
      .use(redirect)
      .use(async function (ctx, next) {
        const url = 'https://www.test.com';
        ctx.redirect(url);
        return await next();
      });
    request(app.listen())
      .post('/')
      .expect(302, done);
  });

  it('should get 302, without white list, when whitelist is not array', (done) => {
    const app = new Koa();
    config[configName] = {};
    app
      .use(redirect)
      .use(async function (ctx, next) {
        const url = 'https://www.test.com';
        ctx.redirect(url);
        return await next();
      });
    request(app.listen())
      .post('/')
      .expect(302, done);
  });

  it('should be safe redirect, and get 302', (done) => {
    const app = new Koa();
    app
      .use(redirect)
      .use(async function (ctx, next) {
        const url = undefined;
        ctx.redirect(url);
        expect(ctx.response.header.location).toEqual('/');
        expect(ctx.response.status).toEqual(302);
        return await next();
      })
      .use(async function (ctx, next) {
        const url = '/get';
        ctx.redirect(url);
        expect(ctx.response.header.location).toEqual('/get');
        expect(ctx.response.status).toEqual(302);
        return await next();
      })
      .use(async function (ctx, next) {
        const url = 'https://meituan.com';
        ctx.redirect(url);
        expect(ctx.response.header.location).toEqual(url);
        expect(ctx.response.status).toEqual(302);
        return await next();
      })
      .use(async function (ctx, next) {
        const url = 'https://meituan.com';
        ctx.redirect('back', url);
        expect(ctx.response.header.location).toEqual(url);
        expect(ctx.response.status).toEqual(302);
        return await next();
      })
      .use(async function (ctx, next) {
        const url = undefined;
        ctx.redirect('back', url);
        expect(ctx.response.header.location).toEqual('/');
        expect(ctx.response.status).toEqual(302);
        return await next();
      })
      .use(async function (ctx, next) {
        const url = 'https://erp.sankuai.com';
        ctx.redirect(url);
        expect(ctx.response.header.location).toEqual('https://erp.sankuai.com');
        return await next();
      });
    request(app.listen())
      .get('/')
      .expect(302, done);
  });

  it('should get 302 with Referrer', (done) => {
    const app = new Koa();
    app
      .use(redirect)
      .use(async function (ctx, next) {
        ctx.redirect('back');
        expect(ctx.response.header.location).toEqual('https://erp.sankuai.com');
        return await next();
      });
    request(app.listen())
      .get('/')
      .set('Referrer', 'https://erp.sankuai.com')
      .expect(302, done);
  });

  it('should get 403', (done) => {
    const app = new Koa();
    app
      .use(redirect)
      .use(async function (ctx, next) {
        const url = 'https://www.test.com';
        ctx.redirect(url);
        expect(ctx.response.status).toEqual(403);
        return await next();
      });
    request(app.listen())
      .post('/')
      .expect(403, done);
  });
});
