<template>
	<UForm
		:schema="type === 'checkout' ? schemaAccountDetails : schemaAccountDetailsBlank"
		:state="details"
		@submit="onSubmit"
		:attach="type === 'checkout'"
	>
		<UFormField name="firstName" eagerValidation>
			<InputText v-model="details.firstName">First name</InputText>
		</UFormField>

		<UFormField name="lastName" eagerValidation>
			<InputText v-model="details.lastName">Last name</InputText>
		</UFormField>

		<UFormField name="email" eagerValidation>
			<InputText v-model="details.email" type="email">Email</InputText>
		</UFormField>

		<UFormField name="phone" eagerValidation>
			<InputText v-model="details.phone" type="tel">Phone</InputText>
		</UFormField>

		<UFormField name="cardNumber" eagerValidation>
			<InputText v-model="details.cardNumber">Card number</InputText>
		</UFormField>

		<UForm
			v-if="type === 'default'"
			:schema="schemaPasswordChange"
			:state="passwords"
			:attach="isPasswordAttached"
		>
			<UFormField name="currentPassword" eagerValidation>
				<InputText v-model="passwords.currentPassword" type="password">
					Current password
				</InputText>
			</UFormField>

			<UFormField name="password" eagerValidation>
				<InputText v-model="passwords.password" type="password">New password</InputText>
			</UFormField>

			<UFormField name="passwordConfirm" eagerValidation>
				<InputText v-model="passwords.passwordConfirm" type="password">
					Confirm password
				</InputText>
			</UFormField>
		</UForm>

		<UButton v-if="type === 'default'" type="submit">Save changes</UButton>
	</UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import { useStore } from "../store"
import { computed, onMounted, ref } from "vue"
import {
	schemaAccountDetails,
	schemaAccountDetailsBlank,
	schemaPasswordChange,
	type TSchemaAccountDetails,
	type TSchemaAccountDetailsAndPassword,
	type TSchemaPasswordChange,
} from "../scripts/types"
import * as v from "valibot"
import { detailsDefaults } from "../scripts/constants"

const details = defineModel<TSchemaAccountDetails>({
	default: { ...detailsDefaults },
})
const props = withDefaults(
	defineProps<{
		// влияет на кол-во отрисовываемых элементов формы
		type?: "default" | "checkout"
	}>(),
	{
		type: "default",
	}
)

const emit = defineEmits<{
	submit: [state: TSchemaPasswordChange['password']]
}>()

const store = useStore()

const isPasswordAttached = computed(() => {
	if (
		passwords.value.currentPassword ||
		passwords.value.password ||
		passwords.value.passwordConfirm
	) {
		return true
	}
	return false
})

const passwords = ref({
	currentPassword: "",
	password: "",
	passwordConfirm: "",
})

async function onSubmit(e: FormSubmitEvent<TSchemaAccountDetails>) {
	// временное решение обработки пароля
	if (
		(!passwords.value.currentPassword ||
			!passwords.value.password ||
			!passwords.value.passwordConfirm) &&
		isPasswordAttached.value
	) {
		store.addAlert({
			isSuccess: false,
			description: `Please enter all password fields to change password!`,
		})
		return
	}

	// ошибки вложенной формы смены пароля почему то НЕ предотвращают общую отправку, поэтому отменяем вручную
	const passwordsValidity = v.safeParse(schemaPasswordChange, passwords.value)
	if (!passwordsValidity.success) {
		console.log("Passwords form error:", passwordsValidity)

		store.addAlert({
			isSuccess: false,
			description: passwordsValidity.issues?.[0].message,
		})
		return
	}

	emit("submit", passwords.value.password)
}
</script>

<style scoped></style>
