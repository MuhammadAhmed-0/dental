import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TreatmentHistoryProps {
  patientId: number;
}

export function TreatmentHistory({ patientId }: TreatmentHistoryProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const { data: treatments, isLoading } = useQuery({
    queryKey: ["/api/treatments", patientId],
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/upload", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments", patientId] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId.toString());
    
    uploadFileMutation.mutate(formData);
  };

  const statusColors = {
    "planned": "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    "completed": "bg-green-100 text-green-800",
    "cancelled": "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Treatment History</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            <label className="cursor-pointer">
              Upload Files
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </label>
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Treatment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/3 mb-4" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : treatments?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No treatment records found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {treatments?.map((treatment: any) => (
            <Card key={treatment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{treatment.diagnosis}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(treatment.date), 'PPP')}
                    </p>
                  </div>
                  <Badge className={statusColors[treatment.status as keyof typeof statusColors]}>
                    {treatment.status}
                  </Badge>
                </div>
                
                <p className="text-sm mb-4">{treatment.treatment}</p>
                
                {treatment.attachments?.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Attachments</h4>
                    <div className="flex gap-2">
                      {treatment.attachments.map((attachment: any, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(attachment.url)}
                        >
                          <FileText className="h-4 w-4" />
                          {attachment.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {treatment.followUpNeeded && (
                  <div className="mt-4 text-sm">
                    <Badge variant="outline">
                      Follow-up: {format(new Date(treatment.followUpDate), 'PPP')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
