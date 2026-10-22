// Colores por país (acento que cambia durante el viaje) y por tipo de evento
export const COUNTRY = {
  CR: { name: 'Costa Rica', flag: '🇨🇷', color: '#0d9488' },
  ES: { name: 'España', flag: '🇪🇸', color: '#ea580c' },
  GB: { name: 'Reino Unido', flag: '🇬🇧', color: '#2563eb' },
  BE: { name: 'Bélgica', flag: '🇧🇪', color: '#d4a106' },
  NL: { name: 'Países Bajos', flag: '🇳🇱', color: '#f97316' },
  DE: { name: 'Alemania', flag: '🇩🇪', color: '#64748b' },
  CZ: { name: 'Chequia', flag: '🇨🇿', color: '#dc2626' },
  AT: { name: 'Austria', flag: '🇦🇹', color: '#e11d48' },
  PT: { name: 'Portugal', flag: '🇵🇹', color: '#16a34a' }
}
export const DEFAULT_ACCENT = '#6366f1'
export const countryInfo = c => COUNTRY[c] || { name: c || '', flag: '🌍', color: DEFAULT_ACCENT }

export const TYPE = {
  flight: { label: 'Vuelo', color: '#6366f1', icon: 'plane' },
  transport: { label: 'Traslado', color: '#0ea5e9', icon: 'train' },
  sight: { label: 'Visita', color: '#10b981', icon: 'pin' },
  food: { label: 'Comida', color: '#f59e0b', icon: 'utensils' },
  lodging: { label: 'Hotel', color: '#8b5cf6', icon: 'bed' },
  logistics: { label: 'Logística', color: '#64748b', icon: 'luggage' },
  meetup: { label: 'Encuentro', color: '#ec4899', icon: 'users' }
}
export const typeInfo = t => TYPE[t] || { label: t || 'Evento', color: '#64748b', icon: 'pin' }

// Códigos WMO del clima → icono y texto
export function wmo(code) {
  if (code == null) return { icon: '·', label: '' }
  if (code <= 1) return { icon: '☀️', label: 'Despejado' }
  if (code === 2) return { icon: '⛅', label: 'Parcialmente nublado' }
  if (code === 3) return { icon: '☁️', label: 'Nublado' }
  if (code <= 48) return { icon: '🌫️', label: 'Niebla' }
  if (code <= 57) return { icon: '🌦️', label: 'Llovizna' }
  if (code <= 67) return { icon: '🌧️', label: 'Lluvia' }
  if (code <= 77) return { icon: '❄️', label: 'Nieve' }
  if (code <= 82) return { icon: '🌦️', label: 'Chubascos' }
  if (code <= 86) return { icon: '🌨️', label: 'Chubascos de nieve' }
  return { icon: '⛈️', label: 'Tormenta' }
}
