'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Brain, TrendingUp, CheckCircle2, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="fixed inset-0 aurora-bg -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-linear-to-b from-rose-900/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-linear-to-l from-pink-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-t from-rose-900/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-rose-500/10' : 'bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Resumind</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-foreground/70 hover:text-foreground transition">
              Features
            </a>
            <a href="#benefits" className="text-sm text-foreground/70 hover:text-foreground transition">
              Benefits
            </a>
            <a href="#pricing" className="text-sm text-foreground/70 hover:text-foreground transition">
              Pricing
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-foreground hover:bg-white/10" onClick={() => router.push('/user/login')}>
              Sign In
            </Button>
            <Button className="gradient-accent border-0" onClick={() => router.push('/user/register')}>
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-rose-500/10 p-4"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-foreground/70 hover:text-foreground transition">
                Features
              </a>
              <a href="#benefits" className="text-foreground/70 hover:text-foreground transition">
                Benefits
              </a>
              <a href="#pricing" className="text-foreground/70 hover:text-foreground transition">
                Pricing
              </a>
              <div className="border-t border-rose-500/10 pt-4 flex gap-2">
                <Button variant="ghost" className="flex-1 text-foreground" onClick={() => router.push('/user/login')}>
                  Sign In
                </Button>
                <Button className="flex-1 gradient-accent border-0" onClick={() => router.push('/user/register')}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-purple-500/20 rounded-full">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-sm text-foreground/80">Powered by Advanced AI Technology</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            <span className="text-foreground">Your Resume,</span>{' '}
            <span className="gradient-text">Supercharged</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 mb-8 text-balance max-w-3xl mx-auto leading-relaxed">
            Get instant AI-powered analysis of your resume. Identify weaknesses, improve formatting, and optimize your content to land more interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="gradient-accent border-0 text-lg px-8 h-14 group"
              onClick={() => router.push('/user/register')}
            >
              Analyze Your Resume
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border border-purple-500/30 text-lg px-8 h-14 hover:bg-white/5"
              onClick={() => {
                window.location.hash = 'features';
              }}
            >
              Watch Demo
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-purple-500/10">
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">50K+</p>
              <p className="text-sm text-foreground/60">Resumes Analyzed</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">92%</p>
              <p className="text-sm text-foreground/60">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">4.9★</p>
              <p className="text-sm text-foreground/60">User Rating</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">5min</p>
              <p className="text-sm text-foreground/60">Average Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Intelligent Features</span>
            </h2>
            <p className="text-lg text-foreground/60">Everything you need to create a resume that gets noticed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="glow-card rounded-lg p-8 group hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Content Analysis</h3>
              <p className="text-foreground/70">Our AI analyzes your resume content for impact, relevance, and keyword optimization to match job descriptions.</p>
            </div>

            {/* Feature Card 2 */}
            <div className="glow-card rounded-lg p-8 group hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Format Optimization</h3>
              <p className="text-foreground/70">Get real-time formatting suggestions, ATS compatibility checks, and layout recommendations for maximum readability.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="glow-card rounded-lg p-8 group hover:bg-white/10 transition duration-300">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Insights</h3>
              <p className="text-foreground/70">Get actionable, personalized recommendations based on your industry and target role to make your resume shine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-purple-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Thousands Choose <span className="gradient-text">Resumind</span>
              </h2>
              <div className="space-y-4">
                {[
                  'Get hired 3x faster with AI-optimized resumes',
                  'Beat ATS systems and land interviews',
                  'Industry-specific recommendations',
                  'Real-time feedback as you type',
                  'Compare with top-performing resumes',
                  'Export in multiple formats instantly',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                    <p className="text-foreground/80">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="glow-card rounded-lg overflow-hidden p-6 h-96 flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 to-indigo-600/20" />
                <div className="relative text-center">
                  <div className="w-16 h-16 rounded-lg gradient-accent flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-foreground/80 font-semibold">Your Resume Score</p>
                  <p className="text-5xl font-bold gradient-text mt-2">92/100</p>
                  <p className="text-sm text-foreground/60 mt-2">Ready to apply!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-purple-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Simple Pricing</span>
            </h2>
            <p className="text-lg text-foreground/60">Choose the credits that work for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12">
            {/* Credit Package */}
            <div className="glow-card rounded-lg p-8 group hover:bg-white/10 transition duration-300">
              <div className="mb-6">
                <p className="text-4xl font-bold mb-2">$1</p>
                <p className="text-foreground/70">5 Credits</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-foreground/80">5 Resume Analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-foreground/80">Instant Feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-foreground/80">Never Expires</span>
                </li>
              </ul>
              <Button className="w-full gradient-accent border-0" onClick={() => router.push('/user/register')}>
                Buy Credits
              </Button>
            </div>

            {/* Cost Breakdown */}
            <div className="glow-card rounded-lg p-8 bg-white/5 border-2 border-purple-500/30">
              <h3 className="text-xl font-bold mb-6">Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">1 Resume Analysis</span>
                  <span className="font-semibold">3 Credits</span>
                </div>
                <div className="border-t border-purple-500/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">5 Credits Package</span>
                    <span className="font-semibold">$1</span>
                  </div>
                  <p className="text-sm text-purple-400 mt-2">= $0.20 per credit</p>
                </div>
                <div className="border-t border-purple-500/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground/70">You can analyze</span>
                    <span className="font-bold gradient-text">1 Resume</span>
                  </div>
                  <p className="text-xs text-foreground/60">Plus 2 credits remaining for next time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Pricing Info */}
          <div className="max-w-2xl mx-auto bg-white/5 border border-purple-500/20 rounded-lg p-8 text-center">
            <p className="text-foreground/80 mb-3">
              <span className="font-semibold">Need more credits?</span> Contact us for bulk pricing and discounts
            </p>
            <Button
              variant="outline"
              className="border border-purple-500/30 text-foreground hover:bg-white/5"
              onClick={() => router.push('/user/register')}
            >
              Get Bulk Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glow-card rounded-2xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have already improved their resumes and landed their dream jobs with Resumind.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gradient-accent border-0 text-lg px-8 h-14 group"
                onClick={() => router.push('/user/register')}
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
              </Button>
              <p className="text-sm text-foreground/60">No credit card required • Takes 5 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Resumind</span>
              </div>
              <p className="text-sm text-foreground/60">AI-powered resume analysis for the modern job seeker.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#benefits" className="hover:text-foreground transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="#benefits" className="hover:text-foreground transition">About</a></li>
                <li><a href="#features" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="mailto:support@resumind.app" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><a href="/" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="/" className="hover:text-foreground transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/10 pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2024 Resumind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
