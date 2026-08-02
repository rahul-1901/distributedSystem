import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Users,
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react";
import { HackathonAPI } from "../api/hackathon.api.js";
import { RegistrationAPI } from "../api/registration.api.js";
import { TeamAPI } from "../api/team.api.js";
import DynamicFieldsForm from "../components/DynamicFieldsForm.jsx";
import {
  normalizeFields,
  buildInitialValues,
  validateFields,
} from "../utils/dynamicFields.js";

const inp = [
  "font-[family-name:'JetBrains_Mono',monospace]",
  "w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)]",
  "rounded-[3px] px-3 py-2.5 text-[0.72rem] text-[#e8ffe8]",
  "placeholder-[rgba(95,255,96,0.28)]",
  "focus:outline-none focus:border-[rgba(95,255,96,0.45)]",
  "focus:shadow-[0_0_0_2px_rgba(95,255,96,0.07)]",
  "transition-all [color-scheme:dark]",
].join(" ");

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5 mb-5">
    <label className="font-[family-name:'JetBrains_Mono',monospace] text-[0.58rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.55)]">
      {label}
      {required && <span className="text-[#ff9090] ml-1">*</span>}
    </label>
    {children}
  </div>
);

const PrimaryBtn = ({
  children,
  disabled,
  type = "button",
  onClick,
  className = "",
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center justify-center gap-2
      text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] border cursor-pointer
      transition-all duration-150
      bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
      hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]
      disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

const SubTabBtn = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`font-[family-name:'JetBrains_Mono',monospace] flex-1 inline-flex items-center justify-center gap-1.5
      text-[0.6rem] tracking-[0.08em] uppercase px-3 py-2 rounded-[2px] cursor-pointer transition-all duration-150
      ${
        active
          ? "bg-[rgba(95,255,96,0.12)] text-[#5fff60] border border-[rgba(95,255,96,0.3)]"
          : "text-[rgba(95,255,96,0.45)] hover:text-[rgba(95,255,96,0.7)]"
      }`}
  >
    {children}
  </button>
);

const TeamInfoModal = ({ details, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-md bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.22)] rounded-[4px] p-8 shadow-[0_0_40px_rgba(95,255,96,0.08)]">
        <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.55)]" />
        <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.55)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.35)] to-transparent" />

        <h2 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-xl tracking-tight mb-1">
          Team Created!
        </h2>
        <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.65rem] text-[rgba(180,220,180,0.55)] mb-6 leading-relaxed">
          Share the code or link below so teammates can join.
        </p>

        <div className="flex flex-col gap-4 mb-7">
          {[
            {
              label: "Invite Code",
              value: details.code,
              type: "code",
              copied: copiedCode,
              mono: true,
            },
            {
              label: "Invite Link",
              value: details.link,
              type: "link",
              copied: copiedLink,
              mono: false,
            },
          ].map(({ label, value, type, copied, mono }) => (
            <div key={type}>
              <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.45)] mb-1.5">
                {label}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex-1 bg-[rgba(95,255,96,0.05)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2 text-[#5fff60] truncate ${
                    mono
                      ? "font-[family-name:'JetBrains_Mono',monospace] text-sm tracking-widest"
                      : "font-[family-name:'JetBrains_Mono',monospace] text-[0.62rem]"
                  }`}
                >
                  {value}
                </div>
                <button
                  onClick={() => copy(value, type)}
                  className="w-9 h-9 flex items-center justify-center rounded-[3px] border border-[rgba(95,255,96,0.2)] bg-[rgba(95,255,96,0.06)] text-[rgba(95,255,96,0.6)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.38)] transition-all cursor-pointer flex-shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={onClose} className="w-full">
          Proceed to Team Page <ChevronRight size={14} />
        </PrimaryBtn>
      </div>
    </div>
  );
};

export const RegistrationForm = ({ onSubmit = () => {} }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState(null);
  const [step, setStep] = useState("register");

  const [regFields, setRegFields] = useState([]);
  const [regValues, setRegValues] = useState({});
  const [regErrors, setRegErrors] = useState({});

  const [teamOption, setTeamOption] = useState("create");
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [teamDetails, setTeamDetails] = useState({ code: "", link: "" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await HackathonAPI.getHackathonBySlug(slug);
        const h = res.data.hackathon;
        if (cancelled) return;
        setHackathon(h);

        const regPhase = h.phases?.find((p) => p.phaseType === "REGISTRATION");
        const fields = normalizeFields(regPhase?.submissionForm || [], "submission");
        setRegFields(fields);
        setRegValues(buildInitialValues(fields));

        const statusRes = await RegistrationAPI.getRegistrationStatus(h._id);
        if (!cancelled && statusRes.data.isRegistered) {
          setStep("team");
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load hackathon details"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleFieldChange = (fieldName, value) => {
    setRegValues((prev) => ({ ...prev, [fieldName]: value }));
    setRegErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateFields(regFields, regValues);
    if (Object.keys(errors).length) {
      setRegErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await RegistrationAPI.register(hackathon._id, regValues);
      toast.success("Registered successfully!");
      onSubmit(regValues);
      setStep("team");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await TeamAPI.createTeam(hackathon._id, { teamName });
      toast.success(res.data.message || "Team created!");
      setTeamDetails({
        code: res.data.team.secretCode,
        link: res.data.team.secretLink,
      });
      setShowTeamInfo(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Team creation failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await TeamAPI.joinTeam({ secretCode: joinCode.trim() });
      toast.success(
        res.data.message || "Join request sent to the team leader!"
      );
      navigate(`/hackathon/${slug}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to join team"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!hackathon) return null;

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-10 relative overflow-hidden font-[family-name:'JetBrains_Mono',monospace]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(95,255,96,.026) 1px,transparent 1px),linear-gradient(90deg,rgba(95,255,96,.026) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse,rgba(95,255,96,.06) 0%,transparent 65%)",
          }}
        />

        {showTeamInfo && (
          <TeamInfoModal
            details={teamDetails}
            onClose={() => {
              setShowTeamInfo(false);
              navigate(`/hackathon/${slug}/team/${teamDetails.code}`, {
                state: { secretCode: teamDetails.code },
              });
            }}
          />
        )}

        <div className="relative z-10 w-full max-w-3xl bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] px-6 sm:px-10 py-9 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)]" />

          <div className="text-center mb-7 pb-6 border-b border-[rgba(95,255,96,0.08)]">
            <div className="font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.2em] uppercase text-[rgba(95,255,96,0.45)] mb-2">
              HackSprint
            </div>
            <h1 className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-2xl sm:text-3xl md:text-4xl tracking-tight">
              {step === "register" ? "Hackathon Registration" : "Join or Create a Team"}
            </h1>
          </div>

          {step === "register" && (
            <form onSubmit={handleRegister}>
              {regFields.length > 0 ? (
                <DynamicFieldsForm
                  fields={regFields}
                  values={regValues}
                  onChange={handleFieldChange}
                  errors={regErrors}
                  resourceType="resource"
                  hackathonId={hackathon._id}
                />
              ) : (
                <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[rgba(180,220,180,0.55)] mb-2">
                  No additional details are required — just confirm your
                  registration to continue.
                </p>
              )}
              <div className="mt-6 flex justify-center sm:justify-end">
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    "Registering…"
                  ) : (
                    <>
                      <span>Register</span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </form>
          )}

          {step === "team" && (
            <div>
              <div className="flex gap-1 mb-7 p-1 bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.1)] rounded-[3px]">
                <SubTabBtn
                  active={teamOption === "create"}
                  onClick={() => setTeamOption("create")}
                >
                  <Plus size={11} /> Create Team
                </SubTabBtn>
                <SubTabBtn
                  active={teamOption === "join"}
                  onClick={() => setTeamOption("join")}
                >
                  <LinkIcon size={11} /> Join with Code
                </SubTabBtn>
              </div>

              {teamOption === "create" && (
                <form onSubmit={handleCreateTeam}>
                  <Field label="Team Name" required>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className={inp}
                      required
                    />
                  </Field>
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <PrimaryBtn type="submit" disabled={submitting}>
                      {submitting ? (
                        "Creating…"
                      ) : (
                        <>
                          <Users size={13} />
                          <span>Create Team</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </PrimaryBtn>
                  </div>
                </form>
              )}

              {teamOption === "join" && (
                <form onSubmit={handleJoinTeam}>
                  <div className="max-w-md mx-auto">
                    <Field label="Team Invite Code" required>
                      <input
                        type="text"
                        placeholder="Enter team code (e.g. ABC123XY)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className={inp}
                        required
                      />
                    </Field>
                  </div>
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <PrimaryBtn
                      type="submit"
                      disabled={submitting || !joinCode.trim()}
                    >
                      {submitting ? (
                        "Sending…"
                      ) : (
                        <>
                          <span>Request to Join</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </PrimaryBtn>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
