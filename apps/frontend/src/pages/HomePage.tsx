import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Syringe, ShieldCheck, Users, Calendar, Clock, MapPin, Phone, Mail,
  CheckCircle2, ArrowRight, HeartPulse, Activity, Award, HelpCircle,
  ChevronDown, ChevronUp, AlertCircle, Building2, Stethoscope,
  Sparkles, Check, ExternalLink, ShieldAlert, FileText, ArrowUpRight
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthUser } from "../lib/types";

interface HomePageProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const vaccines = [
    {
      name: "COVID-19 Bivalent",
      type: "mRNA (Pfizer/BioNTech)",
      target: "Ages 12+ · Adults & Seniors",
      doses: "Primary & Booster",
      stock: "In Stock",
      description: "Protection against original and circulating Omicron variants. Recommended for vulnerable residents and frontline workers.",
      availableDays: "Mon, Wed, Fri"
    },
    {
      name: "Influenza Quadrivalent",
      type: "Inactivated (Sanofi Pasteur)",
      target: "Seniors (60+) · Children · Pregnant Women",
      doses: "Annual Single Dose",
      stock: "In Stock",
      description: "Annual flu immunization providing 4-strain defense against seasonal influenza, reducing respiratory complications.",
      availableDays: "Wed & Fri Morning"
    },
    {
      name: "Pneumococcal Conjugate (PCV)",
      type: "Conjugate 13-Valent",
      target: "Senior Citizens (60+) · Infants",
      doses: "2-Dose Series",
      stock: "In Stock",
      description: "Guards against invasive pneumococcal infections including bacterial pneumonia, meningitis, and bloodstream infections.",
      availableDays: "Tue & Thu"
    },
    {
      name: "Hepatitis B",
      type: "Recombinant DNA",
      target: "Newborns · Catch-up Young Adults",
      doses: "3-Dose Schedule",
      stock: "In Stock",
      description: "Long-term immunity against Hepatitis B virus causing chronic liver disease, cirrhosis, and related complications.",
      availableDays: "Mon & Fri"
    },
    {
      name: "Human Papillomavirus (HPV)",
      type: "Recombinant Quadrivalent",
      target: "Adolescent Females (Ages 9–14)",
      doses: "2-Dose Regimen",
      stock: "Limited Stock",
      description: "DOH-recommended cancer prevention vaccine protecting young women from high-risk HPV strains associated with cervical cancer.",
      availableDays: "Wednesdays"
    },
    {
      name: "Measles, Mumps, Rubella (MMR)",
      type: "Live Attenuated (EPI Program)",
      target: "Infants (9 mos & 12–15 mos)",
      doses: "2 Routine Doses",
      stock: "In Stock",
      description: "Essential childhood immunization series under the DOH Expanded Program on Immunization (EPI) to prevent outbreaks.",
      availableDays: "Wednesdays"
    }
  ];

  const faqs = [
    {
      question: "Are the vaccines at the Barangay Health Center completely free?",
      answer: "Yes, all routine childhood and government-allocated adult vaccines (including COVID-19 boosters, flu shots for priority groups, and infant immunizations) are 100% free for all registered barangay residents under the Department of Health (DOH) National Immunization Program."
    },
    {
      question: "What documents do I need to bring for my vaccination visit?",
      answer: "Please bring any government-issued ID or Barangay Certificate proving residency. For children and infants, kindly bring their Baby Immunization Book (Mother and Child Health Record) so our nurses can update the physical record as well as the digital VaxCare system."
    },
    {
      question: "How do I find my Resident ID for the Resident Portal?",
      answer: "Your Resident ID (e.g. R001) is assigned during your barangay health profiling. If you do not have your ID handy, you can visit the health center or contact your designated Purok Health Leader who can quickly look up your assigned ID in our directory."
    },
    {
      question: "Can I download and print a digital vaccination certificate?",
      answer: "Yes! Once you sign in to the Resident Portal, you can generate an official Digital Vaccination Certificate containing your complete immunization history, vaccine batch numbers, administering nurse details, and a verification QR code valid for school, work, or travel."
    },
    {
      question: "What should I do if I missed my scheduled vaccination date?",
      answer: "Do not worry! We have catch-up walk-in clinic hours every Tuesday and Thursday afternoon. You can also sign in to your Resident Portal to check catch-up slots or send an SMS inquiry to our health center desk."
    }
  ];

  const clinicHours = [
    {
      title: "Routine Immunization & Booster Clinic",
      days: "Monday, Wednesday, Friday",
      hours: "8:00 AM – 5:00 PM",
      scope: "Adult vaccines, COVID-19 boosters, Hepatitis B, and general immunization profiling.",
      status: "General Service"
    },
    {
      title: "Infant & Under-Five Immunization (EPI)",
      days: "Wednesday & Friday Morning",
      hours: "8:30 AM – 3:30 PM",
      scope: "Infant vaccines (BCG, Hepatitis B, Pentavalent, Oral Polio, MMR) with pediatric assessment.",
      status: "Pediatric Clinic"
    },
    {
      title: "Senior Citizens & Priority Patients",
      days: "Saturday Morning",
      hours: "8:00 AM – 12:00 PM",
      scope: "Priority lane for senior citizens (60+) receiving annual Flu and Pneumococcal vaccines.",
      status: "Priority Access"
    },
    {
      title: "Purok Community Outreach Drive",
      days: "Monthly per Purok (Announced)",
      hours: "9:00 AM – 3:00 PM",
      scope: "Mobile health station visits across Purok 1 to Purok 10 for residents unable to visit the center.",
      status: "Community Outreach"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07131D] text-slate-900 dark:text-slate-100 flex flex-col transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ─── Top Advisory Bar ─── */}
      <div className="bg-[#0B7065] dark:bg-[#084E47] text-white text-xs sm:text-sm py-2.5 px-4 border-b border-[#085a52]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">
              Advisory
            </span>
            <span className="text-white/95 font-medium">
              Free Infant Immunization & Senior Flu Vaccination every Wednesday & Friday at the Health Center. Walk-ins welcome.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-white/90 shrink-0 font-medium">
            <span className="flex items-center gap-1.5"><Phone size={13} /> (02) 8123-4567</span>
            <span className="hidden md:flex items-center gap-1.5"><Clock size={13} /> Mon–Fri: 8:00 AM – 5:00 PM</span>
          </div>
        </div>
      </div>

      {/* ─── Main Navigation Header ─── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0A1E2F]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#163247] transition-colors shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B7065] to-[#14B8A6] flex items-center justify-center text-white shadow-sm shadow-teal-950/20">
              <Syringe size={22} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                VaxCare <span className="text-xs font-bold bg-teal-50 dark:bg-[#112C3F] text-[#0B7065] dark:text-[#38BDF8] px-2 py-0.5 rounded-md border border-teal-200 dark:border-[#164E63]">v1.0</span>
              </span>
              <p className="text-xs text-slate-500 dark:text-[#8FAEC5] font-semibold -mt-0.5">Barangay Health Center</p>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#overview" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Overview</a>
            <a href="#portals" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Resident Portal</a>
            <a href="#vaccines" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Available Vaccines</a>
            <a href="#schedule" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Clinic Schedule</a>
            <a href="#guide" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Resident Guide</a>
            <a href="#faq" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">FAQs</a>
            <a href="#contact" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Contact</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(user.role === "resident" ? "/portal" : "/dashboard")}
                  className="bg-[#0B7065] hover:bg-[#095c53] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Activity size={15} />
                  {user.role === "resident" ? "My Health Portal" : "Staff Dashboard"}
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* Resident Access Button */}
                <Link
                  to="/resident/login"
                  className="bg-[#0B7065] hover:bg-[#095c53] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <ShieldCheck size={16} />
                  <span>Resident Portal</span>
                </Link>

                {/* Medical Portal (Staff & Admin Access) */}
                <Link
                  to="/staff/login"
                  className="border border-slate-300 dark:border-[#1E3A4E] hover:border-[#0B7065] dark:hover:border-teal-500 bg-slate-50 dark:bg-[#0C1D2B] hover:bg-white dark:hover:bg-[#122A3C] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-2xs group"
                  title="Staff & Medical Personnel Portal"
                >
                  <Stethoscope size={15} className="text-[#0B7065] dark:text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Medical Portal</span>
                  <span className="sm:hidden">Medical</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section (Proportionate, Prominent & High-Impact) ─── */}
      <section id="overview" className="py-16 md:py-24 bg-white dark:bg-[#0A1E2F] border-b border-slate-200 dark:border-[#163247]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Minimalist pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-[#112C3F] border border-teal-200 dark:border-[#164E63] text-[#0B7065] dark:text-[#38BDF8] text-xs sm:text-sm font-bold mb-5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0B7065] dark:bg-[#38BDF8] animate-pulse" />
              <span>Official Barangay Health Center Immunization System</span>
            </div>

            {/* Prominent, readable typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-5">
              Protecting Our Barangay, <br />
              <span className="text-[#0B7065] dark:text-[#2DD4BF]">One Vaccine at a Time</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Safe, accessible, and digitized healthcare for every family. Check your personal vaccination schedule, review medical histories, and verify official immunization certificates with speed and ease.
            </p>
          </div>

          {/* ─── Resident Health Portal Gateway (Citizen-Focused Hero Centerpiece) ─── */}
          <div id="portals" className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-[#0C1F2E] border-2 border-slate-200 dark:border-[#1E3A4E] hover:border-[#0B7065] dark:hover:border-teal-500 rounded-2xl p-8 sm:p-10 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B7065]/15 to-[#0B7065]/5 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0B7065] dark:text-teal-400 flex items-center justify-center shadow-xs">
                    <ShieldCheck size={28} />
                  </div>
                  <span className="text-xs font-bold text-[#0B7065] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                    Residents & Families
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                  Resident Health Portal
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Look up your personal and family immunization records, check upcoming dose appointments, and generate verified digital vaccination certificates.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                  <div className="flex items-center gap-3 text-sm sm:text-[15px] font-medium text-slate-700 dark:text-slate-200">
                    <CheckCircle2 size={18} className="text-[#0B7065] dark:text-teal-400 shrink-0" />
                    <span>Instant access with Resident ID & Birthdate</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-[15px] font-medium text-slate-700 dark:text-slate-200">
                    <CheckCircle2 size={18} className="text-[#0B7065] dark:text-teal-400 shrink-0" />
                    <span>View upcoming vaccine schedules & reminders</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-[15px] font-medium text-slate-700 dark:text-slate-200">
                    <CheckCircle2 size={18} className="text-[#0B7065] dark:text-teal-400 shrink-0" />
                    <span>Download certified Digital Vaccination Cards</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:text-[15px] font-medium text-slate-700 dark:text-slate-200">
                    <CheckCircle2 size={18} className="text-[#0B7065] dark:text-teal-400 shrink-0" />
                    <span>Free community healthcare service for all</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/resident/login"
                  className="w-full bg-[#0B7065] hover:bg-[#085a52] text-white font-bold text-base py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg group-hover:scale-[1.01]"
                >
                  <span>Access Resident Health Portal</span>
                  <ArrowRight size={18} />
                </Link>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Barangay Health Personnel or Staff? Access the{" "}
                  <Link to="/staff/login" className="underline hover:text-[#0B7065] dark:hover:text-teal-300 font-semibold">
                    Medical Portal
                  </Link>{" "}
                  via the top navigation bar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Impact & Key Statistics Section (Clean, Elevated & Solid) ─── */}
      <section className="py-10 bg-[#F4F7FA] dark:bg-[#07131D] border-b border-slate-200 dark:border-[#163247]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#0A1E2F] rounded-2xl border border-slate-200 dark:border-[#163247] p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="pt-2 lg:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">10 Puroks</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">Community Coverage</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barangay-wide outreach</p>
              </div>

              <div className="pt-2 lg:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#0B7065] dark:text-[#2DD4BF] font-mono">95%+</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">Target Protection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Community herd immunity</p>
              </div>

              <div className="pt-2 lg:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">100% Free</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">Government Subsidized</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">DOH allocated vaccines</p>
              </div>

              <div className="pt-2 lg:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">Instant QR</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">Digital Certificate</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Official verified credentials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Available Vaccines Section (Cohesive Professional Healthcare Cards) ─── */}
      <section id="vaccines" className="py-16 md:py-24 bg-white dark:bg-[#0A1E2F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs sm:text-sm font-bold text-[#0B7065] dark:text-teal-400 uppercase tracking-wider">
              Immunization Formulary
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Vaccines Available at the Health Center
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              All vaccines stored strictly within monitored cold-chain storage (2°C – 8°C) and administered by licensed healthcare professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map((vax, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl p-6 hover:border-[#0B7065] dark:hover:border-teal-500 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="text-xs font-bold text-[#0B7065] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 px-2.5 py-1 rounded-md">
                      ● {vax.stock}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {vax.doses}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {vax.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#0B7065] dark:text-teal-400 mb-2.5">
                    {vax.type}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {vax.description}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Target Group:</span>
                    <span>{vax.target}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Clinic Schedule:</span>
                    <span className="text-[#0B7065] dark:text-teal-400 font-bold">{vax.availableDays}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-slate-50 dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl p-5 text-center max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-left text-slate-700 dark:text-slate-300 font-medium">
              <AlertCircle size={18} className="text-[#0B7065] dark:text-teal-400 shrink-0" />
              <span>Seeking a specific vaccine not listed above? Contact the health center for allocation updates.</span>
            </div>
            <a
              href="#contact"
              className="text-xs sm:text-sm font-bold text-[#0B7065] dark:text-teal-400 hover:underline whitespace-nowrap flex items-center gap-1"
            >
              Inquire <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Clinic Operating Hours & Schedule ─── */}
      <section id="schedule" className="py-16 md:py-24 bg-[#F8FAFC] dark:bg-[#07131D] border-y border-slate-200 dark:border-[#163247]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left info column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#0B7065] dark:text-teal-400 uppercase tracking-wider">
                  Operating Timetable
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
                  Clinic Schedule
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                  We accommodate scheduled appointments and walk-in barangay residents. Pediatric immunizations are grouped on specific days to ensure opened multi-dose vials maintain efficacy.
                </p>
              </div>

              {/* Health Station Information Card */}
              <div className="bg-white dark:bg-[#0A1E2F] border border-slate-200 dark:border-[#163247] rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} className="text-[#0B7065] dark:text-teal-400" />
                  Health Station Information
                </h3>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-3">
                    <MapPin size={15} className="text-slate-500 shrink-0" />
                    <span>Barangay Hall Complex, National Road, Purok 3</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone size={15} className="text-slate-500 shrink-0" />
                    <span>Hotline: (02) 8123-4567 / 0917-123-4567</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail size={15} className="text-slate-500 shrink-0" />
                    <span>vaxcare.health@barangay.gov.ph</span>
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Emergency Hotline:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">Dial 911 / 161</span>
                </div>
              </div>
            </div>

            {/* Right schedule cards */}
            <div className="lg:col-span-7 space-y-4">
              {clinicHours.map((slot, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A1E2F] border border-slate-200 dark:border-[#163247] rounded-2xl p-5 hover:border-[#0B7065] dark:hover:border-teal-500 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0B7065] dark:bg-[#2DD4BF]" />
                      {slot.title}
                    </h3>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md w-fit">
                      {slot.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                      <Calendar size={14} className="text-[#0B7065] dark:text-teal-400" /> {slot.days}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#0B7065] dark:text-teal-400 font-mono font-bold">
                      <Clock size={14} /> {slot.hours}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {slot.scope}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Resident Step-by-Step Guide ─── */}
      <section id="guide" className="py-16 md:py-24 bg-white dark:bg-[#0A1E2F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs sm:text-sm font-bold text-[#0B7065] dark:text-teal-400 uppercase tracking-wider">
              Process Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              How to Get Vaccinated at VaxCare
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              Follow these simple steps from registration to receiving your verified digital certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F8FAFC] dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl p-6 shadow-2xs">
              <span className="font-mono text-xs font-extrabold text-[#0B7065] dark:text-teal-400 block mb-2 tracking-wider">STEP 01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Look Up or Register</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Check if you already have a Resident ID in our system, or register with your Purok Health Leader with a valid ID.
              </p>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl p-6 shadow-2xs">
              <span className="font-mono text-xs font-extrabold text-[#0B7065] dark:text-teal-400 block mb-2 tracking-wider">STEP 02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Check Schedule</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Sign into the Resident Portal to see your next due date or drop by during regular walk-in clinic hours.
              </p>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl p-6 shadow-2xs">
              <span className="font-mono text-xs font-extrabold text-[#0B7065] dark:text-teal-400 block mb-2 tracking-wider">STEP 03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Safe Administration</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Undergo pre-vaccination screening by our Registered Nurse, receive your shot, and rest in our observation area for 15 minutes.
              </p>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl p-6 shadow-2xs">
              <span className="font-mono text-xs font-extrabold text-[#0B7065] dark:text-teal-400 block mb-2 tracking-wider">STEP 04</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Digital Certificate</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your vaccination is uploaded instantly. Access the Resident Portal anytime to download your verified certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions (FAQ) ─── */}
      <section id="faq" className="py-16 md:py-24 bg-[#F8FAFC] dark:bg-[#07131D] border-y border-slate-200 dark:border-[#163247]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs sm:text-sm font-bold text-[#0B7065] dark:text-teal-400 uppercase tracking-wider">
              Help Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              Everything you need to know about barangay vaccination services and digital records.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A1E2F] border border-slate-200 dark:border-[#163247] rounded-2xl overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp size={18} className="text-[#0B7065] dark:text-teal-400" /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Contact Banner ─── */}
      <section id="contact" className="py-16 bg-white dark:bg-[#0A1E2F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0B7065] to-[#0D877A] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Need Help with Your Vaccination Record?
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                Our barangay healthcare team is available to assist you with registration, immunization scheduling, and digital certificates. Visit us in person or reach out via our official lines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 shrink-0">
              <Link
                to="/resident/login"
                className="bg-white text-[#0B7065] hover:bg-slate-50 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Resident Sign-In
              </Link>
              <Link
                to="/staff/login"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-colors"
              >
                Healthcare Staff Sign-In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white dark:bg-[#07131D] border-t border-slate-200 dark:border-[#163247] pt-12 pb-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B7065] flex items-center justify-center text-white">
                  <Syringe size={16} />
                </div>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">VaxCare</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Barangay Vaccination & Health Center Management System. Serving our community with accessible and digitized health records.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">Portals</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/resident/login" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Resident Health Portal</Link></li>
                <li><Link to="/staff/login" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Staff & Administration</Link></li>
                <li><a href="#vaccines" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Available Vaccine Stock</a></li>
                <li><a href="#schedule" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Clinic Timetable</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">Information</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#guide" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">How to Get Vaccinated</a></li>
                <li><a href="#faq" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Frequently Asked Questions</a></li>
                <li><span>Purok 1 to Purok 10 Stations</span></li>
                <li><span>Department of Health (DOH) EPI</span></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">Health Center Desk</p>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <p>Barangay Health Center Building</p>
                <p>Municipal Complex, Purok 3</p>
                <p className="font-mono text-[#0B7065] dark:text-teal-400 font-bold mt-2">Hotline: (02) 8123-4567</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mon–Fri: 8:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© {new Date().getFullYear()} VaxCare · Barangay Health Center. Compliant with the Philippine Data Privacy Act of 2012.</p>
            <div className="flex items-center gap-4">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>·</span>
              <a href="#top" className="hover:text-[#0B7065] dark:hover:text-teal-400">Back to Top ↑</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
