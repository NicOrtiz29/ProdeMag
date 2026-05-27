import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Simple internal chat widget.
 * – Floating button toggles the chat panel.
 * – Messages are kept only in local state (for demo purposes).
 * – Fully responsive: on mobile the panel appears above the button.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id?: string; text: string; from: string; created_at?: string }>>([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();

  // Load existing messages and subscribe to realtime updates
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) console.error('Error fetching messages:', error);
      else {
        console.log('Fetched messages:', data);
        setMessages(data);
      }
    };
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        const newMsg = payload.new as any;
        console.log('Realtime new message:', newMsg);
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const message = {
      text: input.trim(),
      from: user?.name ?? 'Me',
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('messages').insert(message).select();
    if (error) {
      console.error('Error sending message:', error);
    } else {
      // Optimistically add the message to local state so it appears instantly
      const inserted = data && data[0] ? data[0] : { ...message };
      setMessages(prev => [...prev, inserted]);
    }
    setInput('');
  };

  

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 bg-[#3CDBC0] hover:bg-[#3CDBC0]/90 text-white rounded-full p-3 shadow-lg"
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-[#0b111a]/90 border border-[#5B5FC7]/30 rounded-lg shadow-xl flex flex-col">
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm ${msg.from === (user?.name ?? 'Me') ? 'text-[#3CDBC0] text-right' : 'text-white text-left'}`}
              >
                <span className="font-medium">{msg.from}:</span> {msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-[#5B5FC7]/20 flex">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe…"
              className="flex-1 bg-[#0f0f23] border border-[#5B5FC7]/20 rounded p-1 text-white focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-[#3CDBC0] hover:bg-[#3CDBC0]/90 text-white rounded px-2"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
