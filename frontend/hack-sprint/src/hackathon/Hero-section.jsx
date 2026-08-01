import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, Trophy, Clock, ChevronRight } from "lucide-react";
import { ProfileAPI } from "../api/profile.api.js";
import { HackathonAPI } from "../api/hackathon.api.js";
import SubmissionForm from "./SubmissionForm";

const FontStyle = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
);

export const HeroSection = ({
  title,
  subTitle,
  isActive,
  participantCount = 0,
  prizes = [],
  imageUrl = "/assets/hackathon-banner.png",
  hackathonId,
  slug,
  phases = [],
  onSectionChange,
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamCode, setTeamCode] = useState("");
  const navigate = useNavigate();

  const registrationPhase = phases.find(
    (p) => p.phaseType === "REGISTRATION" && p.isActive
  );
  const submissionPhases = phases.filter((p) => p.phaseType === "SUBMISSION");
  const activeSubmissionPhase = submissionPhases.find((p) => {
    const now = new Date();
    return (
      p.isActive && now >= new Date(p.startDate) && now <= new Date(p.endDate)
    );
  });

  const isWithinRegistrationPeriod = () => {
    if (!registrationPhase) return false;
    const now = new Date();
    return (
      now >= new Date(registrationPhase.startDate) &&
      now <= new Date(registrationPhase.endDate)
    );
  };

  const isWithinSubmissionPeriod = () => !!activeSubmissionPhase;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);

    const load = async () => {
      setLoading(true);
      try {
        const profileRes = await ProfileAPI.getMyProfile();
        const myUserId = profileRes.data.profile._id;

        const statusRes = await HackathonAPI.getRegistrationStatus(hackathonId);
        const isRegistered = !!statusRes.data.isRegistered;
        setRegistered(isRegistered);

        if (!isRegistered) {
          setIsLeader(false);
          setIsTeamMember(false);
          return;
        }

        const regRes = await HackathonAPI.getMyRegistration(hackathonId);
        const teamId = regRes.data.registration?.team;

        if (!teamId) {
          setIsLeader(false);
          setIsTeamMember(false);
          return;
        }

        const teamRes = await HackathonAPI.getTeamById(teamId);
        const team = teamRes.data.team;

        const leaderId = team.leader?._id || team.leader;
        const amLeader = String(leaderId) === String(myUserId);
        setIsLeader(amLeader);

        const memberIds = (team.members || []).map((m) => String(m._id || m));
        setIsTeamMember(memberIds.includes(String(myUserId)));
        setTeamCode(team.secretCode || "");
      } catch (err) {
        setRegistered(false);
        setIsLeader(false);
        setIsTeamMember(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hackathonId]);

  const handleRegister = () => {
    navigate(`/hackathon/RegistrationForm/${slug}`);
  };

  const handleLeaderDashboard = () => {
    if (!teamCode) return;
    navigate(`/hackathon/${slug}/team/${teamCode}`);
  };

  const handleSubmit = () => {
    setShowSubmissionModal(true);
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "TBD";
    const s = new Date(start),
      e = new Date(end),
      opt = { month: "long", day: "numeric" };
    if (s.getFullYear() === e.getFullYear())
      return `${s.toLocaleDateString("en-US", opt)} – ${e.toLocaleDateString(
        "en-US",
        { ...opt, year: "numeric" }
      )}`;
    return `${s.toLocaleDateString("en-US", {
      ...opt,
      year: "numeric",
    })} – ${e.toLocaleDateString("en-US", { ...opt, year: "numeric" })}`;
  };

  const getDaysRemaining = () => {
    if (!activeSubmissionPhase) return 0;
    const diff = new Date(activeSubmissionPhase.endDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const actionCls = [
    "font-[family-name:'JetBrains_Mono',monospace]",
    "inline-flex items-center justify-center gap-2",
    "text-xs tracking-[0.1em] uppercase",
    "px-5 py-2.5 rounded-[3px] border cursor-pointer",
    "transition-all duration-150",
    "w-full sm:w-auto",
  ].join(" ");

  const renderActionButton = () => {
    if (loading) return null;

    if (!isAuthenticated)
      return (
        <Link to="/account/login">
          <button
            className={`${actionCls} bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.25)] text-[rgba(95,255,96,0.55)] hover:bg-[rgba(95,255,96,0.14)]`}
          >
            Login
          </button>
        </Link>
      );

    if (!isActive) return null;

    if (!registered) {
      if (isWithinRegistrationPeriod())
        return (
          <button
            onClick={handleRegister}
            className={`${actionCls} bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]`}
          >
            Register Now <ChevronRight size={14} />
          </button>
        );
      return (
        <button
          disabled
          className={`${actionCls} bg-[rgba(95,255,96,0.04)] border-[rgba(95,255,96,0.1)] text-[rgba(95,255,96,0.28)] cursor-not-allowed`}
        >
          Registration Closed
        </button>
      );
    }

    if (isTeamMember && !isLeader)
      return (
        <button
          disabled
          className={`${actionCls} bg-[rgba(95,255,96,0.04)] border-[rgba(95,255,96,0.1)] text-[rgba(95,255,96,0.28)] cursor-not-allowed`}
        >
          Submit (Leader Only)
        </button>
      );

    return (
      <div className="relative group inline-block">
        <button
          onClick={handleSubmit}
          disabled={!isWithinSubmissionPeriod()}
          className={`${actionCls} ${
            isWithinSubmissionPeriod()
              ? "bg-[#5fff60] border-[#5fff60] text-[#050905] hover:bg-[#7fff80]"
              : "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Project <ChevronRight size={14} />
        </button>
        {!isWithinSubmissionPeriod() && (
          <div className="absolute -bottom-6 left-0 text-[0.55rem] text-[rgba(180,220,180,0.4)] whitespace-nowrap">
            Submission Not Open
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ value, label, icon: Icon }) => (
    <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-4 backdrop-blur-sm hover:border-[rgba(95,255,96,0.28)] transition-all">
      <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
      <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[rgba(95,255,96,0.07)] rounded-[3px] flex items-center justify-center border border-[rgba(95,255,96,0.18)] flex-shrink-0">
          <Icon size={16} className="text-[#5fff60]" />
        </div>
        <div>
          <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl leading-tight">
            {value}
          </div>
          <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.1em] uppercase text-[rgba(180,220,180,0.45)] mt-0.5">
            {label}
          </div>
        </div>
      </div>
    </div>
  );

  const PrizeStatCard = ({ prizes, icon: Icon }) => {
    const total = prizes.reduce((s, p) => s + (p.amount || 0), 0);
    return (
      <div className="relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.12)] rounded-[4px] p-4 backdrop-blur-sm hover:border-[rgba(95,255,96,0.28)] transition-all">
        <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-[rgba(95,255,96,0.4)]" />
        <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-b-2 border-r-2 border-[rgba(95,255,96,0.4)]" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[rgba(95,255,96,0.07)] rounded-[3px] flex items-center justify-center border border-[rgba(95,255,96,0.18)] flex-shrink-0">
            <Icon size={16} className="text-[#5fff60]" />
          </div>
          <div className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl leading-tight">
            Prize Pool
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {prizes.slice(0, 4).map((p, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem] text-[rgba(180,220,180,0.45)]">
                {p.title}
              </span>
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[#5fff60] font-semibold">
                ₹{(p.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          {prizes.length > 4 && (
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] text-[rgba(180,220,180,0.28)]">
              +{prizes.length - 4} more
            </p>
          )}
          {total > 0 && prizes.length > 1 && (
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-[rgba(95,255,96,0.08)]">
              <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] tracking-[0.08em] uppercase text-[rgba(180,220,180,0.55)]">
                Total
              </span>
              <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-[#5fff60] text-sm">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const fallbackImage = `https://via.placeholder.com/1200x400/0a0f18/22c55e?text=${encodeURIComponent(
    title
  )}`;

  return (
    <>
      <FontStyle />

      <div className="border-b border-[rgba(95,255,96,0.1)] bg-[#0a0a0a] font-[family-name:'JetBrains_Mono',monospace] overflow-hidden">
        <div className="relative w-full h-[60vh] md:h-[60vh] lg:h-[75vh] overflow-hidden">
          <img
            src={imageError ? fallbackImage : imageUrl}
            alt="Hackathon Banner"
            className="w-full h-full object-fill sm:object-fill"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.88)] via-[rgba(10,10,10,0.15)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.22)] to-transparent" />
        </div>

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-7">
          <div className="flex flex-wrap items-start gap-3 mb-5">
            <span
              className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.58rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-[2px] border ${
                isActive
                  ? "bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.25)] text-[#5fff60]"
                  : "bg-[rgba(120,120,120,0.07)] border-[rgba(120,120,120,0.2)] text-[rgba(180,180,180,0.5)]"
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5fff60] animate-pulse" />
              )}
              {isActive ? "Active" : "Ended"}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
              {registrationPhase && (
                <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.5)]">
                  <Calendar
                    size={11}
                    className="text-[rgba(95,255,96,0.5)] flex-shrink-0"
                  />
                  <span className="text-[rgba(180,220,180,0.7)]">
                    Registration:
                  </span>
                  <span>
                    {formatDateRange(
                      registrationPhase.startDate,
                      registrationPhase.endDate
                    )}
                  </span>
                </div>
              )}
              {submissionPhases.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-[rgba(180,220,180,0.5)]"
                >
                  <Calendar
                    size={11}
                    className="text-[rgba(95,255,96,0.5)] flex-shrink-0"
                  />
                  <span className="text-[rgba(180,220,180,0.7)]">
                    {p.phaseName}:
                  </span>
                  <span>{formatDateRange(p.startDate, p.endDate)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white leading-tight tracking-tight mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                {title}
              </h1>
              {subTitle && (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-sm text-[rgba(180,220,180,0.48)] tracking-[0.02em]">
                  {subTitle}
                </p>
              )}
              {registered && (
                <div className="mt-2 inline-flex items-center gap-1.5">
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.56rem] tracking-[0.1em] uppercase text-[rgba(95,255,96,0.38)]">
                    Role:
                  </span>
                  <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.6rem] text-[#5fff60]">
                    {isLeader
                      ? "Leader"
                      : isTeamMember
                      ? "Team Member"
                      : "Registered"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
              {isLeader && teamCode && (
                <button
                  onClick={handleLeaderDashboard}
                  className={`${actionCls} bg-[rgba(95,255,96,0.1)] border-[rgba(95,255,96,0.3)] text-[#5fff60] hover:bg-[rgba(95,255,96,0.18)]`}
                >
                  Leader Dashboard <ChevronRight size={13} />
                </button>
              )}
              {renderActionButton()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              value={participantCount.toLocaleString()}
              label="Participants"
              icon={Users}
            />
            <PrizeStatCard prizes={prizes} icon={Trophy} />
            <StatCard
              value={isActive ? `${getDaysRemaining()} Days` : "Ended"}
              label="Time Left"
              icon={Clock}
            />
          </div>
        </div>
      </div>

      {showSubmissionModal && (
        <SubmissionForm
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          hackathonId={hackathonId}
          activeSubmissionPhase={activeSubmissionPhase}
        />
      )}
    </>
  );
};