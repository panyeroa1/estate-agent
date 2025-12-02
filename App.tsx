
import React, { useState, useEffect } from 'react';
import Dialer from './components/Dialer';
import CRM from './components/CRM';
import { Lead, CallState, Recording, User, Property } from './types';
import { geminiClient } from './services/geminiService';
import { Download, Save, Trash2, X } from 'lucide-react';
import { db } from './services/db';

interface PendingRec {
  url: string;
  duration: number;
  timestamp: number;
}

const DEFAULT_USER: User = {
  id: 'demo-broker',
  name: 'Laurent De Wilde',
  email: 'laurent@eburon.com',
  role: 'BROKER',
  avatar: 'https://ui-avatars.com/api/?name=Laurent+De+Wilde&background=random'
};

const App: React.FC = () => {
  // Initialize directly with the default user
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_USER);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [audioVols, setAudioVols] = useState<{in: number, out: number}>({in: 0, out: 0});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [pendingRecording, setPendingRecording] = useState<PendingRec | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Bind volume visualizer
    geminiClient.onVolumeChange = (inp, outp) => {
        setAudioVols({ in: inp, out: outp });
    };

    geminiClient.onClose = () => {
        handleEndCall();
    };

    return () => {
        window.removeEventListener('resize', handleResize);
        geminiClient.disconnect();
    };
  }, []);

  // Fetch Data when User Logs In
  useEffect(() => {
    if (currentUser) {
        const fetchData = async () => {
            const [fetchedLeads, fetchedProperties] = await Promise.all([
                db.getLeads(),
                db.getProperties()
            ]);
            setLeads(fetchedLeads);
            setProperties(fetchedProperties);
        };
        fetchData();
    }
  }, [currentUser]);

  const handleLeadSelect = (lead: Lead | null) => {
    setActiveLead(lead);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    // Optimistic Update
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
    if (activeLead && activeLead.id === updatedLead.id) {
        setActiveLead(updatedLead);
    }
    // DB Update
    await db.updateLead(updatedLead);
  };

  const startCall = async (number: string) => {
    setCallState(CallState.CONNECTING);
    try {
        await geminiClient.connect();
        setCallState(CallState.ACTIVE);
    } catch (e) {
        console.error("Failed to connect call", e);
        setCallState(CallState.ERROR);
        setTimeout(() => setCallState(CallState.IDLE), 2000);
    }
  };

  const stopRecordingAndPrompt = async () => {
    const url = await geminiClient.stopRecording();
    const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
    setIsRecording(false);
    
    if (url) {
       setPendingRecording({
           url,
           duration,
           timestamp: recordingStartTime
       });
    }
  };

  const handleEndCall = async () => {
    if (isRecording) {
        await stopRecordingAndPrompt();
    }
    geminiClient.disconnect();
    setCallState(CallState.ENDED);
    setTimeout(() => setCallState(CallState.IDLE), 2000);
  };

  const toggleRecording = (shouldRecord: boolean) => {
    if (shouldRecord) {
        geminiClient.startRecording();
        setRecordingStartTime(Date.now());
        setIsRecording(true);
    } else {
        stopRecordingAndPrompt();
    }
  };

  const handleConfirmSave = () => {
     if (!pendingRecording || !activeLead) return;
     
     const newRecording: Recording = {
        id: Date.now().toString(),
        timestamp: pendingRecording.timestamp,
        duration: pendingRecording.duration,
        url: pendingRecording.url,
        outcome: 'connected'
     };
     
     const updatedLead = {
         ...activeLead,
         recordings: [newRecording, ...activeLead.recordings]
     };

     handleUpdateLead(updatedLead);
     setPendingRecording(null);
  };

  const handleDownloadRecording = () => {
      if (!pendingRecording) return;
      const a = document.createElement('a');
      a.href = pendingRecording.url;
      a.download = `call-recording-${new Date(pendingRecording.timestamp).toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleDiscardRecording = () => {
      setPendingRecording(null);
  };

  const handleLogout = () => {
      // For demo purposes, just reset to default user instead of effectively breaking the app with null
      if (window.confirm("Are you sure you want to sign out? (Demo: This will reset the session)")) {
          setCurrentUser(DEFAULT_USER);
          window.location.reload(); 
      }
  };

  if (!currentUser) {
      return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex relative bg-slate-50">
      
      {/* Desktop CRM Layout */}
      {!isMobile && (
        <div className="flex-1 h-full">
            <CRM 
                leads={leads} 
                properties={properties} 
                onSelectLead={handleLeadSelect}
                selectedLeadId={activeLead?.id || null}
                onUpdateLead={handleUpdateLead}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
        </div>
      )}

      {/* Phone Overlay / Sidebar */}
      {/* We keep the Dialer visible for everyone for now as per "embedded mobile" feature, 
          but in a real app might restrict to Brokers/Owners */}
      <div className={`
        transition-all duration-500 ease-in-out
        ${isMobile ? 'w-full h-full absolute inset-0 z-50' : 'w-[420px] h-full border-l border-slate-200 bg-white shadow-2xl relative z-40 p-8 flex items-center justify-center'}
      `}>
         {/* Container for the Phone Graphic */}
         <div className={`${isMobile ? 'w-full h-full' : 'w-[360px] h-[720px]'} transition-all`}>
            <Dialer 
                callState={callState}
                onCallStart={startCall}
                onCallEnd={handleEndCall}
                activeLeadName={activeLead ? `${activeLead.firstName} ${activeLead.lastName}` : undefined}
                activeLeadPhone={activeLead?.phone}
                inputVolume={audioVols.in}
                outputVolume={audioVols.out}
                onToggleRecording={toggleRecording}
                isRecording={isRecording}
                leads={leads}
                onLeadSelected={(lead) => handleLeadSelect(lead)}
            />
         </div>
      </div>

      {/* Recording Review Modal */}
      {pendingRecording && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-slate-800">Call Recording</h3>
                     <button onClick={handleDiscardRecording} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                 </div>
                 
                 <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                    The call has ended. Would you like to save this recording to the client's file?
                 </p>

                 {/* Audio Player Preview */}
                 <div className="bg-slate-100 rounded-2xl p-4 mb-6 border border-slate-200">
                     <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>{new Date(pendingRecording.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>{Math.floor(pendingRecording.duration / 60)}:{(pendingRecording.duration % 60).toString().padStart(2, '0')}</span>
                     </div>
                     <audio controls src={pendingRecording.url} className="w-full h-8 accent-indigo-600" />
                 </div>

                 <div className="space-y-3">
                    <button 
                        onClick={handleConfirmSave}
                        disabled={!activeLead}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {activeLead ? `Save to ${activeLead.firstName}` : 'Select a Lead to Save'}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleDownloadRecording}
                            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <button 
                            onClick={handleDiscardRecording}
                            className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 text-slate-700 hover:text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Discard
                        </button>
                    </div>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default App;
