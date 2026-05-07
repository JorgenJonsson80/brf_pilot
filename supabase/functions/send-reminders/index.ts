import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // behöver admin för att läsa auth.users
)

Deno.serve(async () => {
  // Hitta åtaganden med deadline om exakt 3 dagar som fortfarande är öppna
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  const deadline = threeDaysFromNow.toISOString().split('T')[0]

  const { data: commitments, error } = await supabase
    .from('commitments')
    .select(`
      title,
      deadline,
      meeting_ref,
      profiles!assigned_to (
        id,
        full_name
      )
    `)
    .eq('deadline', deadline)
    .eq('status', 'open')

  if (error) {
    console.error('Kunde inte hämta åtaganden:', error)
    return new Response('Fel vid hämtning', { status: 500 })
  }

  for (const commitment of commitments ?? []) {
    const profile = commitment.profiles as { id: string; full_name: string }
    if (!profile?.id) continue

    // Hämta e-postadress från auth.users
    const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
    if (!user?.email) continue

    // Skicka påminnelse via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND-KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BRF Copilot <onboarding@resend.dev>',
        to: user.email,
        subject: `Påminnelse: "${commitment.title}" – deadline om 3 dagar`,
        html: `
          <p>Hej ${profile.full_name ?? 'styrelsemedlem'},</p>
          <p>Du har ett åtagande med deadline <strong>${commitment.deadline}</strong></p>
          <p><strong>${commitment.title}</strong></p>
          ${commitment.meeting_ref ? `<p>Från: ${commitment.meeting_ref}</p>` : ''}
          <p>Logga in i BRF Copilot och markera det som klart när det är gjort.</p>
        `,
      }),
    })

    if (!res.ok) {
      console.error(`Kunde inte skicka mail till ${user.email}:`, await res.text())
    } else {
      console.log(`Påminnelse skickad till ${user.email} för "${commitment.title}"`)
    }
  }

  return new Response('OK')
})
