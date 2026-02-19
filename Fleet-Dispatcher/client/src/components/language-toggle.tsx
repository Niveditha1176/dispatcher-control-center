import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "ta" : "en")}
      className="gap-2 min-w-[80px]"
      data-testid="language-toggle"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{language === "en" ? "தமிழ்" : "English"}</span>
    </Button>
  );
}
