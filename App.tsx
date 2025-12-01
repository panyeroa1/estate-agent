import React, { useState, useEffect, useCallback } from 'react';
import Dialer from './components/Dialer';
import CRM from './components/CRM';
import { MOCK_LEADS, MOCK_PROPERTIES } from './constants';
import { Lead, CallState, Recording } from './types';
import { geminiClient } from './services/geminiService';

const App: React.FC = () => {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [audioVols, setAudioVols] = useState<{in: number, out: number}>({in: 0, out: 0});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);

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

  const handleLeadSelect = (lead: Lead) => {
    if (activeLead && activeLead.id === lead.id) {
        // Toggle off if clicking same lead
        setActiveLead(null);
    } else {
        setActiveLead(lead);
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
    if (activeLead && activeLead.id === updatedLead.id) {
        setActiveLead(updatedLead);
    }
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

  const saveRecording = async () => {
    if (isRecording) {
        const url = await geminiClient.stopRecording();
        const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
        
        if (activeLead && url) {
            const newRecording: Recording = {
                id: Date.now().toString(),
                timestamp: recordingStartTime,
                duration: duration,
                url: url,
                outcome: 'connected' // Default to connected for now
            };

            const updatedLeads = leads.map(l => {
                if (l.id === activeLead.id) {
                    return { ...l, recordings: [newRecording, ...l.recordings] };
                }
                return l;
            });
            
            setLeads(updatedLeads);
            // Update active lead ref as well
            setActiveLead(prev => prev ? { ...prev, recordings: [newRecording, ...prev.recordings] } : null);
        }
    }
    setIsRecording(false);
  };

  const handleEndCall = () => {
    if (isRecording) {
        saveRecording(); // This stops recording and saves
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
        saveRecording();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex relative">
      
      {/* Desktop CRM Layout */}
      {!isMobile && (
        <div className="flex-1 h-full">
            <CRM 
                leads={leads} 
                properties={MOCK_PROPERTIES} 
                onSelectLead={handleLeadSelect}
                selectedLeadId={activeLead?.id || null}
                onUpdateLead={handleUpdateLead}
            />
        </div>
      )}

      {/* Phone Overlay / Sidebar */}
      <div className={`
        transition-all duration-500 ease-in-out
        ${isMobile ? 'w-full h-full absolute inset-0 z-50' : 'w-[400px] h-full border-l border-slate-200 bg-slate-50 shadow-xl relative z-40 p-6 flex items-center justify-center'}
      `}>
         {/* Container for the Phone Graphic */}
         <div className={`${isMobile ? 'w-full h-full' : 'w-[340px] h-[700px]'} transition-all`}>
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
            />
         </div>
      </div>

    </div>
  );
};

export default App;