export default function AcademyBrand({ className = '' }: { className?: string }) {
  return (
    <a
      className={`brand${className ? ` ${className}` : ''}`}
      href="/academy"
      aria-label="Tech Trailblazer Academy home"
    >
      <span className="brand-mark" aria-hidden="true">
        <span>↘</span>
      </span>
      <span className="brand-name">
        TECH
        <br />
        TRAILBLAZER
        <br />
        <small>ACADEMY</small>
      </span>
    </a>
  );
}
