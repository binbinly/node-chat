'use strict';
const crypto = require('crypto');
const { appendFile } = require('fs');
module.exports = app => {
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    // 配置（重要：一定要配置详细，一定要！！！）
    const User = app.model.define('user', {
        id: {
            type: INTEGER(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: STRING(30),
            allowNull: false,
            defaultValue: '',
            comment: '用户名称',
            unique: true
        },
        nickname: {
            type: STRING(30),
            allowNull: false,
            defaultValue: '',
            comment: '昵称',
        },
        email: {
            type: STRING(160),
            comment: '用户邮箱',
            unique: true
        },
        password: {
            type: STRING(200),
            allowNull: false,
            defaultValue: '',
            set(val) {
                const hmac = crypto.createHash("sha256", app.config.crypto.secret);
                hmac.update(val);
                let hash = hmac.digest("hex");
                this.setDataValue('password', hash);
            }
        },
        avatar: {
            type: STRING(200),
            allowNull: true,
            defaultValue: ''
        },
        phone: {
            type: STRING(20),
            comment: '用户手机',
            unique: true
        },
        sex: {
            type: ENUM,
            values: ['男', '女', '保密'],
            allowNull: true,
            defaultValue: '男',
            comment: '用户性别'
        },
        status: {
            type: INTEGER(1),
            allowNull: false,
            defaultValue: 1,
            comment: '状态'
        },
        sign: {
            type: STRING(200),
            allowNull: true,
            defaultValue: '',
            comment: '个性签名'
        },
        area: {
            type: STRING(200),
            allowNull: true,
            defaultValue: '',
            comment: '地区'
        },
        created_at: DATE,
        updated_at: DATE
    });

    // 定义关联关系
    User.associate = function (model) {
        User.hasMany(app.model.Friend, {
            as: "bfriends", // 当前用户的被好友
            foreignKey: 'friend_id'
        });

        User.hasMany(app.model.Friend, {
            as: "friends", // 当前用户的好友
            foreignKey: 'user_id'
        });

        User.hasMany(app.model.Moment, {
            foreignKey: 'user_id'
        });
    };

    /**
     * 查询用户
     * @param {*} username 
     */
    User.info = async function (username, exclude = []) {
        return await this.findOne({
            where: { username },
            attributes: {
                exclude: exclude.concat(['created_at', 'updated_at'])
            }
        })
    }

    /**
     * 用户是否存在
     * @param {*} username 
     */
    User.exist = async function (username) {
        let c = await this.count({
            where: { username }
        });
        if (c > 0) {
            return true
        }
        return false
    }

    /**
     * 创建用户
     * @param {*} username 
     * @param {*} password 
     */
    User.add = async function (username, password) {
        return await this.create({
            username,
            password
        });
    }

    /**
    * 检查用户密码是否正确
    * @param {*} password 
    * @param {*} hash_password 
    */
    User.checkPassword = function (password, hash_password) {
        const hmac = crypto.createHash('sha256', app.config.crypto.secret);
        hmac.update(password);
        password = hmac.digest('hex');
        if (password === hash_password) {
            return true;
        }
        return false;
    }

    return User;
};