import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: '개인 정보 보호 정책',
  description: '정보 ANQR 수집, 사용 방법, 적용 가능한 개인 정보 보호법에 따라 귀하의 권리.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: '서비스 약관', type: 'external' }],
  sections: [
    {
      heading: '제품정보',
      paragraphs: [
        'ANQR은 클라이언트 첫번째 접근법을 가진 QR 부호 발전기입니다. 계정을 만들 필요가 없습니다. 기본적으로 QR 코드는 브라우저에서 로컬로 생성됩니다 - 우리는 당신이 인코딩에 액세스하지 않습니다.',
        '전문 용도를 위해 ANQR은 URL 매개 변수에서 QR 코드를 생성하는 서버 측 API를 제공합니다. API를 사용할 때, QR 콘텐츠는 이미지를 렌더링하기 위해 서버에서 처리되지만 저장되거나 로그되지 않습니다.',
        'Google AdSense를 사용하여 광고 및 분석 서비스를 사용할 수 있습니다. 이 서비스는 쿠키 및 유사한 기술을 통해 정보를 수집합니다. 이 정책은 데이터 수집, 사용 방법 및 귀하의 권리를 설명합니다.',
      ],
    },
    {
      heading: '자주 묻는 질문',
      bullets: [
        '당신이 제공하는 정보: 이메일 또는 우리의 연락처 양식을 통해 저희에게 연락하는 경우, 우리는 당신의 이름, 이메일 주소 및 메시지 내용을 수집합니다.',
        '자동 수집된 정보: 호스팅 제공 업체 (Netlify), 광고 파트너 및 분석 서비스는 수집 할 수 있습니다 : IP 주소, 브라우저 유형 및 버전, 운영 체제, 장치 유형, 참조 URL, 페이지 방문, 사이트 시간 및 지리적 위치.',
        '제3자 쿠키: Google 광고 파트너 (Google AdSense)는 쿠키 및 유사한 기술을 사용하여 광고를 게재하고 측정합니다. ANQR 자체는 첫 번째 파티 쿠키를 설정하지 않습니다.',
      ],
    },
    {
      heading: '쿠키 및 타사 기술',
      paragraphs: [
        'ANQR은 첫 번째 파티 쿠키를 설정하지 않습니다. 당신의 선호도 (짙은 모드와 같은)는 어떤 서버에 전송되지 않는 장치에서 로컬로 저장됩니다.',
        '그러나, 우리의 광고 파트너 (Google AdSense) 및 호스팅 제공 업체는 쿠키 및 유사한 추적 기술을 사용할 수 있습니다 :',
      ],
      bullets: [
        '광고 쿠키 (third-party): Google AdSense 및 광고 파트너가 관련 광고를 게재하고 광고 성능을 측정하고 사용자의 관심사를 이해합니다. 이 쿠키는 다른 웹 사이트에서 귀하의 활동을 추적 할 수 있습니다.',
        'Analytics 쿠키(third-party): 우리의 호스팅 제공 업체 또는 분석 서비스에 의해 사용할 수 있습니다 익명 사용 데이터 수집.',
      ],
    },
    {
      heading: 'Google 애드 센스 및 광고',
      paragraphs: [
        'Google AdSense를 통해 광고를 표시합니다. Google 및 파트너는이 사이트 및 기타 웹 사이트에 대한 검색 기록을 기반으로 광고를 제공하기 위해 쿠키를 사용합니다 (interest 기반 광고).',
        'Google이 귀하의 정보를 어떻게 사용하는지 알아보기: https://policies.google.com/technologies/partner-sites',
        '광고 개인화 관리: https://adssettings.google.com',
        '네트워크 광고 이니셔티브를 통해 차단: https://optout.networkadvertising.org',
        '디지털 광고 동맹을 통해 Opt: https://optout.aboutads.info',
      ],
    },
    {
      heading: '자주 묻는 질문',
      bullets: [
        '문의에 응답하고 지원을 제공합니다.',
        '광고 파트너를 통해 관련 광고를 표시하려면.',
        '사이트 사용을 분석하고 우리의 서비스를 향상시킵니다.',
        '탐지, 예방 및 사기, 남용 및 보안 문제 해결.',
        '법적 의무 준수.',
      ],
    },
    {
      heading: '제3자 서비스',
      bullets: [
        'Google AdSense : 광고를 게재하고 측정하는 데이터를 수신합니다.',
        'Analytics 공급자: 익명의 사용 데이터를 수신합니다.',
        'Netlify (호스팅): 프로세스 요청 및 IP 주소를 로그 할 수 있습니다.',
        '개인정보를 판매하지 않습니다. 그러나 광고 파트너와 데이터 공유는 CCPA (아래 참조)의 "판매"로 간주됩니다.',
      ],
    },
    {
      heading: '데이터 보유',
      bullets: [
        '연락처 제출 : 최대 2 년.',
        '서버 로그: 최대 30 일 (호스팅 제공 업체).',
        'Analytics 데이터: 최대 26개월(혼합).',
        '광고 쿠키: 일반적으로 13 개월 (파트너에 의해 다름).',
      ],
    },
    {
      heading: 'GDPR (EEA 사용자)의 권리',
      paragraphs: [
        '유럽 경제 지역에 있다면 일반 데이터 보호 규정에 따라 다음과 같은 권리가 있습니다',
      ],
      bullets: [
        '접근의 권리: 개인 정보의 복사본을 요청하여 당사에 대해 파악합니다.',
        '수정에 권리: inaccurate 데이터의 요청 수정.',
        '지우기: 귀하의 데이터의 삭제 요청 ( "잊혀질 것").',
        '처리 제한 권리: 귀하의 데이터를 사용하는 방법에 대한 제한을 요청합니다.',
        '자료 portability에 권리: 휴대용 형식으로 데이터를 요청하십시오.',
        '대상에 권리: 직접 마케팅을 포함하여 처리하는 개체.',
        '동의를 철회하는 권리: 처리가 가능한 한 언제든지 철회 동의.',
        '불만을 제기 할 권리 : 데이터 보호 기관에 불만을 제기하십시오.',
      ],
    },
    {
      heading: 'GDPR 법적 근거',
      paragraphs: [
        '우리는 이러한 기초에 데이터를 처리 : (a) 일관성 - 개인화 광고 (우리의 광고 파트너에 의해 관리); (b) 분석, 보안 및 개선을위한 법적 관심 -; (c) 계약 - 문의에 응답하기.',
        '귀하의 권리를 행사하려면 email@anqr.link에 문의하십시오. 우리는 30 일 안에 반응합니다.',
      ],
    },
    {
      heading: 'CCPA (California 사용자)의 권리',
      bullets: [
        '알고 있는 권리: 수집, 소스, 목적, 제3자에 대한 정보 요청.',
        '삭제할 권리: 개인 정보 취급 방침.',
        'Opt-out에 권리: 개인 정보의 "판매"에서 옵트 (광고 파트너와 함께 제공받을 수 있음).',
        'Non-discrimination에 권리: 우리는 당신의 권리를 행사하지 않습니다.',
      ],
    },
    {
      heading: 'CCPA 범주 수집',
      paragraphs: [
        '카테고리: Identifiers (IP 주소, 장치 ID), 인터넷 활동 (브라우저, 광고 상호 작용), Geolocation (대략), Inferences (브라우저에서 클립).',
        '운동 권리 또는 선택 : email@anqr.link 또는 쿠키 설정을 조정할 수 있습니다.',
      ],
    },
    {
      heading: '국제 송금',
      paragraphs: [
        '귀하의 정보는 미국을 포함한 다른 데이터 보호법과 국가로 전송될 수 있습니다. Standard Contractual Clauses와 같은 적절한 보호 기능을 사용합니다.',
      ],
    },
    {
      heading: '아이들의 개인 정보 보호',
      paragraphs: [
        'ANQR은 13세 미만의 어린이(EEA에서 16세)를 감독하지 않습니다. 우리는 아이들에서 데이터를 수집하지 않습니다. 연락 email@anqr.link 당신이 아이가 정보를 제공 한 경우.',
      ],
    },
    {
      heading: '계정 관리',
      paragraphs: [
        '우리는 HTTPS 암호화를 포함한 데이터를 보호하기 위해 적절한 기술 및 조직 조치를 사용합니다. 그러나 인터넷 전송은 100 % 안전합니다.',
      ],
    },
    {
      heading: '트랙 없음',
      paragraphs: [
        '광고 파트너가 DNT에 반응하지 않을 수 있지만 브라우저 신호를 추적하지 않습니다.',
      ],
    },
    {
      heading: '이 정책 변경',
      paragraphs: [
        '우리는이 정책을 정기적으로 업데이트 할 수 있습니다. "마지막 업데이트"일은 가장 최근의 개정을 나타냅니다. Significant 변경은 사이트 배너를 통해 통신 할 수 있습니다.',
      ],
    },
    {
      heading: '제품 정보',
      paragraphs: [
        '개인 정보 보호 질문 또는 귀하의 권리를 행사하려면: email@anqr.link 또는 우리의 연락처 페이지를 사용. 우리는 30 일 이내에 개인 정보 보호 요청에 응답합니다.',
      ],
    },
    {
      heading: '전체 개인 정보 보호 정책',
      paragraphs: [
        '이 페이지에는 당사의 개인정보 보호 관행이 요약되어 있습니다. GDPR, CCPA 및 기타 개인 정보 보호법에 따른 데이터 처리, 귀하의 권리 및 의무에 대한 전체 세부 정보가 포함된 완전하고 법적 구속력이 있는 개인 정보 보호 정책을 보려면 iubenda에서 호스팅하는 전체 정책을 확인하세요.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'iubenda에서 전체 개인정보 보호정책 보기',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
