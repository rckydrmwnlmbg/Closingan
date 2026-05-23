"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({ overdueCount = 0 }: { overdueCount?: number }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Inbox", href: "/inbox", icon: "💬" },
    { name: "Follow-ups", href: "/follow-ups", icon: "📅", badge: overdueCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 md:hidden pb-safe">
      {links.map((link) => {
        const isActive = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] font-medium">{link.name}</span>
            {link.badge !== undefined && link.badge > 0 && (
              <span className="absolute top-1 right-1/4 translate-x-2 -translate-y-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
