import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const guide: PageDefinition = {
  title: 'ANQR 사용자 가이드',
  description: 'QR 코드를 생성하기 위해 ANQR을 사용하는 가이드.',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: '발전기 열기', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '자주 묻는 질문', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR 예제 보기', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: '시작하기',
      paragraphs: ['ANQR은 클라이언트 첫번째 접근법을 가진 QR 부호 발전기입니다. 기본적으로 QR 코드는 브라우저에서 로컬로 생성됩니다 - 계정이 필요하지 않으며 데이터는 개인을 유지합니다. 전문 embedding, 당신은 또한 서버 측 API를 사용할 수 있습니다.', '인터페이스에는 세 가지 인터페이스 레벨이 있습니다. Basic, Advanced 및 Professional. 헤더에 탭을 사용하여 레벨을 선택합니다. 각 수준은 당신이 필요로 하는 무슨에 집중된 공용영역을 지키는 동안 추가 기능을 자물쇠로 엽니다.'],
      bullets: ['Basic: 일반 텍스트/URL 콘텐츠 및 이미지 오버레이와 간단한 QR 코드 생성.', '고급: QR 인코딩 옵션, 렌더링 스타일, 애니메이션, 출력 형식, 장시간 콘텐츠 유형, 과감한 사용자 정의.', '전문가: Watermarks, metadata, 공유, 안전 분석, 지불 QR 부호 및 기업 특징.'],
      links: [{ href: '/?lang=${lang}', label: '발전기 열기', type: 'generator' }],
    },
    {
      heading: '빠른 시작',
      paragraphs: ['첫 번째 QR 코드를 만들려면:'],
      bullets: ['1. 명세 콘텐츠 유형 드롭다운에서 콘텐츠 유형 (URL, 텍스트, WiFi 등)을 선택하십시오.', '2. 명세 해당 분야의 데이터를 입력하세요.', '3. 명세 선택적으로 색상, 스타일을 사용자 정의하고 오버레이 이미지를 추가합니다.', '4. PNG, GIF, WebP 또는 SVG로 QR 코드를 다운로드하려면 수출을 클릭하십시오.'],
      links: [{ href: '/?lang=${lang}', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: '기본 기능',
      paragraphs: ['Basic Level은 결제량 콘텐츠와 이미지 오버레이를 통해 QR 코드를 생성하는 간소화된 인터페이스를 제공합니다. 시작하기 쉬운 방법입니다.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '내용 유형 (기본)',
      paragraphs: ['일반 텍스트: QR 코드 용량 제한까지 모든 텍스트를 인코딩합니다. 짧은 메시지, 코드, 식별자에 이상적입니다.', 'URL: 웹 주소를 인코딩합니다. QR코드는 스캔할 때 URL을 엽니다. http:// 및 https:// 프로토콜을 지원합니다.'],
    },
    {
      heading: '이미지 오버레이 (Basic)',
      paragraphs: ['QR 코드와 혼합하기 위해 이미지 (JPG, PNG, GIF, WebP)를 업로드합니다. 기본 오버레이 기능은 다음과 같습니다:'],
      bullets: ['파일 업로드: 당신의 장치에서 이미지를 선택하십시오.', 'URL에서로드 : 이미지 URL을 입력 (CORS 허용).', '센터 로고: 중앙의 이미지, 오류 보정에 의존.', '혼합: QR 패턴과 이미지의 간단한 알파 혼합.', '인텐시브 : 오버레이가 QR 코드 (0-100%)에 어떻게 영향을 미치는지 제어합니다.', '색깔 형태: 풀 컬러, 회색 가늠자, 또는 검정 & 백색.', '보존 Finder 패턴 : 믿을 수 있는 스캐닝을 위해 unmodified 구석 본을 지키십시오.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: '고급 기능',
      paragraphs: ['고급 수준의 잠금 해제 QR 인코딩 옵션, 렌더링 스타일, 애니메이션, 출력 형식, 확장 된 콘텐츠 유형, 고급 오버레이 사용자 정의.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: 'QR 인코딩 설정',
      paragraphs: ['버전: QR 코드는 버전 1-40, 더 높은 버전으로 데이터를 보유하지만 더 큰. ANQR을 허용하기 위해 0 (Auto)로 설정하면 컨텐츠에 맞는 가장 작은 버전을 선택합니다.', '오류 수정 : QR 코드를 손상시킬 수 있는 방법을 결정합니다.'],
      bullets: ['L (낮은): 7% 과실 개정 - 가장 작은 크기, 적어도 중복.', 'M (Medium) : 15 % 오류 보정 - 균형 옵션.', 'Q (Quartile): 25% 과실 개정 - 인쇄된 부호를 위해 좋은.', 'H (High) : 30 % 오류 교정 - 오버레이 또는 가혹한 조건에서 코드에 가장 적합합니다.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: 'Quiet Zone (마진)',
      paragraphs: ['조용한 지역은 QR 코드 주위에 흰색 공간입니다. 스캐너는 코드가 시작되는지를 감지하기 위해이 마진이 필요합니다. 표준은 적어도 4개의 단위를 추천합니다. 4 이하의 감소는 스캔 문제를 일으킬 수 있습니다.'],
    },
    {
      heading: '모듈 스타일',
      paragraphs: ['모듈은 QR 코드를 만들 수있는 개별 평방입니다. ANQR는 5개의 작풍을 제안합니다:'],
      bullets: ['사각: 예리한 구석을 가진 고전적인 QR 외관.', '둥근: 우정을 위한 연화한 구석.', 'Dots: 현대 미학을 위한 원형 단위.', '다이아몬드: 45°는 특유한 본을 위한 사각을 자전했습니다.', '연결: Modules 병합 때 인접한, 유기 모양을 만들기.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '찾기 패턴 스타일',
      paragraphs: ['Finder 패턴은 스캐너를 사용하거나 코드를 사용하는 QR 코너에서 세 개의 큰 광장입니다. 유효한 작풍:'],
      bullets: ['사각: 표준 정연한 구석.', '둥근: 둥근 단위 작풍을 일치하는 연화한 구석.', '원형: 도트 스타일 코드에 대한 원형 찾기 패턴.'],
    },
    {
      heading: '정렬 및 타이밍 패턴',
      paragraphs: ['정렬 패턴은 더 큰 QR 코드 (버전 2+)에 나타납니다. Timing 패턴은 변경 라인 연결 찾기 패턴입니다.'],
      bullets: ['정렬 스타일: 일치 찾기, 광장, 라운드, 또는 원.', '타이밍 스타일: 일치 단위, 단단한, 또는 돌진.'],
    },
    {
      heading: '색상 :',
      paragraphs: ['지상: QR 모듈의 색상. 검정 (#000000)는 표준 그러나 어떤 어두운 색깔 일입니다.', '배경: 배경 색상. 백색 (#ffffffff)는 기준입니다. 전경과 충분한 대조를 보장합니다.', '투명한 배경: 착색된 표면에 사용을 위해 완전히 배경을 제거하십시오. 표면은 적절한 대비를 제공합니다.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '단위 크기 & 간격',
      paragraphs: ['Module Size: 각 모듈이 픽셀에서 렌더링되는 방법을 제어합니다. 더 큰 값은 더 큰, 쉽게 할 수있는 코드를 만듭니다.', '단위 간격: 단위 사이 공간을 백분율로 추가합니다. 작은 간격 (5-15%)는 몇몇 조건에서 scannability를 개량할 수 있습니다 그러나 과도한 간격은 신뢰성을 감소시킵니다.'],
    },
    {
      heading: '출력 설정',
      paragraphs: ['체재: 사용 케이스에 근거를 둔 당신의 수출 체재를 선택하십시오.'],
      bullets: ['PNG: Lossless 래스터 형식, 대부분의 용도에 이상적입니다. 인쇄 및 디지털에 가장 적합합니다.', 'WebP: 작은 파일 크기를 가진 현대 체재. 웹 사용을 위해 좋은.', 'GIF: 애니메이션 QR 코드에 필요한. 투명성 지원.', 'SVG: 무한하게 확장하는 벡터 형식. 큰 인쇄를 위해 베스트 또는 당신이 코드를 편집해야 할 때.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    {
      heading: '산출 차원',
      paragraphs: ['Width/Height: 화소에 있는 산출 크기를 놓으십시오. 인쇄를 위해, DPI에 근거를 두는 산출 (예를들면, 1 인치 = 300px에 300 DPI). 더 큰 크기는 거리에서 더 믿을 수 있습니다.'],
    },
    {
      heading: '애니메이션 설정 (Advanced)',
      paragraphs: ['애니메이션 QR 코드 동작을 제어:'],
      bullets: ['속도: 밀리 초에 있는 생기 구조 비율.', '루프: 연속 또는 단일 플레이 애니메이션.', 'Bounce: 탁구 애니메이션 방향.', '시작 프레임: 특정 프레임에서 애니메이션 시작.', 'Max Frames: 애니메이션에 있는 한계 합계 구조.', '프레임 단계 : 빠른 애니메이션을위한 프레임을 건너.', '해석: 없음, Crossfade, 또는 구조 사이 모프.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    {
      heading: '내용 유형 (Advanced)',
      paragraphs: ['고급 수준은 추가 탑재량 형식을 잠금 해제:'],
      bullets: [
        '전화 번호(전화:): 전화 번호(전화번호)를 작성합니다.',
        '이메일 (mailto:): 선택 과목 및 신체로 이메일 클라이언트를 엽니 다.',
        'SMS: 전화 번호에 미리 채워진 원본 메시지.',
        'vCard: 이름, 조직, 전화, 이메일, 주소를 가진 가득 차있는 접촉 카드.',
        'MeCard: 일본에 인기 있는 소형 접촉 체재.',
        'BizCard: 레거시 명함 형식.',
        'Geo 위치: GPS는 지도에서 열립니다.',
        '와이파이: 자동 연결 (SSID, 암호, 보안 유형)를 위한 네트워크 자격.',
        '일정: 제목, 위치, 날짜/시간을 가진 iCalendar 체재.',
        '이벤트 RSVP: 이벤트 등록 페이지로 연결.',
        '캘린더 구독: ICS/WebCal 피드에 가입하십시오.',
        'File/Document URL: 다운로드 가능한 파일에 직접 링크.',
        '클라우드 스토리지 링크 : Google 드라이브, Dropbox, OneDrive 등 링크.',
        '사회 프로필: LinkedIn, Twitter, Instagram 등의 링크.',
        '메시징 링크: WhatsApp, 전보, 신호 깊은 링크.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '고급 오버레이 기능',
      paragraphs: ['추가 오버레이 기능:'],
      bullets: ['자르기 : 이미지의 광장 지역을 선택할 수 있습니다.', 'Halftone: 이미지 광도에 근거를 둔 고전적인 인쇄 작풍 점 본.', 'Dithered: 상세한 재생산을 위한 과실 확산.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '오버레이 블렌드 모드 (Advanced)',
      paragraphs: ['고급 수준의 추가 혼합 모드:'],
      bullets: ['Subpixel: 각 단위를 더 높은 세부사항을 위한 subpixels로 분할하십시오.', '파란 소음: artifact-free 패턴을 위해 파란색 노이즈를 사용합니다.', '모자이크: 타일 기반 효과 보존 이미지 구조.', '비누 충전물: 모듈 간의 간격으로 이미지 배치.', '광도: 이미지 광도에 근거를 둔 Varies 단위 크기.', 'Duotone : 두 가지 색상으로 이미지가 눈에 띄는 대조.'],
    },
    {
      heading: '오버레이 인텐스',
      paragraphs: ['오버레이가 QR코드 (0-100%)에 어떻게 영향을 미치는지 제어합니다. 더 높은 가치는 더 많은 이미지 세부사항을 보여줍니다 그러나 scannability를 감소시킬지도 모릅니다. 70%의 주위에 시작하고 시험에 기초를 두어 조정하십시오.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: '관련 가이드 및 예제 보기', type: 'learn' }],
    },
    {
      heading: '색깔 형태',
      paragraphs: ['오버레이 이미지가 처리되는 방법:'],
      bullets: ['풀 컬러 : 원본 이미지 색상을 보존합니다.', 'Grayscale: 검은 색과 흰색 톤으로 변환합니다.', '검정 & 백색: 높은 대조 바이너리 변환.'],
    },
    {
      heading: 'Preserve 찾기 패턴',
      paragraphs: ['활성화될 때, 오버레이에 의해 unmodified 3개의 구석 finder 본을 지킵니다. 믿을 수 있는 스캐닝을 위해 강력하게 추천합니다.'],
    },
    {
      heading: '이미지 처리',
      paragraphs: ['혼합하기 전에 오버레이 이미지에 필터를 적용합니다. 이 조정은 마지막 QR 부호에서 이미지가 어떻게 나타나는지 개량할 수 있습니다.'],
      bullets: ['광도 (- 100에서 +100): 밝거나 어두운 이미지.', '대조 (-100에서 +100): 증가 또는 톤 범위를 감소.', '감마 (0.2에서 3.0): 비선형 광도 조정. 아래 값 1 lighten midtones, 위 1 Darken 그들.', '포화 (-100에서 +100): 색깔 강렬. -100은 회색 가늠자, +100는 포화됩니다.', 'Hue 회전 (0-360°): 색깔 바퀴의 주위에 모든 색깔을 이동하십시오.', 'Blur (0-20px): Soften 이미지 세부 정보.', 'Sharpen (0-100%): 가장자리와 세부사항을 강화하십시오.', '포스터 (0-16 수준): 포스터 효력을 위한 색깔 수준을 감소시키십시오.', 'Threshold (0-255) : cutoff 포인트에서 바이너리 블랙 / 화이트로 변환합니다.', 'Edge Detection: Sobel 또는 Canny 알고리즘만 표시할 수 있습니다.', 'Invert: 모든 색상을 반전.'],
    },
    {
      heading: '적당한 형태',
      paragraphs: ['오버레이 이미지는 QR 코드 영역에 적합:'],
      bullets: ['덮개: 이미지는 전체 영역을 채우고, 필요하다면 자르기.', '결론 : 눈에 보이는 전체 이미지, 마진이있을 수 있습니다.', '스트레치 : 정확히 채우기 위해 이미지 왜곡.'],
    },
    {
      heading: 'Transform 옵션',
      paragraphs: ['교체: 90° 증가에 있는 자전 오바레이.', '플립 X / Y : 이미지를 가로 또는 수직으로 미러.'],
    },
    {
      heading: '관련 링크',
      paragraphs: ['Dithering은 QR 코드가 대표할 수 있는 패턴으로 연속 톤 이미지를 변환합니다. Dithered, Blue Noise 또는 True Dither Blend 모드를 사용할 때 사용할 수 있습니다.'],
      bullets: [
        '오류 확산 : 클래식 Floyd-Steinberg 스타일. 이웃 픽셀에 정량화 오류.',
        '주문 (베이어): 일반 패턴의 임계 매트릭스를 사용합니다.',
        '클러스터링 도트: 심화 Halftone 인쇄.',
        'Void & 클러스터: Optimized 주문 디더링.',
        '파란 소음: 시각적으로 유쾌한 무작위 보기 본.',
        '파란 소음 문턱: 파란 잡음 짜임새로 파열.',
        '백색 소음: 무작위 문 흐리게 하기.',
        'Gaussian / 삼각형 소음: 다른 배급을 가진 소음.',
        '블루 노이즈 + 오류 확산 : 두 기술을 결합 하이브리드.',
        '상영된 파란 소음: 스크린 같이 파란 소음 본.',
        'Perceptual: 더 나은 시각적인 결과를 위해 발광성 무게를 다는.',
        'Edge-Aware: 이더링 동안 이미지 가장자리를 보존합니다.',
        '공급 능력: Locally-adaptive 문턱.',
        'Temporal Blue 소음 : 애니메이션 GIF를 들어 프레임 당 패턴을 다릅니다.',
      ],
    },
    {
      heading: 'Diffusion 케넬',
      paragraphs: ['Error Diffusion dithering을 사용할 때 오류가 배포되는 방법을 선택하십시오'],
      bullets: ['Floyd-Steinberg: 고전적인 4-neighbor 확산. 좋은 일반적인 선택.', 'Jarvis-Judice-Ninke: 12-neighbor, 매끄럽지만 느리게.', 'Stucki: 다른 무게를 가진 JJN와 유사한.', 'Burkes: 단순 JJN, 빠른.', 'Sierra: 질과 속도를 균형을 잡는 커널의 가족.', 'Atkinson: 빛 확산은, 세부사항을 보존하고 그러나 곡물일 수 있습니다.'],
    },
    {
      heading: '공급 능력',
      paragraphs: ['훨씬 더 흐리게 하는 방법을 통제하십시오 (0-100%). 더 낮은 가치는 본래 본의 더 많은 것을 보존하고, 더 높은 가치는 이미지 세부사항을 더 보여줍니다.'],
    },
    {
      heading: 'Subpixel 설정',
      paragraphs: ['Subpixel 혼합 형태를 사용하는 경우:'],
      bullets: ['격자 크기: 2×2, 3×3, 또는 단위 당 4×4 subpixels. 더 높은 = 더 자세히.', '센터 규칙: Strict는 단위도 일치하기 위하여 중심 subpixel를 요구합니다. Halftone Center는 변이를 허용합니다.', '중립 색깔: undetermined subpixels를 위해 사용되는 색깔.', '측정기 Override: 찾기 패턴이 렌더링되는 방법 (Solid 또는 Stylized).'],
    },
    {
      heading: 'Halftone 설정',
      paragraphs: ['Halftone 혼합 형태를 사용하는 경우:'],
      bullets: ['세포 크기: 단위 N×N 격자 당.', '점 모양: 원형, 사각, 또는 선.', '광도 곡선: 선형, S 곡선, 또는 감마.'],
    },
    {
      heading: '듀오톤 색상',
      paragraphs: ['듀오톤 블렌드 모드를 사용할 때, 그림자 색상(dark area) 및 하이라이트 색상(bright area)를 설정합니다.'],
    },
    {
      heading: 'GIF 애니메이션 설정',
      paragraphs: ['애니메이션 GIF 오버레이를 사용할 때:'],
      bullets: ['프레임 지연 사용 : 원래 GIF 타이밍을 존중합니다.', '최대 FPS: 제한 프레임 속도 (1-60 fps).', '처리 처리: Respect 또는 Simplify 프레임 처리 방법.'],
    },
    {
      heading: '고급 렌더링 옵션',
      paragraphs: ['추가 렌더링 컨트롤:'],
      bullets: ['갭 모드: 없음, Inset, 치기, 또는 부정적인 공간 간격 스타일링.', '코너 반경: 모듈의 둥근 모서리 비율.', 'Gradient: 단위에 아무도, 선형, 레이디얼, 또는 Conic gradient.', '눈 Outer/Inner 작풍: 발견자 본 반지를 위한 독립적인 스타일링.', '점 교체: 회전 다이아몬드/닷 단위.', '눈 가늠자: 발견자 본을 위한 크기 조정.', '구조 작풍: 장식 프레임 추가 (Rounded Frame, 스티커, 태그).', '프레임 텍스트: "Scan Me!"와 같은 텍스트를 프레임에 추가합니다.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '고급 QR 인코딩',
      paragraphs: ['Fine-tune QR 인코딩:'],
      bullets: ['기호화 형태: 자동, 숫자, 알파벳, 바이트/UTF-8, 또는 Kanji.', 'Enforce Min Quiet Zone: 최소 4개의 모듈 마진을 보장합니다.', '마스크 패턴: 자동(최적) 또는 수동으로 패턴 0-7을 선택하여 모듈 배포를 제어합니다. 동일한 데이터를 인코딩하는 동안 패턴이 다르면 시각적 모양도 달라집니다.', '문자 인코딩: ISO-8859-1(Latin-1 기본값), UTF-8(이모지를 포함한 전체 유니코드) 또는 Shift-JIS(일본어). 콘텐츠의 캐릭터 요구 사항에 따라 선택하세요.'],
    },
    {
      heading: '고급 출력 옵션',
      paragraphs: ['추가 수출 설정:'],
      bullets: ['Filename: 다운로드에 대한 사용자 지정 파일명.', '선물세트 팔레트 크기 : GIF 출력의 2256 색상.', '선물세트 Quantizer: 매체 커트, NeuQuant, 또는 Octree 색깔 감소.', '선물세트 이더링: 오프, Floyd-Steinberg, 또는 주문.', '선물세트 투명한 색깔: 투명한 색상을 설정합니다.', '사이트맵 진실한 벡터: 임베디드 래스터 대신 경로 사용.', '사이트맵 모양 정밀도: 화소 정확한 경로 연출.', '사이트맵 Embed Raster Overlay: 내장된 이미지로 오버레이 포함.', '계정 만들기 Override: 출력에 있는 특정한 배경 색깔을 강제하십시오.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '인증 옵션',
      paragraphs: ['입력 처리 설정:'],
      bullets: ['Validate 입력: 인코딩 전에 내용 형식을 검사합니다.', '손질 Whitespace: 지도/대륙 공간을 제거하십시오.', '정상화 Newlines: LF로 모든 라인 종료를 변환합니다.', '최대 길이 감시: 콘텐츠가 QR 수용량을 초과하는 경우에 Warn.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: '직업적인 특징',
      paragraphs: ['전문 수준은 워터 마크, 메타 데이터, 공유 옵션, 안전 분석, 지불 QR 코드 및 엔터프라이즈 기능을 추가합니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '워터마크',
      paragraphs: ['QR 코드에 워터 마크 추가:'],
      bullets: ['종류: 텍스트, 이미지, 또는 패턴 워터 마크.', '위치: 센터, 코너, 가장자리, 뒤에, 또는 Quiet 지역.', '불투명: 워터마크 투명도 (0-100%).', '혼합 형태: 정상적인, Multiply, 스크린, 또는 오바레이 혼합.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
      ],
    },
    {
      heading: '메타데이터',
      paragraphs: ['수출된 파일에 있는 Embed metadata:'],
      bullets: ['제목, 저자, 저작권, 라이센스, 설명 필드.', '창조 시간: Embed 세대 타임스탬프.', '주문 열쇠 고리: arbitrary metadata 쌍을 추가하십시오.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
      ],
    },
    {
      heading: '공유하기',
      paragraphs: ['QR 코드 구성을 공유:'],
      bullets: ['Direct Link: 현재 설정과 공유 가능한 URL 생성.', 'Embed HTML: 웹 사이트에 embed 코드를 가져옵니다.', '인코딩 매개 변수: 공유 URL에서 모든 설정을 포함.', '참고 : 로컬 파일에서 오버레이 이미지는 URL을 통해 공유 할 수 없습니다.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    {
      heading: '안전 분석',
      paragraphs: ['QR 코드를 스캔할 수 있습니다:'],
      bullets: ['안전 형태: 떨어져, 균형을 잡는, 또는 엄격한 검사 필요조건.', 'Min 단위 크기: 단위 당 최소한도 화소 크기.', '미니키트 Zone: 최소 마진 모듈.', 'Lock Finders/Timing/Align/Format/Version: 특정 요소를 보호합니다.', 'ECC의 Max Overlay Intensity: 오류 보정 수준에 따라 자동 강도 제한.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    {
      heading: '내용 유형 (Professional)',
      paragraphs: ['직업적인 수준은 지불과 기업 내용 유형을 추가합니다:'],
      bullets: ['EPC/SEPA (EU): IBAN, BIC, 양, 참고를 가진 유럽 은행 이동 QR 부호.', 'UPI (India) : VPA, Payee 이름, 금액과 통합 된 지불 인터페이스.', 'PayNow (싱가포르): UEN 또는 모바일 번호를 가진 싱가포르 빠른 지불.', 'PromptPay (태국): 태국 국가 지불 시스템.', 'PIX (브라질): PIX 열쇠를 가진 브라질 즉시 지불.', '암호화폐: 비트코인, 이더리움, 라이트코인 결제 주소.', '마케팅 캠페인 링크 : 전체 UTM 매개 변수가있는 URL (마케팅 태그) 추적.', '짧은 링크: 동적/트랙블 QR 코드에 대한 URL 단축기를 사용합니다.', 'GS1 디지털 링크 : GTIN, serial, batch, expiry와 제품 식별.', '앱 딥 링크 : iOS / Android 앱 사용자 정의 계획과 깊은 링크.', '사용자 정의 형식 : 형식 또는 검증이없는 원료.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: '고급 모드의 언어 관련 결제',
      paragraphs: ['고급 모드를 사용할 때 ANQR은 선택한 언어와 관련된 지불 방법을 자동으로 보여줍니다. 예를 들어, 베트남 사용자는 VietQR을 참조, 태국 사용자는 PromptPay를보고, 인도 언어 사용자는 UPI와 BharatQR을 참조하십시오. 글로벌 결제 방법 (cryptocurrency, PayPal, Cash App)은 모든 언어로 제공됩니다. 전문 모드는 언어에 관계없이 모든 지불 표준을 잠금 해제합니다.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '유럽 지불 기준',
      bullets: ['EPC/SEPA (EU): EPC QR 부호 기준의 뒤에 유럽 은행 이동 QR 부호. 지원 IBAN, BIC (국내를 위해 선택), EUR에 있는 총계, 및 구조상으로 또는 unstructured 지불 참고. 유럽 연합 (EU) 국가 플러스 스위스, 노르웨이, 아이슬란드, 리히텐슈타인, 모나코 및 산마리노를 포함한 SEPA 영역에서 사용됩니다.', 'Swiss QR-bill: SIX 구현 가이드라인 뒤에 스위스 지불 표준. 지원 CHF 및 EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), 구조화 된 creditor/debtor 주소 및 청구 정보. 2022년부터 스위스 송장에 필요한.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '인도 지불 기준',
      bullets: ['UPI (India) : NPCI 딥 링크 사양을 따르는 통합 지불 인터페이스. 지원 VPA (Virtual Payment Address), Payee 이름, INR의 금액, 거래 메모, 참조 ID, 상인 범주 코드, 및 거래 모드.', 'BharatQR (India) : UPI 및 카드 기반 지불을 지원하는 통합 QR 표준. 최대 호환성을 위한 카드 PAN을 가진 UPI VPA를 결합합니다. 상인 이름, 도시, MCC, GST 세부사항 및 청구서/참고 번호를 포함합니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '동남 아시아 지불 기준',
      bullets: ['PayNow (싱가포르): SGQR 프로파일을 사용하여 EMVCo QR 사양을 사용하는 싱가포르 빠른 지불 시스템. UEN (사업 등록), 모바일 번호 또는 NRIC를 프록시 식별자로 지원합니다. 양 편집성 깃발과 만료 날짜를 포함합니다.', 'PromptPay (태국): 태국 EMV 프로필 은행 다음 태국 국가 지불 시스템. 모바일 번호, 국가 ID, 세금 ID, e-wallet ID 및 다중 참조 필드로 결제를 지원합니다.', 'QRIS (인도네시아): 빠른 응답 부호 인도네시아 기준. EMV 기반 국가 지불 표준 지원 상인 ID, NMID (국가 상인 ID), 상인 기준 분류 및 편의비 (fixed 또는 비율).', 'DuitNow (Malaysia) : 말레이시아 즉시 지불 시스템. NRIC, 모바일, 여권, 육군 ID 및 비즈니스 등록 번호를 포함한 여러 프록시 유형을 지원합니다.', 'VietQR (베트남): 베트남 간 은행 이동 기준. 은행 BIN (NAPAS ID) 및 계좌 번호가 필요합니다. 다른 전송 유형 (QRPUSH, QRIBFTTA, QRIBFTTC)에 대한 여러 서비스 코드를 지원합니다.', 'QR Ph (필리핀): InstaPay 및 PESONet에 대한 Philippine QR 지불 표준. P2M (인원-인원) 거래에 대한 판매자 식별 계정 번호를 사용합니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '동아시아 지불 표준',
      bullets: ['TWQR (대만): 대만 QR 지불 기준. 판매자 ID, 세금 ID 및 TWD 금액 지원.', '모델 번호: HKQR/FPS (홍콩): 홍콩 더 빠른 지불 체계 QR 부호. 지원 FPS ID, 모바일 번호, 또는 지불 식별자로 이메일. HKD의 금액.', 'JPQR (일본): 일본에 의하여 통일되는 QR 부호 지불 기준. JPY 금액과 상인 ID를 저장합니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '다른 지역 지불 기준',
      bullets: ['PIX (브라질): BR Code 명세를 따르는 브라질 중앙 은행 즉시 지불 체계. 지원 PIX 키 (CPF, CNPJ, 이메일, 전화 또는 임의 키), 상인 이름 / 도시, 거래 ID 및 BRL 금액.', 'AusPayNet/NPP는 결제하기 (호주): 호주 새로운 지불 플랫폼 PayID 시스템. Pay 지원 ID 유형 (이메일, 모바일, ABN, 조직 ID) 또는 전통적인 BSB + 계정 번호. Merchant 이름은 payers로 선택되어 NPP lookup에서 등록 된 이름을 볼 수 있습니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '암호화폐 결제',
      bullets: ['Bitcoin/Litecoin (BIP-21) : 지갑 주소, 옵션 금액 및 라벨이있는 표준 암호 화폐 지불 URI. 모든 주요 Bitcoin 및 Litecoin 지갑과 호환됩니다.', '번개 네트워크 (BOLT11): Lightning 네트워크 지불 청구서. BOLT11은 최소 수수료로 즉시 Bitcoin 결제를 인코딩한 송장 문자열을 붙여줍니다.', 'Ethereum (EIP-681) : Ethereum 거래 요청 URI는 기본 ETH 전송 및 ERC-20 토큰 전송을 지원합니다. 다중 네트워크 지원 (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), 가스 매개 변수 및 계약 함수 통화에 대한 체인 ID를 포함합니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '결제 링크 서비스',
      bullets: ['PayPal.Me: 사용자 이름과 선택적인 미리 채워진 총계를 가진 PayPal 지불 연결. Recipients는 PayPal 균형, 카드, 또는 은행 계좌를 통해 지불 할 수 있습니다.', '현금 앱: 현금 옵션 금액으로 $cashtag를 사용하여 앱 지불 링크. 피어 투 피어 지불을위한 미국 인기.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '일반 EMV QR',
      bullets: ['사이트맵 일반: 사용자 정의 EMV Merchant-Presented 모드 만들기 결제 계획의 QR 코드는 특히 나열되지 않습니다. 판매자 이름, 도시, 국가 코드 (ISO 3166-1), 통화 코드 (ISO 4217 숫자), MCC, 팁 / 편의 요금 옵션 및 추가 데이터 필드를 구성하십시오. 테스트 또는 사용자 정의 통합에 유용합니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: '오버레이 블렌드 모드 (Professional)',
      paragraphs: ['직업적인 수준에 있는 추가 혼합 형태:'],
      bullets: ['픽셀: Pixelated 오버레이 효과.', '개요: Edge detection overlay는 contours만 보여줍니다.', '파: Wavy 찡그림 효력.', 'Subpixel 크기: 이미지에 근거를 두는 변하기 쉬운 subpixel.', 'True Dither: 주문된 매트릭스 선택으로 고급 디테일.', 'Extreme: 최대 이미지 가시성, scannability에 영향을 미칠 수 있습니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '보호 설정',
      paragraphs: ['QR 요소가 오버레이 수정에서 보호되는 정밀한 곡물 통제:'],
      bullets: ['보존 Timing: 타이밍 패턴을 수정합니다.', '보존 : 변경되지 않은 정렬 패턴 유지.', '보호 형식 Info: Shield 형식 정보 모듈.', '보호 버전 Info: Shield 버전 정보 모듈.'],
    },
    {
      heading: 'ECC-Aware 형태',
      paragraphs: ['Intelligently는 오류 보정 용량을 기반으로 오버레이 강도를 배포합니다. 시스템은 스캔 가능성을 유지하면서 모듈을 수정할 수 있습니다.'],
      bullets: ['위험 예산 : 오류 보정 용량의 비율 (0-100%).', '더 높은 예산 = 더 눈에 띄는 오버레이 but riskier scannability.', '예산 = 더 안전한 스캔하지만 덜 눈에 보이는 오버레이.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '전문 렌더링 옵션',
      paragraphs: ['진보된 연출 통제:'],
      bullets: ['Crisp 가장자리: 날카로운 단위 가장자리를 위한 화소 이미지 연출을 사용하십시오.', '화소 스냅: 지면, 둥근, 또는 Ceil 화소 줄맞춤.', '퍼 모듈 색상 모드: 고체, 밝기, 위치에 의해, 오버레이, 클러스터에 의해.', '색깔 팔레트: per-module 착색을 위한 주문 색깔 팔레트를 정의하십시오.', '대조 감시: 색깔 사이 최소한도 대조 비율을 지킵니다.', '최소한도 대조 비율: WCAG 작풍 대조 필요조건 (1:1에서 21:1).', '추가 국경 모듈: 조용한 지역을 넘어 추가 경계.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '직업적인 산출 선택권',
      paragraphs: ['기업 수출 조정:'],
      bullets: ['DPI: 인쇄 해상도 설정 (72-600 DPI). 인쇄를 위해 추천되는 300 DPI.', 'Quiet Zone 포함 : 출력 치수의 조용한 영역을 토글.', '추가로 내보내기: 기본 형식과 함께 PDF 생성.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: '애니메이션 설정 (Professional)',
      paragraphs: ['추가 전문 애니메이션 기능:'],
      bullets: ['Temporal Dither: 떨어져, 파란 소음, 또는 Flicker 안전 침투.', '본: 아무도, 맥박, 파, 스플라인, Shimmer, 또는 드리프트 효력.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: '관련 가이드 및 예제 보기', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: '사이트맵 이름 *',
      paragraphs: ['ANQR은 URL 매개 변수를 통해 QR 코드를 생성하는 서버 측 API를 제공합니다. 웹 사이트, 이메일, 문서, 자동화 워크플로우에 QR 코드를 삽입하는 것이 이상적입니다.', '기본 URL: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'QR 예제 보기', type: 'example' }],
    },
    {
      heading: '기본 매개 변수',
      paragraphs: ['필수 및 일반적인 매개 변수 (parameter 이름은 번역되지 않습니다) :'],
      bullets: ['자료 (필수): QR 코드에 인코딩 하는 내용. URL 인코딩 특수 문자.', '크기: 화소 (과태에 있는 이미지 크기: 400, 최대: 2000년). w/h가 지정되지 않는 경우에 사용하는.', 'w, h: 화소에 있는 산출 폭과 고도. Overrides 크기 모수.', '체재: 산출 체재 - png, webp, 또는 gif (과태: png).', 'ec: 과실 개정 수준 - L, M, Q, 또는 H (과태: H).', 'fg: # (과태: 000000) 없이 hex로 지상 색깔.', 'bg: # 없이 hex로 배경 색깔 (과태: ffffffff).', '투명한: 투명한 배경을 위해 1에 놓으십시오.', '마진: 모듈의 Quiet 영역 (기본값: 4).'],
    },
    {
      heading: 'Styling 모수',
      paragraphs: ['단위와 본 스타일링:'],
      bullets: ['스타일: 모듈 스타일 - 사각, 둥근, 점, 다이아몬드, 연결.', '발견자: 찾기 패턴 스타일 - 사각, 둥근, 원형.', '정렬 : 정렬 패턴 스타일 - match_finder, 광장, 라운드, 원형.', '타이밍: 타이밍 패턴 스타일 - match_module, 고체, dashed.', '반경: 코너 반경 비율 0-100.', '간격: 단위 간격 비율 0-50.', '격침: Gap 모드 - none, inset, 치기, negative_space.', '이름 * 외부, eyeInner: 눈 작풍 - 사각, 둥근, 원형.', '눈: 눈 가늠자 비율 (과태: 100).', 'grad: Gradient 유형 - 아무도, 선형, 광선, 콩.', 'gradAngle: 선형 gradients를 위한 기온변화도 각.', 'gradStops : Gradient는 color1,pos1,color2,pos2,... (예 : ff0000,0,0000ff,1)로 중지합니다.'],
    },
    {
      heading: 'Overlay 모수',
      paragraphs: ['이미지 오버레이 옵션 (overlay 이미지는 서버 측 fetched):'],
      bullets: ['img: 오버레이 이미지에 URL (공개적으로 접근 가능).', '모드: 오버레이 모드 - 센터, 하프톤, 블렌드, 밝기, 모자이크, 디더링, 블루노이즈, 서브 픽셀.', '강렬: 오버레이 강렬 0-100 (과태: 100).', '색깔: 백색 모드: 오버레이 색상 모드 - 색상, 그레이 스케일, bw.', '적합 : 오버레이 피팅 - 커버, 포함, 스트레치.', 'rot: 도에 있는 오바레이 교체.', 'flipX, 플립 : 오버레이를 플립 1으로 설정합니다.', '제품 정보 찾기 : 보존 파커 패턴 (과태: 1).', '제품 정보 타이밍, keepAlign : 타이밍 보존 / 정렬 패턴에 1 세트.'],
    },
    {
      heading: 'Preprocessing 모수',
      paragraphs: ['Overlay에 적용된 이미지 전처리:'],
      bullets: ['광도: 조정 100에 -100 (과태: 0).', '대조: 100에 조정 -100 (과태: 0).', '감마: 가치 0.1에서 3 (과태: 1).', '수용 인원: 조정 -100에 100 (과태: 0).', 'hue: 정도에 있는 Hue 교체.', 'blur: 화소에 있는 Blur.', '날카로운: 예리한 총계 0-100.', '포스터: 포스터 수준.', '임계 값: 바이너리 임계 값 0-255.', '가장자리: 가장자리 탐지 - 떨어져, sobel, canny.', 'invert: 1개에서 invert 색깔에 놓으십시오.'],
    },
    {
      heading: 'Watermark 모수',
      paragraphs: ['생성 된 QR 코드에 워터 마크를 추가 :'],
      bullets: ['wmEn: 워터 마크를 활성화하기 위해 1로 설정합니다.', '사이트맵 종류: Watermark 유형 - 원본, 이미지, 본.', 'wmText: 워터마크 텍스트 (URL 인코딩).', 'wmImg: 워터 마크 이미지에 URL.', 'wmPos: 위치 - 센터, 구석, 가장자리, 뒤에, 조용히_zone.', 'wmOpacity: 불투명 0-100 (과태: 50).', 'wmBlend : 혼합 모드 - 정상, 곱, 스크린, 오버레이.'],
    },
    {
      heading: '애니메이션 Parameters',
      paragraphs: ['애니메이션 GIF 출력 ( format=gif 필요) :'],
      bullets: ['이름 * 패턴 : 애니메이션 패턴 - none, 펄스, 파, 스플라인, shimmer, drift, color_cycle.', '이름 * 구조: 구조의 수 1-60 (과태: 24).', '이름 * 속도: 밀리 초에 있는 구조 지연 10-1000 (과태: 100).', '이름 * 씨앗 : 애니메이션을위한 무작위 씨앗.', 'easing: Animation easing - 선형, easy_in, easy_out, easy_in_out, Bounc.'],
    },
    {
      heading: '산출 모수',
      paragraphs: ['산출 체재 선택권:'],
      bullets: ['품질: WebP 질 0-1 (과태: 0.9).', 'webpQ: WebP 질 0-100 (과태: 90).', 'gifColors: GIF 팔레트 크기 2-256 (과태: 256).', 'dpi: PNG를 위한 출력 DPI (과태: 72).', 'metaTitle, metaAuthor, 메타코피, 메타 Desc: PNG 메타데이터 필드.'],
    },
    // Crop Parameters
    {
      heading: '자르기 매개변수',
      paragraphs: ['오버레이 이미지 자르기 옵션:'],
      bullets: ['CropEn: 오버레이 자르기 0/1을 활성화합니다(기본값: 0).', 'CropX: 자르기 중심 X를 분수 0-1로 표시합니다(기본값: 0.5).', 'CropY: 자르기 중심 Y를 분수 0-1로 표시합니다(기본값: 0.5).', 'CropSize: 이미지 0~1의 비율로 자르기 크기(기본값: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: '안전 잠금 매개변수',
      paragraphs: ['오버레이 수정으로부터 보호되는 QR 요소를 제어합니다.'],
      bullets: ['lockF: 잠금 파인더 패턴 0/1(기본값: 1).', 'lockT: 잠금 타이밍 패턴 0/1(기본값: 1)', 'lockA: 정렬 패턴을 0/1로 잠급니다(기본값: 1).', 'lockFmt: 잠금 형식 정보 0/1(기본값: 1).', 'lockV: 잠금 버전 정보 0/1(기본값: 1).', 'safeMode: 안전 모드 - 꺼짐, 균형, 엄격(기본값: 꺼짐).', 'safeMinPx: 최소 모듈 크기(픽셀 단위)(기본값: 2).', 'safeMinQz: 최소 여백 모듈(기본값: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: '자동 튜닝 매개변수',
      paragraphs: ['자동 최적화 설정:'],
      bullets: ['autoVer: QR 버전 0/1을 자동 선택합니다(기본값: 1).', 'autoEcc: ECC 레벨 0/1 자동 선택(기본값: 0) - 서버측 힌트만 해당됩니다.', 'autoReduce: [클라이언트 전용] 스캔할 수 있을 때까지 강도를 자동으로 줄입니다. 스캔 검증 루프가 필요합니다.'],
    },
    // Additional Animation Parameters
    {
      heading: '추가 애니메이션 매개변수',
      paragraphs: ['GIF 출력을 위한 확장된 애니메이션 컨트롤:'],
      bullets: ['loop: 애니메이션이 연속적으로 0/1 반복됩니다(기본값: 1).', '바운스: 탁구 애니메이션 방향 0/1 (기본값: 0).', 'reverse: 애니메이션을 역방향 0/1로 재생합니다(기본값: 0).', 'colorCycle: 색상 순환 효과 0/1을 활성화합니다(기본값: 0).', 'interp: 프레임 보간 - 없음, 크로스페이드, 모프(기본값: 없음).', 'tempDither: 시간적 디더링 - off, blue_noise, flicker_safe (기본값: off).', 'startF: 애니메이션 시작 프레임(기본값: 0).', 'maxF: 렌더링할 최대 프레임(기본값: 0 = 자동).', 'stepF: 프레임 단계 간격(기본값: 1).', '지터: [클라이언트 전용] 픽셀 단위의 모듈 지터 - 프레임당 QR 재생성이 필요합니다.'],
    },
    // Dithering Parameters
    {
      heading: '디더링 매개변수',
      paragraphs: ['오버레이 처리를 위한 디더링 알고리즘 제어:'],
      bullets: ['ditherKind: 디더링 알고리즘 - error_diffusion,order_bayer, blue_noise 등(기본값:order_bayer).', '확산 커널: 오류 확산 커널 - floyd_steinberg, jarvis_judice_ninke, stutu, burkes, sierra, atkinson (기본값: floyd_steinberg).', 'ditherStrength: 디더 강도 0-100(기본값: 50).', 'serpentine: 서펜타인 디더링 0/1 (기본값: 0).', '매트릭스: 순서가 지정된 디더링 매트릭스 - bayer2, bayer4, bayer8 (기본값: bayer4).', 'bnTile: 블루 노이즈 타일 크기(기본값: 64).', 'bnSeed: 블루 노이즈 무작위 시드(기본값: 0).', 'colorDither: 색상 디더링 - 없음, 채널별, 지각적(기본값: 없음).'],
    },
    // Subpixel Parameters
    {
      heading: '하위 픽셀 매개변수',
      paragraphs: ['하위 픽셀 혼합 모드 설정:'],
      bullets: ['spGrid: 하위 픽셀 격자 크기 - 2x2, 3x3, 4x4(기본값: 3x3).', 'spCenter: 중심 규칙 - 엄격, halftone_center(기본값: 엄격).', 'spNeutral: #이 없는 중간색 16진수(기본값: 808080).', 'spFinder: Finder 재정의 - 단색, 양식화(기본값: 단색).'],
    },
    // Halftone Parameters
    {
      heading: '하프톤 매개변수',
      paragraphs: ['하프톤 블렌드 모드 설정:'],
      bullets: ['htCell: 하프톤 셀 크기 - per_module 또는 nxn 그리드(기본값: per_module).', 'htDot: 점 모양 - 원, 사각형, 선(기본값: 원).', 'htCurve: 밝기 곡선 - 선형, S-곡선, 감마(기본값: 선형).', 'duo1: #이 없는 이중톤 그림자 색상 16진수(기본값: 000000).', 'duo2: #이 없는 이중톤 강조 색상 16진수(기본값: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC 인식 모드 매개변수',
      paragraphs: ['오류 수정 용량을 기반으로 한 지능형 오버레이 배포:'],
      bullets: ['eccAware: ECC 인식 모드 0/1을 활성화합니다(기본값: 0).', 'eccRisk: 위험 예산 비율 0-100(기본값: 50)', 'eccMap: 가중치 맵 - distance_to_finders, block_heatmap, empirical_scan_heatmap (기본값: distance_to_finders)'],
    },
    // Frame Parameters
    {
      heading: '프레임 매개변수',
      paragraphs: ['장식 프레임 설정:'],
      bullets: ['프레임: 프레임 스타일 - 없음, rounded_frame, 스티커, 태그(기본값: 없음).', 'FrameText: 프레임에 표시할 텍스트(URL 인코딩됨).'],
    },
    // Per-Module Color Parameters
    {
      heading: '모듈별 색상 매개변수',
      paragraphs: ['개별 모듈 색상 옵션:'],
      bullets: ['modColor: 색상 모드 - solid, by_brightness, by_position, by_overlay, by_cluster (기본값: solid).', 'cGuard: 대비 가드 0/1(기본값: 0).', 'minContrast: 최소 명암비 1-21(기본값: 4.5)', '팔레트: 팔레트 모드를 위한 쉼표로 구분된 16진수 색상입니다.', 'palemode: 팔레트 분포 - 위치, 밝기, 대각선, 방사형, 무작위, 행, 열(기본값: 위치).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF 오버레이 매개변수',
      paragraphs: ['애니메이션 GIF 오버레이 이미지 설정:'],
      bullets: ['ovType: 오버레이 유형 - static, gif, apng, webp_anim, video(기본값: static).', 'ovFramePick: 프레임 선택 - all, Every_n, max_frames, Duration_limit(기본값: all).', 'gifDelays: 원본 GIF 프레임 지연 0/1을 사용합니다(기본값: 1).', 'gifDispH: GIF 처리 처리 - 존중, 단순화(기본값: 존중).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'ECC당 강도 제한',
      paragraphs: ['오류 수정 수준당 최대 오버레이 강도:'],
      bullets: ['maxIntL: ECC L 0-100의 최대 강도(기본값: 100).', 'maxIntM: ECC M 0-100의 최대 강도(기본값: 100).', 'maxIntQ: ECC Q 0~100의 최대 강도(기본값: 100).', 'maxIntH: ECC H 0-100의 최대 강도(기본값: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA 시뮬레이션 매개변수(클라이언트 전용)',
      paragraphs: ['이러한 매개변수는 URL 호환성을 위해 구문 분석되지만 브라우저에서만 작동합니다.'],
      bullets: ['qaContrast: 대비 확인 0/1 활성화 - 대화형 검증이 필요합니다.', 'qaBlur: 픽셀 단위로 흐림 효과를 시뮬레이션합니다. - 대화형 테스트에만 해당됩니다.', 'qaNoise: 소음 수준 시뮬레이션 - 대화형 테스트에만 사용됩니다.', 'qaHeatmap: 가독성 히트맵 표시 0/1 - 캔버스 오버레이 UI가 필요합니다.'],
    },
    // Client-Only Parameters
    {
      heading: '클라이언트 전용 매개변수',
      paragraphs: ['대부분의 API 매개변수는 서버 측에서 완전히 지원됩니다. [CLIENT-ONLY]로 표시된 매개변수는 URL 호환성을 위해 구문 분석되지만 브라우저 기능이 필요합니다.'],
      bullets: ['지터: 모듈 지터에는 무작위로 프레임당 QR 재생성이 필요합니다.', 'autoReduce: 자동 감소 강도에는 반복적인 스캔 테스트가 필요합니다.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: QA 시뮬레이션에는 대화형 캔버스 유효성 검사가 필요합니다.'],
    },
    // Additional Output Parameters
    {
      heading: '추가 출력 매개변수',
      paragraphs: ['확장된 출력 및 내보내기 설정:'],
      bullets: ['fname: 다운로드를 위한 사용자 정의 파일 이름(기본값: anqr-qrcode).', 'inclQz: 출력 차원 0/1에 여백을 포함합니다(기본값: 1).', 'bgOver: # 없이 배경색을 16진수로 재정의합니다(bg 매개변수를 재정의함).', 'fmtExtra: 추가 형식 출력 - 없음, EPS, animation_webp(기본값: 없음). 참고: EPS는 [PARTIAL]입니다.', 'svgPrec: SVG 모양 정밀도 - 픽셀, 정밀(기본값: 픽셀). [일부] 서버 측 SVG 출력이 제한되었습니다.', 'svgEmbed: SVG 0/1에 래스터 오버레이를 포함합니다(기본값: 1). [일부] 서버 측 SVG 출력이 제한되었습니다.', 'modulePx: 모듈 픽셀 크기(기본값: 크기에서 자동 계산됨)', 'border: Quiet Zone 너머의 추가 경계 모듈(기본값: 0)', '선명함: 선명하고 픽셀화된 이미지 렌더링 0/1을 활성화합니다(기본값: 1).', '스냅: 픽셀 스냅 모드 - 바닥, 원형, 천장(기본값: 바닥).'],
    },
    // Pattern Preservation Parameters
    {
      heading: '패턴 보존 매개변수',
      paragraphs: ['오버레이로부터 보호되는 구조 요소를 제어합니다.'],
      bullets: ['keepFinders: 파인더 패턴을 0/1로 유지합니다(기본값: 1).', 'keepTiming: 타이밍 패턴을 0/1로 유지합니다(기본값: 0).', 'keepAlign: 정렬 패턴을 0/1로 유지합니다(기본값: 0).', 'protectedFmt: 형식 정보 모듈을 0/1로 보호합니다(기본값: 0).', 'protectedVer: 버전 정보 모듈을 0/1로 보호합니다(기본값: 0).'],
    },
    {
      heading: '예 사용',
      paragraphs: ['기본 QR 코드:', 'https://anqr.link/api/qr?data=https://example.com', '사용자 정의 색상과 스타일 QR 코드 :', 'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30', '오버레이 이미지를 가진 QR 부호:', 'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70', '애니메이션 GIF:', 'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'QR 예제 보기', type: 'example' }],
    },
    {
      heading: 'QR 코드',
      paragraphs: ['Professional 모드에서 Share feature는 embeddable HTML과 URL을 생성합니다. 여기에 embedding 작품은 다음과 같습니다:'],
      bullets: ['링크 공유: URL 매개 변수로 인코딩된 모든 설정과 ANQR 앱에 URL을 생성합니다. QR 코드를 보고 수정할 수 있습니다.', 'Embed Image: 서버 API에 <img> 태그 포팅을 생성한다. QR 코드는 서버 측을 렌더링하고 이미지로 제공됩니다.', 'Embed Markdown: 문서 및 README 파일을 위한 Markdown 이미지 구문 생성.', '직접 API URL: 응용 프로그램, 스크립트, 기타 통합에서 사용하기위한 Raw API URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
    {
      heading: 'HTML 예제',
      paragraphs: ['웹 사이트에서 QR 코드를 삽입하려면:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="QR Code" />', '대답하는 sizing를 위해:', '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400"alt="QR Code" style="max-width: 100%; 고도: 자동차;" />', '서버 캐시는 긴 캐시 헤더와 응답을 캐시하므로 동일한 URL에 대한 반복 된 요청은 빠릅니다.'],
    },
    {
      heading: 'URL 형식을 공유',
      paragraphs: ['Professional 모드에서 공유를 클릭하면 ANQR은 현재 URL 매개 변수로 설정을 인코딩합니다. 형식은:', 'https://anqr.link/?data=...&ec=H&style=rounded&....', '이 매개 변수는 API 매개 변수를 미러링, 그래서 당신은 / api / qr의 기본 경로 변경하여 API URL에 공유 URL을 변환하고 w / h 매개 변수를 조정 할 수 있습니다.', '참고 : 로컬 파일에서 업로드 된 오버레이 이미지는 URL을 통해 공유 할 수 없습니다 - URL 기반 오버레이 (img 매개 변수) 공유 링크 및 API 호출에서 작동합니다.'],
    },
    {
      heading: '비율 한계 및 사용법',
      paragraphs: ['API는 합리적인 볼륨을 무료로 사용할 수 있습니다. 보장된 가동 시간을 요구하는 높은 볼륨 사용법 또는 상업적인 신청을 위해, 저희에게 연락하십시오.', 'API 응답은 공격적인 캐싱 우두머리를 포함합니다. 최고의 성능을 위해, 당신의 끝에 캐시 응답 또는 동일한 URL을 지속적으로 사용 동일한 QR 코드.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: '최고의 연습',
      paragraphs: ['신뢰할 수있는 QR 코드에 대한 이러한 지침을 따르십시오'],
      bullets: ['항상 인쇄하기 전에 여러 스캐너 앱으로 QR 코드를 테스트합니다.', '오버레이를 추가할 때 오류 수정 H (High)를 사용하십시오.', '조용한 영역 (margin)의 최소 4 모듈을 유지하십시오.', '전경과 배경 사이 높은 대조를 지킵니다.', '인쇄를 위해, 적어도 300 DPI를 사용하고 실제적인 인쇄 크기에 시험하십시오.', '오버레이를 사용할 때 Enable Preserve Finder Patterns.', '더 낮은 오버레이 강도와 증가로 시작.', '옥외 사용을 위해, 더 큰 단위 크기 및 더 높은 과실 개정을 고려하십시오.'],
      links: [
        { href: '/learn?lang=${lang}', label: '자주 묻는 질문', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'QR 예제 보기', type: 'example' },
      ],
    },
    {
      heading: '문제 해결',
      paragraphs: ['일반적인 문제 및 해결책:'],
      bullets: ['QR는 검사하지 않을 것입니다: 과감한 강도, 증가 오류 보정, 체크 대비.', '코드 너무 크: 콘텐츠 길이 감소, URL 단축기를 사용, 낮은 버전.', 'Blurry 산출: 모듈 크기를 증가, 압축 형식 대신 PNG를 사용합니다.', '색상은 잘못 : 색상 대비를 확인, 그레이 스케일 오버레이 모드를 시도.', 'GIF는 다음과 같습니다 : GIF 형식 출력을 사용하여 프레임 수를 확인합니다.', '이미지 overlay는 적재하지 않습니다: 원격 이미지에서 CORS 권한 확인.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: '관련 가이드 및 예제 보기', type: 'learn' }],
    },
    {
      heading: '키보드 단축키',
      paragraphs: ['ANQR은 표준 키보드 단축키를 지원합니다. Ctrl/Cmd+S를 사용하여 수출을 트리거합니다.'],
    },
    {
      heading: '공유 및 Embedding',
      paragraphs: ['Professional 모드에서는 현재 설정으로 URL을 복사하려면 공유 버튼을 클릭하십시오. Recipients는 이 URL을 열어 정확한 구성을 볼 수 있습니다. 참고: 로컬 파일에서 오버레이 이미지는 URL을 통해 공유할 수 없습니다.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'ANQR 발전기에서 직접 이 윤곽을보십시오.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: '자주 묻는 질문', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'QR 예제 보기', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'QR 예제 보기', type: 'gallery' },
    { href: '/?lang=${lang}', label: '발전기 열기', type: 'generator' },
  ],
};

export default guide;
