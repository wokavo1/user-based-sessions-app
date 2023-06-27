<template>
    <div class="main">
        <MyDialog v-model:show="isErr">
            <div v-if="isErr" style="color: lightcoral">
                <strong>{{ errType }}: </strong> <text> {{ errMsg }} </text>
            </div>
        </MyDialog>
        <div v-if="!isAuth">
            <h1>Главная страница приложения</h1>
        </div>
        <div v-else>
            <div v-if="isJoinedSession" class="flex-col">
                <text><strong>ID Сессии: </strong> {{ sessionID }}</text>
                <MyButton @click="getSessionData">Получить данные сессии</MyButton>
                <MyButton @click="inviteUserVisible = true">Пригласить пользователя</MyButton>
                <MyDialog v-model:show="inviteUserVisible">
                    <div>
                        <text>Имя пользователя: </text>
                        <MyInput v-model:value="user_to_add_input"></MyInput>
                        <MyButton @click="onUserInvite">Пригласить</MyButton>
                    </div>
                </MyDialog>
                <MyButton @click="userListVisible = true">Список пользователей</MyButton>
                <MyDialog v-model:show="userListVisible">
                    <UserTable
                        :users="session_users"
                        :admin="session_admin"
                        :isSessionAdmin="isSessionAdmin"
                        @user-kicked="onUserKicked"
                        @user-update="onUserUpdate"
                    ></UserTable>
                </MyDialog>
                <MyButton @click="leaveSession" style="background-color: wheat">Отключиться от сессии</MyButton>
                <MyButton @click="sessionClose" style="background-color: lightcoral">Закрыть сессию</MyButton>
                <div style="display: flex; flex-direction: row; justify-content: space-between; height: 100% width: 100%;">
                    <SessionData
                        style="width: auto"
                        class="mt15"
                        :session_data="session_data"
                        @key_value_changed="onKey_value_changed"
                        @key_deleted="onKey_deleted"
                    ></SessionData>
                    <Chat class="mt15" style="width: 41vw; height: 100%" :chatMessages="chatMessages" @on-message-send="onMessageSend"></Chat>
                </div>
            </div>
            <div v-else>
                <MyButton @click="joinSessionClick"> Присоединиться к сессии </MyButton>
                <MyDialog v-model:show="joinSessionDialogVisible">
                    <div class="flex-col">
                        <MyButton @click="createSession" class="mt15">Создать сессию</MyButton>
                        <div class="flex-row mt15">
                            <MyInput v-model:value="session_id_input"></MyInput>
                            <MyButton @click="joinSessionViaID">Присоединиться по ID</MyButton>
                        </div>
                        <strong class="mt15">Ваши открытые сессии:</strong>
                        <div v-for="session in your_sessions" class="flex-row">
                            <text class="mt5"><strong>ID: </strong> {{ session.id }} </text>
                            <MyButton @click="joinSession(session.id)">Присоединиться</MyButton>
                        </div>
                    </div>
                </MyDialog>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from "vuex";
import SessionData from "@/components/SessionData.vue";
import UserTable from "@/components/UserTable.vue";
import Chat from "@/components/Chat.vue";

const doConsoleLogging = false;

export default {
    data() {
        return {
            WS: undefined,
            session_data: {},
            joinSessionDialogVisible: false,
            your_sessions: [],
            session_id_input: "",
            errType: "",
            errMsg: "",
            isErr: false,
            inviteUserVisible: false,
            user_to_add_input: "",
            session_users: [],
            userListVisible: false,
            session_admin: false,
            isSessionAdmin: false,
            chatMessages: [],
        };
    },
    methods: {
        onMessageSend(msg) {
            this.WS.send(
                JSON.stringify({
                    action: "chat message",
                    data: { message: msg },
                })
            );
        },
        sessionClose() {
            this.WS.send(
                JSON.stringify({
                    action: "session close",
                })
            );
        },
        onUserKicked(e) {
            if (doConsoleLogging) console.log(e);
            this.WS.send(
                JSON.stringify({
                    action: "user kicked",
                    data: e,
                })
            );
        },
        onUserUpdate(e) {
            if (doConsoleLogging) console.log(e);
            this.WS.send(
                JSON.stringify({
                    action: "user update",
                    data: e,
                })
            );
        },
        async onUserInvite() {
            try {
                const res = await fetch("http://localhost:5000/session/" + this.sessionID + "/invite", {
                    method: "POST",
                    cors: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.token,
                    },
                    body: JSON.stringify({
                        username: this.user_to_add_input,
                    }),
                });

                const res_data = await res.json();
                if (res_data.error) {
                    if (doConsoleLogging) console.log(res_data.error);
                    this.inviteUserVisible = false;
                    this.errType = res_data.error.type;
                    this.errMsg = res_data.error.message;
                    this.isErr = true;
                    return;
                }
                this.isErr = false;
                this.inviteUserVisible = false;
            } catch (e) {
                this.inviteUserVisible = false;
                console.error(e);
            }
        },
        async joinSessionViaID() {
            try {
                const res = await fetch("http://localhost:5000/session/" + this.session_id_input + "/getData", {
                    method: "GET",
                    cors: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.token,
                    },
                });

                const res_data = await res.json();
                if (doConsoleLogging) console.log(res_data);
                if (res_data.error) {
                    if (doConsoleLogging) console.log();
                    this.session_params_set({ sessionID: undefined, isJoinedSession: false });
                    this.joinSessionDialogVisible = false;
                    this.isErr = true;
                    this.errType = res_data.error.type;
                    this.errMsg = res_data.error.message;
                    return;
                }
                this.isErr = false;
                this.session_params_set({ sessionID: this.session_id_input, isJoinedSession: true });

                this.JOIN_WSS();
            } catch (e) {
                this.joinSessionDialogVisible = false;
                console.error(e);
            }
        },

        leaveSession() {
            this.WS.close();
            this.session_params_set({});
            this.session_data = {};
        },

        async joinSessionClick() {
            try {
                const res = await fetch("http://localhost:5000/session/getAll", {
                    method: "GET",
                    cors: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.token,
                    },
                });
                const res_data = await res.json();
                this.your_sessions = res_data;
                //if (doConsoleLogging) console.log(res_data)
                this.joinSessionDialogVisible = true;
            } catch (e) {
                console.error(e);
            }
        },

        joinSession(id) {
            this.session_params_set({
                isJoinedSession: true,
                sessionID: id,
            });

            this.JOIN_WSS();
            this.joinSessionDialogVisible = false;
        },

        onKey_value_changed(e) {
            //this.session_data[e.key] = e.value
            this.WS.send(
                JSON.stringify({
                    action: "edit key",
                    data: e,
                })
            );
        },
        onKey_deleted(e) {
            this.WS.send(
                JSON.stringify({
                    action: "delete key",
                    data: e,
                })
            );
        },

        ...mapMutations({
            session_params_set: "session/session_params_set",
        }),

        getSessionData() {
            this.WS.send(
                JSON.stringify({
                    action: "get data",
                    data: {},
                })
            );
        },

        JOIN_WSS() {
            this.WS = new WebSocket("ws://localhost:9000");

            this.WS.onopen = () => {
                if (doConsoleLogging) console.log("подключился");
                this.WS.send(JSON.stringify({ action: "connect session", data: { session_id: this.sessionID, token: this.token } }));
            };

            // обработчик сообщений от сервера
            this.WS.onmessage = (message) => {
                const msg = JSON.parse(message.data);
                //if (doConsoleLogging) console.log(msg)
                switch (msg.action) {
                    case "session data":
                        {
                            if (doConsoleLogging) console.log(msg.action + " -> ", msg.data);
                            this.session_data = msg.data;
                            this.session_users = msg.users;
                        }
                        break;
                    case "reject":
                        {
                            console.error(msg.action + " -> ", msg.data);
                            this.isErr = true;
                            this.errType = "Action Rejected";
                            this.errMsg = "У вас недостаточно прав";
                        }
                        break;
                    case "key changed":
                        {
                            if (doConsoleLogging) console.log(msg.action + " -> ", msg.data);
                            this.session_data[msg.data.key] = msg.data.value;
                        }
                        break;
                    case "key deleted":
                        {
                            if (doConsoleLogging) console.log(msg.action + " -> ", msg.data);
                            delete this.session_data[msg.data.key];
                        }
                        break;
                    case "user update":
                        {
                            if (doConsoleLogging) console.log(msg.action + " -> ", msg.data);
                            this.session_users = msg.data;
                            this.session_admin = msg.admin;
                        }
                        break;
                    case "you are an admin harry":
                        {
                            if (doConsoleLogging) console.log(msg.action + " -> ", msg.data);
                            this.isSessionAdmin = true;
                        }
                        break;
                    case "chat message":
                        {
                            if (doConsoleLogging) console.log(msg.action + " -> ", msg.data);
                            //console.log(msg);
                            this.chatMessages.push(msg.data);
                        }
                        break;
                }
            };

            this.WS.onclose = () => {
                if (doConsoleLogging) console.log("conncetion closed");
                this.session_params_set({});
                this.session_data = {};
                this.session_users = [];
            };
        },

        async createSession() {
            if (doConsoleLogging) console.log("creating session!");
            try {
                const res = await fetch("http://localhost:5000/session/create", {
                    method: "POST",
                    cors: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.token,
                    },
                });
                const res_data = await res.json();
                if (doConsoleLogging) console.log(res_data);
                this.session_params_set({
                    isJoinedSession: true,
                    sessionID: res_data.session_id,
                });

                this.JOIN_WSS();
                this.joinSessionDialogVisible = false;
            } catch (e) {
                console.error(e);
            }
        },
    },

    async mounted() {
        if (this.sessionID) {
            try {
                const res = await fetch("http://localhost:5000/session/" + this.sessionID + "/getData", {
                    method: "GET",
                    cors: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + this.token,
                    },
                });

                const res_data = await res.json();
                if (res_data.error) {
                    this.session_params_set({ sessionID: undefined, isJoinedSession: false });
                }

                this.JOIN_WSS();
            } catch (e) {
                console.error(e);
            }
        }
    },

    computed: {
        ...mapState({
            isAuth: (state) => state.auth.isAuth,
            isJoinedSession: (state) => state.session.isJoinedSession,
            sessionID: (state) => state.session.sessionID,
            token: (state) => state.auth.token,
            username: (state) => state.auth.username,
        }),
    },

    components: {
        SessionData,
        UserTable,
        Chat,
    },
};
</script>

<style scoped>
.main {
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.flex-col {
    display: flex;
    flex-direction: column;
}
.flex-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.mt15 {
    margin-top: 15px;
}

.mt5 {
    margin-top: 5px;
}
</style>
