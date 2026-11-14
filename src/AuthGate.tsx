import { FormEvent, useEffect, useState } from 'react'
import { LockKeyhole, Mail, Sparkles, UserRound, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from './supabase'
import App from './App'

export default function AuthGate() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'signup'|'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    if (!supabase) { setError('Supabase пока не настроен. Проверьте переменные окружения сборки.'); setBusy(false); return }
    try {
      if (mode === 'signup') {
        const cleanUsername = username.trim().replace(/^@/, '')
        if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) throw new Error('Никнейм: 3–24 символа, латиница, цифры и _.')
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { display_name: displayName.trim() || cleanUsername, username: cleanUsername } }
        })
        if (error) throw error
        if (data.session) setSession(data.session)
        else setNotice('Проверьте почту и подтвердите адрес, затем войдите в NEXUS.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        setSession(data.session)
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось выполнить запрос') }
    finally { setBusy(false) }
  }

  if (loading) return <div className="auth-loading">NEXUS</div>
  if (session) return <><div className="auth-session-bar"><span><ShieldCheck size={14}/> Вы вошли в NEXUS</span><button onClick={() => supabase?.auth.signOut()}>Выйти</button></div><App /></>
  return <div className="auth-screen">
    <div className="auth-glow auth-glow-one"/><div className="auth-glow auth-glow-two"/>
    <div className="auth-card">
      <div className="auth-brand"><div className="auth-logo">N</div><div><b>NEXUS</b><span>PRIVATE MESSENGER</span></div></div>
      <div className="auth-badge"><Sparkles size={13}/> ВАШЕ ПРОСТРАНСТВО ДЛЯ ОБЩЕНИЯ</div>
      <h1>{mode === 'signup' ? 'Начните с NEXUS.' : 'С возвращением.'}</h1>
      <p className="auth-lead">{mode === 'signup' ? 'Создайте аккаунт и соберите всё важное в одном месте.' : 'Войдите, чтобы продолжить общение.'}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <>
          <label>Как вас называть<div className="auth-input"><UserRound size={17}/><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Ваше имя"/></div></label>
          <label>Уникальный никнейм<div className="auth-input"><span className="at-sign">@</span><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required minLength={3} maxLength={24}/></div></label>
        </>}
        <label>Электронная почта<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></div></label>
        <label>Пароль<div className="auth-input"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Минимум 8 символов" required minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'}/></div></label>
        {error && <div className="auth-error">{error}</div>}{notice && <div className="auth-notice">{notice}</div>}
        <button className="auth-submit" disabled={busy}>{busy ? 'Подождите…' : mode === 'signup' ? 'Создать аккаунт' : 'Войти'} <ArrowRight size={17}/></button>
      </form>
      <div className="auth-switch">{mode==='signup'?'Уже есть аккаунт?':'Впервые в NEXUS?'} <button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('');setNotice('')}}>{mode==='signup'?'Войти':'Создать аккаунт'}</button></div>
      <div className="auth-foot"><ShieldCheck size={14}/> Аккаунт и сессия защищены Supabase Auth. Демоверсия продукта.</div>
    </div>
    <div className="auth-bottom">NEXUS · YOUR WORLD. YOUR CONNECTION.</div>
  </div>
}
