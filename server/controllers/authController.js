const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("../config.js");
const resWithErr = require("../helpers/errResponseHelper.js");

const generateAccessToken = (id) => {
    const payload = {
        id,
    };
    return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return resWithErr(res, 400, "Ошибка при регистрации", "Bad Request");
            }
            const { username, password } = req.body;
            const candidate = await User.findOne({ username });
            if (candidate) {
                return resWithErr(res, 400, "Пользователь с таким именем уже существует", "Bad Request");
            }
            const hashPass = bcrypt.hashSync(password, 7);
            const user = new User({ username, password: hashPass });
            await user.save();
            return res.json({ message: "Пользователь успешно зарегистрирован" });
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }

    async login(req, res) {
        try {
            //('someone is trying to login...')
            const { username, password } = req.body;
            //console.log(req.body)
            const user = await User.findOne({ username });
            if (!user) {
                return resWithErr(res, 400, "Пользователь с именем " + username + " не найден", "Bad Request");
            }

            const validPass = bcrypt.compareSync(password, user.password);
            if (!validPass) {
                return resWithErr(res, 400, "Введен неверный пароль", "Bad Request");
            }
            const token = generateAccessToken(user._id);
            //console.log('success!')
            return res.json({ token });
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }
}

module.exports = new authController();
