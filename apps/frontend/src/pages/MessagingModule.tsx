import React, { useState, useMemo, useEffect } from "react";
import {
  MessageSquare, Send, Phone, User, Users, Calendar, AlertCircle,
  CheckCircle2, Clock, Sparkles, Filter, Search, RotateCcw, Copy,
  Check, Smartphone, Bell, Shield, ArrowRight, ExternalLink
} from "lucide-react";
import { Resident, ScheduleItem, AuthUser, SmsMessage } from "../lib/types";

interface MessagingModuleProps {
  residents: Resident[];
  schedules: ScheduleItem[];
  currentUser: AuthUser;
}

const INITIAL_SENT_MESSAGES: SmsMessage[] = [
  {
    id: "SMS-101",
    recipientPhone: "09171234567",
    recipientName: "Maria Santos",
    residentId: "R001",
    message: "Good day Maria! Reminder from Barangay Health Station: Your Influenza annual booster is available this Friday, 8:00 AM - 12:00 PM. Please bring your ID.",
    category: "reminder",
    sentBy: "Dr. Pedro Cruz",
    sentAt: "Today, 09:15 AM",
    status: "Delivered",
    purok: "Purok 1"
  },
  {
    id: "SMS-102",
    recipientPhone: "09282345678",
    recipientName: "Jose dela Cruz",
    residentId: "R002",
    message: "Hello Jose, Barangay Health Notice: Your 2nd dose of COVID-19 Bivalent is scheduled for July 22, 2025. Walk in at Health Station Purok 3. Thank you!",
    category: "reminder",
    sentBy: "RN Ana Reyes",
    sentAt: "Today, 10:30 AM",
    status: "Delivered",
    purok: "Purok 2"
  },
  {
    id: "SMS-103",
    recipientPhone: "09615678901",
    recipientName: "Luisa Torres",
    residentId: "R005",
    message: "Barangay Health Follow-up: Our records show you missed your scheduled vaccination dose on July 10. Please visit the clinic between 8AM-5PM for catch-up.",
    category: "followup",
    sentBy: "RN Luz Garcia",
    sentAt: "Yesterday, 02:45 PM",
    status: "Delivered",
    purok: "Purok 2"
  },
  {
    id: "SMS-104",
    recipientPhone: "09393456789",
    recipientName: "Ana Reyes",
    residentId: "R003",
    message: "Barangay Health Advisory: Free HPV cervical cancer defense series for adolescents available every Wednesday morning. Free of charge.",
    category: "broadcast",
    sentBy: "Dr. Pedro Cruz",
    sentAt: "Nov 10, 11:00 AM",
    status: "Delivered",
    purok: "Purok 1"
  }
];

export function MessagingModule({ residents, schedules, currentUser }: MessagingModuleProps) {
  const [recipientMode, setRecipientMode] = useState<"individual" | "purok">("individual");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [selectedPurok, setSelectedPurok] = useState("Purok 1");
  const [messageText, setMessageText] = useState("");
  const [messageCategory, setMessageCategory] = useState<SmsMessage["category"]>("reminder");
  const [sentLog, setSentLog] = useState<SmsMessage[]>(INITIAL_SENT_MESSAGES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastSentTo, setLastSentTo] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Support prefilled phone and residentId from URL query parameters (e.g. from Residents table)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const phoneParam = params.get("phone");
      const residentIdParam = params.get("residentId");
      if (residentIdParam) {
        setSelectedResidentId(residentIdParam);
        const res = residents.find(r => r.id === residentIdParam);
        if (res && res.phone) {
          setPhoneNumber(res.phone);
        } else if (phoneParam) {
          setPhoneNumber(phoneParam);
        }
      } else if (phoneParam) {
        setPhoneNumber(phoneParam);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [residents]);

  // Selected resident details
  const selectedResident = useMemo(() => {
    return residents.find(r => r.id === selectedResidentId) || null;
  }, [residents, selectedResidentId]);

  // When resident selected, auto-fill their phone number
  const handleSelectResident = (resId: string) => {
    setSelectedResidentId(resId);
    if (!resId) return;
    const res = residents.find(r => r.id === resId);
    if (res && res.phone) {
      setPhoneNumber(res.phone);
    }
  };

  // Quick SMS Templates
  const applyTemplate = (type: "reminder" | "missed" | "drive" | "cert" | "pediatric") => {
    const residentName = selectedResident ? selectedResident.name : "Resident";
    const nextDue = selectedResident?.nextDue || "your scheduled date";
    const purok = selectedResident?.purok || selectedPurok || "your Purok";

    let template = "";
    if (type === "reminder") {
      template = `Good day ${residentName}! This is a reminder from Barangay Health Center for your scheduled vaccination on ${nextDue}. Please bring your valid ID or baby book. Thank you!`;
      setMessageCategory("reminder");
    } else if (type === "missed") {
      template = `Hello ${residentName}, our records indicate you missed your scheduled vaccination dose on ${nextDue}. Please visit the Barangay Health Station between 8:00 AM - 5:00 PM for your catch-up dose.`;
      setMessageCategory("followup");
    } else if (type === "drive") {
      template = `📢 Barangay Health Advisory: Free COVID-19 booster and flu vaccination drive for ${purok} residents this Friday at the Health Center. Walk-ins welcome!`;
      setMessageCategory("broadcast");
    } else if (type === "cert") {
      template = `Hello ${residentName}, your official Digital Vaccination Certificate is verified and available for download on the VaxCare Resident Portal with your ID ${selectedResident?.id || ""}.`;
      setMessageCategory("certificate");
    } else if (type === "pediatric") {
      template = `Barangay Health Reminder: Well-baby clinic and routine infant immunizations (BCG, Polio, MMR) are held every Wednesday & Friday, 8:30 AM - 3:30 PM.`;
      setMessageCategory("general");
    }

    setMessageText(template);
  };

  // Send SMS Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (recipientMode === "individual" && !phoneNumber.trim()) {
      alert("Please enter a valid recipient phone number.");
      return;
    }

    const timestamp = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

    if (recipientMode === "individual") {
      const newMsg: SmsMessage = {
        id: `SMS-${Date.now().toString().slice(-4)}`,
        recipientPhone: phoneNumber.trim(),
        recipientName: selectedResident ? selectedResident.name : "Direct Contact",
        residentId: selectedResident ? selectedResident.id : undefined,
        message: messageText.trim(),
        category: messageCategory,
        sentBy: currentUser.displayName || currentUser.username,
        sentAt: `Today, ${timestamp}`,
        status: "Delivered",
        purok: selectedResident?.purok,
      };

      setSentLog([newMsg, ...sentLog]);
      setLastSentTo(phoneNumber.trim());
    } else {
      // Purok Broadcast
      const residentsInPurok = residents.filter(r => r.purok === selectedPurok);
      const newMsg: SmsMessage = {
        id: `BC-${Date.now().toString().slice(-4)}`,
        recipientPhone: `${residentsInPurok.length} Residents`,
        recipientName: `Broadcast: ${selectedPurok}`,
        message: messageText.trim(),
        category: "broadcast",
        sentBy: currentUser.displayName || currentUser.username,
        sentAt: `Today, ${timestamp}`,
        status: "Delivered",
        purok: selectedPurok,
      };

      setSentLog([newMsg, ...sentLog]);
      setLastSentTo(`${selectedPurok} (${residentsInPurok.length} recipients)`);
    }

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);

    // Reset fields
    setMessageText("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered log
  const filteredLog = useMemo(() => {
    return sentLog.filter(m => {
      const matchesSearch =
        m.recipientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.recipientName && m.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterCategory === "all" || m.category === filterCategory;

      return matchesSearch && matchesFilter;
    });
  }, [sentLog, searchTerm, filterCategory]);

  // Character calculations
  const charCount = messageText.length;
  const smsUnits = Math.max(1, Math.ceil(charCount / 160));

  // Native phone sms link
  const nativeSmsUrl = `sms:${phoneNumber.replace(/[^0-9+]/g, "")}?body=${encodeURIComponent(messageText)}`;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#0B7065]/10 text-[#0B7065]">
              <MessageSquare size={18} />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Resident SMS & Contact Dispatch Center</h2>
          </div>
          <p className="text-xs text-slate-500">
            Send SMS vaccination reminders, missed appointment notices, and health advisories directly to any mobile contact number.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Gateway Online
          </span>
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono text-[11px]">
            Sender: VAXCARE-BRGY
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Check size={14} />
            </div>
            <p className="text-xs font-semibold">
              SMS successfully dispatched to <span className="font-mono font-bold">{lastSentTo}</span> via Barangay Health Gateway.
            </p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-emerald-700 text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Two Column Main Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Compose & Dispatch Form (7 cols) ── */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          {/* Mode Switcher */}
          <div className="flex border-b border-slate-100 pb-4 justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Recipient Target</span>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRecipientMode("individual")}
                className={`px-3 py-1 rounded-md transition-colors ${recipientMode === "individual" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Single Number
              </button>
              <button
                type="button"
                onClick={() => setRecipientMode("purok")}
                className={`px-3 py-1 rounded-md transition-colors ${recipientMode === "purok" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Purok Broadcast
              </button>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4">
            {recipientMode === "individual" ? (
              <>
                {/* Resident Selection from Directory */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                    <span>Select from Resident Directory (Optional)</span>
                    <span className="text-[11px] text-slate-400 font-normal">{residents.length} residents on file</span>
                  </label>
                  <select
                    value={selectedResidentId}
                    onChange={e => handleSelectResident(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B7065] focus:border-[#0B7065]"
                  >
                    <option value="">-- Choose a registered resident or type number below --</option>
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.id}) · {r.phone} · {r.purok} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direct Phone Number Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                    <span>Contact Number (Mobile / SMS) *</span>
                    <span className="text-[11px] text-slate-400 font-normal">e.g. 09171234567 or +639171234567</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="0917-123-4567"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B7065] focus:border-[#0B7065]"
                    />
                  </div>

                  {selectedResident && (
                    <div className="mt-2 p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0B7065] text-white flex items-center justify-center font-bold text-[10px]">
                          {selectedResident.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{selectedResident.name}</p>
                          <p className="text-[10px] text-slate-500">{selectedResident.purok} · Status: {selectedResident.status}</p>
                        </div>
                      </div>
                      {selectedResident.nextDue && (
                        <span className="font-mono text-[10px] bg-white border border-teal-200 text-[#0B7065] px-2 py-0.5 rounded font-semibold">
                          Due: {selectedResident.nextDue}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Purok Broadcast Mode */
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Target Purok for Broadcast *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                    const purokLabel = `Purok ${num}`;
                    const count = residents.filter(r => r.purok === purokLabel).length;
                    const isSelected = selectedPurok === purokLabel;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedPurok(purokLabel)}
                        className={`p-2.5 rounded-lg border text-left transition-colors ${isSelected ? "bg-[#0B7065] text-white border-[#0B7065]" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                      >
                        <p className="font-bold text-xs">{purokLabel}</p>
                        <p className={`text-[10px] ${isSelected ? "text-white/80" : "text-slate-400"}`}>{count} residents</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Dispatching broadcast alert to all registered mobile numbers residing in <strong>{selectedPurok}</strong>.
                </p>
              </div>
            )}

            {/* Quick Templates Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Sparkles size={13} className="text-[#0B7065]" /> 1-Click Healthcare SMS Templates:
                </span>
                <span className="text-[10px] text-slate-400">Click to fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate("reminder")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  💉 Vaccine Reminder
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("missed")}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  ⚠️ Missed Dose Notice
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("drive")}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-100 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  📢 Community Drive
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("cert")}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  📋 Certificate Ready
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("pediatric")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  👶 Pediatric Clinic
                </button>
              </div>
            </div>

            {/* Message Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Message Content (SMS Body) *
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {charCount} / 160 chars ({smsUnits} SMS {smsUnits > 1 ? "segments" : "unit"})
                </span>
              </div>
              <textarea
                rows={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your official healthcare message or select a template above..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B7065] focus:border-[#0B7065] leading-relaxed resize-y"
              />
            </div>

            {/* Sender Identification info */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-[#0B7065]" />
                Dispatching as: <strong className="text-slate-800">{currentUser.displayName} ({currentUser.title})</strong>
              </span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Standard GSM-7</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={!messageText.trim() || (recipientMode === "individual" && !phoneNumber.trim())}
                className="w-full sm:flex-1 bg-[#0B7065] hover:bg-[#095c53] text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
              >
                <Send size={14} />
                <span>
                  {recipientMode === "individual" ? "Send SMS to Contact Number" : `Broadcast to ${selectedPurok}`}
                </span>
              </button>

              {/* Native device SMS launcher */}
              {phoneNumber && messageText && (
                <a
                  href={nativeSmsUrl}
                  title="Open in your device's native SMS application"
                  className="w-full sm:w-auto border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Smartphone size={14} />
                  <span>Open in Mobile SMS</span>
                  <ExternalLink size={11} className="text-slate-400" />
                </a>
              )}
            </div>
          </form>
        </div>

        {/* ── Right Column: Phone Mockup & Live Outbox (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mobile SMS Mockup Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Smartphone size={15} className="text-[#0B7065]" />
                Resident Phone Preview
              </span>
              <span className="text-[10px] font-normal text-slate-400">Live Simulation</span>
            </div>

            {/* Smartphone Graphic Mockup */}
            <div className="mx-auto max-w-[280px] bg-slate-900 rounded-[28px] p-3 shadow-md border-4 border-slate-800">
              {/* Screen Top Speaker & Camera */}
              <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-950" />
              </div>

              {/* Screen Content */}
              <div className="bg-[#EFEAE2] rounded-2xl p-3 min-h-[220px] flex flex-col justify-between text-slate-900 text-xs">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xs rounded-lg p-2 flex items-center gap-2 shadow-2xs border border-black/5">
                  <div className="w-7 h-7 rounded-full bg-[#0B7065] text-white flex items-center justify-center font-bold text-[10px]">
                    V
                  </div>
                  <div className="leading-tight">
                    <p className="font-bold text-[11px] text-slate-900">VAXCARE-BRGY</p>
                    <p className="text-[9px] text-slate-500">Official Health Center SMS</p>
                  </div>
                </div>

                {/* SMS Bubble */}
                <div className="my-auto py-2">
                  <div className="bg-white rounded-xl p-3 shadow-xs border border-black/5 max-w-[90%] space-y-1">
                    <p className="text-[11px] text-slate-800 leading-relaxed break-words">
                      {messageText.trim() ? (
                        messageText
                      ) : (
                        <span className="italic text-slate-400">
                          Type a message or select a template on the left to preview how it looks on the resident's phone...
                        </span>
                      )}
                    </p>
                    <div className="flex justify-end items-center gap-1 text-[9px] text-slate-400 pt-1">
                      <span>{new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</span>
                      <CheckCircle2 size={10} className="text-[#0B7065]" />
                    </div>
                  </div>
                </div>

                {/* Screen Bottom Bar */}
                <div className="text-center text-[9px] text-slate-400 pt-1">
                  Recipient: {phoneNumber || "09XXXXXXXXX"}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sent Messages Log / Outbox ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#0B7065]" />
                Recent SMS Outbox ({sentLog.length})
              </h3>
            </div>

            {/* Filter and Search */}
            <div className="flex gap-2 text-xs">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search recipient or text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B7065]"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700"
              >
                <option value="all">All</option>
                <option value="reminder">Reminders</option>
                <option value="followup">Follow-ups</option>
                <option value="broadcast">Broadcasts</option>
              </select>
            </div>

            {/* Message Cards List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {filteredLog.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">No sent messages match your filter.</p>
              ) : (
                filteredLog.map(m => (
                  <div key={m.id} className="pt-2 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{m.recipientName || "Direct"}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{m.sentAt}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-[#0B7065] text-[10px] font-semibold">{m.recipientPhone}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                        <Check size={10} /> Delivered
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                      {m.message}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                      <span>By: {m.sentBy}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(m.message, m.id)}
                        className="text-[#0B7065] hover:underline flex items-center gap-1"
                      >
                        {copiedId === m.id ? <Check size={11} /> : <Copy size={11} />}
                        {copiedId === m.id ? "Copied" : "Copy text"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
