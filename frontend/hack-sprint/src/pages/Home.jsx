import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Users,
  Calendar,
  Trophy,
  Search,
  UploadCloud,
  Gavel,
  ShieldCheck,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useHackathons } from "../hooks/useHackathons";
import "./Styles/Home.css";

const useScrollReveal = (selector = ".hm-fade", threshold = 0.12) => {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("hm-visible");
        }),
      { threshold }
    );
    document.querySelectorAll(selector).forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [selector, threshold]);
};

/* ─────────────────────────────────────────────────────────────────────────
   Mini "product window" mockups paired with each audience section — same
   window-chrome language used across the app's admin/student pages.
───────────────────────────────────────────────────────────────────────── */
const WindowFrame = ({ title, children }) => (
  <div className="hm-card relative rounded-[6px] border border-[rgba(95,255,96,0.15)] bg-[rgba(8,10,8,0.95)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(95,255,96,0.08)] bg-[rgba(95,255,96,0.02)]">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,100,100,0.5)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,184,77,0.5)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[rgba(95,255,96,0.5)]" />
      </div>
      <span className="font-jb text-[0.6rem] text-[rgba(180,220,180,0.4)] tracking-[0.04em]">
        {title}
      </span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const StudentMockup = () => (
  <WindowFrame title="student / browse">
    <div className="flex flex-col gap-3">
      {[
        { name: "HackSprint AI Challenge", tag: "Live", color: "#5fff60", prize: "₹1,00,000" },
        { name: "CampusCode Sprint", tag: "Upcoming", color: "#60c8ff", prize: "Registration open" },
      ].map((h, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] px-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-syne font-extrabold text-white text-[0.8rem] truncate">{h.name}</p>
            <p className="font-jb text-[0.6rem] mt-0.5" style={{ color: h.color }}>
              {h.tag}
            </p>
          </div>
          <span className="font-jb text-[0.62rem] text-[rgba(255,184,77,0.75)] flex-shrink-0">{h.prize}</span>
        </div>
      ))}
      <div className="flex items-center gap-3 bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] px-4 py-3">
        <Users size={13} className="text-[#5fff60] flex-shrink-0" />
        <div className="flex-1 h-1.5 rounded-full bg-[rgba(95,255,96,0.08)] overflow-hidden">
          <div className="h-full w-3/4 bg-[#5fff60] rounded-full" />
        </div>
        <span className="font-jb text-[0.58rem] text-[rgba(180,220,180,0.45)] flex-shrink-0">3/4 team</span>
      </div>
    </div>
  </WindowFrame>
);

const OrganizerMockup = () => (
  <WindowFrame title="organizer / overview">
    <div className="grid grid-cols-3 gap-2.5 mb-3">
      {[
        { label: "Registered", value: "248" },
        { label: "Teams", value: "62" },
        { label: "Submitted", value: "41" },
      ].map((s, i) => (
        <div key={i} className="bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] p-3 text-center">
          <div className="font-syne font-extrabold text-white text-base">{s.value}</div>
          <div className="font-jb text-[0.5rem] tracking-[0.08em] uppercase text-[rgba(180,220,180,0.4)] mt-1">
            {s.label}
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-center gap-2 bg-[rgba(95,255,96,0.03)] border border-[rgba(95,255,96,0.1)] rounded-[3px] px-4 py-3">
      <ShieldCheck size={13} className="text-[#5fff60] flex-shrink-0" />
      <span className="font-jb text-[0.62rem] text-[rgba(180,220,180,0.55)]">Approved · Registration open</span>
    </div>
  </WindowFrame>
);

/* ─────────────────────────────────────────────────────────────────────────
   Audience section — text one side, mockup the other, alternating.
───────────────────────────────────────────────────────────────────────── */
const AudienceSection = ({ eyebrow, title, accent, desc, points, cta, onCta, mockup, reverse }) => (
  <section className="hm-fade relative z-10 py-24 px-5">
    <div
      className={`max-w-[1100px] mx-auto flex flex-col ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      } items-center gap-12 lg:gap-16`}
    >
      <div className="flex-1 w-full">
        <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-1 rounded-[2px] mb-5">
          {eyebrow}
        </div>
        <h2
          className="font-syne font-extrabold text-white tracking-tight leading-none mb-4"
          style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}
        >
          {title} <span style={{ color: accent }}>{"→"}</span>
        </h2>
        <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.5)] leading-relaxed max-w-md mb-7">
          {desc}
        </p>
        <div className="flex flex-col gap-3 mb-8">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <Icon size={14} style={{ color: accent }} className="flex-shrink-0" />
                <span className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.6)]">{p.label}</span>
              </div>
            );
          })}
        </div>
        <button
          onClick={onCta}
          className="font-jb inline-flex items-center gap-[0.5rem] text-[0.68rem] tracking-[0.12em] uppercase px-7 py-[0.8rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_24px_rgba(95,255,96,0.3)]"
        >
          {cta} <ArrowRight size={13} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-[440px]">{mockup}</div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────
   Real hackathons proof — no fabricated testimonials, just real listings.
───────────────────────────────────────────────────────────────────────── */
const FeaturedHackathons = () => {
  const { data } = useHackathons();
  const items = [...(data?.active || []), ...(data?.upcoming || [])].slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="hm-fade relative z-10 py-24 px-5 border-t border-[rgba(95,255,96,0.08)]">
      <div className="max-w-[820px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-syne font-extrabold text-white tracking-tight text-2xl sm:text-3xl">
            Happening now
          </h2>
          <Link
            to="/hackathons"
            className="font-jb text-[0.65rem] tracking-[0.08em] uppercase text-[rgba(95,255,96,0.55)] hover:text-[#5fff60] transition-colors inline-flex items-center gap-1.5"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="flex flex-col">
          {items.map((h, i) => (
            <Link
              key={h._id || h.slug}
              to={`/hackathon/${h.slug}`}
              className={`group flex items-center justify-between gap-6 py-5 border-b border-[rgba(95,255,96,0.08)] hover:border-[rgba(95,255,96,0.2)] transition-colors ${
                i === 0 ? "border-t border-[rgba(95,255,96,0.08)]" : ""
              }`}
            >
              <div className="min-w-0">
                <h3 className="font-syne font-bold text-white text-[0.95rem] sm:text-base tracking-tight truncate group-hover:text-[#5fff60] transition-colors">
                  {h.title}
                </h3>
                <p className="font-jb text-[0.62rem] text-[rgba(180,220,180,0.4)] mt-1 tracking-[0.02em]">
                  {h.lifecycleStatus === "ACTIVE" ? "Live now" : "Upcoming"}
                  {h.formattedDate ? ` · ${h.formattedDate}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {h.totalPrize > 0 && (
                  <span className="font-jb text-[0.68rem] text-[rgba(180,220,180,0.5)] hidden sm:inline">
                    ₹{h.totalPrize.toLocaleString("en-IN")}
                  </span>
                )}
                <ArrowRight
                  size={14}
                  className="text-[rgba(95,255,96,0.35)] group-hover:text-[#5fff60] group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState("none");

  useEffect(() => {
    const s = localStorage.getItem("token");
    const a = localStorage.getItem("adminToken");
    setUserType(s ? "student" : a ? "admin" : "none");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    if (verified === "success") {
      toast.success("Email verified successfully! You can now log in.");
      navigate("/account/login", { replace: true });
    } else if (verified === "failed") {
      toast.error(
        "Verification link invalid or expired. Please sign up again or request a new link."
      );
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  useScrollReveal(".hm-fade");

  return (
    <div className="hm-root overflow-hidden">
      <div className="hm-bg" />

      {/* ── Hero — dual-audience split ── */}
      <section className="relative z-10 min-h-[calc(100vh-56px)] flex flex-col items-center justify-center py-20 text-center overflow-hidden px-5">
        <div className="hm-ring w-[600px] h-[600px]" />

        <div className="relative z-10 max-w-[760px] mx-auto">
          <h1
            className="hm-a2 font-syne font-extrabold leading-[0.95] tracking-[-0.04em] text-white mb-5
  text-[2.4rem] sm:text-5xl md:text-6xl xl:text-7xl"
          >
            Where Hackathons <br />
            <span className="text-[#5fff60]">Actually Happen</span>
          </h1>

          <p className="hm-a3 font-jb text-[0.75rem] sm:text-[0.85rem] text-[rgba(180,220,180,0.5)] leading-relaxed max-w-[460px] mx-auto mb-10 tracking-[0.01em]">
            One platform to organize, run, and compete in hackathons — from
            registration to the final leaderboard.
          </p>

          <div className="hm-a5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() =>
                navigate(userType === "student" ? "/dashboard" : "/studenthome")
              }
              className="font-jb inline-flex items-center gap-[0.5rem] text-[0.68rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_28px_rgba(95,255,96,0.35)]"
            >
              I'm a Student <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/adminhome")}
              className="font-jb inline-flex items-center gap-[0.5rem] text-[0.68rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-150 bg-transparent border-[rgba(95,255,96,0.22)] text-[rgba(95,255,96,0.65)] hover:border-[rgba(95,255,96,0.45)] hover:text-[#5fff60]"
            >
              I'm an Organizer <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="hm-pulse mt-14 flex flex-col items-center gap-[0.4rem]">
          <div className="w-px h-8 bg-gradient-to-b from-[rgba(95,255,96,0.5)] to-transparent" />
        </div>
      </section>

      <AudienceSection
        eyebrow="For Students"
        title="Find it. Build it. Get ranked."
        accent="#5fff60"
        desc="Browse live and upcoming hackathons, team up with an invite code, and submit your project — all from one place."
        points={[
          { icon: Search, label: "Filter hackathons by category, difficulty, and prize" },
          { icon: Users, label: "Create or join a team with a simple invite code" },
          { icon: UploadCloud, label: "Submit code, docs, and demos before the deadline" },
        ]}
        cta="Browse Hackathons"
        onCta={() => navigate("/hackathons")}
        mockup={<StudentMockup />}
      />

      <AudienceSection
        eyebrow="For Organizers"
        title="Run the whole event, start to finish."
        accent="#60c8ff"
        desc="Configure phases, open registration, assign judges, and publish results — without stitching together forms and spreadsheets."
        points={[
          { icon: ClipboardList, label: "Custom registration & submission forms per phase" },
          { icon: Gavel, label: "Judge scoring blended with community voting" },
          { icon: BarChart3, label: "A live dashboard of registrations, teams, and submissions" },
        ]}
        cta="Host a Hackathon"
        onCta={() => navigate("/adminhome")}
        mockup={<OrganizerMockup />}
        reverse
      />

      <FeaturedHackathons />

      {/* ── Closing ── */}
      <section className="hm-fade relative z-10 py-24 px-5 border-t border-[rgba(95,255,96,0.08)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-syne font-extrabold text-white tracking-tight leading-tight text-2xl sm:text-3xl mb-6">
            Ready when you are.
          </h2>
          <button
            onClick={() =>
              navigate(userType === "student" ? "/studenthome" : "/account/login")
            }
            className="font-jb inline-flex items-center gap-[0.5rem] text-[0.7rem] tracking-[0.12em] uppercase px-8 py-[0.85rem] rounded-[3px] border cursor-pointer transition-all duration-200 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_28px_rgba(95,255,96,0.35)]"
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
