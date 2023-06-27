<template>
    <div>
        <text><strong>Admin: </strong> {{ admin.username }}</text>
    </div>
    <div v-if="users.length > 0">
        <table cellpadding="0px" cellspacing="0px">
            <tr>
                <th scope="col">Пользователи</th>
                <th scope="col">canChat</th>
                <th scope="col">canEdit</th>
                <th scope="col">canDelete</th>
                <th scope="col"></th>
            </tr>
            <tr v-if="isSessionAdmin" v-for="user in users">
                <td scope="row">{{ user.username }}</td>
                <td scope="row"><input type="checkbox" :checked="user.permissions.canChat" @click="() => onCanChatClick(user)" /></td>
                <td scope="row"><input type="checkbox" :checked="user.permissions.canEdit" @click="() => onCanEditClick(user)" /></td>
                <td scope="row"><input type="checkbox" :checked="user.permissions.canDelete" @click="() => onCanDeleteClick(user)" /></td>
                <td scope="row"><MyButton @click="() => onUserKick(user.id)">Kick</MyButton></td>
            </tr>
            <tr v-else v-for="user in users">
                <td scope="row">{{ user.username }}</td>
            </tr>
        </table>
    </div>
    <div v-else style="margin-top: 10px">
        <text style="color: gray">Список пользователей пуст...</text>
    </div>
</template>

<script>
import UserListItem from "./UserListItem.vue";

export default {
    emits: ["user-kicked", "user-update"],
    props: {
        users: {
            type: Array,
            required: true,
        },
        isSessionAdmin: {
            type: Boolean,
            required: true,
        },
        admin: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {};
    },
    methods: {
        onUserKick(id) {
            this.$emit("user-kicked", { id: id });
        },
        onCanChatClick(user) {
            this.$emit("user-update", {
                id: user.id,
                permissions: {
                    canChat: !user.permissions.canChat,
                    canEdit: user.permissions.canEdit,
                    canDelete: user.permissions.canDelete,
                },
            });
        },
        onCanEditClick(user) {
            this.$emit("user-update", {
                id: user.id,
                permissions: {
                    canChat: user.permissions.canChat,
                    canEdit: !user.permissions.canEdit,
                    canDelete: user.permissions.canDelete,
                },
            });
        },
        onCanDeleteClick(user) {
            this.$emit("user-update", {
                id: user.id,
                permissions: {
                    canChat: user.permissions.canChat,
                    canEdit: user.permissions.canEdit,
                    canDelete: !user.permissions.canDelete,
                },
            });
        },
    },
    components: { UserListItem },
};
</script>

<style scoped>
.mr10 {
    margin-right: 10px;
}

table,
th,
td {
    border: 1px solid black;
}
th,
td {
    padding: 10px;
    text-align: center;
}
</style>
