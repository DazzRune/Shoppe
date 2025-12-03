import { createRouter, createWebHistory } from 'vue-router'
import PageHome from '../pages/PageHome.vue'
import Page404 from '../pages/Page404.vue'
import ProductFilter from '../components/ProductFilter.vue'
import PageAccount from '../pages/PageAccount.vue'
import PageAuth from '../pages/PageAuth.vue'
import PageOrder from '../pages/PageOrder.vue'
import PageProduct from '../pages/PageProduct.vue'
import PageCart from '../pages/PageCart.vue'
import PageCheckout from '../pages/PageCheckout.vue'
import PageCategories from '../pages/PageCategories.vue'
import PageEmptycart from '../pages/PageEmptycart.vue'

const router = createRouter({
	routes: [
		{
			path: '/',
			name: 'home',
			component: PageHome,
		},
		{
			path: '/products',
			name: 'products',
			component: ProductFilter,
		},
		{
			path: '/product/:id',
			name: 'product',
			component: PageProduct,
		},
		{
			path: '/cart',
			name: 'cart',
			component: PageCart,
		},
		{
			path: '/checkout',
			name: 'checkout',
			component: PageCheckout,
		},
		{
			path: '/auth',
			name: 'auth',
			component: PageAuth,
		},
		{
			path: '/account',
			name: 'account',
			component: PageAccount,
			meta: { requiresAuth: true },
		},
		{
			path: '/orders/:id',
			name: 'orders',
			component: PageOrder,
			meta: { requiresAuth: true },
		},
		{
			path: '/categories',
			name: 'categories',
			component: PageCategories,
		},
		{
			path: '/emptycart',
			name: 'emptycart',
			component: PageEmptycart,
		},
		{ path: '/:pathMatch(.*)', component: Page404 },

		// для теста
		// {
		// 	path: '/:test*', //-> /some/test/path/?q=10&t=hello
		// 	component: PageTest,
		// },
	],
	history: createWebHistory(),
})

export default router
