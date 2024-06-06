import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sizes } from '../constants/sizes';

export default function useZoom() {
  // TODO: add "width" to the things returned by this hook
  // --> to properly scale SVG renderings of elements, if needed
  const [pixelRatio, setPixelRatio] = useState(2);
  const [zoom, setZoom] = useState(18);
  const [scale, setScale] = useState(36);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [width, setWidth] = useState(0);
  const zoomInvariantFontSize = (sizes.STAFF_HEIGHT * (2 / pixelRatio));

  const getZoomInvariantValue = useCallback((number) => zoomInvariantFontSize * number, [zoomInvariantFontSize]);

  const getStrokeWidth = useCallback(() => {
    return sizes.STAFF_LINE_STROKE_WIDTH * (2 / pixelRatio);
  }, [pixelRatio]);

  useEffect(() => {
    let _zoom = (1 / (((window.outerWidth - 10) / window.innerWidth) * 100)) * window.outerWidth;
    const _pixelRatio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    setPixelRatio(_pixelRatio);
    setZoom(_zoom);
    setScale(_zoom * _pixelRatio);
    setWidth(window.innerWidth);
    setStrokeWidth(getStrokeWidth());
  }, [getStrokeWidth]);

  // Calculate values for maintaining invariant stroke/fontSize/whatever size
  // on window resizing and zoom events
  useEffect(() => {
    function getPixelRatio() {
      return window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    }

    function setZoomValue() {
      if (pixelRatio !== getPixelRatio()) {
        // "zoom" resize event
        setPixelRatio(getPixelRatio());
        setZoom(getZoomValue());
      } else {
        // normal resize event
        setScale(getZoomValue() * pixelRatio.current);
        setPixelRatio(scale / getZoomValue());
      }
      setWidth(window.innerWidth);
    }

    function getZoomValue() {
      return (1 / (((window.outerWidth - 10) / window.innerWidth) * 100)) * window.outerWidth;
    }

    window.addEventListener("resize", setZoomValue, false);

    return () => {
      window.removeEventListener("resize", setZoomValue, false);
    }    
  }, [pixelRatio, scale, zoom]); 

  useEffect(() => {
    setStrokeWidth(getStrokeWidth());
  }, [getStrokeWidth, pixelRatio])

  return useMemo(() => ({
    getZoomInvariantValue,
    pixelRatio,
    scale,
    strokeWidth,
    width,
    zoom,
    zoomInvariantFontSize,
  }), [getZoomInvariantValue, pixelRatio, scale, strokeWidth, width, zoom, zoomInvariantFontSize]);
}