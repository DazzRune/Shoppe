<template>
	<header class="sticky top-0 max-md:pb-[1em] z-10 before:absolute before:inset-0 before:backdrop-blur-md">
		<div class="flex justify-between items-center relative p-[1em]">
			<ULink :to="{name: 'home'}" class="h-full min-w-[50px]"><ProductImg :src="logoUrl" alt="" /></ULink>

			<!-- только desktop -->
			<div class="max-md:hidden flex items-center">
				<NavMenu v-if="!isSearchShown" />

				<USeparator v-if="!isSearchShown" orientation="vertical" class="mx-[1em] h-[1em]" />

				<ul class="flex justify-end items-center md:flex-wrap h-[30px] [&>li]:h-full">
					<li class="relative">
						<InputMenu class="absolute right-full transition-[width] duration-300 w-0 h-full overflow-hidden" :class="{'w-[200px]': isSearchShown}" :ui="{content: 'w-[40vw] max-h-[50vh]'}" />
						<BtnIconOnly @click="isSearchShown = !isSearchShown"><IconSearch /></BtnIconOnly>
					</li>

					<li><CartDrawer /></li>

					<!-- зайти в личный кабинет -->
					<li>
						<BtnIconOnly v-if="store.accessToken" :to="{name: 'account'}" :avatar="{src: avatarUrl}" />
						<BtnIconOnly v-else :to="{name: 'account'}"><IconAccount /></BtnIconOnly>
					</li>

					<!-- сменить тему -->
					<li><BtnIconOnly title="Switch theme" @click="onSwitchTheme"><IconPallete /></BtnIconOnly></li>

					<!-- принудительно очистить access token -->
					<li><BtnIconOnly title="Remove access token from memory" @click="store.onAccessRemove()"><IconAccessoff /></BtnIconOnly></li>

					<!-- принудительно очистить refresh token -->
					<li><BtnIconOnly title="Remove refresh token from cookie" @click="onCookieRemove"><IconCookieoff /></BtnIconOnly></li>

					<!-- принудительно очистить local storage -->
					<li><BtnIconOnly title="Remove cart from local storage" @click="store.onStorageRemove()"><IconStorageoff /></BtnIconOnly></li>

					<!-- разлогиниться -->
					<li><BtnIconOnly title="Log out (remove tokens)" @click="onLogout"><IconLogout /></BtnIconOnly></li>

					<!-- добавить alert - для теста -->
					<li><BtnIconOnly title="Show fake Success alert" @click="store.addAlert({description: 'Testing success alert'})"><IconCheckmark /></BtnIconOnly></li>
					<li><BtnIconOnly title="Show fake Error alert" @click="store.addAlert({isSuccess: false, description: 'Testing error alert'})"><IconCirclecross /></BtnIconOnly></li>

					<!-- очистить alerts - для теста -->
					<li><BtnIconOnly title="Remove all alerts" @click="store.alerts = []"><IconInfooff /></BtnIconOnly></li>
				</ul>
			</div>

			<!-- только адаптив -->
			<ul class="md:hidden flex justify-end items-center">
				<li><CartDrawer /></li>
				<!-- зайти в личный кабинет -->
				<li>
					<BtnIconOnly v-if="store.accessToken" :to="{name: 'account'}" :avatar="{src: avatarUrl}" />
					<BtnIconOnly v-else :to="{name: 'account'}"><IconAccount /></BtnIconOnly>
				</li>
				<!-- сменить тему -->
				<li><BtnIconOnly title="Switch theme" @click="onSwitchTheme"><IconPallete /></BtnIconOnly></li>
				<li>
					<BtnIconOnly @click="isNavShown = !isNavShown">
						<IconCross v-if="isNavShown" />
						<IconBurgermenu v-else />
					</BtnIconOnly>
				</li>
			</ul>

			<NavMenuAdaptive v-if="isNavShown" />
		</div>

		<InputMenu class="w-full md:hidden" :ui="{content: 'max-h-[100vh]',}" />

		<AlertMessage class="absolute flex flex-col-reverse w-full z-10" />
	</header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import logoUrl from "../assets/img/logo.png"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "../store";
import { COOKIE_REFRESH, useApi } from "../scripts/api"
import AlertMessage from "./AlertMessage.vue";
import { useColorMode } from "@vueuse/core";
import IconSearch from "../assets/icons/search.svg";
import IconAccount from "../assets/icons/account.svg";
import IconPallete from "../assets/icons/pallete.svg";
import IconAccessoff from "../assets/icons/access-off.svg";
import IconCookieoff from "../assets/icons/cookie-off.svg";
import IconStorageoff from "../assets/icons/storage-off.svg";
import IconLogout from "../assets/icons/logout.svg";
import IconCheckmark from "../assets/icons/checkmark.svg";
import IconCirclecross from "../assets/icons/circle-cross.svg";
import IconInfooff from "../assets/icons/info-off.svg";
import IconBurgermenu from "../assets/icons/burger-menu.svg";
import IconCross from "../assets/icons/cross.svg";

const isSearchShown = ref(false) // по умолч
// const isSearchShown = ref(true) // для теста

const router = useRouter()
const route = useRoute()
const theme = useColorMode()

const { useDummySensitive, onCookieRemove, onLogout } = useApi()
const store = useStore()

const getUser = useDummySensitive("auth/me").get().json()

const isNavShown = ref(false)

const avatarUrl = computed(() => getUser.data.value?.image)

watch(() => store.accessToken, async (token) => {
	if (token) {
		await getUser.execute()

		if (getUser.error.value) {
			console.log('Header getUser failed', getUser.error.value);
			return
		}
	}
})

function onSwitchTheme() {
	theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped></style>
