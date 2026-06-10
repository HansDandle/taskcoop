import { dismissLead } from './actions'

export default function DismissLeadButton({ taskId }: { taskId: string }) {
  return (
    <form action={dismissLead.bind(null, taskId)}>
      <button type="submit" className="text-xs text-stone-400 hover:text-red-500 transition-colors" title="Dismiss">
        ✕
      </button>
    </form>
  )
}
