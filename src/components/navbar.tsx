import { Link, useRouter } from "@tanstack/react-router";
import { Briefcase, LogOut, User as UserIcon, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { user, isRecruiter } = useAuth();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground shadow-warm">
            <Briefcase className="h-5 w-5" />
          </span>
          WarmHire
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/jobs"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Browse Jobs
          </Link>
          {user && !isRecruiter && (
            <Link
              to="/profile"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              My Profile
            </Link>
          )}
          {user && (
            <Link
              to="/applications"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {isRecruiter ? "Hiring" : "My Applications"}
            </Link>
          )}
          {isRecruiter && (
            <Link
              to="/post-job"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Post a Job
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isRecruiter && (
                <Link to="/applications" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-1 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <UserIcon className="mr-1 h-4 w-4" /> Sign in
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="shadow-warm">
                  <Sparkles className="mr-1 h-4 w-4" /> Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
