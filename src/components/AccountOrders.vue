<template>
	<template v-if="data.length">
		<!-- desktop -->
		<UTable :data="data" :columns="columns" class="max-md:hidden" />

		<!-- mobile -->
		<ul class="md:hidden">
			<li v-for="item in data">
				<ul>
					<li v-for="(row, i) in Object.entries(item)" class="flex justify-between mt-[2%]">
						<span>{{ columns[i].header }}</span>
						<ULink v-if="columns[i].isLink" :to="{name: 'orders', params: {id: row[1]}}" class="text-accent">View Order</ULink>
						<span v-else>{{ row[1] }}</span>
					</li>
					<USeparator />
				</ul>
			</li>
		</ul>
	</template>

	<UAlert
		v-else
		description="No order has been made yet."
		orientation="horizontal"
		class="border-accent"
		:actions="[
			{
				label: 'BROWSE PRODUCTS',
				color: 'success',
				variant: 'link',
				to: { name: 'products' }
			}
		]"
	></UAlert>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from "vue"
import type { PreviousOrder } from "../scripts/types";
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
	orders: PreviousOrder[]
}>()

type Column = Pick<PreviousOrder, 'id' | 'date' | 'status' | 'total'> & { actions: string }

const ULink = resolveComponent('ULink')

const data = computed(() => {
	// return [] // для теста
	return props.orders.map((order: PreviousOrder): Column => ({
		id: order.id,
		date: order.date,
		status: order.status,
		total: order.total,
		// данные для передачи в рендер-функцию по отрисовке ссылки на заказ
		actions: String(order.id),
	}))
})

const columns: (TableColumn<Column> & { isLink?: boolean })[] = [
	{
		accessorKey: "id",
		header: "Order number",
	},
	{
		accessorKey: "date",
		header: "Date",
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => `$ ${row.getValue("total")}`,
	},
	{
		accessorKey: "actions",
		header: "Actions",
		cell: ({ row }) => {
			return h(ULink, { to: {name: 'orders', params: {id: row.getValue("actions")}}, class: 'text-accent' }, () =>
				'View Order'
			)
		},
		isLink: true, // кастом поле для рендера ссылки в адаптиве
	},
]
</script>

<style scoped></style>
