import { Link } from "wouter";
import { 
  Calendar, 
  Users, 
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      setLocation("/");
    }
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-sidebar-foreground">Dental Clinic</h1>
        </div>
        <nav className="px-4 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/appointments">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </Button>
          </Link>
          <Link href="/dashboard/patients">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Patients
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-4 px-4 w-64">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center px-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
