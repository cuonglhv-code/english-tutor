// app/tutor/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import HomeScreenClient from './HomeScreenClient'

/**
 * Server component — validates auth then hands off to the client shell.
 * Middleware already redirects unauthenticated users, but this double-check
 * keeps the pattern consistent with /dashboard etc.
 */
export default async function TutorHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/tutor')

  return <HomeScreenClient userId={user.id} />
}
