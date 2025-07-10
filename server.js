import express from 'express'
import path from 'path'
import cors from 'cors'
import axios from 'axios'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))

const getStatusLabel = (status, type = 'default') => {
  const statusMap = {
    1: type === 'manga' ? 'Reading' : 'Watching',
    2: 'Completed',
    3: 'On Hold',
    4: 'Dropped',
    6: type === 'manga' ? 'Plan to Read' : 'Plan to Watch',
  }
  return statusMap[status] || 'Unknown'
}

const getStatusAbv = (status, type = 'default') => {
  const abvMap = {
    1: type === 'manga' ? 'REA' : 'WAT',
    2: 'COM',
    3: 'HLD',
    4: 'DRP',
    6: type === 'manga' ? 'PTR' : 'PTW',
  }
  return abvMap[status] || 'UNK'
}

const getStatusColor = (status) => {
  const colorMap = {
    1: "#22c55e", // Green
    2: "#3b82f6", // Blue
    3: "#eab308", // Yellow
    4: "#ef4444", // Red
    6: "#6b7280", // Gray
  }
  return colorMap[status] || "#6b7280"
}

const processImageUrl = (url) => {
  if (!url) return null
  let cleanUrl = url.split('?')[0]
  cleanUrl = cleanUrl.replace(/\/r\/\d+x\d+\//, "/")
  cleanUrl = cleanUrl.replace(/\.jpg$/, "l.jpg")
  return cleanUrl
}

app.get('/api/animelist', async (req, res) => {
  try {
    const response = await axios.get(
      'https://myanimelist.net/animelist/EsieEyen/load.json?offset=0&order=5&status=7'
    )

    const limitedData = response.data.slice(0, 10).map(anime => ({
      id: anime.anime_id,
      title: anime.anime_title,
      englishTitle: anime.anime_title_eng || "",
      episodesWatched: anime.num_watched_episodes,
      totalEpisodes: anime.anime_num_episodes,
      score: anime.score,
      url: `https://myanimelist.net${anime.anime_url}`, // <- fixed here
      status: {
        code: anime.status,
        label: getStatusLabel(anime.status),
        abv: getStatusAbv(anime.status),
        color: getStatusColor(anime.status),
      },
      image: processImageUrl(anime.anime_image_path) || "/placeholder.svg",
    }))

    res.json(limitedData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch data from MAL (Anime)' })
  }
})

app.get('/api/mangalist', async (req, res) => {
  try {
    const response = await axios.get(
      'https://myanimelist.net/mangalist/EsieEyen/load.json?offset=0&order=5&status=7'
    )

    const filtered = response.data.filter(
      manga =>
        manga.manga_media_type_string === 'Manga' ||
        manga.manga_media_type_string === 'Manhwa' ||
        manga.manga_media_type_string === 'Manhua'
    )

    const limitedData = filtered.slice(0, 10).map(manga => ({
      id: manga.manga_id,
      title: manga.manga_title,
      englishTitle: manga.manga_english || "",
      chaptersRead: manga.num_read_chapters,
      totalChapters: manga.manga_num_chapters,
      score: manga.score,
      genres: manga.genres?.map(g => g.name) || [],
      mediaType: manga.manga_media_type_string,
      url: `https://myanimelist.net${manga.manga_url}`,
      status: {
        code: manga.status,
        label: getStatusLabel(manga.status, 'manga'),
        abv: getStatusAbv(manga.status, 'manga'),
        color: getStatusColor(manga.status),
      },
      image: processImageUrl(manga.manga_image_path) || "/placeholder.svg",
    }))

    res.json(limitedData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch data from MAL (Manga)' })
  }
})

app.get('/api/novellist', async (req, res) => {
  try {
    const response = await axios.get(
      'https://myanimelist.net/mangalist/EsieEyen/load.json?offset=0&order=5&status=7'
    )

    const filtered = response.data.filter(
      manga =>
        manga.manga_media_type_string === 'Light Novel' ||
        manga.manga_media_type_string === 'Novel'
    )

    const limitedData = filtered.slice(0, 10).map(novel => ({
      id: novel.manga_id,
      title: novel.manga_title,
      englishTitle: novel.manga_english || "",
      chaptersRead: novel.num_read_chapters,
      totalChapters: novel.manga_num_chapters,
      score: novel.score,
      genres: novel.genres?.map(g => g.name) || [],
      mediaType: novel.manga_media_type_string,
      url: `https://myanimelist.net${novel.manga_url}`,
      status: {
        code: novel.status,
        label: getStatusLabel(novel.status, 'manga'),
        abv: getStatusAbv(novel.status, 'manga'),
        color: getStatusColor(novel.status),
      },
      image: processImageUrl(novel.manga_image_path) || "/placeholder.svg",
    }))

    res.json(limitedData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch data from MAL (Novel)' })
  }
})

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})