/* nortec/js/subscribe.js
   Handles email capture → Supabase
   Set your env vars in Vercel:
     SUPABASE_URL
     SUPABASE_ANON_KEY
   Or replace the URL/key below for local dev
*/

const SUPABASE_URL  = window.ENV_SUPABASE_URL  || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY  = window.ENV_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const TABLE         = 'subscribers';

export async function submitEmail(email, source = 'homepage') {
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Invalid email' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        email:      email.toLowerCase().trim(),
        source,
        created_at: new Date().toISOString(),
        status:     'active',
      }),
    });

    if (res.status === 201 || res.status === 200) {
      return { ok: true };
    }
    // Handle duplicate
    if (res.status === 409) {
      return { ok: true, duplicate: true };
    }
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.message || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/* Global handler — used inline in HTML */
window.handleSub = async function(e) {
  e.preventDefault();
  const form   = e.target;
  const input  = form.querySelector('input[type="email"]');
  const btn    = form.querySelector('button');
  const email  = input?.value || '';
  const source = form.dataset.source || 'homepage';

  if (!email) return;

  btn.disabled = true;
  btn.textContent = 'Sending...';

  const result = await submitEmail(email, source);

  if (result.ok) {
    btn.textContent = '✓ You\'re in!';
    btn.style.background = 'var(--teal)';
    input.value = '';
    input.placeholder = 'Welcome to Nortec 🎉';
    // Redirect to thank-you / survey after 1.2s
    setTimeout(() => {
      window.location.href = `/tracker?welcome=1&email=${encodeURIComponent(email)}`;
    }, 1200);
  } else {
    btn.disabled = false;
    btn.textContent = 'Try again';
    btn.style.background = 'var(--orient-red)';
    console.error('Subscribe error:', result.error);
  }
};
