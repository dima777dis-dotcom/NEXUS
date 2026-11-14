import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Mail, Phone, ShieldCheck, Sparkles, UserRound, AtSign, RefreshCw } from 'lucide-react'
import { supabase } from './supabase'
import App from './App'

type Step = 'contacts' | 'code' | 'profile'

export default function AuthGate() {
  const [session, setSession] = useState<any>(null)
  const [demoProfile, setDemoProfile] = useState<any>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('contacts')
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const savedDemo = localStorage.getItem('nexus_demo_profile')
    if (savedDemo) { try { setDemoProfile(JSON.parse(savedDemo)) } catch { localStorage.removeItem('nexus_demo_profile') } }
    const splashTimer = window.setTimeout(() => setShowWelcome(false), 2200)
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      const current = data.session
      setSession(current)
      if (current && current.user.user_metadata?.nexus_profile_complete) setStep('profile')
      else if (current) setStep('profile')
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next) setStep('profile')
    })
    return () => { data.subscription.unsubscribe(); window.clearTimeout(splashTimer) }
  }, [])

  const sendCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      const cleanEmail = email.trim().toLowerCase()
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(cleanEmail)) throw new Error('Введите корректный адрес электронной почты.')
      if (!isLogin && !/^\\+[1-9]\\d{7,14}$/.test(phone.trim().replace(/[\\s()-]/g, ''))) throw new Error('Введите номер в международном формате, например +79991234567.')
      setEmail(cleanEmail)
      setStep('code')
      setNotice('Демо-режим: используйте код 12345. Письмо отправлять не нужно.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Проверьте введённые данные.') }
    finally { setBusy(false) }
  }

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      if (code.replace(/\\D/g, '') !== '12345') throw new Error('Неверный код. Для демо используйте 12345.')
      if (isLogin) {
        const saved = localStorage.getItem('nexus_demo_profile')
        if (!saved) throw new Error('Аккаунт не найден на этом устройстве. Сначала зарегистрируйтесь.')
        const profile = JSON.parse(saved)
        if (profile.email !== email.trim().toLowerCase()) throw new Error('Аккаунт с этой почтой не найден на этом устройстве.')
        setDemoProfile(profile)
        return
      }
      setStep('profile')
      setNotice('Код принят. Теперь создайте профиль.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Код не подошёл. Проверьте его и попробуйте ещё раз.') }
    finally { setBusy(false) }
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      const cleanUsername = username.trim().replace(/^@/, '')
      if (displayName.trim().length < 2) throw new Error('Имя должно содержать хотя бы 2 символа.')
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) throw new Error('Никнейм: 3–24 символа, латиница, цифры и _.')
      const profile = { email: email.trim().toLowerCase(), phone: phone.trim(), displayName: displayName.trim(), username: cleanUsername }
      localStorage.setItem('nexus_demo_profile', JSON.stringify(profile))
      setDemoProfile(profile)
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось сохранить профиль.') }
    finally { setBusy(false) }
  }

  const resendCode = async () => {
    setNotice('Демо-режим: повторная отправка не требуется. Используйте код 12345.')
    setError('')
  }

  if (showWelcome) return <main className="nexus-welcome"><div className="nexus-welcome-mark">N</div><h1>Добро пожаловать в NEXUS</h1><p>Твоё пространство для общения</p></main>
  if (loading) return <div className="auth-loading">NEXUS</div>
  if (demoProfile) return <><div className="auth-session-bar"><span><ShieldCheck size={15}/> Демо-режим · {demoProfile.displayName}</span><button onClick={() => { localStorage.removeItem('nexus_demo_profile'); setDemoProfile(null); setIsLogin(true); setStep('contacts') }}>Выйти</button></div><App /></>
  if (session?.user?.user_metadata?.nexus_profile_complete) return <><div className="auth-session-bar"><span><ShieldCheck size={15}/> Вы вошли в NEXUS</span><button onClick={() => supabase?.auth.signOut()}>Выйти</button></div><App /></>

  const stepNumber = step === 'contacts' ? 1 : step === 'code' ? 2 : 3
  return <main className="auth-screen">
    <div className="auth-glow auth-glow-one"/><div className="auth-glow auth-glow-two"/>
    <section className="auth-card">
      <div className="auth-brand"><div className="auth-logo">N</div><div><b>NEXUS</b><span>PRIVATE MESSENGER</span></div></div>
      <div className="auth-progress" aria-label={`Шаг ${stepNumber} из 3`}><span className="active"/><span className={stepNumber >= 2 ? 'active' : ''}/><span className={stepNumber >= 3 ? 'active' : ''}/></div>
      <div className="auth-step-label">ШАГ {stepNumber} ИЗ 3 · {step === 'contacts' ? 'КОНТАКТЫ' : step === 'code' ? 'ПОДТВЕРЖДЕНИЕ' : 'ВАШ ПРОФИЛЬ'}</div>
      <div className="auth-badge"><Sparkles size={15}/> ВАШЕ ПРОСТРАНСТВО ДЛЯ ОБЩЕНИЯ</div>
      <h1>{step === 'contacts' ? (isLogin ? 'С возвращением.' : 'Добро пожаловать.') : step === 'code' ? 'Проверьте почту.' : 'Создадим профиль.'}</h1>
      <p className="auth-lead">{step === 'contacts' ? (isLogin ? 'Укажите электронную почту, привязанную к вашему аккаунту. Мы отправим код для входа.' : 'Укажите номер телефона и электронную почту. На почту отправим одноразовый код.') : step === 'code' ? `Демо-код: 12345. Введите его ниже.` : 'Придумайте имя и уникальный никнейм. Так вас смогут найти в NEXUS.'}</p>
      {step === 'contacts' && <form onSubmit={sendCode} className="auth-form">
        {!isLogin && <label>Номер телефона<div className="auth-input"><Phone/><input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+7 999 123-45-67" required/></div><small>Укажите номер с кодом страны, например +7 или +1</small></label>}
        <label>Электронная почта<div className="auth-input"><Mail/><input type="email" inputMode="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
        <button className="auth-submit" disabled={busy}>{busy ? 'Отправляем код…' : (isLogin ? 'Войти по коду' : 'Получить код')} <ArrowRight/></button>
      </form>}
      {step === 'code' && <form onSubmit={verifyCode} className="auth-form">
        <label>Код из письма<div className="auth-input auth-code-input"><ShieldCheck/><input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,5))} placeholder="12345" inputMode="numeric" autoComplete="one-time-code" maxLength={5} required/></div></label>
        <button className="auth-submit" disabled={busy}>{busy ? 'Проверяем…' : 'Подтвердить почту'} <ArrowRight/></button>
        <button type="button" className="auth-secondary" onClick={resendCode} disabled={busy}><RefreshCw size={16}/> Отправить код ещё раз</button>
        <button type="button" className="auth-text-button" onClick={()=>{setStep('contacts');setCode('');setError('');setNotice('')}}>Изменить почту или номер</button>
      </form>}
      {step === 'profile' && <form onSubmit={saveProfile} className="auth-form">
        <label>Ваше имя<div className="auth-input"><UserRound/><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Например, Алекс" autoComplete="name" required minLength={2}/></div></label>
        <label>Уникальный никнейм<div className="auth-input"><AtSign/><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required minLength={3} maxLength={24}/></div><small>Латиница, цифры и подчёркивание. 3–24 символа.</small></label>
        <button className="auth-submit" disabled={busy}>{busy ? 'Сохраняем…' : 'Завершить регистрацию'} <ArrowRight/></button>
      </form>}
      {error && <div className="auth-error" role="alert">{error}</div>}
      {notice && <div className="auth-notice" role="status">{notice}</div>}
      <div className="auth-foot"><ShieldCheck size={15}/> {step === 'contacts' ? (isLogin ? 'Войдите с помощью одноразового кода из письма.' : 'Демо-код для проверки регистрации: 12345.') : step === 'code' ? 'Никому не сообщайте код подтверждения.' : 'Ваши данные профиля можно будет изменить позже.'}</div>
    </section>
    <div className="auth-bottom">NEXUS · YOUR WORLD. YOUR CONNECTION.</div>
  </main>
}
