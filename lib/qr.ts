
import QRCode from "qrcode";
export async function qrDataURL(text: string) {
  return await QRCode.toDataURL(text, { margin: 1, scale: 6 });
}
