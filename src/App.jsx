import { useState, useEffect, useCallback, useRef } from 'react'

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [after, setAfter] = useState(null)
  const [popup, setPopup] = useState(null) // 슬랭 팝업
  const [wordPopup, setWordPopup] = useState(null) // 단어 검색 팝업

  // 포스트 로딩
  const loadPosts = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      const url = loadMore && after ? `/api/reddit?after=${after}` : '/api/reddit'
      const res = await fetch(url)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `서버 에러: ${res.status}`)
      }

      const data = await res.json()
      
      if (!data.isLive) {
        throw new Error('Reddit API 연결 실패')
      }

      // Claude로 변환
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
                korean: '(스와이프하여 번역)',
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
  }, [after])

  useEffect(() => {
    loadPosts()
  }, [])

  // 단어 검색 함수
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
        throw new Error('검색 실패')
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

  // 에러 상태
  if (error && posts.length === 0) {
    return (
      <div>
        <Header />
        <main className="container">
          <div className="error-container">
            <div className="error-icon">😢</div>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => loadPosts()}>
              다시 시도
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
            <p className="loading-text">레딧 인기글 불러오는 중...</p>
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
                  {loadingMore ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 슬랭 팝업 */}
      {popup && (
        <SlangPopup slang={popup} onClose={() => setPopup(null)} />
      )}

      {/* 단어 검색 팝업 */}
      {wordPopup && (
        <WordPopup data={wordPopup} onClose={() => setWordPopup(null)} />
      )}
    </div>
  )
}

// 헤더 컴포넌트
function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">🔥</span>
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

// 포스트 카드 컴포넌트
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

  const imageUrl = getImageUrl()

  // 댓글 로딩
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

  // 시간 포맷
  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return '방금'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  const formatNum = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  return (
    <article className="post-card">
      {/* 헤더 */}
      <div className="post-header">
        <span className="subreddit-link">r/{post.subreddit}</span>
        <span className="post-meta">· {timeAgo(post.created_utc)} · u/{post.author}</span>
      </div>

      {/* 이미지 */}
      {imageUrl && !imgError && (
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

      {/* 원문 토글 */}
      <div className="original-section">
        <button
          className="original-toggle"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          {showOriginal ? '📖 원문 숨기기' : '📄 원문 보기'}
        </button>
        {showOriginal && (
          <div className="original-text">{post.title}</div>
        )}
      </div>

      {/* 푸터 */}
      <div className="post-footer">
        <span className="stat upvote">⬆ {formatNum(post.score)}</span>
        <span className="stat comments" onClick={loadComments}>
          💬 {formatNum(post.num_comments)} 댓글
        </span>
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-header">
            <span className="comments-title">💬 인기 댓글</span>
            <button className="comments-close" onClick={() => setShowComments(false)}>
              ✕
            </button>
          </div>

          {loadingComments ? (
            <div className="comments-loading">
              <div className="spinner" style={{ width: 24, height: 24 }}></div>
              <p>댓글 변환 중...</p>
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

// 문장 블록 컴포넌트 (스와이프 + 단어 탭)
function SentenceBlock({ sentence, isKorean, onToggleLanguage, onSlangClick, onWordClick }) {
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchEndX.current - touchStartX.current
    
    // 50px 이상 스와이프하면 언어 전환
    if (Math.abs(diff) > 50) {
      onToggleLanguage()
    }
  }

  // 텍스트를 단어별로 분리하고 클릭 가능하게 렌더링
  const renderClickableText = (text, slangNotes) => {
    if (!text) return null

    // 괄호로 묶인 슬랭과 일반 텍스트 분리
    const parts = text.split(/(\([^)]+\)|\s+)/)

    return parts.map((part, i) => {
      // 공백은 그냥 반환
      if (!part || /^\s+$/.test(part)) {
        return <span key={i}>{part}</span>
      }

      // 괄호로 묶인 슬랭 체크
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

      // 일반 단어 - 클릭하면 검색
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

  return (
    <div className={`sentence-block ${isKorean ? 'korean' : ''}`}>
      <div
        className="sentence-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="sentence-text">
          {isKorean
            ? sentence.korean
            : renderClickableText(sentence.simplified, sentence.slang_notes)}
        </span>
        <span className="sentence-hint swipe-hint">
          {isKorean ? '👈 스와이프' : '스와이프 👉'}
        </span>
      </div>
    </div>
  )
}

// 댓글 아이템 컴포넌트
function CommentItem({ comment, onSlangClick, onWordClick }) {
  const [showKorean, setShowKorean] = useState(false)
  const touchStartX = useRef(0)

  const sentence = comment.transformed?.sentences?.[0]

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      setShowKorean(!showKorean)
    }
  }

  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  // 단어 클릭 가능하게
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

  return (
    <div 
      className={`comment-item depth-${comment.depth || 0}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="comment-header">
        <span className="comment-author">u/{comment.author}</span>
        <span>· {timeAgo(comment.created_utc)}</span>
        <span>· ⬆ {comment.score}</span>
      </div>
      <div className="comment-body">
        {showKorean
          ? sentence?.korean
          : renderClickableText(sentence?.simplified, sentence?.slang_notes)}
      </div>
    </div>
  )
}

// 슬랭 팝업 컴포넌트
function SlangPopup({ slang, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={e => e.stopPropagation()}>
        <div className="popup-handle"></div>
        
        <div className="popup-term">🔤 {slang.term}</div>
        <div className="popup-meaning">{slang.meaning}</div>
        
        <div className="popup-korean-box">
          <div className="popup-korean-label">한국어</div>
          <div>{slang.korean}</div>
        </div>
        
        {slang.example && (
          <div className="popup-example">
            <div className="popup-example-label">Example</div>
            <div className="popup-example-text">"{slang.example}"</div>
          </div>
        )}
        
        <button className="popup-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}

// 단어 검색 팝업 컴포넌트
function WordPopup({ data, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup word-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-handle"></div>
        
        {data.loading ? (
          <div className="word-loading">
            <div className="spinner" style={{ width: 30, height: 30 }}></div>
            <p>"{data.word}" 검색 중...</p>
          </div>
        ) : (
          <>
            <div className="popup-term">📖 {data.word}</div>
            
            {data.pronunciation && (
              <div className="word-pronunciation">{data.pronunciation}</div>
            )}
            
            <div className="popup-meaning">{data.meaning}</div>
            
            <div className="popup-korean-box">
              <div className="popup-korean-label">한국어</div>
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
                <div className="popup-example-label">💡 Tip</div>
                <div>{data.tips}</div>
              </div>
            )}
          </>
        )}
        
        <button className="popup-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}

export default App
