import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";

const nav = [
  ["/", "Главная"], ["/services", "Услуги"], ["/cases", "Кейсы"],
  ["/pricing", "Цены"], ["/process", "Процесс"], ["/about", "Обо мне"], ["/contacts", "Контакты"],
];
const knownPaths = new Set([...nav.map(([href]) => href), "/privacy"]);

const contactLinks = [
  { label: "Telegram", value: "@egecxxxx", href: "https://t.me/egecxxxx", action: "Открыть диалог" },
  { label: "WhatsApp", value: "+20 114 969 2210", href: "https://wa.me/201149692210", action: "Написать в WhatsApp" },
  { label: "Email", value: "eggetsevich@gmail.com", href: "mailto:eggetsevich@gmail.com", action: "Написать письмо" },
  { label: "Instagram", value: "@_gecevich_", href: "https://www.instagram.com/_gecevich_/", action: "Открыть профиль" },
];

const cases = [
  { name: "Дарья Каминскене", type: "Личный бренд", tags: ["маркетолог", "услуги", "заявки"], image: "/assets/cases/daria-kamins.webp", imageWidth: 1672, imageHeight: 941, description: "Премиальная упаковка личного бренда, услуги, кейсы, доверие и понятный путь к заявке.", result: "Готовый сайт под рекламу, SMM и личные продажи", href: "https://daria-kamins.marketing/" },
  { name: "Green Apple Dent", type: "Сайт", tags: ["стоматология", "админка", "заявки"], image: "/assets/cases/greenappledent.webp", imageWidth: 1672, imageHeight: 941, description: "Сайт стоматологии с услугами, формами записи, админкой заявок и Telegram-уведомлениями.", result: "Готовая система для презентации клиники, заявок и рекламы", href: "https://greenappledent.ru/" },
  { name: "Крыша-мечты", type: "Сайт", tags: ["кровля", "калькулятор", "заявки"], image: "/assets/cases/roof-dream.webp", imageWidth: 1672, imageHeight: 941, description: "Сайт монтажа кровли под ключ с понятной презентацией услуг, преимуществами и расчётом стоимости.", result: "Готовая посадочная страница под рекламу и заявки", href: "https://xn-----6kcvwelc4aqi3di5bh.xn--p1ai/" },
  { name: "NovaDent", type: "Демо-проект", tags: ["стоматология", "CRM", "админка"], image: "/assets/cases/novadent.webp", imageWidth: 1672, imageHeight: 941, description: "Демонстрационный многостраничный сайт стоматологии с записью, заявками, экспортом и Telegram-уведомлениями.", result: "Демо полноценной системы сайта и CRM", href: "https://novadent.egordigital.site/" },
  { name: "Wingfoil Center Dahab", type: "Сайт", tags: ["спорт", "SEO", "аналитика"], image: "/assets/cases/wingfoil-center-dahab.webp", imageWidth: 1536, imageHeight: 960, description: "Сайт школы вингфойла: услуги, доверие, путь до заявки, SEO-база и аналитика.", result: "Люди находят сайт и пишут заявки", href: "https://wingfoildahab.com/" },
  { name: "Casa Maris", type: "Демо-проект", tags: ["отель", "бронь", "админка"], image: "/assets/cases/casa-maris.webp", imageWidth: 1672, imageHeight: 941, description: "Демонстрационный концепт для бутик-отеля: номера, availability, заявки и отдельная админка.", result: "Демо системы для рекламы, заявок и презентации объекта", href: "https://casamaris.egordigital.site/" },
  { name: "Level Home", type: "Демо-проект", tags: ["ремонт", "калькулятор", "кабинет"], image: "/assets/cases/level-home-case.webp", imageWidth: 1672, imageHeight: 941, description: "Демонстрационный премиальный сайт ремонта квартир с калькулятором, фиксированной сметой и кабинетом клиента.", result: "Демо премиального сервиса под рекламу", href: "https://level-home.pages.dev/" },
  { name: "Илья Морозов", type: "Демо-проект", tags: ["фитнес", "тренер", "онлайн-программы"], image: "/assets/cases/fitness-coach.webp", imageWidth: 1536, imageHeight: 864, description: "Демонстрационный многостраничный сайт фитнес-тренера с программами, питанием, форматами работы и понятным маршрутом к заявке.", result: "Демо личного бренда и продаж тренировочных программ", href: "https://demo-fitness.pages.dev/" },
];

const serviceRows = [
  ["01", "Сайты и страницы", "Лендинги, многостраничные сайты, страницы услуг и доработки текущего сайта под заявки.", "от $500"],
  ["02", "Аудит и структура", "Находим, что мешает доверию и заявкам, проектируем понятную структуру до сборки.", "от $250"],
  ["03", "Формы и квизы", "Контактные формы, кнопки связи, мини-опросы и передача обращений в нужный канал.", "по задаче"],
  ["04", "CRM и учёт", "Клиенты, статусы, ответственные и история общения в одной системе вместо хаоса в чатах.", "от $1000"],
  ["05", "Автоматизация", "Telegram-уведомления, интеграции, отчёты и развитие системы после запуска.", "от $50/мес"],
];

const tickerItems = [
  "Сайты, которые привлекают внимание",
  "CRM, где заявки не теряются",
  "Автоматизация, которая экономит время",
  "Запуск под ключ",
];

function useRoute() {
  const normalizePath = (value) => value.replace(/\/+$/, "") || "/";
  const [path, setPath] = useState(normalizePath(window.location.pathname || "/"));
  useEffect(() => { const onPop = () => setPath(normalizePath(window.location.pathname || "/")); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  const go = (to) => { if (to.startsWith("http")) { window.open(to, "_blank", "noopener,noreferrer"); return; } const nextPath = normalizePath(to); window.history.pushState({}, "", nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return { path, go };
}

function useRevealOnScroll(path, ready) {
  useEffect(() => {
    if (!ready) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = [
      "main .section > .eyebrow", "main .section .accent-title", ".section-head .text-link",
      ".case-card", ".service-row", ".lead-flow > div", ".lead-flow li", ".offer", ".plan",
      ".pricing-detail > div", ".steps article", ".process-notes > div", ".about-image",
      ".about-grid > div:last-child", ".testimonials blockquote", ".contact-options > div",
      ".direct-contact-link", ".inline-lead", ".faq-item", ".final-cta > *",
    ].join(",");
    const targets = [...document.querySelectorAll(selector)];
    targets.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 55}ms`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [path, ready]);
}

function AnimatedChars({ text, offset = 0 }) {
  return <span className="char-group" aria-label={text}>{[...text].map((char, index) => <span className="char" aria-hidden="true" style={{ "--char-index": index + offset }} key={`${char}-${index}`}>{char === " " ? "\u00a0" : char}</span>)}</span>;
}

function CountUp({ end, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) { setValue(end); return undefined; }
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const startedAt = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startedAt) / 760, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(end * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.7 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [end]);
  return <span ref={ref} className="count-up">{prefix}{value}{suffix}</span>;
}

function IntroLoader({ ready }) {
  return <div className={ready ? "intro-loader is-complete" : "intro-loader"} aria-hidden="true"><div className="intro-mark"><img src="/assets/images/egor-digital-e.webp" width="50" height="50" alt="" /><div><strong>Digital Tools by Egor</strong><span>Сайты · CRM · Автоматизация</span></div></div><div className="intro-progress"><i /></div></div>;
}

function Header({ path, go, onLead }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 821px)");
    const closeOnDesktop = (event) => event.matches && setOpen(false);
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return <header className="site-header">
    <button className="brand" onClick={() => go("/")} aria-label="На главную"><img src="/assets/images/egor-digital-e.webp" alt="" width="43" height="43" decoding="async" /><span><b>Digital Tools by Egor</b><small>Сайты · CRM · Автоматизация</small></span></button>
    <nav id="main-nav" className={open ? "nav open" : "nav"} aria-label="Главное меню">{nav.map(([href, label]) => <button type="button" key={href} className={path === href ? "active" : ""} onClick={() => { go(href); setOpen(false); }}>{label}</button>)}<div className="mobile-nav-actions"><a href="https://t.me/egecxxxx" target="_blank" rel="noreferrer">Написать в Telegram</a><button type="button" onClick={() => { setOpen(false); onLead(); }}>Получить разбор</button><button type="button" className="mobile-privacy" onClick={() => { setOpen(false); go("/privacy"); }}>Политика конфиденциальности</button></div></nav>
    <a className="header-telegram" href="https://t.me/egecxxxx" target="_blank" rel="noreferrer">Telegram</a>
    <button type="button" className="menu-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="main-nav" aria-label={open ? "Закрыть меню" : "Открыть меню"}>{open ? "Закрыть" : "Меню"}</button>
    <button className="header-cta" onClick={onLead}>Получить разбор</button>
  </header>;
}

function Eyebrow({ children }) { return <p className="eyebrow"><span aria-hidden="true" />{children}</p>; }
function AccentTitle({ children, as = "h2" }) { const Tag = as; return <Tag className="accent-title"><span>{children}</span></Tag>; }
function CTA({ children, onClick, secondary = false, action = "Открыть" }) { return <button className={secondary ? "cta secondary" : "cta"} onClick={onClick}><span className="cta-copy"><span>{children}</span><span aria-hidden="true">{children}</span></span><span className="cta-action">{action}<ArrowUpRight size={14} weight="bold" aria-hidden="true" /></span></button>; }
function CaseImage({ item, featured = false }) {
  const base = item.image.replace(/\.webp$/, "");
  const sizes = featured ? "(max-width: 820px) calc(100vw - 44px), (max-width: 1440px) calc(100vw - 144px), 1294px" : "(max-width: 820px) calc(100vw - 44px), (max-width: 1440px) calc((100vw - 170px) / 2), 634px";
  return <div className="case-image"><picture><source type="image/webp" srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1440.webp 1440w, ${item.image} ${item.imageWidth}w`} sizes={sizes} /><img src={item.image} alt={`${item.name} — превью проекта`} width={item.imageWidth} height={item.imageHeight} loading="lazy" decoding="async" /></picture></div>;
}

function Hero({ go, onLead }) { return <><section className="hero grid-surface"><div className="hero-copy"><Eyebrow>Digital Tools by Egor</Eyebrow><h1 aria-label="Сайты. CRM. Автоматизация."><span className="hero-line"><span>Сайты.</span></span><span className="hero-line"><span>CRM.</span></span><span className="hero-line accent"><span>Автоматизация.</span></span></h1><p className="hero-sub"><AnimatedChars text="От идеи до работающей " /><strong><AnimatedChars text="системы заявок" offset={22} /></strong></p><div className="hero-actions"><CTA onClick={() => go("/cases")}>Смотреть кейсы</CTA><CTA secondary onClick={onLead}>Получить разбор</CTA></div><div className="hero-facts"><div><b>Сайт для бизнеса</b><strong><CountUp end={500} prefix="от $" /></strong></div><div><b><CountUp end={2} suffix=" месяца поддержки" /></b><strong>бесплатно</strong></div></div></div><div className="hero-person"><img src="/assets/images/egor-hero-cutout.webp" alt="Егор — разработчик сайтов и CRM" width="1086" height="1448" loading="eager" decoding="sync" fetchPriority="high" /></div></section><div className="ticker" aria-label="Преимущества"><div className="ticker-track">{[...tickerItems, ...tickerItems].map((item, index) => <span aria-hidden={index >= tickerItems.length ? "true" : undefined} key={`${item}-${index}`}>{item}</span>)}</div></div></>; }

function NotFound({ go, onLead }) { return <main className="not-found"><section className="not-found-hero grid-surface"><div className="not-found-copy"><Eyebrow>Ошибка 404</Eyebrow><p className="not-found-code" aria-hidden="true">404</p><h1><span>Страница</span><span>не найдена</span></h1><p className="not-found-text">Похоже, ссылка устарела или такой страницы больше нет. Вернитесь на главную либо расскажите о своей задаче — отвечу лично.</p><div className="not-found-actions"><CTA action="Перейти" onClick={() => go("/")}>Вернуться на сайт</CTA><CTA secondary onClick={onLead}>Оставить заявку</CTA></div><nav className="not-found-links" aria-label="Полезные страницы"><span>Можно перейти сразу:</span><button onClick={() => go("/services")}>Услуги</button><button onClick={() => go("/cases")}>Кейсы</button><button onClick={() => go("/contacts")}>Контакты</button></nav></div><div className="not-found-person"><img src="/assets/images/egor-about-cutout.webp" alt="Егор — Digital Tools by Egor" width="502" height="884" loading="eager" decoding="sync" fetchPriority="high" /></div></section></main>; }

function CaseGrid({ limit, go }) { const shown = typeof limit === "number" ? cases.slice(0, limit) : cases; return <div className="case-grid">{shown.map((item, index) => <article className="case-card" key={item.name}><div className="case-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.type}</span></div><CaseImage item={item} featured={index === 0 && shown.length % 2 === 1} /><div className="case-body"><div><p>{item.tags.join(" · ")}</p><h3>{item.name}</h3><p>{item.description}</p></div><button onClick={() => go(item.href)}>Смотреть проект</button></div></article>)}</div>; }

function Home({ go, onLead }) { return <main><Hero go={go} onLead={onLead} /><section className="section cases-home"><div className="section-head"><div><Eyebrow>Кейсы</Eyebrow><AccentTitle>Реальные проекты</AccentTitle></div><button className="text-link" onClick={() => go("/cases")}>Все проекты</button></div><CaseGrid limit={3} go={go} /></section><section className="section services-home"><Eyebrow>Что я создаю</Eyebrow><AccentTitle>Система, а не декорация</AccentTitle><div className="service-table">{serviceRows.slice(0, 4).map(([n, title, text, price]) => <div className="service-row" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p><strong>{price}</strong></div>)}</div></section><section className="section lead-flow"><div><Eyebrow>Путь заявки</Eyebrow><AccentTitle>От формы до контроля</AccentTitle><p>Форма отправляет контакт в Telegram, фиксирует клиента в CRM и сохраняет источник обращения.</p></div><ol><li><span>01</span><b>Форма</b><small>контакт и задача</small></li><li><span>02</span><b>Telegram</b><small>уведомление сразу</small></li><li><span>03</span><b>CRM</b><small>статус сохранён</small></li><li><span>04</span><b>Аналитика</b><small>источник виден</small></li></ol></section><FinalCta onLead={onLead} /></main>; }

function PageHero({ eyebrow, title, text, onLead, action = "Получить разбор", className = "" }) { return <section className={`page-hero grid-surface ${className}`.trim()}><div><Eyebrow>{eyebrow}</Eyebrow><h1><span>{title}</span></h1></div><div><p>{text}</p><CTA onClick={onLead}>{action}</CTA></div></section>; }
function Offer({ title, price, text }) { return <article className="offer"><p>{price}</p><h3>{title}</h3><span>{text}</span></article>; }

function Services({ onLead }) { return <main><PageHero eyebrow="Услуги" title="Услуги для сайта, заявок и CRM" text="Начните с простого сайта, аудита или формы заявки, а затем добавьте аналитику, CRM и автоматизацию. Выбираем то, что решает задачу бизнеса." onLead={onLead} /><section className="section"><Eyebrow>С чего начать</Eyebrow><AccentTitle>Направления работы</AccentTitle><div className="service-table">{serviceRows.map(([n,t,d,p]) => <div className="service-row" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><strong>{p}</strong></div>)}</div></section><section className="section dark-band"><Eyebrow>Популярные сценарии</Eyebrow><div className="offer-grid"><Offer title="Сайт для бизнеса" price="от $500" text="Страница или небольшой сайт, который объясняет услугу, вызывает доверие и ведёт к заявке." /><Offer title="Сайт + CRM" price="от $1000" text="Источник, статус, следующий шаг и история общения сохраняются в системе." /><Offer title="Аудит сайта" price="от $250" text="Проверка доверия, мобильной версии, форм и аналитики с понятным планом исправлений." /><Offer title="Поддержка" price="от $50/мес" text="Исправления, новые блоки, связки и техническое развитие после запуска." /></div></section><FinalCta onLead={onLead} /></main>; }

function Cases({ go, onLead }) { const filters = ["Все", "Сайт", "CRM", "Автоматизация", "Личный бренд"]; const [filter, setFilter] = useState("Все"); const filtered = useMemo(() => filter === "Все" ? cases : cases.filter((c) => c.type === filter), [filter]); return <main><PageHero eyebrow="Кейсы" title="Кейсы сайтов, заявок и digital-систем" text="Показываю не только внешний вид. В каждом проекте важна задача бизнеса: объяснить услугу, вызвать доверие и привести человека к заявке." onLead={onLead} /><section className="section"><div className="section-head"><div><Eyebrow>Доказательства</Eyebrow><AccentTitle>Реальные проекты</AccentTitle></div><div className="filters">{filters.map((f) => <button className={filter === f ? "active" : ""} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div></div><div className="case-grid">{filtered.map((item, index) => <article className="case-card" key={item.name}><div className="case-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.type}</span></div><CaseImage item={item} featured={index === 0 && filtered.length % 2 === 1} /><div className="case-body"><div><p>{item.tags.join(" · ")}</p><h3>{item.name}</h3><p>{item.description}</p><strong>{item.result}</strong></div><button onClick={() => go(item.href)}>Смотреть сайт</button></div></article>)}</div></section><Testimonials /><FinalCta onLead={onLead} /></main>; }

const plans = [{ label: "Старт", title: "Маленькая задача", price: "$250", text: "Аудит, правка, форма или небольшой модуль.", bullets: ["аудит сайта или формы", "доработка блока и адаптива", "форма заявки", "уведомления по задаче"] }, { label: "Лучший выбор", title: "Сайт для бизнеса", price: "$500", text: "Структура, дизайн, адаптив, форма и один канал заявок.", bullets: ["структура под доверие", "телефон и компьютер", "форма и аналитика", "Telegram, MAX или email"] }, { label: "Система контроля", title: "CRM / Автоматизация", price: "$1000", text: "Клиенты, источники, статусы и отчёты в одной системе.", bullets: ["CRM или админка", "статусы и заявки", "уведомления", "экспорт и аналитика"] }];

function Pricing({ onLead }) { return <main><PageHero eyebrow="Цены" title="Цены на сайт, заявки и CRM" text="Можно запустить сайт от $500, а CRM, автоматизацию и поддержку добавить по мере роста. До старта понятно, что входит в работу." onLead={onLead} /><section className="section"><Eyebrow>Стартовый формат</Eyebrow><AccentTitle>Выберите точку входа</AccentTitle><div className="plans">{plans.map((p) => <article className="plan" key={p.title}><p>{p.label}</p><h3>{p.title}</h3><div><strong>от {p.price}</strong></div><span>{p.text}</span><ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul><CTA onClick={onLead}>Выбрать</CTA></article>)}</div></section><section className="section pricing-detail"><div><Eyebrow>Входит в сайт от $500</Eyebrow><ul><li>структура под задачу бизнеса</li><li>дизайн в едином стиле</li><li>адаптив под основные устройства</li><li>форма и один канал заявок</li><li>SEO-теги и аналитика</li></ul></div><div><Eyebrow>Сроки</Eyebrow><dl><div><dt>от 1 дня</dt><dd>небольшая задача</dd></div><div><dt>3–7 дней</dt><dd>мини-лендинг</dd></div><div><dt>от 7 дней</dt><dd>сайт для бизнеса</dd></div><div><dt>от 2 недель</dt><dd>CRM / админка</dd></div></dl></div></section><Faq /><FinalCta onLead={onLead} /></main>; }

const steps = [["01", "Разбор", "Понимаем бизнес, услуги, клиентов, текущие проблемы и цель сайта.", "Понятная задача и приоритеты"], ["02", "Структура", "Собираем логику страниц, офферов, CTA и пути к заявке.", "Согласованная структура"], ["03", "Сборка", "Делаю дизайн, адаптив, формы, SEO и техническую основу.", "Рабочая версия сайта"], ["04", "Заявки", "Подключаем формы и один канал: Telegram, MAX или email.", "Заявка приходит туда, где удобно"], ["05", "Запуск", "Проверяем страницы, аналитику и публикуем сайт.", "Сайт открыт и начинается поддержка"]];

function Process({ onLead }) { return <main><PageHero eyebrow="Процесс" title="Как проходит работа над сайтом" text="Сначала разбираем задачу, затем собираем структуру, делаем сайт, подключаем заявки и спокойно запускаем — без хаоса и сюрпризов." onLead={onLead} /><section className="section"><Eyebrow>5 этапов</Eyebrow><AccentTitle>От разбора до запуска</AccentTitle><div className="steps">{steps.map(([n,t,d,r]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><strong>{r}</strong></article>)}</div></section><section className="section process-notes"><div><Eyebrow>Материалы</Eyebrow><h3>Что нужно от вас</h3><p>Описание бизнеса и услуг, контакты, логотип, фото, примеры, доступы и быстрая обратная связь.</p></div><div><Eyebrow>Правки</Eyebrow><h3>Как проходят правки</h3><p>1–2 круга входят в запуск. Исправляем текст, детали, состояния, адаптив и понятность блоков.</p></div><div><Eyebrow>После запуска</Eyebrow><h3>Что дальше</h3><p>Два месяца поддержки бесплатно, затем — новые страницы, CRM, интеграции или подписка от $50.</p></div></section><FinalCta onLead={onLead} /></main>; }

function About({ onLead, go }) { return <main><PageHero eyebrow="Обо мне" title="Сайт как бизнес-инструмент" text="Он должен быстро объяснять ценность, снимать сомнения клиента и приводить к понятному действию." onLead={onLead} /><section className="section about-grid"><div className="about-image grid-surface"><img src="/assets/images/egor-about-cutout.webp" alt="Егор — Digital Tools by Egor" width="502" height="884" loading="eager" decoding="sync" fetchPriority="high" /></div><div><Eyebrow>Кто я</Eyebrow><AccentTitle>Егор — разработчик сайтов и CRM</AccentTitle><p>Я создаю сайты и digital-системы для бизнеса: помогаю понятнее показать услуги, повысить доверие, получать заявки и навести порядок в процессах.</p><p>Работал в школах водных видов спорта, фитнес-клубах, туризме и локальных сервисах. Поэтому понимаю бизнес изнутри: заявки в чатах, клиенты в таблицах, оплаты отдельно и отчёты вручную.</p><p>Моя задача — собрать понятную систему: сайт, заявки, аналитику, CRM и автоматизацию.</p><div className="about-facts"><span>5 лет в digital-проектах</span><span>Проект веду лично</span><span>Специалисты под задачи</span></div><CTA onClick={() => go("/cases")}>Смотреть кейсы</CTA></div></section><Testimonials /><FinalCta onLead={onLead} /></main>; }

function Contacts({ onLead, go }) { return <main><PageHero eyebrow="Контакты" title="Расскажите, что нужно запустить" text="Не нужен длинный бриф. Достаточно имени и удобного способа связи — отвечу лично и уточню задачу." onLead={onLead} action="Оставить заявку" /><section className="section contact-options"><div><span>01</span><h3>Нужен сайт</h3><p>структура, заявки и запуск</p><button onClick={onLead}>Открыть форму</button></div><div><span>02</span><h3>Нужен аудит</h3><p>найти, что мешает доверию</p><button onClick={onLead}>Открыть форму</button></div><div><span>03</span><h3>CRM и заявки</h3><p>навести порядок в обращениях</p><button onClick={onLead}>Открыть форму</button></div><div><span>04</span><h3>Поддержка</h3><p>доработки и техконтроль</p><button onClick={onLead}>Открыть форму</button></div></section><section className="section contact-hub"><div className="direct-contact"><Eyebrow>Прямые контакты</Eyebrow><AccentTitle>Напишите напрямую</AccentTitle><p>Можно не заполнять форму: выберите удобный канал и коротко расскажите о задаче. Егор ответит лично.</p><div className="direct-contact-list">{contactLinks.map((link) => <a className="direct-contact-link" href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} key={link.label}><span>{link.label}</span><strong>{link.value}</strong><small>{link.action}</small></a>)}</div></div><div className="inline-lead"><LeadForm titleId="contact-form-title" onPrivacy={() => go("/privacy")} /></div></section></main>; }

function Testimonials() { const items = [["Анна", "Егор помог разложить услуги так, чтобы клиенту было понятно, куда нажать и как оставить заявку."], ["Дарья", "Получился аккуратный сайт для личного бренда: без перегруза и с понятной подачей услуг."], ["Илья", "Получили систему: заявки видны, данные не теряются, администратору стало проще работать."]]; return <section className="section testimonials"><Eyebrow>Отзывы</Eyebrow><AccentTitle>Что ценят в работе</AccentTitle><div>{items.map(([n,t]) => <blockquote key={n}><p>“{t}”</p><cite>{n}</cite></blockquote>)}</div></section>; }
function Faq() { const qs = [["Можно начать с маленькой задачи?", "Да. Аудит, форма или точечная доработка помогают быстро проверить формат работы."], ["Один канал заявок входит в сайт?", "Да: Telegram, MAX или email — выбираем удобный вариант."], ["Что значит поддержка 2 месяца?", "Исправляю технические ошибки, помогаю с мелкими правками и контролирую стабильность после запуска."], ["Можно добавить CRM позже?", "Да. Сайт строится так, чтобы CRM и автоматизацию можно было подключить по мере роста."]]; const [openIndex, setOpenIndex] = useState(0); return <section className="section faq"><Eyebrow>FAQ</Eyebrow><AccentTitle>Короткие ответы</AccentTitle><div className="faq-list">{qs.map(([q,a], index) => { const open = openIndex === index; return <div className={open ? "faq-item is-open" : "faq-item"} key={q}><button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(open ? -1 : index)}><span>{q}</span><i aria-hidden="true" /></button><div className="faq-answer" id={`faq-answer-${index}`} aria-hidden={!open}><div><p>{a}</p></div></div></div>; })}</div></section>; }
function FinalCta({ onLead }) { return <section className="final-cta grid-surface"><Eyebrow>Следующий шаг</Eyebrow><h2>Разберём задачу<br />без лишней сметы</h2><p>Напишите, какой у вас бизнес и что сейчас мешает заявкам. Предложу понятный первый шаг и ориентир по бюджету.</p><CTA onClick={onLead}>Получить разбор</CTA></section>; }

function LeadForm({ titleId, autoFocus = false, onPrivacy, heading = "Расскажите о задаче" }) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || status === "sending") return;

    const values = new FormData(form);
    const payload = {
      name: String(values.get("name") || "").trim(),
      contact: String(values.get("contact") || "").trim(),
      message: String(values.get("message") || "").trim(),
      website: String(values.get("website") || "").trim(),
    };

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || result.ok !== true) {
        throw new Error(result?.error || "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую.");
      }
      form.reset();
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return <div className="success" role="status"><Eyebrow>Готово</Eyebrow><h2 id={titleId}>Заявка отправлена</h2><p>Заявка уже пришла Егору в Telegram. Он свяжется с вами по указанному контакту.</p><div className="success-links">{contactLinks.map((link) => <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} key={link.label}>{link.label}</a>)}</div></div>;
  }

  return <form onSubmit={submit} aria-busy={status === "sending"}><Eyebrow>Короткий бриф</Eyebrow><h2 id={titleId}>{heading}</h2><label>Имя<input name="name" required autoComplete="name" maxLength="120" placeholder="Как к вам обращаться" autoFocus={autoFocus} /></label><label>Способ связи<input name="contact" required autoComplete="email" maxLength="200" placeholder="Telegram, WhatsApp или email" /></label><label>Комментарий (по желанию)<textarea name="message" rows="4" maxLength="3000" placeholder="Сайт, аудит, CRM или доработка" /></label><input className="form-honeypot" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" /><label className="privacy-consent"><input name="privacy" type="checkbox" required /><span>Я согласен на обработку персональных данных и принимаю <button type="button" onClick={onPrivacy}>политику конфиденциальности</button>.</span></label>{status === "error" && <div className="form-status form-error" role="alert">{errorMessage}</div>}<button type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляю..." : "Отправить заявку"}</button></form>;
}

function LeadModal({ onClose, onPrivacy }) { useEffect(() => { const esc = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", esc); return () => window.removeEventListener("keydown", esc); }, [onClose]); return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-title"><button className="modal-close" onClick={onClose}>Закрыть</button><LeadForm titleId="lead-title" heading="Оставить заявку" autoFocus onPrivacy={onPrivacy} /></div></div>; }

function Privacy({ go }) { return <main><PageHero className="privacy-hero" eyebrow="Документы" title={"Политика конфиденци\u00ADальности"} text="Здесь описано, какие данные используются при обращении через формы сайта, зачем они нужны и как запросить их удаление." onLead={() => go("/contacts")} action="Перейти к контактам" /><section className="section privacy-page"><div className="privacy-intro"><Eyebrow>Редакция от 1 августа 2026</Eyebrow><AccentTitle>Коротко и понятно</AccentTitle><p>Оператор персональных данных — Егор Гецевич, Digital Tools by Egor. Контакт для вопросов и обращений: <a href="mailto:eggetsevich@gmail.com">eggetsevich@gmail.com</a>.</p></div><div className="privacy-sections"><article><span>01</span><h2>Какие данные</h2><p>Имя, контакт для связи и описание задачи, которые вы добровольно указываете в форме. Сайт не запрашивает паспортные, платёжные или иные чувствительные данные.</p></article><article><span>02</span><h2>Зачем они нужны</h2><p>Чтобы ответить на обращение, уточнить задачу, подготовить предложение и продолжить общение по выбранному вами каналу.</p></article><article><span>03</span><h2>Основание обработки</h2><p>Данные обрабатываются только после вашего явного согласия: без отметки чекбокса форма не отправляется. Согласие можно отозвать в любой момент.</p></article><article><span>04</span><h2>Хранение и передача</h2><p>Данные используются только для связи по вашему запросу и не продаются третьим лицам. Они могут передаваться техническим сервисам связи и хостинга только в объёме, необходимом для работы сайта.</p></article><article><span>05</span><h2>Ваши права</h2><p>Вы можете запросить уточнение, прекращение обработки или удаление данных, написав на email оператора. Запрос будет обработан в разумный срок.</p></article><article><span>06</span><h2>Файлы cookie</h2><p>Сайт не использует рекламные cookie и не создаёт пользовательские профили. При подключении аналитики политика и механизм согласия будут обновлены до её запуска.</p></article></div><div className="privacy-contact"><h2>Нужно удалить данные</h2><p>Напишите с того же контакта, который использовали в заявке, и укажите, какие данные нужно удалить.</p><a href="mailto:eggetsevich@gmail.com">Написать на email</a></div></section></main>; }

function Footer({ go, onLead }) { return <footer><button className="brand footer-brand" onClick={() => go("/")}><img src="/assets/images/egor-digital-e.webp" alt="" width="43" height="43" loading="lazy" decoding="async" /><span><b>Digital Tools by Egor</b><small>Websites · CRM · Automation</small></span></button><div className="footer-nav">{nav.slice(1).map(([href,label]) => <button key={href} onClick={() => go(href)}>{label}</button>)}<button onClick={() => go("/privacy")}>Политика конфиденциальности</button></div><div className="footer-contact"><span>Связаться напрямую</span>{contactLinks.map((link) => <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} key={link.label}>{link.label} · {link.value}</a>)}<button onClick={onLead}>Оставить заявку</button></div><p>© 2026 Digital Tools by Egor · Remote</p></footer>; }

export function App() {
  const { path, go } = useRoute();
  const [leadOpen, setLeadOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const isNotFound = !knownPaths.has(path);
  useRevealOnScroll(path, ready);

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "robots" }));
    const description = document.querySelector('meta[name="description"]');
    document.title = isNotFound ? "404 — Страница не найдена | Digital Tools by Egor" : path === "/privacy" ? "Политика конфиденциальности | Digital Tools by Egor" : "Digital Tools by Egor — сайты, CRM и автоматизация";
    robots.content = isNotFound ? "noindex,follow" : "index,follow";
    if (description) description.content = isNotFound ? "Запрошенная страница не найдена. Вернитесь на сайт Digital Tools by Egor или оставьте заявку." : path === "/privacy" ? "Политика обработки персональных данных на сайте Digital Tools by Egor." : "Сайты, CRM и автоматизация для бизнеса — от идеи до работающей системы заявок.";
  }, [isNotFound, path]);

  useEffect(() => {
    let active = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("is-intro-active");
    const portraitSelector = window.location.pathname === "/about" ? ".about-image img" : knownPaths.has(window.location.pathname) ? ".hero-person img" : ".not-found-person img";
    const portrait = document.querySelector(portraitSelector);
    const portraitReady = portrait?.complete && portrait.naturalWidth
      ? Promise.resolve()
      : new Promise((resolve) => {
          if (!portrait) { resolve(); return; }
          portrait.addEventListener("load", resolve, { once: true });
          portrait.addEventListener("error", resolve, { once: true });
        });
    const fontReady = document.fonts?.ready ?? Promise.resolve();
    const minimumDelay = reduceMotion ? 360 : window.matchMedia("(max-width: 820px)").matches ? 520 : 320;
    const minimum = new Promise((resolve) => window.setTimeout(resolve, minimumDelay));
    const maximum = new Promise((resolve) => window.setTimeout(resolve, 760));
    const visualAssetsReady = Promise.all([portraitReady, fontReady]);
    Promise.all([minimum, Promise.race([visualAssetsReady, maximum])]).then(() => { if (active) setReady(true); });
    return () => { active = false; document.body.classList.remove("is-intro-active"); };
  }, []);

  useEffect(() => { if (ready) document.body.classList.remove("is-intro-active"); }, [ready]);
  const onLead = () => setLeadOpen(true);
  const page = path === "/" ? <Home go={go} onLead={onLead} /> : path === "/services" ? <Services onLead={onLead} /> : path === "/cases" ? <Cases go={go} onLead={onLead} /> : path === "/pricing" ? <Pricing onLead={onLead} /> : path === "/process" ? <Process onLead={onLead} /> : path === "/about" ? <About onLead={onLead} go={go} /> : path === "/contacts" ? <Contacts onLead={onLead} go={go} /> : path === "/privacy" ? <Privacy go={go} /> : <NotFound go={go} onLead={onLead} />;
  const openPrivacy = () => { setLeadOpen(false); go("/privacy"); };
  return <><IntroLoader ready={ready} /><div className={ready ? "app is-ready" : "app"}><Header path={path} go={go} onLead={onLead} />{page}<Footer go={go} onLead={onLead} />{leadOpen && <LeadModal onClose={() => setLeadOpen(false)} onPrivacy={openPrivacy} />}</div></>;
}
