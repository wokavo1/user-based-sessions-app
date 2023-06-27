const resWithErr = require("../../helpers/errResponseHelper");

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    if (!req.params.id) {
        return resWithErr(res, 400, "ID не указан", "Bad Request");
    }
    next();
};
