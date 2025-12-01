import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, PhoneOff, Disc, GripVertical } from 'lucide-react';
import { CallState } from '../types';

interface DialerProps {
  callState: CallState;
  onCallStart: (phoneNumber: string) => void;
  onCallEnd: () => void;
  activeLeadName?: string;
  activeLeadPhone?: string;
  inputVolume: number;
  outputVolume: number;
  onToggleRecording: (isRecording: boolean) => void;
  isRecording: boolean;
}

const Dialer: React.FC<DialerProps> = ({
  callState,
  onCallStart,
  onCallEnd,
  activeLeadName,
  activeLeadPhone,
  inputVolume,
  outputVolume,
  onToggleRecording,
  isRecording
}) => {
  const [dialNumber, setDialNumber] = useState(activeLeadPhone || '');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (activeLeadPhone) {
        setDialNumber(activeLeadPhone);
    }
  }, [activeLeadPhone]);

  useEffect(() => {
    let interval: any;
    if (callState === CallState.ACTIVE) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePadClick = (num: string) => {
    if (callState === CallState.IDLE) {
      setDialNumber(prev => prev + num);
    }
  };

  const activeVisualizerHeight = Math.min(100, outputVolume * 200);
  const inputVisualizerHeight = Math.min(100, inputVolume * 200);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 relative">
      {/* Dynamic Island / Header */}
      <div className="bg-slate-800 h-8 flex justify-center items-center relative z-20">
        <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1">
            {isRecording && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 flex flex-col p-6 items-center justify-between relative overflow-hidden z-10">
        
        {/* Background Ambient Effect */}
        {callState === CallState.ACTIVE && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
        )}

        {/* Top Info */}
        <div className="z-10 text-center w-full mt-8">
          {callState === CallState.IDLE && (
            <>
                <div className="text-slate-400 text-sm mb-2">Ready to Call</div>
                <input 
                    type="text" 
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    className="bg-transparent text-4xl text-center font-light w-full focus:outline-none"
                    placeholder="Enter Number"
                />
            </>
          )}

          {(callState === CallState.CONNECTING || callState === CallState.ACTIVE) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-4xl text-slate-800 font-bold">
                    {(activeLeadName || 'Laurent')[0]}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-1">{activeLeadName || 'Unknown'}</h2>
              <p className="text-slate-400 mb-2">{dialNumber}</p>
              
              <div className="h-6 flex items-center justify-center gap-2">
                  {callState === CallState.CONNECTING && <p className="text-sm animate-pulse">Connecting...</p>}
                  {callState === CallState.ACTIVE && <p className="text-sm font-mono text-emerald-400">{formatTime(duration)}</p>}
                  {isRecording && callState === CallState.ACTIVE && (
                      <span className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded text-xs text-red-400 font-medium border border-red-500/30">
                          REC
                      </span>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Visualizer (Active State) */}
        {callState === CallState.ACTIVE && (
            <div className="flex items-end justify-center h-16 space-x-1 z-10 mb-8 w-full">
                 {[...Array(5)].map((_, i) => (
                    <div 
                        key={`in-${i}`}
                        className="w-1.5 bg-emerald-500 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(10, inputVisualizerHeight * (Math.random() + 0.5))}px` }}
                    />
                 ))}
                 <div className="w-4"></div>
                 {[...Array(5)].map((_, i) => (
                    <div 
                        key={`out-${i}`}
                        className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(10, activeVisualizerHeight * (Math.random() + 0.5))}px` }}
                    />
                 ))}
            </div>
        )}

        {/* Keypad (Idle State) */}
        {callState === CallState.IDLE && (
            <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-[280px]">
                {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
                    <button 
                        key={key} 
                        onClick={() => handlePadClick(key)}
                        className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-2xl font-light transition-colors"
                    >
                        {key}
                    </button>
                ))}
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 z-10 w-full mb-8">
            {callState === CallState.IDLE ? (
                 <button 
                    onClick={() => onCallStart(dialNumber)}
                    className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105"
                 >
                    <Phone className="w-8 h-8 text-white" fill="currentColor" />
                 </button>
            ) : (
                <>
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    
                    <button 
                        onClick={onCallEnd}
                        className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
                    >
                        <PhoneOff className="w-8 h-8 text-white" fill="currentColor" />
                    </button>

                    <button 
                        onClick={() => onToggleRecording(!isRecording)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500/20 text-red-500 border-2 border-red-500' : 'bg-slate-800 text-white'}`}
                    >
                        <Disc className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
                    </button>
                </>
            )}
        </div>
      </div>
      
      {/* Mobile Bottom Bar Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full"></div>
    </div>
  );
};

export default Dialer;