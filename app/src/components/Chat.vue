<template>
    <div class="container">
        <div class="messages">
            <div v-for="message in chatMessages" class="message" :class="{ mymessage: this.username == message.sender.username }">
                <div style="word-break: normal; margin-right: 5px">
                    <strong>{{ message.sender.username }}:</strong>
                </div>
                <div style="word-break: break-all">
                    <text>{{ message.message }}</text>
                </div>
            </div>
        </div>
        <div class="message-form">
            <MyInput v-model:value="newMessage" style="width: 100%; margin-right: 10px"></MyInput>
            <MyButton @click="sendMessage">Отправить</MyButton>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from "vuex";

export default {
    emits: ["on-message-send"],
    props: {
        chatMessages: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            newMessage: "",
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() == "") return;
            this.$emit("on-message-send", this.newMessage);
            this.newMessage = "";
        },
    },
    computed: {
        ...mapState({
            username: (state) => state.auth.username,
        }),
    },
    mounted() {},
};
</script>

<style scoped>
.messages {
    height: 50vh;
    overflow: hidden;
    overflow-y: scroll;
    width: 100%;
    display: flex;
    flex-direction: column;
}
.message {
    margin-bottom: 5px;
    width: fit-content;
    display: flex;
    align-items: flex-start;
    align-self: flex-start;
    padding: 5px;
    border-radius: 2px;
    border: 1px solid black;
}
.mymessage {
    justify-self: right;
    justify-content: right;
    align-self: flex-end;
    background-color: lightgreen;
}
.container {
    padding: 10px;
    background-color: lightblue;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.message-form {
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
</style>
