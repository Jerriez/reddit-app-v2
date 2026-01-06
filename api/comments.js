// Reddit 댓글 라이브 데이터 - 모든 방법 시도!

async function tryFetch(url, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch {
      if (text.includes('"contents"')) {
        const wrapped = JSON.parse(text)
        return JSON.parse(wrapped.contents)
      }
      throw new Error('Invalid JSON')
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function fetchComments(subreddit, postId, limit) {
  const methods = [
    // 1. PullPush API
    {
      name: 'PullPush',
      url: `https://api.pullpush.io/reddit/search/comment/?link_id=t3_${postId}&size=${limit}&sort=desc&sort_type=score`,
      transform: (data) => {
        if (!data?.data?.length) return null
        return data.data.map(c => ({
          id: c.id,
          body: c.body,
          author: c.author,
          score: c.score || 0,
          created_utc: c.created_utc,
          depth: 0
        }))
      }
    },
    
    // 2. Reddit JSON via corsproxy
    {
      name: 'Reddit via corsproxy',
      url: `https://corsproxy.io/?${encodeURIComponent(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top&raw_json=1`)}`,
      transform: (data) => {
        if (!Array.isArray(data) || !data[1]?.data?.children) return null
        return flattenComments(data[1].data.children)
      }
    },
    
    // 3. Reddit JSON via allorigins
    {
      name: 'Reddit via allorigins',
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top&raw_json=1`)}`,
      transform: (data) => {
        if (!Array.isArray(data) || !data[1]?.data?.children) return null
        return flattenComments(data[1].data.children)
      }
    },
    
    // 4. Reddit 직접
    {
      name: 'Reddit direct',
      url: `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top&raw_json=1`,
      transform: (data) => {
        if (!Array.isArray(data) || !data[1]?.data?.children) return null
        return flattenComments(data[1].data.children)
      }
    }
  ]
  
  for (const method of methods) {
    try {
      console.log(`[Comments] Trying: ${method.name}`)
      const rawData = await tryFetch(method.url)
      const comments = method.transform(rawData)
      
      if (comments && comments.length > 0) {
        console.log(`[Comments] SUCCESS with ${method.name}! Got ${comments.length} comments`)
        return { comments, source: method.name }
      }
    } catch (error) {
      console.log(`[Comments] FAILED ${method.name}: ${error.message}`)
    }
  }
  
  throw new Error('All comment fetch methods failed')
}

// Reddit 댓글 평면화
function flattenComments(children, depth = 0, maxDepth = 3) {
  const result = []
  
  if (!Array.isArray(children)) return result
  
  for (const child of children) {
    if (child.kind !== 't1') continue
    
    const c = child.data
    if (!c.body || c.body === '[deleted]' || c.body === '[removed]') continue
    
    result.push({
      id: c.id,
      body: c.body,
      author: c.author,
      score: c.score || 0,
      created_utc: c.created_utc,
      depth
    })
    
    if (depth < maxDepth && c.replies?.data?.children) {
      result.push(...flattenComments(c.replies.data.children, depth + 1, maxDepth))
    }
  }
  
  return result
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { postId, subreddit, limit = 15 } = req.query

  if (!postId || !subreddit) {
    return res.status(400).json({ error: 'postId and subreddit required' })
  }

  try {
    const { comments, source } = await fetchComments(subreddit, postId, limit)

    res.status(200).json({
      comments: comments.slice(0, 20),
      total: comments.length,
      isLive: true,
      source
    })

  } catch (error) {
    console.error('[Comments] Final error:', error.message)
    res.status(500).json({ 
      error: error.message,
      comments: [],
      isLive: false
    })
  }
}
