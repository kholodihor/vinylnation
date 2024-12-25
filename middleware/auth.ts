export default defineNuxtRouteMiddleware(async (to) => {
  const user = await useAuthUser()

  // List of routes that require authentication
  const protectedRoutes = ['/checkout', '/orders', '/address', '/success']

  // Check if the route requires authentication
  if (protectedRoutes.includes(to.path) && !user) {
    return navigateTo('/auth')
  }
})
