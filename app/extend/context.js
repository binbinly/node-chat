var qr = require("qr-image");
module.exports = {

    getToken(value) {
        return this.app.jwt.sign(value, this.app.config.jwt.secret);
    },

    checkToken(token) {
        return this.app.jwt.verify(token, this.app.config.jwt.secret);
    },

    async sendAndSaveMessage(to_id, message, msg = "ok") {
        const { app, service } = this;
        let current_user_id = this.authUser.id;

        let pid = await service.cache.get("online_" + to_id);

        if (pid) {
            app.messenger.sendTo(pid, "send", {
                to_id,
                message,
                msg,
            });
            if (msg === "ok") {
                service.cache.setList(
                    `chatlog_${to_id}_${message.chat_type}_${current_user_id}`,
                    message
                );
            }
        } else {
            service.cache.setList("getmessage_" + to_id, { message, msg });
        }
    },

    async send(to_id, message, msg = "ok") {
        const { app, service } = this;
        let current_user_id = this.authUser.id;

        let pid = await service.cache.get("online_" + to_id);

        if (pid) {
            app.messenger.sendTo(pid, "send", { to_id, message, msg });
        }
    },

    qrcode(data) {
        var image = qr.image(data, { size: 10 });
        this.response.type = "image/png";
        this.body = image;
    },

    genId(length) {
        return Number(
            Math.random().toString.substr(3, length) + Date.now()
        ).toString(36);
    },

    async online(user_id) {
        const { service, app } = this;
        let pid = process.pid;
        let opid = await service.cache.get("online_" + user_id);
        if (opid) {
            app.messenger.sendTo(opid, "offline", user_id);
        }
        service.cache.set("online_" + user_id, pid);
    },
};
