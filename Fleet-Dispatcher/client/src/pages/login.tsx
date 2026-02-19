import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck, ArrowLeft, LogIn } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

export default function Login() {
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username === "admin" && passcode === "1029") {
      sessionStorage.setItem("admin_authenticated", "true");
      toast({ title: t("login.welcome"), description: t("login.welcomeDesc") });
      setLocation("/dashboard");
    } else {
      setError(t("login.error"));
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="login-page">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-foreground">UrbanRoute</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5" data-testid="link-back-home">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("login.backHome")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm p-6" data-testid="login-card">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 mx-auto mb-3">
              <LogIn className="w-5 h-5 text-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-login-title">
              {t("login.title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t("login.desc")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs">{t("login.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("login.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passcode" className="text-xs">{t("login.passcode")}</Label>
              <Input
                id="passcode"
                type="password"
                placeholder={t("login.passcodePlaceholder")}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                data-testid="input-passcode"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive" data-testid="text-login-error">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" data-testid="btn-login-submit">
              <LogIn className="w-4 h-4" />
              {t("login.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
