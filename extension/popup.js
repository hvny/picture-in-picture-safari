const api = globalThis.browser ?? globalThis.chrome;
async function init() {
  const settings = await api.storage.local.get({ enabled: true, returnToTab: true });
  for (const key of ['enabled', 'returnToTab']) {
    const input = document.getElementById(key);
    input.checked = settings[key];
    input.addEventListener('change', () => api.storage.local.set({ [key]: input.checked }));
  }
}
init().catch(console.error);
document.getElementById('open').addEventListener('click', async () => {
  const status = document.getElementById('status');
  try {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    const result = await api.tabs.sendMessage(tab.id, { type: 'enter-pip' });
    status.textContent = result?.ok ? 'Мини-окно открыто.' : 'Запустите видео. Если Safari блокирует запуск, включите PiP через меню самого видео.';
  } catch {
    status.textContent = 'Разрешите расширению доступ к сайту и обновите страницу с видео.';
  }
});
