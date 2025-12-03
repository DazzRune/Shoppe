<template>
	<div class="sm:flex [&>*]:sm:w-1/2">
		<ul class="[&>*]:mb-[1em]">
			<li><p>Order number</p><span>{{ order.id }}</span></li>
			<li><p>Email</p><span>{{ order.email }}</span></li>
			<li><p>Payment method</p><span>{{ order.paymentMethod.cardType }}{{ order.paymentMethod.cardNumber }}</span></li>
			<li><p>Order date</p><span>{{ order.date }}</span></li>
		</ul>
		<ul class="[&>*]:mb-[1em]">
			<li><p>Delivery options</p><span>{{ order.deliveryAddress.deliveryOptions }}</span></li>
			<li><p>Delivery address</p><span>{{ order.deliveryAddress.address }}{{ order.deliveryAddress.city }}{{ order.deliveryAddress.country }}</span></li>
			<li><p>Contact number</p><span>{{ order.contact }}</span></li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { PreviousOrder } from '../scripts/types';

const props = defineProps<{
	order: PreviousOrder
}>()
</script>

<style scoped>

</style>
