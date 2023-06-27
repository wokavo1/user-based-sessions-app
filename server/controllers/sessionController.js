const resWithErr = require("../helpers/errResponseHelper.js");
const User = require("../models/User.js");
const { Session } = require("./classes/sessionRelatedClasses.js");
//const WebSocket = require("ws")
//const {WSS_PORT, secret} = require("../config.js")
//const jwt = require('jsonwebtoken')
const WSS = require("./classes/WSServerClass.js");

const shared_data = {
    SESSIONS: [],
};

const wsServerClass = new WSS(shared_data);

class sessionController {
    async inviteUserToSession(req, res) {
        try {
            const id = req.params.id;
            const session = shared_data.SESSIONS.find((s) => {
                return s.id == id;
            });

            if (!session) return resWithErr(res, 400, "Сессии с указанным ID не существует", "Bad Request");

            if (!session.admin_id == req.user.id) return resWithErr(res, 403, "Вы не являетесь администратором сессии", "Forbidden");

            const username = req.body.username;
            //console.log(username)
            const user = await User.findOne({ username: { $eq: username } });
            //console.log(user)
            if (!user) {
                return resWithErr(res, 400, "Пользователь с указанным именем не найден", "Bad Request");
            }

            if (!session.addUser(user)) return resWithErr(res, 400, "Пользователь с указанным именем уже добавлен в сессию", "Bad Request");

            res.status(200).json({ message: "Пользователь приглашен в сессию" });

            wsServerClass.sessionBroadcast(
                id,
                JSON.stringify({
                    action: "user update",
                    data: session.users,
                    admin: session.admin,
                })
            );
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }

    async createSession(req, res) {
        //console.log(req.user)

        try {
            const id = Date.now();
            const admin = await User.findById(req.user.id);
            const session = new Session(id, req.user.id, admin);
            shared_data.SESSIONS.push(session);

            res.status(200).json({ session_id: id });
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }

    getSessionData(req, res) {
        try {
            const id = req.params.id;
            const session = shared_data.SESSIONS.find((s) => {
                return s.id == id;
            });

            if (!session) return resWithErr(res, 400, "Сессии с указанным ID не существует", "Bad Request");
            //console.log(session)
            if (
                !(
                    session.admin_id == req.user.id ||
                    session.users.find((u) => {
                        return u.id == req.user.id;
                    })
                )
            )
                return resWithErr(res, 400, "Вы не приглашены в сессию", "Bad Request");

            res.status(200).json({ data: session.data });
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }

    getSessions(req, res) {
        try {
            const user = req.user;
            const res_data = shared_data.SESSIONS.filter((s) => {
                return s.admin_id == user.id;
            }).map(({ id }) => ({ id: id }));
            res.status(200).json(res_data);
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }

    setSessionKey(req, res) {
        try {
            //console.log(req.body)
            const id = req.params.id;
            const key = req.body.key;
            const data = req.body.data;

            if (!id) return resWithErr(res, 400, "ID сессии не указан", "Bad Request");

            const session = shared_data.SESSIONS.find((s) => {
                return s.id == id;
            });
            if (!session) return resWithErr(res, 400, "Сессии с указанным ID не существует", "Bad Request");

            if (
                !(
                    session.admin_id == req.user.id ||
                    session.users.find((u) => {
                        return u.id == req.user.id;
                    })
                )
            )
                return resWithErr(res, 400, "Вы не приглашены в сессию", "Bad Request");

            if (!key) return resWithErr(res, 400, "Не указан ключ значения", "Bad Request");

            session.data[key] = data;

            res.status(200).json({ session });
        } catch (e) {
            resWithErr(res, 500, "Внутренняя ошибка сервера", "Internal", e);
        }
    }
}

module.exports = new sessionController();
