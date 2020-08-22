'use strict';

const Controller = require('./base');

class ApplyController extends Controller {
    async friend() {
        const { ctx, app, service } = this;
        console.log(ctx.request.body)
        ctx.validate({
            friend_id: { type: 'int', rquired: true },
            nickname: { type: 'string' },
            lookme: { type: 'enum', values: [0, 1] },
            lookhim: { type: 'enum', values: [0, 1] }
        });
        let ret = await service.apply.create(ctx.request.body);
        if (ret.suc === false) {
            return this.error(400, ret.msg)
        }
        return this.success()
    }

    async list() {
        const { ctx, service } = this;
        let user_id = ctx.authUser.id;
        let data = await service.apply.list(user_id, this.PAGE_SIZE, this.getOffset())
        return this.success(data)
    }

    async handle() {
        const { ctx, service } = this;
        let user_id = ctx.authUser.id;
        let id = parseInt(ctx.params.id)

        ctx.validate({
            nickname: { type: 'string', required: true },
            status: { type: 'enum', values: ['refuse', 'agree', 'ignore'] },
            lookme: { type: 'enum', values: [0, 1] },
            lookhim: { type: 'enum', values: [0, 1] }
        })
        let ret = await service.apply.handle(id, user_id, ctx.request.body);
        if (ret.suc === false) {
            return this.error(400, ret.msg)
        }
        this.success()
    }
}

module.exports = ApplyController;
