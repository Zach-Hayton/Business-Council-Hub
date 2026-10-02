import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useApp, useMe } from "@/lib/app";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink, LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Wordmark } from "./brand";
const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/organizations", label: "Organizations" },
  { href: "/today", label: "Today" },
];
interface DemoUser {
  id: number;
  name: string;
  role: string;
  blurb: string;
}
export function AccountSwitcher({
  onSelect,
}: {
  onSelect?: () => void;
} = {}) {
  const { userId, setUserId } = useApp();
  const [, nav] = useLocation();
  const { data: users } = useQuery<DemoUser[]>({ queryKey: ["/api/users"] });
  const current = users?.find((u) => u.id === userId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-account">
          <UserRound className="h-4 w-4" />
          <span className="max-w-[110px] truncate">
            {current ? current.name : "Officer sign in"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Sample accounts. Changes stay in this tab and reset on reload.
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users?.map((u) => (
          <DropdownMenuItem
            key={u.id}
            data-testid={`menu-user-${u.id}`}
            onClick={() => {
              setUserId(u.id);
              nav(u.role === "admin" ? "/admin" : "/workspace");
              onSelect?.();
            }}
            className="gap-2 py-3"
          >
            <span className="w-4">{u.id === userId && <Check className="h-4 w-4" />}</span>
            <span>
              <span className="block text-sm font-medium">{u.name}</span>
              <span className="text-xs text-muted-foreground">
                {u.role === "admin" ? "Council administration" : "Organization editor"}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
        {userId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setUserId(null);
                nav("/discover");
                onSelect?.();
              }}
              data-testid="menu-signout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loc] = useLocation();
  const { dark, setDark } = useApp();
  const { data: me } = useMe();
  const nav = [
    ...NAV,
    ...(me?.editorOrgIds.length || me?.role === "admin"
      ? [{ href: "/workspace", label: "Workspace" }]
      : []),
    ...(me?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-5 px-4 sm:px-8">
        <Link href="/" data-testid="link-home" className="shrink-0">
          <Wordmark />
        </Link>
        <nav className="ml-5 hidden items-center gap-6 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-testid={`link-nav-${n.label.toLowerCase()}`}
              className={cn(
                "border-b-2 py-6 text-sm transition hover:text-foreground",
                loc.startsWith(n.href)
                  ? "border-[#FFB81C] text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
            data-testid="button-theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="hidden xl:block">
            <AccountSwitcher />
          </div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label="Open menu"
                data-testid="button-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle>Business Council</SheetTitle>
              <div className="mt-8 flex flex-col gap-2">
                {nav.map((n) => (
                  <SheetClose asChild key={n.href}>
                    <Link href={n.href} className="py-3 text-base">
                      {n.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-5">
                  <AccountSwitcher onSelect={() => setMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="mt-20 border-t bg-[#0f3527] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <img
              src="./images/clubs/baylor-logo.svg"
              alt="Baylor University"
              className="h-12 w-36 object-contain"
            />
            <div className="border-l border-white/25 pl-6 text-sm">
              Business Council
              <br />
              <span className="text-white/60">Hankamer School of Business</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/80">
            <Link href="/discover">Events</Link>
            <Link href="/organizations">Organizations</Link>
            <Link href="/guide">Help</Link>
            <a
              href="https://baylor.campuslabs.com/engage/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              Baylor Connect <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/15 pt-5 text-[11px] text-white/55">
          <span>
            Public prototype with sample listings. Edits reset on reload. Not an official Baylor
            service.
          </span>
          <Link href="/credits" className="underline underline-offset-2">
            Photo & content credits
          </Link>
        </div>
      </div>
    </footer>
  );
}
export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b bg-secondary/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">{title}</h1>
          {children && (
            <div className="mt-3 text-base leading-relaxed text-muted-foreground">{children}</div>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
