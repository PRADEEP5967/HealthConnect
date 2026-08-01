import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Calendar, Pill, Activity, ShieldCheck, Stethoscope, Clock, Users, Ambulance, FileText, Bell, Phone, Mail, MapPin, ArrowRight, Star, CircleCheck as CheckCircle2, Building2, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "MediPulse — Hospital & Health Management Platform" },
      {
        name: "description",
        content:
          "Comprehensive hospital management platform for patient care, appointments, medications, health monitoring, and emergency response.",
      },
      { property: "og:title", content: "MediPulse — Hospital & Health Management Platform" },
      { property: "og:description", content: "Modern healthcare management for patients and administrators." },
    ],
  }),
});

const services = [
  {
    icon: HeartPulse,
    title: "Vitals Monitoring",
    description: "Track blood pressure, blood sugar, weight, and heart rate with interactive trend charts.",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: Pill,
    title: "Medication Management",
    description: "Manage prescriptions, set reminder schedules, and monitor adherence for every patient.",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: Calendar,
    title: "Appointment Scheduling",
    description: "Book, approve, and track consultations across departments with a unified calendar.",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40",
  },
  {
    icon: FileText,
    title: "Medical Records",
    description: "Centralized patient records with document uploads, admin notes, and full audit trails.",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Ambulance,
    title: "Emergency Response",
    description: "Emergency profiles with allergies, conditions, and contacts — verified by administrators.",
    color: "text-red-600 bg-red-50 dark:bg-red-950/40",
  },
  {
    icon: Activity,
    title: "Health Analytics",
    description: "Composite health scores, engagement metrics, and exportable reports for care teams.",
    color: "text-green-600 bg-green-50 dark:bg-green-950/40",
  },
];

const stats = [
  { value: "12K+", label: "Patients managed" },
  { value: "98%", label: "Appointment success" },
  { value: "24/7", label: "Monitoring" },
  { value: "6", label: "Care modules" },
];

const steps = [
  {
    number: "01",
    icon: Users,
    title: "Register your account",
    description: "Patients create a secure profile with medical history, emergency contacts, and health baseline.",
  },
  {
    number: "02",
    icon: Stethoscope,
    title: "Track & manage health",
    description: "Log vitals, medications, fitness, nutrition, and sleep. Admins monitor patient activity in real time.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Coordinate care",
    description: "Admins schedule appointments, send notifications, review records, and generate analytics reports.",
  },
];

const testimonials = [
  {
    name: "Dr. Amelia Chen",
    role: "Cardiologist, City Heart Clinic",
    quote:
      "MediPulse transformed how I coordinate care. Patient vitals, medications, and appointments are all in one place — I can review a full history before the consultation even begins.",
    rating: 5,
  },
  {
    name: "Rajiv Kumar",
    role: "Patient, Type 2 Diabetes",
    quote:
      "I never miss a dose now. The medication reminders and health trends keep me accountable, and my doctor can see my progress without me having to carry paper records.",
    rating: 5,
  },
  {
    name: "Nurse Sarah Williams",
    role: "Care Coordinator, Wellness Center",
    quote:
      "The admin dashboard gives me a bird's-eye view of every patient. Emergency profiles, activity logs, and health monitoring — everything I need to coordinate care efficiently.",
    rating: 5,
  },
];

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Patient Dashboard", to: "/dashboard" },
      { label: "Health Metrics", to: "/health" },
      { label: "Appointments", to: "/appointments" },
      { label: "Medical Records", to: "/records" },
      { label: "Emergency Profile", to: "/emergency" },
    ],
  },
  {
    title: "Admin",
    links: [
      { label: "Admin Dashboard", to: "/admin/dashboard" },
      { label: "User Management", to: "/admin/users" },
      { label: "Health Monitoring", to: "/admin/health-monitoring" },
      { label: "Reports & Analytics", to: "/admin/reports" },
      { label: "System Settings", to: "/admin/settings" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Health Articles", to: "/articles" },
      { label: "Sign In", to: "/login" },
      { label: "Create Account", to: "/register" },
    ],
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <img src="/logo.svg" alt="MediPulse" className="h-9 w-9 rounded-xl shadow-sm" />
            <span className="text-lg tracking-tight">MediPulse</span>
            <Badge variant="secondary" className="ml-1 hidden text-[10px] sm:inline-flex">
              Hospital OS
            </Badge>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#services" className="transition-colors hover:text-foreground">Services</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#testimonials" className="transition-colors hover:text-foreground">Reviews</a>
            <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Trusted by 12,000+ patients
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              The complete platform for{" "}
              <span className="text-primary">modern hospital management</span>
            </h1>
            <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              MediPulse unifies patient care, appointments, medications, and health monitoring
              into one calm, powerful dashboard — built for patients and care teams alike.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to="/register">Start free today <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in to dashboard</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No setup required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Local-first & secure</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Patient & admin tools</span>
            </div>
            <div className="mt-6 rounded-lg border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Demo accounts:</span>{" "}
              Admin — <b>admin@demo.local</b> / <b>admin123</b> &middot; Patient —{" "}
              <b>sara@demo.local</b> / <b>user123</b>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative animate-fade-in-up [animation-delay:150ms]">
            <div className="relative overflow-hidden rounded-2xl border shadow-2xl">
              <img
                src="https://github.com/PRADEEP5967/bloom-web-art/blob/93e68243f5be6bfaf6e4e8803c346006e3219f0d/header-image.png.png"
                alt="Doctor consulting a patient in a modern medical office"
                className="h-[420px] w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border bg-card p-4 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-success/10 text-success">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold leading-none">98%</div>
                  <div className="text-xs text-muted-foreground">Care success rate</div>
                </div>
              </div>
            </div>
            {/* Floating appointment card */}
            <div className="absolute -top-4 -right-4 hidden rounded-xl border bg-card p-3 shadow-lg sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold leading-none">Next visit</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Dr. Pradeep · 10:30 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats bar ===== */}
      <section className="border-y bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Services ===== */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3">Our Services</Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your hospital needs, in one platform
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            From routine vitals tracking to emergency response coordination — MediPulse covers
            the full spectrum of patient and administrative care.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Card
              key={s.title}
              className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${s.color} transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Card>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how-it-works" className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3">How it works</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to better coordinated care
            </h2>
            <p className="mt-4 text-muted-foreground">
              Get from sign-up to full health monitoring in minutes — no complex setup, no training required.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-full top-12 hidden h-px w-full bg-border md:block" />
                )}
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
                        {step.number}
                      </span>
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <step.icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Image showcase ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border shadow-xl">
              <img
                src="https://images.pexels.com/photos/7446996/pexels-photo-7446996.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Healthcare professionals reviewing patient data"
                className="h-[380px] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 hidden rounded-xl border bg-card p-4 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold leading-none">24/7</div>
                  <div className="text-xs text-muted-foreground">Real-time monitoring</div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Badge variant="outline" className="mb-3">For Care Teams</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              A dashboard that gives admins total visibility
            </h2>
            <p className="mt-4 text-muted-foreground">
              Monitor every patient's health activity, manage appointments across departments,
              track medication compliance, and respond to emergencies — all from a single
              administrative dashboard.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Users, text: "Full patient management with profiles, records, and activity timelines" },
                { icon: Activity, text: "Health monitoring with metrics, trends, and exportable reports" },
                { icon: Bell, text: "Broadcast notifications to all patients or targeted individuals" },
                { icon: ShieldCheck, text: "Emergency profiles verified by admins for trusted care coordination" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8" size="lg" asChild>
              <Link to="/login">Explore admin dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3">Testimonials</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by doctors, patients, and care teams
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-semibold">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground shadow-xl sm:px-12">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <Building2 className="mx-auto h-12 w-12 opacity-90" />
            <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to modernize your hospital management?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-primary-foreground/80">
              Join thousands of patients and care teams using MediPulse to deliver better,
              more coordinated healthcare.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">Create your account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="contact" className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Brand + contact */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 font-semibold">
                <img src="/logo.svg" alt="MediPulse" className="h-9 w-9 rounded-xl" />
                <span className="text-lg tracking-tight">MediPulse</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                A modern hospital management platform bringing patients, doctors, and care
                coordinators together.
              </p>
              <div className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+91 8130885013</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@medipulse.healt</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>120 Wellness Avenue, Health District</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Youtube, label: "YouTube" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center rounded-lg border text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; Er Pradeep Sahani {new Date().getFullYear()} MediPulse. 
            </p>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms of Service</a>
              <a href="#" className="transition-colors hover:text-foreground">HIPAA</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
