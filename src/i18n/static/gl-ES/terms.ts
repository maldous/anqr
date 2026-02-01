import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Condicións de servizo',
  description: 'Ao acceder ou usar o sitio, aceptas estar obrigado por estes termos.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Política de privacidade', type: 'external' }],
  sections: [
    {
      heading: 'Aceptación de termos',
      paragraphs: ['Ao acceder ou usar ANQR (anqr.link), aceptas estar obrigado por estas Condicións de servizo e pola nosa Política de privacidade. Se non acepta estes termos, non use o sitio.', 'Podemos actualizar estas Condicións de cando en vez. O uso continuado do sitio despois dos cambios supón a aceptación das novas condicións.'],
    },
    {
      heading: 'Elixibilidade',
      paragraphs: ['Debes ter polo menos 13 anos para usar ANQR. Ao usar o sitio, declaras que cumpre con este requisito de idade. Se tes menos de 18 anos, declaras que tes o permiso do teu pai ou titor para usar o sitio.'],
    },
    {
      heading: 'Uso permitido',
      paragraphs: ['Podes usar ANQR só para fins lícitos. Vostede é o único responsable do contido que codifica en códigos QR e de como utiliza os códigos QR que xera.'],
    },
    {
      heading: 'Condutas prohibidas',
      paragraphs: ['Vostede acepta non:'],
      bullets: ['Use ANQR para crear códigos QR que faciliten phishing, distribución de malware, fraude, estafas, acoso, difamación ou calquera actividade ilegal.', 'Codifica contido que infrinxe os dereitos de propiedade intelectual, infrinxe a privacidade ou contén material ilegal.', 'Intentar interromper, sobrecargar ou interferir co funcionamento ou a seguridade do sitio.', 'Realice enxeñería inversa, descompile ou intente extraer o código fonte do sitio.', 'Use ferramentas automatizadas (bots, scrapers) para acceder ao sitio de forma que degrade o rendemento doutros usuarios.', 'Eludir ou desactivar calquera función de seguridade ou control de acceso.', 'Suplantar a identidade de calquera persoa ou entidade ou terxiversar a súa afiliación.'],
    },
    {
      heading: 'Propiedade intelectual',
      paragraphs: ['Conservas a propiedade do contido que codificas en códigos QR. ANQR non reclama a propiedade dos teus datos.', 'O nome, o logotipo, o deseño da interface e o código subxacente de ANQR están protexidos por dereitos de autor, marcas comerciais e outras leis de propiedade intelectual. Non pode copiar, modificar, distribuír ou crear obras derivadas sen o noso permiso.', 'QR Code® é unha marca rexistrada de DENSO WAVE INCORPORATED. ANQR non está afiliado a DENSO WAVE.'],
    },
    {
      heading: 'Licenza de contido de usuario',
      paragraphs: ['Ao usar ANQR, non nos concedes dereitos sobre o teu contido. Ao usar a xeración local (o predeterminado), toda a xeración de códigos QR ocorre no teu navegador e non accedemos, almacenamos nin transmitimos os teus datos codificados.', 'Cando se utiliza a API do servidor, o seu contido procédese para xerar a imaxe QR, pero non se almacena, rexistra nin se usa para ningún outro propósito ademais de renderizar a imaxe solicitada.'],
    },
    {
      heading: 'Servizos de terceiros e publicidade',
      paragraphs: ['O sitio mostra anuncios a través de Google AdSense e pode incluír ligazóns a sitios web de terceiros. Non somos responsables do contido, servizos ou prácticas de privacidade de terceiros.', 'As túas interaccións cos anunciantes e terceiros son só entre ti e eles. Consulte a nosa Política de privacidade para obter información sobre as prácticas de datos publicitarios.'],
    },
    {
      heading: 'Exención de garantías',
      paragraphs: ['O ANQR PROPORCIÓNSE "TAL CUAL" E "SEGÚN ESTÁ DISPONIBLE" SEN GARANTÍAS DE NINGÚN TIPO, EXPRESAS OU IMPLÍCITAS, INCLUÍDAS E NON LIMITADAS A GARANTÍAS IMPLÍCITAS DE COMERCIABILIDADE, IDONEIDADE PARA UN FIN PARTICULAR E NON INFRACCIÓN.', 'Non garantimos que: (a) o sitio será ininterrompido, seguro ou libre de erros; (b) Os códigos QR escanearanse en todos os ambientes, en todos os dispositivos ou con todas as aplicacións de escáner; (c) o sitio cumprirá os seus requisitos.', 'Sempre debes probar os códigos QR nas condicións nas que se utilizarán (tamaño de impresión, iluminación, tipo de pantalla, distancia, calidade da cámara).'],
    },
    {
      heading: 'Limitación de responsabilidade',
      paragraphs: ['NA MEDIDA MÁXIMA PERMITIDA POLA LEI, ANQR E OS SEUS OPERADORES, AFILIADOS E LICITADORES NON SERÁN RESPONSABLES DE NINGÚN DANOS DIRECTOS, INDIRECTOS, ACCIDENTALES, ESPECIAIS, CONSECUENTES, PUNITIVOS OU EXEMPLARS, INCLUÍDOS OS DANOS E PERDAS LIMITADAS POR DANOS. FONDO DE VOLUNTAD, USO OU OUTRAS PERDAS INTANXIBLES, DERIVADAS DO SEU ACCESO OU USO DO SEU SERVIZO OU RELACIONADAS COA (OU A INHABILIDADE DE ACCESO OU USO) DO SERVIZO.', 'ENTENDE E ACEPTA EXPRESAMENTE QUE O SEU USO DO SERVIZO CORRE O SEU RISCO. O SERVIZO PROPORCIONASE DE FORMA GRATUÍTA E, EN CONSEGUIO, ACEPTA QUE ANQR E OS SEUS OPERADORES NON TERÁN RESPONSABILIDADE ANTE TI POR NINGÚN DANO OU PERDA. EN NINGÚN CASO A NOSA RESPONSABILIDADE TOTAL AGREGADA SUPERARÁ A CERO DÓLARES ($0 AUD).', 'ACEPTA LIBERAR, RENUNCIAR E DESCARGAR TODAS E TODAS LAS RECLAMACIONS, DEMANDAS E CAUSAS DE ACCIÓN CONTRA ANQR E OS SEUS OPERADORES DERIVADAS DO USO DO SERVIZO.', 'ALGUNHAS XURISDICCIÓNS NON PERMITEN A EXCLUSIÓN DE CERTAS GARANTÍAS OU LIMITACIÓNS DE RESPONSABILIDADE. NESTAS XURISDICCIÓNS, A NOSA RESPONSABILIDADE SERÁ LIMITADA AO MÁXIMO MEDIO PERMITIDO POLA LEI APLICABLE.'],
    },
    {
      heading: 'Indemnización',
      paragraphs: ['Vostede acepta indemnizar, defender e eximir a ANQR, os seus operadores, afiliados e os seus respectivos oficiais, directores, empregados e axentes de calquera reclamación, dano, perda, responsabilidade, custo e gasto (incluídos os gastos legais) derivados de: (a) o seu uso do sitio; (b) a súa violación destas Condicións; (c) a súa violación dos dereitos de terceiros; (d) calquera contido que codifique en códigos QR.'],
    },
    {
      heading: 'Resolución de disputas',
      paragraphs: ['Calquera disputa derivada destas Condicións ou do seu uso de ANQR intentarase resolver primeiro mediante unha negociación informal contactando con correo electrónico@anqr.link.', 'Se a resolución informal falla, as disputas resolveranse mediante arbitraxe vinculante en Victoria (Australia), excepto que calquera das partes pode solicitar unha medida cautelar ante os tribunais por violacións da propiedade intelectual.'],
    },
    {
      heading: 'Exención de acción colectiva',
      paragraphs: ['NA MEDIDA QUE O PERMITA A LEI, USTED ACEPTA QUE CALQUERA PROCEDEMENTO DE RESOLUCIÓN DE DISPUTAS SE REALIZARÁ SÓ A BASE INDIVIDUAL E NON NUNHA ACCIÓN CLAVE, CONSOLIDADA OU REPRESENTATIVA.'],
    },
    {
      heading: 'Lei vixente',
      paragraphs: ['Estas Condicións réxense polas leis de Victoria, Australia, sen ter en conta os principios de conflito de leis. Vostede acepta a xurisdición exclusiva dos tribunais situados en Victoria, Australia.'],
    },
    {
      heading: 'Cambios e dispoñibilidade',
      paragraphs: ['Podemos modificar, suspender ou descontinuar o sitio (ou calquera parte del) en calquera momento sen previo aviso nin responsabilidade.', 'Podemos actualizar estas Condicións en calquera momento. A data de "Última actualización" indica cando se revisaron máis recentemente. O uso continuado despois dos cambios supón aceptación.'],
    },
    {
      heading: 'Divisibilidade',
      paragraphs: ['Se algunha disposición destas Condicións se considera inválida ou inaplicable, esa disposición aplicarase na medida en que se permita, e as disposicións restantes permanecerán en pleno vigor e efecto.'],
    },
    {
      heading: 'Renuncia',
      paragraphs: ['O incumprimento de calquera dereito ou disposición destes Termos non se considerará unha renuncia a tal dereito ou disposición.'],
    },
    {
      heading: 'Todo o acordo',
      paragraphs: ['Estes Termos, xunto coa nosa Política de privacidade, constitúen o acordo completo entre vostede e ANQR sobre o seu uso do sitio e substitúen calquera acordo anterior.'],
    },
    {
      heading: 'Forza maior',
      paragraphs: ['Non seremos responsables de ningún fallo ou atraso no rendemento debido a circunstancias alleas ao noso control razoable, incluídos desastres naturais, guerras, terrorismo, disturbios, accións gobernamentais ou fallas de internet ou de infraestrutura.'],
    },
    {
      heading: 'Contacto',
      paragraphs: ['As preguntas sobre estes Termos pódense enviar a: email@anqr.link'],
    },
  ],
};

export default terms;
