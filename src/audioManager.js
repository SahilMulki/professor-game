const ambient = new Audio('/audio/classroom_ambient.flac')
ambient.loop = true
ambient.volume = 0.25

const SFX = {
  trigger:  new Audio('/audio/bell_ring.wav'),
  positive: new Audio('/audio/positive_chime.mp3'),
  negative: new Audio('/audio/negative_ding.wav'),
  neutral:  new Audio('/audio/neutral_click.mp3'),
}
Object.values(SFX).forEach(a => { a.volume = 0.6 })

export function startAmbient() {
  ambient.play().catch(() => {})
}

export function stopAmbient() {
  ambient.pause()
  ambient.currentTime = 0
}

export function setAmbientVolume(v) {
  ambient.volume = v
}

export function playSfx(name) {
  const sfx = SFX[name]
  if (!sfx) return
  sfx.currentTime = 0
  sfx.play().catch(() => {})
}
