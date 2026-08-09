import { ArrowUp, ArrowDown, ArrowRight, ChevronsUp, ChevronsDown } from 'lucide-react';

export default function PriorityIcon({ priority, className = "w-4 h-4" }) {
  switch (priority?.toLowerCase()) {
    case 'highest':
    case 'urgent':
      return <ChevronsUp className={`${className} text-danger`} aria-label="Highest priority" />;
    case 'high':
      return <ArrowUp className={`${className} text-warning`} aria-label="High priority" />;
    case 'medium':
      return <ArrowRight className={`${className} text-warning`} aria-label="Medium priority" />;
    case 'low':
      return <ArrowDown className={`${className} text-accent`} aria-label="Low priority" />;
    case 'lowest':
      return <ChevronsDown className={`${className} text-sub`} aria-label="Lowest priority" />;
    default:
      return <ArrowRight className={`${className} text-sub`} aria-label="Default priority" />;
  }
}
