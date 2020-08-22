const crypto = require('crypto');

module.exports = {
    /**
     * 检查用户密码是否正确
     * @param {*} password 
     * @param {*} hash_password 
     */
    checkPassword(password, hash_password) {
        const hmac = crypto.createHash('sha256', this.app.config.crypto.secret);
        hmac.update(password);
        password = hmac.digest('hex');
        if (password === hash_password) {
            return true;
        }
        return false;
    },
}