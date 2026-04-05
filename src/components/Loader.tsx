'use client';

import { Loader2 } from 'lucide-react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ text = 'Loading...', fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className="w-8 h-8 animate-spin text-prime-500" />
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
