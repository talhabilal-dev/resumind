'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  Zap,
  TrendingUp,
  CheckCircle2,
  Menu,
  X,
  Sparkles,
  FileText,
  Target,
  ShieldCheck,
  Star,
  Quote,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  LineChart,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#pricing', label: 'Pricing' },
];

const features = [
  {
    icon: Brain,
    title: 'AI Content Analysis',
    description:
      'Our AI evaluates word choice, impact, and keyword relevance to align your resume with the roles you want.',
    accent: 'from-rose-600 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Format Optimization',
    description:
      'Instant formatting suggestions and ATS compatibility checks keep your resume readable by both humans and machines.',
    accent: 'from-pink-600 to-rose-500',
  },
  {
    icon: Target,
    title: 'JD Match Scoring',
    description:
      'Upload a job description and get a precise match score with the exact keywords and skills you are missing.',
    accent: 'from-rose-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Personalized Insights',
    description:
      'Role-specific, actionable recommendations help you refine your story and stand out to recruiters.',
    accent: 'from-fuchsia-600 to-pink-500',
  },
  {
    icon: ShieldCheck,
    title: 'Industry Benchmarking',
    description:
      'Compare your resume against ATS benchmarks across summary, content, structure, and skills.',
    accent: 'from-rose-600 to-fuchsia-500',
  },
  {
    icon: FileText,
    title: 'PDF Export',
    description:
      'Download a clean, ATS-friendly, AI-improved PDF version of your resume whenever you are ready.',
    accent: 'from-pink-500 to-rose-600',
  },
];

const steps = [
  {
    step: '01',
    icon: FileText,
    title: 'Upload your resume',
    desc: 'Drop in your current resume. Paste a job description for a targeted, JD-specific review — or skip it for a general AI analysis.',
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI scores it instantly',
    desc: 'Our engine scores your resume across summary, content, structure, and skills in under a minute.',
  },
  {
    step: '03',
    icon: LineChart,
    title: 'Apply the fixes & export',
    desc: 'Follow clear, prioritized recommendations, raise your score, and download the improved PDF the moment it is ready.',
  },
];

const benefits = [
  'ATS-friendly, job-targeted resume content',
  'Beat ATS filters with missing-keyword detection',
  'Role-specific recommendations',
  'Immediate, structured AI feedback',
  'Scores across summary, content, structure and skills',
  'Export your AI-improved CV as a PDF',
];

const testimonials = [
  {
    name: 'Amina Khan',
    role: 'Frontend Engineer',
    quote: 'The JD match score told me exactly what keywords I was missing. I updated my resume and started getting interviews within two weeks.',
    initials: 'AK',
  },
  {
    name: 'Daniel Ruiz',
    role: 'Product Manager',
    quote: 'I had no idea my resume was ranking so poorly with ATS filters. Five minutes after submitting, I had a clear, prioritized list of fixes.',
    initials: 'DR',
  },
  {
    name: 'Sara Al-Matouq',
    role: 'Data Analyst',
    quote: 'The layout recommendations alone were worth it. My resume finally looks clean AND passes the scanners. The PDF export is beautiful.',
    initials: 'SM',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$5',
    credits: '50 Credits',
    tagline: 'Perfect for trying it out',
    popular: false,
    features: ['Up to 10 resume analyses', 'Instant AI feedback', 'Never expires'],
  },
  {
    name: 'Growth',
    price: '$15',
    credits: '150 Credits',
    tagline: 'Best value for active seekers',
    popular: true,
    features: [
      'Up to 30 resume analyses',
      'Improved CV PDF exports',
      'Best value for active job seekers',
      'Priority support',
    ],
  },
  {
    name: 'Pro',
    price: '$40',
    credits: '400 Credits',
    tagline: 'For serious job hunting',
    popular: false,
    features: ['Up to 80 resume analyses', 'All features included', 'Lowest per-credit cost'],
  },
];

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ firstname: string; lastname: string; username: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/users/profile', { cache: 'no-store' });
        const data = await res.json();
        if (active && res.ok && data?.user) {
          setUser({
            firstname: data.user.firstname || '',
            lastname: data.user.lastname || '',
            username: data.user.username || '',
          });
        }
      } catch {
        // Not signed in — keep default nav.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const initials = user
    ? `${user.firstname[0] || ''}${user.lastname[0] || ''}`.toUpperCase() || user.username[0]?.toUpperCase() || 'U'
    : '';

  const displayName = user
    ? `${user.firstname} ${user.lastname}`.trim() || user.username
    : '';

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await fetch('/api/users/logout', { method: 'POST' });
    } catch {
      // Ignore — cookies are cleared client-side below anyway.
    }
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const goTo = (hash: string) => () => {
    setIsMenuOpen(false);
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 aurora-bg -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[34rem] bg-linear-to-b from-rose-900/40 via-pink-900/20 to-transparent blur-3xl" />
        <div className="absolute top-32 -left-32 w-96 h-96 bg-linear-to-tr from-pink-900/25 to-transparent blur-3xl" />
        <div className="absolute top-96 right-0 w-[28rem] h-[28rem] bg-linear-to-bl from-fuchsia-900/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 to-transparent blur-3xl" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-rose-500/10 shadow-lg shadow-rose-950/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-rose-500/40 group-hover:scale-105 transition">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Resumind</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
              >
                {l.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-rose-500/20 bg-white/5 py-1.5 pl-1.5 pr-4 hover:bg-white/10 transition"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-white">
                    {initials}
                  </span>
                  <span className="text-sm font-medium text-foreground max-w-[8rem] truncate">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-foreground/60" />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-rose-500/15 bg-background/95 backdrop-blur-md shadow-xl shadow-rose-950/20 p-1.5"
                  >
                    <div className="px-3 py-2 border-b border-rose-500/10 mb-1">
                      <p className="text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="text-xs text-foreground/60">@{user.username}</p>
                    </div>
                    <a
                      href="/user/dashboard"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-white/5 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </a>
                    <a
                      href="/user/dashboard/settings"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-white/5 transition"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </a>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-foreground hover:bg-white/10" onClick={() => router.push('/user/login')}>
                  Sign In
                </Button>
                <Button className="gradient-accent border-0 shadow-lg shadow-rose-500/40 hover:shadow-rose-500/60 transition-shadow" onClick={() => router.push('/user/register')}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="lg:hidden bg-background/95 backdrop-blur-md border-b border-rose-500/10 p-5"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-foreground/75 hover:text-foreground hover:bg-white/5 transition"
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t border-rose-500/10 mt-3 pt-4 flex gap-2">
                {user ? (
                  <>
                    <Button className="flex-1 bg-white/10 text-foreground hover:bg-white/15 border-0" onClick={() => router.push('/user/dashboard')}>
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="flex-1 text-rose-300" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="flex-1 text-foreground" onClick={() => router.push('/user/login')}>
                      Sign In
                    </Button>
                    <Button className="flex-1 gradient-accent border-0" onClick={() => router.push('/user/register')}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col justify-center pt-24 pb-12 px-4 sm:px-6 lg:min-h-screen lg:pt-32 lg:pb-14 lg:px-8">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute top-1/2 -left-40 -translate-y-1/2 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-0 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b from-rose-900/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto w-full flex-1 flex items-center">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 items-center">
            {/* Left: copy + CTAs */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-rose-500/20 rounded-full backdrop-blur-sm shadow-lg shadow-rose-950/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                </span>
                <Sparkles className="w-4 h-4 text-rose-300" />
                <span className="text-sm text-foreground/85">Powered by advanced AI resume analysis</span>
              </div>

              <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-[1.05]">
                <span className="text-foreground">Your Resume,</span>
                <br className="hidden sm:block" />
                <span className="gradient-text drop-shadow-[0_0_25px_rgba(244,63,94,0.45)]">Supercharged</span>
                <span className="text-foreground"> by AI</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-foreground/70 text-balance leading-relaxed">
                Turn your resume into an ATS-winning, job-targeted document. Get instant AI analysis, precise
                JD match scores, and improvements you can download and use in minutes.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-start gap-4">
                <Button
                  size="lg"
                  className="group relative flex-1 w-full gradient-accent border-0 text-lg px-8 h-24 shadow-xl shadow-rose-600/40 hover:shadow-rose-500/60 hover:scale-[1.03] transition-all overflow-hidden"
                  onClick={() => router.push('/user/register')}
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Analyze Your Resume Free</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 relative transition" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group flex-1 w-full border border-rose-500/30 text-lg px-8 h-14 hover:bg-white/5 hover:border-rose-500/50 transition-all"
                  onClick={() => goTo('#features')}
                >
                  Explore Features
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition" />
                </Button>
              </div>
            </div>

            {/* Right: stat cards */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 bg-gradient-to-tr from-rose-500/25 via-pink-500/15 to-fuchsia-500/20 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { value: '5 credits', label: 'per Resume Analysis', icon: Zap },
                  { value: '4 modules', label: 'Scored by our AI', icon: Brain },
                  { value: 'ATS + JD', label: 'Matching insights', icon: Target },
                  { value: 'PDF export', label: 'Improved CV download', icon: FileText },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="group relative overflow-hidden rounded-2xl border border-rose-500/15 bg-white/[0.04] backdrop-blur-sm p-4 sm:p-6 text-left hover:bg-white/[0.08] hover:border-rose-500/40 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${i % 2 === 0 ? 'from-rose-500/20 to-pink-500/10' : 'from-pink-500/20 to-fuchsia-500/10'} blur-2xl group-hover:opacity-100 transition`} />
                    <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 group-hover:from-rose-500/30 group-hover:to-pink-500/20 group-hover:scale-110 transition">
                      <s.icon className="w-5 h-5 text-rose-300" />
                    </div>
                    <p className="relative text-2xl font-extrabold gradient-text">{s.value}</p>
                    <p className="relative mt-1 text-sm text-foreground/60">{s.label}</p>
                    <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${i % 2 === 0 ? 'from-rose-500 to-pink-500' : 'from-pink-500 to-fuchsia-500'} opacity-0 group-hover:opacity-100 transition`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <a href="#features" onClick={() => goTo('#features')} aria-label="Scroll to features" className="pointer-events-auto mx-auto flex h-10 w-6 items-start justify-center rounded-full border border-rose-500/30 pt-2">
          <span className="h-2 w-1 animate-bounce rounded-full bg-rose-400" />
        </a>
      </section>

      {/* Trusted strip */}
      {/* <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-4">
            From entry-level candidates to senior professionals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-foreground/40">
            <span className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="w-4 h-4 text-rose-400" /> ATS-friendly</span>
            <span className="text-sm font-semibold">✦ Role-specific</span>
            <span className="text-sm font-semibold">✦ Instant feedback</span>
            <span className="text-sm font-semibold">✦ Privacy-first</span>
          </div>
        </div>
      </section> */}

      {/* Features */}
      <section id="features" className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block text-xs uppercase tracking-widest text-rose-300/80 mb-3">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Everything</span> you need to get noticed
            </h2>
            <p className="mt-4 text-lg text-foreground/60">
              A complete toolkit for building a resume that clears ATS filters and wins interviews.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative glow-card rounded-2xl p-8 transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1"
              >
                <div className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition`} />
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30 group-hover:scale-110 group-hover:rotate-3 transition`}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-rose-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block text-xs uppercase tracking-widest text-rose-300/80 mb-3">How it works</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              From resume to <span className="gradient-text">ready to apply</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">Three simple steps to a stronger resume.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="group relative glow-card rounded-2xl p-8 hover:bg-white/[0.06] transition">
                <span className="absolute top-6 right-6 text-6xl font-extrabold text-white/5 group-hover:text-rose-500/10 transition">
                  {s.step}
                </span>
                <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30 group-hover:scale-110 transition">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-rose-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest text-rose-300/80 mb-3">Benefits</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why job seekers choose <span className="gradient-text">Resumind</span>
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="group flex items-center gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:bg-rose-500/20 transition">
                      <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-foreground/85">{benefit}</p>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="mt-8 gradient-accent border-0 shadow-lg shadow-rose-500/40"
                onClick={() => router.push('/user/register')}
              >
                Start Improving Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-br from-rose-500/20 to-transparent rounded-[2rem] blur-2xl" />
              <div className="relative glow-card rounded-2xl overflow-hidden p-8">
                <div className="absolute inset-0 bg-linear-to-br from-rose-900/20 via-pink-900/10 to-transparent" />
                <div className="relative flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-rose-500/40">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Marketing Manager</p>
                      <p className="text-xs text-foreground/60">Optimized with JD matching</p>
                    </div>
                  </div>
                  <ContentBadge />
                </div>

                <div className="relative grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Summary', value: 94, color: 'from-rose-500 to-pink-500' },
                    { label: 'Content', value: 88, color: 'from-pink-500 to-fuchsia-500' },
                    { label: 'Structure', value: 96, color: 'from-rose-400 to-pink-400' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-2xl font-extrabold text-white">{m.value}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${m.value}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-foreground/60">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-center gap-4">
                  <span className="text-foreground/70 text-sm">Overall Score</span>
                  <span className="text-5xl font-extrabold gradient-text">92</span>
                  <span className="text-foreground/60 text-sm">/100</span>
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <TrendingUp className="w-4 h-4" /> +18
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-rose-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block text-xs uppercase tracking-widest text-rose-300/80 mb-3">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Loved by <span className="gradient-text">job seekers</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">Real results from people who took the guesswork out of their job search.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.name} className="glow-card rounded-2xl p-8 hover:bg-white/[0.06] hover:-translate-y-1 transition">
                <Quote className="w-8 h-8 text-rose-400/40 mb-4" />
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-foreground/80 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full gradient-accent flex items-center justify-center font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-foreground/60">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-rose-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block text-xs uppercase tracking-widest text-rose-300/80 mb-3">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Simple, flexible <span className="gradient-text">credits</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">Buy credits once. They never expire. Pay only for what you use.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative glow-card rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-rose-900/60 to-pink-900/40 border-2 lg:scale-105 shadow-2xl shadow-rose-500/30'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-accent text-xs font-bold text-white shadow-lg">
                    Most Popular
                  </span>
                )}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">{plan.name}</p>
                </div>
                <p className="text-5xl font-extrabold mb-1">{plan.price}</p>
                <p className="text-foreground/60 mb-1">{plan.credits}</p>
                <p className="text-sm text-foreground/50 mb-8">{plan.tagline}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-foreground/85">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full border-0 text-white ${plan.popular ? 'gradient-accent shadow-lg shadow-rose-500/40' : 'bg-white/10 text-foreground hover:bg-white/20'}`}
                  onClick={() => router.push('/user/register')}
                >
                  Buy Credits
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 glow-card rounded-2xl p-8 md:p-10 bg-white/5">
            <h3 className="text-xl font-bold mb-8 text-center">How credits work</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {statsRows}
            </div>
            <div className="mt-6 border-t border-rose-500/10 pt-4 text-center">
              <span className="inline-flex items-center gap-2 text-foreground/60 text-sm">
                <Sparkles className="w-4 h-4 text-rose-400" />
                Every account starts with <span className="font-semibold text-rose-300">10 free credits</span> — no credit card required.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative glow-card rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-500/30 blur-3xl rounded-full" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="gradient-text">transform</span> your resume?
              </h2>
              <p className="text-lg text-foreground/70 mb-9 max-w-2xl mx-auto">
                Improve your resume with instant AI analysis and job-targeted feedback in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="group gradient-accent border-0 text-lg px-9 h-14 shadow-xl shadow-rose-600/40 hover:scale-[1.02] transition"
                  onClick={() => router.push('/user/register')}
                >
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </Button>
              </div>
              <p className="mt-5 text-sm text-foreground/50">
                No credit card required &bull; Takes ~5 minutes &bull; 10 free credits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-500/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold gradient-text text-lg">Resumind</span>
              </div>
              <p className="text-sm text-foreground/60 leading-relaxed">
                AI-powered resume analysis for the modern job seeker.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-8 sm:grid-cols-2 max-w-sm">
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2.5 text-sm text-foreground/60">
                  <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-foreground transition">How it works</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Get Started</h4>
                <ul className="space-y-2.5 text-sm text-foreground/60">
                  <li><a href="/user/register" className="hover:text-foreground transition">Create Account</a></li>
                  <li><a href="/user/login" className="hover:text-foreground transition">Sign In</a></li>
                  <li><a href="mailto:support@resumind.app" className="hover:text-foreground transition">Contact</a></li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Supported by</h4>
              <ul className="space-y-2.5 text-sm text-foreground/60">
                <li>Powered by advanced AI</li>
                <li>Secure, credit-based billing via Stripe</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-rose-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-sm text-foreground/60">
            <p>&copy; {new Date().getFullYear()} Resumind. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <Heart /> Made to help you land your next role
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContentBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1">
      <CheckCircle2 className="w-3.5 h-3.5" /> ATS Passed
    </span>
  );
}

function Heart() {
  return <span className="text-rose-400">❤</span>;
}

const statsRows = [
  { label: 'Resume Analysis', cost: '5 credits', note: '$0.50 at the Growth rate' },
  { label: 'CV + JD Analysis', cost: '5 credits', note: 'Includes ATS & JD match scores' },
  { label: 'Improved CV PDF', cost: '3 credits', note: 'Downloadable after JD analysis' },
].map((r) => (
  <div key={r.label}>
    <p className="text-foreground/70">{r.label}</p>
    <p className="mt-1 text-lg font-semibold">{r.cost}</p>
    <p className="text-sm text-rose-400 mt-1">{r.note}</p>
  </div>
));