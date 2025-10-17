import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { School, Users, ClipboardCheck, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">SchoolMS</span>
            </div>
            <div className="flex gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Modern School Management Made{' '}
            <span className="text-primary">Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your school operations with our comprehensive management system. 
            Built for principals, teachers, and students.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features to manage your school efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">QR Attendance</h3>
            <p className="text-muted-foreground">
              Quick and accurate attendance tracking using QR codes
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Assignment Management</h3>
            <p className="text-muted-foreground">
              Create, distribute, and grade assignments seamlessly
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">User Management</h3>
            <p className="text-muted-foreground">
              Manage principals, teachers, and students efficiently
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-border">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <School className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Class Scheduling</h3>
            <p className="text-muted-foreground">
              Organize classes, subjects, and timetables with ease
            </p>
          </div>
        </div>
      </section>

      {/* Three Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Three Powerful Portals
          </h2>
          <p className="text-lg text-muted-foreground">
            Tailored experiences for every role
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-8 rounded-2xl border border-accent/20">
            <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center mb-4 mx-auto">
              <School className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-center text-foreground mb-4">Principal Portal</h3>
            <ul className="space-y-3">
              {['Manage all users', 'View school analytics', 'Create announcements', 'Monitor attendance'].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/20">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 mx-auto">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-center text-foreground mb-4">Teacher Portal</h3>
            <ul className="space-y-3">
              {['Manage classes', 'Create assignments', 'Grade submissions', 'Track attendance'].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-8 rounded-2xl border border-secondary/30">
            <div className="h-16 w-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-center text-foreground mb-4">Student Portal</h3>
            <ul className="space-y-3">
              {['View assignments', 'Submit work', 'Check attendance', 'Access QR code'].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-secondary-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of schools already using SchoolMS to streamline their operations.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">SchoolMS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SchoolMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}