<template>
	<div>
		<h1>Cart totals</h1>
		<table class="table-fixed w-full [&_td]:align-top">
			<tbody>
				<tr class="[&>*]:py-3">
					<td>Subtotal</td>
					<td>$ {{ store.subtotal }}</td>
				</tr>
				<tr class="[&>*]:py-3">
					<td>Shipping</td>
					<td>
						<p>Shipping costs will be calculated once you have provided address.</p>
						<h4 class="uppercase">CALCULATE SHIPPING</h4>

						<FormShipping v-model="store.shipping" type="cart" />
					</td>
				</tr>
				<tr class="font-bold [&>*]:py-3">
					<td>Total</td>
					<td>$ {{ store.total }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useStore } from "../store"

const store = useStore()
</script>

<style scoped></style>
