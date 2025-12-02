
import React, { useState, useEffect } from 'react';
import { Lead, Property, User, Ticket, Invoice, Persona, Integration } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_ANALYTICS, LAURENT_SYSTEM_PROMPT } from '../constants';
import { db } from '../services/db';
import { 
  User as UserIcon, Phone, Mail, Clock, MapPin, DollarSign, Home, CheckCircle, 
  ChevronRight, Search, Play, Pause, X, Send, PhoneIncoming, 
  PhoneMissed, Voicemail, LayoutDashboard, Calendar as CalendarIcon, FileText, 
  PieChart, Settings, Inbox as InboxIcon, Briefcase, Megaphone, Receipt,
  Menu, ChevronLeft, ChevronDown, Wrench, HardHat, Bell, LogOut, Shield,
  Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, AlertCircle, Bot, MessageSquare, Facebook, Linkedin, Instagram, Trash2
} from 'lucide-react';

interface CRMProps {
  leads: Lead[];
  properties: Property[];
  onSelectLead: (lead: Lead | null) => void;
  selectedLeadId: string | null;
  onUpdateLead: (lead: Lead) => void;
  currentUser: User;
  onLogout: () => void;
  // Persona Props
  personas: Persona[];
  onUpdatePersonas: (personas: Persona[]) => void;
  activePersonaId: string;
}

type TabType = 'dashboard' | 'leads' | 'properties' | 'notifications' | 'calendar' | 'documents' | 'finance' | 'marketing' | 'analytics' | 'settings' | 'maintenance' | 'requests' | 'my-home' | 'jobs' | 'schedule' | 'invoices' | 'agent-config';

const CRM: React.FC<CRMProps> = ({ 
  leads, properties, onSelectLead, selectedLeadId, onUpdateLead, currentUser, onLogout,
  personas, onUpdatePersonas, activePersonaId
}) => {
  const [tab, setTab] = useState<TabType>('dashboard');
  const [noteInput, setNoteInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data State for Tabs
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterTicketStatus, setFilterTicketStatus] = useState<'ALL' | 'OPEN' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [integrations, setIntegrations] = useState<Integration[]>([
      { id: '1', type: 'EMAIL', name: 'Work Email', status: 'CONNECTED', account: 'laurent@eburon.com', lastSync: '2m ago' },
      { id: '2', type: 'WHATSAPP', name: 'Business WhatsApp', status: 'CONNECTED', account: '+32 477 00 99 88', lastSync: 'Live' },
      { id: '3', type: 'FACEBOOK', name: 'Meta Ads Manager', status: 'DISCONNECTED', account: 'Not Connected' }
  ]);

  useEffect(() => {
    // Load initial data for tabs based on current user
    const loadData = async () => {
        const t = await db.getTickets();
        setTickets(t);
        // Mock Invoices
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

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeLead) return;
    const timestamp = new Date().toLocaleString();
    const newNoteEntry = `[${timestamp}] Call Note: ${noteInput.trim()}`;
    const updatedNotes = activeLead.notes ? `${activeLead.notes}\n\n${newNoteEntry}` : newNoteEntry;
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

  const NavItem = ({ id, label, icon: Icon, badge }: { id: TabType, label: string, icon: any, badge?: string }) => (
    <button 
        onClick={() => {
            setTab(id);
            if(window.innerWidth < 1024) setIsSidebarCollapsed(true);
        }}
        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
          tab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
        } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
        title={isSidebarCollapsed ? label : undefined}
    >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${tab === id && isSidebarCollapsed ? 'scale-110' : ''}`} /> 
        <span className={`flex-1 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100 w-auto'}`}>
          {label}
        </span>
        {badge && !isSidebarCollapsed && (
          <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold py-0.5 px-2 rounded-full min-w-[20px] text-center ml-auto">
            {badge}
          </span>
        )}
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <div className={`px-4 mt-6 mb-2 transition-all duration-300 ${isSidebarCollapsed ? 'lg:opacity-0 lg:h-0 lg:mt-0 lg:overflow-hidden' : 'opacity-100 h-auto'}`}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );

  // ---