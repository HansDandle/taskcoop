'use client'

import { useRef, useCallback } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import { getZipCoords } from '@/lib/zip-coords'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

type Task = {
  id: string
  title: string
  budget: number | null
  zip_code: string | null
  categories: { name: string; slug: string } | null
}

export default function TaskMap({ tasks }: { tasks: Task[] }) {
  const [selected, setSelected] = useState<Task | null>(null)

  const plotted = tasks.flatMap(t => {
    if (!t.zip_code) return []
    const coords = getZipCoords(t.zip_code)
    if (!coords) return []
    // Jitter overlapping pins slightly so they don't stack exactly
    const jitter = () => (Math.random() - 0.5) * 0.008
    return [{ task: t, lng: coords[0] + jitter(), lat: coords[1] + jitter() }]
  })

  return (
    <div className="w-full h-72 rounded-lg overflow-hidden border border-stone-200 mb-6">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''}
        initialViewState={{ longitude: -97.7800, latitude: 30.3200, zoom: 8.5 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={() => setSelected(null)}
      >
        {plotted.map(({ task, lng, lat }) => (
          <Marker
            key={task.id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={e => { e.originalEvent.stopPropagation(); setSelected(task) }}
          >
            <div className="w-6 h-6 bg-emerald-600 rounded-full border-2 border-white shadow cursor-pointer hover:scale-110 transition-transform flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </Marker>
        ))}

        {selected && (() => {
          const pin = plotted.find(p => p.task.id === selected.id)
          if (!pin) return null
          return (
            <Popup
              longitude={pin.lng}
              latitude={pin.lat}
              anchor="bottom"
              offset={28}
              onClose={() => setSelected(null)}
              closeButton={false}
              className="task-map-popup"
            >
              <Link href={`/tasks/${selected.id}`} className="block p-1 hover:opacity-80">
                <div className="font-semibold text-stone-900 text-sm leading-tight">{selected.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  {selected.categories && (
                    <span className="text-xs text-stone-400">{selected.categories.name}</span>
                  )}
                  {selected.budget && (
                    <span className="text-xs font-medium text-emerald-700">{formatCurrency(selected.budget)}</span>
                  )}
                </div>
              </Link>
            </Popup>
          )
        })()}
      </Map>
    </div>
  )
}
