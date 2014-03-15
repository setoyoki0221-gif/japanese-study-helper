"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, PenLine, MessagesSquare, History, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/units", label: "Units", icon: BookOpen },
  { href: "/test/word", label: "Word Test", icon: PenLine },
  { href: "/test/text", label: "Sentence Test", icon: MessagesSquare },
  { href: "/history", label: "History", icon: History },
];

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

export default function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
              日
            </span>
            <span className="hidden text-base sm:inline">日本語テスト</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(userName)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="truncate">{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t px-2 py-2 md:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className="size-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
