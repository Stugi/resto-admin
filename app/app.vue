<template>
    <NuxtLayout>
        <NuxtPage />
        <BaseToast v-if="message" :message="message" :type="type" />
    </NuxtLayout>
</template>
<script setup lang="ts">
const { message, type } = useToast()
</script>
