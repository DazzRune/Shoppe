<template>
	<UForm :schema="schemaRegister" :state="state" @submit="onSubmit">
		<UFormField name="username" eagerValidation>
			<InputText v-model="state.username">User name</InputText>
		</UFormField>

		<UFormField name="email" eagerValidation>
			<InputText v-model="state.email">Email</InputText>
		</UFormField>

		<UFormField name="password" eagerValidation>
			<InputText v-model="state.password">Password</InputText>
		</UFormField>

		<UFormField name="passwordConfirm" eagerValidation>
			<InputText v-model="state.passwordConfirm">Confirm password</InputText>
		</UFormField>

		<UButton type="submit">Register</UButton>
	</UForm>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import type { FormSubmitEvent } from "@nuxt/ui"
import { schemaRegister, type TSchemaRegister } from "../scripts/types"
import { useRouter } from "vue-router"

const emit = defineEmits<{
	submit: [state: TSchemaRegister]
}>()

const router = useRouter()

// ! после регистрации сразу происходит логин, поэтому проверять только на существующих в dummyJSON данных
const state = ref({
	username: "emilys",
	email: "emily.johnson@x.dummyjson.com",
	password: "emilyspass",
	passwordConfirm: "emilyspass",
})

async function onSubmit(e: FormSubmitEvent<TSchemaRegister>) {
	emit("submit", state.value)
}
</script>

<style scoped></style>
