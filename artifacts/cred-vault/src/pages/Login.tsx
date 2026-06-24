import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError("Wrong password. Try again.");
      }
    } catch {
      setError("Connection error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 bg-primary border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-widest">
            Cred<span className="text-primary">Vault</span>
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1 uppercase tracking-wider">
            Personal Credential Manager
          </p>
        </div>

        {/* Login form */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-widest"
              >
                Vault Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter vault password"
                  className="border-3 border-black rounded-none pr-10 font-mono h-12 focus-visible:ring-0 focus-visible:border-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="border-3 border-destructive bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive font-mono">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full h-12 text-base font-black uppercase tracking-widest border-3 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
            >
              {isLoading ? "Unlocking..." : "Unlock Vault"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs font-mono text-muted-foreground mt-6 uppercase">
          Set VAULT_PASSWORD to protect this vault
        </p>
      </div>
    </div>
  );
}
