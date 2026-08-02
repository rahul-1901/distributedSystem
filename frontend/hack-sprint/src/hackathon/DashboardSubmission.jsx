import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Code, Clock, Users, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { HackathonAPI } from "../api/hackathon.api.js";
import { SubmissionAPI } from "../api/submission.api.js";
import DynamicFieldsForm from "../components/DynamicFieldsForm.jsx";
import {
  normalizeFields,
  buildInitialValues,
  validateFields,
} from "../utils/dynamicFields.js";

const FontStyle = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
);

const mono = "font-[family-name:'JetBrains_Mono',monospace]";
const syne = "font-[family-name:'Syne',sans-serif]";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="relative bg-[rgba(95,255,96,0.04)] border border-[rgba(95,255,96,0.12)] rounded-[3px] p-4">
    <Icon size={13} className="text-[rgba(95,255,96,0.55)] mb-2" />
    <div
      className={`${mono} text-[0.52rem] tracking-[0.12em] uppercase text-[rgba(180,220,180,0.45)] mb-0.5`}
    >
      {label}
    </div>
    <div className={`${syne} font-extrabold text-white text-sm tracking-tight`}>
      {value}
    </div>
  </div>
);

const inputCls = `${mono} w-full bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.15)] rounded-[3px] px-3 py-2.5 text-[0.7rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.25)] focus:outline-none focus:border-[rgba(95,255,96,0.42)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.06)] transition-all`;

const SubmissionForms = ({ isOpen, onClose, hackathonId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState(null);
  const [submissionPhase, setSubmissionPhase] = useState(null);
  const [existingSubmissionId, setExistingSubmissionId] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);

  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!hackathonId || !isOpen) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const hackRes = await HackathonAPI.getHackathon(hackathonId);
        const h = hackRes.data;
        if (cancelled) return;
        setHackathon(h);

        const phase = h.phases?.find((p) => p.phaseType === "SUBMISSION");
        setSubmissionPhase(phase || null);

        const normalized = normalizeFields(phase?.submissionForm || [], "submission");
        setFields(normalized);

        const statusRes = await SubmissionAPI.getMySubmission(hackathonId);
        const submissionPhases = statusRes.data.phases || [];
        const current = submissionPhases[submissionPhases.length - 1];

        if (current?.submitted) {
          setExistingSubmissionId(current.submissionId);
          setCanSubmit(current.canSubmit);

          const subRes = await SubmissionAPI.getSubmission(current.submissionId);
          const sub = subRes.data.submission;
          if (!cancelled) {
            setTitle(sub.title || "");
            setDescription(sub.description || "");
            setValues(buildInitialValues(normalized, sub.submissionData || {}));
          }
        } else {
          setExistingSubmissionId(null);
          setCanSubmit(current?.canSubmit ?? true);
          setValues(buildInitialValues(normalized));
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load submission details"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hackathonId, isOpen]);

  const handleFieldChange = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = validateFields(fields, values);
    if (!title.trim() || !description.trim() || Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      if (!title.trim() || !description.trim()) {
        toast.error("Title and description are required");
      }
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, description, submissionData: values };
      if (existingSubmissionId) {
        await SubmissionAPI.updateSubmission(
          hackathonId,
          existingSubmissionId,
          payload
        );
        toast.success("Submission updated!");
      } else {
        await SubmissionAPI.createSubmission(hackathonId, payload);
        toast.success("Submission successful!");
      }
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Submission failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || loading || !hackathon) return null;

  const totalPrize =
    hackathon.rewards?.length > 0
      ? hackathon.rewards.reduce((s, r) => s + (r.amount || 0), 0)
      : (hackathon.prizeMoney1 || 0) +
        (hackathon.prizeMoney2 || 0) +
        (hackathon.prizeMoney3 || 0);
  const daysLeft = submissionPhase
    ? Math.ceil((new Date(submissionPhase.endDate) - new Date()) / 86400000)
    : null;

  return createPortal(
    <>
      <FontStyle />
      <div
        className={`${mono} fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto`}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-xl bg-[rgba(8,10,8,0.98)] border border-[rgba(95,255,96,0.18)] rounded-[4px] p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="absolute top-[-1px] left-[-1px] w-3 h-3 border-t-2 border-l-2 border-[rgba(95,255,96,0.55)]" />
          <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-b-2 border-r-2 border-[rgba(95,255,96,0.55)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(95,255,96,0.3)] to-transparent" />

          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className={`${syne} font-extrabold text-white text-xl tracking-tight leading-tight`}>
              {hackathon.title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(95,255,96,0.15)] text-[rgba(95,255,96,0.45)] hover:text-[#5fff60] hover:border-[rgba(95,255,96,0.35)] transition-all cursor-pointer flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <StatCard icon={Code} label="Prize Pool" value={`₹${totalPrize.toLocaleString("en-IN")}`} />
            {daysLeft !== null && (
              <StatCard icon={Clock} label="Days Left" value={`${Math.max(daysLeft, 0)} Days`} />
            )}
            <StatCard icon={Users} label="Participants" value={hackathon.numParticipants || 0} />
            <StatCard icon={Calendar} label="Difficulty" value={hackathon.difficulty} />
          </div>

          {!canSubmit && !existingSubmissionId ? (
            <p className={`${mono} text-[0.68rem] text-[rgba(255,184,77,0.7)]`}>
              Submissions are not open for this hackathon right now.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className={`${mono} block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.5)] mb-1.5`}>
                  Title <span className="text-[#ff9090]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={`${mono} block text-[0.55rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.5)] mb-1.5`}>
                  Description <span className="text-[#ff9090]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              {fields.length > 0 && (
                <DynamicFieldsForm
                  fields={fields}
                  values={values}
                  onChange={handleFieldChange}
                  errors={errors}
                  resourceType="submission"
                  hackathonId={hackathonId}
                />
              )}

              <button
                type="submit"
                disabled={submitting || (!canSubmit && !existingSubmissionId)}
                className={`${mono} w-full inline-flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] border cursor-pointer transition-all duration-150
                  bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold
                  hover:bg-[#7fff80] hover:shadow-[0_0_20px_rgba(95,255,96,0.3)]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {submitting
                  ? "Submitting…"
                  : existingSubmissionId
                  ? "Update Submission"
                  : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default SubmissionForms;
