'use strict';

const Service = require('egg').Service;

class BaseService extends Service {
    success(data = '') {
        return { suc: true, data }
    }

    error(msg) {
        return { suc: false, msg }
    }
}

module.exports = BaseService;
