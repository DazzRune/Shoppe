<template>
	<UForm :schema="schemaReview" :state="state" @submit="onReviewSubmit">
		<UFormField name="comment" eagerValidation>
			<InputTextarea v-model="state.comment">Your review *</InputTextarea>
		</UFormField>

		<UFormField name="rating" eagerValidation>
			<InputText v-model="state.rating" type="number" class="size-0">Your rating *</InputText>
			<vue3-star-ratings v-model="state.rating" starSize="20" />
		</UFormField>

		<UButton type="submit">Submit</UButton>
	</UForm>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { schemaReview, type TProduct, type TSchemaReview } from "../scripts/types"
import type { FormSubmitEvent } from "@nuxt/ui"
import { useStore } from "../store"

const emit = defineEmits<{
	submit: [state: TSchemaReview]
}>()

const store = useStore()

const state = ref({
	comment: "",
	rating: 0,
})

function onReviewSubmit(e: FormSubmitEvent<TSchemaReview>) {
	emit("submit", state.value)
}
</script>

<style scoped></style>
