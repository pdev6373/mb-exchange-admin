import * as L from 'leaflet'

declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: { radius?: number; blur?: number; maxZoom?: number }
  ): L.Layer
}
