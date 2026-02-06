'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Users,
  Shield,
  Wrench,
  LineChart,
  ShieldCheck,
  Route,
  ClipboardCheck,
  BarChart3,
  Gauge,
  Sparkles,
  Star,
  Activity,
  BadgeCheck,
  Globe,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '@/config/api';

interface LandingStats {
  vehicles_orchestrated: string;
  compliance_adherence: string;
  automation_coverage: string;
  average_response: string;
  trusted_by_teams: string[];
  readiness_by_depot?: number[];
  readiness_change_pct?: number;
  fleet_status?: string;
  active_hubs?: number;
}

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null);

  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const languageOptions = [
    { code: 'en', label: t('language.en') },
    { code: 'pt', label: t('language.pt') },
    { code: 'es', label: t('language.es') },
    { code: 'fr', label: t('language.fr') },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code).catch(() => {});
  };

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const fetchLandingStats = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LANDING_STATS}`);
        if (res.ok) {
          const data = await res.json();
          setLandingStats(data);
        }
      } catch {
        // Fallback to translations if API fails
      }
    };
    fetchLandingStats();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'staff':
          router.push('/dashboard/staff');
          break;
        case 'driver':
          router.push('/dashboard/driver');
          break;
        case 'inspector':
          router.push('/dashboard/inspector');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const featureCardsTranslations = t('featureCards', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    accent: string;
  }>;
  const featureCards = featureCardsTranslations.map((item, idx) => ({
    ...item,
    icon: [Truck, Users, Shield, Wrench][idx] || Truck,
  }));

  const statsTranslations = t('stats', { returnObjects: true }) as Array<{
    label: string;
    value: string;
    context: string;
  }>;
  const stats = statsTranslations.map((item, idx) => {
    const backendValues = landingStats
      ? [
          landingStats.vehicles_orchestrated,
          landingStats.compliance_adherence,
          landingStats.average_response,
          landingStats.automation_coverage,
        ]
      : [item.value, item.value, item.value, item.value];
    return {
      ...item,
      value: backendValues[idx] ?? item.value,
      icon: [LineChart, ShieldCheck, Activity, BadgeCheck][idx] || LineChart,
    };
  });

  const trustSignals = (landingStats?.trusted_by_teams ?? t('trustSignals', { returnObjects: true })) as string[];

  const workflowStepsTranslations = t('workflow.steps', { returnObjects: true }) as Array<{
    pill: string;
    title: string;
    description: string;
  }>;
  const workflowSteps = workflowStepsTranslations.map((step, idx) => ({
    ...step,
    icon: [Route, BarChart3, ClipboardCheck, Gauge][idx] || Route,
  }));

  const testimonials = t('testimonialsSection.items', { returnObjects: true }) as Array<{
    quote: string;
    name: string;
    role: string;
    company: string;
    result: string;
  }>;

  const tiers = t('tiers', { returnObjects: true }) as Array<{
    name: string;
    description: string;
    price: string;
    bullets: string[];
  }>;

  const demoAccounts = t('demoAccess.accounts', { returnObjects: true }) as Array<{
    role: string;
    access: string;
    creds: string;
  }>;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/70 to-indigo-700/60 blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 -left-24 w-[28rem] h-[28rem] bg-gradient-to-r from-purple-600/50 to-pink-500/40 blur-[120px] opacity-60 animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] bg-gradient-to-t from-sky-500/40 to-transparent blur-[160px] opacity-60 animation-delay-4000" />
      </div>
      <div className="noise-layer" />

      <header className="relative z-10 border-b border-white/5 bg-slate-900/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-700/40">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold tracking-wide text-white">{t('nav.title')}</p>
                <p className="text-xs text-slate-400">{t('nav.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`text-xs font-medium px-2 py-1 rounded-full transition ${
                      i18n.language.startsWith(lang.code)
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="border-white/20 text-white/90 hover:text-white hover:border-white/40 bg-white/5"
              >
                {t('nav.signIn')}
              </Button>
              <Button
                onClick={() => router.push('/auth/signup')}
                className="btn-gradient text-sm px-5 py-2 rounded-full"
              >
                {t('nav.signUp')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 space-y-20">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-10">
            <div className="pill bg-white/5 text-sky-100 w-fit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-300" />
              {t('hero.pill')}
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white">
                {t('hero.title')}
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-2xl">
                {t('hero.description')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/auth/signup')}
                className="btn-gradient text-base px-8 py-6 rounded-full font-semibold shadow-xl hover:shadow-2xl"
              >
                {t('hero.primaryCta')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="rounded-full border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/5"
              >
                {t('hero.secondaryCta')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              {[ShieldCheck, Globe, Clock].map((Icon, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${idx === 0 ? 'text-emerald-300' : idx === 1 ? 'text-blue-300' : 'text-amber-300'}`} />
                  {t(`hero.bullets.${idx}`)}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/70 via-indigo-500/70 to-purple-500/70 rounded-[32px] blur-3xl opacity-70 animate-pulse" />
            <Card className="relative glass-dark border-white/10 rounded-[32px] p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('liveSnapshot.title')}</p>
                  <p className="text-2xl font-semibold text-white mt-1">{t('liveSnapshot.fleetStatus')}</p>
                </div>
                <div className={`pill border ${
                  (landingStats?.fleet_status ?? 'Healthy') === 'Critical'
                    ? 'bg-red-400/10 text-red-200 border-red-400/20'
                    : (landingStats?.fleet_status ?? 'Healthy') === 'Warning'
                    ? 'bg-amber-400/10 text-amber-200 border-amber-400/20'
                    : 'bg-emerald-400/10 text-emerald-200 border-emerald-400/20'
                }`}>
                  {landingStats?.fleet_status === 'Critical'
                    ? t('liveSnapshot.critical')
                    : landingStats?.fleet_status === 'Warning'
                    ? t('liveSnapshot.warning')
                    : t('liveSnapshot.healthy')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.slice(0, 2).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                      <Icon className="w-5 h-5 text-sky-300" />
                      <p className="text-2xl font-semibold">{item.value}</p>
                      <p className="text-sm text-slate-400">{item.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-200">{t('liveSnapshot.readinessAcrossDepots')}</p>
                  <span className={`text-xs ${
                    (landingStats?.readiness_change_pct ?? 0) >= 0 ? 'text-emerald-200' : 'text-red-200'
                  }`}>
                    {(landingStats?.readiness_change_pct ?? 7.4) >= 0 ? '+' : ''}
                    {landingStats?.readiness_change_pct ?? 7.4}% {t('liveSnapshot.vsLastWeek')}
                  </span>
                </div>
                <div className="h-24 bg-black/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end gap-1 px-4 pb-3">
                    {(landingStats?.readiness_by_depot ?? [35, 45, 30, 60, 50, 70, 90]).map((height, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-full bg-gradient-to-t from-blue-500/40 via-purple-500/50 to-pink-500/60"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{t('liveSnapshot.platformWide')}</span>
                  <span>{t('liveSnapshot.liveTelemetry')} • {landingStats?.active_hubs ?? 4} {t('liveSnapshot.hubs')}</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="glass-dark border-white/5">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-sky-300" />
                      </div>
                      <p className="text-sm uppercase tracking-wide text-slate-400">{item.label}</p>
                    </div>
                    <p className="text-3xl font-semibold text-white">{item.value}</p>
                    <p className="text-sm text-slate-400">{item.context}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 justify-center">
            <span className="uppercase tracking-[0.5em] text-xs text-slate-500">
              {t('trustTitle', { defaultValue: 'Trusted by teams at' })}
            </span>
            <div className="flex flex-wrap gap-6 justify-center text-slate-300">
              {trustSignals.map((brand) => (
                <span key={brand} className="text-base font-semibold tracking-wide text-white/70">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-4 text-center">
            <p className="pill mx-auto bg-white/5 text-sky-100 border-white/10">{t('featurePill', { defaultValue: 'Designed for modern operations' })}</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
              {t('featureTitle', { defaultValue: 'Everything you need to run a professional fleet' })}
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              {t('featureDescription', {
                defaultValue:
                  'Put planning, execution, and compliance into a single UI. Each card is purpose-built with delightful micro-interactions and tailored insights.',
              })}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="glass-dark border-white/5 hover:border-white/20 transition">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base text-slate-300">{feature.accent}</p>
                          <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-white/40" />
                    </div>
                    <CardDescription className="text-base text-slate-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <div className="space-y-6">
            <p className="pill bg-white/5 text-sky-100 border-white/10 w-fit">{t('workflow.pill')}</p>
            <h3 className="text-3xl font-semibold text-white">{t('workflow.title')}</h3>
            <p className="text-slate-400">
              {t('workflow.description')}
            </p>
            <div className="space-y-6">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="glow-border rounded-2xl p-6 bg-slate-900/60 border border-white/5 flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-slate-200">
                      <span className="text-lg font-semibold">{step.pill}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-sky-300" />
                        <p className="text-lg font-semibold text-white">{step.title}</p>
                      </div>
                      <p className="text-sm text-slate-400">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass-dark rounded-[32px] border border-white/10 p-8 space-y-6 grid-overlay">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{t('workflow.opsReview.label')}</p>
                <p className="text-2xl font-semibold text-white">{t('workflow.opsReview.title')}</p>
              </div>
              <div className="pill bg-emerald-400/10 text-emerald-200 border-emerald-400/20 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t('workflow.opsReview.badge')}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t('workflow.opsReview.autonomous', { defaultValue: 'Autonomous workflows' })}</span>
                <span>{t('workflow.opsReview.sync')}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(t('workflow.opsReview.cards', { returnObjects: true }) as string[]).map((label, idx) => (
                  <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="text-2xl font-semibold text-white">
                      {(t('workflow.opsReview.cardsStatus', { returnObjects: true }) as string[])[idx]}
                    </p>
                    <p className="text-xs text-emerald-200">{t('workflow.opsReview.statusLabel')}</p>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-300" />
                {t('workflow.opsReview.aiNote')}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-4 text-center">
            <p className="pill mx-auto bg-white/5 text-sky-100 border-white/10">{t('testimonialsSection.pill')}</p>
            <h3 className="text-3xl sm:text-4xl font-semibold text-white">{t('testimonialsSection.title')}</h3>
            <p className="text-slate-400 max-w-3xl mx-auto">
              {t('testimonialsSection.description')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="glass-dark border-white/5">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Star className="w-5 h-5" />
                    <span>{testimonial.result}</span>
                  </div>
                  <p className="text-lg text-white leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="text-sm text-slate-400">
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p>{testimonial.role} • {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="glass-dark border border-white/10 rounded-[32px] p-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="pill bg-white/5 text-sky-100 border-white/10 w-fit">{t('cta.pill')}</p>
              <h3 className="text-3xl font-semibold text-white mt-4">{t('cta.title')}</h3>
              <p className="text-slate-400 mt-3 max-w-2xl">
                {t('cta.description')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="btn-gradient rounded-full px-6 py-4" onClick={() => router.push('/auth/signup')}>
                {t('cta.primary')}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/5"
                onClick={() => router.push('/auth/signin')}
              >
                {t('cta.secondary')}
              </Button>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {tiers.map((tier) => (
                <div key={tier.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{tier.name}</p>
                      <p className="text-2xl font-semibold text-white">{tier.price}</p>
                    </div>
                    <div className="pill bg-emerald-400/10 text-emerald-200 border-emerald-400/20">
                      {t('popularTag')}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{tier.description}</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {tier.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t('demoAccess.label')}</p>
              <h4 className="text-2xl font-semibold text-white">{t('demoAccess.title')}</h4>
              <p className="text-slate-400 text-sm">{t('demoAccess.description')}</p>
              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <div key={account.role} className="rounded-2xl bg-black/20 border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{account.role}</p>
                        <p className="text-xs text-slate-400">{account.access}</p>
                      </div>
                      <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-full text-slate-200">{account.creds}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">{t('demoAccess.note')}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-slate-400">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{t('footer.title')}</p>
              <p className="text-xs text-slate-500">{t('footer.copyright')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 text-xs uppercase tracking-[0.35em]">
            <Link href="/platform" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              Platform
            </Link>
            <Link href="/security" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              Security
            </Link>
            <Link href="/contact" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              Contact
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              Terms
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              Privacy
            </Link>
            <Link href="/faq" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
              FAQ
            </Link>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Powered by <a href="https://maindo.digital" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Maindo Digital Agency</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
