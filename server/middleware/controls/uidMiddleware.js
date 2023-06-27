const resWithErr = require("../../helpers/errResponseHelper");

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    if (req.params.id.length != 24) {
        return resWithErr(res, 400, "Неверный формат ID", "Bad Request");
    }
    next();
};
