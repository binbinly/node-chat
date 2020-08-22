'use strict';

const Service = require('./base');

class GroupService extends Service {
    /**
     * 群组信息
     * @param {*} user_id 
     * @param {*} group_id 
     */
    async info(user_id, group_id) {
        let {app} = this
        let group = await app.model.Group.findOne({
            where: {
                status: 1,
                id: group_id
            },
            include: [{
                model: app.model.GroupUser,
                attributes: ['user_id', 'nickname']
            }]
        });
        if (!group) {
            return this.error('该群聊不存在或者已被封禁');
        }
        let index = group.group_users.findIndex(item => item.user_id === user_id);
        if (index === -1) {
            return this.error('你不是该群的成员');
        }
        return this.success(group)
    }
}

module.exports = GroupService;
