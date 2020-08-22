'use strict';

const Service = require('./base');

class ApplyService extends Service {
    async create(params) {
        const user_id = this.ctx.authUser.id;
        let { friend_id, nickname, lookme, lookhim } = params
        if (user_id == friend_id) {
            return this.error('不可以添加自己');
        }
        let user = await this.app.model.User.findByPk(friend_id);
        if (!user || user.status != 1) {
            return this.error('用户不存在或已被禁用');
        }
        if (await this.app.model.Apply.findOne({
            where: {
                user_id,
                friend_id,
                status: ['pending', 'agree']
            }
        })) {
            return this.error('已经申请过');
        }

        let apply = await this.app.model.Apply.create({
            user_id,
            friend_id,
            lookme,
            lookhim,
            nickname
        });
        if (!apply) {
            return this.error('申请失败');
        }
        return this.success();
    }

    async list(user_id, limit, offset){
        let {app} = this
        let list = await app.model.Apply.findAll({
            where:{
                friend_id:user_id,
            },
            include:[{
                model:app.model.User,
                attributes:['id', 'username', 'nickname', 'avatar']
            }],
            offset,
            limit,
            order:[
                ['id', 'DESC']
            ]
        })
        let count = await app.model.Apply.count({
            where:{
                friend_id:user_id,
                status:'pending'
            }
        })
        return {list, count}
    }

    async handle(id, user_id, params){
        let {app, ctx} = this;
        let apply = await app.model.Apply.findOne({
            where:{id, friend_id:user_id, status:'pending'},
            include:[{model:app.model.User}]
        });
        if (!apply) {
            return this.error('该记录不存在')
        }
        let {status, nickname, lookme, lookhim} = params
        let transaction;
        try{
            transaction = await app.model.transaction();

            await apply.update({
                status
            }, {transaction});

            if (status == 'agree') {
                await app.model.Friend.create({
                    friend_id: user_id,
                    user_id: apply.user_id,
                    nickname: apply.nickname,
                    lookme: apply.lookme,
                    lookhim: apply.lookhim,
                }, {transaction});

                await app.model.Friend.create({
                    friend_id: apply.user_id,
                    user_id: user_id,
                    nickname,
                    lookme,
                    lookhim,
                }, {transaction});
            }

            await transaction.commit();
            if (status == 'agree') {
                let message = {
                    id: (new Date()).getTime(), // 唯一id，后端生成唯一id
                    from_avatar: ctx.authUser.avatar,// 发送者头像
                    from_name: apply.nickname || ctx.authUser.nickname || ctx.authUser.username, // 发送者昵称
                    from_id: user_id, // 发送者id
                    to_id: apply.user_id, // 接收人/群 id
                    to_name: nickname || apply.user.nickname || apply.user.username, // 接收人/群 名称
                    to_avatar: apply.user.avatar, // 接收人/群 头像
                    chat_type: 'user', // 接收类型
                    type: "system",// 消息类型
                    data: "你们已经是好友，可以开始聊天啦", // 消息内容
                    options: {}, // 其他参数
                    create_time: (new Date()).getTime(), // 创建时间
                    isremove: 0, // 是否撤回
                }
                ctx.sendAndSaveMessage(apply.user_id, { ...message });

                message.from_avatar = apply.user.avatar;
                message.from_name = nickname || apply.user.nickname || apply.user.username;
                message.from_id = apply.user.id;

                message.to_avatar = ctx.authUser.avatar;
                message.to_name = apply.nickname || ctx.authUser.nickname || ctx.authUser.username;
                message.to_id = user_id;

                ctx.sendAndSaveMessage(user_id, { ...message });
            }
            return this.success();
        }catch(e) {
            console.log("e:", e)
            await transaction.rollback();
            return this.err(400, e.message)
        }
    }
}

module.exports = ApplyService;
