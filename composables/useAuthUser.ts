import type { User } from '@supabase/supabase-js'
import { ref } from 'vue'

export const useAuthUser = async () => {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    user.value = authUser
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    user.value = null
  }

  return user.value
}
