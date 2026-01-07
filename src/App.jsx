import { useState, useEffect, useCallback, useRef } from 'react'

// SVG 아이콘 컴포넌트들
const Icons = {
  fire: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  arrowUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  ),
  messageCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  fileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  eyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  ),
  book: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  hash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/>
      <line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/>
      <line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  lightbulb: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
  ),
  x: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  chevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  play: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  volume: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  ),
  translate: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l6 6"/>
      <path d="M4 14l6-6 2-3"/>
      <path d="M2 5h12"/>
      <path d="M7 2v3"/>
      <path d="M22 22l-5-10-5 10"/>
      <path d="M14 18h6"/>
    </svg>
  ),
  externalLink: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  eyeSlash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  chevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  chevronUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  )
}

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [after, setAfter] = useState(null)
  const [popup, setPopup] = useState(null)
  const [wordPopup, setWordPopup] = useState(null)
  
  // 숨긴 게시물 (localStorage에 저장)
  const [hiddenPosts, setHiddenPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('hiddenPosts')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  
  // hiddenPosts 변경시 localStorage 저장
  useEffect(() => {
    localStorage.setItem('hiddenPosts', JSON.stringify(hiddenPosts))
  }, [hiddenPosts])
  
  const hidePost = (postId) => {
    setHiddenPosts(prev => [...prev, postId])
  }
  
  // useRef로 최신 after 값 추적
  const afterRef = useRef(null)
  useEffect(() => {
    afterRef.current = after
  }, [after])

  const loadPosts = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      // useRef를 통해 최신 after 값 사용
      const currentAfter = afterRef.current
      const url = loadMore && currentAfter ? `/api/reddit?after=${currentAfter}` : '/api/reddit'
      const res = await fetch(url)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Server error: ${res.status}`)
      }

      const data = await res.json()
      
      if (!data.isLive) {
        throw new Error('Reddit API connection failed')
      }

      const transformedPosts = await Promise.all(
        data.posts.map(async (post) => {
          const cacheKey = `post_v2_${post.id}`
          const cached = sessionStorage.getItem(cacheKey)
          
          if (cached) {
            try {
              const cachedData = JSON.parse(cached)
              if (cachedData.title?.sentences) {
                return { ...post, transformed: cachedData }
              }
            } catch {}
          }

          try {
            // 병렬로 제목과 본문 동시 변환 (속도 2배 향상)
            const [titleRes, selftextRes] = await Promise.all([
              fetch('/api/transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: post.title,
                  subreddit: post.subreddit
                })
              }),
              post.selftext && post.selftext.trim().length > 0
                ? fetch('/api/transform', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      text: post.selftext,
                      subreddit: post.subreddit
                    })
                  })
                : Promise.resolve(null)
            ])

            let titleTransformed = null
            if (titleRes.ok) {
              titleTransformed = await titleRes.json()
            }

            let selftextTransformed = null
            if (selftextRes && selftextRes.ok) {
              selftextTransformed = await selftextRes.json()
            }

            const transformed = {
              title: titleTransformed,
              selftext: selftextTransformed
            }
            
            sessionStorage.setItem(cacheKey, JSON.stringify(transformed))
            return { ...post, transformed }
          } catch (e) {
            console.error('Transform error:', e)
          }

          return {
            ...post,
            transformed: {
              title: {
                sentences: [{
                  original: post.title,
                  simplified: post.title,
                  korean: '(번역 로딩 중...)',
                  slang_notes: []
                }]
              },
              selftext: post.selftext ? {
                sentences: [{
                  original: post.selftext,
                  simplified: post.selftext,
                  korean: '(번역 로딩 중...)',
                  slang_notes: []
                }]
              } : null
            }
          }
        })
      )

      if (loadMore) {
        setPosts(prev => [...prev, ...transformedPosts])
      } else {
        setPosts(transformedPosts)
      }

      setAfter(data.after)

    } catch (e) {
      console.error('Load error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, []) // after를 의존성에서 제거

  useEffect(() => {
    loadPosts()
  }, [])

  const lookupWord = async (word, context = '') => {
    setWordPopup({ word, loading: true })
    
    try {
      const res = await fetch('/api/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context })
      })
      
      if (res.ok) {
        const data = await res.json()
        setWordPopup({ ...data, loading: false })
      } else {
        throw new Error('Lookup failed')
      }
    } catch (e) {
      setWordPopup({ 
        word, 
        meaning: 'Failed to look up',
        korean: '검색 실패',
        examples: [],
        loading: false 
      })
    }
  }

  if (error && posts.length === 0) {
    return (
      <div>
        <Header />
        <main className="container">
          <div className="error-container">
            <div className="error-icon">
              <Icons.x />
            </div>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => loadPosts()}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />

      <main className="container">
        {loading ? (
          <div className="skeleton-container">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-line short"></div>
                </div>
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line medium"></div>
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-line tiny"></div>
                  <div className="skeleton-line tiny"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {posts
              .filter(post => !hiddenPosts.includes(post.id))
              .map(post => (
              <PostCard
                key={post.id}
                post={post}
                onSlangClick={setPopup}
                onWordClick={lookupWord}
                onHide={hidePost}
              />
            ))}

            {after && (
              <div className="load-more-container">
                <button
                  className="load-more-button"
                  onClick={() => loadPosts(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {popup && (
        <SlangPopup slang={popup} onClose={() => setPopup(null)} />
      )}

      {wordPopup && (
        <WordPopup data={wordPopup} onClose={() => setWordPopup(null)} />
      )}
    </div>
  )
}

// Reddit 비디오 플레이어 (자동재생 + 음소거 + 스크롤 감지)
function RedditVideoPlayer({ videoUrl, audioUrl, hlsUrl, onError }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const [audioSrc, setAudioSrc] = useState(null)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // IntersectionObserver로 화면에 보이면 자동재생
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting)
          const video = videoRef.current
          if (video) {
            if (entry.isIntersecting) {
              video.play().catch(() => {})
            } else {
              video.pause()
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // 여러 오디오 URL 형식 시도
  useEffect(() => {
    if (!audioUrl) return
    
    const baseUrl = audioUrl.replace(/DASH_AUDIO_\d+\.mp4.*/, '').replace(/DASH_audio\.mp4.*/, '')
    const audioUrls = [
      audioUrl,
      `${baseUrl}DASH_AUDIO_128.mp4`,
      `${baseUrl}DASH_AUDIO_64.mp4`,
      `${baseUrl}DASH_audio.mp4`,
      `${baseUrl}audio.mp4`,
    ]
    
    const tryNextUrl = async (index) => {
      if (index >= audioUrls.length) return
      
      try {
        const response = await fetch(audioUrls[index], { method: 'HEAD' })
        if (response.ok) {
          setAudioSrc(audioUrls[index])
          return
        }
      } catch {}
      
      tryNextUrl(index + 1)
    }
    
    tryNextUrl(0)
  }, [audioUrl])

  // 비디오-오디오 동기화
  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio || !audioLoaded) return

    const syncPlay = () => {
      audio.currentTime = video.currentTime
      audio.play().catch(() => {})
    }
    
    const syncPause = () => {
      audio.pause()
    }
    
    const syncTime = () => {
      if (Math.abs(video.currentTime - audio.currentTime) > 0.3) {
        audio.currentTime = video.currentTime
      }
    }

    const syncVolume = () => {
      audio.volume = video.volume
      audio.muted = video.muted
    }

    syncVolume()

    video.addEventListener('play', syncPlay)
    video.addEventListener('pause', syncPause)
    video.addEventListener('seeked', syncTime)
    video.addEventListener('timeupdate', syncTime)
    video.addEventListener('volumechange', syncVolume)

    return () => {
      video.removeEventListener('play', syncPlay)
      video.removeEventListener('pause', syncPause)
      video.removeEventListener('seeked', syncTime)
      video.removeEventListener('timeupdate', syncTime)
      video.removeEventListener('volumechange', syncVolume)
    }
  }, [audioLoaded])

  const actualVideoUrl = hlsUrl || videoUrl

  return (
    <div className="post-video-container" ref={containerRef}>
      <video
        ref={videoRef}
        src={actualVideoUrl}
        controls
        playsInline
        muted
        loop
        preload="metadata"
        className="post-video"
        onError={onError}
      />
      {audioSrc && !hlsUrl && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          muted
          onCanPlay={() => setAudioLoaded(true)}
          onError={() => setAudioSrc(null)}
        />
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon"><Icons.fire /></span>
          <span>Reddit English</span>
        </div>
        <div className="header-right">
          <div className="live-badge">
            <span className="live-dot"></span>
            <span>LIVE</span>
          </div>
          <span className="subreddit-badge">r/popular</span>
        </div>
      </div>
    </header>
  )
}

function PostCard({ post, onSlangClick, onWordClick, onHide }) {
  const [showKorean, setShowKorean] = useState(false)  // 전체 제목에 대해 하나의 상태
  const [showOriginal, setShowOriginal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [expandSelftext, setExpandSelftext] = useState(false)

  // 이미지 URL 추출
  const getImageUrl = () => {
    if (post.preview?.images?.[0]?.source?.url) {
      return post.preview.images[0].source.url.replace(/&amp;/g, '&')
    }
    if (post.thumbnail && post.thumbnail.startsWith('http') && 
        !post.thumbnail.includes('self') && !post.thumbnail.includes('default')) {
      return post.thumbnail
    }
    return null
  }

  // 비디오 URL 추출
  const getVideoUrl = () => {
    if (post.is_video && post.media?.reddit_video?.fallback_url) {
      return post.media.reddit_video.fallback_url
    }
    if (post.url?.includes('v.redd.it')) {
      return `${post.url}/DASH_720.mp4`
    }
    return null
  }

  // HLS URL 추출 (video+audio 합쳐져 있음)
  const getHlsUrl = () => {
    if (post.is_video && post.media?.reddit_video?.hls_url) {
      return post.media.reddit_video.hls_url
    }
    return null
  }

  // 오디오 URL 추출 (Reddit은 video/audio 분리 저장)
  const getAudioUrl = () => {
    if (post.is_video && post.media?.reddit_video?.fallback_url) {
      const videoUrl = post.media.reddit_video.fallback_url
      // DASH_720.mp4, DASH_480.mp4 등에서 베이스 URL 추출
      const baseUrl = videoUrl.replace(/DASH_\d+\.mp4.*/, '').replace(/DASH_[^.]+\.mp4.*/, '')
      return `${baseUrl}DASH_AUDIO_128.mp4`
    }
    if (post.url?.includes('v.redd.it')) {
      return `${post.url}/DASH_AUDIO_128.mp4`
    }
    return null
  }

  const imageUrl = getImageUrl()
  const videoUrl = getVideoUrl()
  const hlsUrl = getHlsUrl()
  const audioUrl = getAudioUrl()

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments)
      return
    }

    setShowComments(true)
    setLoadingComments(true)

    try {
      const res = await fetch(`/api/comments?postId=${post.id}&subreddit=${post.subreddit}`)
      const data = await res.json()

      const transformedComments = await Promise.all(
        data.comments.slice(0, 10).map(async (comment) => {
          try {
            const transformRes = await fetch('/api/transform', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: comment.body,
                subreddit: post.subreddit
              })
            })

            if (transformRes.ok) {
              const transformed = await transformRes.json()
              return { ...comment, transformed }
            }
          } catch {}

          return {
            ...comment,
            transformed: {
              sentences: [{
                original: comment.body,
                simplified: comment.body,
                korean: '',
                slang_notes: []
              }]
            }
          }
        })
      )

      setComments(transformedComments)
    } catch (e) {
      console.error('Comments error:', e)
    } finally {
      setLoadingComments(false)
    }
  }

  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return 'now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const formatNum = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-header-left">
          <span className="subreddit-link">r/{post.subreddit}</span>
          <span className="post-meta">· {timeAgo(post.created_utc)} · u/{post.author}</span>
        </div>
        <button className="hide-post-btn" onClick={() => onHide(post.id)} title="Hide this post">
          <Icons.eyeSlash />
        </button>
      </div>

      {/* 비디오 (자동재생, 음소거) */}
      {videoUrl && !imgError && (
        <RedditVideoPlayer 
          videoUrl={videoUrl} 
          audioUrl={audioUrl}
          hlsUrl={hlsUrl}
          onError={() => setImgError(true)}
        />
      )}

      {/* 이미지 (비디오가 없을 때만) */}
      {!videoUrl && imageUrl && !imgError && (
        <div className="post-image-container">
          <img
            src={imageUrl}
            alt=""
            className="post-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* 제목 (AI 변환) - 두 구조 모두 지원 */}
      <div className="sentences-container">
        {(post.transformed?.title?.sentences || post.transformed?.sentences)?.map((sentence, idx) => (
          <SentenceBlock
            key={idx}
            sentence={sentence}
            isKorean={showKorean}
            onSlangClick={onSlangClick}
            onWordClick={onWordClick}
          />
        ))}
      </div>
      
      {/* 본문 내용 (AI 변환) - 있을 때만 표시 */}
      {post.transformed?.selftext?.sentences && (
        <div className="selftext-section">
          <div className={`selftext-container ${expandSelftext ? 'expanded' : ''}`}>
            {post.transformed.selftext.sentences.map((sentence, idx) => (
              <SentenceBlock
                key={`selftext-${idx}`}
                sentence={sentence}
                isKorean={showKorean}
                onSlangClick={onSlangClick}
                onWordClick={onWordClick}
              />
            ))}
          </div>
          {post.selftext && post.selftext.length > 200 && !expandSelftext && (
            <button 
              className="selftext-toggle"
              onClick={() => setExpandSelftext(true)}
            >
              <Icons.chevronDown /> Read more
            </button>
          )}
          {expandSelftext && (
            <button 
              className="selftext-toggle"
              onClick={() => setExpandSelftext(false)}
            >
              <Icons.chevronUp /> Show less
            </button>
          )}
        </div>
      )}

      {/* 액션 버튼들 (한글 + 원문) */}
      <div className="post-actions">
        <button
          className={`action-btn ${showKorean ? 'active' : ''}`}
          onClick={() => setShowKorean(!showKorean)}
        >
          <Icons.translate />
          <span>{showKorean ? 'English' : '한글'}</span>
        </button>
        <button
          className={`action-btn ${showOriginal ? 'active' : ''}`}
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <Icons.fileText />
          <span>Original</span>
        </button>
      </div>
      
      {/* 원문 표시 */}
      {showOriginal && (
        <div className="original-section">
          <ClickableOriginalText text={post.title} onWordClick={onWordClick} />
          {post.selftext && (
            <div className="original-selftext">
              <ClickableOriginalText text={post.selftext} onWordClick={onWordClick} />
            </div>
          )}
        </div>
      )}

      {/* 푸터 */}
      <div className="post-footer">
        <span className="stat upvote">
          <Icons.arrowUp /> {formatNum(post.score)}
        </span>
        <span className="stat comments" onClick={loadComments}>
          <Icons.messageCircle /> {formatNum(post.num_comments)}
        </span>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-header">
            <span className="comments-title">Top Comments</span>
            <button className="comments-close" onClick={() => setShowComments(false)}>
              <Icons.x />
            </button>
          </div>

          {loadingComments ? (
            <div className="comments-loading">
              <div className="spinner" style={{ width: 24, height: 24 }}></div>
              <p>Loading comments...</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onSlangClick={onSlangClick}
                onWordClick={onWordClick}
              />
            ))
          )}
        </div>
      )}
    </article>
  )
}

// 문장 블록 (본문만, 번역 버튼은 외부로 이동)
function SentenceBlock({ sentence, isKorean, onSlangClick, onWordClick }) {
  const [selectedText, setSelectedText] = useState('')
  const containerRef = useRef(null)
  const scrollPosRef = useRef(0)

  // 스크롤 위치 저장
  const saveScrollPos = () => {
    scrollPosRef.current = window.scrollY
  }

  // 텍스트 선택 감지
  const handleTextSelect = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      const selected = selection?.toString().trim()
      if (selected && selected.length > 0 && selected.split(' ').length > 1) {
        setSelectedText(selected)
        // 스크롤 위치 복원
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosRef.current)
        })
      }
    }, 50)
  }

  const handlePhraseSearch = () => {
    if (selectedText) {
      onWordClick(selectedText, sentence.simplified || sentence.korean)
      setSelectedText('')
      window.getSelection()?.removeAllRanges()
    }
  }

  const renderClickableText = (text, slangNotes) => {
    if (!text) return null
    const parts = text.split(/(\([^)]+\)|\s+)/)

    return parts.map((part, i) => {
      if (!part || /^\s+$/.test(part)) {
        return <span key={i}>{part}</span>
      }

      if (part.match(/^\([^)]+\)$/)) {
        const term = part.slice(1, -1)
        const note = slangNotes?.find(n =>
          n.term.toLowerCase() === term.toLowerCase()
        )

        if (note) {
          return (
            <span
              key={i}
              className="slang-highlight"
              onClick={(e) => {
                e.stopPropagation()
                if (!window.getSelection()?.toString().trim()) {
                  onSlangClick(note)
                }
              }}
            >
              {part}
            </span>
          )
        }
      }

      const cleanWord = part.replace(/[.,!?;:'"]/g, '').trim()
      if (cleanWord.length > 0) {
        return (
          <span
            key={i}
            className="clickable-word"
            onClick={(e) => {
              e.stopPropagation()
              if (!window.getSelection()?.toString().trim()) {
                onWordClick(cleanWord, text)
              }
            }}
          >
            {part}
          </span>
        )
      }

      return <span key={i}>{part}</span>
    })
  }

  return (
    <div 
      ref={containerRef}
      className={`sentence-block ${isKorean ? 'korean' : ''}`}
    >
      <div 
        className="sentence-content"
        onMouseDown={saveScrollPos}
        onTouchStart={saveScrollPos}
        onMouseUp={handleTextSelect}
        onTouchEnd={handleTextSelect}
      >
        <span className="sentence-text">
          {isKorean
            ? sentence.korean
            : renderClickableText(sentence.simplified, sentence.slang_notes)}
        </span>
      </div>
      
      {/* 구문 선택 시 검색 버튼 - 아래에 표시 */}
      {selectedText && (
        <div className="phrase-search-bar">
          <span className="phrase-preview">"{selectedText.length > 25 ? selectedText.slice(0, 25) + '...' : selectedText}"</span>
          <button className="phrase-search-btn" onClick={handlePhraseSearch}>
            <Icons.book />
            <span>Look up</span>
          </button>
          <button className="phrase-cancel-btn" onClick={() => {
            setSelectedText('')
            window.getSelection()?.removeAllRanges()
          }}>
            <Icons.x />
          </button>
        </div>
      )}
    </div>
  )
}

// 클릭 가능한 원문 텍스트 (단어 클릭 + 드래그 선택)
function ClickableOriginalText({ text, onWordClick }) {
  const [selectedText, setSelectedText] = useState('')
  const containerRef = useRef(null)
  const scrollPosRef = useRef(0)

  // 선택 전 스크롤 위치 저장
  const saveScrollPos = () => {
    scrollPosRef.current = window.scrollY
  }

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const selected = selection?.toString().trim()
    if (selected && selected.length > 0 && selected.split(' ').length > 1) {
      setSelectedText(selected)
      // 스크롤 위치 복원
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosRef.current)
      })
    }
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      const selected = selection?.toString().trim()
      if (selected && selected.length > 0 && selected.split(' ').length > 1) {
        setSelectedText(selected)
        // 스크롤 위치 복원
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosRef.current)
        })
      }
    }, 50)
  }

  const handlePhraseSearch = () => {
    if (selectedText) {
      onWordClick(selectedText, text)
      setSelectedText('')
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleWordClick = (word) => {
    const cleanWord = word.replace(/[.,!?;:'"()\[\]]/g, '').trim()
    if (cleanWord.length > 0) {
      onWordClick(cleanWord, text)
    }
  }

  const words = text?.split(/(\s+)/) || []

  return (
    <div className="original-text-container">
      <div 
        ref={containerRef}
        className="original-text clickable"
        onMouseDown={saveScrollPos}
        onTouchStart={saveScrollPos}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
      >
        {words.map((word, i) => {
          if (/^\s+$/.test(word)) {
            return <span key={i}>{word}</span>
          }
          return (
            <span
              key={i}
              className="clickable-word"
              onClick={(e) => {
                e.stopPropagation()
                const selection = window.getSelection()
                if (!selection?.toString().trim()) {
                  handleWordClick(word)
                }
              }}
            >
              {word}
            </span>
          )
        })}
      </div>
      
      {/* 구문 선택 시 검색 버튼 표시 */}
      {selectedText && (
        <div className="phrase-search-bar">
          <span className="phrase-preview">"{selectedText.length > 30 ? selectedText.slice(0, 30) + '...' : selectedText}"</span>
          <button className="phrase-search-btn" onClick={handlePhraseSearch}>
            <Icons.book />
            <span>Look up</span>
          </button>
          <button className="phrase-cancel-btn" onClick={() => {
            setSelectedText('')
            window.getSelection()?.removeAllRanges()
          }}>
            <Icons.x />
          </button>
        </div>
      )}
      
      <div className="original-hint">
        💡 Tap a word or drag to select a phrase
      </div>
    </div>
  )
}

// 댓글 아이템 (스와이프 제거, 번역 버튼으로 대체)
function CommentItem({ comment, onSlangClick, onWordClick }) {
  const [showKorean, setShowKorean] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const scrollPosRef = useRef(0)

  const sentence = comment.transformed?.sentences?.[0]

  const saveScrollPos = () => {
    scrollPosRef.current = window.scrollY
  }

  const handleTextSelect = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      const selected = selection?.toString().trim()
      if (selected && selected.length > 0 && selected.split(' ').length > 1) {
        setSelectedText(selected)
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosRef.current)
        })
      }
    }, 50)
  }

  const handlePhraseSearch = () => {
    if (selectedText) {
      onWordClick(selectedText, sentence?.simplified || comment.body)
      setSelectedText('')
      window.getSelection()?.removeAllRanges()
    }
  }

  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const renderClickableText = (text, slangNotes) => {
    if (!text) return null
    const parts = text.split(/(\([^)]+\)|\s+)/)

    return parts.map((part, i) => {
      if (!part || /^\s+$/.test(part)) return <span key={i}>{part}</span>

      if (part.match(/^\([^)]+\)$/)) {
        const term = part.slice(1, -1)
        const note = slangNotes?.find(n => n.term.toLowerCase() === term.toLowerCase())
        if (note) {
          return (
            <span key={i} className="slang-highlight" onClick={(e) => {
              e.stopPropagation()
              if (!window.getSelection()?.toString().trim()) {
                onSlangClick(note)
              }
            }}>{part}</span>
          )
        }
      }

      const cleanWord = part.replace(/[.,!?;:'"]/g, '').trim()
      if (cleanWord.length > 0) {
        return (
          <span key={i} className="clickable-word" onClick={(e) => {
            e.stopPropagation()
            if (!window.getSelection()?.toString().trim()) {
              onWordClick(cleanWord, text)
            }
          }}>{part}</span>
        )
      }

      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className={`comment-item depth-${comment.depth || 0}`}>
      <div className="comment-header">
        <span className="comment-author">u/{comment.author}</span>
        <span>· {timeAgo(comment.created_utc)}</span>
        <span>· <Icons.arrowUp /> {comment.score}</span>
      </div>
      <div 
        className="comment-body"
        onMouseDown={saveScrollPos}
        onTouchStart={saveScrollPos}
        onMouseUp={handleTextSelect}
        onTouchEnd={handleTextSelect}
      >
        <span className="comment-text">
          {showKorean
            ? sentence?.korean
            : renderClickableText(sentence?.simplified, sentence?.slang_notes)}
        </span>
      </div>
      
      {/* 구문 선택 시 검색 버튼 - 아래에 표시 */}
      {selectedText && (
        <div className="phrase-search-bar">
          <span className="phrase-preview">"{selectedText.length > 20 ? selectedText.slice(0, 20) + '...' : selectedText}"</span>
          <button className="phrase-search-btn" onClick={handlePhraseSearch}>
            <Icons.book />
            <span>Look up</span>
          </button>
          <button className="phrase-cancel-btn" onClick={() => {
            setSelectedText('')
            window.getSelection()?.removeAllRanges()
          }}>
            <Icons.x />
          </button>
        </div>
      )}
      
      {/* 액션 버튼들 - 한글 + 원문 */}
      <div className="comment-actions">
        <button 
          className={`action-btn small ${showKorean ? 'active' : ''}`}
          onClick={() => setShowKorean(!showKorean)}
        >
          <Icons.translate />
          <span>{showKorean ? 'EN' : '한글'}</span>
        </button>
        <button 
          className={`action-btn small ${showOriginal ? 'active' : ''}`}
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <Icons.fileText />
          <span>Original</span>
        </button>
      </div>
      
      {showOriginal && (
        <ClickableOriginalText 
          text={sentence?.original || comment.body} 
          onWordClick={onWordClick}
          isComment={true}
        />
      )}
    </div>
  )
}

function SlangPopup({ slang, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={e => e.stopPropagation()}>
        <div className="popup-handle"></div>
        
        <div className="popup-term">
          <Icons.hash />
          <span>{slang.term}</span>
        </div>
        <div className="popup-meaning">{slang.meaning}</div>
        
        <div className="popup-korean-box">
          <div className="popup-korean-label">Korean</div>
          <div>{slang.korean}</div>
        </div>
        
        {slang.example && (
          <div className="popup-example">
            <div className="popup-example-label">Example</div>
            <div className="popup-example-text">"{slang.example}"</div>
          </div>
        )}
        
        <button className="popup-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function WordPopup({ data, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showYouglish, setShowYouglish] = useState(false)
  const [youglishError, setYouglishError] = useState(false)

  // 브라우저 TTS로 발음 재생
  const playPronunciation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(data.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Youglish URL
  const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(data.word)}/english`

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup word-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-handle"></div>
        
        {data.loading ? (
          <div className="word-loading">
            <div className="spinner" style={{ width: 30, height: 30 }}></div>
            <p>Looking up "{data.word}"...</p>
          </div>
        ) : (
          <>
            <div className="popup-term">
              <Icons.book />
              <span>{data.word}</span>
            </div>
            
            {/* 발음 섹션 */}
            <div className="word-pronunciation-section">
              {data.pronunciation && (
                <span className="word-pronunciation">{data.pronunciation}</span>
              )}
              <button 
                className={`pronunciation-btn ${isPlaying ? 'playing' : ''}`}
                onClick={playPronunciation}
                title="Listen to pronunciation"
              >
                <Icons.volume />
                <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
              </button>
              <button 
                className="youglish-btn"
                onClick={() => setShowYouglish(!showYouglish)}
                title="Watch native speakers"
              >
                <Icons.play />
                <span>Youglish</span>
              </button>
            </div>
            
            {/* Youglish 팝업 영역 */}
            {showYouglish && (
              <div className="youglish-container">
                {!youglishError ? (
                  <iframe
                    src={youglishUrl}
                    title="Youglish"
                    className="youglish-iframe"
                    onError={() => setYouglishError(true)}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                ) : null}
                <div className="youglish-fallback">
                  <a 
                    href={youglishUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youglish-external-link"
                  >
                    <Icons.externalLink />
                    <span>Open in Youglish</span>
                  </a>
                </div>
              </div>
            )}
            
            <div className="popup-meaning">{data.meaning}</div>
            
            <div className="popup-korean-box">
              <div className="popup-korean-label">Korean</div>
              <div>{data.korean}</div>
            </div>
            
            {data.examples && data.examples.length > 0 && (
              <div className="word-examples">
                <div className="popup-example-label">Examples</div>
                {data.examples.map((ex, i) => (
                  <div key={i} className="popup-example-text">• {ex}</div>
                ))}
              </div>
            )}
            
            {data.tips && (
              <div className="word-tips">
                <div className="popup-example-label">
                  <Icons.lightbulb /> Tip
                </div>
                <div>{data.tips}</div>
              </div>
            )}
          </>
        )}
        
        <button className="popup-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default App
