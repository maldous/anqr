import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: '서비스 약관',
  description: '사이트에 액세스하거나 사용하는 경우, 이 약관에 동의하는 것입니다.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: '개인 정보 보호 정책', type: 'external' }],
  sections: [
    {
      heading: '이용 약관',
      paragraphs: ['ANQR(anqr.link)를 이용하거나 이용함으로써 귀하는 이러한 서비스 약관 및 개인 정보 보호 정책에 동의하게 됩니다. 이 약관에 동의하지 않으면 사이트를 사용하지 마십시오.', '이 약관을 수시로 업데이트할 수 있습니다. 변경 후 사이트의 계속 사용은 새로운 용어의 수용을 구성합니다.'],
    },
    {
      heading: '자격',
      paragraphs: ['ANQR을 사용하려면 최소 13세 이상이어야 합니다. 사이트를 사용함으로써, 당신은이 나이 요구 사항을 충족한다는 것을 나타냅니다. 18세 미만이면 부모 또는 보호자의 허가가 있는 것을 나타냅니다.'],
    },
    {
      heading: '관련 상품',
      paragraphs: ['법률 목적으로 ANQR을 사용할 수 있습니다. QR코드를 인코딩하고 QR코드를 생성할 수 있는 컨텐츠에 대해서만 책임집니다.'],
    },
    {
      heading: '금지된 행위',
      paragraphs: ['당신은 동의하지 않습니다 :'],
      bullets: ['ANQR을 사용하여 피싱, 악성 코드 배포, 사기, 사기, harasssment, 편향, 또는 불법 행위를 촉진하는 QR 코드를 만듭니다.', '지적 재산 권리를 침해하는 콘텐츠, 개인 정보를 침해하거나 불법 자료를 포함.', '중단, 과부하, 또는 사이트의 운영 또는 보안과 방해.', '역 엔지니어, decompile, 또는 사이트에서 소스 코드를 추출하려고.', '자동화된 도구(봇, 스크랩)를 사용하여 다른 사용자의 성능 향상을 위한 방식으로 사이트에 액세스할 수 있습니다.', 'Circumvent 또는 보안 또는 액세스 제어 기능 비활성화.', '어떤 사람이나 단체 또는 비공식적 인 경우.'],
    },
    {
      heading: '지적 재산',
      paragraphs: ['QR코드로 인코딩된 콘텐츠의 소유권을 유지합니다. ANQR은 귀하의 데이터의 소유권을 주장하지 않습니다.', 'ANQR 이름, 로고, 인터페이스 디자인 및 underlying 코드는 저작권, 상표 및 기타 지적 재산권법에 의해 보호됩니다. 당신은 복사, 수정, 배포, 또는 우리의 허가없이 파생 작품을 만들 수 없습니다.', 'QR Code®는 DENSO WAVE INCORPORATED의 등록 상표입니다. ANQR은 DENSO WAVE와 제휴하지 않습니다.'],
    },
    {
      heading: '비밀번호',
      paragraphs: ['ANQR을 사용함으로써, 당신은 당신의 내용에 대한 권리를 부여합니다. 로컬 생성을 사용할 때 (기본값), 모든 QR 코드 생성은 브라우저에서 발생하며, 액세스, 저장 또는 인코딩된 데이터를 전송하지 않습니다.', '서버 측 API를 사용할 때, 귀하의 콘텐츠는 QR 이미지를 생성하기 위해 처리되지만, 로그, 또는 요청한 이미지를 렌더링하는 다른 목적으로 사용되지 않습니다.'],
    },
    {
      heading: '제3자 서비스 및 광고',
      paragraphs: ['Google AdSense를 통해 사이트에 광고를 표시하고 타사 웹 사이트에 링크가 포함될 수 있습니다. 우리는 제 3 자 콘텐츠, 서비스, 또는 개인 정보 보호 관행에 대해 책임을지지 않습니다.', '광고주와 제3자와의 상호 작용은 귀하와 그 사이에만 있습니다. 광고 데이터 관행에 대한 정보의 우리의 개인 정보 보호 정책을 참조하십시오.'],
    },
    {
      heading: '책임의 부인',
      paragraphs: ['ANQR은 "AS IS"와 "AS AVAILABLE" BASIS는 어떤 KIND, EXPRESS 또는 IMPLIED, INCLUDING BUT의 보증을 포함하지 않고, MERCHANTABILITY의 보증, 일부 PURPOSE 및 NON-INFRINGEMENT에 대한 FITNESS.', '우리는 그것을 보증하지 않습니다 : (a) 사이트는 모든 장치 또는 모든 스캐너 응용 프로그램에서 모든 환경, (c), 또는 모든 스캐너 응용 프로그램으로 모든 환경에서 검사됩니다; (c) 사이트가 요구 사항을 충족 할 것입니다.', '항상 사용되는 조건에서 QR 코드를 테스트해야합니다 (인쇄 크기, 조명, 화면 유형, 거리, 카메라 품질).'],
    },
    {
      heading: '책임의 한계',
      paragraphs: ['TOWER, ANQR 및 ITS OPERATORS, AFFILIATES 및 LICENSORS SHALL에 의해 제한되지 않은 경우, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, 제한되지 않은 BUT을 사용할 수 있습니다.', '귀하는 서비스 이용이 귀하의 사기에 있음을 명시하고 있습니다. 이 서비스는 무료로 제한되어 있으며, 제한적으로, 당신은 ANQR 및 ITS OPERATORS SHALL이 아니 LIABILITY가 없습니다. IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY EXCEED ZERO DOLLARS ($0 AUD).', '귀하는 재량, WAIVE, 그리고 다른 모든 CLAIMS, DEMANDS, 그리고 ACTION AGAINST ANQR 및 ITS OPERATORS 서비스의 사용을 평가하는 것에 동의합니다.', 'SOME JURISDICTIONS는 인증서의 면제 또는 책임의 제한이 없습니다. SUCH JURISDICTIONS에서, 우리의 책임은 APPLICABLE LAW에 의해 제한되는 MAXIMUM 우수한에.'],
    },
    {
      heading: '회사연혁',
      paragraphs: ['귀하는 본 약관의 위반, 손해, 손해, 손실, 책임, 비용 및 비용 (법적 요금 포함)에서 발생하는 모든 청구, 손해, 손해, 손실, 책임, 비용 및 비용 (법적 비용 포함)의 위반에 대해 indemnify, 방어 및 보유에 동의합니다. (b) 본 약관의 위반; (c) 귀하의 위반; (d) QR 코드에 인코딩 된 내용.'],
    },
    {
      heading: '분쟁 해결',
      paragraphs: ['이 약관 또는 ANQR의 사용으로 인해 발생하는 모든 분쟁은 email@anqr.link에 연락하여 통보 협상을 통해 해결 될 것입니다.', '비공식적 인 해상도가 실패하면 분쟁은 빅토리아, 호주의 바인딩 중재를 통해 해결되어야하며, 당사자는 지적 재산 위반에 대한 법원의 부정적 구호를 구할 수 있습니다.'],
    },
    {
      heading: '클래스 액션 면제',
      paragraphs: ['LAW에 의해 제한 될 때, 당신은 어떤 분쟁 해결을 보장 할 필요가 없습니다.'],
    },
    {
      heading: '준거법',
      paragraphs: ['본 약관은 법률 원칙의 충돌없이 빅토리아, 호주의 법률에 따라 적용됩니다. 당신은 빅토리아에 위치한 법원의 독점적 관할권에 동의, 호주.'],
    },
    {
      heading: '변경 및 가용성',
      paragraphs: ['우리는 수정할 수 있습니다, suspend, 또는 사이트 중단 (또는 그 중 일부) 통지 또는 책임없이.', '이 약관을 언제든지 업데이트 할 수 있습니다. "마지막 업데이트"일은 가장 최근 개정되었을 때 나타냅니다. 변경 후 계속 사용은 수락을 구성합니다.'],
    },
    {
      heading: '관련 상품',
      paragraphs: ['이 약관의 조항이 유효하지 않거나 시행되지 않은 경우, 해당 조항은 최대 허용 범위에 따라 시행되며 나머지 조항은 전체 전력 및 효과에 남아 있습니다.'],
    },
    {
      heading: '언어 선택',
      paragraphs: ['본 약관의 모든 권리 또는 제공에 대한 우리의 실패는 그러한 권리 또는 제공의 면제를 거부하지 않습니다.'],
    },
    {
      heading: '전체 계약',
      paragraphs: ['본 약관은 당사 개인 정보 보호 정책과 함께 귀하와 ANQR 사이의 전체 계약을 구성하고 사이트 사용에 대한 모든 사전 동의를 요약합니다.'],
    },
    {
      heading: '힘 majeure',
      paragraphs: ['우리는 자연 재해, 전쟁, 테러, riots, 정부 행동, 또는 인터넷 / 인프라 실패를 포함하여 우리의 합리적인 통제를 넘어 상황에 따라 실패 또는 지연에 대해 책임을지지 않습니다.'],
    },
    {
      heading: '제품정보',
      paragraphs: ['이 약관에 대한 질문은 보내질 수 있습니다 : email@anqr.link'],
    },
  ],
};

export default terms;
