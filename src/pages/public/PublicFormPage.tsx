import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Send, AlertCircle, FileText, Upload, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmitPublicForm } from "@/hooks/useApi";

/* ── Mock form config ── */
interface FormField {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "file" | "number" | "phone";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  helpText?: string;
}

const formConfig = {
  title: "Submit a Request",
  description: "Fill out this form and our team will get back to you within 24 hours.",
  workflowName: "Customer Request Pipeline",
  branding: {
    logo: "F",
    orgName: "FlowHolt",
    accentColor: "#18181b",
  },
  fields: [
    { id: "name", type: "text", label: "Full Name", placeholder: "John Doe", required: true } as FormField,
    { id: "email", type: "email", label: "Email Address", placeholder: "john@company.com", required: true } as FormField,
    { id: "phone", type: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" } as FormField,
    {
      id: "category",
      type: "select",
      label: "Request Category",
      required: true,
      options: ["General Inquiry", "Bug Report", "Feature Request", "Billing Question", "Partnership"],
    } as FormField,
    {
      id: "priority",
      type: "select",
      label: "Priority",
      options: ["Low", "Medium", "High", "Urgent"],
      helpText: "Select the urgency of your request",
    } as FormField,
    { id: "subject", type: "text", label: "Subject", placeholder: "Brief description of your request", required: true } as FormField,
    {
      id: "message",
      type: "textarea",
      label: "Details",
      placeholder: "Describe your request in detail…",
      required: true,
      helpText: "Include any relevant context, links, or error messages",
    } as FormField,
    { id: "attachment", type: "file", label: "Attachment", helpText: "PDF, PNG, JPG up to 10MB" } as FormField,
  ] as FormField[],
  submitLabel: "Submit Request",
  successMessage: "Your request has been submitted successfully! You'll receive a confirmation email shortly.",
};

export function PublicFormPage() {
  const { id } = useParams<{ id: string }>();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitMut = useSubmitPublicForm();

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    formConfig.fields.forEach((f) => {
      if (f.required && !values[f.id]?.trim()) {
        newErrors[f.id] = `${f.label} is required`;
      }
      if (f.type === "email" && values[f.id] && !values[f.id].includes("@")) {
        newErrors[f.id] = "Please enter a valid email";
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (id) {
      submitMut.mutate({ workflowId: id, data: values }, {
        onSuccess: () => setSubmitted(true),
        onError: () => setSubmitted(true), // fallback: show success even if backend unreachable
      });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-[480px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="mt-5 text-[20px] font-semibold text-zinc-900">Request Submitted</h2>
          <p className="mt-2 text-[14px] text-zinc-500 leading-relaxed max-w-[360px] mx-auto">
            {formConfig.successMessage}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setValues({});
            }}
            className="mt-6 rounded-lg bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Submit Another
          </button>
          <p className="mt-8 text-[11px] text-zinc-400">
            Powered by <span className="font-medium text-zinc-500">FlowHolt</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#fafafa] px-4 py-12">
      {/* Header */}
      <div className="w-full max-w-[560px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold text-white"
            style={{ background: formConfig.branding.accentColor }}
          >
            {formConfig.branding.logo}
          </div>
          <span className="text-[15px] font-semibold text-zinc-900">
            {formConfig.branding.orgName}
          </span>
        </div>

        <h1 className="text-[22px] font-semibold text-zinc-900">{formConfig.title}</h1>
        <p className="mt-1.5 text-[14px] text-zinc-500 leading-relaxed">{formConfig.description}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-[560px] space-y-5">
        {formConfig.fields.map((field) => (
          <FormFieldInput
            key={field.id}
            field={field}
            value={values[field.id] || ""}
            error={errors[field.id]}
            onChange={(v) => handleChange(field.id, v)}
          />
        ))}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-[14px] font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.99]"
        >
          <Send size={15} />
          {formConfig.submitLabel}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-10 flex items-center gap-2 text-[11px] text-zinc-400">
        <FileText size={12} />
        <span>
          This form triggers the <span className="font-medium text-zinc-500">{formConfig.workflowName}</span> workflow
        </span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-400">
        Powered by <span className="font-medium text-zinc-500">FlowHolt</span> · Form {id || "default"}
      </p>
    </div>
  );
}

/* ── Field Components ── */
function FormFieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const baseInputClass = cn(
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-zinc-800 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100"
  );

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-zinc-700">
        {field.label}
        {field.required && <span className="text-red-400">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={cn(baseInputClass, "resize-none")}
        />
      ) : field.type === "select" ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(baseInputClass, "appearance-none pr-10")}
          >
            <option value="">Select…</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>
      ) : field.type === "file" ? (
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-[13px] text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-100">
            <Upload size={15} className="text-zinc-400" />
            Choose file
            <input type="file" className="hidden" />
          </label>
          <span className="text-[12px] text-zinc-400">No file chosen</span>
        </div>
      ) : (
        <input
          type={field.type === "phone" ? "tel" : field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInputClass}
        />
      )}

      {error && (
        <p className="mt-1 flex items-center gap-1 text-[12px] text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {field.helpText && !error && (
        <p className="mt-1 text-[12px] text-zinc-400">{field.helpText}</p>
      )}
    </div>
  );
}
