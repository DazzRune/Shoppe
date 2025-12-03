<template>
	<UForm :schema="schemaLogin" :state="state" @submit="onSubmit">
		<UFormField name="username" eagerValidation class="relative">
			<InputText v-model="state.username">User name</InputText>
		</UFormField>

		<UFormField name="password" eagerValidation>
			<InputText v-model="state.password">Password</InputText>
		</UFormField>

		<UButton type="submit">Sign in</UButton>
	</UForm>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import type { FormSubmitEvent } from "@nuxt/ui"
import { schemaLogin, type TSchemaLogin } from "../scripts/types"
import { useRouter } from "vue-router"

const emit = defineEmits<{
	submit: [state: TSchemaLogin]
}>()

const router = useRouter()
// для примера сразу подставляем данные существующего польз-ля из dummyJSON
const state = ref({
	username: "emilys",
	password: "emilyspass",
})

async function onSubmit(e: FormSubmitEvent<TSchemaLogin>) {
	emit("submit", state.value)
}
</script>

<style scoped></style>
