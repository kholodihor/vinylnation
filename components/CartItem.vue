<template>
  <div class="flex justify-start my-2">
    <div class="my-auto">
      <div
        class="flex items-center justify-start p-0.5 cursor-pointer"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
      >
        >
        <div
          class="flex items-center justify-center h-[20px] w-[20px] rounded-full border mr-5 ml-2"
          :class="[
            isHover ? 'border-[#FD374F]' : 'border-gray-600',
            isSelected ? 'bg-[#FD374F]' : '',
          ]"
          @click="isSelected = !isSelected"
        >
          <div class="h-[8px] w-[8px] rounded-full bg-white" />
        </div>
      </div>
    </div>

    <img class="rounded-md md:w-[150px] w-[90px]" :src="product.url" />

    <div class="overflow-hidden pl-2 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center justify-between truncate">
          <div class="truncate">{{ product.title }}</div>
        </div>
        <button class="mx-3 sm:block hidden -mt-0.5 hover:text-red-500" @click="removeFromCart()">
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>

      <div class="text-xl font-semibold">
        $ <span class="font-bold">{{ product.price / 100 }}</span>
      </div>

      <p class="text-[#009A66] text-xs font-semibold pt-1">Over 11-day free delivery</p>

      <p class="text-[#009A66] text-xs font-semibold pt-1">Free Shipping</p>

      <div class="flex items-center justify-end">
        <button class="sm:hidden block -mt-0.5 hover:text-[#7954a1]" @click="removeFromCart()">
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'
  const userStore = useUserStore()

  const props = defineProps<{
    product: IProduct
  }>()

  const { product } = toRefs(props)

  const emit = defineEmits(['selectedRadio'])

  const isHover = ref(false)
  const isSelected = ref(false)

  const removeFromCart = () => {
    userStore.cart.forEach((prod, index) => {
      if (prod.id === product.value.id) {
        userStore.cart.splice(index, 1)
      }
    })
  }

  watch(
    () => isSelected.value,
    (val) => {
      emit('selectedRadio', { id: product.value.id, val })
    }
  )
</script>
