import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { PatientForm } from "@/components/patient-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, Phone, MapPin, Heart, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { TreatmentHistory } from "@/components/treatment-history";

// Mock data for dentists - replace with API call later
const mockDentists = [
  { id: 1, name: "Dr. Smith" },
  { id: 2, name: "Dr. Johnson" },
  { id: 3, name: "Dr. Williams" }
];

export default function Patients() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/patients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create patient",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Patients</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              onSubmit={(data) => createPatientMutation.mutate(data)}
              availableDentists={mockDentists}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/5" />
              </CardContent>
            </Card>
          ))
        ) : patients?.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center text-muted-foreground">
              No patients found
            </CardContent>
          </Card>
        ) : (
          patients?.map((patient: any) => (
            <Card key={patient.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 rounded-full p-2">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Patient ID: #{patient.id}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Born: {format(new Date(patient.dateOfBirth), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{patient.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        {patient.address}, {patient.city}, {patient.state} {patient.zipCode}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4 text-primary" />
                      <span>Insurance: {patient.insuranceProvider}</span>
                    </div>
                    {patient.preferredDentist && (
                      <div className="text-muted-foreground">
                        Preferred Dentist: {mockDentists.find(d => d.id === patient.preferredDentist)?.name}
                      </div>
                    )}
                  </div>
                </div>
                {patient.medicalHistory && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Medical History</h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.medicalHistory}
                    </p>
                  </div>
                )}
                {patient.allergies && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Allergies</h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.allergies}
                    </p>
                  </div>
                )}
                {patient.id && (
                  <div className="mt-6 border-t pt-6">
                    <TreatmentHistory patientId={patient.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}