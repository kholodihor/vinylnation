<template>
  <div class="w-full bg-[#fafafa] border-b md:block hidden">
    <ul
      class="flex items-center justify-end text-sm text-[#333333] font-light px-2 h-10 bg-[#fafafa] max-w-[1200px]"
    >
      <NuxtLink to="/add">
        <li class="border-r border-r-gray-400 px-3 hover:text-[#f8d210] cursor-pointer">
          Add a Vinyl
        </li>
      </NuxtLink>
      <li class="border-r border-r-gray-400 px-3 hover:text-[#f8d210] cursor-pointer">
        <a href="https://www.youtube.com/@MyAnalogJournal/videos" target="_blank">
          Listen to the vinyl music
        </a>
      </li>
      <UserMenu />
    </ul>
  </div>
</template>

<script setup lang="ts"></script>
