import Image from 'next/image';

export default function AcademyBrand({
  className = '',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <a
      className={`brand${className ? ` ${className}` : ''}`}
      href="/academy"
      aria-label="Tech Trailblazer Academy home"
    >
      <Image
        className="brand-logo"
        src="/academy-logo.webp"
        alt="Tech Trailblazer Academy"
        width={830}
        height={223}
        unoptimized
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </a>
  );
}
