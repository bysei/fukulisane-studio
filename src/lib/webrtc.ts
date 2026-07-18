/**
 * Shared WebRTC configuration — fetches TURN/STUN credentials from server
 * Used by RecordingStudio, MultiCameraStudio, and PhoneConnect
 */

let cachedConfig: RTCConfiguration | null = null
let fetchPromise: Promise<RTCConfiguration> | null = null

export async function getWebRTCConfig(): Promise<RTCConfiguration> {
  if (cachedConfig) return cachedConfig
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/webrtc/ice-servers')
      if (res.ok) {
        const data = await res.json()
        cachedConfig = {
          iceServers: data.iceServers,
          iceCandidatePoolSize: 10,
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
        }
        console.log(`[WebRTC] Loaded ${data.iceServers.length} ICE servers from ${data.source}`)
        return cachedConfig
      }
    } catch (e) {
      console.warn('[WebRTC] Failed to fetch ICE servers, using fallback:', e)
    }

    cachedConfig = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
      ],
      iceCandidatePoolSize: 10,
    }
    return cachedConfig
  })()

  return fetchPromise
}

export async function createPeerConnection(
  onTrack?: (event: RTCTrackEvent) => void,
  onIceCandidate?: (event: RTCPeerConnectionIceEvent) => void,
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void,
): Promise<RTCPeerConnection> {
  const config = await getWebRTCConfig()
  const pc = new RTCPeerConnection(config)
  if (onTrack) pc.ontrack = onTrack
  if (onIceCandidate) pc.onicecandidate = onIceCandidate
  if (onConnectionStateChange) pc.onconnectionstatechange = () => onConnectionStateChange(pc.connectionState)
  return pc
}

export async function pollOffers(roomCode: string): Promise<{ sdp: string; from: string }[]> {
  const res = await fetch(`/api/webrtc/room/${roomCode}/offers`)
  if (!res.ok) return []
  return res.json()
}

export async function postAnswer(roomCode: string, sdp: string, from = 'studio'): Promise<boolean> {
  const res = await fetch(`/api/webrtc/room/${roomCode}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdp, from }),
  })
  return res.ok
}

export async function postOffer(roomCode: string, sdp: string, from = 'phone'): Promise<boolean> {
  const res = await fetch(`/api/webrtc/room/${roomCode}/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdp, from }),
  })
  return res.ok
}

export async function pollAnswers(roomCode: string): Promise<{ sdp: string; from: string }[]> {
  const res = await fetch(`/api/webrtc/room/${roomCode}/answers`)
  if (!res.ok) return []
  return res.json()
}

export async function postCandidate(roomCode: string, candidate: string, from = 'unknown'): Promise<boolean> {
  const res = await fetch(`/api/webrtc/room/${roomCode}/candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate, from }),
  })
  return res.ok
}

export async function pollCandidates(roomCode: string, since = 0): Promise<{ candidate: string; from: string }[]> {
  const res = await fetch(`/api/webrtc/room/${roomCode}/candidates?since=${since}`)
  if (!res.ok) return []
  return res.json()
}

export async function uploadFile(file: File, folder = 'media'): Promise<{ ok: boolean; url?: string; error?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) return { ok: false, error: data.error }
  return { ok: true, url: data.url }
}

export async function startCamera(deviceId?: string): Promise<{ stream: MediaStream; error?: string }> {
  try {
    const constraints: MediaStreamConstraints = {
      video: deviceId
        ? { width: { ideal: 1280 }, height: { ideal: 720 }, deviceId: { exact: deviceId } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    return { stream }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
      return { stream: null as unknown as MediaStream, error: 'Camera permission denied.' }
    }
    if (msg.includes('NotFoundError')) {
      return { stream: null as unknown as MediaStream, error: 'No camera found.' }
    }
    if (msg.includes('NotReadableError')) {
      return { stream: null as unknown as MediaStream, error: 'Camera is in use by another app.' }
    }
    return { stream: null as unknown as MediaStream, error: `Camera error: ${msg}` }
  }
}
