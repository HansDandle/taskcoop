import { deleteOffer } from './actions'

export default function DeleteOfferButton({ offerId }: { offerId: string }) {
  return (
    <form action={deleteOffer.bind(null, offerId)}>
      <button type="submit" className="text-xs text-stone-400 hover:text-red-500 transition-colors" title="Delete offer">
        ✕
      </button>
    </form>
  )
}
