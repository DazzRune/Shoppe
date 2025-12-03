<!--
 стрелки главных пунктов отображаются всегда, если есть подменю
 вложенность 2го уровня и далее реализуется компонентом Popover -->
<template>
	<!--
	orientation - ориентация главного списка
	content-orientation - ориентация выпадающего списка
	disablePointerLeaveClose - оставлять открытым после наведения, для теста
	navItems.filter - исключаем пункт без подменю, иначе отобразится со стрелкой -->
	<UNavigationMenu
		:items="navItems"
		content-orientation="vertical"
		variant="link"
		:ui="{
			viewportWrapper: 'w-auto', // или w-fit, по умолч w-full. регулирует самую верхнюю обертку выпадающего меню (не главных видимых пунктов)
			viewport: 'w-auto',
			content: 'w-max',
			item: 'py-0',
			link: 'cursor-pointer',
			childList: '',
			childItem: '',
			childLabel: '',
		}"
	>
		<template
			v-for="navItem in navItems.filter(i => i.children?.length)"
			#[slotName(navItem.slot)]="{ item }: { item: NavigationMenuItem }"
		>
			<!-- раширенное выпадающее меню - несколько колонок -->
			<ul v-if="item.isExtended" class="flex py-[1em]">
				<li
					v-for="child in item.children"
					:key="child.label"
					class="px-[1em] not-last:border-r border-neutral"
				>
					<p class="mb-[1em]">{{ child.label }}</p>
					<ul>
						<li v-for="grandchild in child.children" :key="grandchild.label">
							<ULink
								:to="grandchild.to"
								class="transition-colors text-neutral-dark hover:text-primary"
							>
								{{ grandchild.label }}
							</ULink>
						</li>
					</ul>
				</li>
			</ul>

			<!-- дефолтное выпадающее меню - в одну колонку (пункты с подменю при наведении) -->
			<ul v-else class="py-[1em]">
				<li v-for="child in item.children" :key="child.label">
					<!-- todo - не раскрывается на мобильных при разрешении 1024px -->
					<!-- portal=false - если true, попап при наведении пропадает -->
					<UPopover
						v-if="child.children?.length"
						mode="hover"
						:portal="false"
						:content="{ side: 'right', sideOffset: 0 }"
					>
						<div
							class="px-[1em] transition-colors text-neutral-dark hover:text-primary cursor-pointer"
						>
							{{ child.label }}
						</div>
						<template #content>
							<ul class="py-[1em]">
								<li v-for="grandchild in child.children" :key="grandchild.label">
									<ULink :to="grandchild.to" class="px-[1em]">
										{{ grandchild.label }}
									</ULink>
								</li>
							</ul>
						</template>
					</UPopover>

					<ULink v-else :to="child.to" class="px-[1em]">
						{{ child.label }}
					</ULink>
				</li>
			</ul>
		</template>
	</UNavigationMenu>
</template>

<script setup lang="ts">
import type { NavigationMenuChildItem, NavigationMenuItem } from "@nuxt/ui"
import { ref } from "vue"
import { navMenu } from "../scripts/constants"

const navItems = ref<NavigationMenuItem[]>(navMenu)

function slotName(name: NavigationMenuItem["slot"]): string {
	return `${name}-content`
}
</script>

<style scoped></style>
