<template>
  <MainLayout>
    <div id="AddressPage" class="mt-4 max-w-[500px] mx-auto px-2">
      <div class="mx-auto bg-white rounded-lg p-3">
        <div class="text-xl text-bold mb-2">Address Details</div>
        <form @submit.prevent="submit()">
          <TextInput
            v-model:input="form.name"
            class="w-full"
            placeholder="Contact Name"
            input-type="text"
            :error="error && error.type == 'contactName' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.address"
            class="w-full mt-2"
            placeholder="Address"
            input-type="text"
            :error="error && error.type == 'address' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.zipCode"
            class="w-full mt-2"
            placeholder="Zip Code"
            input-type="text"
            :error="error && error.type == 'zipCode' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.city"
            class="w-full mt-2"
            placeholder="City"
            input-type="text"
            :error="error && error.type == 'city' ? error.message : ''"
          />

          <TextInput
            v-model:input="form.country"
            class="w-full mt-2"
            placeholder="Country"
            input-type="text"
            :error="error && error.type == 'country' ? error.message : ''"
          />

          <button
            :disabled="isWorking"
            type="submit"
            class="mt-6 bg-gradient-to-r from-[#FE630C] to-[#FF3200] w-full text-white text-[21px] font-semibold p-1.5 rounded-full"
          >
            <div v-if="!isWorking">Update Address</div>
            <Icon v-else name="eos-icons:loading" size="25" class="mr-2" />
          </button>
        </form>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IAddress, IError } from '~/types'
  import { useUserStore } from '~/stores/user'

  const userStore = useUserStore()
  const user = ref(await useAuthUser())

  const currentAddress = ref<IAddress | null>(null)
  const error = ref<IError | null>(null)
  const isUpdate = ref(false)
  const isWorking = ref(false)

  const form = reactive({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
  })

  watchEffect(async () => {
    if (user.value) {
      const res = await useFetch<IAddress>(`/api/prisma/get-address-by-user/${user.value.id}`)
      currentAddress.value = res.data.value
      if (currentAddress.value) {
        form.name = currentAddress.value.name
        form.address = currentAddress.value.address
        form.zipCode = currentAddress.value.zipCode
        form.city = currentAddress.value.city
        form.country = currentAddress.value.country
        isUpdate.value = true
      }
      userStore.isLoading = false
    }
  })

  const submit = async () => {
    isWorking.value = true
    error.value = null
    if (!form.name) {
      error.value = {
        type: 'contactName',
        message: 'A contact name is required',
      }
    } else if (!form.address) {
      error.value = {
        type: 'address',
        message: 'An address is required',
      }
    } else if (!form.zipCode) {
      error.value = {
        type: 'zipCode',
        message: 'A zip code is required',
      }
    } else if (!form.city) {
      error.value = {
        type: 'city',
        message: 'A city is required',
      }
    } else if (!form.country) {
      error.value = {
        type: 'country',
        message: 'A country is required',
      }
    }
    if (error.value) {
      isWorking.value = false
      return
    }
    if (isUpdate.value) {
      if (user.value && currentAddress.value) {
        await useFetch(`/api/prisma/update-address/${currentAddress.value.id}`, {
          method: 'PATCH',
          body: {
            userId: user.value.id,
            name: form.name,
            address: form.address,
            zipCode: form.zipCode,
            city: form.city,
            country: form.country,
          },
        })
        isWorking.value = false
        return navigateTo('/checkout')
      }
    }

    if (user.value) {
      await useFetch(`/api/prisma/add-address/`, {
        method: 'POST',
        body: {
          userId: user.value.id,
          name: form.name,
          address: form.address,
          zipCode: form.zipCode,
          city: form.city,
          country: form.country,
        },
      })
    }
    isWorking.value = false
    return navigateTo('/checkout')
  }
</script>
