import React, { useState } from 'react';
import { Lead, Property } from '../types';
import { 
  User, Phone, Mail, Clock, MapPin, DollarSign, Home, CheckCircle, 
  ChevronRight, Search, Play, Pause, X, Send, PhoneIncoming, 
  PhoneMissed, Voicemail, LayoutDashboard, Calendar, FileText, 
  PieChart, Settings, Inbox, Briefcase, Megaphone, Receipt
} from 'lucide-react';

interface CRMProps {
  leads: Lead[];
  properties: Property[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  onUpdateLead: (lead: Lead) => void;
}

type TabType = 'dashboard' | 'leads' | 'properties' | 'inbox' | 'calendar' | 'documents' | 'finance' | 'marketing' | 'analytics' | 'settings';

const CRM: React.FC<CRMProps> = ({ leads, properties, onSelectLead, selectedLeadId, onUpdateLead }) => {
  const [tab, setTab] = useState<TabType>('leads');
  const [noteInput, setNoteInput] = useState('');
  
  const activeLead = leads.find(l => l.id === selectedLeadId);

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeLead) return;
    
    const timestamp = new Date().toLocaleString();
    const newNoteEntry = `[${timestamp}] Call Note: ${noteInput.trim()}`;
    const updatedNotes = activeLead.notes 
        ? `${activeLead.notes}\n\n${newNoteEntry}` 
        : newNoteEntry;

    const updatedLead = { ...activeLead, notes: updatedNotes };
    onUpdateLead(updatedLead);
    setNoteInput('');
  };

  const getStatusIcon = (outcome: 'connected' | 'missed' | 'voicemail') => {
      switch(outcome) {
          case 'connected': return <PhoneIncoming className="w-4 h-4 text-emerald-500" />;
          case 'missed': return <PhoneMissed className="w-4 h-4 text-red-500" />;
          case 'voicemail': return <Voicemail className="w-4 h-4 text-amber-500" />;
          default: return <Phone className="w-4 h-4 text-slate-400" />;
      }
  };

  const getStatusLabel = (outcome: string) => {
      return outcome.charAt(0).toUpperCase() + outcome.slice(1);
  };

  const NavItem = ({ id, label, icon: Icon, badge }: { id: TabType, label: string, icon: any, badge?: string }) => (
    <button 
        onClick={() => setTab(id)}
        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors mb-0.5 ${tab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
    >
        <Icon className="w-4 h-4" /> 
        <span className="flex-1">{label}</span>
        {badge && <span className="bg-indigo-100 text-indigo-600 text-xs py-0.5 px-2 rounded-full">{badge}</span>}
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-3 mt-6 mb-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );

  const PlaceholderView = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Icon className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">{title} Module</h3>
        <p className="max-w-md mx-auto">This module is currently under development. Integrated tools for {title.toLowerCase()} management will appear here.</p>
        <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Configure Integration
        </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* CRM Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">E</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Eburon Estate</h1>
        </div>
        <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search leads, properties, docs..." 
                    className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all hover:bg-slate-200 focus:bg-white"
                />
             </div>
             <button className="p-2 text-slate-400 hover:text-slate-600">
                <Settings className="w-5 h-5" />
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 cursor-pointer">
                <img src="https://picsum.photos/100/100" alt="Agent" />
             </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Nav */}
        <nav className="w-64 bg-white border-r border-slate-200 flex flex-col pt-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0">
            <div className="px-3">
                <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            </div>

            <SectionHeader label="Business" />
            <div className="px-3">
                <NavItem id="leads" label="Leads" icon={User} badge="4" />
                <NavItem id="properties" label="Properties" icon={Home} />
                <NavItem id="inbox" label="Inbox" icon={Inbox} badge="12" />
                <NavItem id="calendar" label="Calendar" icon={Calendar} />
            </div>

            <SectionHeader label="Management" />
            <div className="px-3">
                <NavItem id="documents" label="Documents" icon={FileText} />
                <NavItem id="finance" label="Finance" icon={Receipt} />
                <NavItem id="marketing" label="Marketing" icon={Megaphone} />
            </div>

            <SectionHeader label="Insights" />
            <div className="px-3">
                <NavItem id="analytics" label="Analytics" icon={PieChart} />
                <NavItem id="settings" label="Settings" icon={Settings} />
            </div>
            
            <div className="mt-auto p-4 border-t border-slate-100">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-500/20">
                    <p className="text-xs font-medium opacity-80 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Total Commission</p>
                    <p className="text-2xl font-bold">€ 42,500</p>
                    <div className="w-full bg-white/20 h-1 rounded-full mt-2 mb-1">
                        <div className="bg-white h-full rounded-full w-[70%]"></div>
                    </div>
                    <p className="text-xs opacity-80 flex justify-between">
                        <span>Goal: €60k</span>
                        <span>70%</span>
                    </p>
                </div>
            </div>
        </nav>

        {/* Content View */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/50">
            {/* List / Main View */}
            <div className={`flex-1 overflow-y-auto no-scrollbar p-8 ${activeLead ? 'hidden xl:block' : ''}`}>
                <div className="max-w-6xl mx-auto h-full">
                    {tab === 'dashboard' && <PlaceholderView title="Dashboard" icon={LayoutDashboard} />}
                    {tab === 'inbox' && <PlaceholderView title="Inbox" icon={Inbox} />}
                    {tab === 'calendar' && <PlaceholderView title="Calendar" icon={Calendar} />}
                    {tab === 'documents' && <PlaceholderView title="Documents" icon={FileText} />}
                    {tab === 'finance' && <PlaceholderView title="Finance" icon={Receipt} />}
                    {tab === 'marketing' && <PlaceholderView title="Marketing" icon={Megaphone} />}
                    {tab === 'analytics' && <PlaceholderView title="Analytics" icon={PieChart} />}
                    {tab === 'settings' && <PlaceholderView title="Settings" icon={Settings} />}

                    {tab === 'leads' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Leads</h2>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                                    + Add New Lead
                                </button>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Interest</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                                            <th className="px-6 py-4 hidden lg:table-cell">Last Activity</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leads.map((lead) => (
                                            <tr 
                                                key={lead.id} 
                                                onClick={() => onSelectLead(lead)}
                                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLeadId === lead.id ? 'bg-indigo-50/60' : ''}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{lead.firstName} {lead.lastName}</div>
                                                        <div className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {lead.phone}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                        ${lead.interest === 'Buying' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                          lead.interest === 'Selling' ? 'bg-green-50 text-green-700 border-green-100' :
                                                          lead.interest === 'Renting' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                        {lead.interest}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{lead.status}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3" /> {lead.lastActivity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {tab === 'properties' && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                                    + Add Property
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map(prop => (
                                    <div key={prop.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                        <div className="h-48 bg-slate-200 relative overflow-hidden">
                                            <img src={prop.image} alt="Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800 shadow-sm">
                                                {prop.status}
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-sm font-medium">View Details</span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="text-lg font-bold text-slate-900">{prop.price}</div>
                                            <div className="text-slate-600 text-sm mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> {prop.address}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
                                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><Home className="w-3 h-3"/> {prop.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detail Pane (Right Side) */}
            {activeLead && (
                <div className="w-full xl:w-1/3 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto z-20 xl:relative absolute inset-0 xl:inset-auto animate-in slide-in-from-right duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-indigo-500"/>
                                Lead Details
                            </h3>
                            <button onClick={() => onSelectLead(activeLead)} className="p-2 hover:bg-slate-100 rounded-full xl:hidden">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-inner">
                                {activeLead.firstName[0]}{activeLead.lastName[0]}
                             </div>
                             <div>
                                <h2 className="text-xl font-bold text-slate-900">{activeLead.firstName} {activeLead.lastName}</h2>
                                <p className="text-slate-500 flex items-center gap-1 text-sm"><Mail className="w-3 h-3" /> {activeLead.email}</p>
                                <p className="text-slate-500 flex items-center gap-1 text-sm"><Phone className="w-3 h-3" /> {activeLead.phone}</p>
                             </div>
                        </div>

                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-2">
                                <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100">
                                    <Phone className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Call</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
                                    <Mail className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Email</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100">
                                    <Calendar className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Meet</span>
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Lead Status</h4>
                                <div className="flex items-center gap-3">
                                     <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{activeLead.status}</span>
                                     <span className="text-slate-300">|</span>
                                     <span className="text-slate-600 text-sm font-medium">{activeLead.interest}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Notes</h4>
                                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {activeLead.notes}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center justify-between">
                                    Call Recordings 
                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{activeLead.recordings.length}</span>
                                </h4>
                                {activeLead.recordings.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-6">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <PhoneMissed className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400">No calls recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-6">
                                        {activeLead.recordings.map((rec) => (
                                            <div key={rec.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm hover:border-indigo-200 transition-colors group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-slate-50 rounded-full">
                                                            {getStatusIcon(rec.outcome)}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-700">
                                                                {getStatusLabel(rec.outcome)} Call
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">
                                                                {new Date(rec.timestamp).toLocaleDateString()} • {new Date(rec.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                                        {Math.floor(rec.duration / 60)}:{(rec.duration % 60).toString().padStart(2, '0')}
                                                    </div>
                                                </div>
                                                <audio controls src={rec.url} className="w-full h-8 opacity-75 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Note Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Log Activity</h4>
                                <div className="relative">
                                    <textarea
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        placeholder="Add a note about this lead..."
                                        className="w-full p-3 pr-12 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[80px] resize-none"
                                    />
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={!noteInput.trim()}
                                        className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CRM;