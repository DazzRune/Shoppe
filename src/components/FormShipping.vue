<template>
	<UForm
		:schema="type === 'checkout' ? schemaShipping : schemaShippingBlank"
		:state="shipping"
		@submit="onSubmit"
		:attach="type === 'checkout'"
	>
		<UFormField v-if="type !== 'cart'" name="companyName" eagerValidation>
			<InputText v-model="shipping.companyName">Company name</InputText>
		</UFormField>

		<UFormField name="country" eagerValidation>
			<USelect
				v-model="shipping.country"
				:items="selectCountry"
				placeholder="SELECT Country"
			/>
		</UFormField>

		<UFormField name="city" eagerValidation>
			<USelect v-model="shipping.city" :items="selectCity" placeholder="SELECT City" />
		</UFormField>

		<UFormField v-if="type !== 'cart'" name="address" eagerValidation>
			<InputText v-model="shipping.address">Street address</InputText>
		</UFormField>

		<UFormField v-if="type !== 'cart'" name="zip" eagerValidation>
			<InputText v-model="shipping.zip" maxLength="5">Postcode / ZIP</InputText>
		</UFormField>

		<UFormField name="deliveryOptions" eagerValidation>
			<USelect
				v-model="shipping.deliveryOptions"
				:items="selectDelivery"
				placeholder="SELECT Delivery"
			/>
		</UFormField>

		<UButton v-if="type === 'default'" type="submit">Save</UButton>
	</UForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { schemaShipping, schemaShippingBlank, type TSchemaShipping } from "../scripts/types"
import type { FormSubmitEvent } from "@nuxt/ui"
import { countries, deliveries } from "../scripts/constants"

const shipping = defineModel<TSchemaShipping>({ required: true })

const props = withDefaults(
	defineProps<{
		// влияет на кол-во отрисовываемых элементов формы
		type?: "default" | "cart" | "checkout"
	}>(),
	{
		type: "default",
	}
)

const emit = defineEmits(["submit"])

const selectCountry = ref(countries)
const selectCity = computed(() => {
	return countries.find((c) => c.value === shipping.value.country)?.cities || []
})
const selectDelivery = ref(deliveries)

/*
flush: "pre" - по умолч. колбэк выполнится непосредственно перед рендерингом компонента
flush: "post" - после окончания рендеринга
flush: "sync" - немедленный запуск колбэка при изменении реактивной зависимости, например, при инвалидации кэша
здесь нужен во избежание ситуации когда мы выбрали страну, а город не успел сброситься до реактивного обновления внешних зависимостей
это вызывет ошибку, например, в вычислении коэф-та store.factor */
watch(
	() => shipping.value.country,
	(country, prevCountry) => {
		shipping.value.city = ""
	},
	{ flush: "sync" }
)

async function onSubmit(e: FormSubmitEvent<TSchemaShipping>) {
	emit("submit")
}
</script>

<style scoped></style>
