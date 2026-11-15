import { useEffect, useMemo, useState } from 'react'
import {
  Archive, ArrowLeft, Bell, Check, CheckCheck, ChevronDown,
  ChevronRight, CircleHelp, Compass, FileImage, Hash, LockKeyhole,
  MessageCircle, MoreHorizontal, Paperclip, Phone, Plus, Search, Send, Mic, Heart, Ban, Flag, Trash2, Play, Pause,
  Settings, ShieldCheck, Sparkles, Users, Video, X, UserPlus, Camera, BellRing, Globe
} from 'lucide-react'

type Tab = 'chats' | 'channels' | 'ai' | 'settings' | 'profile'
type Chat = {
  id: number
  name: string
  handle: string
  message: string
  time: string
  unread?: number
  online?: boolean
  color: string
  initials: string
  verified?: boolean
  blocked?: boolean
  respects?: number
  bio?: string
  phone?: string
}

const initialChats: Chat[] = [
  { id: 1, name: 'Александр', handle: '@alexander', message: 'Кстати, я посмотрел твой проект', time: '12:38', unread: 2, online: true, color: 'blue', initials: 'А' },
  { id: 2, name: 'Мария', handle: '@maria_v', message: 'Отправила фотографии ✨', time: '11:52', unread: 1, color: 'violet', initials: 'М' },
  { id: 3, name: 'NEXUS Team', handle: '3 участника', message: 'Ты: Отлично, продолжаем!', time: 'Вчера', color: 'cyan', initials: 'N', verified: true },
  { id: 4, name: 'Даниил', handle: '@dan_dev', message: 'Голосовое сообщение', time: 'Вчера', color: 'orange', initials: 'Д' },
  { id: 5, name: 'Екатерина', handle: '@katya', message: 'Спасибо большое ❤️', time: 'Пн', color: 'pink', initials: 'Е' },
  { id: 6, name: 'Илья', handle: '@ilya_works', message: 'Договорились', time: 'Вс', color: 'green', initials: 'И' },
]

const channels = [
  { name: 'NEXUS Updates', tag: '@nexus_updates', desc: 'Новости и обновления проекта', count: '12.8K', color: 'blue', initials: 'N' },
  { name: 'Design Space', tag: '@designspace', desc: 'Дизайн, интерфейсы и вдохновение', count: '8.4K', color: 'violet', initials: 'D' },
  { name: 'Technology Now', tag: '@technow', desc: 'Технологии, AI и будущее', count: '24.1K', color: 'cyan', initials: 'T' },
]

function Avatar({ name, color, initials, online, size = 'normal' }: { name: string; color: string; initials: string; online?: boolean; size?: 'normal' | 'large' }) {
  return <div className={`avatar avatar-${color} ${size === 'large' ? 'avatar-large' : ''}`} aria-label={name}>
    <span>{initials}</span>{online && <i className="online-dot" />}
  </div>
}

function App() {
  const [tab, setTab] = useState<Tab>('chats')
  const [chatList,setChatList] = useState<Chat[]>(()=>{try{return JSON.parse(localStorage.getItem('nexus-demo-chats')||'null')||initialChats}catch{return initialChats}})
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [viewingFriend, setViewingFriend] = useState<Chat | null>(null)
  const [ownProfile] = useState<any>(() => { try { return JSON.parse(localStorage.getItem('nexus_demo_profile') || 'null') } catch { return null } })
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [callMode,setCallMode]=useState<'audio'|'video'|null>(null)
  const [chatMenu,setChatMenu]=useState(false)
  const [reportOpen,setReportOpen]=useState(false)
  const [voicePlaying,setVoicePlaying]=useState(false)
  const [avatarData,setAvatarData]=useState(()=>localStorage.getItem('nexus-demo-avatar')||'')
  const [messagesByChat, setMessagesByChat] = useState<Record<number, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem('nexus-demo-messages') || '{}') } catch { return {} }
  })
  const sentMessages = activeChat ? (messagesByChat[activeChat.id] || []) : []
  const [theme, setTheme] = useState<'dark' | 'light' | 'black'>(() => {
    const saved = localStorage.getItem('nexus-demo-theme')
    return saved === 'light' || saved === 'black' ? saved : 'dark'
  })
  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexus-demo-subscriptions') || '[]') } catch { return [] }
  })
  const [showImport, setShowImport] = useState(false)
  const [fileName, setFileName] = useState('')
  const [dialog, setDialog] = useState<'new-chat' | 'edit-profile' | 'create-channel' | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactHandle, setContactHandle] = useState('')
  const [profileName, setProfileName] = useState(ownProfile?.displayName || '')
  const [profileUsername, setProfileUsername] = useState(ownProfile?.username || '')
  const [profileBio, setProfileBio] = useState(ownProfile?.bio || '')
  const [profilePhone,setProfilePhone]=useState(ownProfile?.phone||'')
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [customChannels, setCustomChannels] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('nexus-demo-custom-channels') || '[]') } catch { return [] } })
  const [settingsFlags, setSettingsFlags] = useState<Record<string, boolean>>(() => { try { return JSON.parse(localStorage.getItem('nexus-demo-settings') || '{"push":true,"sound":true,"phone":false,"read":true}') } catch { return {push:true,sound:true,phone:false,read:true} } })
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiAnswer, setAiAnswer] = useState('Привет! Я NEXUS AI. Я помогу тебе разобраться в идеях, написать сообщение или кратко пересказать переписку. С чего начнём?')

  useEffect(() => { localStorage.setItem('nexus-demo-messages', JSON.stringify(messagesByChat)) }, [messagesByChat])
  useEffect(()=>{localStorage.setItem('nexus-demo-chats',JSON.stringify(chatList))},[chatList])
  useEffect(() => { localStorage.setItem('nexus-demo-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('nexus-demo-subscriptions', JSON.stringify(subscriptions)) }, [subscriptions])
  useEffect(() => { localStorage.setItem('nexus-demo-custom-channels', JSON.stringify(customChannels)) }, [customChannels])
  useEffect(() => { localStorage.setItem('nexus-demo-settings', JSON.stringify(settingsFlags)) }, [settingsFlags])

  const filteredChats = useMemo(() => chatList.filter(chat => !chat.blocked &&
    (chat.name + chat.message + chat.handle).toLowerCase().includes(query.toLowerCase())
  ), [query, chatList])

  const sendMessage = () => {
    if (!message.trim()) return
    if (activeChat) { setMessagesByChat(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), message.trim()] })); setChatList(prev=>prev.map(c=>c.id===activeChat.id?{...c,message:message.trim(),time:'сейчас'}:c)) }
    setMessage('')
  }
  const sendVoice=()=>{if(!activeChat)return;setMessagesByChat(p=>({...p,[activeChat.id]:[...(p[activeChat.id]||[]),'__VOICE__']}));setChatList(p=>p.map(c=>c.id===activeChat.id?{...c,message:'Голосовое сообщение',time:'сейчас'}:c))}
  const deleteChat=()=>{if(!activeChat)return;setChatList(p=>p.filter(c=>c.id!==activeChat.id));setMessagesByChat(p=>{const n={...p};delete n[activeChat.id];return n});setActiveChat(null);setChatMenu(false)}
  const blockChat=()=>{if(!activeChat)return;setChatList(p=>p.map(c=>c.id===activeChat.id?{...c,blocked:!c.blocked}:c));setActiveChat(null);setChatMenu(false)}
  const respect=()=>{if(!activeChat)return;setChatList(p=>p.map(c=>c.id===activeChat.id?{...c,respects:(c.respects||0)+1}:c));setActiveChat(p=>p?{...p,respects:(p.respects||0)+1}:null)}

  const askAI = () => {
    if (!aiPrompt.trim()) return
    const q = aiPrompt.trim().toLowerCase()
    let answer = 'Я пока работаю в локальном демо-режиме. Попробуй попросить меня написать сообщение, придумать идею, перевести фразу или кратко пересказать текст.'
    if (/привет|здравствуй|hello/.test(q)) answer = 'Привет! Рад видеть тебя в NEXUS. Чем займёмся сегодня?'
    else if (/сообщен|письм|ответ/.test(q)) answer = 'Вот вариант: «Привет! Спасибо, что написал. Я всё посмотрел — давай обсудим детали и выберем удобное время». Могу сделать тон дружелюбнее или официальнее.'
    else if (/иде|придум|стартап|проект/.test(q)) answer = 'Идея для старта: выбери одну конкретную проблему пользователей, сделай минимальное решение за неделю и покажи его пяти потенциальным клиентам. Затем улучшай продукт по их обратной связи.'
    else if (/перевед|translate/.test(q)) answer = 'Напиши текст и укажи язык перевода — в этой демо-версии я покажу примерный сценарий работы.'
    else if (/кратко|сумм|перескаж/.test(q)) answer = 'Пришли текст переписки, и я помогу выделить главную мысль, решения и следующие действия. В текущем демо я не читаю ваши чаты автоматически.'
    setAiAnswer(answer)
    setAiPrompt('')
  }

  const title = viewingFriend ? viewingFriend.name : tab === 'chats' ? 'Сообщения' : tab === 'channels' ? 'Каналы' : tab === 'ai' ? 'NEXUS AI' : tab === 'settings' ? 'Настройки' : 'Профиль'

  return (
    <div className={`app theme-${theme}`}>
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">N</div>
          <div className="brand-copy"><strong>NEXUS</strong><span>PRIVATE MESSENGER</span></div>
          <button className="icon-button sidebar-more" aria-label="Дополнительно"><MoreHorizontal size={20} /></button>
        </div>
        <div className="sidebar-search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск" /></div>
        <div className="side-label">РАЗДЕЛЫ</div>
        <nav className="nav-list">
          <NavButton active={tab === 'chats'} icon={<MessageCircle />} label="Чаты" count="6" onClick={() => { setTab('chats'); setActiveChat(null) }} />
          <NavButton active={tab === 'channels'} icon={<Compass />} label="Каналы" onClick={() => { setTab('channels'); setActiveChat(null) }} />
          <NavButton active={tab === 'ai'} icon={<Sparkles />} label="NEXUS AI" onClick={() => { setTab('ai'); setActiveChat(null) }} />
        </nav>
        <div className="side-label side-label-spaced">ЛИЧНОЕ</div>
        <nav className="nav-list">
          <NavButton active={tab === 'settings'} icon={<Settings />} label="Настройки" onClick={() => { setTab('settings'); setActiveChat(null) }} />
          <NavButton active={tab === 'profile'} icon={<Users />} label="Профиль" onClick={() => { setTab('profile'); setActiveChat(null) }} />
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini"><Avatar name="Ваш профиль" initials="D" color="blue" /><div><b>Ваш профиль</b><span>@yourname</span></div><ChevronDown size={16} /></div>
          <div className="privacy-note"><ShieldCheck size={15} /><span>Ваше пространство под контролем</span></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div><div className="eyebrow">YOUR WORLD. YOUR CONNECTION.</div><h1>{activeChat && !viewingFriend ? activeChat.name : title}</h1></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Поиск"><Search size={19} /></button>
            <button className="icon-button" aria-label="Помощь"><CircleHelp size={19} /></button>
            <Avatar name="Ваш профиль" initials="D" color="blue" />
          </div>
        </header>

        {tab === 'chats' && !activeChat && <section className="content-area">
          <div className="welcome-banner">
            <div className="welcome-orb"><Sparkles size={22} /></div>
            <div className="welcome-copy"><span>РАДЫ ВАС ВИДЕТЬ</span><h2>Всё важное —<br />в одном месте.</h2><p>Общайтесь, делитесь идеями и оставайтесь на связи.</p></div>
            <div className="banner-glow" />
          </div>
          <div className="section-heading"><div><h2>Ваши чаты</h2><p>Недавние переписки</p></div><button className="primary-button small" onClick={() => setDialog('new-chat')}><Plus size={16} /> Новый чат</button></div>
          <div className="chat-list">
            {filteredChats.map(chat => <button className="chat-row" key={chat.id} onClick={() => { setActiveChat(chat) }}>
              <Avatar name={chat.name} initials={chat.initials} color={chat.color} online={chat.online} />
              <div className="chat-info"><div className="chat-name">{chat.name}{chat.verified && <span className="verified"><Check size={11} /></span>}</div><p>{chat.message}</p></div>
              <div className="chat-meta"><time>{chat.time}</time>{chat.unread && <span className="unread">{chat.unread}</span>}</div>
            </button>)}
          </div>
        </section>}

        {viewingFriend && <section className="content-area friend-profile-page"><button className="profile-back" onClick={() => setViewingFriend(null)}><ArrowLeft size={17}/> Назад к чату</button><div className="profile-cover"><div className="profile-cover-glow" /></div><div className="profile-card friend-profile-card"><Avatar name={viewingFriend.name} initials={viewingFriend.initials} color={viewingFriend.color} online={viewingFriend.online} size="large" /><div className="profile-title"><h2>{viewingFriend.name}</h2><span>{viewingFriend.handle}</span></div><p>{viewingFriend.bio || (viewingFriend.online ? 'Сейчас в сети' : 'Пользователь NEXUS')}</p><div className="profile-stats"><div><b>{viewingFriend.respects||0}</b><span>Респект</span></div><div><b>1</b><span>Общий чат</span></div><div><b>2026</b><span>В NEXUS</span></div></div><button className="primary-button full friend-message-button" onClick={() => setViewingFriend(null)}>Написать сообщение</button></div></section>}

        {tab === 'chats' && activeChat && !viewingFriend && <section className="conversation">
          <div className="conversation-head">
            <button className="back-button" onClick={() => setActiveChat(null)}><ArrowLeft size={19} /></button>
            <Avatar name={activeChat.name} initials={activeChat.initials} color={activeChat.color} online={activeChat.online} />
            <button className="conversation-person profile-open-button" onClick={() => setViewingFriend(activeChat)}><b>{activeChat.name}</b><span>{activeChat.online ? 'в сети' : activeChat.handle}</span></button>
            <button className="icon-button" aria-label="Аудиозвонок · демо" onClick={()=>setCallMode('audio')}><Phone size={18}/></button><button className="icon-button" aria-label="Видеозвонок · демо" onClick={()=>setCallMode('video')}><Video size={18}/></button><button className="icon-button" aria-label="Меню чата" onClick={()=>setChatMenu(true)}><MoreHorizontal size={20}/></button>
          </div>
          <div className="history-pill"><LockKeyhole size={13} /> Начало вашей истории в NEXUS</div>
          <div className="message-day">СЕГОДНЯ</div>
          <div className="message-line"><div className="bubble bubble-in">Привет! Как продвигается NEXUS?<time>12:32</time></div></div>
          <div className="message-line mine"><div className="bubble bubble-out">Отлично! Сейчас собираем основу интерфейса.<time>12:34 <CheckCheck size={12} /></time></div></div>
          <div className="message-line"><div className="bubble bubble-in">Классно. Уже не терпится попробовать!<time>12:36</time></div></div>
          {sentMessages.map((item, i) => <div className="message-line mine" key={i}><div className="bubble bubble-out">{item==='__VOICE__'?<div className="voice-demo"><button onClick={()=>setVoicePlaying(!voicePlaying)}>{voicePlaying?<Pause size={16}/>:<Play size={16}/>}</button><b>Голосовое сообщение</b><span>▂▅▃▇▅▂▆▃▅▇</span><small>0:12</small></div>:item}<time>сейчас <Check size={12}/></time></div></div>)}
          <div className="conversation-spacer" />
          <div className="composer"><button className="icon-button"><Paperclip size={19}/></button><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Написать сообщение..."/><button className="icon-button" onClick={sendVoice} aria-label="Голосовое демо"><Mic size={18}/></button><button className="send-button" onClick={sendMessage}><Send size={17}/></button></div>
          {showImport && <div className="modal-backdrop" onClick={() => setShowImport(false)}><div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowImport(false)}><X size={18} /></button><div className="modal-icon"><Archive size={22} /></div><span className="eyebrow">NEXUS HISTORY</span><h2>Импорт переписки</h2><p>Выберите экспортированный архив Telegram, WhatsApp или другого поддерживаемого мессенджера. Это демонстрация интерфейса — обработка архивов появится на следующем этапе.</p>
            <label className="upload-zone"><FileImage size={23} /><b>{fileName || 'Выберите архив переписки'}</b><span>ZIP, JSON или TXT · предварительный просмотр будет добавлен позже</span><input type="file" accept=".zip,.json,.txt" onChange={e => setFileName(e.target.files?.[0]?.name || '')} /></label>
            <button className="primary-button full" disabled={!fileName} onClick={() => setShowImport(false)}>Понятно</button>
          </div></div>}
        </section>}

        {tab === 'channels' && <section className="content-area">
          <div className="section-heading"><div><h2>Открывайте новое</h2><p>Каналы по вашим интересам</p></div><button className="primary-button small" onClick={() => setDialog('create-channel')}><Plus size={16} /> Создать</button></div>
          <div className="channel-feature"><div className="feature-icon"><Hash size={25} /></div><div><span className="eyebrow">NEXUS CHANNELS</span><h2>Ваши идеи находят аудиторию.</h2><p>Подписывайтесь на интересное и делитесь своим.</p></div></div>
          <div className="channel-list">{[...channels, ...customChannels].map(channel => <div className="channel-row" key={channel.tag}><Avatar name={channel.name} initials={channel.initials} color={channel.color} /><div className="channel-info"><b>{channel.name}</b><span>{channel.desc}</span><small>{channel.count} подписчиков</small></div><button className="outline-button" onClick={() => setSubscriptions(prev => prev.includes(channel.tag) ? prev.filter(x => x !== channel.tag) : [...prev, channel.tag])}>{subscriptions.includes(channel.tag) ? 'Вы подписаны' : 'Подписаться'}</button></div>)}</div>
        </section>}

        {tab === 'ai' && <section className="content-area ai-area">
          <div className="ai-intro"><div className="ai-symbol"><Sparkles size={29} /></div><span className="eyebrow">YOUR PERSONAL INTELLIGENCE</span><h2>Думайте шире.<br /><em>Создавайте больше.</em></h2><p>NEXUS AI — помощник, который будет рядом в ваших разговорах и идеях.</p></div>
          <div className="ai-chat-card"><div className="ai-message"><div className="ai-mini"><Sparkles size={15} /></div><p>{aiAnswer}</p></div><div className="ai-suggestions"><button onClick={() => setAiPrompt('Помоги написать сообщение')}>Помоги написать</button><button onClick={() => setAiPrompt('Кратко перескажи переписку')}>Суммируй чат</button><button onClick={() => setAiPrompt('Переведи текст')}>Перевести</button></div><div className="ai-input"><input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} placeholder="Спросите NEXUS AI..." /><button className="send-button" onClick={askAI}><Send size={17} /></button></div></div>
          <p className="demo-caption">Локальный сценарный режим · без API и платных запросов</p>
        </section>}

        {tab === 'settings' && <section className="content-area">
          <div className="settings-profile"><Avatar name="Ваш профиль" initials="D" color="blue" size="large" /><div><b>Ваш профиль</b><span>@yourname</span></div><button className="outline-button" onClick={() => setDialog('edit-profile')}>Изменить</button></div>
          <div className="settings-group"><span className="side-label">ВНЕШНИЙ ВИД</span><div className="setting-row"><div className="setting-icon"><Sparkles size={18} /></div><div><b>Тема оформления</b><span>Выберите настроение NEXUS</span></div><select value={theme} onChange={e => setTheme(e.target.value as typeof theme)}><option value="dark">Тёмная</option><option value="light">Светлая</option><option value="black">Чёрная · белые сообщения</option></select></div></div>
          <div className="settings-group"><span className="side-label">ПРИВАТНОСТЬ И БЕЗОПАСНОСТЬ</span><SettingToggle icon={<Globe />} title="Показывать номер телефона" desc="Видимость номера для других" checked={settingsFlags.phone} onChange={() => setSettingsFlags(p => ({...p,phone:!p.phone}))} /><SettingToggle icon={<ShieldCheck />} title="Отчёты о прочтении" desc="Показывать статус прочтения" checked={settingsFlags.read} onChange={() => setSettingsFlags(p => ({...p,read:!p.read}))} /><SettingToggle icon={<BellRing />} title="Push-уведомления" desc="Получать уведомления о сообщениях" checked={settingsFlags.push} onChange={() => setSettingsFlags(p => ({...p,push:!p.push}))} /><SettingToggle icon={<Bell />} title="Звуки уведомлений" desc="Звуковое оповещение" checked={settingsFlags.sound} onChange={() => setSettingsFlags(p => ({...p,sound:!p.sound}))} /></div>
          <div className="settings-group"><span className="side-label">ПОДДЕРЖКА</span><SettingRow icon={<CircleHelp />} title="Помощь" desc="Ответы на частые вопросы" /></div>
        </section>}

        {tab === 'profile' && <section className="content-area">
          <div className="profile-cover"><div className="profile-cover-glow" /></div>
          <div className="profile-card own-profile-card"><label className="avatar-upload">{avatarData?<img src={avatarData} alt="Аватар"/>:<Avatar name="Ваш профиль" initials={(ownProfile?.displayName || "D").slice(0,1).toUpperCase()} color="blue" size="large"/>}<input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file){const reader=new FileReader();reader.onload=()=>{const v=String(reader.result);setAvatarData(v);localStorage.setItem('nexus-demo-avatar',v)};reader.readAsDataURL(file)}}}/></label><div className="profile-title"><h2>{ownProfile?.displayName || "Ваш профиль"}</h2><span>@{ownProfile?.username || "yourname"}</span></div><button className="outline-button" onClick={() => setDialog('edit-profile')}>Редактировать</button><p>{ownProfile?.bio || "Добавьте описание, чтобы друзья могли узнать вас поближе."}</p><div className="profile-details"><span>Телефон</span><b>{ownProfile?.phone||'Не указан'}</b></div><div className="profile-stats"><div><b>6</b><span>Чатов</span></div><div><b>3</b><span>Канала</span></div><div><b>2026</b><span>С NEXUS</span></div></div></div>
        </section>}
      </main>


      {callMode && <div className="modal-backdrop" onClick={()=>setCallMode(null)}><div className="modal-card" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setCallMode(null)}><X size={18}/></button><div className="modal-icon"><Phone size={22}/></div><span className="eyebrow">NEXUS CALL · DEMO</span><h2>{activeChat?.name}</h2><p>{callMode==='audio'?'Аудиозвонок':'Видеозвонок'} — имитация интерфейса, реального соединения нет.</p><button className="primary-button full" onClick={()=>setCallMode(null)}>Завершить вызов</button></div></div>}
      {chatMenu && activeChat && <div className="modal-backdrop" onClick={()=>setChatMenu(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setChatMenu(false)}><X size={18}/></button><h2>Действия с чатом</h2><button className="action-row" onClick={()=>{setChatMenu(false);setViewingFriend(activeChat)}}><Users/>Профиль собеседника</button><button className="action-row" onClick={respect}><Heart/>Поставить респект · {activeChat.respects||0}</button><button className="action-row" onClick={blockChat}><Ban/>Заблокировать</button><button className="action-row" onClick={()=>{setChatMenu(false);setReportOpen(true)}}><Flag/>Пожаловаться</button><button className="action-row danger" onClick={deleteChat}><Trash2/>Удалить чат</button></div></div>}
      {reportOpen && <div className="modal-backdrop" onClick={()=>setReportOpen(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}><h2>Жалоба · демо</h2><p>Сценарий не отправляет жалобу на сервер.</p><select className="report-select"><option>Спам</option><option>Мошенничество</option><option>Оскорбления</option><option>Другое</option></select><button className="primary-button full" onClick={()=>setReportOpen(false)}>Готово</button></div></div>}
      {dialog && <div className="modal-backdrop" onClick={() => setDialog(null)}><div className="modal-card feature-dialog" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setDialog(null)}><X size={18}/></button>
        {dialog === 'new-chat' && <><div className="modal-icon"><UserPlus size={22}/></div><span className="eyebrow">NEXUS CONTACTS</span><h2>Новый чат</h2><p>Добавьте демонстрационный контакт по имени и username.</p><label className="field-label">Имя<input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Например, Алексей"/></label><label className="field-label">Username<input value={contactHandle} onChange={e=>setContactHandle(e.target.value.replace(/^@/,''))} placeholder="username"/></label><button className="primary-button full" disabled={!contactName.trim() || contactHandle.trim().length<3} onClick={()=>{const c:Chat={id:Date.now(),name:contactName.trim(),handle:'@'+contactHandle.trim(),message:'Новый чат',time:'сейчас',online:false,color:'blue',initials:contactName.trim().slice(0,1).toUpperCase()};setChatList(p=>[c,...p]);setActiveChat(c);setTab('chats');setDialog(null);setContactName('');setContactHandle('')}}>Создать чат</button></>}
        {dialog === 'edit-profile' && <><div className="modal-icon"><Camera size={22}/></div><span className="eyebrow">YOUR IDENTITY</span><h2>Редактировать профиль</h2><p>Эти данные сохраняются локально на этом устройстве.</p><label className="field-label">Имя<input value={profileName} onChange={e=>setProfileName(e.target.value)} placeholder="Ваше имя"/></label><label className="field-label">Username<input value={profileUsername} onChange={e=>setProfileUsername(e.target.value.replace(/^@/,''))} placeholder="username"/></label><label className="field-label">О себе<textarea value={profileBio} onChange={e=>setProfileBio(e.target.value)} placeholder="Расскажите немного о себе"/></label><label className="field-label">Телефон<input value={profilePhone} onChange={e=>setProfilePhone(e.target.value)} placeholder="+7 ..."/></label><button className="primary-button full" disabled={profileName.trim().length<2 || profileUsername.trim().length<3} onClick={()=>{const p={...(ownProfile||{}),displayName:profileName.trim(),username:profileUsername.trim(),bio:profileBio.trim(),phone:profilePhone.trim()};localStorage.setItem('nexus_demo_profile',JSON.stringify(p));setDialog(null);window.location.reload()}}>Сохранить изменения</button></>}
        {dialog === 'create-channel' && <><div className="modal-icon"><Globe size={22}/></div><span className="eyebrow">NEXUS CHANNELS</span><h2>Создать канал</h2><p>Создайте локальный демонстрационный канал.</p><label className="field-label">Название<input value={channelName} onChange={e=>setChannelName(e.target.value)} placeholder="Название канала"/></label><label className="field-label">Описание<textarea value={channelDescription} onChange={e=>setChannelDescription(e.target.value)} placeholder="О чём этот канал?"/></label><button className="primary-button full" disabled={channelName.trim().length<2} onClick={()=>{setCustomChannels(p=>[{name:channelName.trim(),tag:'@'+channelName.trim().toLowerCase().replace(/[^a-z0-9а-яё]+/gi,'_'),desc:channelDescription.trim()||'Новый канал NEXUS',count:'1',color:'blue',initials:channelName.trim().slice(0,1).toUpperCase()},...p]);setChannelName('');setChannelDescription('');setDialog(null)}}>Создать канал</button></>}
      </div></div>}

      <nav className="mobile-nav">
        <MobileNav active={tab === 'chats'} icon={<MessageCircle />} label="Чаты" onClick={() => { setTab('chats'); setActiveChat(null) }} />
        <MobileNav active={tab === 'channels'} icon={<Compass />} label="Каналы" onClick={() => { setTab('channels'); setActiveChat(null) }} />
        <MobileNav active={tab === 'ai'} icon={<Sparkles />} label="ИИ" onClick={() => { setTab('ai'); setActiveChat(null) }} />
        <MobileNav active={tab === 'settings'} icon={<Settings />} label="Настройки" onClick={() => { setTab('settings'); setActiveChat(null) }} />
        <MobileNav active={tab === 'profile'} icon={<Users />} label="Профиль" onClick={() => { setTab('profile'); setActiveChat(null) }} />
      </nav>
    </div>
  )
}

function NavButton({ active, icon, label, count, onClick }: { active: boolean; icon: React.ReactNode; label: string; count?: string; onClick: () => void }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count && <small>{count}</small>}</button>
}
function MobileNav({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`mobile-nav-button ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span></button>
}
function SettingToggle({icon,title,desc,checked,onChange}:{icon:React.ReactNode;title:string;desc:string;checked:boolean;onChange:()=>void}) { return <button className="setting-row setting-toggle" onClick={onChange}><div className="setting-icon">{icon}</div><div><b>{title}</b><span>{desc}</span></div><span className={`toggle-track ${checked?'on':''}`}><i/></span></button> }
function SettingRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return <button className="setting-row"><div className="setting-icon">{icon}</div><div><b>{title}</b><span>{desc}</span></div><ChevronRight size={17} /></button>
}

export default App