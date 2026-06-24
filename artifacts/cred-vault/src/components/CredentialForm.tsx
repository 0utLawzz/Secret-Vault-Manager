import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CredentialStatus, type Credential } from "@/types/credential";
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
  credit: z.coerce.number().nullable().optional(),
  status: z.enum([
    CredentialStatus.New,
    CredentialStatus.Bank,
    CredentialStatus.VPending,
    CredentialStatus.USED,
  ]),
  notes: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CredentialFormProps {
  initialData?: Credential;
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

export function CredentialForm({
  initialData,
  onSubmit,
  isLoading,
}: CredentialFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      password: initialData?.password || "",
      credit: initialData?.credit ?? null,
      status: initialData?.status || CredentialStatus.New,
      notes: initialData?.notes || "",
    },
  });

  // Reset form when initialData changes (e.g. editing a different record)
  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        password: initialData.password,
        credit: initialData.credit,
        status: initialData.status,
        notes: initialData.notes,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="credit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={CredentialStatus.New}>New</SelectItem>
                    <SelectItem value={CredentialStatus.Bank}>Bank</SelectItem>
                    <SelectItem value={CredentialStatus.VPending}>
                      VPending
                    </SelectItem>
                    <SelectItem value={CredentialStatus.USED}>USED</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional details..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Saving..." : initialData ? "Save Changes" : "Add Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
