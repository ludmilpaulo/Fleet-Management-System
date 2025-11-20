'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapEvents } from 'react-leaflet'

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, Search } from 'lucide-react'

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerProps {
  label: string
  lat?: number | null
  lng?: number | null
  address?: string
  onLocationChange: (lat: number | null, lng: number | null, address: string) => void
  className?: string
}

interface GeocodeResult {
  lat: number
  lon: number
  display_name: string
}

export default function LocationPicker({
  label,
  lat,
  lng,
  address: initialAddress,
  onLocationChange,
  className = '',
}: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress || '')
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  )
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const markerRef = useRef<L.Marker>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (lat && lng && (!position || position[0] !== lat || position[1] !== lng)) {
      setPosition([lat, lng])
    }
  }, [lat, lng])

  // Invalidate map size when component mounts or becomes visible (e.g., in dialog)
  useEffect(() => {
    if (isMounted && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isMounted])

  // Geocode address to coordinates (Address -> Lat/Lng)
  const handleGeocode = async () => {
    if (!address.trim()) {
      return
    }

    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Fleet-Management-System/1.0',
          },
        }
      )

      const data: GeocodeResult[] = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const newLat = parseFloat(String(result.lat || 0))
        const newLng = parseFloat(String(result.lon || 0))
        const newPosition: [number, number] = [newLat, newLng]

        setPosition(newPosition)
        onLocationChange(newLat, newLng, result.display_name)
        setAddress(result.display_name)
      } else {
        alert('Address not found. Please try a different address.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Failed to geocode address. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  // Reverse geocode coordinates to address (Lat/Lng -> Address)
  const handleReverseGeocode = async (newLat: number, newLng: number) => {
    setIsReverseGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`,
        {
          headers: {
            'User-Agent': 'Fleet-Management-System/1.0',
          },
        }
      )

      const data = await response.json()

      if (data && data.display_name) {
        setAddress(data.display_name)
        onLocationChange(newLat, newLng, data.display_name)
      } else {
        onLocationChange(newLat, newLng, '')
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      onLocationChange(newLat, newLng, address || '')
    } finally {
      setIsReverseGeocoding(false)
    }
  }

  // Handle map click to set marker position
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng
        const newPosition: [number, number] = [lat, lng]
        setPosition(newPosition)
        handleReverseGeocode(lat, lng)
      },
    })
    return null
  }

  // Handle marker drag end
  const handleMarkerDragEnd = async () => {
    if (markerRef.current) {
      const marker = markerRef.current
      const position = marker.getLatLng()
      const newPosition: [number, number] = [position.lat, position.lng]
      setPosition(newPosition)
      await handleReverseGeocode(position.lat, position.lng)
    }
  }

  // Default center (can be customized based on user location or company location)
  const defaultCenter: [number, number] = [51.505, -0.09] // London as default
  const mapCenter = position || defaultCenter

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor={`address-${label}`}>{label}</Label>
      
      {/* Address Input with Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            id={`address-${label}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address or click on map"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleGeocode()
              }
            }}
            className="pr-10"
          />
          {(isGeocoding || isReverseGeocoding) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleGeocode}
          disabled={isGeocoding || !address.trim()}
          variant="outline"
          className="shrink-0"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Map */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden" style={{ height: '300px' }}>
        {isMounted && typeof window !== 'undefined' && (
          <MapContainer
            center={mapCenter}
            zoom={position ? 15 : 2}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="z-0"
            ref={(map) => {
              if (map) {
                mapRef.current = map
                // Force map to invalidate size when container becomes visible (e.g., in dialog)
                setTimeout(() => {
                  if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
                    mapRef.current.invalidateSize()
                  }
                }, 200)
              }
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            {position && (
              <Marker
                position={position}
                draggable={true}
                ref={markerRef}
                eventHandlers={{
                  dragend: handleMarkerDragEnd,
                }}
                icon={L.icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Selected Location</div>
                    <div className="text-gray-600">{address || 'No address'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {/* Coordinates Display */}
      {position && (
        <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Lat:</span>
            <span className="font-mono">{position[0].toFixed(6)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Lng:</span>
            <span className="font-mono">{position[1].toFixed(6)}</span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 Tip: Enter an address and click "Search" or click directly on the map to set the location
      </p>
    </div>
  )
}

