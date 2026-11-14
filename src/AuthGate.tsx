import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Mail, Phone, ShieldCheck, Sparkles, UserRound, AtSign, RefreshCw } from 'lucide-react'
import { supabase } from './supabase'
import App from './App'

type Step = 'contacts' | 'code' | 'profile'

export default function AuthGate() {
  const [session, setSession] = useState<any>(null)
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
    return () => data.subscription.unsubscribe()
  }, [])

  const sendCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    if (!supabase) { setError('Сервис авторизации не настроен.'); setBusy(false); return }
    try {
      const cleanPhone = phone.trim()
      if (!/^\+[1-9]\d{7,14}$/.test(cleanPhone)) throw new Error('Введите номер в международном формате, например +79991234567.')
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true, data: { phone_number: cleanPhone } }
      })
      if (error) throw error
      setStep('code')
      setNotice(isLogin ? 'Код для входа отправлен на вашу почту.' : 'Код отправлен на вашу почту. Проверьте входящие и папку «Спам».')
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось отправить код.') }
    finally { setBusy(false) }
  }

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      if (!supabase) throw new Error('Сервис авторизации не настроен.')
      const token = code.replace(/\D/g, '')
      if (token.length !== 6) throw new Error('Введите шестизначный код из письма.')
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' })
      if (error) throw error
      setSession(data.session)
      setStep('profile')
      setNotice(isLogin ? 'Вход выполнен. Добро пожаловать обратно!' : 'Почта подтверждена. Теперь создайте профиль.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Код не подошёл. Проверьте его и попробуйте ещё раз.') }
    finally { setBusy(false) }
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      if (!supabase) throw new Error('Сервис авторизации не настроен.')
      const cleanUsername = username.trim().replace(/^@/, '')
      if (displayName.trim().length < 2) throw new Error('Имя должно содержать хотя бы 2 символа.')
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) throw new Error('Никнейм: 3–24 символа, латиница, цифры и _.')
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim(), username: cleanUsername, phone_number: phone.trim(), nexus_profile_complete: true }
      })
      if (error) throw error
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userData.user.id,
          username: cleanUsername,
          display_name: displayName.trim()
        }, { onConflict: 'id' })
        if (profileError) throw profileError
      }
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось сохранить профиль.') }
    finally { setBusy(false) }
  }

  const resendCode = async () => {
    setBusy(true); setError(''); setNotice('')
    try {
      if (!supabase) throw new Error('Сервис авторизации не настроен.')
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: isLogin ? { shouldCreateUser: false } : { shouldCreateUser: true, data: { phone_number: phone.trim() } } })
      if (error) throw error
      setNotice('Новый код отправлен. Проверьте почту.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось отправить код.') }
    finally { setBusy(false) }
  }

  if (loading) return <div className="auth-loading">NEXUS</div>
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
      <p className="auth-lead">{step === 'contacts' ? {isLogin ? 'Укажите электронную почту, привязанную к вашему аккаунту. Мы отправим код для входа.' : 'Укажите номер телефона и электронную почту. На почту отправим одноразовый код.'} : step === 'code' ? `Мы отправили шестизначный код на ${email}. Введите его ниже.` : 'Придумайте имя и уникальный никнейм. Так вас смогут найти в NEXUS.'}</p>
      {step === 'contacts' && <form onSubmit={sendCode} className="auth-form">
        {!isLogin && <label>Номер телефона<div className="auth-input"><Phone/><input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+7 999 123-45-67" required/></div><small>Укажите номер с кодом страны, например +7 или +1</small></label>}
        <label>Электронная почта<div className="auth-input"><Mail/><input type="email" inputMode="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
        <button className="auth-submit" disabled={busy}>{busy ? 'Отправляем код…' : (isLogin ? 'Войти по коду' : 'Получить код')} <ArrowRight/></button>
      </form>}
      {step === 'code' && <form onSubmit={verifyCode} className="auth-form">
        <label>Код из письма<div className="auth-input auth-code-input"><ShieldCheck/><input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required/></div></label>
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
      <div className="auth-foot"><ShieldCheck size={15}/> {step === 'contacts' ? (isLogin ? 'Войдите с помощью одноразового кода из письма.' : 'Код подтверждения приходит на электронную почту.') : step === 'code' ? 'Никому не сообщайте код подтверждения.' : 'Ваши данные профиля можно будет изменить позже.'}</div>
    </section>
    <div className="auth-bottom">NEXUS · YOUR WORLD. YOUR CONNECTION.</div>
  </main>
}
