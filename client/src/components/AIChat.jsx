import { useState, useRef, useEffect, useMemo } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { marked } from 'marked'
import API from '../config'
import './AIChat.css'

marked.setOptions({ breaks: true, gfm: true })

const buildSystemPrompt = (lang, universities) => {
  const uniList = universities.length
    ? universities.map(u => `- ${u.name} (${[u.country, u.city].filter(Boolean).join(', ')})`).join('\n')
    : null

  const uniSection = {
    uz: uniList ? `\n\nBiz xizmat ko'rsatadigan universitetlar ro'yxati:\n${uniList}` : '',
    ru: uniList ? `\n\nСписок университетов, с которыми мы работаем:\n${uniList}` : '',
    en: uniList ? `\n\nList of universities we work with:\n${uniList}` : '',
  }

  const base = {
    uz: `Siz AbiturentTestMarkazi (ATM) konsultantisiz. Vazifangiz — Uzbekiston abituriyentlariga mos xorijiy universitetni tanlashda yordam berish.

Qoida: Agar savol aniq bo'lsa (masalan, "eng yuqori reytingdagi", "Germaniyada", "IT bo'yicha") — to'g'ridan-to'g'ri javob bering. Agar savol shaxsiy tanlash haqida bo'lsa ("menga qaysi mos keladi", "qaysi yaxshi") — aniqlashtiruvchi savollar bering:
- Qaysi yo'nalishda o'qimoqchisiz?
- Qaysi mamlakatda o'qishni xohlaysiz?
- Byudjet qanday?
- Til bilimi qanday?

O'z xohishingizga ko'ra savollar bering, majburiy emas. Qisqa va aniq yozing. Faqat quyidagi ro'yxatdagi universitetlardan tavsiya bering. O'zbek tilida javob bering.`,

    ru: `Вы консультант AbiturentTestMarkazi (ATM). Ваша задача — помочь абитуриентам из Узбекистана выбрать подходящий зарубежный университет.

Правило: Если вопрос конкретный (например, "с наивысшим рейтингом", "в Германии", "по IT") — отвечайте сразу. Если вопрос о личном выборе ("какой мне подойдёт", "какой лучше") — задайте уточняющие вопросы по необходимости:
- Какое направление вас интересует?
- В какой стране хотите учиться?
- Какой бюджет?
- Какой уровень языка?

Задавайте вопросы по своему усмотрению, не обязательно все сразу. Пишите кратко и чётко. Рекомендуйте только из списка ниже. Отвечайте на русском языке.`,

    en: `You are a consultant at AbiturentTestMarkazi (ATM). Your job is to help Uzbek students choose the right foreign university.

Rule: If the question is specific (e.g. "highest ranked", "in Germany", "for IT") — answer directly. If the question is about personal fit ("which suits me", "which is better for me") — ask clarifying questions as needed:
- What field do you want to study?
- Which country do you prefer?
- What is your budget?
- What is your language level?

Ask questions at your discretion, not all at once. Be concise. Only recommend from the list below. Reply in English.`,
  }

  return (base[lang] || base.uz) + (uniSection[lang] || uniSection.uz)
}

const TITLES = {
  uz: 'AI Konsultant',
  ru: 'AI Консультант',
  en: 'AI Consultant'
}

const PLACEHOLDERS = {
  uz: 'Savol yozing...',
  ru: 'Напишите вопрос...',
  en: 'Type your question...'
}

const GREETINGS = {
  uz: "Salom, Men ATM AI konsultantiman. Biz xizmat ko'rsatadigan xorijiy universitetlardan qaysi siz uchun yaxshiroq to'g'ri kelishini tanlash uchun yordam beraman.",
  ru: "Здравствуйте, я AI-консультант ATM. Помогу вам выбрать подходящий зарубежный университет из тех, с которыми мы работаем.",
  en: "Hello, I'm the ATM AI consultant. I'll help you choose the best foreign university from our partner institutions."
}

const ERR_MSG = {
  uz: "AI bilan ulanishda xatolik. Iltimos, qayta urinib ko'ring.",
  ru: "Ошибка подключения к AI. Пожалуйста, попробуйте снова.",
  en: "Connection error. Please try again."
}

function MarkdownMsg({ content, universities, onSelect }) {
  const ref = useRef()

  const html = useMemo(() => {
    let text = content
    console.log('Universities count:', universities?.length, 'Content preview:', text.slice(0, 100))
    if (universities?.length) {
      const sorted = [...universities].sort((a, b) => b.name.length - a.name.length)
      sorted.forEach(u => {
        const escaped = u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        text = text.replace(new RegExp(escaped, 'g'), `\x00UNI\x01${u.name}\x01`)
      })
    }
    let html = marked.parse(text)
    html = html.replace(/\x00UNI\x01(.*?)\x01/g, (_, name) =>
      `<button class="ai-uni-link" data-name="${name}">${name}</button>`
    )
    return html
  }, [content, universities])

  useEffect(() => {
    if (!ref.current) return
    ref.current.querySelectorAll('.ai-uni-link').forEach(btn => {
      btn.onclick = () => onSelect?.(btn.dataset.name)
    })
  })

  return <div className="ai-md" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}

function TypewriterMsg({ content, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    const timer = setInterval(() => {
      idx.current++
      setDisplayed(content.slice(0, idx.current))
      if (idx.current >= content.length) {
        clearInterval(timer)
        onDone?.()
      }
    }, 35)
    return () => clearInterval(timer)
  }, [content])

  return <><div className="ai-md" dangerouslySetInnerHTML={{ __html: marked.parse(displayed) }} /><span className="ai-cursor">|</span></>
}

export default function AIChat({ onSelectUniversity, universities: uniProp = [] }) {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [universities, setUniversities] = useState(uniProp)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: GREETINGS[lang] || GREETINGS.uz, animate: true }
  ])
  const [animated, setAnimated] = useState(new Set())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { setUniversities(uniProp) }, [uniProp])

  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETINGS[lang] || GREETINGS.uz, animate: true }])
    setAnimated(new Set())
  }, [lang])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildSystemPrompt(lang, universities),
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), userMsg]
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || 'Xatolik.', animate: true }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: ERR_MSG[lang] || ERR_MSG.uz, animate: true }])
    }
    setLoading(false)
  }

  const markDone = (i) => setAnimated(prev => new Set([...prev, i]))

  return (
    <>
      <button className="ai-inline-btn" onClick={() => setOpen(v => !v)}>
        <span>AI</span>
      </button>

      {open && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <span>{TITLES[lang] || TITLES.uz}</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                {m.role === 'assistant'
                  ? (m.animate && !animated.has(i)
                    ? <TypewriterMsg content={m.content} onDone={() => markDone(i)} />
                    : <MarkdownMsg content={m.content} universities={universities} onSelect={onSelectUniversity} />)
                  : m.content
                }
              </div>
            ))}
            {loading && <div className="ai-msg assistant ai-typing">...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="ai-input-row">
            <input
              className="ai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={PLACEHOLDERS[lang] || PLACEHOLDERS.uz}
              disabled={loading}
            />
            <button className="ai-send" onClick={send} disabled={loading || !input.trim()}>↑</button>
          </div>
        </div>
      )}
    </>
  )
}
