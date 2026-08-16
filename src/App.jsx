import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { getRoute, normalizePath, routes, SITE_URL } from "./site-config.js";
import { buildLeadMessage, captureAttribution, getCurrentPage, getGoalContext, trackGoal } from "./lead-tracking.js";

const nav = routes.filter(({ path, nav: showInNav }) => path !== "/privacy" && showInNav !== false).map(({ path, label }) => [path, label]);
const knownPaths = new Set(routes.map(({ path }) => path));
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const INTRO_SESSION_KEY = "egor:intro-seen";

const contactLinks = [
  { label: "Telegram", value: "@egecxxxx", href: "https://t.me/egecxxxx", action: "Открыть диалог", goal: "telegram_click" },
  { label: "WhatsApp", value: "+20 114 969 2210", href: "https://wa.me/201149692210", action: "Написать в WhatsApp", goal: "whatsapp_click" },
  { label: "Email", value: "eggetsevich@gmail.com", href: "mailto:eggetsevich@gmail.com", action: "Написать письмо" },
  { label: "Instagram", value: "@_gecevich_", href: "https://www.instagram.com/_gecevich_/", action: "Открыть профиль" },
];

const leadServices = [
  { value: "website", label: "Сайт" },
  { value: "crm", label: "CRM" },
  { value: "improvements", label: "Доработка" },
  { value: "audit", label: "Аудит" },
];

function trackContact(link, placement) {
  if (link.goal) trackGoal(link.goal, getGoalContext({ placement }));
}

function trackPrivacy(placement) {
  trackGoal("privacy_open", getGoalContext({ placement }));
}

function trackCase(item, placement) {
  trackGoal("case_open", getGoalContext({ case_name: item.name, placement }));
}

const cases = [
  { name: "Дарья Каминскене", categories: ["Сайт", "Личный бренд"], tags: ["маркетолог", "услуги", "заявки"], image: "/assets/cases/daria-kamins.webp", imageWidth: 1672, imageHeight: 941, description: "Премиальная упаковка личного бренда, услуги, кейсы, доверие и понятный путь к заявке.", result: "Готовый сайт под рекламу, SMM и личные продажи", href: "https://daria-kamins.marketing/", casePath: "/cases/daria-kaminskene" },
  { name: "Green Apple Dent", categories: ["Сайт", "CRM", "Автоматизация"], tags: ["стоматология", "админка", "заявки"], image: "/assets/cases/greenappledent.webp", imageWidth: 1672, imageHeight: 941, description: "Сайт стоматологии с услугами, формами записи, админкой заявок и Telegram-уведомлениями.", result: "Готовая система для презентации клиники, заявок и рекламы", href: "https://greenappledent.ru/", casePath: "/cases/green-apple-dent" },
  { name: "Крыша-мечты", categories: ["Сайт", "Автоматизация"], tags: ["кровля", "калькулятор", "заявки"], image: "/assets/cases/roof-dream.webp", imageWidth: 1672, imageHeight: 941, description: "Сайт монтажа кровли под ключ с понятной презентацией услуг, преимуществами и расчётом стоимости.", result: "Готовая посадочная страница под рекламу и заявки", href: "https://xn-----6kcvwelc4aqi3di5bh.xn--p1ai/", casePath: "/cases/krysha-mechty" },
  { name: "Wingfoil Center Dahab", categories: ["Сайт"], tags: ["спорт", "SEO", "аналитика"], image: "/assets/cases/wingfoil-center-dahab.webp", imageWidth: 1536, imageHeight: 960, description: "Сайт школы вингфойла: услуги, доверие, путь до заявки, SEO-база и аналитика.", result: "Люди находят сайт и пишут заявки", href: "https://wingfoildahab.com/" },
  { name: "NovaDent", categories: ["Демо-проект", "Сайт", "CRM", "Автоматизация"], tags: ["стоматология", "CRM", "админка"], image: "/assets/cases/novadent.webp", imageWidth: 1672, imageHeight: 941, description: "Демонстрационный многостраничный сайт стоматологии с записью, заявками, экспортом и Telegram-уведомлениями.", result: "Демо полноценной системы сайта и CRM", href: "https://novadent.egordigital.site/" },
  { name: "Casa Maris", categories: ["Демо-проект", "Сайт", "CRM", "Автоматизация"], tags: ["отель", "бронь", "админка"], image: "/assets/cases/casa-maris.webp", imageWidth: 1672, imageHeight: 941, description: "Демонстрационный концепт для бутик-отеля: номера, availability, заявки и отдельная админка.", result: "Демо системы для рекламы, заявок и презентации объекта", href: "https://casamaris.egordigital.site/" },
  { name: "Level Home", categories: ["Демо-проект", "Сайт", "Автоматизация"], tags: ["ремонт", "калькулятор", "кабинет"], image: "/assets/cases/level-home-case.webp", imageWidth: 1672, imageHeight: 941, description: "Демонстрационный премиальный сайт ремонта квартир с калькулятором, фиксированной сметой и кабинетом клиента.", result: "Демо премиального сервиса под рекламу", href: "https://level-home.pages.dev/" },
  { name: "Илья Морозов", categories: ["Демо-проект", "Сайт", "Личный бренд"], tags: ["фитнес", "тренер", "онлайн-программы"], image: "/assets/cases/fitness-coach.webp", imageWidth: 1536, imageHeight: 864, description: "Демонстрационный многостраничный сайт фитнес-тренера с программами, питанием, форматами работы и понятным маршрутом к заявке.", result: "Демо личного бренда и продаж тренировочных программ", href: "https://demo-fitness-586.pages.dev/" },
];

const caseStudyContent = {
  "/cases/daria-kaminskene": {
    eyebrow: "Личный бренд · многостраничный сайт",
    lead: "Собрал личный бренд маркетолога в понятную digital-систему: посетитель быстро выбирает нужное направление, видит подход и переходит к заявке.",
    client: "Дарья Каминскене — маркетолог для малого бизнеса и экспертов. Работает с Авито, Яндекс Директ, Google Ads, SMM, аудитом, стратегией и обучением.",
    challenge: "Большое количество услуг нужно было показать без перегруза и связать в единую систему. Сайт должен одновременно раскрывать экспертизу Дарьи, поддерживать личный бренд и вести разные сегменты аудитории к своему сценарию обращения.",
    solution: "Спроектировал многостраничную структуру с отдельными направлениями, кейсами и экспертными статьями. Собрал визуальную систему личного бренда, адаптив, понятные CTA и прямые способы связи.",
    features: ["Главная и отдельные страницы направлений", "Кейсы, статьи и социальные доказательства", "Адаптивная версия и единый визуальный стиль", "Путь от услуги к разбору или заявке"],
    facts: [["8", "направлений услуг"], ["4+", "канала продвижения"], ["1", "единая структура"], ["360°", "взгляд на маркетинг"]],
    result: "Получился полноценный сайт личного бренда, который можно использовать в рекламе, SMM, обучении и личных продажах — без необходимости каждый раз объяснять весь набор услуг вручную.",
    quote: "Егор помог собрать структуру сайта и понятно упаковать мои услуги. Мы несколько раз обсуждали детали, правили подачу и адаптировали сайт для телефона. В итоге получился аккуратный сайт для личного бренда, который действительно соответствует моему стилю и который не стыдно отправлять клиентам.",
    quoteBy: "Дарья Каминскене · маркетолог",
  },
  "/cases/green-apple-dent": {
    eyebrow: "Стоматология · сайт · CRM",
    lead: "Пересобрал сайт клиники и связал обращения с отдельной админкой, чтобы пациенту было проще выбрать услугу, а администратору — контролировать заявки.",
    client: "Green Apple Dent — стоматологическая клиника в Тамбове с направлениями от консультации и терапии до имплантации, ортодонтии и эстетической стоматологии.",
    challenge: "Нужен был не только современный сайт, но и рабочая система приёма обращений: понятная навигация по услугам, доверие через документы и результаты, формы записи и единое место для контроля заявок.",
    solution: "Перенёс и переработал сайт, создал отдельную админку, подключил формы, статусы и уведомления в Telegram и MAX. Добавил страницы услуг, цены, лицензии, отзывы, результаты до/после и контакты.",
    features: ["Многостраничная структура услуг клиники", "Формы записи и единая админка заявок", "Telegram и MAX-уведомления", "Лицензии, отзывы и результаты до/после"],
    facts: [["7", "основных разделов"], ["3", "канала связи"], ["1", "админка заявок"], ["сразу", "уведомление о заявке"]],
    result: "Клиника получила единую систему для презентации услуг, рекламы и обработки обращений. Заявки сохраняются в одном месте, а администратор видит их без поиска по разным чатам.",
    evidence: {
      channel: "Telegram",
      title: "Сайт не просто запущен — с него приходят заявки",
      text: "Формы услуг передают в Telegram контакт, выбранное направление и страницу обращения. Администратор сразу видит новую заявку и может связаться с пациентом.",
      facts: ["заявка приходит автоматически", "видны услуга и страница", "контакт сразу у администратора"],
      images: [
        ["/assets/cases/leads/green-apple-leads-01.webp", 1375, 1144],
        ["/assets/cases/leads/green-apple-leads-02.webp", 1369, 1149],
        ["/assets/cases/leads/green-apple-leads-03.webp", 1391, 1131],
      ],
    },
    quote: "Нам нужно было не просто обновить сайт, а сделать удобную систему для работы с заявками. Егор перенёс сайт, создал отдельную админку, подключил уведомления в Telegram и MAX и настроил всю техническую часть. Теперь обращения сохраняются в одном месте, а администратору стало намного проще их контролировать.",
    quoteBy: "Анна · Green Apple Dent",
  },
  "/cases/krysha-mechty": {
    eyebrow: "Кровельные работы · сайт · калькулятор",
    lead: "Создал сайт кровельных работ, где клиент может понять услугу, оценить порядок стоимости и оставить заявку с телефона или компьютера.",
    client: "Крыша-мечты — команда кровельных работ под ключ в Москве и Московской области.",
    challenge: "Нужно было разложить сложную услугу на понятные этапы, показать направления работ и преимущества, а также дать посетителю быстрый способ рассчитать ориентир и связаться с командой.",
    solution: "Продумал структуру и подачу услуг, собрал адаптивный сайт, добавил калькулятор стоимости и формы заявок, проверил мобильную версию и помог запустить проект на домене клиента.",
    features: ["Структура кровельных услуг под рекламу", "Калькулятор ориентировочной стоимости", "Формы заявок и быстрые контакты", "Адаптив и запуск на домене клиента"],
    facts: [["1", "калькулятор стоимости"], ["24/7", "сайт принимает заявки"], ["320+", "адаптивная ширина"], ["под ключ", "запуск на домене"]],
    result: "Получился понятный инструмент под рекламу и прямые обращения: клиент изучает услуги, получает ориентир по стоимости и оставляет заявку без лишних шагов.",
    evidence: {
      channel: "MAX",
      title: "Заявки с сайта сразу попадают в работу",
      text: "Обычная форма и калькулятор передают в MAX контакт и детали задачи: тип кровли, площадь, район, состав работ и желаемые сроки.",
      facts: ["форма и квиз в одном канале", "параметры проекта уже в заявке", "менеджер получает контакт сразу"],
      images: [
        ["/assets/cases/leads/krysha-leads-01.webp", 851, 1847],
        ["/assets/cases/leads/krysha-leads-02.webp", 852, 1847],
        ["/assets/cases/leads/krysha-leads-03.webp", 853, 1844],
      ],
    },
    quote: "Егор разработал для нас полноценный сайт по кровельным работам: продумал структуру, оформил услуги, добавил калькулятор стоимости и формы заявок. Отдельно проработал мобильную версию и помог с запуском сайта на нашем домене.",
    quoteBy: "Команда Крыша-мечты",
  },
};

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

function useRoute(initialPath = "/") {
  const [path, setPath] = useState(() => normalizePath(initialPath));
  useEffect(() => { const onPop = () => setPath(normalizePath(window.location.pathname || "/")); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  const go = (to) => { const nextPath = normalizePath(to); if (nextPath === path) return; window.history.pushState({}, "", nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return { path, go };
}

function SiteLink({ href, go, onNavigate, children, ...props }) {
  const navigate = (event) => {
    props.onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === "_blank") return;
    event.preventDefault();
    onNavigate?.();
    go(href);
  };
  return <a {...props} href={href} onClick={navigate}>{children}</a>;
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
      ".direct-contact-link", ".inline-lead", ".faq-item", ".final-cta > *", ".case-study-facts > div",
      ".case-study-story > div", ".case-study-story > aside", ".case-study-features article", ".case-study-result blockquote",
      ".case-evidence-copy", ".case-evidence-shot",
    ].join(",");
    const targets = [...document.querySelectorAll(selector)];
    targets.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 4) * 35}ms`);
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
    }, { rootMargin: "0px 0px -2%", threshold: 0.03 });
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

function Header({ path, go, onLead, modalOpen }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => { if (modalOpen) setOpen(false); }, [modalOpen]);

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
    <SiteLink className="brand" href="/" go={go} aria-label="На главную"><img src="/assets/images/egor-digital-e.webp" alt="" width="43" height="43" decoding="async" /><span><b>Digital Tools by Egor</b><small>Сайты · CRM · Автоматизация</small></span></SiteLink>
    <nav id="main-nav" className={open ? "nav open" : "nav"} aria-label="Главное меню">{nav.map(([href, label]) => { const active = path === href || (href === "/cases" && path.startsWith("/cases/")); return <SiteLink key={href} href={href} go={go} onNavigate={() => setOpen(false)} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{label}</SiteLink>; })}<div className="mobile-nav-actions"><a href="https://t.me/egecxxxx" target="_blank" rel="noreferrer" onClick={() => trackContact(contactLinks[0], "mobile_menu")}>Написать в Telegram</a><button type="button" onClick={() => { setOpen(false); onLead({ source: "mobile_menu" }); }}>Получить разбор</button><SiteLink className="mobile-privacy" href="/privacy" go={go} onNavigate={() => setOpen(false)} onClick={() => trackPrivacy("mobile_menu")}>Политика конфиденциальности</SiteLink></div></nav>
    <a className="header-telegram" href="https://t.me/egecxxxx" target="_blank" rel="noreferrer" onClick={() => trackContact(contactLinks[0], "header")}>Telegram</a>
    <button type="button" className="menu-toggle" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="main-nav" aria-label={open ? "Закрыть меню" : "Открыть меню"}>{open ? "Закрыть" : "Меню"}</button>
    <button className="header-cta" onClick={onLead}>Получить разбор</button>
  </header>;
}

function Eyebrow({ children }) { return <p className="eyebrow"><span aria-hidden="true" />{children}</p>; }
function AccentTitle({ children, as = "h2" }) { const Tag = as; return <Tag className="accent-title"><span>{children}</span></Tag>; }
function CTA({ children, onClick, href, go, secondary = false, action = "Открыть" }) {
  const content = <><span className="sr-only">{children}</span><span className="cta-copy" aria-hidden="true"><span>{children}</span><span>{children}</span></span><span className="cta-action" aria-hidden="true">{action}<ArrowUpRight size={14} weight="bold" /></span></>;
  return href ? <SiteLink className={secondary ? "cta secondary" : "cta"} href={href} go={go}>{content}</SiteLink> : <button className={secondary ? "cta secondary" : "cta"} onClick={onClick}>{content}</button>;
}
function CaseImage({ item, featured = false }) {
  const base = item.image.replace(/\.webp$/, "");
  const sizes = featured ? "(max-width: 820px) calc(100vw - 44px), (max-width: 1440px) calc(100vw - 144px), 1294px" : "(max-width: 820px) calc(100vw - 44px), (max-width: 1440px) calc((100vw - 170px) / 2), 634px";
  return <div className="case-image"><picture><source type="image/webp" srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1440.webp 1440w, ${item.image} ${item.imageWidth}w`} sizes={sizes} /><img src={item.image} alt={`${item.name} — превью проекта`} width={item.imageWidth} height={item.imageHeight} loading="lazy" decoding="async" /></picture></div>;
}

function BenefitTicker() {
  return <div className="ticker" aria-label="Преимущества"><div className="ticker-track">{[...tickerItems, ...tickerItems].map((item, index) => <span aria-hidden={index >= tickerItems.length ? "true" : undefined} key={`${item}-${index}`}>{item}</span>)}</div></div>;
}

function Hero({ go, onLead }) { return <><section className="hero grid-surface"><div className="hero-copy"><Eyebrow>Digital Tools by Egor</Eyebrow><h1 aria-label="Сайты. CRM. Автоматизация."><span className="hero-line"><span>Сайты.</span></span><span className="hero-line"><span>CRM.</span></span><span className="hero-line accent"><span>Автоматизация.</span></span></h1><p className="hero-sub"><AnimatedChars text="От идеи до работающей " /><strong><AnimatedChars text="системы заявок" offset={22} /></strong></p><div className="hero-actions"><CTA onClick={() => onLead({ service: "website", serviceLabel: "Сайт", source: "hero_website" })}>Мне нужен сайт</CTA><CTA secondary onClick={() => onLead({ source: "hero_audit" })}>Получить разбор</CTA><CTA secondary href="/cases" go={go}>Кейсы</CTA></div><div className="hero-facts"><div><b>Сайт для бизнеса</b><strong><CountUp end={500} prefix="от $" /></strong></div><div><b><CountUp end={2} suffix=" месяца поддержки" /></b><strong>бесплатно</strong></div></div></div><div className="hero-person"><img src="/assets/images/egor-hero-cutout.webp" alt="Егор — разработчик сайтов и CRM" width="1086" height="1448" loading="eager" decoding="sync" fetchPriority="high" /></div></section><BenefitTicker /></>; }

function NotFound({ go, onLead }) { return <main id="main-content" tabIndex="-1" className="not-found"><section className="not-found-hero grid-surface"><div className="not-found-copy"><Eyebrow>Ошибка 404</Eyebrow><p className="not-found-code" aria-hidden="true">404</p><h1><span>Страница</span><span>не найдена</span></h1><p className="not-found-text">Похоже, ссылка устарела или такой страницы больше нет. Вернитесь на главную либо расскажите о своей задаче — отвечу лично.</p><div className="not-found-actions"><CTA action="Перейти" href="/" go={go}>Вернуться на сайт</CTA><CTA secondary onClick={onLead}>Оставить заявку</CTA></div><nav className="not-found-links" aria-label="Полезные страницы"><span>Можно перейти сразу:</span><SiteLink href="/services" go={go}>Услуги</SiteLink><SiteLink href="/cases" go={go}>Кейсы</SiteLink><SiteLink href="/contacts" go={go}>Контакты</SiteLink></nav></div><div className="not-found-person"><img src="/assets/images/egor-about-cutout.webp" alt="Егор — Digital Tools by Egor" width="502" height="884" loading="eager" decoding="sync" fetchPriority="high" /></div></section></main>; }

function CaseAction({ item, go, placement, children = "Смотреть проект" }) {
  return item.casePath
    ? <SiteLink href={item.casePath} go={go} onClick={() => trackCase(item, placement)}>{children}</SiteLink>
    : <a href={item.href} target="_blank" rel="noreferrer" onClick={() => trackCase(item, placement)}>{children}</a>;
}

function CaseGrid({ limit, go }) { const shown = typeof limit === "number" ? cases.slice(0, limit) : cases; return <div className="case-grid">{shown.map((item, index) => <article className="case-card" key={item.name}><div className="case-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.categories.join(" / ")}</span></div><CaseImage item={item} featured={index === 0 && shown.length % 2 === 1} /><div className="case-body"><div><p>{item.tags.join(" · ")}</p><h3>{item.name}</h3><p>{item.description}</p></div><CaseAction item={item} go={go} placement="home">Разобрать кейс</CaseAction></div></article>)}</div>; }

function CasesLeadProof({ go }) {
  const proof = [
    { name: "Green Apple Dent", text: "Заявки на услуги стоматологии сразу приходят в рабочий чат.", image: "/assets/cases/leads/green-apple-leads-01.webp", width: 1375, height: 1144, href: "/cases/green-apple-dent" },
    { name: "Крыша-мечты", text: "Лиды с сайта и калькулятора содержат параметры будущего заказа.", image: "/assets/cases/leads/krysha-leads-03.webp", width: 853, height: 1844, href: "/cases/krysha-mechty" },
  ];
  return <section className="section cases-lead-proof"><div className="cases-lead-proof-copy"><Eyebrow>Результат в работе</Eyebrow><AccentTitle>Сайты приводят заявки</AccentTitle><p>Не только красивый интерфейс: формы передают обращения в рабочий чат, а менеджер сразу получает нужные данные.</p><small>Персональные данные клиентов скрыты.</small></div><div className="cases-lead-proof-list">{proof.map((item, index) => <SiteLink className="cases-lead-proof-card" href={item.href} go={go} key={item.name}><div><img src={item.image} width={item.width} height={item.height} alt={`Обезличенная заявка — ${item.name}`} loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, "0")}</span></div><strong>{item.name}</strong><p>{item.text}</p><small>Смотреть подробный кейс <ArrowUpRight size={13} weight="bold" aria-hidden="true" /></small></SiteLink>)}</div></section>;
}

function Home({ go, onLead }) { return <main><Hero go={go} onLead={onLead} /><section className="section cases-home"><div className="section-head"><div><Eyebrow>Кейсы</Eyebrow><AccentTitle>Реальные проекты</AccentTitle></div><SiteLink className="text-link" href="/cases" go={go}>Все проекты</SiteLink></div><CaseGrid limit={3} go={go} /></section><section className="section services-home"><Eyebrow>Что я создаю</Eyebrow><AccentTitle>Система, а не декорация</AccentTitle><div className="service-table">{serviceRows.slice(0, 4).map(([n, title, text, price]) => <div className="service-row" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p><strong>{price}</strong></div>)}</div></section><section className="section lead-flow"><div><Eyebrow>Путь заявки</Eyebrow><AccentTitle>От формы до контроля</AccentTitle><p>Форма отправляет контакт в Telegram, фиксирует клиента в CRM и сохраняет источник обращения.</p></div><ol><li><span>01</span><b>Форма</b><small>контакт и задача</small></li><li><span>02</span><b>Telegram</b><small>уведомление сразу</small></li><li><span>03</span><b>CRM</b><small>статус сохранён</small></li><li><span>04</span><b>Аналитика</b><small>источник виден</small></li></ol></section><FinalCta onLead={onLead} /></main>; }

function PageHero({ eyebrow, title, text, onLead, href, go, action = "Получить разбор", className = "" }) { return <section className={`page-hero grid-surface ${className}`.trim()}><div><Eyebrow>{eyebrow}</Eyebrow><h1><span>{title}</span></h1></div><div><p>{text}</p><CTA onClick={onLead} href={href} go={go}>{action}</CTA></div></section>; }
function Offer({ title, price, text }) { return <article className="offer"><p>{price}</p><h3>{title}</h3><span>{text}</span></article>; }

function Services({ onLead }) { return <main><PageHero eyebrow="Услуги" title="Услуги для сайта, заявок и CRM" text="Начните с простого сайта, аудита или формы заявки, а затем добавьте аналитику, CRM и автоматизацию. Выбираем то, что решает задачу бизнеса." onLead={onLead} /><section className="section"><Eyebrow>С чего начать</Eyebrow><AccentTitle>Направления работы</AccentTitle><div className="service-table">{serviceRows.map(([n,t,d,p]) => <div className="service-row" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><strong>{p}</strong></div>)}</div></section><section className="section dark-band"><Eyebrow>Популярные сценарии</Eyebrow><div className="offer-grid"><Offer title="Сайт для бизнеса" price="от $500" text="Страница или небольшой сайт, который объясняет услугу, вызывает доверие и ведёт к заявке." /><Offer title="Сайт + CRM" price="от $1000" text="Источник, статус, следующий шаг и история общения сохраняются в системе." /><Offer title="Аудит сайта" price="от $250" text="Проверка доверия, мобильной версии, форм и аналитики с понятным планом исправлений." /><Offer title="Поддержка" price="от $50/мес" text="Исправления, новые блоки, связки и техническое развитие после запуска." /></div></section><FinalCta onLead={onLead} /></main>; }

function Cases({ go, onLead }) {
  const filters = ["Все", "Сайт", "CRM", "Автоматизация", "Личный бренд", "Демо-проект"];
  const [filter, setFilter] = useState("Все");
  const filtered = useMemo(() => filter === "Все" ? cases : cases.filter((item) => item.categories.includes(filter)), [filter]);

  return <main><PageHero eyebrow="Кейсы" title="Кейсы сайтов, заявок и digital-систем" text="Показываю не только внешний вид. В каждом проекте важна задача бизнеса: объяснить услугу, вызвать доверие и привести человека к заявке." onLead={onLead} /><section className="section"><div className="section-head"><div><Eyebrow>Доказательства</Eyebrow><AccentTitle>Проекты и концепты</AccentTitle></div><div className="filters" aria-label="Фильтры проектов">{filters.map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div><div className="case-grid">{filtered.map((item, index) => <article className="case-card" key={item.name}><div className="case-meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.categories.join(" / ")}</span></div><CaseImage item={item} featured={index === 0 && filtered.length % 2 === 1} /><div className="case-body"><div><p>{item.tags.join(" · ")}</p><h3>{item.name}</h3><p>{item.description}</p><strong>{item.result}</strong></div><CaseAction item={item} go={go} placement="cases">{item.casePath ? "Разобрать кейс" : "Смотреть сайт"}</CaseAction></div></article>)}</div></section><CasesLeadProof go={go} /><Testimonials /><FinalCta onLead={onLead} /></main>;
}

function CaseStudy({ path, go, onLead }) {
  const item = cases.find((candidate) => candidate.casePath === path);
  const detail = caseStudyContent[path];
  const realCases = cases.filter((candidate) => candidate.casePath);
  const currentIndex = realCases.findIndex((candidate) => candidate.casePath === path);
  const nextCase = realCases[(currentIndex + 1) % realCases.length];

  return <main className="case-study"><section className="case-study-hero grid-surface"><div className="case-study-heading"><SiteLink className="case-back" href="/cases" go={go}>← Все кейсы</SiteLink><Eyebrow>{detail.eyebrow}</Eyebrow><h1>{item.name}</h1><p>{detail.lead}</p><div className="case-study-actions"><a href={item.href} target="_blank" rel="noreferrer" onClick={() => trackCase(item, "case_detail")}>Открыть проект <ArrowUpRight size={15} weight="bold" aria-hidden="true" /></a><button type="button" onClick={() => onLead({ service: "website", serviceLabel: "Сайт", source: "case_detail" })}>Обсудить похожий сайт</button></div></div><dl className="case-study-facts">{detail.facts.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl></section><section className="case-study-preview section"><div className="case-study-browser"><div aria-hidden="true"><i /><i /><i /><span>{item.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></div><CaseImage item={item} featured /></div></section><section className="section case-study-story"><div><Eyebrow>Контекст</Eyebrow><h2>Кто клиент</h2><p>{detail.client}</p></div><div><Eyebrow>Задача</Eyebrow><h2>Что нужно было решить</h2><p>{detail.challenge}</p></div><div><Eyebrow>Решение</Eyebrow><h2>Что я сделал</h2><p>{detail.solution}</p></div><aside><span>Моя роль</span><strong>Структура · дизайн · разработка · адаптив · запуск</strong><small>Проект вёл лично, специалистов подключал под отдельные задачи.</small></aside></section><section className="section case-study-features"><Eyebrow>Состав проекта</Eyebrow><AccentTitle>Что реализовано</AccentTitle><div>{detail.features.map((feature, index) => <article key={feature}><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature}</h3></article>)}</div></section>{detail.evidence && <CaseEvidence evidence={detail.evidence} projectName={item.name} />}<section className="section case-study-result"><div><Eyebrow>Результат</Eyebrow><AccentTitle>Рабочий инструмент</AccentTitle><p>{detail.result}</p><CTA onClick={() => onLead({ service: "website", serviceLabel: "Сайт", source: "case_result" })}>Рассчитать похожий проект</CTA></div><blockquote><p>“{detail.quote}”</p><cite>{detail.quoteBy}</cite></blockquote></section><section className="case-study-next grid-surface"><span>Следующий кейс</span><SiteLink href={nextCase.casePath} go={go}><strong>{nextCase.name}</strong><ArrowUpRight size={22} weight="bold" aria-hidden="true" /></SiteLink></section></main>;
}

function CaseEvidence({ evidence, projectName }) {
  return <section className="section case-evidence"><div className="case-evidence-copy"><Eyebrow>Результат в работе · {evidence.channel}</Eyebrow><AccentTitle>{evidence.title}</AccentTitle><p>{evidence.text}</p><ul>{evidence.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul><small>Персональные данные клиентов скрыты.</small></div><div className="case-evidence-gallery">{evidence.images.map(([src, width, height], index) => <button type="button" className="case-evidence-shot" onClick={(event) => event.currentTarget.classList.toggle("is-expanded")} aria-label={`${projectName}: увеличить пример заявки ${index + 1}`} key={src}><img src={src} width={width} height={height} alt={`Обезличенная заявка с сайта ${projectName}`} loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div></section>;
}

const plans = [{ label: "Старт", title: "Маленькая задача", price: "$250", service: "audit", serviceLabel: "Аудит", text: "Аудит, правка, форма или небольшой модуль.", bullets: ["аудит сайта или формы", "доработка блока и адаптива", "форма заявки", "уведомления по задаче"] }, { label: "Лучший выбор", title: "Сайт для бизнеса", price: "$500", service: "website", serviceLabel: "Сайт", text: "Структура, дизайн, адаптив, форма и один канал заявок.", bullets: ["структура под доверие", "телефон и компьютер", "форма и аналитика", "Telegram, MAX или email"] }, { label: "Система контроля", title: "CRM / Автоматизация", price: "$1000", service: "crm", serviceLabel: "CRM", text: "Клиенты, источники, статусы и отчёты в одной системе.", bullets: ["CRM или админка", "статусы и заявки", "уведомления", "экспорт и аналитика"] }];

function Pricing({ onLead }) { return <main><PageHero className="pricing-hero" eyebrow="Цены" title="Цены на сайт, заявки и CRM" text="Можно запустить сайт от $500, а CRM, автоматизацию и поддержку добавить по мере роста. До старта понятно, что входит в работу." onLead={onLead} /><section className="section pricing-plans-section"><Eyebrow>Стартовый формат</Eyebrow><AccentTitle>Выберите точку входа</AccentTitle><div className="plans">{plans.map((p) => <article className="plan" key={p.title}><p>{p.label}</p><h3>{p.title}</h3><div><strong>от {p.price}</strong></div><span>{p.text}</span><ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul><CTA onClick={() => { trackGoal("pricing_plan_select", getGoalContext({ plan: p.title, price: p.price, service: p.service })); onLead({ service: p.service, serviceLabel: p.serviceLabel, price: `от ${p.price}`, selectionLabel: `${p.title} — от ${p.price}`, source: "pricing" }); }}>Выбрать</CTA></article>)}</div></section><section className="section pricing-detail"><div><Eyebrow>Входит в сайт от $500</Eyebrow><ul><li>структура под задачу бизнеса</li><li>дизайн в едином стиле</li><li>адаптив под основные устройства</li><li>форма и один канал заявок</li><li>SEO-теги и аналитика</li></ul></div><div><Eyebrow>Сроки</Eyebrow><dl><div><dt>от 1 дня</dt><dd>небольшая задача</dd></div><div><dt>3–7 дней</dt><dd>мини-лендинг</dd></div><div><dt>от 7 дней</dt><dd>сайт для бизнеса</dd></div><div><dt>от 2 недель</dt><dd>CRM / админка</dd></div></dl></div></section><Faq /><FinalCta onLead={onLead} /></main>; }

const steps = [["01", "Разбор", "Понимаем бизнес, услуги, клиентов, текущие проблемы и цель сайта.", "Понятная задача и приоритеты"], ["02", "Структура", "Собираем логику страниц, офферов, CTA и пути к заявке.", "Согласованная структура"], ["03", "Сборка", "Делаю дизайн, адаптив, формы, SEO и техническую основу.", "Рабочая версия сайта"], ["04", "Заявки", "Подключаем формы и один канал: Telegram, MAX или email.", "Заявка приходит туда, где удобно"], ["05", "Запуск", "Проверяем страницы, аналитику и публикуем сайт.", "Сайт открыт и начинается поддержка"]];

function Process({ onLead }) { return <main><PageHero eyebrow="Процесс" title="Как проходит работа над сайтом" text="Сначала разбираем задачу, затем собираем структуру, делаем сайт, подключаем заявки и спокойно запускаем — без хаоса и сюрпризов." onLead={onLead} /><section className="section"><Eyebrow>5 этапов</Eyebrow><AccentTitle>От разбора до запуска</AccentTitle><div className="steps">{steps.map(([n,t,d,r]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p><strong>{r}</strong></article>)}</div></section><section className="section process-notes"><div><Eyebrow>Материалы</Eyebrow><h3>Что нужно от вас</h3><p>Описание бизнеса и услуг, контакты, логотип, фото, примеры, доступы и быстрая обратная связь.</p></div><div><Eyebrow>Правки</Eyebrow><h3>Как проходят правки</h3><p>1–2 круга входят в запуск. Исправляем текст, детали, состояния, адаптив и понятность блоков.</p></div><div><Eyebrow>После запуска</Eyebrow><h3>Что дальше</h3><p>Два месяца поддержки бесплатно, затем — новые страницы, CRM, интеграции или подписка от $50.</p></div></section><FinalCta onLead={onLead} /></main>; }

function DigitalOrbitPortrait() {
  const move = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 14;
    event.currentTarget.style.setProperty("--orbit-x", `${x}px`);
    event.currentTarget.style.setProperty("--orbit-y", `${y}px`);
    event.currentTarget.style.setProperty("--portrait-x", `${-x * .28}px`);
    event.currentTarget.style.setProperty("--portrait-y", `${-y * .28}px`);
  };
  const reset = (event) => {
    event.currentTarget.style.setProperty("--orbit-x", "0px");
    event.currentTarget.style.setProperty("--orbit-y", "0px");
    event.currentTarget.style.setProperty("--portrait-x", "0px");
    event.currentTarget.style.setProperty("--portrait-y", "0px");
  };
  const cards = [
    ["site", "Site", "Структура готова"],
    ["lead", "Lead", "Новая заявка"],
    ["crm", "CRM", "Клиент в работе"],
    ["telegram", "Telegram", "Сообщение получено"],
  ];
  return <div className="about-image about-orbit grid-surface" onPointerMove={move} onPointerLeave={reset}>
    <img src="/assets/images/egor-about-orbit.webp" alt="Егор в окружении digital-интерфейсов" width="1122" height="1402" loading="eager" decoding="async" fetchPriority="high" />
    <span className="about-orbit-ring" aria-hidden="true" />
    <div className="about-orbit-ui" aria-hidden="true">{cards.map(([type, title, detail]) => <span className={`about-orbit-card about-orbit-card-${type}`} key={type}><i /><span><strong>{title}</strong><small>{detail}</small></span></span>)}</div>
  </div>;
}

function About({ onLead, go }) { return <main><section className="section about-grid"><DigitalOrbitPortrait /><div><Eyebrow>Кто я</Eyebrow><AccentTitle>Егор — разработчик сайтов и CRM</AccentTitle><p>Я создаю сайты и digital-системы для бизнеса: помогаю понятнее показать услуги, повысить доверие, получать заявки и навести порядок в процессах.</p><p>Работал в школах водных видов спорта, фитнес-клубах, туризме и локальных сервисах. Поэтому понимаю бизнес изнутри: заявки в чатах, клиенты в таблицах, оплаты отдельно и отчёты вручную.</p><p>Моя задача — собрать понятную систему: сайт, заявки, аналитику, CRM и автоматизацию.</p><div className="about-facts"><span>5 лет в digital-проектах</span><span>Проект веду лично</span><span>Специалисты под задачи</span></div><CTA href="/cases" go={go}>Смотреть кейсы</CTA></div></section><Testimonials /><FinalCta onLead={onLead} /></main>; }

function Contacts({ onLead, go }) { return <main><PageHero eyebrow="Контакты" title="Расскажите, что нужно запустить" text="Не нужен длинный бриф. Достаточно имени и удобного способа связи — отвечу лично и уточню задачу." onLead={onLead} action="Оставить заявку" /><section className="section contact-options"><div><span>01</span><h3>Нужен сайт</h3><p>структура, заявки и запуск</p><button onClick={() => onLead({ service: "website", serviceLabel: "Сайт", source: "contacts_option" })}>Открыть форму</button></div><div><span>02</span><h3>Нужен аудит</h3><p>найти, что мешает доверию</p><button onClick={() => onLead({ service: "audit", serviceLabel: "Аудит", source: "contacts_option" })}>Открыть форму</button></div><div><span>03</span><h3>CRM и заявки</h3><p>навести порядок в обращениях</p><button onClick={() => onLead({ service: "crm", serviceLabel: "CRM", source: "contacts_option" })}>Открыть форму</button></div><div><span>04</span><h3>Поддержка</h3><p>доработки и техконтроль</p><button onClick={() => onLead({ service: "improvements", serviceLabel: "Доработка", source: "contacts_option" })}>Открыть форму</button></div></section><section className="section contact-hub"><div className="direct-contact"><Eyebrow>Прямые контакты</Eyebrow><AccentTitle>Напишите напрямую</AccentTitle><p>Можно не заполнять форму: выберите удобный канал и коротко расскажите о задаче. Егор ответит лично.</p><div className="direct-contact-list">{contactLinks.map((link) => <a className="direct-contact-link" href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} onClick={() => trackContact(link, "contacts")} key={link.label}><span>{link.label}</span><strong>{link.value}</strong><small>{link.action}</small></a>)}</div></div><div className="inline-lead"><LeadForm titleId="contact-form-title" selection={{ source: "contacts_inline" }} onPrivacy={() => go("/privacy")} /></div></section></main>; }

function Testimonials() {
  const items = [
    {
      name: "Дарья Каминскене",
      role: "Маркетолог · личный бренд",
      text: "Егор помог собрать структуру сайта и понятно упаковать мои услуги. Мы несколько раз обсуждали детали, правили подачу и адаптировали сайт для телефона. В итоге получился аккуратный сайт для личного бренда, который действительно соответствует моему стилю и который не стыдно отправлять клиентам.",
    },
    {
      name: "Анна",
      role: "Green Apple Dent",
      text: "Нам нужно было не просто обновить сайт, а сделать удобную систему для работы с заявками. Егор перенёс сайт, создал отдельную админку, подключил уведомления в Telegram и MAX и настроил всю техническую часть. Теперь обращения сохраняются в одном месте, а администратору стало намного проще их контролировать.",
    },
    {
      name: "Крыша-мечты",
      role: "Кровельные работы · Москва и область",
      text: "Егор разработал для нас полноценный сайт по кровельным работам: продумал структуру, оформил услуги, добавил калькулятор стоимости и формы заявок. Отдельно проработал мобильную версию и помог с запуском сайта на нашем домене. Получился понятный инструмент, где клиент может изучить услуги, рассчитать стоимость и оставить заявку.",
    },
  ];

  return <section className="section testimonials"><Eyebrow>Отзывы</Eyebrow><AccentTitle>Что говорят клиенты</AccentTitle><div>{items.map((item) => <blockquote key={item.name}><p>“{item.text}”</p><cite><strong>{item.name}</strong><span>{item.role}</span></cite></blockquote>)}</div></section>;
}
function Faq() { const qs = [["Можно начать с маленькой задачи?", "Да. Аудит, форма или точечная доработка помогают быстро проверить формат работы."], ["Один канал заявок входит в сайт?", "Да: Telegram, MAX или email — выбираем удобный вариант."], ["Что значит поддержка 2 месяца?", "Исправляю технические ошибки, помогаю с мелкими правками и контролирую стабильность после запуска."], ["Можно добавить CRM позже?", "Да. Сайт строится так, чтобы CRM и автоматизацию можно было подключить по мере роста."]]; const [openIndex, setOpenIndex] = useState(0); return <section className="section faq"><Eyebrow>FAQ</Eyebrow><AccentTitle>Короткие ответы</AccentTitle><div className="faq-list">{qs.map(([q,a], index) => { const open = openIndex === index; return <div className={open ? "faq-item is-open" : "faq-item"} key={q}><button type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(open ? -1 : index)}><span>{q}</span><i aria-hidden="true" /></button><div className="faq-answer" id={`faq-answer-${index}`} aria-hidden={!open}><div><p>{a}</p></div></div></div>; })}</div></section>; }
function FinalCta({ onLead }) { return <section className="final-cta grid-surface"><Eyebrow>Следующий шаг</Eyebrow><h2>Разберём задачу<br />без лишней сметы</h2><p>Напишите, какой у вас бизнес и что сейчас мешает заявкам. Предложу понятный первый шаг и ориентир по бюджету.</p><CTA onClick={onLead}>Получить разбор</CTA></section>; }

function FieldError({ id, message }) {
  return message ? <span className="field-error" id={id} role="alert">{message}</span> : null;
}

function LeadForm({ titleId, autoFocus = false, onPrivacy, heading = "Расскажите о задаче", selection = {} }) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [service, setService] = useState(selection.service || "website");
  const started = useRef(false);
  const fieldId = (name) => `${titleId}-${name}`;

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    trackGoal("lead_form_start", getGoalContext({ form: selection.source || "direct", service }));
  };

  const handleInput = (event) => {
    markStarted();
    const name = event.target?.name;
    if (!name || !fieldErrors[name]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (status === "sending") return;

    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const contact = String(values.get("contact") || "").trim();
    const currentWebsite = String(values.get("current_website") || "").trim();
    const websiteField = form.elements.namedItem("current_website");
    const privacyAccepted = values.get("privacy") === "on";
    const nextFieldErrors = {};
    if (!name) nextFieldErrors.name = "Введите имя.";
    if (!contact) nextFieldErrors.contact = "Укажите Telegram, WhatsApp, телефон или email.";
    if (currentWebsite && websiteField instanceof HTMLInputElement && !websiteField.validity.valid) nextFieldErrors.current_website = "Введите адрес сайта в формате https://example.com.";
    if (!privacyAccepted) nextFieldErrors.privacy = "Подтвердите согласие на обработку персональных данных.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setStatus("idle");
      window.requestAnimationFrame(() => form.querySelector("[aria-invalid='true']")?.focus());
      return;
    }

    setFieldErrors({});
    const attribution = captureAttribution();
    const currentPage = getCurrentPage();
    const comment = String(values.get("message") || "").trim();
    const chosenService = leadServices.find((item) => item.value === String(values.get("service") || service)) || leadServices[0];
    const payload = {
      name,
      contact,
      message: buildLeadMessage({ comment, serviceLabel: chosenService.label, price: selection.price, currentWebsite, attribution, currentPage }),
      comment,
      website: String(values.get("website") || "").trim(),
      current_website: currentWebsite,
      service: chosenService.value,
      service_label: chosenService.label,
      price: selection.price || "",
      page: currentPage,
      first_url: attribution.first_url,
      referrer: attribution.referrer,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
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
      if (!response.ok || result?.ok === false || result?.success === false) {
        throw new Error(result?.error || "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую.");
      }
      form.reset();
      setStatus("success");
      trackGoal("lead_form_success", getGoalContext({ form: selection.source || "direct", service: chosenService.value, price: selection.price || "" }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую.");
      setStatus("error");
      trackGoal("form_error", getGoalContext({ form: selection.source || "direct", service: chosenService.value }));
    }
  };

  if (status === "success") {
    return <div className="success" role="status"><Eyebrow>Готово</Eyebrow><h2 id={titleId}>Заявка отправлена</h2><p>Заявка уже пришла Егору в Telegram. Он свяжется с вами по указанному контакту.</p><div className="success-links">{contactLinks.map((link) => <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} onClick={() => trackContact(link, "form_success")} key={link.label}>{link.label}</a>)}</div></div>;
  }

  return <form noValidate onSubmit={submit} onInput={handleInput} aria-busy={status === "sending"}><Eyebrow>Короткий бриф</Eyebrow><h2 id={titleId}>{heading}</h2>{selection.selectionLabel && <p className="selected-plan">Вы выбрали: <strong>{selection.selectionLabel}</strong></p>}<fieldset className="service-choice"><legend>Что нужно</legend><div>{leadServices.map((item) => <label className={service === item.value ? "is-selected" : ""} key={item.value}><input type="radio" name="service" value={item.value} checked={service === item.value} onChange={() => setService(item.value)} /><span>{item.label}</span></label>)}</div></fieldset><label htmlFor={fieldId("name")}>Имя<input id={fieldId("name")} name="name" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? fieldId("name-error") : undefined} autoComplete="name" maxLength="120" placeholder="Как к вам обращаться" autoFocus={autoFocus} /><FieldError id={fieldId("name-error")} message={fieldErrors.name} /></label><label htmlFor={fieldId("contact")}>Способ связи<input id={fieldId("contact")} name="contact" required aria-invalid={Boolean(fieldErrors.contact)} aria-describedby={fieldErrors.contact ? fieldId("contact-error") : undefined} autoComplete="off" maxLength="200" placeholder="Telegram, WhatsApp или email" /><FieldError id={fieldId("contact-error")} message={fieldErrors.contact} /></label><label htmlFor={fieldId("current-website")}>Текущий сайт (по желанию)<input id={fieldId("current-website")} name="current_website" type="url" inputMode="url" aria-invalid={Boolean(fieldErrors.current_website)} aria-describedby={fieldErrors.current_website ? fieldId("current-website-error") : undefined} autoComplete="url" maxLength="1000" placeholder="https://example.com" /><FieldError id={fieldId("current-website-error")} message={fieldErrors.current_website} /></label><label htmlFor={fieldId("message")}>Комментарий (по желанию)<textarea id={fieldId("message")} name="message" rows="3" maxLength="3000" placeholder="Что хотите запустить или улучшить" /></label><input className="form-honeypot" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" /><label className="privacy-consent" htmlFor={fieldId("privacy")}><input id={fieldId("privacy")} name="privacy" type="checkbox" required aria-invalid={Boolean(fieldErrors.privacy)} aria-describedby={fieldErrors.privacy ? fieldId("privacy-error") : undefined} /><span>Я согласен на обработку персональных данных и принимаю <a href="/privacy" onClick={(event) => { event.preventDefault(); trackPrivacy("lead_form"); onPrivacy(); }}>политику конфиденциальности</a>.<FieldError id={fieldId("privacy-error")} message={fieldErrors.privacy} /></span></label>{status === "error" && <div className="form-status form-error" role="alert">{errorMessage}</div>}<button type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляю..." : "Отправить заявку"}</button></form>;
}

function LeadModal({ onClose, onPrivacy, selection, returnFocusElement }) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    const app = document.querySelector(".app");
    const previousAriaHidden = app?.getAttribute("aria-hidden");
    returnFocusRef.current = returnFocusElement instanceof HTMLElement ? returnFocusElement : document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusableSelector = [
      "a[href]", "button:not([disabled])", "input:not([disabled]):not([type='hidden'])",
      "textarea:not([disabled])", "select:not([disabled])", "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const handleKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(focusableSelector) || [])].filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) { event.preventDefault(); dialogRef.current?.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };

    document.body.classList.add("modal-open");
    if (app) { app.inert = true; app.setAttribute("aria-hidden", "true"); }
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => {
      const preferred = dialogRef.current?.querySelector("[autofocus]");
      (preferred || dialogRef.current?.querySelector(".modal-close") || dialogRef.current)?.focus();
    });
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
      if (app) {
        app.inert = false;
        app.removeAttribute("inert");
        if (previousAriaHidden === null) app.removeAttribute("aria-hidden");
        else app.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.setTimeout(() => returnFocusRef.current?.isConnected && returnFocusRef.current.focus(), 0);
    };
  }, [onClose, returnFocusElement]);

  const autoFocus = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-title" tabIndex="-1">
        <div className="modal-toolbar"><button className="modal-close" onClick={onClose} aria-label="Закрыть окно заявки">Закрыть</button></div>
        <div className="modal-content"><LeadForm titleId="lead-title" heading="Оставить заявку" autoFocus={autoFocus} onPrivacy={onPrivacy} selection={selection} /></div>
      </div>
    </div>,
    document.body,
  );
}

function Privacy({ go }) { return <main><PageHero className="privacy-hero" eyebrow="Документы" title={"Политика конфиденци\u00ADальности"} text="Здесь описано, какие данные используются при обращении через формы сайта, зачем они нужны и как запросить их удаление." href="/contacts" go={go} action="Перейти к контактам" /><section className="section privacy-page"><div className="privacy-intro"><Eyebrow>Редакция от 3 августа 2026</Eyebrow><AccentTitle>Коротко и понятно</AccentTitle><p>Оператор персональных данных — Егор Гецевич, Digital Tools by Egor. Контакт для вопросов и обращений: <a href="mailto:eggetsevich@gmail.com">eggetsevich@gmail.com</a>.</p></div><div className="privacy-sections"><article><span>01</span><h2>Какие данные</h2><p>Имя, контакт для связи, выбранная услуга, адрес текущего сайта и описание задачи, которые вы добровольно указываете в форме. Вместе с заявкой сохраняются страница обращения, первый посещённый адрес, источник перехода и UTM-метки рекламной кампании. Сайт не запрашивает паспортные, платёжные или иные чувствительные данные.</p></article><article><span>02</span><h2>Зачем они нужны</h2><p>Чтобы ответить на обращение, уточнить задачу, подготовить предложение, продолжить общение по выбранному вами каналу и понять эффективность источников заявок.</p></article><article><span>03</span><h2>Основание обработки</h2><p>Данные из формы обрабатываются только после вашего явного согласия: без отметки чекбокса форма не отправляется. Согласие можно отозвать в любой момент.</p></article><article><span>04</span><h2>Хранение и передача</h2><p>Данные используются только для связи по вашему запросу и не продаются третьим лицам. Они могут передаваться техническим сервисам связи, аналитики и хостинга только в объёме, необходимом для работы сайта.</p></article><article><span>05</span><h2>Ваши права</h2><p>Вы можете запросить уточнение, прекращение обработки или удаление данных, написав на email оператора. Запрос будет обработан в разумный срок.</p></article><article><span>06</span><h2>Яндекс Метрика и cookie</h2><p>Для анализа посещаемости используется Яндекс Метрика, счётчик 111655243, с функциями Вебвизора и карты кликов. Сервис может использовать cookie и получать технические сведения о посещении, включая адрес страницы, источник перехода и действия на сайте. В Метрику передаются события формы, выбора тарифа и переходов по основным ссылкам без имени и контактных данных. Эти сведения используются для улучшения сайта и оценки эффективности рекламы.</p></article></div><div className="privacy-contact"><h2>Нужно удалить данные</h2><p>Напишите с того же контакта, который использовали в заявке, и укажите, какие данные нужно удалить.</p><a href="mailto:eggetsevich@gmail.com">Написать на email</a></div></section></main>; }

function Footer({ go, onLead }) { return <footer><SiteLink className="brand footer-brand" href="/" go={go}><img src="/assets/images/egor-digital-e.webp" alt="" width="43" height="43" loading="lazy" decoding="async" /><span><b>Digital Tools by Egor</b><small>Websites · CRM · Automation</small></span></SiteLink><div className="footer-nav">{nav.slice(1).map(([href,label]) => <SiteLink key={href} href={href} go={go}>{label}</SiteLink>)}<SiteLink href="/privacy" go={go} onClick={() => trackPrivacy("footer")}>Политика конфиденциальности</SiteLink></div><div className="footer-contact"><span>Связаться напрямую</span>{contactLinks.map((link) => <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} onClick={() => trackContact(link, "footer")} key={link.label}>{link.label} · {link.value}</a>)}<button onClick={onLead}>Оставить заявку</button></div><p>© 2026 Digital Tools by Egor · Remote</p></footer>; }

export function App({ initialPath = "/" }) {
  const { path, go } = useRoute(initialPath);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSelection, setLeadSelection] = useState({});
  const [ready, setReady] = useState(false);
  const leadTriggerRef = useRef(null);
  const initialMetrikaPath = useRef(path);
  const initialFocusPath = useRef(path);
  const isNotFound = !knownPaths.has(path);
  useRevealOnScroll(path, ready);

  useEffect(() => { captureAttribution(); }, []);

  useEffect(() => {
    const route = getRoute(path);
    const title = route?.title || "404 — Страница не найдена | Egor Digital";
    const pageDescription = route?.description || "Запрошенная страница не найдена. Вернитесь на сайт Egor Digital или оставьте заявку.";
    const pageUrl = `${SITE_URL}${route?.path || path}`;
    const robots = document.querySelector('meta[name="robots"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "robots" }));
    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const setMeta = (selector, content) => { const element = document.querySelector(selector); if (element) element.content = content; };
    document.title = title;
    robots.content = isNotFound ? "noindex,follow" : "index,follow";
    if (description) description.content = pageDescription;
    if (canonical) canonical.href = pageUrl;
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', pageDescription);
    setMeta('meta[property="og:url"]', pageUrl);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', pageDescription);
  }, [isNotFound, path]);

  useEffect(() => {
    if (initialMetrikaPath.current === path) return;
    initialMetrikaPath.current = path;
    window.ym?.(111655243, "hit", window.location.href, {
      referer: document.referrer,
      title: document.title,
    });
  }, [path]);

  useEffect(() => {
    if (initialFocusPath.current === path) return;
    initialFocusPath.current = path;
    document.getElementById("page-content")?.focus({ preventScroll: true });
  }, [path]);

  useBrowserLayoutEffect(() => {
    let active = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let introSeen = false;
    try { introSeen = window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1"; } catch { introSeen = false; }
    if (introSeen) { setReady(true); return undefined; }

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
    const minimumDelay = reduceMotion ? 160 : window.matchMedia("(max-width: 820px)").matches ? 360 : 280;
    const minimum = new Promise((resolve) => window.setTimeout(resolve, minimumDelay));
    const maximum = new Promise((resolve) => window.setTimeout(resolve, 420));
    Promise.all([minimum, Promise.race([portraitReady, maximum])]).then(() => {
      if (!active) return;
      try { window.sessionStorage.setItem(INTRO_SESSION_KEY, "1"); } catch { /* session storage can be unavailable */ }
      setReady(true);
    });
    return () => { active = false; document.body.classList.remove("is-intro-active"); };
  }, []);

  useEffect(() => { if (ready) document.body.classList.remove("is-intro-active"); }, [ready]);
  const onLead = (selection = {}) => {
    const nextSelection = selection?.nativeEvent ? {} : selection;
    leadTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setLeadSelection(nextSelection);
    setLeadOpen(true);
    trackGoal("lead_modal_open", getGoalContext({ form: nextSelection.source || "general", service: nextSelection.service || "" }));
  };
  const page = path === "/" ? <Home go={go} onLead={onLead} /> : path === "/services" ? <Services onLead={onLead} /> : path === "/cases" ? <Cases go={go} onLead={onLead} /> : caseStudyContent[path] ? <CaseStudy path={path} go={go} onLead={onLead} /> : path === "/pricing" ? <Pricing onLead={onLead} /> : path === "/process" ? <Process onLead={onLead} /> : path === "/about" ? <About onLead={onLead} go={go} /> : path === "/contacts" ? <Contacts onLead={onLead} go={go} /> : path === "/privacy" ? <Privacy go={go} /> : <NotFound go={go} onLead={onLead} />;
  const openPrivacy = () => { setLeadOpen(false); go("/privacy"); };
  const closeLead = useCallback(() => setLeadOpen(false), []);
  return <><IntroLoader ready={ready} /><div className={ready ? "app is-ready" : "app"}><a className="skip-link" href="#page-content">Перейти к содержимому</a><Header path={path} go={go} onLead={onLead} modalOpen={leadOpen} /><div id="page-content" tabIndex="-1">{page}</div><Footer go={go} onLead={onLead} />{leadOpen && <LeadModal onClose={closeLead} onPrivacy={openPrivacy} selection={leadSelection} returnFocusElement={leadTriggerRef.current} />}</div></>;
}
