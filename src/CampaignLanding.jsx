import { useEffect } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { getGoalContext, trackGoal } from "./lead-tracking.js";
import "./campaigns.css";

function Contact({ campaign, placement, children = "Написать в Telegram", className = "campaign-direct" }) {
  return <a className={className} href="https://t.me/egecxxxx" target="_blank" rel="noreferrer" onClick={() => trackGoal("telegram_click", getGoalContext({ placement, offer: campaign.id }))}>{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}

function RequestLink({ campaign, placement, className = "campaign-button", children }) {
  return <a className={className} href="#request" onClick={() => trackGoal("campaign_cta_click", getGoalContext({ offer: campaign.id, placement }))}>{children || campaign.cta}<ArrowUpRight size={18} aria-hidden="true" /></a>;
}

export function CampaignHeader({ campaign }) {
  return <header className="campaign-header">
    <a className="brand" href="/" aria-label="Egor Digital — на главную"><img src="/assets/images/egor-digital-e.webp" width="43" height="43" alt="" /><span><b>Digital Tools by Egor</b><small>Сайты · CRM · Автоматизация</small></span></a>
    <nav aria-label="Разделы предложения"><a href="#scope">Что входит</a><a href="#proof">Работы</a></nav>
    <Contact campaign={campaign} placement="campaign_header">Telegram</Contact>
    <RequestLink campaign={campaign} placement="campaign_header" className="campaign-header-action">Обсудить задачу</RequestLink>
  </header>;
}

export function CampaignFooter({ campaign }) {
  return <footer className="campaign-footer"><div><strong>Digital Tools by Egor</strong><p>Егор Гецевич · проект веду лично</p></div><Contact campaign={campaign} placement="campaign_footer" /><a href="/privacy" onClick={() => trackGoal("privacy_open", getGoalContext({ placement: "campaign_footer", offer: campaign.id }))}>Политика конфиденциальности</a><span>© 2026</span></footer>;
}

export default function CampaignLanding({ campaign, cases, caseImage: CaseImage, renderForm }) {
  useEffect(() => { trackGoal("campaign_view", getGoalContext({ offer: campaign.id })); }, [campaign.id]);
  const proofCases = campaign.caseNames.map((name) => cases.find((item) => item.name === name)).filter(Boolean);

  return <main className={`campaign-page campaign-${campaign.id}`}>
    <section className="campaign-hero grid-surface">
      <div className="campaign-hero-copy">
        <p className="eyebrow"><span aria-hidden="true" />{campaign.eyebrow}</p>
        <h1>{campaign.lines.map((line, index) => <span className={index === campaign.lines.length - 1 ? "campaign-accent" : ""} key={line}>{line}</span>)}</h1>
        <p className="campaign-intro">{campaign.intro}</p>
        <div className="campaign-actions"><RequestLink campaign={campaign} placement="campaign_hero" /><Contact campaign={campaign} placement="campaign_hero" /></div>
        <dl className="campaign-facts"><div><dt>Стартовая стоимость</dt><dd>{campaign.price}</dd></div><div><dt>Объём первого этапа</dt><dd>{campaign.scope}</dd></div></dl>
        <p className="campaign-timing">{campaign.timing}</p>
      </div>
      <div className="campaign-hero-visual">
        <span className="campaign-visual-label">От задачи до работающего сайта</span>
        <div className="campaign-portrait"><img src="/assets/images/egor-hero-cutout.webp" alt="Егор Гецевич — разработчик сайтов и CRM" width="1086" height="1448" loading="eager" fetchPriority="high" /></div>
        <div className="campaign-person-label"><strong>Егор Гецевич</strong><span>Общаетесь с разработчиком напрямую</span></div>
        <div className="campaign-preview"><span>Реальный проект · {proofCases[0].name}</span><CaseImage item={proofCases[0]} /></div>
      </div>
    </section>

    <div className="campaign-situations" aria-label="Когда это предложение подходит">{campaign.suitable.map((item) => <span key={item}><i aria-hidden="true">↗</i>{item}</span>)}</div>

    <section id="scope" className="section campaign-section">
      <div className="campaign-section-heading"><p className="eyebrow"><span aria-hidden="true" />Состав работы</p><h2>{campaign.outcomeTitle}</h2><p>До старта фиксируем задачу и точную цену. Вы принимаете работу по согласованному результату.</p></div>
      <div className="campaign-deliverables">{campaign.deliverables.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      <p className="campaign-scope-note">{campaign.exclusions}</p>
    </section>

    <section id="proof" className="section campaign-section campaign-proof">
      <div className="campaign-section-heading"><p className="eyebrow"><span aria-hidden="true" />Реальные работы</p><h2>{campaign.proofTitle}</h2><p>{campaign.proofIntro}</p></div>
      <div className="campaign-case-grid">{proofCases.map((item) => <article key={item.name}><a href={item.casePath} className="campaign-case-link" onClick={() => trackGoal("case_open", getGoalContext({ case_name: item.name, placement: "campaign_proof", offer: campaign.id }))}><CaseImage item={item} /><div><span>{item.tags.join(" · ")}</span><h3>{item.name}<ArrowUpRight size={22} aria-hidden="true" /></h3><p>{item.description}</p><strong>Посмотреть кейс</strong></div></a></article>)}</div>
      {campaign.evidenceImage && <div className="campaign-evidence"><div><span className="campaign-mini-label">Пример доставки обращения</span><h3>Проверяем до получателя</h3><p>{campaign.evidenceText}</p></div><img src={campaign.evidenceImage} alt={campaign.evidenceAlt} width="1370" height="1145" loading="lazy" /></div>}
    </section>

    <section className="section campaign-section campaign-process"><div className="campaign-section-heading"><p className="eyebrow"><span aria-hidden="true" />Как начнём</p><h2>Сначала задача.<br />Затем работа.</h2></div><ol><li><strong>Пришлите задачу</strong><p>Ссылка на сайт или описание услуги. Коротко расскажите, что нужно получить.</p></li><li><strong>Согласуем условия</strong><p>Объём, точную стоимость, срок и необходимые доступы — до начала работы.</p></li><li><strong>Проверим результат</strong><p>Покажу готовую работу и вместе пройдём согласованный сценарий.</p></li></ol></section>

    <section className="section campaign-section campaign-faq"><div className="campaign-section-heading"><p className="eyebrow"><span aria-hidden="true" />Перед стартом</p><h2>Вопросы по делу</h2></div><div>{campaign.faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section id="request" className="section campaign-section campaign-request grid-surface"><div className="campaign-section-heading"><p className="eyebrow"><span aria-hidden="true" />Обсудим вашу задачу</p><h2>{campaign.formTitle}</h2><p>Оставьте контакт — уточню детали и предложу состав работы. Окончательная цена и срок после оценки.</p><span className="campaign-request-price">{campaign.label}<strong>{campaign.price}</strong></span><Contact campaign={campaign} placement="campaign_request" /><p className="campaign-small">Удобнее WhatsApp? <a href="https://wa.me/201149692210" target="_blank" rel="noreferrer" onClick={() => trackGoal("whatsapp_click", getGoalContext({ placement: "campaign_request", offer: campaign.id }))}>Напишите напрямую ↗</a></p></div><div className="inline-lead campaign-inline-lead">{renderForm({ service: campaign.service, serviceLabel: campaign.label, price: campaign.price, selectionLabel: `${campaign.label} · ${campaign.price}`, source: `campaign_${campaign.id}`, offer: campaign.id, focused: true, formHeading: "Получить оценку задачи" })}</div></section>
    <div className="campaign-sticky"><span>{campaign.price}</span><RequestLink campaign={campaign} placement="campaign_sticky" className="campaign-header-action">Обсудить задачу</RequestLink></div>
  </main>;
}
