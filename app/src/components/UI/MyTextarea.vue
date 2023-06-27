<template>
    <textarea 
        :type="type" 
        :value="value" 
        :rows="rows"
        @input="updateInput" 
        class="input" 
        style="margin-top: 15px;"></textarea>
</template>

<script>
export default {
    name: "MyTextarea",
    props:{
        value: {
            type: [String, Number]
        },
        type: {
           type: String,
           default: 'text'
        },
        rows: {
            type: String,
            default: '4'
        }
    },
    methods: {
        updateInput(e) {
            this.$emit('update:value', e.target.value)
        }
    }
}
</script>

<style scoped>
.input {
    width: 100%;
    border: 1px solid teal;
    padding: 10px 15px;
}
</style>