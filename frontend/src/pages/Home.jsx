import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';
import VsCodeIde from '../components/ide/VsCodeIde';
import RepoLoadingModal from '../components/ide/RepoLoadingModal';
import IdeToast from '../components/ide/IdeToast';

function Home() {
    const { userData } = useSelector(state => state.user)
    const { viewMode } = useSelector(state => state.ide)
    const dispatch = useDispatch()

    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
        } catch (error) {
            console.log(error)
        }
    }

    const googleLogin = async () => {
        try {
            const data = await signInWithPopup(auth, googleProvider)
            const token = await data.user.getIdToken()
            await handleLogin(token)
        } catch (error) {
            console.log("Login error:", error)
        }
    }

    return (
        <div className='h-screen flex bg-[#0d0f14] text-white overflow-hidden relative'>
            {/* Global Repo Loading Modal & In-App Toast */}
            <RepoLoadingModal />
            <IdeToast />
            {/* View Mode: Full IDE */}
            {viewMode === "ide" ? (
                <VsCodeIde isEmbedded={false} />
            ) : viewMode === "split" ? (
                /* View Mode: Split (Chat + IDE side-by-side) */
                <div className='flex w-full h-full overflow-hidden'>
                    <SideBar />
                    <div className='w-[42%] min-w-[340px] max-w-[600px] flex flex-col h-full border-r border-white/[0.08] overflow-hidden'>
                        <ChatArea />
                    </div>
                    <div className='flex-1 flex flex-col h-full min-w-0 overflow-hidden'>
                        <VsCodeIde isEmbedded={true} />
                    </div>
                </div>
            ) : (
                /* View Mode: Chat (Default standard view) */
                <>
                    <SideBar />
                    <ChatArea />
                    <Artifact />
                </>
            )}

            {!userData && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur'>
                    <div className='w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5'>
                        <div className='flex flex-col gap-1'>
                            <h2 className='text-[17px] font-semibold text-slate-100 tracking-tight'>Welcome to CortexAI</h2>
                            <p className='text-[13px] text-slate-500'>Please login to continue using the app.</p>
                        </div>

                        <button className='w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 transition-all duration-150 cursor-pointer' onClick={googleLogin}>
                            <FcGoogle size={15} />
                            Continue With Google
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
