<template>
	<!-- bg - для теста -->
	<UNavigationMenu :items="items" orientation="vertical" variant="link" type="single" class="absolute left-0 right-0 top-full z-10 bg-secondary">
		<template #item-content="{ item }">
			<UNavigationMenu :items="item.children" orientation="vertical" variant="link" type="single" class="" />
			<!-- под капотом -->
			<!-- <UAccordion :items="item.children" /> -->
		</template>
	</UNavigationMenu>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"
import { ref } from "vue";
import { navMenu } from "../scripts/constants";

const items = ref<NavigationMenuItem[]>(navMenu)
</script>

<style scoped>

</style>
