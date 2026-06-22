// Datos de contacto del sitio (un solo lugar para reutilizar en todas las páginas).

/** WhatsApp en formato internacional sin signos (para wa.me y tel:). */
export const WHATSAPP = '573124249342';
/** WhatsApp para mostrar al usuario. */
export const WHATSAPP_DISPLAY = '+57 312 424 9342';
/** Enlace directo a WhatsApp. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP}`;
/** Correo de soporte/contacto. */
export const EMAIL = 'carwebsoporte@gmail.com';

/** Construye un enlace mailto con asunto opcional. */
export function mailto(subject?: string): string {
  return subject ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}` : `mailto:${EMAIL}`;
}
