import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Database } from "lucide-react";
import { CredentialCard } from "@/components/CredentialCard";
import { CredentialForm } from "@/components/CredentialForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useListCredentials,
  useGetCredentialStats,
  useCreateCredential,
  useUpdateCredential,
  getListCredentialsQueryKey,
  getGetCredentialStatsQueryKey,
} from "@workspace/api-client-react";
import { CredentialStatus, type Credential } from "@/types/credential";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { LayoutGrid } from "lucide-react";

type FilterTab = "All" | CredentialStatus;

export default function Vault() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Credential | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useGetCredentialStats();
  const { data: credentials, isLoading } = useListCredentials(
    activeTab === "All" ? undefined : { status: activeTab as CredentialStatus }
  );

  const createMutation = useCreateCredential();
  const updateMutation = useUpdateCredential();

  const handleAddSubmit = (data: any) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCredentialsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCredentialStatsQueryKey() });
          setIsAddOpen(false);
          toast({ title: "Record added to vault." });
        },
        onError: () => {
          toast({
            title: "Failed to add record",
            description: "An error occurred. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleEditSubmit = (data: any) => {
    if (!editingRecord) return;
    updateMutation.mutate(
      { id: editingRecord.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCredentialsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCredentialStatsQueryKey() });
          setEditingRecord(null);
          toast({ title: "Record updated." });
        },
        onError: () => {
          toast({
            title: "Failed to update record",
            description: "An error occurred. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Stats Header */}
      <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-white shadow-neo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <Database className="h-5 w-5 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-bold uppercase tracking-widest hidden sm:block">
                Cred<span className="text-primary">Vault</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 font-mono text-sm sm:text-base font-bold">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground uppercase text-xs">Total</span>
                <span className="bg-black text-white px-2 py-0.5">{stats?.total || 0}</span>
              </div>
              <div className="h-8 w-[3px] bg-black hidden sm:block" />
              <div className="flex items-center gap-2 hidden sm:flex">
                <span className="text-muted-foreground uppercase text-xs">New</span>
                <span className="bg-accent text-white px-2 py-0.5 border-2 border-black">{stats?.byStatus.New || 0}</span>
              </div>
              <div className="flex items-center gap-2 hidden md:flex">
                <span className="text-muted-foreground uppercase text-xs">VPend</span>
                <span className="bg-secondary text-black px-2 py-0.5 border-2 border-black">{stats?.byStatus.VPending || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground uppercase text-xs">Used</span>
                <span className="bg-destructive text-white px-2 py-0.5 border-2 border-black">{stats?.byStatus.USED || 0}</span>
              </div>
            </div>

            <Button
              className="bg-accent text-white hover:bg-accent/90 ml-4 hidden sm:flex"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" strokeWidth={3} />
              Add Record
            </Button>

            <Button
              size="icon"
              className="bg-accent text-white hover:bg-accent/90 ml-2 sm:hidden"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <TabsList className="w-full sm:w-auto flex flex-wrap gap-2 bg-transparent border-none shadow-none p-0">
              <TabsTrigger
                value="All"
                className="flex-1 sm:flex-none border-3 border-black shadow-neo-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:translate-y-[2px] data-[state=active]:translate-x-[2px]"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger
                value={CredentialStatus.New}
                className="flex-1 sm:flex-none border-3 border-black shadow-neo-sm data-[state=active]:bg-accent data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:translate-y-[2px] data-[state=active]:translate-x-[2px]"
              >
                New
              </TabsTrigger>
              <TabsTrigger
                value={CredentialStatus.VPending}
                className="flex-1 sm:flex-none border-3 border-black shadow-neo-sm data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:translate-y-[2px] data-[state=active]:translate-x-[2px]"
              >
                VPending
              </TabsTrigger>
              <TabsTrigger
                value={CredentialStatus.USED}
                className="flex-1 sm:flex-none border-3 border-black shadow-neo-sm data-[state=active]:bg-destructive data-[state=active]:text-black data-[state=active]:shadow-none data-[state=active]:translate-y-[2px] data-[state=active]:translate-x-[2px]"
              >
                USED
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 border-3 border-black bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : credentials?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-4 border-dashed border-black bg-white/50 p-8 text-center mt-12 shadow-neo">
                <Database className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold uppercase mb-2">No records found</h3>
                <p className="text-muted-foreground font-mono max-w-sm">
                  {activeTab === "All"
                    ? "Your vault is empty. Add a new credential record to get started."
                    : `No credentials found with status: ${activeTab}.`}
                </p>
                {activeTab !== "All" && (
                  <Button variant="outline" className="mt-6" onClick={() => setActiveTab("All")}>
                    View All Records
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                <AnimatePresence>
                  {credentials?.map((cred) => (
                    <CredentialCard
                      key={cred.id}
                      credential={cred}
                      onEdit={setEditingRecord}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Tabs>
      </main>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Record</DialogTitle>
            <DialogDescription>
              Create a new credential entry in your vault.
            </DialogDescription>
          </DialogHeader>
          <CredentialForm
            onSubmit={handleAddSubmit}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Update details for {editingRecord?.email}.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <CredentialForm
              initialData={editingRecord}
              onSubmit={handleEditSubmit}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
