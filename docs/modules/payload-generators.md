# Payload Generators Module

Payload string generators for all QR code data types.

## Purpose

This module generates properly formatted payload strings for QR codes:

- Basic types: URL, text, phone, email, SMS, WiFi, geo
- Contact formats: vCard, MeCard, BizCard
- Calendar events
- Payment systems: EMV QR, UPI, PIX, PayNow, PromptPay, etc.
- Cryptocurrency: Bitcoin, Ethereum, Lightning
- Authentication: OTP/TOTP
- Social/Messaging links

## Dependencies

None - pure string formatting.

## Public API

### Core Generators

```typescript
import {
  generateUrl,
  generateEmail,
  generateSms,
  generateTel,
  generateWifi,
  generateGeo,
} from '@/modules/payload-generators';

const url = generateUrl('https://example.com', { utm: { source: 'qr' } });
const email = generateEmail('hello@example.com', { subject: 'Hello', body: 'Hi there' });
const sms = generateSms('+1234567890', { body: 'Hello!' });
const tel = generateTel('+1234567890');
const wifi = generateWifi({ ssid: 'MyNetwork', password: 'secret', security: 'WPA' });
const geo = generateGeo({ lat: 37.7749, lon: -122.4194 });
```

### Contact Generators

```typescript
import { generateVCard, generateMeCard, generateBizCard } from '@/modules/payload-generators';

const vcard = generateVCard({
  name: 'John Doe',
  org: 'ACME Inc',
  tel: '+1234567890',
  email: 'john@example.com',
});

const mecard = generateMeCard({ name: 'John Doe', tel: '+1234567890' });
const bizcard = generateBizCard({ name: 'John Doe', company: 'ACME Inc' });
```

### Calendar Events

```typescript
import { generateEvent, generateCalendarSubscription } from '@/modules/payload-generators';

const event = generateEvent({
  summary: 'Meeting',
  start: new Date('2024-01-15T10:00:00'),
  end: new Date('2024-01-15T11:00:00'),
  location: 'Office',
});

const subscription = generateCalendarSubscription('https://example.com/calendar.ics');
```

### Payment Generators

```typescript
import {
  generateUPI,
  generatePIX,
  generatePayNow,
  generateEMVMPM,
} from '@/modules/payload-generators';

const upi = generateUPI({ pa: 'user@upi', pn: 'User Name', am: '100' });
const pix = generatePIX({ key: 'email@example.com', amount: 100 });
const paynow = generatePayNow({ uen: '123456789A', amount: 50 });
const emv = generateEMVMPM({ merchantId: '1234', amount: '100.00', currency: '840' });
```

### Cryptocurrency

```typescript
import {
  generateCrypto,
  generateLightning,
  generateEthereumEIP681,
} from '@/modules/payload-generators';

const btc = generateCrypto('bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', { amount: '0.001' });
const lightning = generateLightning('lnbc1...');
const eth = generateEthereumEIP681({ address: '0x...', value: '1000000000000000000' });
```

### Authentication

```typescript
import { generateOTPAuth } from '@/modules/payload-generators';

const totp = generateOTPAuth({
  type: 'totp',
  issuer: 'ACME',
  account: 'user@example.com',
  secret: 'JBSWY3DPEHPK3PXP',
});
```

### EMV QR Builder

```typescript
import { EMVQRBuilder } from '@/modules/payload-generators';

const builder = new EMVQRBuilder();
builder.setMerchantName('My Store');
builder.setAmount('100.00');
builder.setCurrency('USD');
const qrString = builder.build();
```

## Examples

### Generate WiFi QR Code Payload

```typescript
import { generateWifi } from '@/modules/payload-generators';

const payload = generateWifi({
  ssid: 'Guest Network',
  password: 'welcome123',
  security: 'WPA',
  hidden: false,
});
// WIFI:T:WPA;S:Guest Network;P:welcome123;;
```

### Generate Payment QR

```typescript
import { generateUPI } from '@/modules/payload-generators';

const payload = generateUPI({
  pa: 'merchant@upi',
  pn: 'Merchant Name',
  am: '500.00',
  cu: 'INR',
  tn: 'Payment for order #123',
});
```
