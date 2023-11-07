import React, { memo, useMemo, useEffect } from 'react'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import leaflet from 'leaflet'
import app from '../../utils/firebase'

const firestore = getFirestore(app)

const InnerComponent = memo(
  ({ center, allMarkers }: { center: any; allMarkers: any }) => {
    const mapRef = useMap()
    useEffect(() => {
      mapRef.setView(center, mapRef.getZoom())
    }, [center])

    const createDocument = async (currentlySelectedMarker: {
      location: number[]
      timestamp: number
    }) => {
      await addDoc(
        collection(firestore, 'markers'),
        JSON.parse(JSON.stringify(currentlySelectedMarker)),
      )
    }

    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        const currentlySelectedMarker = {
          location: [lat, lng],
          timestamp: Date.now(),
        }
        createDocument(currentlySelectedMarker)
      },
    })

    const locationIcon = leaflet.icon({
      iconUrl: '/location.svg',
      iconSize: [32, 64],
      iconAnchor: [16, 32],
    })
    console.log(allMarkers, 'kk')
    return (
      <>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allMarkers?.map((item: any, index: number) => (
          <div key={index.toString()}>
            <Marker position={item.location} icon={locationIcon}>
              <Popup>
                <div>Latitude: {item?.location?.[0]} </div>
                <div>Longitude: {item?.location?.[1]} </div>
                <div>timestamp: {item?.timestamp} </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </>
    )
  },
)

function Map() {
  const ref = collection(firestore, 'markers')
  const [data] = useCollection(ref)

  const allMarkers = useMemo(() => {
    if (data?.docs?.length) {
      const placedMarkers = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return placedMarkers
    }
    return null
  }, [data])

  const position = [51.505, -0.09]
  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="w-screen h-screen"
    >
      <MapContainer
        className="w-screen h-screen"
        center={position}
        zoom={13}
        scrollWheelZoom={false}
      >
        <InnerComponent center={position} allMarkers={allMarkers} />
      </MapContainer>
    </div>
  )
}

export default Map
