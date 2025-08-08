import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const api = async (path: string, method = 'GET', body?: any, token?: string) => {
  const res = await fetch(`http://localhost:3000${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bots, setBots] = useState<any[]>([]);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#cccccc');
  const [tags, setTags] = useState<any[]>([]);
  const [chatTags, setChatTags] = useState<any[]>([]);

  const handleRegister = async () => {
    await api('/auth/register', 'POST', { email, password });
  };

  const handleLogin = async () => {
    const res = await api('/auth/login', 'POST', { email, password });
    setToken(res.token);
  };

  useEffect(() => {
    if (token) {
      api('/bots', 'GET', undefined, token).then(setBots);
      api('/tags', 'GET', undefined, token).then(setTags);
    }
  }, [token]);

  const addBot = async () => {
    const bot = await api('/bots', 'POST', { token: botToken }, token!);
    setBots([...bots, bot]);
    setBotToken('');
  };

  const joinChat = async () => {
    if (!token || !chatId) return;
    const msgs = await api(`/messages/${chatId}`, 'GET', undefined, token);
    setMessages(msgs);
    const s = io('http://localhost:3000', { auth: { token } });
    s.emit('join', chatId);
    s.on('message', (msg: any) => {
      if (msg.chatId === chatId) {
        setMessages(m => [...m, msg]);
      }
    });
    setSocket(s);
    const ct = await api(`/tags/assign/${chatId}`, 'GET', undefined, token);
    setChatTags(ct.filter(Boolean));
  };

  const sendMessage = async () => {
    if (!token || !chatId) return;
    const msg = await api('/messages', 'POST', { chatId, text: messageText }, token);
    setMessages([...messages, msg]);
    setMessageText('');
  };

  const createTag = async () => {
    const tag = await api('/tags', 'POST', { name: tagName, color: tagColor }, token!);
    setTags([...tags, tag]);
    setTagName('');
  };

  const assignTag = async (tagId: string) => {
    await api('/tags/assign', 'POST', { chatId, tagId }, token!);
    const ct = await api(`/tags/assign/${chatId}`, 'GET', undefined, token!);
    setChatTags(ct.filter(Boolean));
  };

  if (!token) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border p-2 w-full mb-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2" onClick={handleLogin}>Login</button>
          <button className="bg-gray-500 text-white px-4 py-2" onClick={handleRegister}>Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bot Inbox</h1>
      <div className="mb-4">
        <h2 className="font-semibold">Bots</h2>
        <ul>{bots.map(b => (<li key={b.id}>{b.id}</li>))}</ul>
        <input className="border p-2 mr-2" placeholder="Bot token" value={botToken} onChange={e => setBotToken(e.target.value)} />
        <button className="bg-green-500 text-white px-2 py-1" onClick={addBot}>Add Bot</button>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold">Chat</h2>
        <input className="border p-2 mr-2" placeholder="Chat ID" value={chatId} onChange={e => setChatId(e.target.value)} />
        <button className="bg-blue-500 text-white px-2 py-1" onClick={joinChat}>Join</button>
        <div className="border h-64 overflow-y-auto my-2 p-2">
          {messages.map((m, i) => (
            <div key={i} className={m.fromClient ? 'text-left' : 'text-right'}>
              <span className="inline-block bg-gray-200 px-2 py-1 rounded mb-1">{m.text}</span>
            </div>
          ))}
        </div>
        <input className="border p-2 w-full mb-2" value={messageText} onChange={e => setMessageText(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={sendMessage}>Send</button>
      </div>

      <div>
        <h2 className="font-semibold">Tags</h2>
        <div className="flex gap-2 mb-2">
          <input className="border p-2" placeholder="Name" value={tagName} onChange={e => setTagName(e.target.value)} />
          <input className="border p-2" type="color" value={tagColor} onChange={e => setTagColor(e.target.value)} />
          <button className="bg-green-500 text-white px-2" onClick={createTag}>Create</button>
        </div>
        <div className="flex gap-2 flex-wrap mb-2">
          {tags.map(t => (
            <button key={t.id} style={{ background: t.color }} className="px-2 py-1" onClick={() => assignTag(t.id)}>{t.name}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {chatTags.map((t: any) => (
            <span key={t.id} style={{ background: t.color }} className="px-2 py-1 rounded text-white">{t.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
