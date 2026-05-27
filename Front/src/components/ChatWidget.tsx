import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

/**
 * Simple internal chat widget.
 * – Floating button toggles the chat panel.
 * – Messages are kept only in local state (for demo purposes).
 * – Fully responsive: on mobile the panel appears above the button.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; from: string }>>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input.trim(), from: 'Me' }]);
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
                className={`text-sm ${msg.from === 'Me' ? 'text-[#3CDBC0] text-right' : 'text-white text-left'}`}
              >
                {msg.text}
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
