<template>
	<div>
		<h1 class="text-center">My Account</h1>

		<UTabs v-model="active" :items="tabs" variant="pill" class="mx-auto w-2/3">
			<template #login="{ item }">
				<FormLogin @submit="onLoginSubmit" />
			</template>

			<template #register="{ item }">
				<FormRegister @submit="onRegisterSubmit" />
			</template>
		</UTabs>
	</div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, TabsItem } from '@nuxt/ui';
import { computed, ref } from 'vue';
import { useApi } from "../scripts/api"
import { useRoute, useRouter } from 'vue-router';
import type { TSchemaLogin, TSchemaRegister } from '../scripts/types';

const route = useRoute()
const router = useRouter()

const { login, register } = useApi()

const tabs = [
	{
		label: 'Sign in',
		value: 'login',
		slot: 'login' as const
	},
	{
		label: 'Register',
		value: 'register',
		slot: 'register' as const
	},
] satisfies TabsItem[]

const active = ref('login') // по умолч
// const active = ref('register') // для теста

async function onLoginSubmit(state: TSchemaLogin) {
	const response = await login(state)
	if (!response) return

	router.push({ name: 'account' })

	// todo - перенаправляем на предыдущую если есть, иначе в ЛК. проверять историю
	// router.go(-1)
}

async function onRegisterSubmit(state: TSchemaRegister) {
	const response = await register(state)
	if (!response) return

	// todo - редирект не срабатывает
	router.push({ name: 'account' })

	// todo - перенаправляем на предыдущую если есть, иначе в ЛК. проверять историю
	// router.go(-1)
}
</script>

<style scoped>

</style>
