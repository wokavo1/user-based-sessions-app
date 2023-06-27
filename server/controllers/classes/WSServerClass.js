const WebSocket = require("ws");
const { WSS_PORT, secret } = require("../../config.js");
const User = require("../../models/User.js");
const jwt = require("jsonwebtoken");

module.exports = class WSS {
    constructor(shared_data) {
        this.shared_data = shared_data;
        this.initWSS();
    }

    sessionBroadcast = (session_id, broadcast_message) => {
        this.wsServer.clients.forEach((client) => {
            if (client.session_id == session_id) {
                client.send(broadcast_message);
            }
        });
    };

    onSessionClose = (session_id) => {
        this.wsServer.clients.forEach((client) => {
            if (client.session_id == session_id) {
                client.close();
            }
        });
    };

    initWSS() {
        //console.log("FROM WSS initWSS: this.shared_data.SESSIONS: ", this.shared_data.SESSIONS )

        this.wsServer = new WebSocket.Server({ port: WSS_PORT }, () => {
            console.log("websocket server started on port " + WSS_PORT);
        });

        this.wsServer.on("connection", (wsClient) => {
            //console.log('Новый пользователь -> ', wsClient);
            wsClient.on("message", async (message) => {
                /* обработчик сообщений от клиента */
                const msg = JSON.parse(message);
                switch (msg.action) {
                    case "connect session":
                        {
                            const session = this.shared_data.SESSIONS.find((s) => {
                                return s.id == msg.data.session_id;
                            });
                            if (!session) {
                                return wsClient.close();
                            }

                            //console.log(msg.data.token)
                            let user;
                            try {
                                user = jwt.verify(msg.data.token, secret);
                            } catch (e) {
                                //console.log('bad jwt')
                                wsClient.close();
                            }

                            const userfromdb = await User.findById(user.id);
                            //console.log('userfromdb :: ',userfromdb)
                            const userfromsession = session.users.find((u) => {
                                return u.id == user.id;
                            });

                            if (user.id == session.admin_id) {
                                wsClient.session_id = msg.data.session_id;
                                wsClient.user_id = userfromdb._id;
                                wsClient.session = session;
                                wsClient.user = { id: userfromdb._id, username: userfromdb.username };
                                //console.log('admin joined wss session ' + wsClient.session_id)
                                wsClient.send(
                                    JSON.stringify({
                                        action: "session data",
                                        data: wsClient.session.data,
                                    })
                                );
                                this.sessionBroadcast(
                                    wsClient.session_id,
                                    JSON.stringify({
                                        action: "user update",
                                        data: wsClient.session.users,
                                        admin: wsClient.session.admin,
                                    })
                                );
                                wsClient.send(
                                    JSON.stringify({
                                        action: "you are an admin harry",
                                    })
                                );
                                return;
                            }

                            if (userfromsession) {
                                wsClient.session_id = msg.data.session_id;
                                wsClient.user_id = userfromdb._id;
                                wsClient.session = session;
                                wsClient.user = userfromsession;
                                //console.log('user joined wss session ' + wsClient.session_id)
                                wsClient.send(
                                    JSON.stringify({
                                        action: "session data",
                                        data: wsClient.session.data,
                                    })
                                );
                                this.sessionBroadcast(
                                    wsClient.session_id,
                                    JSON.stringify({
                                        action: "user update",
                                        data: wsClient.session.users,
                                        admin: wsClient.session.admin,
                                    })
                                );
                                return;
                            }

                            //console.log('bad wss session join')
                            wsClient.close();
                        }
                        break;

                    case "get data":
                        {
                            //const session = this.shared_data.SESSIONS.find((s)=>{return s.id == wsClient.session_id})
                            //console.log('WSS :: session data -> ', session)
                            if (wsClient.session) {
                                wsClient.send(
                                    JSON.stringify({
                                        action: "session data",
                                        data: wsClient.session.data,
                                        users: wsClient.session.users,
                                    })
                                );
                                return;
                            }
                            wsClient.close();
                        }
                        break;

                    case "edit key":
                        {
                            if (wsClient.session) {
                                if (wsClient.session.admin_id == wsClient.user_id || wsClient.user.permissions.canEdit) {
                                    wsClient.session.data[msg.data.key] = msg.data.value;
                                    this.sessionBroadcast(
                                        wsClient.session.id,
                                        JSON.stringify({
                                            action: "key changed",
                                            data: msg.data,
                                        })
                                    );
                                    return;
                                }
                            }

                            wsClient.send(
                                JSON.stringify({
                                    action: "reject",
                                })
                            );
                        }
                        break;

                    case "delete key":
                        {
                            if (wsClient.session) {
                                if (wsClient.session.admin_id == wsClient.user_id || wsClient.user.permissions.canDelete) {
                                    delete wsClient.session.data[msg.data.key];
                                    this.sessionBroadcast(
                                        wsClient.session.id,
                                        JSON.stringify({
                                            action: "key deleted",
                                            data: msg.data,
                                        })
                                    );
                                    return;
                                }
                            }

                            wsClient.send(
                                JSON.stringify({
                                    action: "reject",
                                })
                            );
                        }
                        break;

                    case "user kicked":
                        {
                            if (wsClient.session) {
                                if (wsClient.session.admin_id == wsClient.user_id) {
                                    wsClient.session.users = wsClient.session.users.filter((u) => {
                                        return u.id != msg.data.id;
                                    });

                                    this.wsServer.clients.forEach((c) => {
                                        if (c.user_id == msg.data.id && c.session_id == wsClient.session_id) {
                                            c.close();
                                        }
                                    });

                                    this.sessionBroadcast(
                                        wsClient.session_id,
                                        JSON.stringify({
                                            action: "user update",
                                            data: wsClient.session.users,
                                            admin: wsClient.session.admin,
                                        })
                                    );
                                }
                            }
                        }
                        break;

                    case "user update":
                        {
                            if (wsClient.session) {
                                if (wsClient.session.admin_id == wsClient.user_id) {
                                    wsClient.session.users.find((u) => u.id == msg.data.id).permissions = msg.data.permissions;
                                    this.sessionBroadcast(
                                        wsClient.session_id,
                                        JSON.stringify({
                                            action: "user update",
                                            data: wsClient.session.users,
                                            admin: wsClient.session.admin,
                                        })
                                    );
                                }
                            }
                        }
                        break;

                    case "session close":
                        {
                            if (wsClient.session) {
                                if (wsClient.session.admin_id == wsClient.user_id) {
                                    this.onSessionClose(wsClient.session_id);
                                    this.shared_data.SESSIONS = this.shared_data.SESSIONS.filter((s) => {
                                        return s.id != wsClient.session_id;
                                    });
                                    return;
                                }

                                wsClient.send(
                                    JSON.stringify({
                                        action: "reject",
                                    })
                                );
                            }
                        }
                        break;

                    case "chat message":
                        {
                            if (wsClient.session) {
                                if (wsClient.session.admin_id == wsClient.user_id || wsClient.user.permissions.canChat) {
                                    //console.log(msg);
                                    this.sessionBroadcast(
                                        wsClient.session_id,
                                        JSON.stringify({
                                            action: "chat message",
                                            data: {
                                                sender: { id: wsClient.user.id, username: wsClient.user.username },
                                                message: msg.data.message,
                                            },
                                        })
                                    );
                                    return;
                                }

                                wsClient.send(
                                    JSON.stringify({
                                        action: "reject",
                                    })
                                );
                            }
                        }
                        break;
                }
            });
            wsClient.on("close", () => {
                // отправка уведомления в консоль
                //console.log('Пользователь отключился');
            });
        });
    }
};
