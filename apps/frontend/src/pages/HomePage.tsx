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
      answer: "If you missed an appointment, don't worry—you do not have to restart your series! Simply walk in during regular clinic hours (Monday to Friday, 8:00 AM – 5:00 PM) or check the schedule on the Resident Portal for upcoming catch-up immunization sessions."
    },
    {
      question: "How does VaxCare protect my personal medical data?",
      answer: "VaxCare strictly adheres to the Philippine Data Privacy Act of 2012 (RA 10173). Personal health records are encrypted and accessible only by authorized barangay healthcare officers, nurses, and the resident themselves through secure portal credentials."
    }
  ];

  const clinicHours = [
    {
      title: "General Vaccination & Consultations",
      days: "Monday – Friday",
      hours: "8:00 AM – 5:00 PM",
      scope: "Adult booster vaccines, pre-vaccine health screenings, and general inquiries.",
      status: "Regular Clinic Hours"
    },
    {
      title: "Well-Baby & Pediatric Immunization",
      days: "Wednesday & Friday",
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
      {/* ─── Top Advisory Bar (Clean & Professional) ─── */}
      <div className="bg-[#0B7065] dark:bg-[#084E47] text-white text-xs py-2 px-4 border-b border-[#085a52]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
              Advisory
            </span>
            <span className="text-white/90">
              Free Infant Immunization & Senior Flu Vaccination every Wednesday & Friday at the Health Center. Walk-ins welcome.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/80">
            <span className="flex items-center gap-1.5"><Phone size={12} /> (02) 8123-4567</span>
            <span className="hidden md:flex items-center gap-1.5"><Clock size={12} /> Mon–Fri: 8:00 AM – 5:00 PM</span>
          </div>
        </div>
      </div>

      {/* ─── Main Navigation Header ─── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0A1E2F]/95 backdrop-blur-sm border-b border-slate-200 dark:border-[#163247] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0B7065] flex items-center justify-center text-white shadow-xs">
              <Syringe size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                VaxCare <span className="text-[10px] font-semibold bg-slate-100 dark:bg-[#112C3F] text-slate-600 dark:text-[#38BDF8] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#164E63]">v1.0</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-[#8FAEC5] font-medium -mt-0.5">Barangay Health Center</p>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#overview" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Overview</a>
            <a href="#portals" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Portals</a>
            <a href="#vaccines" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Available Vaccines</a>
            <a href="#schedule" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Clinic Schedule</a>
            <a href="#guide" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Resident Guide</a>
            <a href="#faq" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">FAQs</a>
            <a href="#contact" className="hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors">Contact</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(user.role === "resident" ? "/portal" : "/dashboard")}
                  className="bg-[#0B7065] hover:bg-[#095c53] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Activity size={13} />
                  {user.role === "resident" ? "My Health Portal" : "Staff Dashboard"}
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 px-2.5 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* Resident Access Button */}
                <Link
                  to="/resident/login"
                  className="bg-[#0B7065] hover:bg-[#095c53] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ShieldCheck size={14} />
                  <span>Resident Portal</span>
                </Link>

                {/* Staff Access Button */}
                <Link
                  to="/staff/login"
                  className="border border-slate-300 dark:border-[#1B364A] hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-[#0C1D2B] hover:bg-slate-50 dark:hover:bg-[#122A3C] text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Users size={13} className="text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Staff Access</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section (Minimalist & Professional) ─── */}
      <section id="overview" className="py-14 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Minimalist pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B7065]" />
              <span>Official Barangay Health Center Immunization System</span>
            </div>

            {/* Clean solid typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Protecting Our Barangay, <br />
              <span className="text-[#0B7065]">One Vaccine at a Time</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Safe, accessible, and digitized healthcare for every family. Check your personal vaccination schedule, review medical histories, and verify official immunization certificates with speed and ease.
            </p>
          </div>

          {/* ─── Portal Gateway Cards (Clean, Minimalist & Balanced) ─── */}
          <div id="portals" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Resident Card */}
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 md:p-7 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 text-[#0B7065] flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0B7065] bg-teal-50 px-2.5 py-0.5 rounded border border-teal-100">
                    Residents & Families
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1.5">
                  Resident Health Portal
                </h2>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Look up your personal and family immunization records, check upcoming dose appointments, and generate verified digital vaccination certificates.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#0B7065] shrink-0" />
                    <span>Instant access with Resident ID & Birthdate</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#0B7065] shrink-0" />
                    <span>View upcoming vaccine schedules and reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#0B7065] shrink-0" />
                    <span>Download certified Digital Vaccination Certificates</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/resident/login"
                className="w-full bg-[#0B7065] hover:bg-[#095c53] text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Access Resident Portal</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Staff Card */}
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 md:p-7 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                    <Stethoscope size={20} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    Health Workers & Admins
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1.5">
                  Staff & Medical Portal
                </h2>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Authorized workspace for Barangay Health Officers, Registered Nurses, and BHWs to manage resident registrations, doses, and cold-chain stocks.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0" />
                    <span>Resident health registration & medical history profiling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0" />
                    <span>Record vaccinations, batch numbers, & injection sites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-600 shrink-0" />
                    <span>Live vaccine inventory restock & DOH analytics reports</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/staff/login"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Staff & Admin Sign-In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Impact & Key Statistics Section (Clean Minimalist Dividers) ─── */}
      <section className="py-7 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="pt-3 lg:pt-0">
              <p className="text-2xl font-bold text-slate-900 font-mono">10 Puroks</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Community Coverage</p>
              <p className="text-[11px] text-slate-500">Barangay-wide outreach</p>
            </div>

            <div className="pt-3 lg:pt-0">
              <p className="text-2xl font-bold text-[#0B7065] font-mono">95%+</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Target Protection</p>
              <p className="text-[11px] text-slate-500">Community herd immunity</p>
            </div>

            <div className="pt-3 lg:pt-0">
              <p className="text-2xl font-bold text-slate-900 font-mono">100% Free</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Government Subsidized</p>
              <p className="text-[11px] text-slate-500">DOH allocated vaccines</p>
            </div>

            <div className="pt-3 lg:pt-0">
              <p className="text-2xl font-bold text-slate-900 font-mono">Instant QR</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Digital Certificate</p>
              <p className="text-[11px] text-slate-500">Official verified credentials</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Available Vaccines Section (Cohesive Professional Healthcare Cards) ─── */}
      <section id="vaccines" className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0B7065] uppercase tracking-wider">
              Immunization Formulary
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Vaccines Available at the Health Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              All vaccines stored strictly within monitored cold-chain storage (2°C – 8°C) and administered by licensed healthcare professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vaccines.map((vax, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-[#0B7065] bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded">
                      ● {vax.stock}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {vax.doses}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {vax.name}
                  </h3>
                  <p className="text-xs font-medium text-[#0B7065] mb-2">
                    {vax.type}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {vax.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold text-slate-700">Target Group:</span>
                    <span>{vax.target}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold text-slate-700">Clinic Schedule:</span>
                    <span className="text-[#0B7065] font-semibold">{vax.availableDays}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-left text-slate-700">
              <AlertCircle size={15} className="text-[#0B7065] shrink-0" />
              <span>Seeking a specific vaccine not listed above? Contact the health center for allocation updates.</span>
            </div>
            <a
              href="#contact"
              className="text-xs font-bold text-[#0B7065] hover:underline whitespace-nowrap flex items-center gap-1"
            >
              Inquire <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Clinic Operating Hours & Schedule ─── */}
      <section id="schedule" className="py-14 md:py-20 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left info column */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-bold text-[#0B7065] uppercase tracking-wider">
                  Operating Timetable
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Clinic Schedule
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  We accommodate scheduled appointments and walk-in barangay residents. Pediatric immunizations are grouped on specific days to ensure opened multi-dose vials maintain efficacy.
                </p>
              </div>

              {/* Health Station Information Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#0B7065]" />
                  Health Station Information
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2.5">
                    <MapPin size={13} className="text-slate-500 shrink-0" />
                    <span>Barangay Hall Complex, National Road, Purok 3</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone size={13} className="text-slate-500 shrink-0" />
                    <span>Hotline: (02) 8123-4567 / 0917-123-4567</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail size={13} className="text-slate-500 shrink-0" />
                    <span>vaxcare.health@barangay.gov.ph</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Emergency Hotline:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Dial 911 / 161</span>
                </div>
              </div>
            </div>

            {/* Right schedule cards */}
            <div className="lg:col-span-7 space-y-3">
              {clinicHours.map((slot, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0B7065]" />
                      {slot.title}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                      {slot.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <Calendar size={13} className="text-[#0B7065]" /> {slot.days}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#0B7065] font-mono">
                      <Clock size={13} /> {slot.hours}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {slot.scope}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Resident Step-by-Step Guide ─── */}
      <section id="guide" className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0B7065] uppercase tracking-wider">
              Process Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How to Get Vaccinated at VaxCare
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Follow these simple steps from registration to receiving your verified digital certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5">
              <span className="font-mono text-xs font-bold text-[#0B7065] block mb-2">STEP 01</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Look Up or Register</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check if you already have a Resident ID in our system, or register with your Purok Health Leader with a valid ID.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5">
              <span className="font-mono text-xs font-bold text-[#0B7065] block mb-2">STEP 02</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Check Schedule</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign into the Resident Portal to see your next due date or drop by during regular walk-in clinic hours.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5">
              <span className="font-mono text-xs font-bold text-[#0B7065] block mb-2">STEP 03</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Safe Administration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Undergo pre-vaccination screening by our Registered Nurse, receive your shot, and rest in our observation area for 15 minutes.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5">
              <span className="font-mono text-xs font-bold text-[#0B7065] block mb-2">STEP 04</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Digital Certificate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your vaccination is uploaded instantly. Access the Resident Portal anytime to download your verified certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions (FAQ) ─── */}
      <section id="faq" className="py-14 md:py-20 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#0B7065] uppercase tracking-wider">
              Help Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Everything you need to know about barangay vaccination services and digital records.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 hover:text-[#0B7065] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp size={16} className="text-[#0B7065]" /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-4.5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Contact Banner (Clean & Subdued) ─── */}
      <section id="contact" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B7065] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Need Help with Your Vaccination Record?
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Our barangay healthcare team is available to assist you with registration, immunization scheduling, and digital certificates. Visit us in person or reach out via our official lines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/resident/login"
                className="bg-white text-[#0B7065] hover:bg-slate-50 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                Resident Sign-In
              </Link>
              <Link
                to="/staff/login"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
              >
                Healthcare Staff Sign-In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Minimalist Footer ─── */}
      <footer className="bg-white border-t border-slate-200 pt-10 pb-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0B7065] flex items-center justify-center text-white">
                  <Syringe size={14} />
                </div>
                <span className="font-bold text-sm text-slate-900">VaxCare</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Barangay Vaccination & Health Center Management System. Serving our community with accessible and digitized health records.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">Portals</p>
              <ul className="space-y-1.5">
                <li><Link to="/resident/login" className="hover:text-[#0B7065] transition-colors">Resident Health Portal</Link></li>
                <li><Link to="/staff/login" className="hover:text-[#0B7065] transition-colors">Staff & Administration</Link></li>
                <li><a href="#vaccines" className="hover:text-[#0B7065] transition-colors">Available Vaccine Stock</a></li>
                <li><a href="#schedule" className="hover:text-[#0B7065] transition-colors">Clinic Timetable</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">Information</p>
              <ul className="space-y-1.5">
                <li><a href="#guide" className="hover:text-[#0B7065] transition-colors">How to Get Vaccinated</a></li>
                <li><a href="#faq" className="hover:text-[#0B7065] transition-colors">Frequently Asked Questions</a></li>
                <li><span>Purok 1 to Purok 10 Stations</span></li>
                <li><span>Department of Health (DOH) EPI</span></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">Health Center Desk</p>
              <div className="space-y-1 text-slate-600">
                <p>Barangay Health Center Building</p>
                <p>Municipal Complex, Purok 3</p>
                <p className="font-mono text-[#0B7065] font-semibold mt-1.5">Hotline: (02) 8123-4567</p>
                <p className="text-[11px] text-slate-500">Mon–Fri: 8:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px]">
            <p>© {new Date().getFullYear()} VaxCare · Barangay Health Center. Compliant with the Philippine Data Privacy Act of 2012.</p>
            <div className="flex items-center gap-3">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>·</span>
              <a href="#top" className="hover:text-[#0B7065]">Back to Top ↑</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
