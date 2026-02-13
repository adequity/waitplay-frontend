import type { Context } from "https://edge.netlify.com";

// 크롤러 User-Agent 패턴
const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'kakaotalk',
  'slackbot',
  'telegrambot',
  'discordbot',
  'whatsapp',
  'googlebot',
  'bingbot',
  'yandexbot',
  'baiduspider',
  'duckduckbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'vkshare',
  'w3c_validator',
];

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // /customer 경로이고 qr 파라미터가 있는 경우만 처리
  if (url.pathname === '/customer' && url.searchParams.has('qr')) {
    const qrCode = url.searchParams.get('qr');

    // 크롤러인지 확인
    const isCrawler = CRAWLER_PATTERNS.some(pattern => userAgent.includes(pattern));

    if (isCrawler && qrCode) {
      // 크롤러는 백엔드 OG 태그 페이지로 프록시
      const backendUrl = `https://api.waitplay.co.kr/api/ogimage/share/${qrCode}`;

      try {
        const response = await fetch(backendUrl, {
          headers: {
            'User-Agent': request.headers.get('user-agent') || '',
          },
        });

        // 백엔드 응답을 그대로 반환
        return new Response(response.body, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'text/html',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        console.error('Backend proxy error:', error);
        // 에러 시 원래 페이지로 진행
        return context.next();
      }
    }
  }

  // 크롤러가 아니거나 다른 경로면 원래대로 진행
  return context.next();
}

export const config = {
  path: "/customer",
};
