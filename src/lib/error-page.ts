export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load - Wisdawn</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      *, ::before, ::after { box-sizing: border-box; }
      body { 
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
        background: #F4F7FB; 
        color: #0F172A; 
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center;
        min-height: 100vh; 
        margin: 0; 
        padding: 1.5rem; 
      }
      .card { 
        background: #ffffff; 
        border: 1px solid #E2E8F0; 
        border-radius: 1.5rem; 
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); 
        max-width: 28rem; 
        width: 100%; 
        text-align: center; 
        padding: 2.5rem 2rem; 
        position: relative;
        overflow: hidden;
      }
      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        color: #4F46E5;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      h1 { 
        font-size: 1.5rem; 
        font-weight: 800; 
        letter-spacing: -0.025em; 
        margin: 0 0 0.5rem; 
      }
      p { 
        color: #64748B; 
        font-size: 0.875rem;
        font-weight: 500;
        margin: 0 0 2rem; 
        line-height: 1.5;
      }
      .actions { 
        display: flex; 
        gap: 0.75rem; 
        justify-content: center; 
        flex-wrap: wrap; 
      }
      a, button { 
        padding: 0.625rem 1.25rem; 
        border-radius: 9999px; 
        font-size: 0.875rem;
        font-weight: 700;
        font-family: inherit; 
        cursor: pointer; 
        text-decoration: none; 
        border: 1px solid transparent; 
        transition: all 0.2s ease-in-out;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      a:hover, button:hover {
        transform: scale(1.05);
      }
      .primary { 
        background: #4F46E5; 
        color: #fff; 
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      }
      .primary:hover {
        background: #4338CA;
      }
      .secondary { 
        background: #ffffff; 
        color: #0F172A; 
        border-color: #E2E8F0; 
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      }
      .secondary:hover {
        background: #F8FAFC;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        Wisdawn
      </div>
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home to continue learning.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}