# Share Links Module

URL parameter handling, embed code generation, and social sharing.

## Purpose

This module handles QR code sharing functionality:
- URL parameter parsing and serialization
- Shareable URL building and length checks
- Embed code generation (HTML, iframe, markdown, BBCode)
- Social share URL building

## Dependencies

None - pure URL/string manipulation.

## Public API

### URL Parameters

```typescript
import { 
  buildUrlParams, 
  parseUrlParams, 
  getShareableUrl,
  checkShareUrlLength,
  updateBrowserUrl 
} from '@/modules/share-links';
import type { ShareConfig } from '@/modules/share-links';

// Build URL from config
const params = buildUrlParams(qrConfig);
const url = getShareableUrl(qrConfig);

// Parse URL back to config
const config = parseUrlParams(url);

// Check URL length
const { ok, length } = checkShareUrlLength(url);

// Update browser URL without reload
updateBrowserUrl(qrConfig);
```

### Embed Code Generation

```typescript
import { 
  generateImageEmbed, 
  generateIframeEmbed, 
  generateMarkdownEmbed,
  generateBBCodeEmbed,
  convertToImageApiUrl 
} from '@/modules/share-links';
import type { EmbedOptions } from '@/modules/share-links';

const options: EmbedOptions = {
  width: 256,
  height: 256,
  alt: 'QR Code',
};

const html = generateImageEmbed(url, options);
const iframe = generateIframeEmbed(url, options);
const markdown = generateMarkdownEmbed(url, options);
const bbcode = generateBBCodeEmbed(url, options);

// Convert app URL to image API URL
const imageApiUrl = convertToImageApiUrl(shareUrl);
```

### Social Sharing

```typescript
import { getSocialShareUrls } from '@/modules/share-links';

const shareUrls = getSocialShareUrls(shareUrl, {
  title: 'My QR Code',
  description: 'Scan to visit my website',
});

console.log(shareUrls.twitter);
console.log(shareUrls.facebook);
console.log(shareUrls.linkedin);
console.log(shareUrls.email);
```

## Examples

### Create Shareable Link

```typescript
import { getShareableUrl, checkShareUrlLength, MAX_SHARE_URL_LENGTH } from '@/modules/share-links';

function createShareLink(config: QRConfig) {
  const url = getShareableUrl(config);
  const { ok, length } = checkShareUrlLength(url);
  
  if (!ok) {
    console.warn(`URL too long: ${length} > ${MAX_SHARE_URL_LENGTH}`);
  }
  
  return url;
}
```

### Generate Embed Code for Website

```typescript
import { convertToImageApiUrl, generateImageEmbed } from '@/modules/share-links';

function getEmbedCode(shareUrl: string) {
  const imageUrl = convertToImageApiUrl(shareUrl);
  
  return generateImageEmbed(imageUrl, {
    width: 200,
    height: 200,
    alt: 'QR Code',
  });
}
// Output: <img src="https://anqr.link/qr?..." width="200" height="200" alt="QR Code" />
```

### Share to Social Media

```typescript
import { getSocialShareUrls } from '@/modules/share-links';

function openTwitterShare(qrUrl: string) {
  const urls = getSocialShareUrls(qrUrl, {
    title: 'Check out my QR code!',
  });
  
  window.open(urls.twitter, '_blank');
}
```
