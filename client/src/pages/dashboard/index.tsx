import DashboardLayout from "@/components/dashboard-layout";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { WaitlistManager } from "@/components/waitlist-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Quick Stats */}
        <div>
          <h2 className="text-3xl font-bold text-primary mb-6">Dashboard Overview</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Appointments
                </CardTitle>
                <div className="bg-primary/10 rounded-full p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingAppointments ? "..." : appointments?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  All time appointments
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Patients
                </CardTitle>
                <div className="bg-primary/10 rounded-full p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPatients ? "..." : patients?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Registered patients
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Appointments
                </CardTitle>
                <div className="bg-primary/10 rounded-full p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingAppointments ? "..." : 
                    appointments?.filter((apt: any) => 
                      new Date(apt.startTime) > new Date()
                    ).length || 0
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Scheduled appointments
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Analytics</h2>
          <div className="bg-card rounded-xl shadow-lg p-6">
            <AnalyticsDashboard />
          </div>
        </div>

        {/* Waitlist Manager */}
        <div className="mt-12">
          <div className="bg-card rounded-xl shadow-lg p-6">
            <WaitlistManager />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}