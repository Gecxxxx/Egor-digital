export const SITE_URL = "https://egordigital.site";
export const SOCIAL_IMAGE = `${SITE_URL}/assets/cases/greenappledent-1440.webp`;

export const routes = [
  {
    path: "/",
    label: "Главная",
    title: "Создание сайтов, CRM и автоматизация для бизнеса — Egor Digital",
    description: "Создание сайтов, CRM и автоматизации для бизнеса: структура, дизайн, мобильная версия, формы заявок и поддержка после запуска.",
  },
  {
    path: "/services",
    label: "Услуги",
    title: "Создание сайтов и CRM для бизнеса — услуги и цены",
    description: "Сайты для бизнеса, аудит, формы заявок, CRM, автоматизация и техническая поддержка от Egor Digital.",
  },
  {
    path: "/cases",
    label: "Кейсы",
    title: "Кейсы разработки сайтов, CRM и автоматизации",
    description: "Реальные проекты и демонстрационные концепции Egor Digital: сайты, CRM, автоматизация, личные бренды и системы заявок.",
  },
  {
    path: "/cases/daria-kaminskene",
    label: "Дарья Каминскене",
    nav: false,
    parentPath: "/cases",
    parentLabel: "Кейсы",
    title: "Кейс сайта маркетолога Дарьи Каминскене — Egor Digital",
    description: "Как создан многостраничный сайт личного бренда маркетолога: направления услуг, кейсы, статьи, адаптив и путь к заявке.",
  },
  {
    path: "/cases/green-apple-dent",
    label: "Green Apple Dent",
    nav: false,
    parentPath: "/cases",
    parentLabel: "Кейсы",
    title: "Кейс сайта и CRM Green Apple Dent — Egor Digital",
    description: "Сайт стоматологии с услугами, ценами, формами записи, админкой заявок и уведомлениями в Telegram и MAX.",
  },
  {
    path: "/cases/krysha-mechty",
    label: "Крыша-мечты",
    nav: false,
    parentPath: "/cases",
    parentLabel: "Кейсы",
    title: "Кейс сайта Крыша-мечты с калькулятором — Egor Digital",
    description: "Сайт кровельных работ с понятной структурой услуг, калькулятором стоимости, формами заявок и адаптивной версией.",
  },
  {
    path: "/pricing",
    label: "Цены",
    title: "Стоимость создания сайта и CRM — от $500",
    description: "Цены на разработку сайта, CRM, автоматизацию, аудит и поддержку. Сайт для бизнеса — от $500.",
  },
  {
    path: "/process",
    label: "Процесс",
    title: "Как проходит разработка сайта и CRM — Egor Digital",
    description: "Этапы работы над сайтом: разбор задачи, структура, дизайн, разработка, подключение заявок, проверка и запуск.",
  },
  {
    path: "/about",
    label: "Обо мне",
    title: "Егор Гецевич — разработчик сайтов и CRM",
    description: "Егор Гецевич создаёт сайты, CRM и digital-системы для бизнеса, лично ведёт проект и помогает после запуска.",
  },
  {
    path: "/contacts",
    label: "Контакты",
    title: "Контакты Egor Digital — обсудить сайт или CRM",
    description: "Свяжитесь с Егором в Telegram, WhatsApp, по email или оставьте заявку на разработку сайта, CRM или аудит.",
  },
  {
    path: "/privacy",
    label: "Политика конфиденциальности",
    title: "Политика конфиденциальности — Egor Digital",
    description: "Политика обработки персональных данных и использования Яндекс Метрики на сайте Egor Digital.",
  },
];

export const routeMap = new Map(routes.map((route) => [route.path, route]));

export function normalizePath(value = "/") {
  const path = String(value).split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getRoute(path) {
  return routeMap.get(normalizePath(path));
}
