import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Crown } from "lucide-react";
import { createOrder } from "../features/createOrder";
import getCurrentUser from "../features/getCurrentUser";
import { verifyPayment } from "../features/verifyPayment";
import { setUserData } from "../redux/userSlice";

function BillingDrawer({ open = false, onClose }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [pendingPlan, setPendingPlan] = useState(null);

  const handleUpgrade = async (plan) => {
    if (pendingPlan) return;

    setPendingPlan(plan);

    try {
      const data = await createOrder(plan);

      if (!data?.order) {
        throw new Error("Order not created from backend");
      }

      const options = {
        key: import.meta.env.VITE_RAZOR_KEY_ID,
        amount: data?.order?.amount,
        currency: data?.order?.currency,
        name: "CortexAI",
        description: `${data?.plan?.name} Plan`,
        order_id: data?.order?.id,
        handler: async (response) => {
          const paymentData = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          console.log("Payment verified:", paymentData);

          const updatedUser = await getCurrentUser();
          if (updatedUser) {
            dispatch(setUserData(updatedUser));
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(
        "Upgrade failed:",
        error.response?.data || error.message || error,
      );
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black"
          />

          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-slate-900 p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg text-white font-semibold">Billing</div>
                <div className="text-slate-400 text-sm">Plans & Credits</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-5 ">
              <div className="rounded-xl bg-white/4 border border-white/10 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-sm">Current Plan</p>
                    <h3 className="text-white text-xl font-bold">
                      {userData?.plan || "free"}
                    </h3>
                  </div>
                  <Crown className="text-yellow-400" />
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Credits</span>
                    <span>
                      {userData?.credits || 0}/{userData?.totalCredits || 100}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{
                        width: `${((userData?.credits || 0) / (userData?.totalCredits || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-auto space-y-4">
              <div className="rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-semibold">Starter Plan</h3>
                <p className="text-indigo-400 text-2xl font-bold mt-2">₹199</p>
                <p className="text-slate-400 text-sm mt-1">500 Credits</p>
                <button
                  type="button"
                  disabled={pendingPlan !== null}
                  className="mt-4 cursor-pointer w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2 text-white"
                  onClick={() => handleUpgrade("starter")}
                >
                  {pendingPlan === "starter" ? "Creating order..." : "Upgrade"}
                </button>
              </div>
            </div>
            <div className="p-5 flex-1 overflow-auto space-y-4">
              <div className="rounded-xl border border-white/10 p-4">
                <h3 className="text-white font-semibold">Pro Plan</h3>
                <p className="text-indigo-400 text-2xl font-bold mt-2">₹499</p>
                <p className="text-slate-400 text-sm mt-1">1000 Credits</p>
                <button
                  type="button"
                  disabled={pendingPlan !== null}
                  className="mt-4 w-full cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2 text-white"
                  onClick={() => handleUpgrade("pro")}
                >
                  {pendingPlan === "pro" ? "Creating order..." : "Upgrade"}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default BillingDrawer;
