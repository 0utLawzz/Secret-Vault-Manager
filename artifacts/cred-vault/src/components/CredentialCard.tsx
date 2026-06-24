import { useState, useRef } from "react";
import { Copy, Edit2, Eye, EyeOff, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { CredentialStatus, type Credential } from "@/types/credential";
import {
  useUpdateCredit,
  useUpdateStatus,
  useDeleteCredential,
  getListCredentialsQueryKey,
  getGetCredentialStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface CredentialCardProps {
  credential: Credential;
  onEdit: (credential: Credential) => void;
}

export function CredentialCard({ credential, onEdit }: CredentialCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreditPopoverOpen, setIsCreditPopoverOpen] = useState(false);
  const [creditInput, setCreditInput] = useState(credential.credit?.toString() ?? "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isUsed = credential.status === CredentialStatus.USED;

  const updateCredit = useUpdateCredit();
  const updateStatus = useUpdateStatus();
  const deleteCredential = useDeleteCredential();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
      duration: 2000,
    });
  };

  const handleUpdateCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = creditInput.trim();
    const val = raw === "" ? null : Math.min(5000, Math.max(0, parseInt(raw, 10)));

    updateCredit.mutate(
      { id: credential.id, data: { credit: val } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCredentialsQueryKey() });
          setIsCreditPopoverOpen(false);
          toast({ title: "Credit updated" });
        },
      }
    );
  };

  const handleUpdateStatus = (newStatus: CredentialStatus) => {
    if (newStatus === credential.status) return;
    updateStatus.mutate(
      { id: credential.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCredentialsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCredentialStatsQueryKey() });
          toast({ title: "Status updated" });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteCredential.mutate(
      { id: credential.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCredentialsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCredentialStatsQueryKey() });
          toast({ title: "Record deleted", variant: "destructive" });
          setIsDeleteDialogOpen(false);
        },
      }
    );
  };

  const getStatusBadgeVariant = (status: CredentialStatus) => {
    switch (status) {
      case CredentialStatus.New:
        return "success";
      case CredentialStatus.VPending:
        return "secondary";
      case CredentialStatus.USED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const creditPopoverForm = (
    <form onSubmit={handleUpdateCredit} className="flex gap-2 items-end">
      <div className="grid gap-2 flex-1">
        <Label htmlFor="credit">Credit (max 5000)</Label>
        <Input
          id="credit"
          type="number"
          step="1"
          min="0"
          max="5000"
          value={creditInput}
          onChange={(e) => setCreditInput(e.target.value)}
          className="h-9 font-mono"
        />
      </div>
      <Button type="submit" size="sm" className="h-9 px-3">
        Save
      </Button>
    </form>
  );

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="h-full"
      >
        <Card
          className={`h-full transition-all duration-300 relative group overflow-hidden ${
            isUsed ? "opacity-50 italic grayscale-[50%]" : "hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          <CardHeader className="flex flex-row justify-between items-start pt-5 pb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-sm active:translate-y-[1px]">
                      <Badge variant={getStatusBadgeVariant(credential.status)} className="cursor-pointer">
                        {credential.status}
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleUpdateStatus(CredentialStatus.New)}>
                      New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(CredentialStatus.VPending)}>
                      VPending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(CredentialStatus.USED)}>
                      USED
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {credential.credit !== null && (
                  <Popover open={isCreditPopoverOpen} onOpenChange={setIsCreditPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center rounded-none border-2 border-black px-2 py-0.5 text-xs font-bold bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-muted focus:outline-none transition-colors ml-auto active:translate-y-[1px] active:translate-x-[1px] active:shadow-none">
                        {credential.credit}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60" align="end">
                      {creditPopoverForm}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(credential)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Record
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="pt-4 pb-4 flex-1">
            <div className="space-y-4">
              <div className="group/field relative">
                <Label className="text-xs text-muted-foreground mb-1 block">Email</Label>
                <div className="flex items-center justify-between font-mono bg-muted/30 p-2 border-2 border-transparent group-hover/field:border-black transition-colors">
                  <span className="truncate mr-2 font-bold">{credential.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover/field:opacity-100 border-none shadow-none bg-transparent hover:bg-white transition-opacity"
                    onClick={() => handleCopy(credential.email, "Email")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="group/field relative">
                <Label className="text-xs text-muted-foreground mb-1 block">Password</Label>
                <div className="flex items-center justify-between font-mono bg-muted/30 p-2 border-2 border-transparent group-hover/field:border-black transition-colors">
                  <span className="truncate mr-2 font-bold">
                    {showPassword ? credential.password : "••••••••"}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 border-none shadow-none bg-transparent hover:bg-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 border-none shadow-none bg-transparent hover:bg-white"
                      onClick={() => handleCopy(credential.password, "Password")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {credential.notes && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-muted">
                  <Label className="text-xs text-muted-foreground mb-1 block">Notes</Label>
                  <p className="text-sm font-mono whitespace-pre-wrap text-foreground/80 line-clamp-2">
                    {credential.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          {credential.credit === null && (
            <CardFooter className="py-2 border-t-2 border-dashed border-muted bg-transparent justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover open={isCreditPopoverOpen} onOpenChange={setIsCreditPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="link" size="sm" className="h-6 text-xs text-muted-foreground font-mono hover:text-black">
                    + Add Credit
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60" side="top" align="center">
                  {creditPopoverForm}
                </PopoverContent>
              </Popover>
            </CardFooter>
          )}
        </Card>
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the credential record for{" "}
              <span className="font-bold text-foreground">{credential.email}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
