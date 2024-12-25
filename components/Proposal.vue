<template>
  <div class="h-full min-h-[60vh] w-full p-2 lg:flex gap-2 mb-6">
    <div class="p-2">
      <img src="/sellvinyl.jpg" alt="" />
    </div>
    <div class="p-2 flex flex-col justify-evenly gap-2">
      <p class="mb-4">
        <span class="inline-block text-lg italic mb-4"
          >Vinyl record sales keep spinning and spinning – with no end in sight</span
        >
        Just over 41 million vinyl records were sold in 2022, to the tune of $1.2bn (£.99bn). Only
        33 million CDs were sold, amounting to $483m. It was the 16th consecutive year of growth for
        record sales, about 71% of physical format revenues. Recorded music revenue in the US grew
        for the seventh consecutive year and reached a record high of $15.9bn.
      </p>
      <NuxtLink to="/add">
        <button class="border border-black px-6 py-2 hover:bg-[#f8d210] rounded-lg transition-all">
          Have a vinyl to sell?
        </button>
      </NuxtLink>
    </div>
  </div>
</template>
