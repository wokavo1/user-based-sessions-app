<template>
    <div style="height: 70vh" class="container">
        <div v-if="createKeyDialogVisible" class="flex-col add-key-card" style="height: 17vh">
            <div class="flex-row">
                <div><strong class="mr15 mt22 ml13">key: </strong></div>
                <MyInput v-model:value="newKey"></MyInput>
            </div>
            <div class="flex-row mt10">
                <div><strong class="mr15 mt22">value: </strong></div>
                <MyInput v-model:value="newValue"></MyInput>
            </div>
            <div class="flex-row mt15" style="justify-content: space-between">
                <MyButton style="background-color: lightgreen" @click="onNewKeyCreate">Создать</MyButton>
                <MyButton @click="createKeyDialogVisible = false" style="background-color: lightcoral">Отмена</MyButton>
            </div>
        </div>
        <MyButton v-else @click="showCreateKeyDialog" style="background-color: lightblue">Создать ключ</MyButton>
        <div
            style="width: 55vw; overflow-x: hidden; overflow-y: scroll"
            :class="{ heightauto: !createKeyDialogVisible, vh50: createKeyDialogVisible }"
        >
            <div v-for="[key, value] of Object.entries(session_data)">
                <SessionDataItem
                    style="margin-right: 10px"
                    :key="key"
                    :_key="key"
                    :value="value"
                    class="items"
                    @key_value_changed="onKey_value_changed"
                    @key_deleted="onKey_deleted"
                ></SessionDataItem>
            </div>
        </div>
    </div>
</template>

<script>
import SessionDataItem from "./SessionDataItem.vue";

export default {
    emits: ["key_value_changed", "key_deleted"],
    props: {
        session_data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            createKeyDialogVisible: false,
            newKey: "",
            newValue: "",
        };
    },
    methods: {
        onNewKeyCreate() {
            this.$emit("key_value_changed", { key: this.newKey, value: this.newValue });
            this.createKeyDialogVisible = false;
        },
        showCreateKeyDialog() {
            this.createKeyDialogVisible = true;
            this.newKey = "";
            this.newValue = "";
        },
        onKey_value_changed(e) {
            this.$emit("key_value_changed", e);
        },
        onKey_deleted(e) {
            this.$emit("key_deleted", e);
        },
    },
    components: {
        SessionDataItem,
    },
};
</script>

<style scoped>
.vh50 {
    height: 50vh;
}
.heightauto {
    height: 63vh;
}
.container {
    padding: 10px;
    background-color: lightgray;
    border-radius: 5px;
}
.add-key-card {
    width: fit-content;
    background-color: lightblue;
    padding: 15px;
    border-radius: 8px;
}
.items {
    margin-top: 15px;
}
.flex-row {
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
}
.flex-col {
    display: flex;
    flex-direction: column;
}
.mr15 {
    margin-right: 15px;
}
.ml13 {
    margin-left: 13px;
}
.mt22 {
    margin-top: 22px;
}
.mt15 {
    margin-top: 15px;
}
.mt10 {
    margin-top: 10px;
}
</style>
