import { Check } from 'lucide-react';

interface CheckItemProps {
  children: React.ReactNode;
  fade?: boolean;
}

export default function CheckItem({ children, fade = true }: CheckItemProps) {
  return (
    <li className={`check-item${fade ? ' fade-up visible' : ''}`}>
      <Check size={20} />
      <span>{children}</span>
    </li>
  );
}
