// Vercel에서 레딧 호출 (서버 -> 서버 = CORS 없음)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  
  try {
    const response = await fetch('https://www.reddit.com/r/popular.json?limit=10&raw_json=1', {
      headers: {
        // 일반 브라우저처럼 보이게
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    })

    if (!response.ok) {
      // 레딧 직접 호출 실패시 백업 데이터 반환
      return res.status(200).json(getBackupData())
    }

    const data = await response.json()
    
    // NSFW 필터링
    const safePosts = data.data.children.filter(post => {
      const p = post.data
      return !p.over_18 && p.title && p.title.length > 5
    })

    res.status(200).json({
      posts: safePosts,
      after: data.data.after
    })

  } catch (error) {
    console.error('Reddit fetch error:', error)
    // 에러시 백업 데이터 반환
    res.status(200).json(getBackupData())
  }
}

// 레딧 연결 실패시 사용할 샘플 데이터
function getBackupData() {
  return {
    posts: [
      {
        data: {
          id: 'sample1',
          title: "NGL this new movie is lowkey fire, the acting was chef's kiss",
          subreddit: 'movies',
          score: 15420,
          num_comments: 892,
          created_utc: Date.now() / 1000 - 7200,
          over_18: false
        }
      },
      {
        data: {
          id: 'sample2', 
          title: "My cat has been staring at the wall for 3 hours. Should I be concerned or is this just normal cat behavior?",
          subreddit: 'cats',
          score: 8934,
          num_comments: 445,
          created_utc: Date.now() / 1000 - 14400,
          over_18: false
        }
      },
      {
        data: {
          id: 'sample3',
          title: "TIL that octopuses have three hearts and blue blood. Nature is wild fr fr",
          subreddit: 'todayilearned',
          score: 23100,
          num_comments: 1205,
          created_utc: Date.now() / 1000 - 3600,
          over_18: false
        }
      },
      {
        data: {
          id: 'sample4',
          title: "AITA for telling my roommate that his 'cooking' is basically a war crime?",
          subreddit: 'AmItheAsshole',
          score: 12800,
          num_comments: 2341,
          created_utc: Date.now() / 1000 - 10800,
          over_18: false
        }
      },
      {
        data: {
          id: 'sample5',
          title: "Just finished a 10 hour gaming session. No regrets tbh, that game absolutely slaps",
          subreddit: 'gaming',
          score: 6543,
          num_comments: 328,
          created_utc: Date.now() / 1000 - 5400,
          over_18: false
        }
      }
    ],
    after: null,
    isBackup: true
  }
}
