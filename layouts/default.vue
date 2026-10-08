<template>
  <div class="w-full fixed z-50">
    <LayoutTopBar />
    <LayoutMainHeader />
  </div>

  <div class="lg:pt-[6rem] md:pt-[4rem] pt-[2rem]" />
  <slot />

  <Footer />

  <!-- Global Voice Assistant FAB -->
  <VapiCallButton />
</template>
