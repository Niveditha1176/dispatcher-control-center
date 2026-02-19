import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroIcon from "@assets/image_1771060266003.png";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import {
  Route,
  Truck,
  Clock,
  MapPin,
  BarChart3,
  Navigation,
  Fuel,
  Users,
  Shield,
  ArrowRight,
  Package,
  Zap,
  Globe,
  Smartphone,
  ChevronRight,
} from "lucide-react";

const features = [
  { icon: Route, titleKey: "feat.smartRoute.title", descKey: "feat.smartRoute.desc" },
  { icon: Navigation, titleKey: "feat.dynamicReroute.title", descKey: "feat.dynamicReroute.desc" },
  { icon: MapPin, titleKey: "feat.liveFleet.title", descKey: "feat.liveFleet.desc" },
  { icon: Clock, titleKey: "feat.timeWindow.title", descKey: "feat.timeWindow.desc" },
  { icon: Fuel, titleKey: "feat.fuelCost.title", descKey: "feat.fuelCost.desc" },
  { icon: BarChart3, titleKey: "feat.kpiDash.title", descKey: "feat.kpiDash.desc" },
];

const problems = [
  { stat: "40%", labelKey: "stat.costs.label", detailKey: "stat.costs.detail" },
  { stat: "1.5B", labelKey: "stat.parcels.label", detailKey: "stat.parcels.detail" },
  { stat: "23%", labelKey: "stat.failed.label", detailKey: "stat.failed.detail" },
  { stat: "30%", labelKey: "stat.distance.label", detailKey: "stat.distance.detail" },
];

const capabilities = [
  { icon: Package, titleKey: "cap.orderIntake.title", descKey: "cap.orderIntake.desc" },
  { icon: Users, titleKey: "cap.homeDriver.title", descKey: "cap.homeDriver.desc" },
  { icon: Shield, titleKey: "cap.ruleBreach.title", descKey: "cap.ruleBreach.desc" },
  { icon: Smartphone, titleKey: "cap.driverMobile.title", descKey: "cap.driverMobile.desc" },
];

export default function Landing() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b" data-testid="landing-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <Truck className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-foreground" data-testid="text-brand">
              UrbanRoute
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <a href="#home">
              <Button variant="ghost" size="sm" data-testid="link-home">
                {t("nav.home")}
              </Button>
            </a>
            <a href="#about">
              <Button variant="ghost" size="sm" data-testid="link-about">
                {t("nav.about")}
              </Button>
            </a>
            <a href="#features">
              <Button variant="ghost" size="sm" data-testid="link-features">
                {t("nav.features")}
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/login">
              <Button variant="outline" size="sm" data-testid="link-admin-login">
                {t("nav.login")}
              </Button>
            </Link>
            <a href="#driver-app">
              <Button variant="default" size="sm" data-testid="link-driver-login">
                {t("nav.driverApp")}
              </Button>
            </a>
          </div>
        </div>
      </nav>

      <section id="home" className="relative overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:to-primary/5" />
        <img
          src={heroIcon}
          alt=""
          className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 h-[80%] w-auto max-w-[50%] object-contain opacity-[0.07] pointer-events-none select-none"
          aria-hidden="true"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4" data-testid="badge-tagline">
              <Zap className="w-3 h-3 mr-1" />
              {t("hero.tagline")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight" data-testid="text-hero-title">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl" data-testid="text-hero-desc">
              {t("hero.desc")}
            </p>
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <Link href="/login">
                <Button size="lg" className="gap-2" data-testid="btn-get-started">
                  {t("hero.getStarted")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#about">
                <Button variant="outline" size="lg" data-testid="btn-learn-more">
                  {t("hero.learnMore")}
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {problems.map((item, i) => (
              <Card key={i} className="p-4" data-testid={`stat-card-${i}`}>
                <div className="text-2xl font-bold text-foreground">{item.stat}</div>
                <div className="text-xs font-medium text-foreground mt-0.5">{t(item.labelKey)}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{t(item.detailKey)}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="border-t bg-card/50" data-testid="section-about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-3">
              <Globe className="w-3 h-3 mr-1" />
              {t("about.badge")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-about-title">
              {t("about.title")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("about.desc")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div key={i} className="flex gap-3" data-testid={`capability-${i}`}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-foreground flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t(cap.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t(cap.descKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="border-t" data-testid="section-features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-3">
              <Zap className="w-3 h-3 mr-1" />
              {t("feat.badge")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-features-title">
              {t("feat.title")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              {t("feat.desc")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="p-5" data-testid={`feature-card-${i}`}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-foreground mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{t(feature.titleKey)}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{t(feature.descKey)}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="driver-app" className="border-t bg-card/50" data-testid="section-driver-app">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
            <div className="flex-1">
              <Badge variant="outline" className="mb-3">
                <Smartphone className="w-3 h-3 mr-1" />
                {t("driver.badge")}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-driver-title">
                {t("driver.title")}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
                {t("driver.desc")}
              </p>
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="btn-download-app">
                  {t("driver.download")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" data-testid="btn-driver-login-alt">
                  {t("driver.login")}
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 w-56 h-72 rounded-md border bg-card flex flex-col items-center justify-center gap-3 p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-foreground" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">UrbanRoute</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t("driver.appLabel")}</div>
              </div>
              <Badge variant="secondary" className="text-[10px]">v2.1.0</Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t" data-testid="section-cta">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("cta.title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {t("cta.desc")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <Button size="lg" className="gap-2" data-testid="btn-cta-dashboard">
                {t("cta.button")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/50" data-testid="landing-footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">UrbanRoute</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#home" className="hover-elevate rounded px-1.5 py-1" data-testid="footer-link-home">{t("nav.home")}</a>
              <a href="#about" className="hover-elevate rounded px-1.5 py-1" data-testid="footer-link-about">{t("nav.about")}</a>
              <a href="#features" className="hover-elevate rounded px-1.5 py-1" data-testid="footer-link-features">{t("nav.features")}</a>
              <a href="#driver-app" className="hover-elevate rounded px-1.5 py-1" data-testid="footer-link-driver-app">{t("nav.driverApp")}</a>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
