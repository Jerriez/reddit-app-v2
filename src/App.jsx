import { useState, useEffect, useCallback } from 'react'

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [after, setAfter] = useState(null)
  const [popup, setPopup] = useState(null)

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
          // 캐시 확인
          const cacheKey = `post_${post.id}`
          const cached = sessionStorage.getItem(cacheKey)
          
          if (cached) {
            try {
              const cachedData = JSON.parse(cached)
              return { ...post, transformed: cachedData }
            } catch {}
          }

          // 변환 요청
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
              // 캐시 저장
              sessionStorage.setItem(cacheKey, JSON.stringify(transformed))
              return { ...post, transformed }
            }
          } catch (e) {
            console.error('Transform error:', e)
          }

          // 변환 실패시 원문
          return {
            ...post,
            transformed: {
              sentences: [{
                original: post.title,
                simplified: post.title,
                korean: '(탭하여 번역 재시도)',
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
function PostCard({ post, onSlangClick }) {
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

      // 댓글 변환
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

  // 언어 토글
  const toggleLanguage = (idx) => {
    setShowKorean(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // 시간 포맷
  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 60) return '방금'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  // 숫자 포맷
  const formatNum = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  // 텍스트 렌더링 (슬랭 하이라이트)
  const renderText = (text, slangNotes) => {
    if (!text) return ''
    if (!slangNotes?.length) return text

    const parts = text.split(/(\([^)]+\))/)

    return parts.map((part, i) => {
      if (part.match(/^\([^)]+\)$/)) {
        const term = part.slice(1, -1)
        const note = slangNotes.find(n =>
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
      return part
    })
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
          <div
            key={idx}
            className={`sentence-block ${showKorean[idx] ? 'korean' : ''}`}
          >
            <div
              className="sentence-content"
              onClick={() => toggleLanguage(idx)}
            >
              <span className="sentence-text">
                {showKorean[idx]
                  ? sentence.korean
                  : renderText(sentence.simplified, sentence.slang_notes)}
              </span>
              <span className="sentence-hint">
                {showKorean[idx] ? '← EN' : '→ 한'}
              </span>
            </div>
          </div>
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
                renderText={renderText}
              />
            ))
          )}
        </div>
      )}
    </article>
  )
}

// 댓글 아이템 컴포넌트
function CommentItem({ comment, onSlangClick, renderText }) {
  const [showKorean, setShowKorean] = useState(false)

  const sentence = comment.transformed?.sentences?.[0]

  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }

  return (
    <div className={`comment-item depth-${comment.depth || 0}`}>
      <div className="comment-header">
        <span className="comment-author">u/{comment.author}</span>
        <span>· {timeAgo(comment.created_utc)}</span>
        <span>· ⬆ {comment.score}</span>
      </div>
      <div
        className="comment-body"
        onClick={() => setShowKorean(!showKorean)}
        style={{ cursor: 'pointer' }}
      >
        {showKorean
          ? sentence?.korean
          : renderText(sentence?.simplified, sentence?.slang_notes)}
      </div>
      {showKorean && sentence?.korean && (
        <div className="comment-korean">
          🇰🇷 {sentence.korean}
        </div>
      )}
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

export default App
