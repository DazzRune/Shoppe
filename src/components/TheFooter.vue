<template>
	<footer class="py-8">
		<USeparator />

		<div class="flex justify-between max-md:flex-col-reverse mt-4">
			<ul class="flex flex-1 flex-wrap gap-x-[1em] text-[0.8em] uppercase max-md:flex-col">
				<li><ULink>CONTACT</ULink></li>
				<li><ULink>TERMS OF SERVICES</ULink></li>
				<li><ULink>SHIPPING AND RETURNS</ULink></li>
			</ul>
			<UForm
				:schema="schemaSubscribe"
				:state="subscribe"
				:validateOn="['change', 'input']"
				@submit="onSubscribe"
			>
				<UFormField name="email" eagerValidation class="relative">
					<UInput v-model="subscribe.email" type="email" placeholder="Give an email, get the newsletter." class="min-w-[300px]">
						<template #trailing>
							<UButton
								type="submit"
								color="neutral"
								variant="link"
							><IconArrowright /></UButton>
						</template>
					</UInput>
				</UFormField>
			</UForm>
		</div>

		<div class="flex justify-between max-md:flex-col-reverse">
			<p>
				This is a portfolio project. Design was created by <ULink href="https://vitathemes.com/theme/shoppe/">VitaThemes</ULink>.
				<br/>
				Mock data is served by <ULink href="https://dummyjson.com/">DummyJSON</ULink>.
				<br/>
				Source <ULink href="https://github.com/DazzRune/Shoppe">repo</ULink>
			</p>
			<UButtonGroup class="h-[30px]">
				<div class="md:hidden flex items-center"><span>Follow us</span>&nbsp;<hr class="w-16 h-[2px] text-primary bg-primary border-none" />&nbsp;</div>
				<BtnIconOnly><IconMail /></BtnIconOnly>
				<BtnIconOnly><IconFacebook /></BtnIconOnly>
				<BtnIconOnly><IconInstagram /></BtnIconOnly>
				<BtnIconOnly><IconTwitter /></BtnIconOnly>
			</UButtonGroup>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { schemaSubscribe } from '../scripts/types';
import { COOKIE_REFRESH, useApi } from "../scripts/api";
import { useStore } from "../store";
import IconMail from "../assets/icons/mail.svg";
import IconFacebook from "../assets/icons/facebook.svg";
import IconInstagram from "../assets/icons/instagram.svg";
import IconTwitter from "../assets/icons/twitter.svg";
import IconArrowright from "../assets/icons/arrow-right.svg";

const store = useStore()
const {useDummy, getRefreshCookie} = useApi()

const subscribe = ref({
	email: ''
	// email: 'a@m.ru' // для теста
});
// 201
const postSubscriber = useDummy('http/201').post(subscribe).json();

async function onSubscribe() {
	await postSubscriber.execute()

	if (postSubscriber.error.value) {
		store.addAlert({
			isSuccess: false,
			description: `Failed to subscribe: ${postSubscriber.statusCode.value} - ${postSubscriber.error.value}`
		})
		return
	}
	store.addAlert({
		description: `Thank you for subscription!`
	})
}
</script>

<style scoped>

</style>
