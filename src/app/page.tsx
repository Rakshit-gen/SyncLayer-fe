'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Users,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Clock,
  BarChart3,
  Bell,
  Lock,
  Sparkles,
  TrendingUp,
  Globe,
  Star,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/teams');
    }
  }, [status, router]);

  useEffect(() => {
    // Set visible immediately for hero section since it's above the fold
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);

    return () => {
      if (featuresRef.current) observer.unobserve(featuresRef.current);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-black flex items-center justify-center p-1.5">
                <Image
                  src="/SyncLayer.svg"
                  alt="SyncLayer"
                  width={24}
                  height={24}
                  className="object-contain animate-pulse"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SyncLayer
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 blur-3xl"></div>
        <div className="text-center max-w-4xl mx-auto relative z-10 opacity-100">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Real-time collaboration for modern teams
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up">
            Collaborate on tasks in{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient">
              real-time
            </span>
          </h1>
          <p className="text-xl md:text-2xl leading-8 text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            SyncLayer is a modern, real-time collaborative task management
            platform. Organize your team&apos;s work with intuitive kanban boards,
            track progress, and stay in sync.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up animation-delay-400">
            <Link href="/login">
              <Button size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in animation-delay-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="container mx-auto px-4 py-20 md:py-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to manage tasks
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help your team work more efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: 'Real-time Sync',
              description:
                'See changes instantly as your team updates tasks. No refresh needed.',
              color: 'from-yellow-500/20 to-orange-500/20',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              description:
                'Work together with your team. Assign tasks, track progress, and communicate effectively.',
              color: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: Shield,
              title: 'Role-based Access',
              description:
                'Control who can view, edit, or manage your boards with flexible permissions.',
              color: 'from-green-500/20 to-emerald-500/20',
            },
            {
              icon: BarChart3,
              title: 'Analytics & Insights',
              description:
                'Track your team\'s productivity with detailed analytics and performance metrics.',
              color: 'from-purple-500/20 to-pink-500/20',
            },
            {
              icon: Bell,
              title: 'Smart Notifications',
              description:
                'Stay updated with real-time notifications for task assignments and updates.',
              color: 'from-red-500/20 to-rose-500/20',
            },
            {
              icon: Lock,
              title: 'Enterprise Security',
              description:
                'Your data is protected with enterprise-grade security and encryption.',
              color: 'from-indigo-500/20 to-violet-500/20',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: '1',
              title: 'Create Your Team',
              description:
                'Set up your team workspace and invite members to collaborate.',
              icon: Users,
            },
            {
              step: '2',
              title: 'Create Boards',
              description:
                'Organize your projects with customizable kanban boards.',
              icon: LayoutDashboard,
            },
            {
              step: '3',
              title: 'Start Collaborating',
              description:
                'Assign tasks, track progress, and work together in real-time.',
              icon: TrendingUp,
            },
          ].map((step, index) => (
            <div
              key={step.step}
              className="text-center relative animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {index < 2 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-primary/20 transform -translate-x-1/2"></div>
              )}
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Teams', value: '10K+', icon: Users },
            { label: 'Tasks Completed', value: '1M+', icon: CheckCircle2 },
            { label: 'Countries', value: '50+', icon: Globe },
            { label: 'Satisfaction', value: '99%', icon: Star },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by teams worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about SyncLayer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Sarah Johnson',
              role: 'Product Manager',
              company: 'TechCorp',
              content:
                'SyncLayer has transformed how our team collaborates. The real-time updates keep everyone in sync.',
              rating: 5,
            },
            {
              name: 'Michael Chen',
              role: 'Engineering Lead',
              company: 'StartupXYZ',
              content:
                'The best task management tool we\'ve used. Simple, powerful, and exactly what we needed.',
              rating: 5,
            },
            {
              name: 'Emily Rodriguez',
              role: 'Design Director',
              company: 'CreativeStudio',
              content:
                'Love the intuitive interface and how easy it is to organize our design projects.',
              rating: 5,
            },
          ].map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                &quot;{testimonial.content}&quot;
              </p>
              <div>
                <div className="font-semibold text-foreground">
                  {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Start collaborating today
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Join teams worldwide who trust SyncLayer for their project management
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="group min-w-[200px]">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • Free forever • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-black flex items-center justify-center p-1">
                  <Image
                    src="/SyncLayer.svg"
                    alt="SyncLayer"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold">SyncLayer</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modern task management for teams that move fast.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-foreground text-sm uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-foreground text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-foreground text-sm uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 SyncLayer. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
