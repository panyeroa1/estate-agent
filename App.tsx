
import React, { useState, useEffect } from 'react';
import Dialer from './components/Dialer';
import CRM from './components/CRM';
import { Lead, CallState, Recording, User, Property, AgentPersona, UserRole, Task } from './types';
import { geminiClient } from './services/geminiService';
import { Download, Save, Trash2, X, AlertCircle } from 'lucide-react';
import { db } from './services/db';
import { DEFAULT_AGENT_PERSONA, generateSystemPrompt } from './constants';

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
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_USER);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [audioVols, setAudioVols] = useState<{in: number, out: number}>({in: 0, out: 0});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [pendingRecording, setPendingRecording] = useState<PendingRec | null>(null);
  const [recordingOutcome, setRecordingOutcome] = useState<'connected' | 'missed' | 'voicemail' | 'follow_up' | 'closed'>('connected');
  
  // Agent Config State
  const [agentPersona, setAgentPersona] = useState<AgentPersona>(DEFAULT_AGENT_PERSONA);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
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

  useEffect(() => {
    if (currentUser) {
        const fetchData = async () => {
            const [fetchedLeads, fetchedProperties, fetchedTasks] = await Promise.all([
                db.getLeads(),
                db.getProperties(),
                db.getTasks()
            ]);
            setLeads(fetchedLeads);
            setProperties(fetchedProperties);
            setTasks(fetchedTasks);
        };
        fetchData();
    }
  }, [currentUser]);

  const handleLeadSelect = (lead: Lead | null) => {
    setActiveLead(lead);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l));
    if (activeLead && activeLead.id === updatedLead.id) {
        setActiveLead(updatedLead);
    }
    await db.updateLead(updatedLead);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      await db.updateTask(updatedTask);
  };

  // Switch User (Demo Feature)
  const handleSwitchUser = (role: UserRole) => {
      const demoPersonas: Record<UserRole, {name: string, email: string}> = {
          BROKER: { name: 'Laurent De Wilde', email: 'laurent@eburon.com' },
          OWNER: { name: 'Marc Peeters', email: 'marc.peeters@telenet.be' },
          RENTER: { name: 'Sophie Dubois', email: 'sophie.d@example.com' },
          CONTRACTOR: { name: 'Johan Smet', email: 'johan.smet@fixit.be' }
      };

      const persona = demoPersonas[role];
      const newUser: User = {
          id: `demo-${role.toLowerCase()}`,
          name: persona.name,
          email: persona.email,
          role: role,
          avatar: `https://ui-avatars.com/api/?name=${persona.name.replace(' ', '+')}&background=random`
      };
      
      setCurrentUser(newUser);
      setActiveLead(null); // Clear selection when switching
  };

  const startCall = async (number: string) => {
    setCallState(CallState.CONNECTING);
    try {
        // Generate prompt based on current persona config
        const dynamicInstruction = generateSystemPrompt(agentPersona);
        
        await geminiClient.connect(dynamicInstruction);
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
       setRecordingOutcome('connected'); // Default outcome
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

  const handleConfirmSave = async () => {
     if (!pendingRecording || !activeLead) return;
     
     const newRecording: Recording = {
        id: Date.now().toString(),
        timestamp: pendingRecording.timestamp,
        duration: pendingRecording.duration,
        url: pendingRecording.url,
        outcome: recordingOutcome
     };
     
     const updatedLead = {
         ...activeLead,
         recordings: [newRecording, ...activeLead.recordings]
     };

     await handleUpdateLead(updatedLead);

     // Automated Action: Create Task if 'Follow up needed'
     if (recordingOutcome === 'follow_up') {
         const newTask: Task = {
             id: `task-${Date.now()}`,
             title: `Follow up with ${activeLead.firstName} ${activeLead.lastName}`,
             dueDate: new Date(Date.now() + 86400000).toISOString(), // +24 hours
             completed: false,
             leadId: activeLead.id,
             leadName: `${activeLead.firstName} ${activeLead.lastName}`,
             priority: 'MEDIUM'
         };
         await db.createTask(newTask);
         setTasks(prev => [...prev, newTask]);
         alert("Follow-up task created automatically for tomorrow.");
     }

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
                agentPersona={agentPersona}
                onUpdateAgentPersona={setAgentPersona}
                onSwitchUser={handleSwitchUser}
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
            />
        </div>
      )}

      {/* Phone Overlay */}
      <div className={`
        transition-all duration-500 ease-in-out
        ${isMobile ? 'w-full h-full absolute inset-0 z-50' : 'w-[420px] h-full border-l border-slate-200 bg-white shadow-2xl relative z-40 p-8 flex items-center justify-center'}
      `}>
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
                    The call has ended. Please categorize the outcome and save the recording.
                 </p>

                 <div className="bg-slate-100 rounded-2xl p-4 mb-6 border border-slate-200">
                     <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>{new Date(pendingRecording.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>{Math.floor(pendingRecording.duration / 60)}:{(pendingRecording.duration % 60).toString().padStart(2, '0')}</span>
                     </div>
                     <audio controls src={pendingRecording.url} className="w-full h-8 accent-indigo-600" />
                 </div>

                 {/* Outcome Selector */}
                 <div className="mb-6">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Call Outcome</label>
                     <div className="grid grid-cols-2 gap-2">
                         {(['connected', 'voicemail', 'missed', 'follow_up', 'closed'] as const).map(outcome => (
                             <button
                                key={outcome}
                                onClick={() => setRecordingOutcome(outcome)}
                                className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all ${
                                    recordingOutcome === outcome 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                             >
                                 {outcome.replace('_', ' ').charAt(0).toUpperCase() + outcome.replace('_', ' ').slice(1)}
                             </button>
                         ))}
                     </div>
                     {recordingOutcome === 'follow_up' && (
                         <div className="mt-2 flex items-start gap-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                             <AlertCircle className="w-4 h-4 shrink-0" />
                             <span>A task will be automatically created for tomorrow.</span>
                         </div>
                     )}
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
