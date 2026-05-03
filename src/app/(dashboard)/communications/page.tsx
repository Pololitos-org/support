'use client';

import { useState, useRef } from 'react';
import { Megaphone, Mail, Bell, Loader2, AlertCircle, Search, X, Users, UserCheck, MessageSquare } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { communicationsService, UserSearchResult } from '@/lib/services/communications';

type PushMode = 'INCOMPLETE_PROFILES' | 'SPECIFIC_USERS';

export default function CommunicationsPage() {
  // ─── Direct Message State ──────────────────────────────────────
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [dmSearchResults, setDmSearchResults] = useState<UserSearchResult[]>([]);
  const [isDmSearching, setIsDmSearching] = useState(false);
  const [dmSelectedUser, setDmSelectedUser] = useState<UserSearchResult | null>(null);
  const [dmSubject, setDmSubject] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [isLoadingDm, setIsLoadingDm] = useState(false);
  const [dmResult, setDmResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);
  const dmSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Push State ───────────────────────────────────────────────
  const [isLoadingPush, setIsLoadingPush] = useState(false);
  const [pushTitle, setPushTitle] = useState('¡Acción Requerida!');
  const [pushMessage, setPushMessage] = useState('¡Sube tus documentos para activar tu cuenta y empezar a trabajar en Pololitos!');
  const [pushMode, setPushMode] = useState<PushMode>('INCOMPLETE_PROFILES');
  const [pushPath, setPushPath] = useState('');
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);

  // ─── User Search State ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── SES State ────────────────────────────────────────────────
  const [isLoadingSes, setIsLoadingSes] = useState(false);
  const [sesAudience, setSesAudience] = useState<'WORK' | 'HIRE' | 'BOTH'>('WORK');
  const [sesSubject, setSesSubject] = useState('¡Pololitos ya está disponible, {{firstName}}! 🚀');
  const [sesHtml, setSesHtml] = useState(`<p>¡El momento ha llegado! 🚀</p>
<p>Ya puedes empezar a interactuar en Pololitos y encontrar a los mejores profesionales para tus proyectos.</p>
<div style="text-align: center; margin: 20px 0;">
  <a href="https://pololitos.cl" style="background-color: #6C47FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Ir a la App</a>
</div>`);
  const [sesResult, setSesResult] = useState<{ success: boolean; message: string; isError?: boolean } | null>(null);

  // ─── Handlers ─────────────────────────────────────────────────
  const selectedUsersRef = useRef<UserSearchResult[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await communicationsService.searchUsers(value);
      // Filter out already-selected users using the ref (always up to date)
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

  const handleDmSearchChange = (value: string) => {
    setDmSearchQuery(value);
    if (dmSearchTimeout.current) clearTimeout(dmSearchTimeout.current);
    if (!value.trim()) { setDmSearchResults([]); return; }
    setIsDmSearching(true);
    dmSearchTimeout.current = setTimeout(async () => {
      const results = await communicationsService.searchUsers(value);
      setDmSearchResults(results);
      setIsDmSearching(false);
    }, 350);
  };

  const handleSendDirectMessage = async () => {
    if (!dmSelectedUser || !dmSubject.trim() || !dmMessage.trim()) return;
    setIsLoadingDm(true);
    setDmResult(null);
    try {
      const result = await communicationsService.sendDirectMessage(dmSelectedUser.id, dmSubject.trim(), dmMessage.trim());
      if (result.success) {
        setDmResult({ success: true, message: `Mensaje enviado. Ticket #${result.ticketId} creado.` });
        setDmSelectedUser(null);
        setDmSubject('');
        setDmMessage('');
        setDmSearchQuery('');
      } else {
        setDmResult({ success: false, isError: true, message: `Error: ${result.error || 'No se pudo enviar'}` });
      }
    } catch {
      setDmResult({ success: false, isError: true, message: 'Ocurrió un error inesperado' });
    } finally {
      setIsLoadingDm(false);
    }
  };

  const handleSendPush = async () => {
    setIsLoadingPush(true);
    setPushResult(null);
    try {
      const userIds = pushMode === 'SPECIFIC_USERS' ? selectedUsers.map(u => u.id) : [];
      const result = await communicationsService.sendPushNotification(pushTitle, pushMessage, pushMode, userIds, pushPath.trim() || undefined);
      if (result.success) {
        setPushResult({
          success: true,
          message: `Éxito: Se enviaron ${result.sent} notificaciones.`
        });
      } else {
        setPushResult({ success: false, isError: true, message: `Error: ${result.error || 'No se pudo enviar'}` });
      }
    } catch (e: any) {
      setPushResult({ success: false, isError: true, message: 'Ocurrió un error inesperado' });
    } finally {
      setIsLoadingPush(false);
    }
  };

  const handleSendSes = async () => {
    setIsLoadingSes(true);
    setSesResult(null);
    try {
      const result = await communicationsService.sendSESCampaign(sesAudience, sesSubject, sesHtml);
      if (result.success) {
        setSesResult({ success: true, message: `Éxito: Campaña encolada. Se enviarán correos a ${result.targetCount} usuarios.` });
      } else {
        setSesResult({ success: false, isError: true, message: `Error: ${result.error || 'No se pudo iniciar la campaña'}` });
      }
    } catch (e: any) {
      setSesResult({ success: false, isError: true, message: 'Ocurrió un error inesperado' });
    } finally {
      setIsLoadingSes(false);
    }
  };

  const confirmDescription = pushMode === 'SPECIFIC_USERS'
    ? `Se enviará la notificación a ${selectedUsers.length} usuario(s) seleccionado(s). Esta acción no se puede deshacer.`
    : 'Se enviará la notificación push a todos los trabajadores que no han completado su perfil. Esta acción no se puede deshacer.';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-blue-600" />
          Comunicaciones y Marketing
        </h1>
        <p className="text-gray-500 mt-2">
          Gestiona los envíos masivos de notificaciones y campañas de correo para los usuarios.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        
        {/* ── TARJETA PUSH ─────────────────────────────────────────── */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Notificación Push</CardTitle>
            <CardDescription>
              Envía una notificación push personalizada a trabajadores con perfil incompleto o a usuarios específicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">

            {/* Modo de envío */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Destinatarios</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPushMode('INCOMPLETE_PROFILES')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    pushMode === 'INCOMPLETE_PROFILES'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Perfiles incompletos
                </button>
                <button
                  type="button"
                  onClick={() => setPushMode('SPECIFIC_USERS')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    pushMode === 'SPECIFIC_USERS'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Usuarios específicos
                </button>
              </div>
            </div>

            {/* Selector de usuarios */}
            {pushMode === 'SPECIFIC_USERS' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Buscar usuarios</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Nombre o email..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    {searchResults.slice(0, 6).map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addUser(user)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Usuarios seleccionados */}
                {selectedUsers.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{selectedUsers.length} seleccionado(s)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUsers.map(user => (
                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                          {user.name?.split(' ')[0] || user.email}
                          <button
                            type="button"
                            onClick={() => removeUser(user.id)}
                            className="hover:text-red-500 ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Título y Mensaje */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Título de Notificación</label>
              <Input 
                value={pushTitle} 
                onChange={(e) => setPushTitle(e.target.value)} 
                placeholder="Ej. ¡Falta poco!" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cuerpo del Mensaje</label>
              <Textarea 
                value={pushMessage} 
                onChange={(e) => setPushMessage(e.target.value)} 
                rows={3}
                placeholder="Escribe el mensaje aquí..." 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ruta de Navegación (Opcional)</label>
              <Input 
                value={pushPath} 
                onChange={(e) => setPushPath(e.target.value)} 
                placeholder="Ej. /(authenticated)/account/verification" 
              />
              <p className="text-[10px] text-gray-400 mt-1">Si se deja vacío, redirigirá a la pantalla de verificación de cuenta por defecto.</p>
            </div>
            
            {pushResult && (
              <div className={`p-3 rounded-md text-sm flex items-start gap-2 ${pushResult.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{pushResult.message}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={isLoadingPush || (pushMode === 'SPECIFIC_USERS' && selectedUsers.length === 0)}
                >
                  {isLoadingPush ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                  ) : pushMode === 'SPECIFIC_USERS' ? (
                    `Enviar a ${selectedUsers.length} usuario(s)`
                  ) : (
                    'Enviar Notificación Push'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Confirmar envío?</AlertDialogTitle>
                  <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendPush} className="bg-indigo-600 hover:bg-indigo-700">
                    Sí, enviar notificación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        {/* ── TARJETA EMAIL SES ─────────────────────────────────────── */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Campaña de Correos (SES)</CardTitle>
            <CardDescription>
              Envía un correo masivo a través de Amazon SES. Tu mensaje se incluirá automáticamente dentro de la plantilla institucional de Pololitos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Seleccionar Audiencia</label>
              <Select value={sesAudience} onValueChange={(v) => setSesAudience(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la audiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORK">Trabajadores (Quieren pololear)</SelectItem>
                  <SelectItem value="HIRE">Clientes (Buscan pololitos)</SelectItem>
                  <SelectItem value="BOTH">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Asunto del Correo <span className="text-gray-400 font-normal ml-2">(Usa {'{{firstName}}'} para el nombre)</span>
              </label>
              <Input 
                value={sesSubject} 
                onChange={(e) => setSesSubject(e.target.value)} 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Cuerpo HTML <span className="text-gray-400 font-normal ml-2">(Usa {'{{firstName}}'} para el nombre)</span>
              </label>
              <Textarea 
                value={sesHtml} 
                onChange={(e) => setSesHtml(e.target.value)} 
                rows={10}
                className="font-mono text-xs"
              />
            </div>

            {sesResult && (
              <div className={`p-3 rounded-md text-sm flex items-start gap-2 ${sesResult.isError ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{sesResult.message}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoadingSes}>
                  {isLoadingSes ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando Campaña...</>
                  ) : (
                    'Lanzar Campaña de Correos'
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Iniciar campaña de correo masivo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se enviará un correo real a todos los usuarios del segmento seleccionado utilizando Amazon SES. Asegúrate de haber revisado la plantilla HTML.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendSes} className="bg-blue-600 hover:bg-blue-700">
                    Sí, lanzar campaña
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

      </div>

      {/* ── MENSAJE DIRECTO ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-violet-600" />
          </div>
          <CardTitle>Mensaje Directo</CardTitle>
          <CardDescription>
            Crea un ticket de soporte en nombre de un usuario y envíale una notificación push. El usuario podrá responder desde la sección de soporte de la app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">

            {/* Selector de usuario */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Destinatario</label>
              {dmSelectedUser ? (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-violet-300 bg-violet-50">
                  <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                    {dmSelectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{dmSelectedUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{dmSelectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDmSelectedUser(null); setDmSearchQuery(''); }}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por nombre o email..."
                    value={dmSearchQuery}
                    onChange={(e) => handleDmSearchChange(e.target.value)}
                  />
                  {isDmSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  {dmSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border rounded-lg overflow-hidden bg-white shadow-md">
                      {dmSearchResults.slice(0, 6).map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => { setDmSelectedUser(user); setDmSearchResults([]); setDmSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Asunto */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Asunto</label>
              <Input
                placeholder="Ej. Información sobre tu cuenta"
                value={dmSubject}
                onChange={(e) => setDmSubject(e.target.value)}
              />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Mensaje</label>
            <Textarea
              placeholder="Escribe el mensaje aquí..."
              rows={4}
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
            />
          </div>

          {dmResult && (
            <div className={`p-3 rounded-md text-sm flex items-start gap-2 ${dmResult.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{dmResult.message}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                disabled={isLoadingDm || !dmSelectedUser || !dmSubject.trim() || !dmMessage.trim()}
              >
                {isLoadingDm ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Enviar mensaje a {dmSelectedUser?.name?.split(' ')[0] || 'usuario'}
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Enviar mensaje directo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se creará un ticket de soporte para <strong>{dmSelectedUser?.name}</strong> con el asunto &quot;{dmSubject}&quot; y se le enviará una notificación push. El usuario podrá responder desde la app.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSendDirectMessage} className="bg-violet-600 hover:bg-violet-700">
                  Sí, enviar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

    </div>
  );
}
