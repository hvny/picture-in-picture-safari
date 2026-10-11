const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
async function setup({ paused = false, manual = false, blocked = false } = {}) {
  const listeners = {};
  const calls = [];
  const video = { paused, ended: false, readyState: 4, videoWidth: 1280, videoHeight: 720,
    webkitPresentationMode: manual ? 'picture-in-picture' : 'inline',
    webkitSupportsPresentationMode: () => true,
    webkitSetPresentationMode(mode) { if (blocked) throw new Error('blocked'); calls.push(mode); this.webkitPresentationMode = mode; } };
  const document = { hidden: false, querySelectorAll: selector => selector === 'video' ? [video] : [],
    addEventListener: (name, cb) => { listeners[name] = cb; } };
  let change;
  const browser = { storage: { local: { get: async defaults => defaults }, onChanged: { addListener: cb => change = cb } }, runtime: { onMessage: { addListener() {} } } };
  vm.runInNewContext(fs.readFileSync('extension/content.js', 'utf8'), { browser, document, console, HTMLVideoElement: function() {} });
  await Promise.resolve();
  return { calls, video, change, async visibility(hidden) { document.hidden = hidden; listeners.visibilitychange(); await Promise.resolve(); } };
}
test('playing video opens on hide and returns on show', async () => {
  const s = await setup(); await s.visibility(true); await s.visibility(false);
  assert.deepEqual(s.calls, ['picture-in-picture', 'inline']);
});
test('paused video stays inline', async () => {
  const s = await setup({ paused: true }); await s.visibility(true); assert.deepEqual(s.calls, []);
});
test('manual PiP is preserved', async () => {
  const s = await setup({ manual: true }); await s.visibility(true); await s.visibility(false); assert.deepEqual(s.calls, []);
});
test('disabled setting prevents automatic entry', async () => {
  const s = await setup(); s.change({ enabled: { newValue: false } }, 'local'); await s.visibility(true); assert.deepEqual(s.calls, []);
});
test('browser rejection is handled', async () => {
  const s = await setup({ blocked: true }); await s.visibility(true); await s.visibility(false); assert.deepEqual(s.calls, []);
});
