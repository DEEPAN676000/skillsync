import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import API from '../../services/api.js';
import { SubscriptionPlan } from '../../types/index.js';
import { CheckoutModal } from './CheckoutModal.js';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: 'basic' | 'premium' | 'pro';
  onSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'basic',
  onSuccess,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get('/subscriptions/plans');
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch {
        // fallback
      }
    };
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  return (
    <>
      <Modal isOpen={isOpen && !showCheckout} onClose={onClose} title="Instructor Subscription Plans" maxWidth="4xl">
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl font-extrabold text-slate-900">
              Upgrade Your Teaching Reach
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Unlock unlimited courses, priority search placement, lower platform commission, and advanced revenue analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl border flex flex-col justify-between relative transition duration-300 ${
                    plan.popular
                      ? 'border-purple-500 shadow-xl shadow-purple-500/10 bg-gradient-to-b from-purple-50/40 to-white'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-brand text-[11px] font-bold text-white shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-base text-slate-900">{plan.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-black text-slate-900">
                        {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-1">
                        /{plan.billingCycle}
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-brand text-white shadow-md shadow-purple-500/20 hover:opacity-95'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {isCurrent ? 'Active Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {showCheckout && selectedPlan && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
          itemType="subscription"
          itemId={selectedPlan.id}
          itemTitle={`${selectedPlan.name} (Monthly)`}
          itemPrice={selectedPlan.price}
          onSuccess={() => {
            setShowCheckout(false);
            onSuccess();
            onClose();
          }}
        />
      )}
    </>
  );
};

