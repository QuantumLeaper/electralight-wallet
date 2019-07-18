<template>
<span>
    {{ value }} 
</span>
</template>

<script>
export default {
    name: "Format",
    props: {
        amount: {
            required: true
        },
        round: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        value () {
            let value = this.amount / 1e2
            if(this.round)
                value = value.toFixed(3)
            return value.toLocaleString()
        }

    }
}
</script>

<style>
</style>
