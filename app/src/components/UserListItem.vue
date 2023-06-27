<template>
    <div class="item">
        <div class="item__desc__item" v-if="isSessionAdmin">
            <strong>{{ user.username }} :: </strong>
            <text class="ml10">canEdit:</text> 
            <input type="checkbox" :checked="user.permissions.canEdit" @click="onCEclick"/>
            <text class="ml10">canDelete:</text> 
            <input type="checkbox" :checked="user.permissions.canDelete" @click="onCDclick"/>
            <MyButton class="ml10" @click="onUserKick">Kick</MyButton>
        </div>
        <div v-else>
            <strong>{{ user.username }}</strong>
        </div>
    </div>
</template>

<script>
export default {
    emits: ['user-kicked', 'user-update'],
    props: {
        user: {
            type: Object,
            required: true,
        },
        isSessionAdmin: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {

        }
    },
    methods: {
        onUserKick() {
            this.$emit('user-kicked', {id: this.user.id}); 
        },
        onCEclick() {
            this.$emit('user-update', {
                id: this.user.id, 
                permissions: {
                    canEdit: !this.user.permissions.canEdit,
                    canDelete: this.user.permissions.canDelete
                }
            })
        },
        onCDclick() {
            this.$emit('user-update', {
                id: this.user.id, 
                permissions: {
                    canEdit: this.user.permissions.canEdit,
                    canDelete: !this.user.permissions.canDelete
                }
            })
        }
    }
}
</script>

<style scoped>
.item {
    padding: 15px;
    border: 2px solid teal;
    display: flex;
    flex-direction: column;
    align-items: normal;
    justify-content:left;
}
.item__desc__item {
    display: flex;
    flex-direction: row;
}
.mt5 {
    margin-top: 5px;
}
.ml10 {
    margin-left: 10px;
}
</style>