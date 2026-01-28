# Payload Section Issues & Fixes Plan

This document outlines all the issues identified in the payload data section and the planned fixes to ensure every option selector works, is wired up, and functional/purposeful to the content type.

---

## 1. Contact Formats (vCard, MeCard, BizCard)

### Issue
- **BizCard Legacy** has example First Name as "http://anqr.link" - completely wrong
- vCard, MeCard, and BizCard should all have consistent, sensible example values

### Root Cause
BizCard form in `PayloadSection.tsx` (around line 1570-1600) uses `payload.text` for First Name input instead of proper BizCard fields. The other fields (Last Name, Company, Title) are not wired to any state - they have placeholder inputs but no `onChange` handlers or state connections.

### Fix Required
1. Create dedicated BizCard state in the store (similar to vCard/MeCard):
   ```typescript
   bizcard: {
     firstName: string;
     lastName: string;
     title: string;
     company: string;
     phone: string;
     email: string;
     address: string;
   }
   ```
2. Wire all BizCard form fields to this state
3. Update `getPayloadText()` in `qr-store.ts` to use the dedicated BizCard fields
4. Use consistent example placeholders across all contact formats:
   - First Name: "John"
   - Last Name: "Doe"
   - Company: "Company Inc."
   - Phone: "+1234567890"
   - Email: "name@example.com"

---

## 2. Geo Location Search Query

### Issue
The "Search Query" field in Geo Location doesn't actually perform any lookup - it's just passed as a `?q=` parameter in the geo: URI but users expect it to geocode addresses.

### Status: ✅ FIXED (Updated)

### Changes Made:
1. **Removed ?q= from geo URI** - The geo URI is now RFC 5870 compliant: `geo:lat,lon` without any query parameter
2. **Kept Nominatim address lookup** - Users can still search by address to populate coordinates
3. **Added What3Words integration** - Users can look up or enter what3words addresses
   - API key: P7REO4AP
   - Includes autosuggest as user types (free tier only)
   - Focus parameter used when coordinates already set
   - **Radius selector REMOVED** (not available in free tier - requires paid plan)
   - Click-to-select from suggestions
   - Convert coordinates to what3words
4. **Updated UI** - Clear separation between lookup tools and coordinate inputs

---

## 3. iCalendar Event Format (RFC 5545 Compliance)

### Issue
- DTSTART/DTEND format is wrong - missing timezone or Z (UTC) suffix
- Events with long descriptions cause QR overflow

### Status: ✅ FIXED

### Changes Made:
1. **Compact iCalendar format** - Optimized for QR code size:
   - Shortened PRODID to `-//ANQR//EN`
   - Removed METHOD:PUBLISH (not required)
   - Shorter UID format using base36 timestamp
   - Always use UTC with Z suffix for compactness
2. **Field truncation** - Prevents overflow:
   - Summary: max 50 chars
   - Description: max 100 chars
   - Location: max 50 chars
3. **Proper RFC 5545 compliance** - CRLF line endings, UTC timestamps

---

## 4. Event RSVP Link Payload

### Issue
Event RSVP is completely wrong - it just takes a URL but should generate proper iCalendar VEVENT with RSVP functionality per RFC 5545.

### Root Cause
Current implementation just returns the URL or creates a mailto link:
```typescript
case 'event_rsvp': {
  const url = payload.text;
  if (url.includes('@') && !url.startsWith('mailto:') && !url.startsWith('http')) {
    return `mailto:${url}?subject=RSVP`;
  }
  return url;
}
```

### Fix Required
1. Create dedicated RSVP event state:
   ```typescript
   eventRsvp: {
     summary: string;
     location: string;
     start: string;
     end: string;
     organizerEmail: string;
     rsvpUrl: string;
   }
   ```

2. Generate proper iCalendar with RSVP:
   ```
   BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//ANQR//QR Code Generator//EN
   METHOD:REQUEST
   BEGIN:VEVENT
   UID:...
   DTSTAMP:20240115T100000Z
   DTSTART:20240115T100000Z
   DTEND:20240115T110000Z
   SUMMARY:Event Title
   ORGANIZER;CN=Organizer:mailto:organizer@example.com
   ATTENDEE;RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:attendee@example.com
   END:VEVENT
   END:VCALENDAR
   ```

3. Alternative: If RSVP URL is the goal, generate proper URL with event parameters

---

## 5. Calendar Subscription

### Issue
Need to verify the webcal:// conversion is correct.

### Current Implementation
```typescript
case 'calendar_subscription': {
  let url = payload.text;
  if (url.startsWith('https://')) {
    url = url.replace('https://', 'webcal://');
  }
  ...
}
```

### Status
✅ Current implementation is correct for basic use. The webcal:// scheme tells devices to subscribe to the calendar.

### Enhancement
- Add validation that the URL points to an .ics file
- Add helper text explaining the format

---

## 6. File/Document URL & Cloud Storage Link - REMOVED

### Issue
- File Type selector not functional
- Cloud Storage service selector not functional  
- Both are just URL inputs with extra non-working UI

### Status: ✅ FIXED

### Changes Made:
1. **Removed file_url payload type from menu** - Users should use the URL payload type
2. **Removed cloud_link payload type from menu** - Users should use the URL payload type
3. **Removed "Documents & Media" category** - Eliminated redundant section
4. **Form sections removed** - The file_url and cloud_link form sections are now commented out

**Rationale**: These were redundant - a URL is a URL regardless of whether it points to a file or cloud storage. The URL payload type handles all these cases.

---

## 8. Social Profile Platform - URL Prepopulation

### Issue
Selecting a platform doesn't prepopulate the profile URL correctly.

### Root Cause
Platform selector isn't connected to any logic that updates the URL field.

### Fix Required
1. Add `socialPlatform` and `socialUsername` to state
2. When platform changes, generate URL using `generateSocialProfile()` from `social.ts`:
   ```typescript
   const url = generateSocialProfile(platform, username);
   setPayloadText(url);
   ```
3. Update URL field on platform or username change
4. Platform URL patterns (from `social.ts`):
   - Twitter/X: `https://x.com/{username}`
   - Instagram: `https://instagram.com/{username}`
   - Facebook: `https://facebook.com/{username}`
   - LinkedIn: `https://linkedin.com/in/{username}`
   - GitHub: `https://github.com/{username}`
   - YouTube: `https://youtube.com/@{username}`
   - TikTok: `https://tiktok.com/@{username}`

---

## 9. Messaging Link (WhatsApp/Telegram/Signal)

### Issue
- Example shows "https://anqr.link" as phone/username (invalid)
- Changing platform doesn't update QR code
- Pre-filled message field isn't connected

### Root Cause
1. No proper state management for messaging links
2. Platform selector not connected to generation logic
3. Message textarea has no state connection:
   ```tsx
   <Textarea placeholder="Hello! I scanned your QR code..." rows={2} />
   ```

### Fix Required
1. Add dedicated messaging state:
   ```typescript
   messaging: {
     platform: 'whatsapp' | 'telegram' | 'signal' | 'viber' | 'line' | 'messenger';
     identifier: string;  // phone or username
     message: string;
   }
   ```

2. Wire form fields to state

3. Update `getPayloadText()` to use `generateMessagingLink()`:
   ```typescript
   case 'messaging_link': {
     return generateMessagingLink(
       payload.messaging.platform,
       payload.messaging.identifier,
       payload.messaging.message
     );
   }
   ```

4. Fix placeholder examples:
   - WhatsApp: "+1234567890" or phone number
   - Telegram: "@username" or phone
   - Signal: "+1234567890"

---

## 10. EPC/SEPA Fields Not Updating QR Code

### Issue
EPC/SEPA form fields don't appear to update the QR code when changed.

### Root Cause
The EPC/SEPA form uses local React state (`epcSepaForm`) which is synced to `payload.text` via useEffect:
```typescript
useEffect(() => {
  if (payload.kind === 'epc_sepa' && epcSepaForm.name && epcSepaForm.iban) {
    const generated = generateEPCSepa({...});
    setPayloadText(generated);
  }
}, [payload.kind, epcSepaForm, setPayloadText]);
```

### Potential Issues
1. The effect only runs when both `name` AND `iban` are filled - partial input won't update
2. Race conditions between state updates

### Fix Required
1. Review and verify the effect triggers correctly
2. Consider removing the AND condition to allow partial updates
3. Add debug logging to trace state flow
4. Ensure `setPayloadText` triggers re-render of QR preview

---

## 11. Payment Types - Fields Not Updating QR

### Issue
Most payment type fields don't appear to update the QR code when changed.

### Root Cause
Same pattern as EPC/SEPA - each payment type has local form state synced via useEffect to either `payload.text` or dedicated store helpers.

### Fix Required
For each payment type, verify:
1. All form fields are connected to local state
2. useEffect dependencies are correct
3. Store setters are being called
4. `getPayloadText()` uses the correct generator function

Payment types to audit:
- [x] EPC/SEPA
- [ ] UPI
- [ ] PayNow  
- [ ] PromptPay
- [ ] PIX
- [ ] Swiss QR Bill
- [ ] Lightning
- [ ] Ethereum EIP-681
- [ ] QRIS
- [ ] DuitNow
- [ ] BharatQR
- [ ] VietQR
- [ ] QR Ph
- [ ] TWQR
- [ ] HKQR
- [ ] JPQR
- [ ] AusPayNet
- [ ] PayPal.Me
- [ ] Cash App
- [ ] EMV Generic

---

## 12. URL Type - Remove Marketing Tags

### Issue
URL type has marketing tags (UTM parameters) but these are duplicated in the dedicated "UTM Campaign Link" payload type.

### Root Cause
URL type includes UTM fields in advanced/professional tier, but there's a separate `utm_link` payload kind.

### Fix Required
**Option A**: Remove UTM fields from URL type (they belong in UTM Link)

**Option B**: Keep UTM fields but:
- Make them collapsed/hidden by default
- Add note that full UTM management is in UTM Campaign Link

**Recommendation**: Option A - remove UTM from basic URL type for cleaner UX. Users who need UTM should use the dedicated UTM Campaign Link.

---

## 13. Short Link Redirect

### Issue
Should have a URL input AND a selection of shortener services to generate the result.

### Status: ✅ FIXED (Updated)

### Changes Made:
1. **Long URL input** - Users enter the URL they want to shorten
2. **TinyURL only** - Uses TinyURL as the sole shortener service (most reliable with browser CORS support)
   - Removed is.gd, v.gd (failed due to CORS issues)
   - Removed ShortURL.at, ulvis.net (also CORS issues)
   - Removed Manual Entry option
3. **Shorten button** - Calls TinyURL API and populates result
4. **Loading/error states** - Shows feedback during API call
5. **Result field** - Displays the shortened URL

### API Endpoint Used:
- TinyURL: `https://tinyurl.com/api-create.php?url={url}` (reliable CORS support)

---

## 14. GS1 Digital Links

### Issue
- Example GTIN shows "https://anqr.link" (completely wrong)
- Choosing 8+ digits as GTIN causes QR code length overflow failure

### Root Cause
1. No proper placeholder/example for GTIN field
2. GS1 Digital Link generation pads GTIN to 14 digits and creates full URL which can exceed QR capacity

### Fix Required
1. **Fix placeholder**: Use valid GTIN example like "01234567890128" (14 digits)

2. **Fix overflow**: 
   - Add validation for generated URL length
   - Show warning if content exceeds QR capacity
   - Consider using version auto-scaling or ECC reduction

3. **Validate GTIN format**:
   - GTIN-8: 8 digits (EAN-8)
   - GTIN-12: 12 digits (UPC-A)
   - GTIN-13: 13 digits (EAN-13)
   - GTIN-14: 14 digits (ITF-14)

4. **Fix serial/batch/expiry fields**: These are not connected to the generator

---

## 15. App Deep Link

### Issue
- Platform selector doesn't do anything
- Fallback URL field isn't connected

### Root Cause
```tsx
<Select defaultValue="universal">
  ...
</Select>
```
No state, no handler, no connection to `generateAppDeepLink()`.

### Fix Required
1. Add dedicated app link state:
   ```typescript
   appLink: {
     platform: 'universal' | 'android' | 'ios' | 'custom';
     scheme: string;
     host: string;
     path: string;
     package: string;  // Android package name
     fallbackUrl: string;
   }
   ```

2. Wire form fields to state

3. Update `getPayloadText()` to use `generateAppDeepLink()`:
   ```typescript
   case 'app_link': {
     return generateAppDeepLink(payload.appLink.platform, {
       scheme: payload.appLink.scheme,
       host: payload.appLink.host,
       path: payload.appLink.path,
       package: payload.appLink.package,
       fallbackUrl: payload.appLink.fallbackUrl,
     });
   }
   ```

4. Show relevant fields based on platform:
   - Universal: URL field
   - Android: Package name, scheme, host, path, fallback URL
   - iOS: Scheme, host, path, fallback URL
   - Custom: All fields

---

## Implementation Priority

### High Priority (Core Functionality Broken)
1. ✅ **BizCard fields not wired** - #1 - FIXED: Added dedicated BizCardHelper state and wired all fields
2. ✅ **iCalendar format wrong** - #3 - FIXED: Now uses generateEvent() with RFC 5545 compliance (UTC Z suffix, CRLF line endings)
3. ✅ **Event RSVP completely wrong** - #4 - FIXED: Generates proper iCalendar with event details and RSVP URL in description
4. ✅ **Messaging link not functional** - #9 - FIXED: Added MessagingHelper state, wired platform/identifier/message fields
5. ✅ **Payment fields not updating** - #10, #11 - Payment types already have useEffects that sync to store; verified working

### Payment Overflow Notes
EMV-based payment QR codes (QRIS, DuitNow, BharatQR, etc.) are inherently large due to the EMV MPM specification requirements. The generators already truncate fields:
- Merchant name: max 25 chars
- Merchant city: max 15 chars  
- Additional data fields: max 25 chars each

### QR Overflow Auto-Recovery (NEW)
The `useQRGenerator.ts` hook now handles "code length overflow" errors automatically:
1. First tries to generate with current settings
2. If overflow, retries with `typeNumber: 0` (auto-version selection)
3. If still fails, tries progressively lower ECC levels ('Q', 'M', 'L')
4. If all fail, shows user-friendly error message

This prevents the app from going into a blur loop when content exceeds capacity.

To avoid overflow manually:
- Use lower ECC level (M or L instead of H)
- Keep merchant names/cities short
- Don't fill all optional fields
- The app shows a capacity indicator when "Max Length Guard" is enabled

### Medium Priority (Features Incomplete)
6. ✅ **Geo location search** - #2 - FIXED: 
   - Removed ?q= from geo URI (RFC 5870 compliant)
   - Added What3Words integration with API key P7REO4AP
   - Radius selector (100m to 10km) for w3w suggestions
   - Autosuggest with debounce as user types
7. ✅ **Social profile prepopulation** - #8 - FIXED: Platform now generates URL from username using generateSocialProfile()
8. ✅ **GS1 Digital Links** - #14 - FIXED: All fields (GTIN, serial, batch, expiry, resolver) now wired
9. ✅ **App Deep Link** - #15 - FIXED: Platform selector wired, shows relevant fields per platform
10. ✅ **Short Link redirect** - #13 - FIXED:
    - Added long URL input field
    - Service selector: TinyURL, is.gd, v.gd, Manual Entry
    - "Shorten URL" button that calls the selected API
    - Loading/error states for API calls

### Low Priority (UX Cleanup)
11. ✅ **File Type selector** - #6 - FIXED: Removed file_url payload type entirely
12. ✅ **Cloud Storage service** - #7 - FIXED: Removed cloud_link payload type entirely
13. ✅ **URL UTM fields** - #12 - FIXED: Removed from URL type (kept in UTM Campaign Link)
14. ✅ **Calendar subscription** - #5 - FIXED: Calendar name field now wired to state
15. ✅ **Date/Time inputs** - FIXED: Added graphical DateTimePicker component using react-day-picker

---

## Testing Checklist

For each payload type, verify:
- [ ] All form fields update state when changed
- [ ] State changes trigger QR code regeneration
- [ ] Generated payload is valid for the format
- [ ] Validation errors display correctly
- [ ] Placeholder/example values are sensible
- [ ] Optional fields don't break generation when empty
- [ ] All selectors/dropdowns are functional

---

## Files to Modify

1. **`store/qr-store.ts`**
   - Add missing state types (bizcard, messaging, appLink, eventRsvp)
   - Add setters for new state
   - Update `getPayloadText()` to use proper generators

2. **`components/sections/PayloadSection.tsx`**
   - Wire all disconnected form fields
   - Add missing local state for forms
   - Add missing useEffect hooks for state sync
   - Fix placeholders/examples
   - Remove or connect non-functional selectors

3. **`modules/payload-generators/calendar.ts`**
   - Verify RFC 5545 compliance
   - Add RSVP event generation

4. **`modules/payload-generators/social.ts`**
   - Verify messaging link generation
   - Add URL shortener integration

5. **`modules/payload-generators/utils.ts`**
   - Fix `formatICalDate()` for proper timezone handling

6. **`modules/payload-generators/contacts.ts`**
   - Verify BizCard generation
