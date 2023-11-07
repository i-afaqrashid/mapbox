import React from 'react'
import dynamic from 'next/dynamic'

function index() {
  const Map = dynamic(() => import('./Map'), { ssr: false })
  return <Map />
}

export default index
