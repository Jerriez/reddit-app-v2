// Reddit 라이브 데이터 - Vercel 서버사이드에서 직접 호출 (CORS 없음)

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // 캐시 30초 (더 자주 업데이트)
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

  const { limit = 25, after: afterParam } = req.query

  try {
    // Reddit API 직접 호출 (서버사이드라 CORS 없음!)
    const afterQuery = afterParam ? `&after=${afterParam}` : ''
    const redditUrl = `https://www.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterQuery}`
    
    console.log(`[Reddit] Fetching: ${redditUrl}`)
    
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'RedditEnglishApp/1.0 (Educational English Learning App)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      // Reddit이 실패하면 old.reddit.com 시도
      console.log(`[Reddit] www.reddit.com failed (${response.status}), trying old.reddit.com...`)
      
      const oldRedditUrl = `https://old.reddit.com/r/popular/hot.json?limit=50&raw_json=1${afterQuery}`
      const oldResponse = await fetch(oldRedditUrl, {
        headers: {
          'User-Agent': 'RedditEnglishApp/1.0 (Educational English Learning App)',
          'Accept': 'application/json'
        }
      })
      
      if (!oldResponse.ok) {
        throw new Error(`Reddit API error: ${oldResponse.status}`)
      }
      
      const data = await oldResponse.json()
      return processAndSend(res, data, parseInt(limit), 'old.reddit.com')
    }

    const data = await response.json()
    return processAndSend(res, data, parseInt(limit), 'www.reddit.com')

  } catch (error) {
    console.error('[Reddit] Error:', error.message)
    
    // 최후의 수단: oauth 없는 Reddit API
    try {
      const afterQuery = afterParam ? `&after=${afterParam}` : ''
      const fallbackUrl = `https://api.reddit.com/r/popular/hot?limit=50&raw_json=1${afterQuery}`
      
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'RedditEnglishApp/1.0',
          'Accept': 'application/json'
        }
      })
      
      if (fallbackRes.ok) {
        const data = await fallbackRes.json()
        return processAndSend(res, data, parseInt(limit), 'api.reddit.com')
      }
    } catch (e) {
      console.error('[Reddit] Fallback also failed:', e.message)
    }
    
    res.status(500).json({ 
      error: error.message,
      isLive: false,
      posts: []
    })
  }
}

function processAndSend(res, data, limit, source) {
  const children = data?.data?.children || []
  
  console.log(`[Reddit] Got ${children.length} posts from ${source}`)
  
  // 데이터 처리 및 필터링
  const posts = children
    .filter(post => {
      const p = post.data
      // NSFW 제외, 제목 있는 것만
      return p && !p.over_18 && p.title && p.title.length > 3
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
    return res.status(500).json({ 
      error: 'No valid posts after filtering',
      isLive: false,
      posts: []
    })
  }

  // 디버그: 첫 3개 포스트 제목 로깅
  console.log(`[Reddit] Top 3 posts:`)
  posts.slice(0, 3).forEach((p, i) => {
    console.log(`  ${i + 1}. [r/${p.subreddit}] ${p.title.substring(0, 50)}...`)
  })

  res.status(200).json({
    posts,
    after: data.data?.after || null,
    isLive: true,
    source,
    count: posts.length
  })
}
