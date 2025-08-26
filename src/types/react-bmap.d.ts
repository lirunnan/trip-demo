declare module 'react-bmap' {
  import { Component } from 'react'

  export interface MapProps {
    center?: { lng: number; lat: number } | string
    zoom?: number
    minZoom?: number
    maxZoom?: number
    mapType?: string
    enableScrollWheelZoom?: boolean
    onClick?: (e: any) => void
    onZoomEnd?: (e: any) => void
    className?: string
    style?: React.CSSProperties
  }

  export interface MarkerProps {
    position: { lng: number; lat: number }
    onClick?: (e: any) => void
    icon?: string
    offset?: { width: number; height: number }
    enableMassClear?: boolean
    enableDragging?: boolean
    enableClicking?: boolean
    raiseOnDrag?: boolean
    draggingCursor?: string
    rotation?: number
    shadow?: string
    title?: string
  }

  export interface InfoWindowProps {
    position: { lng: number; lat: number }
    text?: string
    title?: string
    width?: number
    height?: number
    maxWidth?: number
    offset?: { width: number; height: number }
    maxContent?: number
    onClose?: () => void
    onOpen?: () => void
    onMaximize?: () => void
    onRestore?: () => void
    enableCloseOnClick?: boolean
    enableAutoPan?: boolean
  }

  export interface PolylineProps {
    path: { lng: number; lat: number }[]
    strokeColor?: string
    strokeWeight?: number
    strokeOpacity?: number
    strokeStyle?: string
    enableMassClear?: boolean
    enableEditing?: boolean
    enableClicking?: boolean
    onClick?: (e: any) => void
  }

  export interface NavigationControlProps {
    anchor?: number
    offset?: { width: number; height: number }
    type?: number
    showZoomInfo?: boolean
    enableGeolocation?: boolean
  }

  export class Map extends Component<MapProps> {}
  export class Marker extends Component<MarkerProps> {}
  export class InfoWindow extends Component<InfoWindowProps> {}
  export class Polyline extends Component<PolylineProps> {}
  export class NavigationControl extends Component<NavigationControlProps> {}
}