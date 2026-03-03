import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Send, ArrowLeft, MessageCircle, Loader2, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Conversation {
  other_user_id: string;
  display_name: string | null;
  email: string;
  farm_name: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function getToken() {
  const stored = localStorage.getItem('bio_auth');
  if (!stored) return null;
  try { return JSON.parse(stored).token; } catch { return null; }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function Mensajes() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatWith = searchParams.get('con');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (chatWith && user) {
      openChat(chatWith);
    }
  }, [chatWith, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages when in a chat
  useEffect(() => {
    if (activeChatUser) {
      pollRef.current = setInterval(() => fetchMessages(activeChatUser.other_user_id), 5000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, [activeChatUser]);

  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/api/messages/conversations');
      if (res.ok) setConversations(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/messages/${userId}`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
      }
    } catch (e) { console.error(e); }
  };

  const openChat = async (userId: string) => {
    // Find or create conversation entry
    let convo = conversations.find(c => c.other_user_id === userId);
    if (!convo) {
      // Fetch user info
      try {
        const res = await apiFetch(`/api/data/farmer_profiles_public?user_id=eq.${userId}&select=user_id,farm_name`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            convo = {
              other_user_id: userId,
              display_name: null,
              email: '',
              farm_name: data[0].farm_name,
              last_message: '',
              last_message_at: new Date().toISOString(),
              unread_count: 0,
            };
          }
        }
      } catch {}
      if (!convo) {
        convo = {
          other_user_id: userId,
          display_name: null,
          email: '',
          farm_name: 'Usuario',
          last_message: '',
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        };
      }
    }
    setActiveChatUser(convo);
    await fetchMessages(userId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatUser) return;
    setSending(true);
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ to_user_id: activeChatUser.other_user_id, message: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage('');
        await fetchMessages(activeChatUser.other_user_id);
      }
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Chat view
  if (activeChatUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Chat header */}
        <header className="bg-card border-b border-border sticky top-0 z-10 px-4 py-3">
          <div className="container max-w-2xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setActiveChatUser(null); fetchConversations(); navigate('/mensajes', { replace: true }); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-earth flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-semibold truncate">
                {activeChatUser.farm_name || activeChatUser.display_name || activeChatUser.email}
              </h1>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="container max-w-2xl mx-auto space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Envía el primer mensaje</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.from_user_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <footer className="bg-card border-t border-border px-4 py-3 sticky bottom-0">
          <div className="container max-w-2xl mx-auto flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="h-12 text-base rounded-full px-5"
              autoFocus
            />
            <Button
              variant="earth"
              size="icon"
              className="h-12 w-12 rounded-full flex-shrink-0"
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </footer>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container max-w-2xl">
            <h1 className="font-display text-3xl font-semibold text-center mb-2">
              <MessageCircle className="w-8 h-8 inline-block mr-2 text-primary" />
              Mensajes
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Comunícate directamente con productores y consumidores
            </p>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="font-display text-xl font-semibold mb-2">Sin conversaciones</h3>
                <p className="text-muted-foreground mb-6">
                  Busca un productor en el listín y envíale un mensaje
                </p>
                <Button variant="earth" onClick={() => navigate('/explorar')}>
                  Explorar productores
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((convo) => (
                  <Card
                    key={convo.other_user_id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { navigate(`/mensajes?con=${convo.other_user_id}`); openChat(convo.other_user_id); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-earth flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {convo.farm_name || convo.display_name || convo.email}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {timeAgo(convo.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {convo.last_message}
                          </p>
                          {convo.unread_count > 0 && (
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {convo.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
