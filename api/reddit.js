// Reddit 라이브 데이터 - 여러 방법 시도

async function tryFetch(url, timeout = 8000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const text = await response.text()
    return JSON.parse(text)
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// 여러 방법을 순서대로 시도
async function fetchRedditData(after = null) {
  const afterParam = after ? `&after=${after}` : ''
  const errors = []
  
  // 방법 1: old.reddit.com (덜 제한적)
  try {
    console.log('[Reddit] Trying: old.reddit.com')
    const url = `https://old.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    const data = await tryFetch(url)
    if (data?.data?.children?.length > 0) {
      console.log(`[Reddit] SUCCESS with old.reddit.com! Got ${data.data.children.length} posts`)
      return { data, source: 'old.reddit.com' }
    }
  } catch (e) {
    errors.push(`old.reddit.com: ${e.message}`)
    console.log(`[Reddit] old.reddit.com failed: ${e.message}`)
  }

  // 방법 2: www.reddit.com
  try {
    console.log('[Reddit] Trying: www.reddit.com')
    const url = `https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    const data = await tryFetch(url)
    if (data?.data?.children?.length > 0) {
      console.log(`[Reddit] SUCCESS with www.reddit.com! Got ${data.data.children.length} posts`)
      return { data, source: 'www.reddit.com' }
    }
  } catch (e) {
    errors.push(`www.reddit.com: ${e.message}`)
    console.log(`[Reddit] www.reddit.com failed: ${e.message}`)
  }

  // 방법 3: api.reddit.com
  try {
    console.log('[Reddit] Trying: api.reddit.com')
    const url = `https://api.reddit.com/r/popular/hot?limit=50&raw_json=1${afterParam}`
    const data = await tryFetch(url)
    if (data?.data?.children?.length > 0) {
      console.log(`[Reddit] SUCCESS with api.reddit.com! Got ${data.data.children.length} posts`)
      return { data, source: 'api.reddit.com' }
    }
  } catch (e) {
    errors.push(`api.reddit.com: ${e.message}`)
    console.log(`[Reddit] api.reddit.com failed: ${e.message}`)
  }

  // 방법 4: corsproxy.io
  try {
    console.log('[Reddit] Trying: corsproxy.io')
    const targetUrl = `https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
    const data = await tryFetch(url)
    if (data?.data?.children?.length > 0) {
      console.log(`[Reddit] SUCCESS with corsproxy.io! Got ${data.data.children.length} posts`)
      return { data, source: 'corsproxy.io' }
    }
  } catch (e) {
    errors.push(`corsproxy.io: ${e.message}`)
    console.log(`[Reddit] corsproxy.io failed: ${e.message}`)
  }

  // 방법 5: allorigins
  try {
    console.log('[Reddit] Trying: allorigins')
    const targetUrl = `https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    const data = await tryFetch(url)
    if (data?.data?.children?.length > 0) {
      console.log(`[Reddit] SUCCESS with allorigins! Got ${data.data.children.length} posts`)
      return { data, source: 'allorigins' }
    }
  } catch (e) {
    errors.push(`allorigins: ${e.message}`)
    console.log(`[Reddit] allorigins failed: ${e.message}`)
  }

  // 방법 6: jsonp.afeld.me
  try {
    console.log('[Reddit] Trying: jsonp proxy')
    const targetUrl = `https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    const url = `https://jsonp.afeld.me/?url=${encodeURIComponent(targetUrl)}`
    const data = await tryFetch(url)
    if (data?.data?.children?.length > 0) {
      console.log(`[Reddit] SUCCESS with jsonp proxy! Got ${data.data.children.length} posts`)
      return { data, source: 'jsonp.afeld.me' }
    }
  } catch (e) {
    errors.push(`jsonp: ${e.message}`)
    console.log(`[Reddit] jsonp proxy failed: ${e.message}`)
  }

  throw new Error(`All methods failed: ${errors.join('; ')}`)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // 캐시 1분
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')

  const { limit = 25, after: afterParam } = req.query

  try {
    const { data, source } = await fetchRedditData(afterParam || null)
    
    const children = data?.data?.children || []
    
    const posts = children
      .filter(post => {
        const p = post.data
        return p && !p.over_18 && p.title && p.title.length > 3
      })
      .slice(0, parseInt(limit))
      .map(post => {
        const p = post.data
        return {
          id: p.id,
          title: p.title,
          subreddit: p.subreddit,
          score: p.score || 0,
          num_comments: p.num_comments || 0,
          created_utc: p.created_utc,
          author: p.author,
          permalink: p.permalink,
          url: p.url,
          thumbnail: p.thumbnail,
          preview: p.preview || null,
          selftext: (p.selftext || '').substring(0, 500),
          is_video: p.is_video || false,
          media: p.media || null,
          post_hint: p.post_hint || null
        }
      })

    if (posts.length === 0) {
      throw new Error('No valid posts after filtering')
    }

    console.log(`[Reddit] Sending ${posts.length} posts from ${source}`)
    console.log(`[Reddit] First post: [r/${posts[0].subreddit}] ${posts[0].title.substring(0, 60)}...`)

    res.status(200).json({
      posts,
      after: data.data?.after || null,
      isLive: true,
      source,
      count: posts.length
    })

  } catch (error) {
    console.error('[Reddit] Final error:', error.message)
    res.status(500).json({ 
      error: error.message,
      isLive: false,
      posts: []
    })
  }
}
