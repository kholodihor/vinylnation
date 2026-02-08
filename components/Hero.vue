<template>
  <div class="w-full mx-auto xl:flex mt-[0.5rem] mb-[2rem] xl:gap-4 xl:max-w-[1600px]">
    <div class="flex-1 xl:max-w-[50%]">
      <NuxtImg
        src="/atta.webp"
        class="object-cover w-full h-full xl:rounded-lg"
        alt="Sigur Ros - Atta"
        loading="eager"
        format="webp"
        sizes="100vw xl:50vw"
        :width="800"
        :height="600"
      />
    </div>
    <div class="flex-1 flex-col xl:max-w-[50%] xl:gap-4">
      <div class="flex xl:gap-4">
        <NuxtImg
          src="/giftbox.webp"
          class="object-cover w-1/2 xl:max-w-[50%] xl:rounded-lg"
          alt="Gift Box"
          loading="lazy"
          format="webp"
          sizes="50vw xl:25vw"
          :width="400"
          :height="300"
        />
        <NuxtImg
          src="/giftcards.webp"
          class="object-cover w-1/2 xl:max-w-[50%] xl:rounded-lg"
          alt="Gift Cards"
          loading="lazy"
          format="webp"
          sizes="50vw xl:25vw"
          :width="400"
          :height="300"
        />
      </div>
      <div class="xl:mt-4">
        <NuxtImg
          src="/layer.webp"
          class="object-cover w-full xl:rounded-lg"
          alt="Free Delivery"
          loading="lazy"
          format="webp"
          sizes="100vw xl:50vw"
          :width="800"
          :height="200"
        />
      </div>
    </div>
  </div>
</template>
