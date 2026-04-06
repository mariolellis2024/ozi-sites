import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ScrollFadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  className?: string;
}

export default function ScrollFadeIn({ children, direction = 'up', className = '' }: ScrollFadeInProps) {
  const { ref, isVisible } = useIntersectionObserver();
  const dirClass = direction === 'up' ? 'fade-up' : direction === 'left' ? 'fade-left' : 'fade-right';

  return (
    <div ref={ref} className={`${dirClass} ${isVisible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
