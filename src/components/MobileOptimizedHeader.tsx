
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, User, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";

export default function MobileOptimizedHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
                Find Players
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
                Matches
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
                Messages
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
                Circles
              </Button>
              <div className="mt-8 pt-4 border-t">
                <Button variant="outline" onClick={signOut} className="w-full">
                  Sign Out
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 ml-2">
          <h1 className="text-lg font-semibold">CourtMate</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NotificationCenter />
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
