'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell, Mail, MessageSquare, Loader2, AlertCircle, Search, X,
  Users, UserCheck, Monitor, Smartphone, Send, Eye, EyeOff,
  TrendingDown, Clock, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { communicationsService, UserSearchResult } from '@/lib/services/communications';

const BRAND = { blue: '#4949E9', lime: '#DCF343', purple: '#9D86FA', red: '#FE5A51' };

// ─── All segments in one flat list ───────────────────────────────────────────
const ALL_SEGMENTS = [
  { mode: 'ALL_USERS',            segmentKey: 'all_users',            icon: <Users className="h-3.5 w-3.5" />,         label: 'Todos',               sub: 'Todos los usuarios activos' },
  { mode: 'WORKERS',              segmentKey: 'workers',              icon: <UserCheck className="h-3.5 w-3.5" />,     label: 'Trabajadores',        sub: 'Quieren pololear' },
  { mode: 'HIRERS',               segmentKey: 'hirers',               icon: <MessageSquare className="h-3.5 w-3.5" />, label: 'Contratadores',       sub: 'Buscan pololitos' },
  { mode: 'INCOMPLETE_PROFILES',  segmentKey: 'incomplete_profiles',  icon: <AlertCircle className="h-3.5 w-3.5" />,   label: 'Sin verificar',       sub: 'Perfil incompleto' },
  { mode: 'NO_PUBLISH_7D',        segmentKey: 'no_publish_7d',        icon: <Clock className="h-3.5 w-3.5" />,         label: 'Sin publicar >7d',    sub: 'Contratadores sin tarea' },
  { mode: 'NO_APPLY_7D',          segmentKey: 'no_apply_7d',          icon: <Clock className="h-3.5 w-3.5" />,         label: 'Sin postular >7d',    sub: 'Trabajadores inactivos' },
  { mode: 'TASK_NO_OFFERS_72H',   segmentKey: 'task_no_offers_72h',   icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Sin ofertas >72h',    sub: 'Tareas sin postulantes' },
  { mode: 'OFFER_NO_RESPONSE_48H',segmentKey: 'offer_no_response_48h',icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Sin respuesta >48h',  sub: 'Ofertas sin revisar' },
  { mode: 'ASSIGNED_NO_COMPLETE_5D',segmentKey:'assigned_no_complete_5d',icon:<AlertCircle className="h-3.5 w-3.5" />,label: 'Sin completar >5d',   sub: 'Trabajos parados' },
  { mode: 'INACTIVE_30D',         segmentKey: 'inactive_30d',         icon: <TrendingDown className="h-3.5 w-3.5" />,  label: 'Inactivos >30d',      sub: 'Sin actividad reciente' },
];

const SEGMENT_DEFAULTS: Record<string, { title: string; message: string; path: string }> = {
  ALL_USERS:              { title: '¡Novedades en Pololitos!',      message: 'Hay cosas nuevas esperándote. Entra y descúbrelas.',                          path: '/home' },
  WORKERS:                { title: '¡Nuevas tareas disponibles!',   message: 'Hay tareas esperándote cerca de ti. ¡Revísalas ahora!',                       path: '/pololos' },
  HIRERS:                 { title: '¿Necesitas un pololito?',       message: 'Publica tu tarea y recibe ofertas de trabajadores verificados.',              path: '/home' },
  INCOMPLETE_PROFILES:    { title: '¡Verifica tu cuenta!',          message: 'Completa tu perfil para empezar a recibir ofertas.',                          path: '/account/verification' },
  NO_PUBLISH_7D:          { title: '¿Tienes algo que resolver?',    message: 'Publica tu primera tarea y recibe ofertas al instante.',                      path: '/home' },
  NO_APPLY_7D:            { title: '¡Hay tareas esperándote!',      message: 'Llevas días sin postular. Revisa las disponibles cerca de ti.',               path: '/pololos' },
  TASK_NO_OFFERS_72H:     { title: 'Tu tarea aún no tiene ofertas', message: 'Revisa los detalles de tu publicación para atraer más postulantes.',          path: '' },
  OFFER_NO_RESPONSE_48H:  { title: 'Tienes ofertas sin revisar',    message: 'Hay trabajadores esperando tu respuesta. ¡Revísalas ahora!',                  path: '/pololos' },
  ASSIGNED_NO_COMPLETE_5D:{ title: '¿Cómo va tu tarea?',           message: 'Tu trabajo lleva varios días en progreso. Marca como completado si terminó.', path: '/pololos' },
  INACTIVE_30D:           { title: '¡Te echamos de menos!',         message: 'Han pasado más de 30 días. Hay nuevas tareas en tu zona.',                    path: '/home' },
};

const SUGGESTED_ROUTES = [
  { path: '/home',                 label: 'Inicio' },
  { path: '/pololos',              label: 'Buscar Tareas' },
  { path: '/messages',             label: 'Mensajes' },
  { path: '/notifications',        label: 'Notificaciones' },
  { path: '/account',              label: 'Mi Cuenta' },
  { path: '/account/verification', label: 'Verificación' },
  { path: '/myTickets',            label: 'Tickets de Soporte' },
];

const CUSTOM_CONDITIONS = [
  { value: 'inactive',    label: 'Inactivos' },
  { value: 'no_publish',  label: 'Sin publicar tarea' },
  { value: 'no_apply',    label: 'Sin postular' },
  { value: 'no_offers',   label: 'Tareas sin ofertas' },
  { value: 'no_response', label: 'Ofertas sin respuesta' },
  { value: 'no_complete', label: 'Trabajo sin completar' },
];

// ─── Tab pill ────────────────────────────────────────────────────────────────
function TabPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
      style={active ? { background: BRAND.blue, color: '#fff', boxShadow: `0 4px 14px ${BRAND.blue}55` } : { background: 'transparent', color: '#6b7280' }}>
      {icon}{label}
    </button>
  );
}

// ─── Audience mode toggle ────────────────────────────────────────────────────
function AudienceToggle({ mode, onChange }: { mode: 'segment' | 'custom'; onChange: (m: 'segment' | 'custom') => void }) {
  return (
    <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg w-fit text-xs font-semibold">
      {(['segment', 'custom'] as const).map(m => (
        <button key={m} type="button" onClick={() => onChange(m)}
          className="px-3 py-1.5 rounded-md transition-all"
          style={mode === m ? { background: '#fff', color: BRAND.blue, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#9ca3af' }}>
          {m === 'segment' ? 'Segmento' : 'Consulta personalizada'}
        </button>
      ))}
    </div>
  );
}

// ─── Count badge ─────────────────────────────────────────────────────────────
function CountBadge({ count, loading, active }: { count: number | null | undefined; loading?: boolean; active: boolean }) {
  if (!loading && count === undefined) return null;
  return (
    <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1"
      style={active ? { background: BRAND.lime, color: '#000' } : { background: '#e5e7eb', color: '#374151' }}>
      {loading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : count}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CommunicationsPage() {
  const [tab, setTab] = useState<'push' | 'email'>('push');

  // ── Push ────────────────────────────────────────────────────────────────────
  const [audienceMode, setAudienceMode] = useState<'segment' | 'custom'>('segment');
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set());
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number | null>>({});
  const [loadingSegments, setLoadingSegments] = useState<Record<string, boolean>>({});
  const [customCondition, setCustomCondition] = useState('inactive');
  const [customDays, setCustomDays] = useState(30);
  const [customRole, setCustomRole] = useState('ALL');
  const [customResult, setCustomResult] = useState<{ count: number; userIds: number[] } | null>(null);
  const [isRunningCustom, setIsRunningCustom] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const selectedUsersRef = useRef<UserSearchResult[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushPath, setPushPath] = useState('');
  const [showRouteSuggestions, setShowRouteSuggestions] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);
  const [isLoadingPush, setIsLoadingPush] = useState(false);
  const [unionCount, setUnionCount] = useState<number | null>(null);
  const [isLoadingUnion, setIsLoadingUnion] = useState(false);
  const unionDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── SES ─────────────────────────────────────────────────────────────────────
  const [sesAudience, setSesAudience] = useState<'WORK' | 'HIRE' | 'BOTH'>('WORK');
  const [sesSubject, setSesSubject] = useState('¡Pololitos ya está disponible, {{firstName}}! 🚀');
  const [sesHtml, setSesHtml] = useState(`<p>¡El momento ha llegado! 🚀</p>\n<p>Ya puedes empezar a interactuar en Pololitos y encontrar a los mejores profesionales para tus proyectos.</p>\n<div style="text-align: center; margin: 20px 0;">\n  <a href="https://pololitos.cl" style="background-color: #4949e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Ir a la App</a>\n</div>`);
  const [sesResult, setSesResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);
  const [isLoadingSes, setIsLoadingSes] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const previewDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);
  const [sesConfirmCount, setSesConfirmCount] = useState<number | null>(null);
  const [isLoadingConfirmCount, setIsLoadingConfirmCount] = useState(false);

  // ── DM ──────────────────────────────────────────────────────────────────────
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [dmSearchResults, setDmSearchResults] = useState<UserSearchResult[]>([]);
  const [isDmSearching, setIsDmSearching] = useState(false);
  const [dmSelectedUser, setDmSelectedUser] = useState<UserSearchResult | null>(null);
  const [dmSubject, setDmSubject] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [isLoadingDm, setIsLoadingDm] = useState(false);
  const [dmResult, setDmResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);
  const dmSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Union count (debounced) ──────────────────────────────────────────────────
  useEffect(() => {
    const modes = audienceMode === 'segment' ? [...selectedModes] : [];
    const userIds = [
      ...selectedUsers.map(u => u.id),
      ...(audienceMode === 'custom' && customResult ? customResult.userIds : []),
    ];
    if (modes.length === 0 && userIds.length === 0) { setUnionCount(null); return; }
    if (unionDebounce.current) clearTimeout(unionDebounce.current);
    setIsLoadingUnion(true);
    unionDebounce.current = setTimeout(async () => {
      try {
        const { count } = await communicationsService.getUnionCount(modes, userIds);
        setUnionCount(count);
      } catch { setUnionCount(null); }
      finally { setIsLoadingUnion(false); }
    }, 400);
    return () => { if (unionDebounce.current) clearTimeout(unionDebounce.current); };
  }, [selectedModes, selectedUsers, customResult, audienceMode]);

  // ── SES preview ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showPreview) return;
    if (previewDebounce.current) clearTimeout(previewDebounce.current);
    previewDebounce.current = setTimeout(() => setPreviewHtml(sesHtml.replace(/{{firstName}}/g, 'María')), 300);
    return () => { if (previewDebounce.current) clearTimeout(previewDebounce.current); };
  }, [sesHtml, showPreview]);

  // ── Segment count loader ──────────────────────────────────────────────────────
  const loadSegmentCount = useCallback(async (segmentKey: string) => {
    if (segmentCounts[segmentKey] !== undefined) return;
    setLoadingSegments(prev => ({ ...prev, [segmentKey]: true }));
    try {
      const { count } = await communicationsService.getSegmentCount(segmentKey as any);
      setSegmentCounts(prev => ({ ...prev, [segmentKey]: count }));
    } catch {
      setSegmentCounts(prev => ({ ...prev, [segmentKey]: null }));
    } finally {
      setLoadingSegments(prev => ({ ...prev, [segmentKey]: false }));
    }
  }, [segmentCounts]);

  const switchAudienceMode = (m: 'segment' | 'custom') => {
    setAudienceMode(m);
    setSelectedModes(new Set());
    setCustomResult(null);
    setUnionCount(null);
  };

  const toggleMode = (mode: string, segmentKey: string) => {
    setSelectedModes(prev => {
      const next = new Set(prev);
      if (next.has(mode)) {
        next.delete(mode);
      } else {
        next.add(mode);
        const d = SEGMENT_DEFAULTS[mode];
        if (d) { setPushTitle(d.title); setPushMessage(d.message); setPushPath(d.path); }
        loadSegmentCount(segmentKey);
      }
      return next;
    });
  };

  // ── User search ───────────────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await communicationsService.searchUsers(value);
      setSearchResults(results.filter(r => !selectedUsersRef.current.find(s => s.id === r.id)));
      setIsSearching(false);
    }, 350);
  };

  const addUser = (user: UserSearchResult) => {
    const updated = [...selectedUsersRef.current, user];
    selectedUsersRef.current = updated;
    setSelectedUsers(updated);
    setSearchResults(prev => prev.filter(r => r.id !== user.id));
    setSearchQuery('');
  };

  const removeUser = (userId: number) => {
    const updated = selectedUsersRef.current.filter(u => u.id !== userId);
    selectedUsersRef.current = updated;
    setSelectedUsers(updated);
  };

  // ── Custom query ──────────────────────────────────────────────────────────────
  const handleRunCustomQuery = async () => {
    setIsRunningCustom(true); setCustomResult(null);
    try {
      const result = await communicationsService.getCustomSegmentCount(customCondition, customDays, customRole);
      setCustomResult(result);
    } catch { setCustomResult(null); }
    finally { setIsRunningCustom(false); }
  };

  // ── Send push ─────────────────────────────────────────────────────────────────
  const handleSendPush = async () => {
    setIsLoadingPush(true); setPushResult(null);
    try {
      const modes = audienceMode === 'segment' ? [...selectedModes] : [];
      const userIds = [
        ...selectedUsers.map(u => u.id),
        ...(audienceMode === 'custom' && customResult ? customResult.userIds : []),
      ];
      const result = await communicationsService.sendPushNotification(
        pushTitle, pushMessage, modes, userIds, pushPath.trim() || undefined, 'CUSTOM_MESSAGE'
      );
      setPushResult(result.success
        ? { success: true, message: `Éxito: Se enviaron ${result.sent} notificaciones.` }
        : { success: false, isError: true, message: `Error: ${result.error || 'No se pudo enviar'}` });
    } catch { setPushResult({ success: false, isError: true, message: 'Ocurrió un error inesperado' }); }
    finally { setIsLoadingPush(false); }
  };

  // ── SES ───────────────────────────────────────────────────────────────────────
  const handleSendSes = async () => {
    setIsLoadingSes(true); setSesResult(null);
    try {
      const result = await communicationsService.sendSESCampaign(sesAudience, sesSubject, sesHtml);
      setSesResult(result.success
        ? { success: true, message: `Éxito: Campaña encolada. Se enviarán correos a ${result.targetCount} usuarios.` }
        : { success: false, isError: true, message: `Error: ${result.error || 'No se pudo iniciar'}` });
    } catch { setSesResult({ success: false, isError: true, message: 'Error inesperado' }); }
    finally { setIsLoadingSes(false); }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim()) return;
    setIsSendingTest(true); setTestEmailResult(null);
    try {
      const result = await communicationsService.sendTestEmail(testEmailTo.trim(), sesSubject, sesHtml);
      setTestEmailResult(result.success
        ? { success: true, message: `Prueba enviada a ${testEmailTo}` }
        : { success: false, isError: true, message: `Error: ${result.error}` });
    } catch { setTestEmailResult({ success: false, isError: true, message: 'Error inesperado' }); }
    finally { setIsSendingTest(false); }
  };

  const handleOpenSesConfirm = async () => {
    setIsLoadingConfirmCount(true); setSesConfirmCount(null);
    try {
      const { count } = await communicationsService.getAudienceCount(sesAudience);
      setSesConfirmCount(count);
    } finally { setIsLoadingConfirmCount(false); }
  };

  // ── DM ────────────────────────────────────────────────────────────────────────
  const handleDmSearchChange = (value: string) => {
    setDmSearchQuery(value);
    if (dmSearchTimeout.current) clearTimeout(dmSearchTimeout.current);
    if (!value.trim()) { setDmSearchResults([]); return; }
    setIsDmSearching(true);
    dmSearchTimeout.current = setTimeout(async () => {
      setDmSearchResults(await communicationsService.searchUsers(value));
      setIsDmSearching(false);
    }, 350);
  };

  const handleSendDirectMessage = async () => {
    if (!dmSelectedUser || !dmSubject.trim() || !dmMessage.trim()) return;
    setIsLoadingDm(true); setDmResult(null);
    try {
      const result = await communicationsService.sendDirectMessage(dmSelectedUser.id, dmSubject.trim(), dmMessage.trim());
      if (result.success) {
        setDmResult({ success: true, message: `Mensaje enviado. Ticket #${result.ticketId} creado.` });
        setDmSelectedUser(null); setDmSubject(''); setDmMessage(''); setDmSearchQuery('');
      } else {
        setDmResult({ success: false, isError: true, message: `Error: ${result.error}` });
      }
    } catch { setDmResult({ success: false, isError: true, message: 'Error inesperado' }); }
    finally { setIsLoadingDm(false); }
  };

  const filteredRoutes = SUGGESTED_ROUTES.filter(r =>
    r.path.toLowerCase().includes(pushPath.toLowerCase()) || r.label.toLowerCase().includes(pushPath.toLowerCase())
  );

  const hasAudience = audienceMode === 'segment'
    ? (selectedModes.size > 0 || selectedUsers.length > 0)
    : (customResult !== null || selectedUsers.length > 0);

  const canSend = hasAudience && pushTitle.trim() && pushMessage.trim();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Comunicaciones</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestiona envíos de notificaciones y campañas de correo.</p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-full w-fit">
        <TabPill active={tab === 'push'} onClick={() => setTab('push')} icon={<Bell className="h-4 w-4" />} label="Notificaciones y Mensajes" />
        <TabPill active={tab === 'email'} onClick={() => setTab('email')} icon={<Mail className="h-4 w-4" />} label="Correos (SES)" />
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB PUSH + DM
      ════════════════════════════════════════════════════════ */}
      {tab === 'push' && (
        <div className="space-y-5">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.purple})` }} />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.blue}15` }}>
                  <Bell className="h-5 w-5" style={{ color: BRAND.blue }} />
                </div>
                <div>
                  <CardTitle className="text-lg">Notificación Push</CardTitle>
                  <CardDescription className="text-xs">Elige una audiencia, escribe el mensaje y envía.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">

              {/* ── Audiencia ─────────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Audiencia</p>
                  <AudienceToggle mode={audienceMode} onChange={switchAudienceMode} />
                </div>

                {/* Modo: Segmento */}
                {audienceMode === 'segment' && (
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_SEGMENTS.map(({ mode, segmentKey, icon, label, sub }) => {
                      const active = selectedModes.has(mode);
                      return (
                        <button key={mode} type="button" onClick={() => toggleMode(mode, segmentKey)}
                          className="relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all"
                          style={active
                            ? { borderColor: BRAND.blue, background: `${BRAND.blue}0d`, color: BRAND.blue }
                            : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                          <span className="mt-0.5 flex-shrink-0">{icon}</span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-xs font-semibold leading-tight">{label}</span>
                            <span className="block text-[10px] opacity-60 font-normal mt-0.5">{sub}</span>
                          </span>
                          <CountBadge count={segmentCounts[segmentKey]} loading={loadingSegments[segmentKey]} active={active} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Modo: Consulta personalizada */}
                {audienceMode === 'custom' && (
                  <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/50">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Condición</label>
                        <Select value={customCondition} onValueChange={setCustomCondition}>
                          <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CUSTOM_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Días</label>
                        <Input type="number" min={1} value={customDays}
                          onChange={e => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="h-8 text-xs bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Rol</label>
                        <Select value={customRole} onValueChange={setCustomRole}>
                          <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL" className="text-xs">Todos</SelectItem>
                            <SelectItem value="WORK" className="text-xs">Trabajadores</SelectItem>
                            <SelectItem value="HIRE" className="text-xs">Contratadores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button type="button" size="sm" variant="outline" onClick={handleRunCustomQuery}
                        disabled={isRunningCustom} className="h-7 text-xs gap-1.5 bg-white">
                        {isRunningCustom ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                        Consultar
                      </Button>
                      {customResult !== null && (
                        <span className="text-sm font-semibold" style={{ color: BRAND.blue }}>
                          {customResult.count} usuarios encontrados
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Usuarios específicos (siempre visible, complementario) ── */}
              <div>
                <button type="button" onClick={() => setShowUserSearch(v => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all"
                  style={showUserSearch || selectedUsers.length > 0
                    ? { borderColor: BRAND.blue, background: `${BRAND.blue}0d`, color: BRAND.blue }
                    : { borderColor: '#e5e7eb', color: '#9ca3af', borderStyle: 'dashed' }}>
                  <Search className="h-4 w-4" />
                  Añadir usuarios específicos
                  {selectedUsers.length > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1" style={{ background: BRAND.lime, color: '#000' }}>
                      {selectedUsers.length}
                    </span>
                  )}
                </button>
                {showUserSearch && (
                  <div className="mt-2 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input className="pl-9" placeholder="Nombre o email..." value={searchQuery} onChange={e => handleSearchChange(e.target.value)} />
                      {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                        {searchResults.slice(0, 6).map(user => (
                          <button key={user.id} type="button" onClick={() => addUser(user)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-left">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${BRAND.blue}15`, color: BRAND.blue }}>
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{user.name}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUsers.map(user => (
                          <Badge key={user.id} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                            {user.name?.split(' ')[0] || user.email}
                            <button type="button" onClick={() => removeUser(user.id)} className="hover:text-red-500 ml-0.5"><X className="h-3 w-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Total ─────────────────────────────────────── */}
              {hasAudience && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: `${BRAND.blue}0d`, border: `1px solid ${BRAND.blue}25` }}>
                  <Users className="h-4 w-4 flex-shrink-0" style={{ color: BRAND.blue }} />
                  <span className="text-sm" style={{ color: BRAND.blue }}>
                    {isLoadingUnion
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1" />Calculando...</>
                      : <><strong>{unionCount ?? '—'}</strong> usuarios únicos</>}
                  </span>
                </div>
              )}

              {/* ── Mensaje ───────────────────────────────────── */}
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Título</label>
                  <Input value={pushTitle} onChange={e => setPushTitle(e.target.value)} placeholder="Ej. ¡Falta poco!" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mensaje</label>
                  <Textarea value={pushMessage} onChange={e => setPushMessage(e.target.value)} rows={3} placeholder="Escribe el mensaje aquí..." />
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ruta <span className="font-normal text-gray-400 text-xs">(opcional)</span>
                  </label>
                  <Input value={pushPath}
                    onChange={e => { setPushPath(e.target.value); setShowRouteSuggestions(true); }}
                    onFocus={() => setShowRouteSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowRouteSuggestions(false), 200)}
                    placeholder="/home" />
                  {showRouteSuggestions && filteredRoutes.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 border border-gray-200 rounded-xl bg-white shadow-lg max-h-40 overflow-y-auto">
                      {filteredRoutes.map(route => (
                        <button key={route.path} type="button"
                          onClick={() => { setPushPath(route.path); setShowRouteSuggestions(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between">
                          <span className="font-semibold" style={{ color: BRAND.blue }}>{route.path}</span>
                          <span className="text-gray-400">{route.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {pushResult && (
                <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${pushResult.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />{pushResult.message}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t bg-gray-50/50 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full font-semibold" disabled={isLoadingPush || !canSend}
                    style={canSend && !isLoadingPush ? { background: BRAND.blue } : {}}>
                    {isLoadingPush ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</> : 'Enviar Notificación Push'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar envío?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se enviará a <strong>{unionCount ?? '?'} usuarios únicos</strong>. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSendPush} style={{ background: BRAND.blue }}>Sí, enviar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          {/* ── Mensaje Directo ─────────────────────────────── */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND.purple}, #c4b5fd)` }} />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.purple}18` }}>
                  <MessageSquare className="h-5 w-5" style={{ color: BRAND.purple }} />
                </div>
                <div>
                  <CardTitle className="text-lg">Mensaje Directo</CardTitle>
                  <CardDescription className="text-xs">Crea un ticket y envía una notificación push al usuario seleccionado.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Destinatario</label>
                  {dmSelectedUser ? (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl border" style={{ borderColor: `${BRAND.purple}50`, background: `${BRAND.purple}0d` }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${BRAND.purple}22`, color: BRAND.purple }}>
                        {dmSelectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{dmSelectedUser.name}</p>
                        <p className="text-xs text-gray-400 truncate">{dmSelectedUser.email}</p>
                      </div>
                      <button type="button" onClick={() => { setDmSelectedUser(null); setDmSearchQuery(''); }} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input className="pl-9" placeholder="Nombre o email..." value={dmSearchQuery} onChange={e => handleDmSearchChange(e.target.value)} />
                      {isDmSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />}
                      {dmSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 border rounded-xl overflow-hidden bg-white shadow-md">
                          {dmSearchResults.slice(0, 6).map(user => (
                            <button key={user.id} type="button"
                              onClick={() => { setDmSelectedUser(user); setDmSearchResults([]); setDmSearchQuery(''); }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-left">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${BRAND.purple}18`, color: BRAND.purple }}>
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Asunto</label>
                  <Input placeholder="Ej. Información sobre tu cuenta" value={dmSubject} onChange={e => setDmSubject(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Mensaje</label>
                <Textarea placeholder="Escribe el mensaje aquí..." rows={4} value={dmMessage} onChange={e => setDmMessage(e.target.value)} />
              </div>
              {dmResult && (
                <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${dmResult.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />{dmResult.message}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isLoadingDm || !dmSelectedUser || !dmSubject.trim() || !dmMessage.trim()}
                    style={{ background: BRAND.purple }}>
                    {isLoadingDm
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                      : <><MessageSquare className="mr-2 h-4 w-4" />Enviar a {dmSelectedUser?.name?.split(' ')[0] || 'usuario'}</>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Enviar mensaje directo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se creará un ticket para <strong>{dmSelectedUser?.name}</strong> con asunto &quot;{dmSubject}&quot; y se enviará una notificación push.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSendDirectMessage} style={{ background: BRAND.purple }}>Sí, enviar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB SES
      ════════════════════════════════════════════════════════ */}
      {tab === 'email' && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND.red}, #fb923c)` }} />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.red}15` }}>
                <Mail className="h-5 w-5" style={{ color: BRAND.red }} />
              </div>
              <div>
                <CardTitle className="text-lg">Campaña de Correos</CardTitle>
                <CardDescription className="text-xs">Envía un correo masivo vía Amazon SES dentro de la plantilla institucional.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Audiencia</label>
                <Select value={sesAudience} onValueChange={v => setSesAudience(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORK">Trabajadores</SelectItem>
                    <SelectItem value="HIRE">Contratadores</SelectItem>
                    <SelectItem value="BOTH">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Asunto <span className="font-normal text-gray-400 text-xs ml-1">usa {'{{firstName}}'}</span>
                </label>
                <Input value={sesSubject} onChange={e => setSesSubject(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Cuerpo HTML <span className="font-normal text-gray-400 text-xs ml-1">usa {'{{firstName}}'}</span>
              </label>
              <Textarea value={sesHtml} onChange={e => setSesHtml(e.target.value)} rows={10} className="font-mono text-xs" />
            </div>
            <Button type="button" variant="outline" size="sm"
              onClick={() => { if (!showPreview) setPreviewHtml(sesHtml.replace(/{{firstName}}/g, 'María')); setShowPreview(v => !v); }}
              className="gap-2 border-gray-200 text-gray-600">
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
            </Button>
            {showPreview && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                  {(['desktop', 'mobile'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setPreviewMode(m)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${previewMode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                      {m === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                      {m === 'desktop' ? 'Desktop' : 'Móvil'}
                    </button>
                  ))}
                  <span className="ml-auto text-[10px] text-gray-400">Vista con &quot;María&quot;</span>
                </div>
                <div className="bg-gray-100 p-3 flex justify-center">
                  <div className="bg-white rounded overflow-auto"
                    style={{ width: previewMode === 'mobile' ? '375px' : '100%', minHeight: '150px', maxHeight: '350px', border: previewMode === 'mobile' ? '1px solid #e5e7eb' : 'none', transition: 'width 0.2s' }}>
                    <div className="p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-xl border border-dashed border-gray-200 p-4 space-y-2 bg-gray-50/50">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Correo de prueba</label>
              <div className="flex gap-2">
                <Input type="email" placeholder="tu@email.com" value={testEmailTo} onChange={e => setTestEmailTo(e.target.value)} className="text-sm bg-white" />
                <Button type="button" variant="outline" size="sm" onClick={handleSendTestEmail}
                  disabled={isSendingTest || !testEmailTo.trim()} className="whitespace-nowrap text-xs gap-1.5 flex-shrink-0">
                  {isSendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {testEmailTo.trim() ? `Prueba a ${testEmailTo.split('@')[0]}` : 'Enviar prueba'}
                </Button>
              </div>
              {testEmailResult && (
                <p className={`text-xs flex items-center gap-1 ${testEmailResult.isError ? 'text-red-600' : 'text-green-600'}`}>
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />{testEmailResult.message}
                </p>
              )}
            </div>
            {sesResult && (
              <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${sesResult.isError ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />{sesResult.message}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-gray-50/50 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full font-semibold" disabled={isLoadingSes} onClick={handleOpenSesConfirm}
                  style={{ background: BRAND.red }}>
                  {isLoadingSes ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Iniciando...</> : 'Lanzar Campaña de Correos'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Iniciar campaña de correo masivo?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Audiencia:</span>
                          <span>{sesAudience === 'WORK' ? 'Trabajadores' : sesAudience === 'HIRE' ? 'Contratadores' : 'Todos'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Asunto:</span>
                          <span className="text-right max-w-[200px] truncate">{sesSubject.replace(/{{firstName}}/g, 'Usuario')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Destinatarios:</span>
                          {isLoadingConfirmCount
                            ? <span className="flex items-center gap-1 text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Consultando...</span>
                            : sesConfirmCount !== null
                              ? <span className="font-bold" style={{ color: BRAND.blue }}>{sesConfirmCount.toLocaleString()} usuarios</span>
                              : <span className="text-gray-400">—</span>}
                        </div>
                      </div>
                      <p>Se utilizará Amazon SES. Revisa el HTML con la vista previa antes de enviar.</p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendSes} style={{ background: BRAND.red }}>Confirmar y enviar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
