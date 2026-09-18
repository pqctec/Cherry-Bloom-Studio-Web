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

  // default: chip
  return (
    <svg {...common}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9 3v2M12 3v2M15 3v2M9 19v2M12 19v2M15 19v2M3 9h2M3 12h2M3 15h2M19 9h2M19 12h2M19 15h2" />
    </svg>
  )
}
