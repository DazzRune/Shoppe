import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import ui from "@nuxt/ui/vite"
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
	base: '/ShoppeApp',
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		vue(),
		tailwindcss(),
		svgLoader(),
		ui({
			// colorMode: false, // включен по умолч. vueuse интегрированный интерфейс переключения темы + автоматическое хранение в storage
			components: {
				globs: ["src/**/*.vue"], // nuxtui unplugin-vue-components - интегрированный автоимпорт компонентов
			},
			ui: {
				colors: {
					tertiary: "green", // для теста, собственный токен (возможность не работает в этой версии nuxtui)
				},
				container: {
					base: "sm:px-12 lg:px-24",
				},
				input: {
					slots: {
						base: "peer ring-0! bg-none rounded-none border-b-2 border-neutral hover:border-neutral-dark focus:border-primary",
						root: "w-full",
					},
					defaultVariants: {
						variant: "none",
					},
				},
				select: {
					slots: {
						base: "peer w-full ring-0! bg-none rounded-none border-b-2 border-neutral hover:border-neutral-dark focus:border-primary",
						trailingIcon:
							"group-data-[state=open]:rotate-180 transition-transform duration-200",
					},
					defaultVariants: {
						variant: "none",
					},
				},
				formField: {
					slots: {
						root: "relative py-6", // py-6 - в качестве пространства для плавающих лэйблов и ошибок
						error: "absolute right-0 -bottom-[0.5em] mt-0 animate-input-error",
					},
				},
				inputMenu: {
					variants: {
						variant: {
							soft: "text-black bg-neutral",
						},
					},
					defaultVariants: {
						variant: "soft",
					},
				},
				textarea: {
					slots: {
						base: "peer ring-0! bg-none rounded-none border-b-2 border-neutral hover:border-neutral-dark focus:border-primary",
						root: "w-full",
					},
					defaultVariants: {
						variant: "none",
					},
				},
				inputNumber: {
					slots: {
						base: "w-[8em]",
						increment: "[&>button]:text-black",
						decrement: "[&>button]:text-black",
					},
					variants: {
						variant: {
							soft: "text-black bg-neutral",
						},
					},
					defaultVariants: {
						variant: "soft",
					},
				},

				button: {
					slots: {
						base: "justify-center uppercase cursor-pointer",
					},
					compoundVariants: [
						{
							color: "primary",
							variant: "solid",
							class: "hover:bg-secondary hover:text-primary hover:ring",
						},
						{
							color: "secondary",
							variant: "outline",
							class: "hover:bg-primary hover:text-secondary ring ring-inset ring-primary text-primary",
						},
					],
				},
				link: {
					base: "cursor-pointer",
				},
				card: {
					slots: {
						header: "p-0 sm:p-0",
						body: "p-0 sm:p-0",
						footer: "p-0 sm:p-0",
					},
				},
				tabs: {
					slots: {
						trigger: "cursor-pointer",
					},
					variants: {
						variant: {
							pill: {
								list: "", // полоса табов
								trigger: "", // таб
								indicator: "", // фон таба
							},
							link: {
								// на малых разрешениях табы будут горизонтально прокручиваться
								root: "items-start",
								list: "max-md:overflow-x-scroll overflow-y-visible max-md:[scrollbar-width:none] lg:w-auto", // полоса табов
								trigger: "max-md:min-w-auto", // таб
								indicator: "max-md:bottom-0!", // линия под табом
							},
						},
					},
					compoundVariants: [
						{
							color: "primary",
							variant: "pill",
							class: {
								list: "rounded-2xl",
								indicator: "bg-secondary rounded-2xl",
								trigger:
									"data-[state=active]:text-primary data-[state=inactive]:text-black",
							},
						},
					],
				},
				table: {
					slots: {
						thead: "uppercase",
						tbody: "capitalize",
						separator: "bg-primary", // линия под заголовками
					},
				},
				carousel: {
					slots: {
						viewport: "h-full gradiented",
						container: "h-full",
						item: "h-full",
						dot: "bg-secondary",
					},
					variants: {
						active: {
							true: {
								dot: "data-[state=active]:bg-neutral border-1 border-secondary size-5",
							},
						},
					},
				},
				badge: {
					variants: {
						color: {
							secondary: 'text-primary!',
							success: 'text-white!',
						}
					}
				},
				alert: {
					slots: {
						root: "rounded-none border-t-2 opacity-95 normal-case",
						description: "text-black text-start",
						icon: "text-accent",
					},
					defaultVariants: {
						color: "info",
						// variant: 'soft',
						orientation: "horizontal",
					},
				},
				separator: {
					slots: {
						border: 'border-neutral!'
					}
				},
				skeleton: {
					base: "gradiented"
				},
			},
			theme: {
				colors: ["primary", "secondary", "tertiary", "info", "success", "warning", "error"],
			},
		}),
	],
})
