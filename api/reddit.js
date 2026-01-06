// Reddit 라이브 데이터 - 모든 방법 시도!

// 방법들 (순서대로 시도)
const FETCH_METHODS = [
  // 1. PullPush API (Reddit 아카이브, 가장 안정적)
  {
    name: 'PullPush API',
    url: 'https://api.pullpush.io/reddit/search/submission/?subreddit=popular,all,askreddit,todayilearned,pics,funny&size=30&sort=desc&sort_type=score',
    transform: (data) => {
      if (!data?.data?.length) return null
      return {
        data: {
          children: data.data.map(post => ({
            data: {
              id: post.id,
              title: post.title,
              subreddit: post.subreddit,
              score: post.score || 0,
              num_comments: post.num_comments || 0,
              created_utc: post.created_utc,
              author: post.author,
              permalink: post.permalink,
              url: post.url,
              thumbnail: post.thumbnail,
              selftext: post.selftext,
              over_18: post.over_18,
              preview: post.preview
            }
          })),
          after: null
        }
      }
    }
  },
  
  // 2. Reddit JSON via corsproxy.io
  {
    name: 'Reddit via corsproxy.io',
    url: 'https://corsproxy.io/?https%3A%2F%2Fwww.reddit.com%2Fr%2Fpopular.json%3Flimit%3D30%26raw_json%3D1',
    transform: (data) => data
  },
  
  // 3. Reddit JSON via allorigins
  {
    name: 'Reddit via allorigins',
    url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.reddit.com/r/popular.json?limit=30&raw_json=1'),
    transform: (data) => {
      if (typeof data === 'string') {
        try { return JSON.parse(data) } catch { return null }
      }
      return data
    }
  },
  
  // 4. old.reddit.com JSON 직접
  {
    name: 'old.reddit.com direct',
    url: 'https://old.reddit.com/r/popular.json?limit=30&raw_json=1',
    transform: (data) => data
  },
  
  // 5. www.reddit.com JSON 직접
  {
    name: 'www.reddit.com direct',
    url: 'https://www.reddit.com/r/popular.json?limit=30&raw_json=1',
    transform: (data) => data
  },
  
  // 6. Reddit via thingproxy
  {
    name: 'Reddit via thingproxy',
    url: 'https://thingproxy.freeboard.io/fetch/https://www.reddit.com/r/popular.json?limit=30&raw_json=1',
    transform: (data) => data
  }
]

async function tryFetch(url, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const text = await response.text()
    
    // JSON 파싱
    try {
      return JSON.parse(text)
    } catch {
      // allorigins wrapper 처리
      if (text.includes('"contents"')) {
        const wrapped = JSON.parse(text)
        if (wrapped.contents) {
          return JSON.parse(wrapped.contents)
        }
      }
      throw new Error('Invalid JSON response')
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function fetchRedditData() {
  const errors = []
  
  for (const method of FETCH_METHODS) {
    try {
      console.log(`[Reddit] Trying: ${method.name}`)
      const rawData = await tryFetch(method.url)
      const data = method.transform(rawData)
      
      // 데이터 검증
      if (data?.data?.children?.length > 0) {
        console.log(`[Reddit] SUCCESS with ${method.name}! Got ${data.data.children.length} posts`)
        return { data, source: method.name }
      } else {
        throw new Error('No posts in response')
      }
    } catch (error) {
      const errMsg = `${method.name}: ${error.message}`
      errors.push(errMsg)
      console.log(`[Reddit] FAILED: ${errMsg}`)
    }
  }
  
  throw new Error(`All ${errors.length} methods failed: ${errors.slice(0, 3).join('; ')}...`)
}

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // 캐시 헤더 (1분)
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  const { limit = 15 } = req.query

  try {
    const { data, source } = await fetchRedditData()
    
    const children = data?.data?.children || []
    
    // 데이터 처리 및 필터링
    const posts = children
      .filter(post => {
        const p = post.data
        return p && !p.over_18 && p.title && p.title.length > 3
      })
      .slice(0, parseInt(limit))
      .map(post => {
        const p = post.data
        return {
          id: p.id || Math.random().toString(36).substr(2, 9),
          title: p.title || '',
          subreddit: p.subreddit || 'popular',
          score: p.score || 0,
          num_comments: p.num_comments || 0,
          created_utc: p.created_utc || Math.floor(Date.now() / 1000),
          author: p.author || 'unknown',
          permalink: p.permalink || '',
          url: p.url || '',
          thumbnail: p.thumbnail || null,
          preview: p.preview || null,
          selftext: (p.selftext || '').substring(0, 500),
          is_video: p.is_video || false,
          post_hint: p.post_hint || null
        }
      })

    if (posts.length === 0) {
      throw new Error('No valid posts after filtering')
    }

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
