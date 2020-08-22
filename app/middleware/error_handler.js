module.exports = (option, app) => {
    return async function errorHandler(ctx, next) {
        try {
            await next();

            if (ctx.status === 404 && !ctx.body) {
                ctx.body = {
                    msg: 'fail',
                    data: '404错误'
                }
            }
        } catch (err) {
            const status = err.status || 500;
            let error = status === 500 && app.config.env === 'prod'
                ? 'Internal server error' : err.message;
            // 参数验证异常
            if (status === 422) {
                console.log(err)
                ctx.body = {
                    msg: err.errors[0].message ? err.errors[0].message : err.message
                };
            } else {
                app.emit('error', err, ctx);

                ctx.body = {
                    msg: 'fail',
                    data: error
                };
            }
            ctx.status = status;
        }
    }
}