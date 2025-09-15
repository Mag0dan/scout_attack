import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `WYS - ${title}`;

    // Cleanup function to reset to default title when component unmounts
    return () => {
      document.title = "WYS - Security Dashboard";
    };
  }, [title]);
}