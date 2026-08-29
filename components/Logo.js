export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 46 46"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="44" height="44" rx="9" fill="#081D3D" stroke="#6FC3FF" strokeWidth="2" />
      <g stroke="#9FD6FF" strokeWidth="1.3" fill="none" strokeLinecap="round" transform="translate(23,23) scale(0.62)">
        <path d="M0 -12 C -4 -6, -4 0, 0 0 C 4 0, 4 -6, 0 -12 Z" />
        <path d="M0 -12 C 6 -9, 10 -4, 8 0 C 4 2, -2 0, 0 -12 Z" />
        <path d="M8 0 C 12 5, 10 11, 5 11 C 2 9, 2 3, 8 0 Z" />
        <path d="M0 0 C 0 6, -3 11, -8 10 C -9 6, -6 1, 0 0 Z" />
        <path d="M0 0 C -6 0, -11 -4, -9 -8 C -5 -10, -1 -6, 0 0 Z" />
      </g>
      <circle cx="23" cy="23" r="2" fill="#DDEFFF" />
    </svg>
  )
}
