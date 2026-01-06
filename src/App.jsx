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
          const cacheKey = `post_${post.id}`
          const cached = sessionStorage.getItem(cacheKey)
          
          if (cached) {
            try {
              const cachedData = JSON.parse(cached)
              return { ...post, transformed: cachedData }
            } catch {}
          }

          try {
            const transformRes = await fetch('/api/transform', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: post.title,
                subreddit: post.subreddit
              })
            })

            if (transformRes.ok) {
              const transformed = await transformRes.json()
              sessionStorage.setItem(cacheKey, JSON.stringify(transformed))
              return { ...post, transformed }
            }
          } catch (e) {
            console.error('Transform error:', e)
          }

          return {
            ...post,
            transformed: {
              sentences: [{
                original: post.title,
                simplified: post.title,
                korean: '(Swipe to translate)',
                slang_notes: []
              }]
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
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading Reddit posts...</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onSlangClick={setPopup}
                onWordClick={lookupWord}
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

// Reddit 비디오 플레이어 (video + audio 동기화)
function RedditVideoPlayer({ videoUrl, audioUrl, onError }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const [hasAudio, setHasAudio] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video || !audio) return

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

    video.addEventListener('play', syncPlay)
    video.addEventListener('pause', syncPause)
    video.addEventListener('seeked', syncTime)
    video.addEventListener('volumechange', syncVolume)

    return () => {
      video.removeEventListener('play', syncPlay)
      video.removeEventListener('pause', syncPause)
      video.removeEventListener('seeked', syncTime)
      video.removeEventListener('volumechange', syncVolume)
    }
  }, [])

  return (
    <div className="post-video-container">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        className="post-video"
        onError={onError}
      />
      {audioUrl && hasAudio && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onError={() => setHasAudio(false)}
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

function PostCard({ post, onSlangClick, onWordClick }) {
  const [showKorean, setShowKorean] = useState({})
  const [showOriginal, setShowOriginal] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [imgError, setImgError] = useState(false)

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

  // 오디오 URL 추출 (Reddit은 video/audio 분리 저장)
  const getAudioUrl = () => {
    if (post.is_video && post.media?.reddit_video?.fallback_url) {
      // fallback_url에서 오디오 URL 생성
      const videoUrl = post.media.reddit_video.fallback_url
      const baseUrl = videoUrl.replace(/DASH_\d+\.mp4.*/, '')
      return `${baseUrl}DASH_AUDIO_128.mp4`
    }
    if (post.url?.includes('v.redd.it')) {
      return `${post.url}/DASH_AUDIO_128.mp4`
    }
    return null
  }

  const imageUrl = getImageUrl()
  const videoUrl = getVideoUrl()
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
        <span className="subreddit-link">r/{post.subreddit}</span>
        <span className="post-meta">· {timeAgo(post.created_utc)} · u/{post.author}</span>
      </div>

      {/* 비디오 (오디오 동기화 포함) */}
      {videoUrl && !imgError && (
        <RedditVideoPlayer 
          videoUrl={videoUrl} 
          audioUrl={audioUrl}
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

      {/* 문장들 */}
      <div className="sentences-container">
        {post.transformed?.sentences?.map((sentence, idx) => (
          <SentenceBlock
            key={idx}
            sentence={sentence}
            isKorean={showKorean[idx]}
            onToggleLanguage={() => setShowKorean(prev => ({ ...prev, [idx]: !prev[idx] }))}
            onSlangClick={onSlangClick}
            onWordClick={onWordClick}
          />
        ))}
      </div>

      {/* 원문 토글 - 가운데 정렬 */}
      <div className="original-section">
        <button
          className="original-toggle"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          {showOriginal ? <Icons.eyeOff /> : <Icons.fileText />}
          <span>{showOriginal ? 'Hide Original' : 'Original'}</span>
        </button>
        {showOriginal && (
          <ClickableOriginalText text={post.title} onWordClick={onWordClick} />
        )}
      </div>

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

// 스와이프 가능한 문장 블록
function SentenceBlock({ sentence, isKorean, onToggleLanguage, onSlangClick, onWordClick }) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const containerRef = useRef(null)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    // 드래그 거리 제한 (-100 ~ 100)
    setDragX(Math.max(-100, Math.min(100, diff)))
  }

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 50) {
      onToggleLanguage()
    }
    setDragX(0)
    setIsDragging(false)
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
                onSlangClick(note)
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
              onWordClick(cleanWord, text)
            }}
          >
            {part}
          </span>
        )
      }

      return <span key={i}>{part}</span>
    })
  }

  // 스와이프 방향에 따른 스타일 (배경색 + 이동)
  const getSwipeStyle = () => {
    const baseStyle = {
      transform: `translateX(${dragX * 0.3}px)`,
      transition: isDragging ? 'none' : 'transform 0.2s, background 0.2s'
    }
    
    if (dragX > 20) {
      return { ...baseStyle, background: 'rgba(139, 92, 246, 0.15)' } // 한글로
    }
    if (dragX < -20) {
      return { ...baseStyle, background: 'rgba(59, 130, 246, 0.15)' } // 영어로
    }
    return baseStyle
  }

  return (
    <div 
      ref={containerRef}
      className={`sentence-block ${isKorean ? 'korean' : ''}`}
      style={getSwipeStyle()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="sentence-content">
        <span className="sentence-text">
          {isKorean
            ? sentence.korean
            : renderClickableText(sentence.simplified, sentence.slang_notes)}
        </span>
      </div>
    </div>
  )
}

// 클릭 가능한 원문 텍스트 (단어 클릭 + 드래그 선택)
function ClickableOriginalText({ text, onWordClick }) {
  const [selectedText, setSelectedText] = useState('')
  const containerRef = useRef(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const selected = selection?.toString().trim()
    if (selected && selected.length > 0 && selected.split(' ').length > 1) {
      // 여러 단어 선택시 구문 검색
      setSelectedText(selected)
    }
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      const selection = window.getSelection()
      const selected = selection?.toString().trim()
      if (selected && selected.length > 0 && selected.split(' ').length > 1) {
        setSelectedText(selected)
      }
    }, 100)
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
                // 선택된 텍스트가 없을 때만 단어 클릭
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

// 댓글 아이템 (원문 보기 추가)
function CommentItem({ comment, onSlangClick, onWordClick }) {
  const [showKorean, setShowKorean] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)

  const sentence = comment.transformed?.sentences?.[0]

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - touchStartX.current
    setDragX(Math.max(-100, Math.min(100, diff)))
  }

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 50) {
      setShowKorean(!showKorean)
    }
    setDragX(0)
    setIsDragging(false)
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
              onSlangClick(note)
            }}>{part}</span>
          )
        }
      }

      const cleanWord = part.replace(/[.,!?;:'"]/g, '').trim()
      if (cleanWord.length > 0) {
        return (
          <span key={i} className="clickable-word" onClick={(e) => {
            e.stopPropagation()
            onWordClick(cleanWord, text)
          }}>{part}</span>
        )
      }

      return <span key={i}>{part}</span>
    })
  }

  const getSwipeStyle = () => {
    if (dragX > 20) return { background: 'rgba(139, 92, 246, 0.1)' }
    if (dragX < -20) return { background: 'rgba(59, 130, 246, 0.1)' }
    return {}
  }

  return (
    <div 
      className={`comment-item depth-${comment.depth || 0}`}
      style={getSwipeStyle()}
    >
      <div className="comment-header">
        <span className="comment-author">u/{comment.author}</span>
        <span>· {timeAgo(comment.created_utc)}</span>
        <span>· <Icons.arrowUp /> {comment.score}</span>
      </div>
      <div 
        className="comment-body"
        style={{ transform: `translateX(${dragX * 0.3}px)`, transition: isDragging ? 'none' : 'transform 0.2s' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {showKorean
          ? sentence?.korean
          : renderClickableText(sentence?.simplified, sentence?.slang_notes)}
      </div>
      
      {/* 댓글 원문 보기 */}
      <button 
        className="comment-original-toggle"
        onClick={() => setShowOriginal(!showOriginal)}
      >
        {showOriginal ? <Icons.eyeOff /> : <Icons.fileText />}
        <span>{showOriginal ? 'Hide' : 'Original'}</span>
      </button>
      
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
            
            {data.pronunciation && (
              <div className="word-pronunciation">{data.pronunciation}</div>
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
