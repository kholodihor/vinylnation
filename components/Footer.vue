<template>
  <div class="p-4 bg-black text-white flex justify-center items-center mt-[2rem]">
    <p>Copyright &copy; {{ currentYear }} byCold</p>
  </div>
</template>

<script setup>
  const currentYear = new Date().getFullYear().toString()
</script>
