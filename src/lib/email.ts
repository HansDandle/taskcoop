const FROM_NAME = 'task.coop'
const FROM_EMAIL = 'hello@taskcoop.org'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://taskcoop.org'

function baseTemplate(body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden">
    <div style="padding:20px 24px;border-bottom:1px solid #e7e5e4">
      <span style="font-size:18px;font-weight:600;color:#1c1917">task<span style="color:#16a34a">.coop</span></span>
    </div>
    <div style="padding:24px">${body}</div>
    <div style="padding:16px 24px;border-top:1px solid #e7e5e4;font-size:12px;color:#a8a29e">
      Member-owned local services marketplace · Austin, TX
    </div>
  </div>
</body>
</html>`
}

function btn(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">${text}</a>`
}

function p(text: string) {
  return `<p style="margin:0 0 12px;font-size:15px;color:#44403c;line-height:1.6">${text}</p>`
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.BREVO_API_KEY) return
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

export async function sendNewOfferEmail(to: string, taskTitle: string, taskId: string, memberName: string, amount: number) {
  await send(to, `New offer on "${taskTitle}"`, baseTemplate(`
    ${p(`<strong>${memberName}</strong> submitted a <strong>$${amount}</strong> offer on your task.`)}
    ${p(`Task: <em>${taskTitle}</em>`)}
    ${btn('Review offer', `${APP_URL}/tasks/${taskId}`)}
  `))
}

export async function sendOfferAcceptedEmail(to: string, taskTitle: string, taskId: string, amount: number) {
  await send(to, `Your offer was accepted: "${taskTitle}"`, baseTemplate(`
    ${p('Great news. Your offer was accepted.')}
    ${p(`Task: <em>${taskTitle}</em><br>Amount: <strong>$${amount}</strong>`)}
    ${p('Payment will be released once the customer marks the task complete.')}
    ${btn('View task', `${APP_URL}/tasks/${taskId}`)}
  `))
}

export async function sendOfferRejectedEmail(to: string, taskTitle: string) {
  await send(to, `Another offer was selected for "${taskTitle}"`, baseTemplate(`
    ${p(`The customer selected another member's offer for <em>${taskTitle}</em>.`)}
    ${p('Thanks for submitting. Keep browsing for other tasks that fit your skills.')}
    ${btn('Browse tasks', `${APP_URL}/tasks`)}
  `))
}

export async function sendNewMessageEmail(to: string, senderName: string, taskTitle: string, taskId: string, preview: string) {
  await send(to, `New message from ${senderName}`, baseTemplate(`
    ${p(`<strong>${senderName}</strong> sent you a message about <em>${taskTitle}</em>.`)}
    <div style="margin:12px 0;padding:12px 16px;background:#fafaf9;border-left:3px solid #e7e5e4;border-radius:4px;font-size:14px;color:#57534e;font-style:italic">"${preview.slice(0, 200)}${preview.length > 200 ? '…' : ''}"</div>
    ${btn('Reply', `${APP_URL}/messages/${taskId}`)}
  `))
}

export async function sendPaymentReleasedEmail(to: string, taskTitle: string, amount: number) {
  await send(to, `Payment released: "${taskTitle}"`, baseTemplate(`
    ${p('Your payment is on the way.')}
    ${p(`Task: <em>${taskTitle}</em><br>Amount: <strong>$${(amount * 0.95).toFixed(2)}</strong> (after 5% platform fee)`)}
    ${p('Funds typically arrive in your bank account within 2–7 business days depending on your Stripe payout schedule.')}
    ${btn('View dashboard', `${APP_URL}/dashboard`)}
  `))
}

export async function sendReviewReceivedEmail(to: string, reviewerName: string, rating: number, taskTitle: string, taskId: string) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  await send(to, `You received a ${rating}-star review`, baseTemplate(`
    ${p(`<strong>${reviewerName}</strong> left you a review for <em>${taskTitle}</em>.`)}
    <div style="margin:12px 0;font-size:20px;color:#16a34a">${stars}</div>
    ${btn('See your profile', `${APP_URL}/workers/me`)}
  `))
}
