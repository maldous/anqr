import type { EditorProps } from './payload-editor-props';

export function runLookup(query: string, setPayloadGeo: EditorProps['setPayloadGeo']) {
  if (!query) return;
  fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data?.[0]) {
        setPayloadGeo({
          lat: Number.parseFloat(data[0].lat),
          lon: Number.parseFloat(data[0].lon),
        });
      }
    })
    .catch(() => {});
}
