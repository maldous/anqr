import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'ANQR 소개',
  description: 'ANQR은 클라이언트 첫 번째 접근 방식을 가진 무료 QR 코드 생성기입니다. 로컬 또는 embedding에 대한 API를 사용합니다.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: '발전기 열기', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '자주 묻는 질문', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: '개인 정보 보호 정책', type: 'external' },
    { href: '/terms?lang=${lang}', label: '서비스 약관', type: 'external' },
  ],
  sections: [
    {
      heading: 'ANQR이란?',
      paragraphs: ['ANQR (pronounced "anchor")는 URL, 텍스트, Wi-Fi 자격 증명, 연락처 카드, 캘린더 이벤트 등을 위해 스캔 가능한 코드를 생성하는 무료 QR 코드 생성기입니다.', '로그인 없이 강력한 QR 도구를 원하는 개인, 소규모 기업, 시장, 개발자를 위해 제작되었습니다. 클라이언트 첫번째 디자인은 QR 부호가 기본적으로 브라우저에서 로컬로 생성되고, 직업적인 embedding와 통합을 위한 선택적인 서버 API와 더불어.'],
    },
    {
      heading: '키 기능',
      bullets: ['브라우저에서 QR 코드를 즉시 생성 - 계정이 필요하지 않습니다.', '사용자 정의 색상, 모듈 스타일, 찾기 패턴, 이미지 오버레이 추가.', '여러 형식으로 내보내기 : PNG, SVG, WebP 및 애니메이션 GIF.', '오류 교정 수준, QR 버전, 인코딩 모드 및 마스크 선택을위한 고급 제어.', 'Scan-safety 지도 및 라이브 미리보기는 인쇄 및 화면에서 코드를 읽을 수 있도록 도와줍니다.', '전체 매개변수를 지원하는 전문적인 임베딩을 위한 서버측 API입니다.', '한 번 로드 작업 - 어디서나 실행할 수있는 정적 웹 앱입니다.'],
    },
    {
      heading: 'ANQR은 어떻게 작동합니까',
      paragraphs: ['ANQR은 브라우저에서 실행되며 Reed-Solomon 오류 보정을 가진 표준 QR 매트릭스에 입력을 인코딩하고 선택한 형식으로 렌더링합니다.', '기본적으로, 생성은 브라우저에서 로컬로 발생합니다. 전문 사용은 서버 측 API를 사용하여 URL 매개 변수를 통해 QR 코드를 생성 할 수 있습니다 - 웹 사이트, 이메일 또는 자동화 된 워크플로우에 embedding에 적합합니다.', '오버레이 또는 애니메이션을 추가할 때, ANQR 밸런스는 스캔 신뢰성으로 스타일링되므로 결과를 스캔할 수 있습니다.', 'ANQR은 정적 코드에 중점을 둡니다 (데이터는 QR 내부입니다). 동적 코드 (editable destination)가 필요한 경우 자체 리디렉션 URL 또는 짧은 링크를 인코딩 할 수 있습니다.'],
    },
    {
      heading: 'ANQR은 누구입니까?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: '광고 및 우리는 어떻게 무료',
      paragraphs: ['ANQR은 무료이며 광고에 의해 지원됩니다. Google AdSense 및 / 또는 기타 광고 파트너를 통해 광고를 표시 할 수 있습니다.', '광고 제공 업체는 쿠키 또는 유사한 기술을 사용하여 관심과 검색 활동을 기반으로 광고를 개인화 할 수 있습니다. 장치 설정 및 Google 광고 설정을 통해 광고 선호도를 관리하고 개인 정보 보호 정책에서 자세히 알아볼 수 있습니다.', 'QR 코드로 인코딩된 콘텐츠를 판매하지 않습니다. Ads는 프로젝트를 실행하고 개선하는 비용을 다룹니다.'],
    },
    {
      heading: '개방 표준',
      paragraphs: ['ANQR은 ISO/IEC 18004 표준을 기반으로 QR 코드를 생성하고 스캐너, 카메라 및 인쇄 워크플로를 통해 광범위한 호환성을 목표로 합니다.'],
    },
    {
      heading: '상표 공지',
      paragraphs: ['QR Code®는 DENSO WAVE INCORPORATED의 등록 상표입니다. ANQR는 DENSO WAVE INCORPORATED에 의해 승인되거나 후원되지 않습니다.'],
    },
    {
      heading: '피드백 및 기여',
      paragraphs: ['우리는 피드백, 버그 보고서 및 기능 제안을 환영합니다. 이메일 또는 연락처 페이지를 통해 연락 주시기 바랍니다 - 우리는 모든 메시지를 읽고, 응답 시간은 다를 수 있습니다.'],
    },
  ],
};

export default about;
