'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

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

  const featureCards = [
    {
      icon: Truck,
      title: 'Unified Fleet Graph',
      description: 'Monitor every vehicle, sensor, and route through a single intelligence layer with live health scoring.',
      accent: 'Fleet Intelligence',
    },
    {
      icon: Users,
      title: 'Role-Aware Workspaces',
      description: 'Deliver tailored dashboards for admins, staff, drivers, and inspectors with zero configuration.',
      accent: 'Human-Centric',
    },
    {
      icon: Shield,
      title: 'Compliance Automation',
      description: 'Automate inspections, policy attestation, and audit-ready reporting with confident traceability.',
      accent: 'Risk & Safety',
    },
    {
      icon: Wrench,
      title: 'Predictive Maintenance',
      description: 'Surface maintenance windows before failure and coordinate vendors in the same view.',
      accent: 'Proactive Ops',
    },
  ];

  const stats = [
    { icon: LineChart, label: 'Vehicles orchestrated', value: '3.2k+', context: 'Live telemetry streams' },
    { icon: ShieldCheck, label: 'Compliance adherence', value: '98.4%', context: 'Across 7 industries' },
    { icon: Activity, label: 'Average response', value: '12m', context: 'Critical issue resolution' },
    { icon: BadgeCheck, label: 'Automation coverage', value: '42+', context: 'Ready-to-use playbooks' },
  ];

  const trustSignals = ['FleetCorp', 'Transport Masters', 'Axis Freight', 'Northwind Logistics', 'Orbit Mobility', 'Urban Deliveries'];

  const workflowSteps = [
    {
      icon: Route,
      title: 'Connect data in minutes',
      description: 'Bring in telematics, maintenance tools, and HRIS with native connectors or API drops.',
      pill: '01',
    },
    {
      icon: BarChart3,
      title: 'See the entire fleet heartbeat',
      description: 'Live command center with anomaly detection, ETA deviations, and schedule drift alerts.',
      pill: '02',
    },
    {
      icon: ClipboardCheck,
      title: 'Automate the busywork',
      description: 'Trigger workflows for service tickets, driver notifications, and compliance attestations.',
      pill: '03',
    },
    {
      icon: Gauge,
      title: 'Scale decisions with confidence',
      description: 'Portfolio-level forecasting, profitability insights, and board-ready intelligence.',
      pill: '04',
    },
  ];

  const testimonials = [
    {
      quote: 'FleetIA helped us cut unscheduled downtime by 22% in one quarter. The live readiness score became the one KPI our exec team trusts.',
      name: 'Lauren Mitchell',
      role: 'Director of Fleet Ops',
      company: 'Axis Freight',
      result: '22% downtime reduction',
    },
    {
      quote: 'Onboarding drivers, dispatch, and compliance teams onto one workspace changed our cadence. Everyone now works off the same reality.',
      name: 'Marcus Avery',
      role: 'Chief Operations Officer',
      company: 'Urban Deliveries',
      result: 'Single source of truth',
    },
  ];

  const tiers = [
    {
      name: 'Operations Suite',
      description: 'Command center, live maps, and workflow automation for day-to-day execution.',
      price: 'From $79 / mo',
      bullets: ['500 tracked assets', 'Incident + maintenance queues', 'AI-powered anomaly alerts'],
    },
    {
      name: 'Intelligence Suite',
      description: 'Predictive insights, compliance automation, and executive-level reporting.',
      price: 'From $149 / mo',
      bullets: ['Predictive maintenance modeling', 'Unlimited automation playbooks', 'Board-grade analytics'],
    },
  ];

  const demoAccounts = [
    { role: 'Admin', access: 'Full system access', creds: 'admin / admin123' },
    { role: 'Staff', access: 'Operations management', creds: 'staff1 / staff123' },
  ];

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
                <p className="text-base font-semibold tracking-wide text-white">Fleet Management</p>
                <p className="text-xs text-slate-400">Intelligence for modern operations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="border-white/20 text-white/90 hover:text-white hover:border-white/40 bg-white/5"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/signup')}
                className="btn-gradient text-sm px-5 py-2 rounded-full"
              >
                Get Started
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
              Fleet-grade intelligence, delivered as a service
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white">
                Build an operations command center your entire fleet trusts.
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-2xl">
                Orchestrate vehicles, drivers, maintenance partners, and compliance workflows in one beautiful workspace.
                FleetIA blends telemetry, automations, and executive-level reporting to keep every trip on schedule.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/auth/signup')}
                className="btn-gradient text-base px-8 py-6 rounded-full font-semibold shadow-xl hover:shadow-2xl"
              >
                Launch the live demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="rounded-full border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/5"
              >
                View dashboards
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                SOC 2-ready architecture
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-300" />
                14-day planet-scale trial
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                Guided onboarding in 30 min
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/70 via-indigo-500/70 to-purple-500/70 rounded-[32px] blur-3xl opacity-70 animate-pulse" />
            <Card className="relative glass-dark border-white/10 rounded-[32px] p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live snapshot</p>
                  <p className="text-2xl font-semibold text-white mt-1">Fleet status</p>
                </div>
                <div className="pill bg-emerald-400/10 text-emerald-200 border-emerald-400/20">Healthy</div>
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
                  <p className="text-sm text-slate-200">Readiness across depots</p>
                  <span className="text-xs text-emerald-200">+7.4% vs last week</span>
                </div>
                <div className="h-24 bg-black/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end gap-1 px-4 pb-3">
                    {[35, 45, 30, 60, 50, 70, 90].map((height, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-full bg-gradient-to-t from-blue-500/40 via-purple-500/50 to-pink-500/60"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Northern region</span>
                  <span>Live telemetry • 4 hubs</span>
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
            <span className="uppercase tracking-[0.5em] text-xs text-slate-500">Trusted by teams at</span>
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
            <p className="pill mx-auto bg-white/5 text-sky-100 border-white/10">Designed for modern operations</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">Everything you need to run a professional fleet</h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Put planning, execution, and compliance into a single UI. Each card is purpose-built with delightful micro-interactions and tailored insights.
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
            <p className="pill bg-white/5 text-sky-100 border-white/10 w-fit">Workflow clarity</p>
            <h3 className="text-3xl font-semibold text-white">From raw signals to automated resolution.</h3>
            <p className="text-slate-400">
              FleetIA orchestrates telemetry, manuals, SOPs, and escalation paths in one living workflow. Reduce meetings and inbox chaos with shared context.
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
                <p className="text-sm text-slate-400">Ops Review • Live</p>
                <p className="text-2xl font-semibold text-white">Q3 readiness dashboard</p>
              </div>
              <div className="pill bg-emerald-400/10 text-emerald-200 border-emerald-400/20 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Verified
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Autonomous workflows</span>
                <span>Last synced • 2m ago</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Maintenance', 'Compliance', 'Dispatch'].map((label, idx) => (
                  <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="text-2xl font-semibold text-white">
                      {idx === 0 ? '92%' : idx === 1 ? '98%' : '87%'}
                    </p>
                    <p className="text-xs text-emerald-200">Healthy</p>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-300" />
                AI keeps every playbook fresh with telemetry insight.
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-4 text-center">
            <p className="pill mx-auto bg-white/5 text-sky-100 border-white/10">Proof teams feel</p>
            <h3 className="text-3xl sm:text-4xl font-semibold text-white">Loved by operations leaders</h3>
            <p className="text-slate-400 max-w-3xl mx-auto">
              A calmer workday, fewer escalations, and richer exec conversations. FleetIA puts the right signal in front of the right person.
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
              <p className="pill bg-white/5 text-sky-100 border-white/10 w-fit">Choose your runway</p>
              <h3 className="text-3xl font-semibold text-white mt-4">Start with a 14-day guided experience.</h3>
              <p className="text-slate-400 mt-3 max-w-2xl">
                No credit card. We preload sample companies, routes, and ticket queues so you can feel the product in minutes.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="btn-gradient rounded-full px-6 py-4" onClick={() => router.push('/auth/signup')}>
                Book a product tour
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-white/5"
                onClick={() => router.push('/auth/signin')}
              >
                View sample data
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
                    <div className="pill bg-emerald-400/10 text-emerald-200 border-emerald-400/20">Popular</div>
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
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Demo Access</p>
              <h4 className="text-2xl font-semibold text-white">Try it with ready accounts</h4>
              <p className="text-slate-400 text-sm">We ship two full environments so you can experience end-to-end workflows.</p>
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
              <p className="text-xs text-slate-500">Need a custom sandbox? Ping us from inside the app chat.</p>
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
              <p className="font-semibold">Fleet Management System</p>
              <p className="text-xs text-slate-500">© 2025 FleetIA. All rights reserved.</p>
            </div>
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-[0.35em] text-slate-500">
            <span>Platform</span>
            <span>Security</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
