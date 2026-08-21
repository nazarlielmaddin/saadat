/** Custom brand icons (crisp SVG, currentColor). */

export function CrescentMoon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20.6 14.4a8.6 8.6 0 1 1-11-11A7 7 0 0 0 20.6 14.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16.2 7.6c.4 1.9.9 4.3 1.6 6.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 8-pointed star — subtle Islamic geometric motif. */
export function Octagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 1.6 14 9l7.4-2-4.4 6.4L24 12l-7 1.4 4.4 6.4L14 18l-2 7.4L10 18l-7.4 2L7 13.4 0 12l7-1.4L2.6 4.2 10 6.2 12 1.6Z" transform="translate(0 -1.2)" opacity="0.9" />
    </svg>
  );
}
