import { useCallback, useEffect, useRef, useState } from 'react';

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

const OPEN_KEY = 'flyvio_chat_open';

export function AiChatDock() {
  const [open, setOpen] = useState(() => localStorage.getItem(OPEN_KEY) === '1');
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: '1',
      role: 'assistant',
      text: '您好，我是 Flyvio 智能助手（演示）。可以问我特价趋势、行李规则或如何设置低价提醒。',
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0');
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  const send = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    setInput('');
    const uid = `u-${Date.now()}`;
    setMsgs((m) => [...m, { id: uid, role: 'user', text: t }]);
    window.setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text:
            '（演示回复）建议您在「搜索」页选择航线后查看价格走势提示，或到「我的 → 低价监控」设置目标价。生产环境将接入大模型与实时运价。',
        },
      ]);
    }, 600);
  }, [input]);

  return (
    <div className="flyvio-chat" data-open={open ? 'true' : 'false'}>
      {open && (
        <div className="flyvio-chat__panel" role="dialog" aria-label="智能助手">
          <div className="flyvio-chat__head">
            <strong>智能助手</strong>
            <span className="flyvio-chat__sub">Flyvio · 演示对话</span>
            <button type="button" className="flyvio-chat__close" onClick={() => setOpen(false)} aria-label="关闭">
              ×
            </button>
          </div>
          <div className="flyvio-chat__body">
            {msgs.map((m) => (
              <div key={m.id} className={'flyvio-chat__msg flyvio-chat__msg--' + m.role}>
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flyvio-chat__foot">
            <input
              className="flyvio-chat__input"
              placeholder="输入问题…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button type="button" className="flyvio-chat__send" onClick={send}>
              发送
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        id="flyvio-chat-fab"
        className="flyvio-chat__fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? '收起' : '助手'}
      </button>
    </div>
  );
}
