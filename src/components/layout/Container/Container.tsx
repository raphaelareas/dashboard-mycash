import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <main className="
      w-full min-h-screen
      px-4 md:px-6 lg:px-8
      pt-16 lg:pt-0
      max-w-[1400px] xl:max-w-[1600px]
      mx-auto
    ">
      {children}
    </main>
  );
}
