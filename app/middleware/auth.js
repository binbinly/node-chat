module.exports = (option, app) => {
    return async (ctx, next) => {
        let token = ctx.header.token || ctx.query.token;
        if (!token) {
            ctx.throw(400, '您没有权限访问该接口');
        }
        let user = {};
        try{
            user = ctx.checkToken(token);
        } catch (error) {
            let fail = error.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
            ctx.throw(400, fail);
        }
        let t = await ctx.service.cache.get('user_' + user.id);
        if (!t || t !== token) {
            ctx.throw(400, 'token 令牌不合法')
        }

        user = await app.model.User.findByPk(user.id);
        if (!user || user.status == 0) {
            ctx.throw(400, '用户不存在或已经被警用')
        }

        ctx.authUser = user;

        await next();
    }
}