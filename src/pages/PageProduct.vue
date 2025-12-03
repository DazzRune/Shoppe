<template>
	<div>
		<SkeletonProduct v-if="isProductFetching" />

		<div v-else-if="product">
			<div class="md:flex [&>*]:md:w-1/2">
				<ProductGallery :product="product" />
				<UCard class="md:ml-[5%]">
					<template #header>
						<h3>{{ product.title }}</h3>
						<ProductPrice :product="product" />
					</template>

					<div class="flex gap-x-2 mt-8">
						<vue3-star-ratings v-model="product.rating" starSize="20" disableClick />
						<span>{{ product.reviews.length }} customer review</span>
					</div>
					<p class="mt-4">{{ product.description }}</p>
					<div v-if="product.stock" class="flex justify-between mt-4">
						<!-- если уже в корзине, работаем с amount самого товара, иначе - вхолостую переключаем счетчик -->
						<CartProductAmount
							v-if="productInCart"
							v-model="productInCart.amount"
							class="hidden md:block! mr-[2%]"
						/>
						<CartProductAmount
							v-else
							v-model="amount"
							class="hidden md:block! mr-[2%]"
						/>
						<BtnAddToCart
							v-if="product.stock"
							:product="product"
							:amount="amount"
							color="secondary"
							variant="outline"
							class="grow"
						/>
					</div>
					<p v-else class="text-errors mt-4">Out of stock</p>

					<template #footer>
						<UButtonGroup class="items-center mt-[1em] h-[30px]">
							<BtnIconOnly><IconHeart /></BtnIconOnly>
							<USeparator orientation="vertical" class="mx-[1em] h-[1em]" />
							<BtnIconOnly><IconMail /></BtnIconOnly>
							<BtnIconOnly><IconFacebook /></BtnIconOnly>
							<BtnIconOnly><IconInstagram /></BtnIconOnly>
							<BtnIconOnly><IconTwitter /></BtnIconOnly>
						</UButtonGroup>
						<p class="mt-4">Categories: {{ product.category }}</p>
					</template>
				</UCard>
			</div>
			<!-- defaultValue - индекс таба по умолч, с 0 -->
			<UTabs :items="tabs" :defaultValue="'0'" variant="link" class="">
				<template #description="{ item }">
					<p>{{ product.description }}</p>
				</template>

				<template #details="{ item }">
					<ul>
						<li>
							<b>Size:</b>
							200x500x1000 mm
						</li>
						<li>
							<b>Weight:</b>
							0.3 kg
						</li>
					</ul>
				</template>

				<template #reviews="{ item }">
					<div class="md:flex [&>*]:md:w-1/2">
						<div>
							<h4>{{ reviews.length }} Reviews for {{ product.title }}</h4>
							<ul>
								<li v-for="review in reviews" class="py-2">
									<p>
										<span class="text-heading4">{{ review.reviewerName }}</span>
										<span class="ml-[1em] text-body-sm">
											{{ new Date(review.date).toDateString() }}
										</span>
									</p>
									<vue3-star-ratings
										v-model="review.rating"
										starSize="10"
										disableClick
									/>
									<p class="mt-3">{{ review.comment }}</p>
									<USeparator class="mt-3" />
								</li>
							</ul>
						</div>
						<div class="md:ml-[5%]">
							<h4>Add a Review</h4>
							<span>
								Your email address will not be published. Required fields are marked
								*
							</span>
							<FormReview @submit="onReviewSubmit" />
						</div>
					</div>
				</template>
			</UTabs>
		</div>

		<h3 class="text-start!">Similar</h3>
		<SkeletonProductList v-if="getProducts.isFetching.value" />
		<ProductList v-else :products="getProducts.data.value?.products || []" />
	</div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent, TabsItem } from "@nuxt/ui"
import { computed, onMounted, ref, watch } from "vue"
import { onPatchReviewsTransformer, productTransformer, useApi } from "../scripts/api"
import { useRoute, useRouter } from "vue-router"
import { useStore } from "../store"
import type { TReview, TProduct, TSchemaReview } from "../scripts/types"
import IconHeart from "../assets/icons/heart.svg";
import IconMail from "../assets/icons/mail.svg";
import IconFacebook from "../assets/icons/facebook.svg";
import IconInstagram from "../assets/icons/instagram.svg";
import IconTwitter from "../assets/icons/twitter.svg";

const { useDummy, useDummySensitive } = useApi()
const store = useStore()

const router = useRouter()
const route = useRoute()

const getUser = useDummySensitive("auth/me").get().json()

const urlProduct = computed(() => `products/${route.params.id}`)
const urlProducts = computed(() =>
	product.value ? `products/category/${product.value.category}?limit=3` : ""
)

const { data: product, isFetching: isProductFetching } = useDummy(urlProduct, {
	immediate: true,
	refetch: true,
	afterFetch(ctx) {
		ctx.data = productTransformer(ctx.data)

		return ctx
	},
})
	.get()
	.json()

const getProducts = useDummy(urlProducts, {
	immediate: true,
	refetch: true,
})
	.get()
	.json()

const productInCart = computed((): TProduct | undefined => {
	return store.getCartProduct(product.value.id)
})

const tabs = [
	{
		label: "Description",
		slot: "description" as const,
	},
	{
		label: "Additional Information",
		slot: "details" as const,
	},
	{
		label: "Reviews",
		slot: "reviews" as const,
	},
] satisfies TabsItem[]

const reviews = ref<TReview[]>([])

const amount = ref(1)

watch(
	() => product.value?.reviews,
	(newValue, oldValue) => {
		reviews.value = [...(product.value?.reviews || "")]
	}
)

async function onReviewSubmit(state: TSchemaReview) {
	await getUser.execute()
	if (getUser.error.value) {
		store.addAlert({ isSuccess: false, description: "Please log in to review!" })
		return
	}

	const data: { reviews: TReview[] } = {
		reviews: onPatchReviewsTransformer(
			state,
			{
				firstName: getUser.data.value.firstName,
				lastName: getUser.data.value.lastName,
				email: getUser.data.value.email,
			},
			reviews.value
		)
	}

	// dummyJSON на patch-запрос товара возвращает его КРАТКИЙ объект, где нет обновленного поля "reviews". поэтому сами прикрепляем его в интерсепторе afterFetch
	const postReview = await useDummySensitive(urlProduct, {
		immediate: true,
		afterFetch(ctx) {
			ctx.data = {
				...ctx.data,
				...data,
			}
			return ctx
		},
	})
		.patch(data)
		.json()

	if (postReview.error.value) {
		store.addAlert({
			isSuccess: false,
			description: `Patch review failed ${postReview.error.value}`,
		})
		return
	}

	reviews.value = postReview.data.value.reviews
	store.addAlert({ description: `Review was submited!` })
}
</script>
