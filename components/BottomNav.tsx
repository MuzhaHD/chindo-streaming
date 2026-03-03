"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Clock, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/popular", label: "Popular", icon: TrendingUp },
  { href: "/new", label: "New", icon: Clock },
  { href: "/profile?tab=watchlist", label: "Watchlist", icon: Heart, auth: true },
  { href: "/profile", label: "Profil", icon: User, auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const filteredItems = navItems.filter((item) => {
    if (item.auth && status !== "authenticated") {
      return false;
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-gray-800">
      <div className="flex items-center justify-around h-16">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === "/" && pathname === "/") ||
            (item.href.startsWith("/profile") && pathname.startsWith("/profile"));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-accent-gold" : "text-foreground-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}