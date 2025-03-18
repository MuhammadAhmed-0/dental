import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, UserPlus, Check } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const waitlistSchema = z.object({
  patientId: z.number(),
  preferredDentistId: z.number().optional(),
  requestedDate: z.date(),
  notes: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export function WaitlistManager() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const { data: waitlist, isLoading } = useQuery({
    queryKey: ["/api/waitlist"],
  });

  const addToWaitlistMutation = useMutation({
    mutationFn: async (data: WaitlistFormData) => {
      const res = await apiRequest("POST", "/api/waitlist", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      setIsAddOpen(false);
      toast({
        title: "Success",
        description: "Patient added to waitlist",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add patient to waitlist",
      });
    },
  });

  const fulfillWaitlistMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/waitlist/${id}`, {
        status: "fulfilled"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      toast({
        title: "Success",
        description: "Waitlist entry fulfilled",
      });
    },
  });

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Waitlist</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Waitlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add to Waitlist</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addToWaitlistMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient ID</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requestedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} onChange={e => field.onChange(new Date(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Add to Waitlist</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading waitlist...</div>
      ) : waitlist?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No patients in waitlist
          </CardContent>
        </Card>
      ) : (
        waitlist?.map((entry: any) => (
          <Card key={entry.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Patient #{entry.patientId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={entry.status === "pending" ? "secondary" : "success"}>
                    {entry.status}
                  </Badge>
                  {entry.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fulfillWaitlistMutation.mutate(entry.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Fulfill
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Requested Date: {format(new Date(entry.requestedDate), 'PPP')}
              </div>
              {entry.notes && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Notes: {entry.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
