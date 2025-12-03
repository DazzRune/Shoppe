<template>
	<UInputNumber v-model="amount" :min="1" @click.stop="">
		<template #decrement>
			<BtnIconOnly icon="i-lucide-minus" @click.stop="" />
		</template>

		<template #increment>
			<BtnIconOnly icon="i-lucide-plus" @click.stop="" />
		</template>
	</UInputNumber>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useStore } from "../store"
import type { TProduct } from "../scripts/types"

const amount = defineModel<number>()
</script>

<style scoped></style>
