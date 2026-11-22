import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { findNavItem } from "./navigation";
import { SidebarNav } from "./sidebar-nav";
import {UserMenu} from "./user-menu"
import { ErrorBoundary } from "@/components/error-boundary";

function Brand() {
    return (
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          TO
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">TalentOps</span>
      </div>
    );
  }


export function AppLayout() {
    const {pathname} = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false); 

    const current = findNavItem(pathname);

    return(
        <div className="min-h-screen bg-background">
        {/* Desktop sidebar (hidden on small screens) */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card lg:flex",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <Brand />
          <SidebarNav collapsed={collapsed} />
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <>
                  <PanelLeftClose className="size-4" /> Collapse
                </>
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
        </aside>
  
        <div className={cn("flex min-h-screen flex-col", collapsed ? "lg:pl-16" : "lg:pl-64")}>
          {/* Top header */}
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur sm:px-5">
            {/* Mobile menu: the same nav inside a slide-out panel */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
  
            <div className="relative ml-1 hidden max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-8"
                placeholder="Search clients, requirements, candidates…"
                aria-label="Search"
              />
            </div>
  
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
              <UserMenu />
            </div>
          </header>
  
          {/* Breadcrumb */}
          <div className="border-b border-border bg-card/50 px-4 py-2 sm:px-6">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
              {current && current.path !== "/" ? (
                <>
                  <span className="mx-1.5">/</span>
                  <span className="text-foreground">{current.label}</span>
                </>
              ) : null}
            </nav>
          </div>
  
          {/* The current page renders here */}
          <main className="flex-1 px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-7xl space-y-6">
              <ErrorBoundary resetKey={pathname}>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>

    );
}
