import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contact Us',
  description: 'We welcome feedback, bug reports, feature requests, and general enquiries.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'How to reach us',
      paragraphs: ['We offer several ways to contact us depending on your needs. We read every message, though response times may vary based on volume and enquiry type.'],
    },
    {
      heading: 'Email',
      paragraphs: ['For all enquiries: email@anqr.link', 'This is the most reliable way to reach us and is recommended for detailed questions, business enquiries, or any other enquiries.'],
    },
    {
      heading: 'Types of enquiries',
      bullets: ['General questions: Questions about how to use ANQR, feature explanations, or general feedback.', 'Bug reports: Please include your browser, operating system, steps to reproduce, and any error messages you see.', 'Feature requests: Suggestions for new features or improvements. We consider all requests though we cannot promise implementation.', 'Business enquiries: Partnership opportunities, licensing questions, or commercial use enquiries.', 'Privacy requests: Requests to exercise your privacy rights under GDPR, CCPA, or other privacy laws (see Privacy Policy).', 'DMCA/Copyright: See the DMCA section below for takedown notice requirements.'],
    },
    {
      heading: 'Response times',
      paragraphs: ['We aim to respond to enquiries within 5-7 business days. Privacy-related requests will be addressed within 30 days as required by law.', 'During busy periods, response times may be longer. For urgent matters, please indicate "URGENT" in your subject line.'],
    },
    {
      heading: 'Before contacting us',
      paragraphs: ['Please check our Documentation page for answers to common questions about how to use ANQR features. Many questions about QR code generation, styling, and export options are covered there.'],
    },
    {
      heading: 'DMCA Copyright Notices',
      paragraphs: ['If you believe that content available on ANQR infringes your copyright, you may submit a Digital Millennium Copyright Act (DMCA) takedown notice. To be valid, your notice must include:'],
      bullets: ['A physical or electronic signature of the copyright owner or authorised agent.', 'Identification of the copyrighted work claimed to have been infringed.', 'Identification of the material that is claimed to be infringing, with information sufficient to locate it.', 'Your contact information (address, telephone number, and email address).', 'A statement that you have a good faith belief that use of the material is not authorised by the copyright owner.', 'A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorised to act on their behalf.'],
    },
    {
      heading: 'DMCA Contact',
      paragraphs: ['Send DMCA notices to: email@anqr.link', 'Please include "DMCA Notice" in the subject line. We will respond to valid notices in accordance with applicable law. Note that ANQR generates QR codes locally on users devices and does not host user-generated content.'],
    },
    {
      heading: 'Reddit Community',
      paragraphs: ['Join our Reddit community at r/ANQR to share your QR creations, ask questions, get help, and connect with other ANQR users.'],
    },
  ],
};

export default contact;
