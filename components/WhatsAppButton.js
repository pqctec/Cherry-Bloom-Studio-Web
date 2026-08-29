const PHONE = '51947499090' // Perú (51) + número. Cambialo si usas otro número para el negocio.

export default function WhatsAppButton({ text = 'Hola, quiero hacer una consulta', label = 'Escríbenos por WhatsApp', className = '' }) {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-ring inline-flex items-center gap-2 rounded-full bg-circuit px-6 py-3 font-display font-semibold text-ink-950 transition hover:bg-circuit-bright ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.86.5 3.6 1.36 5.1L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.5 22 22 17.52 22 12S17.5 2 12.02 2Zm0 18.1c-1.66 0-3.2-.47-4.5-1.28l-.32-.19-3 .79.8-2.93-.2-.3A8.07 8.07 0 0 1 3.9 12c0-4.48 3.65-8.12 8.12-8.12S20.14 7.52 20.14 12s-3.65 8.1-8.12 8.1Zm4.48-6.02c-.24-.12-1.44-.71-1.67-.8-.22-.08-.38-.12-.55.12-.16.24-.63.8-.77.97-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
      {label}
    </a>
  )
}
