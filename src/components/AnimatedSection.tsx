'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Extra reveal-delay-N class, e.g. "reveal-delay-2" */
  delayClass?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wraps children with a scroll-reveal animation.
 * Adds `.visible` when the element enters the viewport.
 */
export default function AnimatedSection({
  children,
  className,
  delayClass,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -44px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    /* @ts-expect-error – dynamic tag */
    <Tag ref={ref} className={cn('reveal', delayClass, className)}>
      {children}
    </Tag>
  );
}
