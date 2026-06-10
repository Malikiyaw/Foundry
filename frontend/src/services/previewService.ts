import { db, ProjectFile } from './db';

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

export async function registerPreviewSW(): Promise<void> {
  if ('serviceWorker' in navigator && !serviceWorkerRegistration) {
    try {
      // We use a simple SW to intercept requests in the preview iframe
      const swCode = `
        self.addEventListener('fetch', (event) => {
          const url = new URL(event.request.url);
          if (url.pathname.startsWith('/foundry-preview/')) {
            event.respondWith((async () => {
              const path = url.pathname.replace('/foundry-preview/', '');
              const { files } = await import('./db');
              const file = await files.where('path').equals(path).first();
              if (file) {
                const ext = path.split('.').pop() || 'txt';
                const mime: Record<string, string> = {
                  html: 'text/html', js: 'application/javascript', ts: 'application/javascript',
                  css: 'text/css', json: 'application/json', png: 'image/png',
                  jpg: 'image/jpeg', svg: 'image/svg+xml', mp3: 'audio/mpeg',
                  wav: 'audio/wav', ogg: 'audio/ogg',
                };
                return new Response(file.content, {
                  headers: { 'Content-Type': mime[ext] || 'text/plain', 'Cache-Control': 'no-cache' },
                });
              }
              return new Response('File not found', { status: 404 });
            })());
          }
        });
      `;
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      const reg = await navigator.serviceWorker.register(swUrl, { scope: '/foundry-preview/' });
      serviceWorkerRegistration = reg;
    } catch (e) {
      // SW registration may fail in some browsers - we'll use inline content instead
      console.warn('ServiceWorker registration failed, falling back to inline preview');
    }
  }
}

export async function generatePreviewBlob(projectId: string): Promise<string> {
  const files = await db.files.where('projectId').equals(projectId).toArray();
  const htmlFile = files.find(f => f.path === 'index.html');
  if (!htmlFile) return '';

  // Build a self-contained HTML that inlines all JS/CSS files
  let html = htmlFile.content;

  // Inject all JS files before </body>
  const jsFiles = files.filter(f => f.path.endsWith('.js') && f.path !== 'index.html');
  if (jsFiles.length > 0) {
    const jsCode = jsFiles.map(f => f.content).join('\n');
    html = html.replace('</body>', `<script>${jsCode}</script></body>`);
  }

  // Inject all CSS files before </head>
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  if (cssFiles.length > 0) {
    const cssCode = cssFiles.map(f => f.content).join('\n');
    html = html.replace('</head>', `<style>${cssCode}</style></head>`);
  }

  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

export async function exportProjectAsZip(projectId: string): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const files = await db.files.where('projectId').equals(projectId).toArray();
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `foundry-${projectId.slice(0, 8)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
