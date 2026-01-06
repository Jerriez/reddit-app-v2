import { useState, useEffect } from 'react'

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [popup, setPopup] = useState(null)

  // 레딧 데이터 로딩
  const loadPosts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 우리 서버 API를 통해 레딧 데이터 가져오기
      const res = await fetch('/api/reddit')
      
      if (!res.ok) {
        throw new Error(`서버 에러: ${res.status}`)
      }
      
      const json = await res.json()
      
      // Claude API로 변환
      const transformed = await Promise.all(
        json.posts.map(async (post) => {
          const postData = post.data
          
          try {
            const transformRes = await fetch('/api/transform', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: postData.title,
                subreddit: postData.subreddit
              })
            })
            
            if (transformRes.ok) {
              const data = await transformRes.json()
              return { ...postData, transformed: data }
            }
          } catch (e) {
            console.log('변환 실패:', e)
          }
          
          // 변환 실패시 원문 그대로
          return {
            ...postData,
            transformed: {
              sentences: [{
                original: postData.title,
                simplified: postData.title,
                korean: '(탭하여 번역)',
                slang_notes: []
              }]
            }
          }
        })
      )
      
      setPosts(transformed)
    } catch (e) {
      console.error('에러:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div>
      {/* 헤더 */}
      <header className="header">
        <h1>🔥 Reddit English</h1>
        <span>r/popular</span>
      </header>

      {/* 메인 */}
      <main className="container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p style={{marginTop: '16px'}}>로딩 중...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={loadPosts}>다시 시도</button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onSlangClick={setPopup}
            />
          ))
        )}
      </main>

      {/* 팝업 */}
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(null)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <div className="popup-handle"></div>
            <h3>🔤 {popup.term}</h3>
            <p className="popup-meaning">{popup.meaning}</p>
            <div className="popup-korean">🇰🇷 {popup.korean}</div>
            {popup.example && (
              <p className="popup-example">
                <strong>Example:</strong> "{popup.example}"
              </p>
            )}
            <button onClick={() => setPopup(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}

// 포스트 카드 컴포넌트
function PostCard({ post, onSlangClick }) {
  const [showKorean, setShowKorean] = useState({})
  const [showOriginal, setShowOriginal] = useState(false)

  const toggleLanguage = (idx) => {
    setShowKorean(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const timeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간`
    return `${Math.floor(seconds / 86400)}일`
  }

  const formatScore = (score) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
    return score
  }

  // 슬랭 하이라이트 렌더링
  const renderText = (text, slangNotes) => {
    if (!slangNotes?.length) return text
    
    // (슬랭) 패턴 찾기
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
              className="slang"
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
    <div className="card">
      {/* 헤더 */}
      <div className="card-header">
        <span className="subreddit">r/{post.subreddit}</span>
        {' · '}
        <span>{timeAgo(post.created_utc)}</span>
      </div>

      {/* 문장들 */}
      <div className="sentence-area">
        {post.transformed?.sentences?.map((sentence, idx) => (
          <div key={idx} className="sentence">
            <div 
              className={`sentence-content ${showKorean[idx] ? 'korean' : ''}`}
              onClick={() => toggleLanguage(idx)}
            >
              <span>
                {showKorean[idx] 
                  ? sentence.korean 
                  : renderText(sentence.simplified, sentence.slang_notes)
                }
              </span>
              <span className="sentence-hint">
                {showKorean[idx] ? '← EN' : '→ 한'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 원문 토글 */}
      <div className="original-toggle">
        <button onClick={() => setShowOriginal(!showOriginal)}>
          {showOriginal ? '📖 원문 숨기기' : '📄 원문 보기'}
        </button>
        {showOriginal && (
          <div className="original-text">{post.title}</div>
        )}
      </div>

      {/* 푸터 */}
      <div className="card-footer">
        <span>⬆ {formatScore(post.score)}</span>
        <span>💬 {post.num_comments}</span>
      </div>
    </div>
  )
}

export default App
