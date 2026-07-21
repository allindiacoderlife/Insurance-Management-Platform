import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/DashboardLayout";
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap, Building } from "lucide-react";

export const UpgradePlan = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [upgraded, setUpgraded] = useState(false);

  const plans = [
    {
      id: "starter",
      name: "Starter Fleet",
      price: "Free",
      period: "Forever",
      description: "Perfect for single agents managing initial customer policies.",
      icon: ShieldCheck,
      features: [
        "Up to 50 active policies",
        "Basic claim processing",
        "Email support",
        "Standard document storage (1GB)",
      ],
      current: user?.role === "CUSTOMER",
    },
    {
      id: "pro",
      name: "Pro Broker Tier",
      price: "₹1,999",
      period: "per month",
      description: "Ideal for growing insurance agencies and high-volume brokers.",
      icon: Zap,
      popular: true,
      features: [
        "Unlimited policy creation",
        "Priority 6-digit OTP email & SMS verification",
        "Automated premium overdue reminders",
        "Interactive analytics & revenue charts",
        "Unlimited document uploads (20GB storage)",
        "Priority 24/7 dedicated support",
      ],
      current: user?.role === "AGENT",
    },
    {
      id: "enterprise",
      name: "Enterprise ERP",
      price: "₹4,999",
      period: "per month",
      description: "Complete ERP solution for enterprise insurance providers.",
      icon: Building,
      features: [
        "Multi-agent team management",
        "Custom policy validation rules",
        "Advanced claims verification workflow",
        "Dedicated database instance & API access",
        "100GB secure cloud storage",
        "Personalized onboarding & SLA agreement",
      ],
      current: user?.role === "ADMIN",
    },
  ];

  const handleUpgrade = (planName) => {
    setSelectedPlan(planName);
    setUpgraded(true);
  };

  return (
    <DashboardLayout title="Upgrade Subscription Plan" subtitle="Choose the right subscription plan for your insurance agency growth.">
      {upgraded && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
          🎉 Successfully requested plan upgrade to <span className="underline uppercase">{selectedPlan}</span>! Our account manager will activate your plan shortly.
        </div>
      )}

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`bg-white p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                plan.popular
                  ? "border-2 border-[#0b281a] shadow-xl scale-102"
                  : "border-slate-200/60 shadow-sm hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0b281a] text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#e2f5cf] text-[#0b281a] flex items-center justify-center font-bold mb-4">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">/{plan.period}</span>
                </div>

                <div className="space-y-2.5 border-t border-slate-100 pt-4 mb-6 text-xs font-semibold text-slate-700">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {plan.current ? (
                  <button
                    disabled
                    className="w-full h-11 rounded-2xl bg-slate-100 text-slate-500 font-extrabold text-xs cursor-default"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                      plan.popular
                        ? "bg-[#0b281a] hover:bg-[#061d12] text-white shadow-[#0b281a]/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                    }`}
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};
