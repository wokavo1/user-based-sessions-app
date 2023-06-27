const resWithErr = require("../helpers/errResponseHelper.js");
const jwt = require("jsonwebtoken");
const { secret } = require("../config.js");

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return resWithErr(res, 401, "Пользователь не авторизован", "Unauthorized");
        }
        const token = auth.split(" ")[1];
        if (!token) {
            return resWithErr(res, 401, "Пользователь не авторизован", "Unauthorized");
        }
        try {
            const decodedData = jwt.verify(token, secret);
            req.user = decodedData;
        } catch (e) {
            return resWithErr(res, 401, "JWT expired", "Unauthorized");
        }
        next();
    } catch (e) {
        return resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
    }
};
