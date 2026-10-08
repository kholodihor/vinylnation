<template>
  <div>
    <div id="AddressPage" class="mt-4 max-w-[500px] mx-auto px-2">
      <div class="mx-auto bg-white rounded-lg p-3">
        <div class="text-xl text-bold mb-2">Address Details</div>
        <form @submit.prevent="submit()">
          <TextInput
            v-model:input="form.name"
            class="w-full"
            placeholder="Contact Name"
            input-type="text"
            :error="error && error.type === 'name' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.address"
            class="w-full mt-2"
            placeholder="Address"
            input-type="text"
            :error="error && error.type === 'address' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.zipcode"
            class="w-full mt-2"
            placeholder="Zip Code"
            input-type="text"
            :error="error && error.type === 'zipcode' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.city"
            class="w-full mt-2"
            placeholder="City"
            input-type="text"
            :error="error && error.type === 'city' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.country"
            class="w-full mt-2"
            placeholder="Country"
            input-type="text"
            :error="error && error.type === 'country' ? error.message : ''"
          />

          <button
            :disabled="isWorking"
            type="submit"
            class="mt-6 bg-gradient-to-r from-[#FE630C] to-[#FF3200] w-full text-white text-[21px] font-semibold p-1.5 rounded-full"
          >
            <div v-if="!isWorking">{{ currentAddress ? 'Update Address' : 'Save Address' }}</div>
            <Icon v-else name="eos-icons:loading" size="25" class="mr-2" />
          </button>
          <p v-if="submitError" class="mt-3 text-center text-sm text-red-600">{{ submitError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IAddress, IError } from '~/types'

  type Field = 'name' | 'address' | 'zipcode' | 'city' | 'country'

  const REQUIRED: Array<[Field, string]> = [
    ['name', 'A contact name is required'],
    ['address', 'An address is required'],
    ['zipcode', 'A zip code is required'],
    ['city', 'A city is required'],
    ['country', 'A country is required'],
  ]

  const { data: currentAddress } = await useFetch<IAddress | null>('/api/address')

  const error = ref<IError | null>(null)
  const submitError = ref('')
  const isWorking = ref(false)

  const form = reactive<Record<Field, string>>({
    name: currentAddress.value?.name ?? '',
    address: currentAddress.value?.address ?? '',
    zipcode: currentAddress.value?.zipcode ?? '',
    city: currentAddress.value?.city ?? '',
    country: currentAddress.value?.country ?? '',
  })

  const submit = async () => {
    submitError.value = ''
    const missing = REQUIRED.find(([field]) => !form[field].trim())
    error.value = missing ? { type: missing[0], message: missing[1] } : null
    if (error.value) return

    isWorking.value = true
    try {
      await $fetch('/api/address', { method: 'PUT', body: form })
      await navigateTo('/checkout')
    } catch (err: any) {
      submitError.value = err?.data?.message || 'Could not save the address'
    } finally {
      isWorking.value = false
    }
  }
</script>
