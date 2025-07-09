// 波爾多 AOC 測試資料
const bordeauxAOCData = [
  // Left Bank - Médoc
  {
    id: "margaux",
    name: "Margaux",
    nameEn: "Margaux",
    nameZh: "瑪歌",
    slug: "margaux",
    region: "Left Bank",
    subRegion: "Médoc",
    description: "Famous for elegant and refined red wines, predominantly Cabernet Sauvignon based.",
    area: 1500,
    established: 1855,
    wineTypes: ["Red"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Petit Verdot"],
    isActive: true
  },
  {
    id: "pauillac",
    name: "Pauillac",
    nameEn: "Pauillac",
    nameZh: "波亞克",
    slug: "pauillac",
    region: "Left Bank",
    subRegion: "Médoc",
    description: "Home to three First Growth estates, producing powerful Cabernet Sauvignon wines.",
    area: 1200,
    established: 1855,
    wineTypes: ["Red"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"],
    isActive: true
  },
  {
    id: "saint-julien",
    name: "Saint-Julien",
    nameEn: "Saint-Julien",
    nameZh: "聖朱利安",
    slug: "saint-julien",
    region: "Left Bank",
    subRegion: "Médoc",
    description: "Consistently produces balanced and harmonious red wines.",
    area: 910,
    established: 1855,
    wineTypes: ["Red"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"],
    isActive: true
  },
  {
    id: "saint-estephe",
    name: "Saint-Estèphe",
    nameEn: "Saint-Estèphe",
    nameZh: "聖愛斯台夫",
    slug: "saint-estephe",
    region: "Left Bank",
    subRegion: "Médoc",
    description: "Known for structured and long-lived wines with good aging potential.",
    area: 1254,
    established: 1855,
    wineTypes: ["Red"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"],
    isActive: true
  },
  {
    id: "haut-medoc",
    name: "Haut-Médoc",
    nameEn: "Haut-Médoc",
    nameZh: "上梅多克",
    slug: "haut-medoc",
    region: "Left Bank",
    subRegion: "Médoc",
    description: "Broader appellation encompassing several prestigious communes.",
    area: 4600,
    established: 1936,
    wineTypes: ["Red"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"],
    isActive: true
  },

  // Left Bank - Graves
  {
    id: "pessac-leognan",
    name: "Pessac-Léognan",
    nameEn: "Pessac-Léognan",
    nameZh: "佩薩克-雷奧良",
    slug: "pessac-leognan",
    region: "Left Bank",
    subRegion: "Graves",
    description: "Premium appellation for both red and white wines.",
    area: 1600,
    established: 1987,
    wineTypes: ["Red", "White"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Sauvignon Blanc", "Sémillon"],
    isActive: true
  },
  {
    id: "graves",
    name: "Graves",
    nameEn: "Graves",
    nameZh: "格拉夫",
    slug: "graves",
    region: "Left Bank",
    subRegion: "Graves",
    description: "Historic region known for both red and white wines.",
    area: 5300,
    established: 1937,
    wineTypes: ["Red", "White"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Sauvignon Blanc", "Sémillon"],
    isActive: true
  },

  // Right Bank - Libournais
  {
    id: "saint-emilion",
    name: "Saint-Émilion",
    nameEn: "Saint-Émilion",
    nameZh: "聖愛美濃",
    slug: "saint-emilion",
    region: "Right Bank",
    subRegion: "Libournais",
    description: "UNESCO World Heritage site, famous for Merlot-based wines.",
    area: 5400,
    established: 1936,
    wineTypes: ["Red"],
    grapeVarieties: ["Merlot", "Cabernet Franc", "Cabernet Sauvignon"],
    isActive: true
  },
  {
    id: "pomerol",
    name: "Pomerol",
    nameEn: "Pomerol",
    nameZh: "波美侯",
    slug: "pomerol",
    region: "Right Bank",
    subRegion: "Libournais",
    description: "Small but prestigious appellation, home to Pétrus.",
    area: 800,
    established: 1936,
    wineTypes: ["Red"],
    grapeVarieties: ["Merlot", "Cabernet Franc"],
    isActive: true
  },
  {
    id: "fronsac",
    name: "Fronsac",
    nameEn: "Fronsac",
    nameZh: "弗龍薩克",
    slug: "fronsac",
    region: "Right Bank",
    subRegion: "Libournais",
    description: "Up-and-coming appellation with great value wines.",
    area: 850,
    established: 1937,
    wineTypes: ["Red"],
    grapeVarieties: ["Merlot", "Cabernet Franc", "Cabernet Sauvignon"],
    isActive: true
  },

  // Sauternais
  {
    id: "sauternes",
    name: "Sauternes",
    nameEn: "Sauternes",
    nameZh: "蘇玳",
    slug: "sauternes",
    region: "Sauternais",
    subRegion: "Sauternais",
    description: "World-famous sweet wine appellation.",
    area: 2200,
    established: 1936,
    wineTypes: ["Sweet White"],
    grapeVarieties: ["Sémillon", "Sauvignon Blanc", "Muscadelle"],
    isActive: true
  },
  {
    id: "barsac",
    name: "Barsac",
    nameEn: "Barsac",
    nameZh: "巴薩克",
    slug: "barsac",
    region: "Sauternais",
    subRegion: "Sauternais",
    description: "Sweet wine appellation within Sauternes.",
    area: 720,
    established: 1936,
    wineTypes: ["Sweet White"],
    grapeVarieties: ["Sémillon", "Sauvignon Blanc", "Muscadelle"],
    isActive: true
  },

  // Entre-Deux-Mers
  {
    id: "entre-deux-mers",
    name: "Entre-Deux-Mers",
    nameEn: "Entre-Deux-Mers",
    nameZh: "兩海之間",
    slug: "entre-deux-mers",
    region: "Entre-Deux-Mers",
    subRegion: "Entre-Deux-Mers",
    description: "Large appellation between the Dordogne and Garonne rivers, primarily white wines.",
    area: 23000,
    established: 1937,
    wineTypes: ["White"],
    grapeVarieties: ["Sauvignon Blanc", "Sémillon", "Muscadelle"],
    isActive: true
  },

  // Regional
  {
    id: "bordeaux",
    name: "Bordeaux",
    nameEn: "Bordeaux",
    nameZh: "波爾多",
    slug: "bordeaux",
    region: "Regional",
    subRegion: "Regional",
    description: "Regional appellation covering the entire Bordeaux wine region.",
    area: 42000,
    established: 1936,
    wineTypes: ["Red", "White", "Rosé"],
    grapeVarieties: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Sauvignon Blanc", "Sémillon"],
    isActive: true
  }
]

// 本地 AOC 資料類型
export interface LocalAOC {
  id: string
  name: string
  nameEn: string
  nameZh: string
  slug: string
  region: string
  subRegion: string
  description: string
  area: number
  established: number
  wineTypes: string[]
  grapeVarieties: string[]
  isActive: boolean
}

// 獲取所有 AOC 資料
export function getAllAOCs(): LocalAOC[] {
  return bordeauxAOCData
}

// 按區域分組
export function getGroupedAOCs(): Record<string, LocalAOC[]> {
  const grouped: Record<string, LocalAOC[]> = {}

  bordeauxAOCData.forEach(aoc => {
    if (!grouped[aoc.region]) {
      grouped[aoc.region] = []
    }
    grouped[aoc.region].push(aoc)
  })

  return grouped
}

// 搜尋 AOC
export function searchAOCs(query: string): LocalAOC[] {
  const keyword = query.toLowerCase()
  return bordeauxAOCData.filter(aoc =>
    aoc.name.toLowerCase().includes(keyword) ||
    aoc.nameZh.toLowerCase().includes(keyword) ||
    aoc.description.toLowerCase().includes(keyword) ||
    aoc.region.toLowerCase().includes(keyword) ||
    aoc.subRegion.toLowerCase().includes(keyword)
  )
}

// 根據 ID 獲取 AOC
export function getAOCById(id: string): LocalAOC | null {
  return bordeauxAOCData.find(aoc => aoc.id === id) || null
}

// 根據區域獲取 AOC
export function getAOCsByRegion(region: string): LocalAOC[] {
  return bordeauxAOCData.filter(aoc => aoc.region === region)
}

// 根據子區域獲取 AOC
export function getAOCsBySubRegion(subRegion: string): LocalAOC[] {
  return bordeauxAOCData.filter(aoc => aoc.subRegion === subRegion)
}

// 批量導入函數（保留原有功能，但現在只是一個示例）
export async function importAOCData() {
  console.log('🚀 模擬導入 AOC 資料...')

  // 模擬非同步操作
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    successCount: bordeauxAOCData.length,
    failCount: 0,
    errors: []
  }
}
