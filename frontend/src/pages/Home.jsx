import { signInWithPopup } from "firebase/auth";
import React from "react";
import api from "../../utils/axios";
import { auth, googleProvider } from "../../utils/firebase";

import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import Artifect from "../components/Artifect";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserData(data));
    } catch (error) {
      console.log(error);
    }
  };

  const googleLogin = async () => {
    try {
      const data = await signInWithPopup(auth, googleProvider);
      const token = await data.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="h-screen  flex bg-[#0d0f14] text-white overflow-hidden">
      <Sidebar />
      <ChatArea />
      <Artifect />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#13151c] border border-white/[0.08] rounded-2xl p-6 sm:p-7 flex flex-col gap-5 shadow-2xl">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Welcome to CortexAI
              </h2>
              <p className="text-[13px] text-slate-400">
                Please login to continue using the app.
              </p>
            </div>
            <button
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium text-black bg-white hover:bg-slate-200 transition-all cursor-pointer shadow-sm"
              onClick={googleLogin}
            >
              <FcGoogle size={18} />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
