// Redlib 기반 Reddit 데이터 가져오기 - API 키 불필요!

// 여러 Redlib 인스턴스 (하나 실패시 다른 것 사용)
const REDLIB_INSTANCES = [
  'https://redlib.catsarch.com',
  'https://safereddit.com',
  'https://redlib.perennialte.ch',
  'https://red.ngn.tf',
  'https://redlib.freedit.eu'
]

// old.reddit.com JSON도 백업으로 사용
const FALLBACK_SOURCES = [
  'https://old.reddit.com'
]

// 여러 소스에서 시도
async function fetchWithFallback(path) {
  const allSources = [...REDLIB_INSTANCES, ...FALLBACK_SOURCES]
  
  for (const baseUrl of allSources) {
    try {
      const url = `${baseUrl}${path}`
      console.log(`Trying: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`Success from: ${baseUrl}`)
        return { data, source: baseUrl }
      }
    } catch (error) {
      console.log(`Failed ${baseUrl}: ${error.message}`)
      continue
    }
  }
  
  throw new Error('All sources failed')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { after, limit = 15, subreddit = 'popular' } = req.query

  try {
    // JSON 엔드포인트 경로
    let path = `/r/${subreddit}.json?limit=${limit}&raw_json=1`
    if (after) {
      path += `&after=${after}`
    }

    const { data, source } = await fetchWithFallback(path)

    // 데이터 구조 확인 (Redlib과 Reddit JSON은 같은 구조)
    const children = data?.data?.children || []
    
    // NSFW 필터링
    const safePosts = children.filter(post => {
      const p = post.data
      return !p.over_18 && p.title && p.title.length > 5
    })

    // 필요한 데이터만 추출
    const posts = safePosts.map(post => {
      const p = post.data
      return {
        id: p.id,
        title: p.title,
        subreddit: p.subreddit,
        score: p.score,
        num_comments: p.num_comments,
        created_utc: p.created_utc,
        author: p.author,
        permalink: p.permalink,
        url: p.url,
        thumbnail: p.thumbnail,
        preview: p.preview,
        selftext: p.selftext,
        is_video: p.is_video,
        post_hint: p.post_hint
      }
    })

    res.status(200).json({
      posts,
      after: data.data?.after || null,
      isLive: true,
      source: source
    })

  } catch (error) {
    console.error('Reddit fetch error:', error)
    res.status(500).json({ 
      error: error.message,
      isLive: false
    })
  }
}
