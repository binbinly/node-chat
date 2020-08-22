'use strict';

const Controller = require('./base');

class UserController extends Controller {
    async reg() {
        let { ctx } = this;

        ctx.validate({
            username: { type: 'string', required: true, min: 5, max: 20 },
            password: { type: 'password', required: true, rmin: 6, max: 20 },
            repassword: { type: 'password', compare: 'password', required: true }
        });

        const user = await ctx.service.user.create(ctx.request.body);
        if (user) {
            this.success()
        } else {
            this.error(500, '注册失败')
        }
    }

    async login() {
        const { ctx, app } = this;
        ctx.validate({
            username: { type: 'string', required: true },
            password: { type: 'string', required: true }
        });
        let { username, password } = ctx.request.body;
        const user = await ctx.model.User.info(username)
        if (!user) {
            return this.error(400, '用户不存在')
        }
        if (user.status != 1) {
            return this.error(400, '用户已被禁用')
        }
        if (!ctx.helper.checkPassword(password, user.password)) {
            return this.error(400, '用户名密码错误');
        }

        let u = {}
        u.username = user.username;
        u.id = user.id;
        u.nickname = user.nickname;
        u.avatar = user.avater;
        u.sex = user.sex;
        u.sign = user.sign;
        const token = ctx.getToken(u);
        u.token = token;
        // 加入缓存中
        if (!await this.service.cache.set('user_' + user.id, token)) {
            return this.error(400, '登录失败');
        }
        return this.success(u);
    }

    async logout() {
        const { ctx, service } = this;
        let current_user_id = ctx.authUser.id;
        if (! await service.cache.remove('user_' + current_user_id)) {
            return this.error(400, '退出登录成功')
        }
        this.success()
    }

    async qrcode() {
        const { ctx } = this;
        ctx.qrcode(JSON.stringify({
            id: ctx.params.id,
            type: 'user'
        }))
    }

    async update() {
        const { ctx } = this;
        ctx.validate({
            avatar: { type: 'url', required: false },
            nickname: { type: 'string', required: false }
        });
        let { avatar, nickname } = ctx.request.body;
        ctx.authUser.avatar = avatar;
        ctx.authUser.nickname = nickname;
        await ctx.authUser.save();

        return this.success();
    }
}

module.exports = UserController;
