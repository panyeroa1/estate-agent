
import React, { useState, useEffect } from 'react';
import { Lead, Property, User, Ticket, Invoice, AgentPersona, UserRole, Document, Task } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_DOCUMENTS, MOCK_EMAILS, MOCK_CAMPAIGNS } from '../constants';
import { db } from '../services/db';
import { 
  User as UserIcon, Phone, Mail, Clock, MapPin, DollarSign, Home, CheckCircle, 
  ChevronRight, Search, Play, Pause, X, Send, PhoneIncoming, 
  PhoneMissed, Voicemail, LayoutDashboard, Calendar as CalendarIcon, FileText, 
  PieChart, Settings, Inbox as InboxIcon, Briefcase, Megaphone, Receipt,
  Menu, ChevronLeft, ChevronDown, Wrench, HardHat, Bell, LogOut, Shield,
  Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, AlertCircle, File, Image as ImageIcon,
  MessageSquare, BarChart3, Target, Bot, Users, CheckSquare, CalendarDays
} from 'lucide-react';

interface CRMProps {
  leads: Lead[];
  properties: Property[];
  onSelectLead: (lead: Lead | null) => void;
  selectedLeadId: string | null;
  onUpdateLead: (lead: Lead) => void;
  currentUser: User;
  onLogout: () => void;
  agentPersona: AgentPersona;
  onUpdateAgentPersona: (persona: AgentPersona) => void;
  onSwitchUser: (role: UserRole) => void;
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

type TabType = 'dashboard' | 'leads' | 'properties' | 'notifications' | 'calendar' | 'documents' | 'finance' | 'marketing' | 'analytics' | 'settings' | 'maintenance' | 'requests' | 'my-home' | 'jobs' | 'schedule' | 'invoices' | 'agent-config' | 'inbox' | 'tasks';

const CRM: React.FC<CRMProps> = ({ 
    leads, properties, onSelectLead, selectedLeadId, onUpdateLead, currentUser, onLogout,
    agentPersona, onUpdateAgentPersona, onSwitchUser, tasks, onUpdateTask
}) => {
  const [tab, setTab] = useState<TabType>('dashboard');
  const [noteInput, setNoteInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterTicketStatus, setFilterTicketStatus] = useState<'ALL' | 'OPEN' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Reset to dashboard when user changes to prevent dead tabs
    setTab('dashboard');
  }, [currentUser.role]);

  useEffect(() => {
    const loadData = async () => {
        const t = await db.getTickets();
        setTickets(t);
        setInvoices([
            { id: '1', amount: 1200, status: 'PAID', date: '2023-09-01', description: 'Monthly Rent', propertyAddress: 'Kouter 12' },
            { id: '2', amount: 240, status: 'PENDING', date: '2023-09-15', description: 'Plumbing Repair', propertyAddress: 'Meir 24' }
        ]);
    };
    loadData();
  }, [currentUser]);

  const activeLead = leads.find(l => l.id === selectedLeadId);
  const notifications = MOCK_NOTIFICATIONS[currentUser.role] || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeLead) return;
    const timestamp = new Date().toLocaleString();
    const newNoteEntry = `[${timestamp}] Call Note: ${noteInput.trim()}`;
    const updatedNotes = activeLead.notes ? `${activeLead.notes}\n\n${newNoteEntry}` : newNoteEntry;
    const updatedLead = { ...activeLead, notes: updatedNotes };
    onUpdateLead(updatedLead);
    setNoteInput('');
  };

  const getStatusIcon = (outcome: string) => {
      switch(outcome) {
          case 'connected': return <PhoneIncoming className="w-4 h-4 text-emerald-500" />;
          case 'missed': return <PhoneMissed className="w-4 h-4 text-red-500" />;
          case 'voicemail': return <Voicemail className="w-4 h-4 text-amber-500" />;
          case 'follow_up': return <CalendarDays className="w-4 h-4 text-indigo-500" />;
          default: return <Phone className="w-4 h-4 text-slate-400" />;
      }
  };

  const NavItem = ({ id, label, icon: Icon, badge }: { id: TabType, label: string, icon: any, badge?: string }) => (
    <button 
        onClick={() => setTab(id)}
        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
          tab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
        title={isSidebarCollapsed ? label : undefined}
    >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${tab === id && isSidebarCollapsed ? 'scale-110' : ''}`} /> 
        <span className={`flex-1 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
          {label}
        </span>
        {badge && !isSidebarCollapsed && (
          <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold py-0.5 px-2 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <div className={`px-4 mt-6 mb-2 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 mt-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );

  // --- TAB VIEWS ---

  const DashboardView = () => (
      <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome back, {currentUser.name.split(' ')[0]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                  { label: currentUser.role === 'BROKER' ? 'Revenue' : 'Balance', val: '€42.5k', change: '+12%', icon: DollarSign, color: 'bg-indigo-500' },
                  { label: 'Pending Tasks', val: pendingTasks, change: 'Keep it up', icon: CheckSquare, color: 'bg-amber-500' },
                  { label: 'Messages', val: '12', change: 'New', icon: Mail, color: 'bg-blue-500' },
                  { label: 'Rating', val: '4.9', change: '+0.1', icon: CheckCircle, color: 'bg-emerald-500' }
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
                          <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'} flex items-center mt-1`}>
                              {stat.change} this month
                          </span>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-indigo-100`}>
                          <stat.icon className="w-5 h-5" />
                      </div>
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks Summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800">Upcoming Tasks</h3>
                      <button onClick={() => setTab('tasks')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                      {tasks.filter(t => !t.completed).slice(0, 4).map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                              <button 
                                onClick={() => onUpdateTask({...task, completed: true})}
                                className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center hover:border-indigo-500 hover:bg-white transition-colors"
                              >
                                  <div className="w-0 h-0" />
                              </button>
                              <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span className="text-xs text-slate-500">
                                          {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                      {task.leadName && (
                                          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded ml-1">
                                              {task.leadName}
                                          </span>
                                      )}
                                  </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                  task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                  {task.priority}
                              </span>
                          </div>
                      ))}
                      {tasks.filter(t => !t.completed).length === 0 && (
                          <div className="text-center py-6 text-slate-400 text-sm">All caught up!</div>
                      )}
                  </div>
              </div>

               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Urgent Actions</h3>
                  <div className="space-y-3">
                      {tickets.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').map(t => (
                          <div key={t.id} className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                              <div>
                                  <p className="text-sm font-bold text-red-900">{t.title}</p>
                                  <p className="text-xs text-red-700">{t.propertyAddress}</p>
                              </div>
                              <button className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded-lg shadow-sm">View</button>
                          </div>
                      ))}
                      {tickets.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">No urgent issues</div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const TasksView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
                   <p className="text-slate-500 text-sm">Follow-ups and to-dos</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> New Task
              </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
              {tasks.map(task => (
                  <div key={task.id} className={`p-4 rounded-xl border transition-all ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                      <div className="flex items-start gap-4">
                          <button 
                            onClick={() => onUpdateTask({...task, completed: !task.completed})}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-0.5 ${
                                task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                              {task.completed && <CheckCircle className="w-4 h-4" />}
                          </button>
                          
                          <div className="flex-1">
                              <h3 className={`font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                  {task.title}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                      <CalendarIcon className="w-3.5 h-3.5" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                  
                                  {task.leadName && (
                                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-medium">
                                          <UserIcon className="w-3 h-3" />
                                          {task.leadName}
                                      </div>
                                  )}
                                  
                                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                      task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 
                                      task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                      {task.priority}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const DocumentsView = () => {
      // Role-based filtering of documents
      const accessibleDocs = MOCK_DOCUMENTS.filter(d => d.sharedWith.includes(currentUser.role));
      
      const categories = ['All Files', 'Contracts', 'Invoices', 'Plans', 'Reports'];
      const [activeCategory, setActiveCategory] = useState('All Files');

      const filteredDocs = activeCategory === 'All Files' 
          ? accessibleDocs 
          : accessibleDocs.filter(d => d.category === activeCategory);

      return (
          <div className="animate-in fade-in duration-500 h-full flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                   <div>
                        <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
                        <p className="text-slate-500 text-sm">Secure file management system</p>
                   </div>
                   <div className="flex gap-3">
                        <div className="relative">
                             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                             <input type="text" placeholder="Search files..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"/>
                        </div>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-indigo-700 shadow-sm transition-all hover:scale-105 active:scale-95">
                            <Plus className="w-4 h-4" /> Upload
                        </button>
                   </div>
              </div>

              {/* Storage Stats Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                          <PieChart className="w-5 h-5"/>
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-700">Storage Usage</p>
                          <p className="text-xs text-slate-500">45.2 GB of 100 GB used</p>
                      </div>
                  </div>
                  <div className="flex-1 max-w-md ml-4 mr-4">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[45%] rounded-full"></div>
                      </div>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Upgrade Plan</button>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {categories.map(cat => (
                      <button 
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                              activeCategory === cat 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-y-auto pb-10">
                  {filteredDocs.map((doc) => (
                      <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
                           
                           <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${
                                    doc.type === 'PDF' ? 'bg-red-50 text-red-600' :
                                    doc.type === 'XLS' ? 'bg-emerald-50 text-emerald-600' :
                                    doc.type === 'IMG' ? 'bg-purple-50 text-purple-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {doc.type === 'IMG' ? <ImageIcon className="w-6 h-6"/> : <FileText className="w-6 h-6"/>}
                                </div>
                                <button className="text-slate-300 hover:text-indigo-600">
                                    <div className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center">•••</div>
                                </button>
                           </div>

                           <h3 className="text-sm font-bold text-slate-800 mb-1 truncate" title={doc.name}>{doc.name}</h3>
                           <p className="text-xs text-slate-400 mb-4">{doc.date}</p>

                           <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                               <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{doc.size}</span>
                               <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                   Download <Download className="w-3 h-3"/>
                               </span>
                           </div>
                      </div>
                  ))}
                  {filteredDocs.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                          <File className="w-12 h-12 mb-3 text-slate-200"/>
                          <p>No documents found in this category.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const InboxView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Inbox</h2>
                   <p className="text-slate-500 text-sm">Unified messaging (Email, WhatsApp)</p>
              </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex">
              {/* Message List */}
              <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col">
                   <div className="p-4 border-b border-slate-100">
                       <input type="text" placeholder="Search messages..." className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"/>
                   </div>
                   <div className="overflow-y-auto flex-1">
                       {MOCK_EMAILS.map(email => (
                           <div key={email.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!email.read ? 'bg-indigo-50/30' : ''}`}>
                               <div className="flex justify-between items-start mb-1">
                                   <div className="flex items-center gap-2">
                                        {email.source === 'WHATSAPP' ? (
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white"><MessageSquare className="w-3 h-3"/></div>
                                        ) : (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Mail className="w-3 h-3"/></div>
                                        )}
                                        <span className={`text-sm font-bold ${!email.read ? 'text-slate-900' : 'text-slate-600'}`}>{email.from}</span>
                                   </div>
                                   <span className="text-xs text-slate-400">{email.date}</span>
                               </div>
                               <div className={`text-sm mb-1 ${!email.read ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{email.subject}</div>
                               <div className="text-xs text-slate-500 truncate">{email.preview}</div>
                           </div>
                       ))}
                   </div>
              </div>
              {/* Message Content Placeholder */}
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <InboxIcon className="w-8 h-8 text-slate-300"/>
                  </div>
                  <p className="text-sm font-medium">Select a message to view conversation</p>
              </div>
          </div>
      </div>
  );

  const AgentConfigView = () => (
      <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Agent Configuration</h2>
              <p className="text-slate-500 text-sm">Customize your AI broker persona</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-start gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                      <Bot className="w-12 h-12 text-white"/>
                  </div>
                  <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Agent Name</label>
                      <input 
                        type="text" 
                        value={agentPersona.name}
                        onChange={(e) => onUpdateAgentPersona({...agentPersona, name: e.target.value})}
                        className="w-full text-xl font-bold text-slate-900 border-b-2 border-slate-100 focus:border-indigo-600 outline-none py-1 bg-transparent transition-colors"
                      />
                      <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</label>
                              <input 
                                type="text" 
                                value={agentPersona.role}
                                onChange={(e) => onUpdateAgentPersona({...agentPersona, role: e.target.value})}
                                className="w-full text-sm font-medium text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-transparent focus:bg-white focus:border-indigo-200 outline-none"
                              />
                          </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tone</label>
                              <input 
                                type="text" 
                                value={agentPersona.tone}
                                onChange={(e) => onUpdateAgentPersona({...agentPersona, tone: e.target.value})}
                                className="w-full text-sm font-medium text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-transparent focus:bg-white focus:border-indigo-200 outline-none"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Language & Style</label>
                  <textarea 
                    value={agentPersona.languageStyle}
                    onChange={(e) => onUpdateAgentPersona({...agentPersona, languageStyle: e.target.value})}
                    className="w-full h-24 p-4 text-sm bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-200 outline-none resize-none"
                  />
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Objectives</label>
                  <div className="space-y-2">
                      {agentPersona.objectives.map((obj, i) => (
                          <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                              <input 
                                type="text" 
                                value={obj}
                                onChange={(e) => {
                                    const newObjs = [...agentPersona.objectives];
                                    newObjs[i] = e.target.value;
                                    onUpdateAgentPersona({...agentPersona, objectives: newObjs});
                                }}
                                className="flex-1 text-sm text-slate-600 bg-transparent border-b border-slate-100 focus:border-indigo-300 outline-none py-1"
                              />
                          </div>
                      ))}
                  </div>
              </div>

              <div className="mt-8 flex justify-end">
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-transform active:scale-95">
                      Save Configuration
                  </button>
              </div>
          </div>
      </div>
  );

  const MarketingView = () => (
      <div className="animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Marketing</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {MOCK_CAMPAIGNS.map(camp => (
                   <div key={camp.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                               camp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                               {camp.status}
                           </span>
                           <span className="text-xs font-bold text-slate-400">{camp.platform}</span>
                       </div>
                       <h3 className="font-bold text-slate-900 mb-6">{camp.name}</h3>
                       <div className="flex justify-between items-end">
                           <div>
                               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Clicks</p>
                               <p className="text-xl font-bold text-slate-800">{camp.clicks}</p>
                           </div>
                            <div>
                               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Spend</p>
                               <p className="text-xl font-bold text-slate-800">{camp.spend}</p>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
      </div>
  );

  const AnalyticsView = () => (
      <div className="animate-in fade-in duration-500">
           <h2 className="text-2xl font-bold text-slate-800 mb-6">Analytics</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                   <BarChart3 className="w-16 h-16 text-indigo-100 mb-4"/>
                   <h3 className="text-lg font-bold text-slate-700">Performance Metrics</h3>
                   <p className="text-slate-400 text-sm">Interactive charts coming soon</p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                   <Target className="w-16 h-16 text-indigo-100 mb-4"/>
                   <h3 className="text-lg font-bold text-slate-700">Conversion Goals</h3>
                   <p className="text-slate-400 text-sm">Goal tracking visualization</p>
               </div>
           </div>
      </div>
  );

  // Reuse Maintenance, Finance, Notifications from previous...
  const MaintenanceView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Maintenance Tickets</h2>
                <p className="text-slate-500 text-sm">Track repairs and requests</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> New Ticket
              </button>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['ALL', 'OPEN', 'SCHEDULED', 'COMPLETED'] as const).map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterTicketStatus(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        filterTicketStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                      {status}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
              {tickets.filter(t => filterTicketStatus === 'ALL' || t.status === filterTicketStatus).map(ticket => (
                  <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                              ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                              {ticket.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{ticket.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{ticket.propertyAddress}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${
                              ticket.status === 'COMPLETED' ? 'text-emerald-600' : 'text-indigo-600'
                          }`}>
                              {ticket.status === 'COMPLETED' ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                              {ticket.status}
                          </div>
                          <button className="text-slate-400 hover:text-indigo-600 text-xs font-medium">Details &rarr;</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const FinanceView = () => (
      <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Financial Overview</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <h3 className="font-bold text-slate-800 mb-4">Invoices & Payments</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                          <tr>
                              <th className="px-4 py-3">Invoice ID</th>
                              <th className="px-4 py-3">Property</th>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {invoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-mono text-slate-500">#{inv.id}</td>
                                  <td className="px-4 py-3 text-slate-800 font-medium">{inv.propertyAddress}</td>
                                  <td className="px-4 py-3 text-slate-600">{inv.description}</td>
                                  <td className="px-4 py-3 text-slate-500">{inv.date}</td>
                                  <td className="px-4 py-3 font-bold text-slate-900">€{inv.amount}</td>
                                  <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                      }`}>
                                          {inv.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );

  const CalendarView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    
    const emptySlots = Array.from({ length: firstDayOfMonth });
    const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };
    
    const isToday = (d: number) => {
        const today = new Date();
        return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    return (
      <div className="animate-in fade-in duration-500 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
              <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 border rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold border rounded-lg hover:bg-slate-50">Today</button>
                  <button onClick={nextMonth} className="p-2 border rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
              </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden flex-1">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase flex items-center justify-center">{d}</div>
               ))}
               
               {emptySlots.map((_, i) => (
                   <div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]"></div>
               ))}

               {daySlots.map((day) => {
                  const dateStr = new Date(year, month, day).toDateString();
                  const dayTasks = tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === dateStr);

                  return (
                      <div key={day} className={`bg-white p-2 min-h-[80px] hover:bg-slate-50 transition-colors relative flex flex-col gap-1 ${isToday(day) ? 'bg-indigo-50/30' : ''}`}>
                          <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                              {day}
                          </span>
                          
                          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] no-scrollbar">
                              {dayTasks.map(t => (
                                  <div key={t.id} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded truncate border border-indigo-200" title={t.title}>
                                      {t.title}
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
               })}
          </div>
      </div>
    );
};


  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* CRM Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-30 h-16 shadow-sm relative">
        <div className="flex items-center gap-3 md:gap-4 transition-all duration-300" style={{ width: isSidebarCollapsed ? '60px' : '240px' }}>
             <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors hidden lg:block"
             >
                <Menu className="w-5 h-5" />
             </button>
            <div className={`flex items-center gap-2 overflow-hidden transition-opacity duration-300 ${isSidebarCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 shrink-0">E</div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Eburon</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
             {/* Notification Bell */}
             <div className="relative">
                 <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                 >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                 </button>
                 {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        {/* Notifications Content Reused */}
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</h4>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-sm font-semibold">{n.title}</p>
                                    <p className="text-xs text-slate-500">{n.message}</p>
                                </div>
                            )) : <div className="p-4 text-center text-xs">No notifications</div>}
                        </div>
                    </div>
                 )}
             </div>

             <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full pr-3 border border-transparent hover:border-slate-200 transition-all group relative">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`} alt="User" />
                </div>
                <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-slate-700 leading-none">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                
                {/* User Dropdown with Role Switcher */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Profile (Demo)</p>
                    </div>
                    {(['BROKER', 'OWNER', 'RENTER', 'CONTRACTOR'] as UserRole[]).map(r => (
                        <button 
                            key={r}
                            onClick={() => onSwitchUser(r)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${currentUser.role === r ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
                        >
                            <Users className="w-3 h-3"/> {r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1">
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Reset / Sign out
                        </button>
                    </div>
                </div>
             </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Nav */}
        <nav 
            className={`bg-white border-r border-slate-200 flex flex-col pt-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0 transition-all duration-300 ease-in-out`}
            style={{ width: isSidebarCollapsed ? '80px' : '260px' }}
        >
             {currentUser.role === 'BROKER' && (
                <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3"><NavItem id="inbox" label="Inbox" icon={InboxIcon} /></div>
                    <SectionHeader label="Business" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="leads" label="Leads" icon={UserIcon} badge={leads.length.toString()} />
                        <NavItem id="properties" label="Properties" icon={Home} />
                        <NavItem id="tasks" label="Tasks" icon={CheckSquare} badge={pendingTasks > 0 ? pendingTasks.toString() : undefined} />
                        <NavItem id="calendar" label="Calendar" icon={CalendarIcon} />
                        <NavItem id="maintenance" label="Maintenance" icon={Wrench} badge={tickets.filter(t=>t.status==='OPEN').length.toString()} />
                    </div>
                    <SectionHeader label="Management" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="documents" label="Documents" icon={FileText} />
                        <NavItem id="finance" label="Finance" icon={Receipt} />
                        <NavItem id="marketing" label="Marketing" icon={Megaphone} />
                        <NavItem id="analytics" label="Analytics" icon={PieChart} />
                    </div>
                    <div className="px-3 mt-4"><NavItem id="agent-config" label="Agent Config" icon={Bot} /></div>
                </>
             )}
             
             {currentUser.role === 'OWNER' && (
                <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="properties" label="My Properties" icon={Home} />
                        <NavItem id="finance" label="Financials" icon={DollarSign} />
                        <NavItem id="documents" label="Documents" icon={FileText} />
                        <NavItem id="maintenance" label="Requests" icon={CheckCircle} />
                    </div>
                </>
             )}

             {currentUser.role === 'RENTER' && (
                 <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="my-home" label="My Home" icon={Home} />
                        <NavItem id="maintenance" label="Report Issue" icon={Wrench} />
                        <NavItem id="documents" label="Documents" icon={FileText} />
                    </div>
                 </>
             )}

             {currentUser.role === 'CONTRACTOR' && (
                 <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="jobs" label="Jobs" icon={Briefcase} badge={tickets.filter(t=>t.status==='SCHEDULED').length.toString()} />
                        <NavItem id="schedule" label="Schedule" icon={CalendarIcon} />
                        <NavItem id="documents" label="Documents" icon={FileText} />
                    </div>
                 </>
             )}
            
            {/* Sidebar Footer */}
            <div className="mt-auto p-4 border-t border-slate-100">
                 <div className={`bg-slate-100 rounded-xl p-4 text-slate-600 transition-all duration-300 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                     <div className="flex items-center gap-3 justify-center">
                         <Shield className="w-5 h-5 text-indigo-500"/>
                         {!isSidebarCollapsed && <div className="text-xs font-medium">Eburon Secure</div>}
                     </div>
                </div>
            </div>
        </nav>

        {/* Content View Container */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/50 relative">
            
            {/* List / Main View */}
            <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar p-4 md:p-8 transition-all duration-300 ${activeLead && currentUser.role === 'BROKER' && tab === 'leads' ? 'hidden lg:block' : 'block'}`}>
                <div className="max-w-7xl mx-auto h-full">
                    {tab === 'dashboard' && <DashboardView />}
                    {tab === 'inbox' && <InboxView />}
                    {tab === 'agent-config' && <AgentConfigView />}
                    {tab === 'marketing' && <MarketingView />}
                    {tab === 'analytics' && <AnalyticsView />}
                    {tab === 'documents' && <DocumentsView />}
                    {tab === 'finance' && <FinanceView />}
                    {tab === 'tasks' && <TasksView />}
                    {(tab === 'calendar' || tab === 'schedule') && <CalendarView />}
                    {(tab === 'maintenance' || tab === 'requests' || tab === 'jobs') && <MaintenanceView />}
                    
                    {/* Placeholder */}
                    {['settings', 'my-home'].includes(tab) && (
                         <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center animate-in fade-in duration-500">
                            <Settings className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Settings</h3>
                            <p className="max-w-md mx-auto">Configuration options available in full version.</p>
                        </div>
                    )}

                    {/* Leads Table for Broker (reused logic) */}
                    {tab === 'leads' && currentUser.role === 'BROKER' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Leads</h2>
                                    <p className="text-slate-500 text-sm mt-1">Manage and track your potential clients</p>
                                </div>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Add Lead
                                </button>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Interest</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Status</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                                            {lead.firstName[0]}{lead.lastName[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-slate-900 truncate">{lead.firstName} {lead.lastName}</div>
                                                            <div className="text-xs text-slate-500 truncate">{lead.phone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-100">
                                                        {lead.interest}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                                    <span className="text-slate-600 font-medium text-sm">{lead.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    
                     {/* Properties Grid (reused logic) */}
                    {(tab === 'properties' || tab === 'my-home') && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
                                {currentUser.role === 'BROKER' && <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Property</button>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map(prop => (
                                    <div key={prop.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                                        <div className="h-48 bg-slate-200 relative">
                                            <img src={prop.image} alt="Property" className="w-full h-full object-cover" />
                                            <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold">{prop.status}</div>
                                        </div>
                                        <div className="p-5">
                                            <div className="text-xl font-bold text-slate-900 mb-1">{prop.price}</div>
                                            <div className="text-slate-600 text-sm mb-4">{prop.address}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detail Pane (Broker Only) */}
            {activeLead && currentUser.role === 'BROKER' && tab === 'leads' && (
                <div className="w-full lg:w-[380px] shrink-0 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto z-20 lg:relative absolute inset-0 lg:inset-auto animate-in slide-in-from-right duration-300 flex flex-col">
                    {/* Detail Pane Content */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lead Details</h3>
                        <button onClick={() => onSelectLead(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <div className="p-6">
                         {/* Header Section */}
                         <div className="flex items-center gap-4 mb-6">
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                                {activeLead.firstName[0]}{activeLead.lastName[0]}
                             </div>
                             <div>
                                <h2 className="text-xl font-bold text-slate-900">{activeLead.firstName} {activeLead.lastName}</h2>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${activeLead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {activeLead.status}
                                </span>
                             </div>
                        </div>

                        {/* Contact Actions */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <a href={`tel:${activeLead.phone}`} className="flex flex-col items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group cursor-pointer">
                                <div className="w-8 h-8 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                    <Phone className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-xs font-bold text-indigo-900">Call Mobile</span>
                                <span className="text-[10px] text-indigo-600 font-medium truncate max-w-full">{activeLead.phone}</span>
                            </a>
                            
                            <a href={`mailto:${activeLead.email}`} className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-colors group cursor-pointer">
                                <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-900">Send Email</span>
                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">{activeLead.email}</span>
                            </a>
                        </div>

                        {/* Call History & Notes Section */}
                         <div className="mb-6">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">History</h4>
                             {activeLead.recordings.map(rec => (
                                 <div key={rec.id} className="bg-slate-50 p-3 rounded-lg mb-2 flex justify-between items-center">
                                     <div className="flex items-center gap-2">
                                        {getStatusIcon(rec.outcome)}
                                        <span className="text-sm font-medium">{new Date(rec.timestamp).toLocaleDateString()}</span>
                                     </div>
                                     <span className="text-xs font-mono">{rec.duration}s</span>
                                 </div>
                             ))}
                             {activeLead.recordings.length === 0 && <p className="text-xs text-slate-400 italic">No calls yet.</p>}
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {activeLead.notes || 'No notes available.'}
                            </div>
                            <textarea 
                                value={noteInput} 
                                onChange={e => setNoteInput(e.target.value)} 
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="Add a new note..."
                            />
                            <button onClick={handleSaveNote} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Save Note</button>
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
