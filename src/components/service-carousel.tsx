'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type ServiceGroup = {
  label: string
  icon: string
  services: string[]
  highlight?: boolean
}

const INTERVAL = 3500

export default function ServiceCarousel({ groups }: { groups: ServiceGroup[] }) {
  const total = groups.length

  // Responsive: how many cards to show
  const [visible, setVisible] = useState(4)
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisible(1)
      else if (window.innerWidth < 1024) setVisible(2)
      else setVisible(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Seamless infinite loop: clone [last N] at front, [first N] at end
  const cloneCount = visible
  const extended = [
    ...groups.slice(-cloneCount),
    ...groups,
    ...groups.slice(0, cloneCount),
  ]

  // index into extended array; real cards start at cloneCount
  const [index, setIndex] = useState(cloneCount)
  const [animated, setAnimated] = useState(true)
  const pausedRef = useRef(false)

  // Keep index in sync when visible count changes (e.g. resize)
  const indexRef = useRef(index)
  indexRef.current = index
  useEffect(() => {
    setIndex(cloneCount)
  }, [cloneCount])

  const advance = useCallback(() => {
    setAnimated(true)
    setIndex(i => i + 1)
  }, [])

  useEffect(() => {
    if (pausedRef.current) return
    const id = setInterval(advance, INTERVAL)
    return () => clearInterval(id)
  }, [advance])

  const handleTransitionEnd = () => {
    // Snap from clone back to real item — no animation
    if (index >= cloneCount + total) {
      setAnimated(false)
      setIndex(cloneCount)
    } else if (index < cloneCount) {
      setAnimated(false)
      setIndex(cloneCount + total - 1)
    }
  }

  const currentReal = ((index - cloneCount) % total + total) % total

  const goTo = (realIdx: number) => {
    setAnimated(true)
    setIndex(cloneCount + realIdx)
  }
  const prev = () => { setAnimated(true); setIndex(i => i - 1) }
  const next = () => { setAnimated(true); setIndex(i => i + 1) }

  const cardPct = 100 / visible

  return (
    <div
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div className="overflow-hidden">
        <div
          style={{ transform: `translateX(-${index * cardPct}%)` }}
          className={`flex items-stretch ${animated ? 'transition-transform duration-500 ease-in-out' : ''}`}
          onTransitionEnd={handleTransitionEnd}
        >
          {extended.map((group, i) => (
            <div
              key={i}
              style={{ minWidth: `${cardPct}%` }}
              className="px-2.5"
            >
              <div className={`rounded-lg border p-5 h-full flex flex-col ${group.highlight ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-200 bg-white'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl" aria-hidden="true">{group.icon}</span>
                  <h3 className={`font-semibold text-sm ${group.highlight ? 'text-emerald-800' : 'text-stone-800'}`}>
                    {group.label}
                  </h3>
                  {group.highlight && (
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Popular</span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {group.services.map((s) => (
                    <li key={s} className="text-sm text-stone-600 flex items-start gap-1.5">
                      <span className="text-stone-400 mt-0.5" aria-hidden="true">–</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={prev}
          aria-label="Previous"
          className="w-8 h-8 bg-white border border-stone-200 rounded-full shadow-sm flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors text-lg leading-none"
        >
          ‹
        </button>

        <div className="flex gap-1.5" role="tablist" aria-label="Service categories">
          {groups.map((g, i) => (
            <button
              key={g.label}
              role="tab"
              aria-selected={i === currentReal}
              aria-label={g.label}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentReal ? 'w-4 bg-emerald-600' : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="w-8 h-8 bg-white border border-stone-200 rounded-full shadow-sm flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors text-lg leading-none"
        >
          ›
        </button>
      </div>
    </div>
  )
}
