"use client"

import { useState, useEffect } from "react"
import "./MediaList.css"

const MediaList = () => {
  const [animeList, setAnimeList] = useState([])
  const [mangaList, setMangaList] = useState([])
  const [novelList, setNovelList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [animeRes, mangaRes, novelRes] = await Promise.all([
          fetch("/api/animelist"),
          fetch("/api/mangalist"),
          fetch("/api/novellist"),
        ])
        const [anime, manga, novel] = await Promise.all([
          animeRes.json(),
          mangaRes.json(),
          novelRes.json(),
        ])
        setAnimeList(anime)
        setMangaList(manga)
        setNovelList(novel)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Failed to load media lists.")
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const renderSection = (title, list, isMangaOrNovel = false) => (
    <div className="section-container">
      <div className="main-content">
        <div className="anime-text-container">
          <div className="anime-text">
            {title.split("").map((char, i) => (
              <span key={i} className="anime-text-span">{char}</span>
            ))}
          </div>
        </div>

        <div className="grid-container">
          <div className="anime-grid">
            {list.map((item) => {
              const isHovered = hoveredId === item.id

              const episodesText = isMangaOrNovel
                ? `${item.chaptersRead}/${item.totalChapters}`
                : `${item.episodesWatched}/${item.totalEpisodes}`

              return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid-item"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="poster-image"
                />

                <div className="episode-overlay">
                  <span className="episode-text">{episodesText}</span>
                </div>

                <div className="abv-overlay" style={{ backgroundColor: item.status.color }}>
                  <span>{item.status.abv}</span>
                </div>

                {item.score > 0 && (
                  <div className="rating-overlay">
                    <span className="rating-text">★ {item.score}</span>
                  </div>
                )}

                {isHovered && (
                  <div
                    className="title-overlay"
                    style={{ backgroundColor: item.status.color }}
                  >
                    <span className="vertical-title">{item.title}</span>
                  </div>
                )}
              </a>
            )

            })}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading media collection...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="error-text">{error}</div>
      </div>
    )
  }

  return (
    <div className="anime-list-container">
      <div className="header">
        <div className="header-content">
          <div className="header-gif">
            <img src="/header.gif" alt="Header GIF" className="gif-image" />
          </div>
          <div className="header-title">
            <h1 className="main-title">07gallery</h1>
          </div>
          <div className="header-divider">|</div>
          <div className="header-subtitle">
            <p className="subtitle">My latest updates on different media.</p>
          </div>
        </div>
      </div>

      {renderSection("ANIME", animeList)}
      {renderSection("MANGA", mangaList, true)}
      {renderSection("NOVEL", novelList, true)}
    </div>
  )
}

export default MediaList

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload()
  })
}
