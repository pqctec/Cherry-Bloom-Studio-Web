export default function CategoryIcon({ name, className = '' }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  }

  if (name === 'wrench') {
    return (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
      </svg>
    )
  }

  if (name === 'gift') {
    return (
      <svg {...common}>
        <rect x="3" y="8" width="18" height="13" rx="1.5" />
        <path d="M3 12h18M12 8v13" />
        <path d="M12 8c-2 0-3.5-1.2-3.5-3S9.5 2 11 2c1.5 0 1.7 3.2 1 6Zm0 0c2 0 3.5-1.2 3.5-3S13.5 2 12 2c-1.5 0-1.7 3.2-1 6Z" />
      </svg>
    )
  }

  // Arreglos de mesa (bodas)
  if (name === 'flower') {
    return (
      <svg {...common}>
        <circle cx="12" cy="9" r="2.1" />
        <path d="M12 6.9c-1.4-1.6-3.8-1.3-4.1.5-.3 1.5 1 2.6 2.4 2.6M12 6.9c1.4-1.6 3.8-1.3 4.1.5.3 1.5-1 2.6-2.4 2.6M12 11.1c-1.4 1.6-1.1 3.8.5 4.1 1.5.3 2.6-1 2.6-2.4M12 11.1c1.4 1.6 1.1 3.8-.5 4.1-1.5.3-2.6-1-2.6-2.4" />
        <path d="M12 15.4V22" />
      </svg>
    )
  }

  // Decoración de entrada / arco (bodas)
  if (name === 'arch') {
    return (
      <svg {...common}>
        <path d="M5 21V12a7 7 0 0 1 14 0v9" />
        <path d="M3 21h5M16 21h5" />
      </svg>
    )
  }

  // Panel de firmas (bodas)
  if (name === 'signature') {
    return (
      <svg {...common}>
        <path d="M14.2 4.3 19.7 9.8 10.5 19H5v-5.5Z" />
        <path d="M3 20h7" />
      </svg>
    )
  }

  // Mesa de fotos (bodas)
  if (name === 'camera') {
    return (
      <svg {...common}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7l1.4-2.3h5.2L16 7" />
        <circle cx="12" cy="13.5" r="3.2" />
      </svg>
    )
  }

  // default: chip
  return (
    <svg {...common}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9 3v2M12 3v2M15 3v2M9 19v2M12 19v2M15 19v2M3 9h2M3 12h2M3 15h2M19 9h2M19 12h2M19 15h2" />
    </svg>
  )
}
