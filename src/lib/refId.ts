export function generateRefId(prefix: string = "PLN"): string {
  const timestamp = Date.now(); // milidetik saat ini
  const random = Math.floor(Math.random() * 1000); // angka random biar unik
  return `${prefix}${timestamp}${random}`;
}
