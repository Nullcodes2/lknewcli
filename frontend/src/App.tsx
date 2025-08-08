import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const api = async (
  path: string,
  method = 'GET',
  body?: any,
  token?: string,
) => {
  const res = await fetch(`/api${path}`, {
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
    const s = io({ auth: { token } });
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
        <div className="min-h-full flex items-center justify-center">
          <div className="w-full max-w-sm space-y-6 p-8 bg-gray-800 border border-gray-700 rounded">
            <h1 className="text-2xl font-semibold text-center">Sign in</h1>
            <input
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-full p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center md:text-left">Bot Inbox</h1>

        <div className="space-y-6">
          <div className="space-y-4 bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Bots</h2>
            <ul className="text-sm text-gray-300">
              {bots.map(b => (<li key={b.id}>{b.id}</li>))}
            </ul>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bot token"
                value={botToken}
                onChange={e => setBotToken(e.target.value)}
              />
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={addBot}
              >
                Add Bot
              </button>
            </div>
          </div>

          <div className="space-y-4 bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Chat</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chat ID"
                value={chatId}
                onChange={e => setChatId(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={joinChat}
              >
                Join
              </button>
            </div>
            <div className="border border-gray-700 h-64 overflow-y-auto my-2 p-2 rounded bg-gray-900">
              {messages.map((m, i) => (
                <div key={i} className={m.fromClient ? 'text-left' : 'text-right'}>
                  <span
                    className={`inline-block px-3 py-1 rounded mb-1 text-white ${m.fromClient ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>

          <div className="space-y-4 bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Tags</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name"
                value={tagName}
                onChange={e => setTagName(e.target.value)}
              />
              <input
                className="w-20 h-10 rounded bg-gray-700 border border-gray-600"
                type="color"
                value={tagColor}
                onChange={e => setTagColor(e.target.value)}
              />
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={createTag}
              >
                Create
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map(t => (
                <button
                  key={t.id}
                  style={{ background: t.color }}
                  className="px-2 py-1 rounded text-white"
                  onClick={() => assignTag(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {chatTags.map((t: any) => (
                <span
                  key={t.id}
                  style={{ background: t.color }}
                  className="px-2 py-1 rounded text-white"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}
