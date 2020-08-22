'use strict';

const Service = require('./base');

class UserService extends Service {

    /**
     * 创建一个用户
     * @param {*} username 
     * @param {*} password 
     */
    async create(params) {
        let { username, password } = params;
        const exist = await this.app.model.User.exist(username);
        if (exist) {
            return false
        }
        return await this.app.model.User.add(username, password);
    }

    /**
     * 好友详情
     */
    async friend(user_id, friend_id){
        let {app} = this;
        // 验证好友是否存在，并且对方没有把你拉黑
        let info = await app.model.Friend.findOne({
            where: {
                user_id: friend_id,
                friend_id: user_id,
                isblack: 0
            },
            include: [{
                model: app.model.User,
                as: "userInfo"
            }, {
                model: app.model.User,
                as: "friendInfo"
            }]
        });
        if (!info) {
            return this.error('对方不存在或者已经把你拉黑');
        }
        // 验证好友是否被禁用
        if (!info.userInfo.status) {
            return this.error('对方已被禁用');
        }
        return this.success(info)
    }
}

module.exports = UserService;
