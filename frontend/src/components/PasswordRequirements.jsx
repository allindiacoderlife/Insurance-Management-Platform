import { Check, X } from "lucide-react";

export const getPasswordCriteria = (password = "") => {
  return {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-]/.test(password),
  };
};

export const getPasswordStrength = (password = "") => {
  if (!password) return { score: 0, label: "", color: "bg-slate-200" };

  const criteria = getPasswordCriteria(password);
  const count = Object.values(criteria).filter(Boolean).length;

  if (count <= 2) return { score: count, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
  if (count === 3) return { score: count, label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
  if (count === 4) return { score: count, label: "Good", color: "bg-blue-500", text: "text-blue-600" };
  return { score: count, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
};

export const PasswordRequirements = ({ password = "" }) => {
  if (!password) return null;

  const criteria = getPasswordCriteria(password);
  const strength = getPasswordStrength(password);

  const requirements = [
    { label: "At least 6 characters", met: criteria.minLength },
    { label: "One uppercase letter (A-Z)", met: criteria.hasUpper },
    { label: "One lowercase letter (a-z)", met: criteria.hasLower },
    { label: "One number (0-9)", met: criteria.hasNumber },
    { label: "One special character (!@#$%...)", met: criteria.hasSpecial },
  ];

  return (
    <div className="space-y-2 pt-1 animate-fadeIn">
      {/* Strength Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-slate-500">Password Strength</span>
        <span className={strength.text}>{strength.label}</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex gap-1 p-0.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score ? strength.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              req.met ? "text-emerald-600 font-semibold" : "text-slate-400"
            }`}
          >
            {req.met ? (
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-slate-300 shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
