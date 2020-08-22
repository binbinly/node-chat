'use strict';

const Controller = require('./base');
const fs = require('mz/fs');
const path = require('path')
class CommonController extends Controller {
    // 上传
    async upload() {
        const {ctx, app} = this;

        // console.log(ctx.request.files);
        if (!ctx.request.files) {
            return this.error(400, '请先选择上传文件');
        }
        const file = ctx.request.files[0];
        let result;
        try {
            result = await ctx.curl(app.config.dfs.url, {
                // 必须指定 method
                method: 'POST',
                data: {
                    output: 'json',
                },
                files: file.filepath,
                // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
                dataType: 'json',
            });
            ctx.body = {
                status: result.status,
                package: result.data,
            };
        } catch (err) {
            return this.error(err)
        } finally {
            await fs.unlink(file.filepath);
        }
        if (ctx.body.status == 200 && ctx.body.package.url) {
            return this.success(ctx.body.package.url)
        }

        this.error(400, '上传失败');
    }
}

module.exports = CommonController;