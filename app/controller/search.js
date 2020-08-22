'use strict';

const Controller = require('./base');

class SearchController extends Controller {
    async user() {
        const { ctx, app } = this;
        ctx.validate({
            keyword: { type: 'string', required: true }
        });
        let { keyword } = ctx.request.body;
        let data = await app.model.User.info(keyword, ['password']);

        return this.success(data)
    }
}

module.exports = SearchController;
