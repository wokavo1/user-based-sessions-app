const resWithErr = require("../../helpers/errResponseHelper");

const allowed = ["-", "_"];

function allowedToString() {
    let str = "";
    allowed.forEach((c) => {
        str = str + "'" + c + "',";
    });

    str.slice(0, str.length - 1);
    return str;
}

function isInAlphabet(c) {
    const res = (c.toLowerCase() >= "a") & (c.toLowerCase() <= "z");
    //console.log('isInAlphabet: ' + res)
    return res;
}

function isInNumber(c) {
    const res = (c >= "0") & (c <= "9");
    //console.log('isInNumber: ' + res)
    return res;
}

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        let { username } = req.body;
        //console.log(username)
        if (username.length < 4 || username.length > 20) {
            return resWithErr(res, 400, "Имя пользователя должно содержать от 4 до 20 символов", "Bad Request");
        }

        for (let i = 0; i < username.length; i++) {
            //console.log(username[i] + ' >> ')
            //const bool1 = allowed.includes(username[i])
            //console.log('allowed.includes(username[i]): ' + bool1)
            if (!(allowed.includes(username[i]) || isInAlphabet(username[i]) || isInNumber(username[i]))) {
                return resWithErr(
                    res,
                    400,
                    "Имя пользователя может содержать: буквы английского алфавита, цифры и спецсимволы (" + allowedToString() + ")",
                    "Bad Request"
                );
            }
        }
        next();
    } catch (e) {
        return resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
    }
};
