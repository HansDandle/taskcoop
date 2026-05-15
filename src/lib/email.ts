import { shouldNotify, signUnsubscribeToken, type NotificationType } from './notification-prefs'
import { PLATFORM_FEE_PERCENT, WORKER_PAYOUT_RATIO } from './stripe'
import { APP_URL } from './urls'

const FROM_NAME = 'task.coop'
const FROM_EMAIL = 'hello@taskcoop.org'

function footer(userId: string | null, type: NotificationType | null) {
  if (!userId || !type) {
    return `<div style="padding:16px 24px;border-top:1px solid #e7e5e4;font-size:12px;color:#a8a29e">Member-owned local services marketplace · Austin, TX</div>`
  }
  const oneOff = signUnsubscribeToken(userId, type)
  const all = signUnsubscribeToken(userId, 'all')
  return `<div style="padding:16px 24px;border-top:1px solid #e7e5e4;font-size:12px;color:#a8a29e;line-height:1.6">
    Member-owned local services marketplace · Austin, TX<br>
    <a href="${APP_URL}/notifications/unsubscribe?token=${oneOff}" style="color:#a8a29e;text-decoration:underline">Unsubscribe from these emails</a>
    · <a href="${APP_URL}/profile/notifications" style="color:#a8a29e;text-decoration:underline">Manage all preferences</a>
    · <a href="${APP_URL}/notifications/unsubscribe?token=${all}" style="color:#a8a29e;text-decoration:underline">Unsubscribe from everything</a>
  </div>`
}

function baseTemplate(body: string, userId: string | null = null, type: NotificationType | null = null) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden">
    <div style="padding:20px 24px;border-bottom:1px solid #e7e5e4">
      <span style="font-size:18px;font-weight:600;color:#1c1917">task<span style="color:#16a34a">.coop</span></span>
    </div>
    <div style="padding:24px">${body}</div>
    ${footer(userId, type)}
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

async function send(to: string, subject: string, html: string, headers?: Record<string, string>) {
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
        ...(headers ? { headers } : {}),
      }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

// Send wrapper that checks prefs and adds List-Unsubscribe headers
async function sendTransactional(
  userId: string,
  to: string,
  type: NotificationType,
  subject: string,
  html: string,
) {
  if (!(await shouldNotify(userId, 'email', type))) return
  await send(to, subject, html)
}

export async function sendNewOfferEmail(userId: string, to: string, taskTitle: string, taskId: string, memberName: string, amount: number) {
  await sendTransactional(userId, to, 'new_offer', `New offer on "${taskTitle}"`, baseTemplate(`
    ${p(`<strong>${memberName}</strong> submitted a <strong>$${amount}</strong> offer on your task.`)}
    ${p(`Task: <em>${taskTitle}</em>`)}
    ${btn('Review offer', `${APP_URL}/tasks/${taskId}`)}
  `, userId, 'new_offer'))
}

export async function sendOfferAcceptedEmail(userId: string, to: string, taskTitle: string, taskId: string, amount: number) {
  await sendTransactional(userId, to, 'offer_accepted', `Your offer was accepted: "${taskTitle}"`, baseTemplate(`
    ${p('Great news. Your offer was accepted.')}
    ${p(`Task: <em>${taskTitle}</em><br>Amount: <strong>$${amount}</strong>`)}
    ${p('Payment will be released once the customer marks the task complete.')}
    ${btn('View task', `${APP_URL}/tasks/${taskId}`)}
  `, userId, 'offer_accepted'))
}

export async function sendOfferRejectedEmail(userId: string, to: string, taskTitle: string) {
  await sendTransactional(userId, to, 'offer_rejected', `Another offer was selected for "${taskTitle}"`, baseTemplate(`
    ${p(`The customer selected another member's offer for <em>${taskTitle}</em>.`)}
    ${p('Thanks for submitting. Keep browsing for other tasks that fit your skills.')}
    ${btn('Browse tasks', `${APP_URL}/tasks`)}
  `, userId, 'offer_rejected'))
}

export async function sendNewMessageEmail(userId: string, to: string, senderName: string, taskTitle: string, taskId: string, preview: string) {
  await sendTransactional(userId, to, 'new_message', `New message from ${senderName}`, baseTemplate(`
    ${p(`<strong>${senderName}</strong> sent you a message about <em>${taskTitle}</em>.`)}
    <div style="margin:12px 0;padding:12px 16px;background:#fafaf9;border-left:3px solid #e7e5e4;border-radius:4px;font-size:14px;color:#57534e;font-style:italic">"${preview.slice(0, 200)}${preview.length > 200 ? '…' : ''}"</div>
    ${btn('Reply', `${APP_URL}/messages/${taskId}`)}
  `, userId, 'new_message'))
}

export async function sendWorkerMarkedDoneEmail(userId: string, to: string, memberName: string, taskTitle: string, taskId: string) {
  await sendTransactional(userId, to, 'job_marked_done', `${memberName} says the job is done`, baseTemplate(`
    ${p(`<strong>${memberName}</strong> has marked your task <em>${taskTitle}</em> as complete.`)}
    ${p('Review any completion photos, then release payment when you\'re satisfied. You\'ll also be prompted to leave a rating.')}
    ${btn('Review and release payment', `${APP_URL}/tasks/${taskId}`)}
  `, userId, 'job_marked_done'))
}

export async function sendContactEmail(from: string, subject: string, category: string, message: string) {
  // Internal support email — no user pref check, no unsubscribe footer
  await send('support@taskcoop.org', `[${category}] ${subject}`, baseTemplate(`
    ${p(`<strong>From:</strong> ${from}`)}
    ${p(`<strong>Category:</strong> ${category}`)}
    ${p(`<strong>Subject:</strong> ${subject}`)}
    <div style="margin:12px 0;padding:12px 16px;background:#fafaf9;border-left:3px solid #e7e5e4;border-radius:4px;font-size:14px;color:#57534e;white-space:pre-wrap">${message}</div>
  `))
}

export async function sendPaymentReleasedEmail(userId: string, to: string, taskTitle: string, amount: number) {
  await sendTransactional(userId, to, 'payment_released', `Payment released: "${taskTitle}"`, baseTemplate(`
    ${p('Your payment is on the way.')}
    ${p(`Task: <em>${taskTitle}</em><br>Amount: <strong>$${(amount * WORKER_PAYOUT_RATIO).toFixed(2)}</strong> (after ${PLATFORM_FEE_PERCENT}% platform fee)`)}
    ${p('Funds typically arrive in your bank account within 2–7 business days depending on your Stripe payout schedule.')}
    ${btn('View dashboard', `${APP_URL}/dashboard`)}
  `, userId, 'payment_released'))
}

export async function sendReviewReceivedEmail(userId: string, to: string, reviewerName: string, rating: number, taskTitle: string, taskId: string) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  await sendTransactional(userId, to, 'review_received', `You received a ${rating}-star review`, baseTemplate(`
    ${p(`<strong>${reviewerName}</strong> left you a review for <em>${taskTitle}</em>.`)}
    <div style="margin:12px 0;font-size:20px;color:#16a34a">${stars}</div>
    ${btn('See your profile', `${APP_URL}/workers/me`)}
  `, userId, 'review_received'))
}
