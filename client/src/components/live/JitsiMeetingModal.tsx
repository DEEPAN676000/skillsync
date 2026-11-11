import React, { useEffect, useRef, useState } from 'react';
import { X, Video, Users, Mic, Clock, ShieldCheck } from 'lucide-react';
import { LiveClass } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

interface JitsiMeetingModalProps {
  liveClass: LiveClass | null;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeetingModal: React.FC<JitsiMeetingModalProps> = ({
  liveClass,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [loadingJitsi, setLoadingJitsi] = useState(true);

  useEffect(() => {
    if (!isOpen || !liveClass || !jitsiContainerRef.current) return;

    setLoadingJitsi(true);

    const initJitsi = () => {
      try {
        if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
          // Clear previous instance
          if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
          }

          const domain = 'meet.jit.si';
          const options = {
            roomName: liveClass.meetingRoomId,
            parentNode: jitsiContainerRef.current,
            width: '100%',
            height: '100%',
            userInfo: {
              displayName: user?.name || 'SkillSync Participant',
              email: user?.email,
            },
            configOverwrite: {
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              prejoinPageEnabled: false,
              disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'chat',
                'recording',
                'livestreaming',
                'etherpad',
                'sharedvideo',
                'settings',
                'raisehand',
                'videoquality',
                'filmstrip',
                'tileview',
              ],
            },
          };

          jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
          setLoadingJitsi(false);
        } else {
          // Fallback if script is loading
          setTimeout(initJitsi, 300);
        }
      } catch (err) {
        console.error('Failed to init Jitsi:', err);
        setLoadingJitsi(false);
      }
    };

    initJitsi();

    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          // ignore
        }
        jitsiApiRef.current = null;
      }
    };
  }, [isOpen, liveClass, user]);

  if (!isOpen || !liveClass) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Conference Room Top Bar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white truncate max-w-md">
                {liveClass.title}
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instructor: {liveClass.teacher?.name} • Room: {liveClass.meetingRoomId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
          >
            Leave Class
          </button>
        </div>
      </header>

      {/* Conference Frame Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {loadingJitsi && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 gap-3">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-300">
              Connecting to secure Jitsi audio/video room...
            </p>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

