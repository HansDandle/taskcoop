export default function TaskExpectations() {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4 space-y-2 text-xs text-stone-500 leading-relaxed">
      <p className="font-semibold text-stone-700 text-sm">Before you post</p>
      <ul className="space-y-1.5 list-none">
        <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Members see only your ZIP until you accept an offer; your full address is shared after.</li>
        <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Once a job is done, you&apos;ll mark it complete and rate the member. They&apos;ll rate you too; ratings go both ways.</li>
        <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>Payment is held securely and released to the member when you mark the job complete.</li>
        <li className="flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>You can message members directly before accepting any offer.</li>
      </ul>
    </div>
  )
}
