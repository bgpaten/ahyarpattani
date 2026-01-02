
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProjectDisplayMode = 'mobile' | 'web' | 'backend' | 'devops' | 'default';

export const getProjectDisplayMode = (
  categories: { type: string }[] | undefined
): ProjectDisplayMode => {
  if (!categories || categories.length === 0) return 'default';

  // Check types in specific priority order
  const types = categories.map(c => c.type);

  if (types.includes('mobile')) return 'mobile';
  if (types.includes('web')) return 'web';
  if (types.includes('backend')) return 'backend';
  if (types.includes('devops')) return 'devops';

  return 'default';
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
