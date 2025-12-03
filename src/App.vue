<template>
	<UApp>
		<UContainer class="grid grid-rows-[auto_1fr_auto] min-h-[100vh]">
			<TheHeader />

			<!-- <TestTest /> -->
			<!-- <PageTest /> -->

			<!-- <Suspense>
				<RouterView />

				<template #fallback>
					Product Filter Loading...
				</template>
			</Suspense> -->
			<main>
				<RouterView />
			</main>

			<TheFooter />
		</UContainer>
	</UApp>
</template>

<script setup lang="ts">

</script>
