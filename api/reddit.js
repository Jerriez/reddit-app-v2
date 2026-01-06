// Vercel Edge Runtime 사용 (다른 지역 서버에서 요청)
export const config = {
  runtime: 'edge',
}

async function tryFetch(url, timeout = 8000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
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

async function fetchRedditData(after = null) {
  const afterParam = after ? `&after=${after}` : ''
  const errors = []
  
  const methods = [
    // 프록시들 (더 안정적)
    {
      name: 'corsproxy.io',
      url: `https://corsproxy.io/?${encodeURIComponent(`https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`)}`
    },
    {
      name: 'allorigins',
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`)}`
    },
    {
      name: 'corsproxy.org',
      url: `https://corsproxy.org/?${encodeURIComponent(`https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`)}`
    },
    {
      name: 'api.codetabs.com',
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`)}`
    },
    // 직접 시도 (Edge에서는 다른 IP라 될 수도 있음)
    {
      name: 'old.reddit.com',
      url: `https://old.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    },
    {
      name: 'www.reddit.com',
      url: `https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterParam}`
    },
  ]

  for (const method of methods) {
    try {
      console.log(`[Reddit] Trying: ${method.name}`)
      const data = await tryFetch(method.url)
      
      if (data?.data?.children?.length > 0) {
        console.log(`[Reddit] SUCCESS with ${method.name}! Got ${data.data.children.length} posts`)
        return { data, source: method.name }
      }
    } catch (e) {
      errors.push(`${method.name}: ${e.message}`)
      console.log(`[Reddit] ${method.name} failed: ${e.message}`)
    }
  }

  throw new Error(`All methods failed: ${errors.slice(0, 3).join('; ')}`)
}

export default async function handler(req) {
  // Edge Runtime은 Response 객체 사용
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '25')
  const afterParam = url.searchParams.get('after')

  try {
    const { data, source } = await fetchRedditData(afterParam || null)
    
    const children = data?.data?.children || []
    
    // 정치 관련 서브레딧 필터링 (영어 학습에 부적합)
    const politicalSubs = [
      'politics', 'worldnews', 'news', 'politicalhumor', 'conservative',
      'liberal', 'democrats', 'republican', 'uspolitics', 'ukpolitics',
      'worldpolitics', 'neutralpolitics', 'geopolitics', 'politicaldiscussion',
      'libertarian', 'socialism', 'capitalism', 'anarchism', 'progressive',
      'moderatepolitics', 'centrist', 'politicalcompass', 'whitepeopletwitter',
      'blackpeopletwitter', 'murderedbywords', 'clevercomebacks', 'facepalm',
      'leopardsatemyface', 'selfawarewolves', 'therewasanattempt', 'nottheonion'
    ]
    
    // 일반적인 정치 용어 (인물 이름 대신 역할/제도 단어)
    const politicalKeywords = [
      'president', 'congress', 'senate', 'senator', 'governor',
      'election', 'vote', 'ballot', 'impeach', 'legislation',
      'democrat', 'republican', 'liberal', 'conservative',
      'campaign', 'rally', 'partisan', 'bipartisan',
      'gop', 'dnc', 'rnc', 'potus', 'scotus',
      'politician', 'lobbyist', 'filibuster', 'veto',
      'executive order', 'white house', 'capitol'
    ]
    
    const posts = children
      .filter(post => {
        const p = post.data
        if (!p || p.over_18 || !p.title || p.title.length < 3) return false
        
        // 정치 서브레딧 제외
        const sub = p.subreddit?.toLowerCase()
        if (politicalSubs.includes(sub)) return false
        
        // 제목에 정치 키워드가 있으면 제외
        const title = p.title.toLowerCase()
        if (politicalKeywords.some(kw => title.includes(kw))) return false
        
        return true
      })
      .slice(0, limit)
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

    return new Response(JSON.stringify({
      posts,
      after: data.data?.after || null,
      isLive: true,
      source,
      count: posts.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('[Reddit] Final error:', error.message)
    return new Response(JSON.stringify({ 
      error: error.message,
      isLive: false,
      posts: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
