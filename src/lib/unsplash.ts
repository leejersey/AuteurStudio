// src/lib/unsplash.ts — Unsplash API 封装（带降级方案）

interface UnsplashPhoto {
  url: string;
  credit: string;   // 摄影师名称
  creditUrl: string; // 摄影师主页
}

const UNSPLASH_API = "https://api.unsplash.com";
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

/**
 * 通过关键词搜索 Unsplash 图片
 * 有 API Key 时使用正式 API（高质量 + 信用归属）
 * 无 Key 时使用 source.unsplash.com 降级（随机匹配）
 */
export async function searchUnsplashPhotos(
  keyword: string,
  count: number = 1
): Promise<UnsplashPhoto[]> {
  if (!keyword) return [];

  // ─── 正式 API ───
  if (ACCESS_KEY) {
    try {
      const params = new URLSearchParams({
        query: keyword,
        per_page: String(count),
        orientation: "landscape",
        content_filter: "high",
      });

      const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
        // 10 秒超时
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`[Unsplash] API error ${res.status}, falling back`);
        return fallbackPhotos(keyword, count);
      }

      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.results || []).slice(0, count).map((photo: any) => ({
        url: photo.urls?.regular || photo.urls?.small || "",
        credit: photo.user?.name || "Unknown",
        creditUrl: photo.user?.links?.html || "https://unsplash.com",
      }));
    } catch (err) {
      console.warn("[Unsplash] Fetch failed:", err);
      return fallbackPhotos(keyword, count);
    }
  }

  console.log(`[Unsplash] No API key, using fallback for: "${keyword}"`);
  // ─── 降级：source.unsplash.com ───
  return fallbackPhotos(keyword, count);
}

/**
 * 降级方案：使用 Unsplash Source URL
 * 不需要 API Key，但图片是随机匹配的
 */
function fallbackPhotos(keyword: string, count: number): UnsplashPhoto[] {
  const encoded = encodeURIComponent(keyword);
  return Array.from({ length: count }, (_, i) => ({
    url: `https://images.unsplash.com/photo-${generatePhotoSeed(keyword, i)}?w=1080&q=80&fit=crop`,
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
  }));
}

/**
 * 使用 Unsplash 热门图片 ID 根据关键词类别映射
 * 这比 source.unsplash.com 更可靠（它已经被废弃）
 */
const TOPIC_PHOTO_MAP: Record<string, string[]> = {
  technology: [
    "1558494949-ef010cbdcc31", // 电路板
    "1550751827-4bd374c3f58b", // 代码
    "1518770660439-4636190af475", // 服务器
    "1531297484001-80022131f4a1", // 笔记本
    "1526374965328-7f61d4dc18c5", // 手机
  ],
  ai: [
    "1677442136019-21780ecad995", // AI 芯片
    "1620712943543-bcc4688e7485", // 机器人
    "1535378917042-10a22c95931a", // 数据
    "1555255707-c07966088b7b", // 网络
    "1507146153580-69a1fe6d8aa1", // 键盘
  ],
  nature: [
    "1441974231531-c6227db76b6e", // 森林
    "1506744038136-46273834b3fb", // 湖泊
    "1470071459604-3b5ec3a7fe05", // 日出
    "1447752875215-b2761acb3c5d", // 山脉
    "1465146344425-f00d5f5c8f07", // 花朵
  ],
  business: [
    "1507003211169-0a1dd7228f2d", // 办公
    "1560472354-b33ff0c44a43", // 会议
    "1454165804606-c3d57bc86b40", // 握手
    "1542744173-8e7e91415657", // 图表
    "1521791136064-7986c2920216", // 城市
  ],
  abstract: [
    "1557672172-298e090bd0f1", // 抽象光线
    "1550684848-86a5b1022010", // 几何
    "1558591710-4b4a1ae0f04d", // 波浪
    "1579546929518-9e396f3cc809", // 渐变
    "1557682250-33bd709cbe85", // 纹理
  ],
};

function generatePhotoSeed(keyword: string, index: number): string {
  const lower = keyword.toLowerCase();

  // 尝试匹配最佳主题
  for (const [topic, photos] of Object.entries(TOPIC_PHOTO_MAP)) {
    if (lower.includes(topic)) {
      return photos[index % photos.length];
    }
  }

  // 二级关键词匹配
  const keywordMap: Record<string, string> = {
    code: "technology",
    programming: "technology",
    software: "technology",
    computer: "technology",
    digital: "technology",
    neural: "ai",
    machine: "ai",
    learning: "ai",
    deep: "ai",
    robot: "ai",
    artificial: "ai",
    medical: "business",
    health: "business",
    hospital: "business",
    doctor: "business",
    forest: "nature",
    ocean: "nature",
    mountain: "nature",
    startup: "business",
    team: "business",
    office: "business",
  };

  for (const [kw, topic] of Object.entries(keywordMap)) {
    if (lower.includes(kw)) {
      const photos = TOPIC_PHOTO_MAP[topic];
      return photos[index % photos.length];
    }
  }

  // 默认使用 abstract
  const defaultPhotos = TOPIC_PHOTO_MAP.abstract;
  return defaultPhotos[index % defaultPhotos.length];
}

/**
 * 批量为 slides 获取图片
 * 提取每个 slide 的 imageKeyword → 并行搜索 → 回填 imageUrl
 */
export async function enrichSlidesWithImages<
  T extends { imageKeyword?: string; imageUrl?: string; imageCredit?: string }
>(slides: T[]): Promise<T[]> {
  console.log(`[Unsplash] Processing ${slides.length} slides...`);

  const tasks = slides.map(async (slide, i) => {
    if (slide.imageUrl) {
      console.log(`[Unsplash] Slide ${i}: already has imageUrl, skipping`);
      return slide;
    }
    if (!slide.imageKeyword) {
      console.log(`[Unsplash] Slide ${i}: no imageKeyword, skipping`);
      return slide;
    }

    console.log(`[Unsplash] Slide ${i}: searching for "${slide.imageKeyword}"`);
    const photos = await searchUnsplashPhotos(slide.imageKeyword, 1);
    if (photos.length > 0) {
      console.log(`[Unsplash] Slide ${i}: found image from ${photos[0].credit}`);
      return {
        ...slide,
        imageUrl: photos[0].url,
        imageCredit: photos[0].credit,
      };
    }
    console.log(`[Unsplash] Slide ${i}: no results`);
    return slide;
  });

  const result = await Promise.all(tasks);
  const withImages = result.filter(s => s.imageUrl).length;
  console.log(`[Unsplash] Done: ${withImages}/${slides.length} slides have images`);
  return result;
}
