import { CheckSquare, Bug, Bookmark, FileText } from 'lucide-react';

export default function IssueTypeIcon({ type, className = "w-4 h-4" }) {
  switch (type?.toLowerCase()) {
    case 'story':
      return <Bookmark className={`${className} text-story`} fill="currentColor" aria-label="Story" />;
    case 'bug':
      return <Bug className={`${className} text-danger`} fill="currentColor" aria-label="Bug" />;
    case 'task':
      return <CheckSquare className={`${className} text-task`} fill="currentColor" aria-label="Task" />;
    case 'epic':
      return <FileText className={`${className} text-epic`} fill="currentColor" aria-label="Epic" />;
    default:
      return <CheckSquare className={`${className} text-task`} fill="currentColor" aria-label="Task" />;
  }
}
