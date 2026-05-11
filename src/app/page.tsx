import Link from 'next/link'
import { CATEGORIES } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

const SERVICE_GROUPS = [
  {
    label: 'Home & Repairs',
    icon: '🔧',
    services: ['Furniture assembly', 'TV mounting', 'Minor repairs', 'Painting', 'Gutter cleaning'],
  },
  {
    label: 'Tech & Smart Home',
    icon: '📡',
    services: ['Wi-Fi & mesh network setup', 'Smart home installation', 'Computer repair', 'Security cameras', 'Streaming device setup', 'Home office setup'],
    highlight: true,
  },
  {
    label: 'Outdoor',
    icon: '🌿',
    services: ['Lawn care', 'Pressure washing', 'Pool maintenance', 'Brush cleanup', 'Seasonal yard work'],
  },
  {
    label: 'Moving & Hauling',
    icon: '📦',
    services: ['Local moving help', 'Junk removal', 'Donation runs', 'Loading & unloading'],
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('id, title, budget, zip_code, created_at, categories(name, slug)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-stone-100 text-stone-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Austin's local services cooperative
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-6">
            Trusted local help for home,<br />tech, and everyday tasks.
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            From furniture assembly and yard work to Wi-Fi troubleshooting and smart home setup,
            task.coop connects you with reliable, skilled local experts who take pride in their work.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tasks/new" className="bg-emerald-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-emerald-700 transition-colors">
              Post a Task
            </Link>
            <Link href="/tasks" className="bg-white text-stone-700 border border-stone-300 px-8 py-3 rounded-md font-semibold hover:border-stone-500 transition-colors">
              Browse open tasks
            </Link>
          </div>
        </div>
      </section>

      {/* Service groups */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">What we help with</h2>
        <p className="text-stone-500 text-sm mb-10">Skilled members available across a wide range of household and technical services.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_GROUPS.map((group) => (
            <div
              key={group.label}
              className={`rounded-lg border p-5 ${group.highlight ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-200 bg-white'}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{group.icon}</span>
                <h3 className={`font-semibold text-sm ${group.highlight ? 'text-emerald-800' : 'text-stone-800'}`}>{group.label}</h3>
                {group.highlight && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Popular</span>
                )}
              </div>
              <ul className="space-y-1.5">
                {group.services.map((s) => (
                  <li key={s} className="text-xs text-stone-500 flex items-start gap-1.5">
                    <span className="text-stone-300 mt-0.5">–</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/tasks?category=${cat.slug}`}
              className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-400 mb-1">Local</div>
            <div className="text-sm text-stone-400 leading-relaxed">Austin-based members you can meet, message, and rely on again</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 mb-1">Skilled</div>
            <div className="text-sm text-stone-400 leading-relaxed">Vetted generalists who show up equipped and get the job done right</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400 mb-1">5% fee</div>
            <div className="text-sm text-stone-400 leading-relaxed">Transparent pricing. Members keep 95%, so they&apos;re motivated to do excellent work</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-10 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Describe the job', desc: 'Post what you need, with as much detail as you have. Photos welcome. Free to post, no commitment.' },
            { step: '02', title: 'Review local experts', desc: 'Members send offers. Browse their profiles, reviews, and past work. Message them directly.' },
            { step: '03', title: 'Get it done right', desc: 'Accept an offer and pay securely through the platform. Funds release when the job is complete.' },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="text-4xl font-bold text-stone-300 mb-3">{item.step}</div>
              <h3 className="font-semibold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/how-it-works" className="text-sm text-emerald-600 hover:underline font-medium">
            Learn more about how task.coop works →
          </Link>
        </div>
      </section>

      {/* Recent tasks */}
      {recentTasks && recentTasks.length > 0 && (
        <section className="bg-white border-t border-stone-200">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-stone-900">Recent tasks in Austin</h2>
              <Link href="/tasks" className="text-sm text-emerald-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="border border-stone-200 rounded-lg p-4 hover:border-stone-400 hover:shadow-sm transition-all bg-stone-50"
                >
                  <div className="text-xs text-stone-400 mb-1">{(task.categories as any)?.name}</div>
                  <div className="font-semibold text-stone-900 truncate">{task.title}</div>
                  <div className="text-sm text-stone-500 mt-1">
                    {task.budget ? `Budget: $${task.budget}` : 'Open to offers'} · {task.zip_code ?? 'Austin'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Worker CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Build a sustainable local practice.</h2>
        <p className="text-stone-500 mb-8 max-w-xl mx-auto leading-relaxed">
          task.coop is built for capable people who want to do good work and keep what they earn.
          Other platforms take 20–30%. We take 5%. Member-owners set the rules.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup?role=worker" className="bg-stone-900 text-white px-8 py-3 rounded-md font-semibold hover:bg-stone-800 transition-colors">
            Apply to join as a member
          </Link>
          <Link href="/cooperative" className="text-stone-700 border border-stone-300 px-8 py-3 rounded-md font-semibold hover:border-stone-500 transition-colors">
            How the co-op works
          </Link>
        </div>
      </section>
    </div>
  )
}
