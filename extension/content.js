(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  let enabled = true;
  let returnToTab = true;
  let automaticVideo = null;
  let pending = false;
  let lastPlayed = null;

  function videos(root = document) {
    const found = [...root.querySelectorAll('video')];
    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot) found.push(...videos(element.shadowRoot));
    }
    return found;
  }
  function inPiP(video) {
    return video.webkitPresentationMode === 'picture-in-picture' || document.pictureInPictureElement === video;
  }
  function candidate() {
    return videos().filter(v => !v.paused && !v.ended && v.readyState >= 2 && v.videoWidth > 0)
      .sort((a, b) => (b === lastPlayed) - (a === lastPlayed) || b.videoWidth * b.videoHeight - a.videoWidth * a.videoHeight)[0];
  }
  async function enter(video, automatic) {
    if (!video || pending || inPiP(video)) return false;
    pending = true;
    try {
      if (typeof video.webkitSetPresentationMode === 'function' && video.webkitSupportsPresentationMode?.('picture-in-picture')) {
        video.webkitSetPresentationMode('picture-in-picture');
      } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      } else {
        return false;
      }
      if (automatic) automaticVideo = video;
      return true;
    } catch (error) {
      console.debug('[Auto PiP] Safari отклонил запуск:', error.name);
      return false;
    } finally { pending = false; }
  }
  async function leaveAutomatic() {
    const video = automaticVideo;
    automaticVideo = null;
    if (!video || !inPiP(video)) return;
    try {
      if (video.webkitPresentationMode === 'picture-in-picture') video.webkitSetPresentationMode('inline');
      else await document.exitPictureInPicture();
    } catch (error) { console.debug('[Auto PiP] Возврат:', error.name); }
  }
  function visibilityChanged() {
    if (document.hidden) {
      if (enabled) void enter(candidate(), true);
    } else if (returnToTab) {
      void leaveAutomatic();
    }
  }
  document.addEventListener('play', event => {
    if (event.target instanceof HTMLVideoElement) lastPlayed = event.target;
  }, true);
  document.addEventListener('visibilitychange', visibilityChanged);
  api.storage.local.get({ enabled: true, returnToTab: true }).then(settings => {
    enabled = settings.enabled;
    returnToTab = settings.returnToTab;
  }).catch(console.debug);
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.enabled) enabled = changes.enabled.newValue;
    if (changes.returnToTab) returnToTab = changes.returnToTab.newValue;
  });
  api.runtime.onMessage.addListener(message => {
    if (message.type === 'enter-pip') return enter(candidate(), false).then(ok => ({ ok }));
  });
})();
