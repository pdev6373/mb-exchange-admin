import L from 'leaflet'
import 'leaflet.heat'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface HeatmapLayerProps {
  data: Array<[number, number, number]>
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ data }) => {
  const map = useMap()

  useEffect(() => {
    const heatLayer = L.heatLayer(data, {
      radius: 25,
    })
    heatLayer.addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, data])

  return null
}

export default HeatmapLayer
