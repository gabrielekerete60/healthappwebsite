'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, 
  Settings, Users, MessageSquare, ShieldCheck,
  Maximize, Minimize, Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, collection, addDoc, getDoc, updateDoc } from 'firebase/firestore';

const servers = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const appointmentId = resolvedParams.id;
  const router = useRouter();

  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (isJoined) {
      const initializeRTC = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;

          const pc = new RTCPeerConnection(servers);

          // Add Local Tracks
          stream.getTracks().forEach(track => {
             if (track.kind === 'audio') track.enabled = !isMuted;
             if (track.kind === 'video') track.enabled = !isVideoOff;
             pc.addTrack(track, stream);
          });

          // Inbound remote tracks
          pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          };

          peerConnection.current = pc;
          
          // Firebase Signaling References
          const callDoc = doc(db, 'calls', appointmentId);
          const callerCandidatesCol = collection(callDoc, 'callerCandidates');
          const calleeCandidatesCol = collection(callDoc, 'calleeCandidates');

          const callData = (await getDoc(callDoc)).data();

          if (!callData?.offer) {
            // WE ARE THE CALLER
            console.log("Creating WebRTC Offer...");
            
            // Push ICE Candidates
            pc.onicecandidate = (event) => {
              if (event.candidate) {
                addDoc(callerCandidatesCol, event.candidate.toJSON());
              }
            };

            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);

            const offer = {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            };

            await setDoc(callDoc, { offer }, { merge: true });

            // Listen for Answer
            onSnapshot(callDoc, (snapshot) => {
              const data = snapshot.data();
              if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.setRemoteDescription(answerDescription);
              }
            });

            // Listen for Remote ICE candidates
            onSnapshot(calleeCandidatesCol, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  const candidate = new RTCIceCandidate(change.doc.data());
                  pc.addIceCandidate(candidate);
                }
              });
            });

          } else {
            // WE ARE THE CALLEE
            console.log("Answering WebRTC Offer...");
            
            // Push ICE Candidates
            pc.onicecandidate = (event) => {
              if (event.candidate) {
                addDoc(calleeCandidatesCol, event.candidate.toJSON());
              }
            };

            const offerDescription = callData.offer;
            await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);

            const answer = {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            };

            await updateDoc(callDoc, { answer });

            // Listen for Remote ICE candidates
            onSnapshot(callerCandidatesCol, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  const candidate = new RTCIceCandidate(change.doc.data());
                  pc.addIceCandidate(candidate);
                }
              });
            });
          }
          
        } catch (error) {
          console.error('Error in WebRTC initialization', error);
        }
      };

      initializeRTC();
    }
  }, [isJoined, appointmentId]);

  useEffect(() => {
    // Dynamic mic/video toggling
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      stream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff]);

  const handleJoin = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsJoined(true);
    }, 2000);
  };

  const handleEndCall = () => {
    router.push('/appointments');
  };

  // Join screen respects theme
  if (!isJoined && !isConnecting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 pt-32 sm:pt-40 transition-colors">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
              <ShieldCheck size={14} />
              End-to-End Encrypted
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
              Secure <span className="text-blue-600">Protocol</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
              You are about to join a private clinical node for your appointment. Ensure your credentials and hardware are ready.
            </p>
            <button 
              onClick={handleJoin}
              className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
            >
              Initialize Session
            </button>
          </div>

          <div className="relative aspect-video bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center group shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 dark:from-slate-950 to-transparent opacity-60" />
             <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Video size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Preview Unavailable</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Connecting screen respects theme
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center pt-32 sm:pt-40 transition-colors">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 relative z-10" />
        </div>
        <p className="mt-8 text-slate-900 dark:text-white font-black uppercase tracking-[0.3em] text-xs">Securing Node Connection...</p>
      </div>
    );
  }

  // Active call screen remains immersive dark (industry standard for video)
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col pt-16">
      {/* Main Call Area */}
      <div className="flex-1 relative p-4 sm:p-8 flex items-center justify-center">
        {/* Peer Video (Specialist) */}
        <div className="w-full h-full max-w-6xl aspect-video bg-slate-900 rounded-[48px] border border-white/5 overflow-hidden relative shadow-2xl">
           <video 
             ref={remoteVideoRef} 
             autoPlay 
             playsInline 
             className="absolute inset-0 w-full h-full object-cover rounded-[48px]" 
           />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!remoteVideoRef.current?.srcObject && (
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <span className="text-4xl font-black text-blue-400">S</span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">Specialist Name</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Connecting...</p>
                </div>
              )}
           </div>
           <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">Live: Specialist</span>
           </div>
        </div>

        {/* Self Video (Overlay) */}
        <motion.div 
          drag
          dragConstraints={{ left: -400, right: 400, top: -200, bottom: 200 }}
          className="absolute bottom-12 right-12 w-48 sm:w-64 aspect-video bg-slate-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden cursor-move z-20"
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
          />
          {isVideoOff ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <VideoOff size={24} className="text-slate-600" />
            </div>
          ) : (
            <>
               <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest z-10">
                 You (Me)
               </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Control Bar */}
      <div className="h-32 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center px-8 relative z-30">
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            onClick={() => setIsMicMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button 
            onClick={handleEndCall}
            className="w-20 h-14 bg-red-600 hover:bg-red-700 text-white rounded-[24px] flex items-center justify-center transition-all shadow-xl shadow-red-600/20 active:scale-95 mx-4"
          >
            <PhoneOff size={24} />
          </button>

          <button className="w-14 h-14 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 flex items-center justify-center transition-all">
            <MessageSquare size={20} />
          </button>

          <button className="w-14 h-14 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5 flex items-center justify-center transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
