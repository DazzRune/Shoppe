<template>
	<TransitionGroup
		name="alert"
		tag="div"
	>
		<UAlert
			v-for="alert in store.alerts"
			:key="alert.id"
			:description="alert.description"
			:icon="alert.isSuccess ? 'ion:checkmark-circle' : 'gridicons:cross-circle'"
			close
			:class="alert.isSuccess ? 'border-accent' : 'border-error'"
			@update:open="store.removeAlert(alert.id)"
			:ui="{
				icon: alert.isSuccess ? 'text-accent' : 'text-error',
			}"
		></UAlert>
	</TransitionGroup>
</template>

<script setup lang="ts">
import { TransitionGroup, watch } from "vue"
import { useStore } from "../store"

const store = useStore()

// раскомментировать для авто исчезновения по таймеру
/*
watch(
	() => store.alerts?.length,
	(length, prev) => {
		if (length > prev) {
			setTimeout(() => {
				store.alerts.shift()
			}, 2000)
		}
	}
) */
</script>

<style scoped>
.alert-move,
.alert-enter-active,
.alert-leave-active {
	transition: all 0.5s ease;
}

.alert-enter-from,
.alert-leave-to {
	opacity: 0;
	transform: translateX(30px);
}

.alert-leave-active {
	position: absolute;
}
</style>
