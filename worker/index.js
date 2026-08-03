const APP_ROUTES = new Set(["/", "/services", "/cases", "/cases/daria-kaminskene", "/cases/green-apple-dent", "/cases/krysha-mechty", "/pricing", "/process", "/about", "/contacts", "/privacy"]);

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";
    const isKnownRoute = APP_ROUTES.has(pathname);
    const shellUrl = new URL(request.url);
    shellUrl.pathname = isKnownRoute ? (pathname === "/" ? "/index.html" : `${pathname}.html`) : "/404.html";
    shellUrl.search = "";
    const shell = await env.ASSETS.fetch(new Request(shellUrl, request));

    if (isKnownRoute || shell.status === 404) return shell;
    return new Response(request.method === "HEAD" ? null : shell.body, {
      status: 404,
      statusText: "Not Found",
      headers: shell.headers,
    });
  },
};
