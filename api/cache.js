// Vercel KV 캐시 API
// 환경변수: KV_REST_API_URL, KV_REST_API_TOKEN (Vercel 대시보드에서 설정)

export const config = {
  runtime: 'edge',
}

// KV에서 데이터 가져오기
async function kvGet(key) {
  const KV_URL = process.env.KV_REST_API_URL
  const KV_TOKEN = process.env.KV_REST_API_TOKEN
  
  if (!KV_URL || !KV_TOKEN) return null
  
  try {
    const res = await fetch(`${KV_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    })
    if (res.ok) {
      const data = await res.json()
      return data.result
    }
  } catch (e) {
    console.error('KV GET error:', e)
  }
  return null
}

// KV에 데이터 저장 (24시간 TTL)
async function kvSet(key, value, ttl = 86400) {
  const KV_URL = process.env.KV_REST_API_URL
  const KV_TOKEN = process.env.KV_REST_API_TOKEN
  
  if (!KV_URL || !KV_TOKEN) return false
  
  try {
    const res = await fetch(`${KV_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value, ex: ttl })
    })
    return res.ok
  } catch (e) {
    console.error('KV SET error:', e)
  }
  return false
}

export default async function handler(req) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  const key = url.searchParams.get('key')
  
  // KV 사용 가능 여부 확인
  const kvEnabled = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  
  if (action === 'status') {
    return new Response(JSON.stringify({ 
      kvEnabled,
      message: kvEnabled ? 'Vercel KV is configured' : 'Using session storage (KV not configured)'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (!kvEnabled) {
    return new Response(JSON.stringify({ 
      error: 'KV not configured',
      useLocal: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (action === 'get' && key) {
    const value = await kvGet(key)
    return new Response(JSON.stringify({ 
      key, 
      value,
      found: value !== null 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (action === 'set' && key && req.method === 'POST') {
    try {
      const body = await req.json()
      const success = await kvSet(key, JSON.stringify(body.value))
      return new Response(JSON.stringify({ 
        success,
        key 
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: e.message 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  return new Response(JSON.stringify({ 
    error: 'Invalid action',
    usage: '?action=get&key=xxx or ?action=set&key=xxx (POST with body)' 
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  })
}
