<template>
    <div class="item">
        <div class="item__desc__item">
            <strong>{{ _key }} = </strong>
            <text style="margin-left: 5px;"> {{ value }}</text>
        </div>
        <div v-if="isInEdit" class="mt5">
            <MyButton 
                @click="isInEdit = false; $emit('key_value_changed', {key: _key, value: editValue})"
                style="background-color: lightgreen;"
            >Применить</MyButton>
            <MyInput v-model:value="editValue"></MyInput>
            <MyButton 
                @click="isInEdit = false; editValue = ''"
                style="background-color: lightcoral;"
            >Отмена</MyButton>
        </div>
        <div v-else class="mt5">
            <MyButton 
                @click="isInEdit = true; editValue = value"
                style="background-color: lightblue;"
            >Изменить</MyButton>
            <MyButton 
                @click="$emit('key_deleted', {key: _key})"
                style="background-color: lightcoral;"
            >Удалить</MyButton>
        </div>
    </div>
</template>

<script>

export default {
    emits: ['key_value_changed', 'key_deleted'],
    props: {
        _key: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isInEdit: false,
            editValue: this.value
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
</style>