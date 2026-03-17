import { useQRStore } from "@/store/qr-store";

export function openNativeColorPicker(palette: string[], index: number): void {
  const input = document.createElement("input");
  input.type = "color";
  input.value = palette[index];
  input.onchange = (e) => {
    const newPalette = [...palette];
    newPalette[index] = (e.target as HTMLInputElement).value;
    useQRStore.setState((s) => ({
      render: { ...s.render, palette: newPalette },
    }));
  };
  input.click();
}
