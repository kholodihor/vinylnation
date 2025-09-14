export default defineEventHandler(() => {
  return { ok: true, service: 'vapi', time: new Date().toISOString() }
})