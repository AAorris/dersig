'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Key Signing',
    href: '/key/signing',
    description: 'Generate and manage signing keys'
  },
  {
    name: 'Key Encryption',
    href: '/key/encryption',
    description: 'Generate and manage encryption keys'
  },
  {
    name: 'Signed Note',
    href: '/signed-note',
    description: 'Create and verify signed notes'
  }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-foreground">
                DerSig
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    )}
                    title={item.description}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border'
                )}
              >
                <div>{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 