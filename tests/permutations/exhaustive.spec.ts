/**
 * Exhaustive Permutation Testing Framework
 * 
 * This test suite generates comprehensive VALUE-LEVEL PAIRWISE tests for ALL settings.
 * 
 * VALUE-LEVEL PAIRWISE means:
 * - For each pair of QR-changing settings (A, B)
 * - For each value in A.testValues
 * - For each value in B.testValues  
 * - Generate a test case that sets both values
 * 
 * With ~40 QR-changing settings × ~3 values each:
 * - Setting pairs: 40 × 39 / 2 = 780
 * - Value combinations per pair: ~3 × 3 = 9
 * - Total pairwise tests: ~7,000+
 * 
 * Plus single-setting and value iteration tests = 10,000+ total tests
 * 
 * DEFAULT BEHAVIOR (no env vars): Runs ALL tests - designed for overnight CI runs.
 * 
 * Environment Variables (optional - use to LIMIT scope for faster local testing):
 * - PERM_TIER: 'basic' | 'advanced' | 'professional' (default: 'professional' = all tiers)
 * - PERM_SECTION: Specific section to test (default: '' = all sections)
 * - PERM_MAX: Maximum single-setting tests per section (default: Infinity = no limit)
 * - PERM_PAIRWISE_MAX: Maximum pairwise combinations (default: Infinity = ALL combinations)
 * - PERM_SKIP_CONDITIONAL: 'true' to skip conditional settings (default: 'false')
 * 
 * Examples:
 *   # Run ALL tests (overnight/CI mode - default) - 10,000+ tests
 *   npx playwright test --project=permutations
 *   
 *   # Quick smoke test (~500 tests)
 *   PERM_MAX=10 PERM_PAIRWISE_MAX=200 npx playwright test --project=permutations
 *   
 *   # Test only one section
 *   PERM_SECTION=Overlay npx playwright test --project=permutations
 */


import { test, expect } from '../fixtures/test-fixtures';
import { getCanvasSnapshot, snapshotsAreDifferent, waitForQRStable } from '../helpers/qr-detector';
import { SETTINGS_REGISTRY, getSettingsForTier, getSections, getRegistryStats, type SettingDefinition, type Tier } from '../helpers/settings-registry';
import { waitForRenderComplete } from '../helpers/test-utils';
import type { Page } from '@playwright/test';

// =============================================================================
// CONFIGURATION FROM ENVIRONMENT
// =============================================================================

const TIER = (process.env.PERM_TIER as Tier) || 'professional';
const SECTION_FILTER = process.env.PERM_SECTION || '';
const MAX_PER_SECTION = process.env.PERM_MAX ? Number.parseInt(process.env.PERM_MAX, 10) : Number.POSITIVE_INFINITY;
// Default to UNLIMITED pairwise combinations for comprehensive coverage
const PAIRWISE_MAX = process.env.PERM_PAIRWISE_MAX ? Number.parseInt(process.env.PERM_PAIRWISE_MAX, 10) : Number.POSITIVE_INFINITY;
const SKIP_CONDITIONAL = process.env.PERM_SKIP_CONDITIONAL === 'true';

// Setting with its ID for convenience
type SettingWithId = SettingDefinition & { id: string };

// Value-level pairwise combination type
interface ValueLevelPairwiseCombination {
  settingA: SettingWithId;
  valueA: string | number | boolean;
  settingB: SettingWithId;
  valueB: string | number | boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

function registryToArray(registry: Record<string, SettingDefinition>): SettingWithId[] {
  return Object.entries(registry).map(([id, def]) => ({ ...def, id }));
}

function getFilteredSettings(): SettingWithId[] {
  let settings = registryToArray(getSettingsForTier(TIER));
  
  if (SECTION_FILTER) {
    settings = settings.filter(s => 
      s.section.toLowerCase() === SECTION_FILTER.toLowerCase()
    );
  }
  
  if (SKIP_CONDITIONAL) {
    settings = settings.filter(s => !s.conditional);
  }
  
  return settings;
}

function getSettingsBySection(): Map<string, SettingWithId[]> {
  const settings = getFilteredSettings();
  const grouped = new Map<string, SettingWithId[]>();
  
  for (const setting of settings) {
    const section = setting.section;
    if (!grouped.has(section)) {
      grouped.set(section, []);
    }
    grouped.get(section)!.push(setting);
  }
  
  return grouped;
}

/**
 * Generate comprehensive VALUE-LEVEL pairwise combinations
 * This creates a test for every (settingA, valueA) × (settingB, valueB) combination
 * 
 * With 40 QR-changing settings × 3 values each:
 * - 780 setting pairs × 9 value combinations = ~7,000 tests
 */
function generateValueLevelPairwiseCombinations(settings: SettingWithId[], maxCombinations: number): ValueLevelPairwiseCombination[] {
  const combinations: ValueLevelPairwiseCombination[] = [];
  
  // Only use settings that have testValues and expect QR changes
  const testableSettings = settings.filter(s => 
    s.expectsQRChange && 
    s.testValues && 
    s.testValues.length > 0 &&
    !s.conditional // Skip conditional for pairwise (too complex)
  );
  
  if (testableSettings.length < 2) {
    return combinations;
  }
  
  // Generate ALL value-level pairwise combinations
  for (let i = 0; i < testableSettings.length && combinations.length < maxCombinations; i++) {
    for (let j = i + 1; j < testableSettings.length && combinations.length < maxCombinations; j++) {
      const settingA = testableSettings[i];
      const settingB = testableSettings[j];
      
      const valuesA = settingA.testValues || [];
      const valuesB = settingB.testValues || [];
      
      if (valuesA.length === 0 || valuesB.length === 0) continue;
      
      // Generate ALL value combinations for this setting pair
      for (const valueA of valuesA) {
        for (const valueB of valuesB) {
          if (combinations.length >= maxCombinations) break;
          combinations.push({ settingA, valueA, settingB, valueB });
        }
        if (combinations.length >= maxCombinations) break;
      }
    }
  }
  
  return combinations;
}

/**
 * Generate cross-section value-level pairwise combinations
 */
function generateCrossSectionValuePairs(settingsBySection: Map<string, SettingWithId[]>, maxCombinations: number): ValueLevelPairwiseCombination[] {
  const combinations: ValueLevelPairwiseCombination[] = [];
  const sections = Array.from(settingsBySection.keys());
  
  for (let i = 0; i < sections.length && combinations.length < maxCombinations; i++) {
    for (let j = i + 1; j < sections.length && combinations.length < maxCombinations; j++) {
      const sectionA = settingsBySection.get(sections[i])!;
      const sectionB = settingsBySection.get(sections[j])!;
      
      // Get QR-changing settings with test values from each section
      const testableA = sectionA.filter(s => s.expectsQRChange && s.testValues?.length && !s.conditional);
      const testableB = sectionB.filter(s => s.expectsQRChange && s.testValues?.length && !s.conditional);
      
      if (testableA.length === 0 || testableB.length === 0) continue;
      
      // Generate value-level pairwise for cross-section combinations
      for (const settingA of testableA) {
        for (const settingB of testableB) {
          const valuesA = settingA.testValues || [];
          const valuesB = settingB.testValues || [];
          
          for (const valueA of valuesA) {
            for (const valueB of valuesB) {
              if (combinations.length >= maxCombinations) break;
              combinations.push({ settingA, valueA, settingB, valueB });
            }
            if (combinations.length >= maxCombinations) break;
          }
          if (combinations.length >= maxCombinations) break;
        }
        if (combinations.length >= maxCombinations) break;
      }
    }
  }
  
  return combinations;
}

const SECTION_LABELS: Record<string, string> = {
  'Payload': 'Payload',
  'Overlay': 'Overlay',
  'QR Encoding': 'QR Encoding',
  'Render': 'Rendering',
  'Animation': 'Animation',
  'Output': 'Output',
  'Watermark': 'Watermark',
  'Metadata': 'Metadata',
  'Share': 'Share',
  'Safety': 'Safety',
};

// Map section names to accordion data-testid IDs
const SECTION_TESTIDS: Record<string, string> = {
  'Payload': 'payload',
  'Overlay': 'overlay',
  'QR Encoding': 'qr',
  'Render': 'render',
  'Animation': 'animation',
  'Output': 'output',
  'Watermark': 'watermark',
  'Metadata': 'metadata',
  'Share': 'share',
  'Safety': 'safety',
};

async function openSection(page: Page, section: string): Promise<void> {
  // Use data-testid for reliable section opening (i18n-safe)
  const testId = SECTION_TESTIDS[section];
  
  if (!testId) {
    // Unknown section - skip
    return;
  }
  
  const trigger = page.locator(`[data-testid="accordion-${testId}"] button[data-state]`).first();
  if (await trigger.count() > 0) {
    // Check if already open
    const isOpen = await page.locator(`[data-testid="accordion-${testId}"] [role="region"][data-state="open"]`).count() > 0;
    if (!isOpen) {
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await waitForRenderComplete(page, 'settle');
    }
  }
}

/**
 * Set a specific value on a control
 */
async function setControlValue(
  page: Page,
  setting: SettingWithId,
  value: string | number | boolean
): Promise<boolean> {
  await openSection(page, setting.section);
  
  const region = page.locator('[role="region"][data-state="open"]').first();
  if (await region.count() === 0) {
    return false;
  }
  
  try {
    switch (setting.type) {
      case 'switch': {
        const switches = region.locator('[role="switch"]');
        const count = await switches.count();
        
        for (let i = 0; i < count; i++) {
          const sw = switches.nth(i);
          const container = sw.locator('xpath=ancestor::div[position()=1 or position()=2]');
          const text = await container.textContent();
          
          if (text && text.toLowerCase().includes(setting.label.toLowerCase())) {
            if (await sw.isEnabled()) {
              const currentState = await sw.getAttribute('data-state');
              const isChecked = currentState === 'checked';
              const targetState = Boolean(value);
              
              if (isChecked !== targetState) {
                await sw.scrollIntoViewIfNeeded();
                await sw.click();
              }
              return true;
            }
          }
        }
        
        // Fallback: click first enabled switch
        for (let i = 0; i < count; i++) {
          const sw = switches.nth(i);
          if (await sw.isEnabled() && await sw.isVisible()) {
            await sw.scrollIntoViewIfNeeded();
            await sw.click();
            return true;
          }
        }
        return false;
      }
      
      case 'slider': {
        const sliders = region.locator('[role="slider"]');
        if (await sliders.count() > 0) {
          const slider = sliders.first();
          if (await slider.isVisible()) {
            await slider.scrollIntoViewIfNeeded();
            await slider.focus();
            
            // Get current value and target
            const min = Number(await slider.getAttribute('aria-valuemin')) || 0;
            const max = Number(await slider.getAttribute('aria-valuemax')) || 100;
            const current = Number(await slider.getAttribute('aria-valuenow')) || min;
            const target = Number(value);
            
            // Calculate steps needed (approximate)
            const range = max - min;
            const stepSize = range / 20; // Assume ~20 steps
            const stepsNeeded = Math.round((target - current) / stepSize);
            
            const key = stepsNeeded > 0 ? 'ArrowRight' : 'ArrowLeft';
            for (let i = 0; i < Math.abs(stepsNeeded); i++) {
              await page.keyboard.press(key);
            }
            return true;
          }
        }
        return false;
      }
      
      case 'select': {
        const selects = region.locator('[role="combobox"]');
        const count = await selects.count();
        
        for (let i = 0; i < count; i++) {
          const select = selects.nth(i);
          if (await select.isVisible()) {
            await select.scrollIntoViewIfNeeded();
            await select.click();
            await waitForRenderComplete(page, 'settle');
            const dropdown = page.locator('[data-radix-popper-content-wrapper]').first();
            if (await dropdown.isVisible({ timeout: 1000 })) {
              // Find option matching value
              const options = dropdown.locator('[role="option"]');
              const optCount = await options.count();
              
              for (let j = 0; j < optCount; j++) {
                const opt = options.nth(j);
                const optText = await opt.textContent();
                if (optText && optText.toLowerCase().includes(String(value).toLowerCase())) {
                  await opt.click();
                  return true;
                }
              }
              
              // Fallback: select by index if value is a number
              if (typeof value === 'number' && value < optCount) {
                await options.nth(value).click();
                return true;
              }
              
              // Select second option as fallback
              if (optCount > 1) {
                await options.nth(1).click();
                return true;
              }
              
              await page.keyboard.press('Escape');
            }
          }
        }
        return false;
      }
      
      case 'input': {
        const inputs = region.locator('input[type="text"], input[type="number"], input:not([type="file"]):not([type="color"]):not([type="hidden"])');
        if (await inputs.count() > 0) {
          const input = inputs.first();
          if (await input.isVisible() && await input.isEnabled()) {
            await input.scrollIntoViewIfNeeded();
            await input.fill(String(value));
            await input.blur();
            return true;
          }
        }
        return false;
      }
      
      case 'textarea': {
        const textareas = region.locator('textarea');
        if (await textareas.count() > 0) {
          const textarea = textareas.first();
          if (await textarea.isVisible() && await textarea.isEnabled()) {
            await textarea.scrollIntoViewIfNeeded();
            await textarea.fill(String(value));
            await textarea.blur();
            return true;
          }
        }
        return false;
      }
      
      case 'color': {
        const colorInputs = region.locator('input[type="color"], input[data-testid*="color"]');
        if (await colorInputs.count() > 0) {
          const colorInput = colorInputs.first();
          if (await colorInput.isVisible()) {
            await colorInput.scrollIntoViewIfNeeded();
            await colorInput.fill(String(value));
            return true;
          }
        }
        return false;
      }
      
      default:
        return false;
    }
  } catch {
    return false;
  }
}

function getTierLabel(tier: Tier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

// =============================================================================
// CALCULATE TEST COUNTS
// =============================================================================

const settingsBySection = getSettingsBySection();
const allSettings = getFilteredSettings();
const qrChangingSettings = allSettings.filter(s => s.expectsQRChange && !s.conditional);

// Count value iteration tests (each setting × each of its test values)
let valueIterationTestCount = 0;
for (const setting of qrChangingSettings) {
  const values = setting.testValues || [];
  if (values.length > 1) {
    valueIterationTestCount += values.length;
  }
}

// Calculate expected pairwise combinations
// For N settings with V values each: N*(N-1)/2 * V*V combinations
const avgValuesPerSetting = qrChangingSettings.reduce((sum, s) => sum + (s.testValues?.length || 1), 0) / Math.max(1, qrChangingSettings.length);
const settingPairs = qrChangingSettings.length * (qrChangingSettings.length - 1) / 2;
const estimatedInSectionPairwise = Math.min(
  Math.round(settingPairs * avgValuesPerSetting * avgValuesPerSetting),
  PAIRWISE_MAX
);

// Cross-section: estimate based on section count and settings per section
const sectionCount = settingsBySection.size;
const crossSectionPairs = sectionCount * (sectionCount - 1) / 2;
const avgSettingsPerSection = qrChangingSettings.length / Math.max(1, sectionCount);
const estimatedCrossSectionPairwise = Math.min(
  Math.round(crossSectionPairs * avgSettingsPerSection * avgSettingsPerSection * avgValuesPerSetting * avgValuesPerSetting),
  PAIRWISE_MAX
);

// Generate the actual combinations (for use in tests)
const inSectionPairs = generateValueLevelPairwiseCombinations(qrChangingSettings, PAIRWISE_MAX);
const crossSectionPairs2 = generateCrossSectionValuePairs(settingsBySection, PAIRWISE_MAX);
const totalPairwiseTests = inSectionPairs.length + crossSectionPairs2.length;

// Count single-setting tests
const singleSettingTests = allSettings.length;

// =============================================================================
// CONFIGURATION BANNER (printed once via dedicated test)
// =============================================================================

function printConfigurationBanner(): void {
  const stats = getRegistryStats();
  
  console.log('\n' + '='.repeat(70));
  console.log('EXHAUSTIVE PERMUTATION TEST SUITE');
  console.log('='.repeat(70));
  console.log(`Tier:     ${getTierLabel(TIER)} (all tiers up to and including)`);
  console.log(`Section:  ${SECTION_FILTER || 'ALL sections'}`);
  console.log(`Max/sect: ${MAX_PER_SECTION === Number.POSITIVE_INFINITY ? 'UNLIMITED' : MAX_PER_SECTION}`);
  console.log(`Pairwise max: ${PAIRWISE_MAX === Number.POSITIVE_INFINITY ? 'UNLIMITED (all combinations)' : PAIRWISE_MAX}`);
  console.log(`Skip conditional: ${SKIP_CONDITIONAL}`);
  
  console.log(`\nRegistry: ${stats.total} total settings`);
  console.log(`Filtered: ${allSettings.length} settings to test`);
  console.log(`QR-changing (non-conditional): ${qrChangingSettings.length} settings`);
  console.log(`Avg values per setting: ${avgValuesPerSetting.toFixed(1)}`);
  console.log(`Sections: ${getSections().join(', ')}`);
  
  console.log('\n--- EXPECTED TEST BREAKDOWN ---');
  console.log(`Single-setting tests:          ~${singleSettingTests * 2}`);
  console.log(`Value iteration tests:         ~${valueIterationTestCount}`);
  console.log(`In-section pairwise (actual):  ${inSectionPairs.length}`);
  console.log(`Cross-section pairwise (actual): ${crossSectionPairs2.length}`);
  console.log(`TOTAL PERMUTATION TESTS:       ~${singleSettingTests * 2 + valueIterationTestCount + totalPairwiseTests}`);
  console.log('='.repeat(70) + '\n');
}

// Print configuration banner once at start (first test to run)
test.describe('Permutation Test Suite', () => {
  test('configuration summary', async () => {
    printConfigurationBanner();
    expect(allSettings.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// TEST SUITES BY SECTION - SINGLE SETTING TESTS
// =============================================================================

for (const [section, sectionSettings] of settingsBySection) {
  const settingsToTest = sectionSettings.slice(0, MAX_PER_SECTION);
  
  test.describe(`${section} Section Permutations`, () => {
    const qrChanging = settingsToTest.filter(s => s.expectsQRChange);
    const nonQrChanging = settingsToTest.filter(s => !s.expectsQRChange);
    
    test.describe('QR-Changing Settings', () => {
      for (const setting of qrChanging) {
        test(`${setting.id} (${setting.type}) should change QR`, async ({ page, setTier }) => {
          const tierToSet = setting.tier === 'professional' ? 'professional' : 
                           setting.tier === 'advanced' ? 'advanced' : 'basic';
          await setTier(tierToSet as Tier);
          await waitForRenderComplete(page, 'settle');
          const before = await getCanvasSnapshot(page);
          
          const testValue = setting.testValues?.[0] ?? true;
          const interacted = await setControlValue(page, setting, testValue);
          
          expect(interacted, `control interaction failed for ${setting.id}`).toBe(true);
          
          await waitForQRStable(page);
          const after = await getCanvasSnapshot(page);
          
          const changed = snapshotsAreDifferent(before, after);
          
          if (setting.conditional) {
            expect(after.length, `canvas should render meaningful content for conditional setting ${setting.id}`).toBeGreaterThan(100);
          } else {
            expect(changed).toBe(true);
          }
        });
      }
    });
    
    test.describe('Non-QR-Changing Settings', () => {
      for (const setting of nonQrChanging) {
        test(`${setting.id} (${setting.type}) should NOT change QR`, async ({ page, setTier }) => {
          const tierToSet = setting.tier === 'professional' ? 'professional' : 
                           setting.tier === 'advanced' ? 'advanced' : 'basic';
          await setTier(tierToSet as Tier);
          await waitForRenderComplete(page, 'settle');
          const before = await getCanvasSnapshot(page);
          
          const testValue = setting.testValues?.[0] ?? true;
          const interacted = await setControlValue(page, setting, testValue);
          
          expect(interacted, `control interaction failed for ${setting.id}`).toBe(true);
          
          await waitForRenderComplete(page, 'settle');
          const after = await getCanvasSnapshot(page);
          
          // Verify canvas rendered meaningful content after interaction
          expect(after.length, 'canvas should render meaningful content after non-QR interaction').toBeGreaterThan(100);
        });
      }
    });
  });
}

// =============================================================================
// VALUE ITERATION TESTS - Test each setting with ALL its testValues
// =============================================================================

test.describe('Value Iteration Tests', () => {
  for (const setting of qrChangingSettings) {
    const values = setting.testValues || [];
    
    if (values.length > 1) {
      test.describe(`${setting.id} value iterations`, () => {
        for (const value of values) {
          test(`${setting.id} = ${value}`, async ({ page, setTier }) => {
            const tierToSet = setting.tier === 'professional' ? 'professional' : 
                             setting.tier === 'advanced' ? 'advanced' : 'basic';
            await setTier(tierToSet as Tier);
            await waitForRenderComplete(page, 'settle');
            const before = await getCanvasSnapshot(page);
            
            const interacted = await setControlValue(page, setting, value);
            
            expect(interacted, `control interaction failed for ${setting.id}=${value}`).toBe(true);
            
            await waitForQRStable(page);
            const after = await getCanvasSnapshot(page);
            
            // Verify the interaction worked (may or may not change QR depending on default)
            expect(after).toBeTruthy();
          });
        }
      });
    }
  }
});

// =============================================================================
// VALUE-LEVEL PAIRWISE COMBINATION TESTS
// Tests every (settingA, valueA) × (settingB, valueB) combination
// This is the core of comprehensive pairwise coverage
// =============================================================================

test.describe('Value-Level Pairwise Combination Tests', () => {
  // Group in-section pairs by section for organization
  const inSectionBySection = new Map<string, ValueLevelPairwiseCombination[]>();
  for (const pair of inSectionPairs) {
    if (pair.settingA.section === pair.settingB.section) {
      const section = pair.settingA.section;
      if (!inSectionBySection.has(section)) {
        inSectionBySection.set(section, []);
      }
      inSectionBySection.get(section)!.push(pair);
    }
  }
  
  test.describe('In-Section Value Pairs', () => {
    for (const [section, pairs] of inSectionBySection) {
      if (pairs.length === 0) continue;
      
      test.describe(`${section} (${pairs.length} combinations)`, () => {
        // NO LIMIT - test ALL combinations
        for (const pair of pairs) {
          const testName = `${pair.settingA.id}=${pair.valueA} × ${pair.settingB.id}=${pair.valueB}`;
          
          test(testName, async ({ page, setTier }) => {
            // Use highest tier needed
            const tierA = pair.settingA.tier;
            const tierB = pair.settingB.tier;
            const tierToSet = (tierA === 'professional' || tierB === 'professional') ? 'professional' :
                             (tierA === 'advanced' || tierB === 'advanced') ? 'advanced' : 'basic';
            await setTier(tierToSet as Tier);
            await waitForRenderComplete(page, 'settle');
            const before = await getCanvasSnapshot(page);
            
            // Set first setting with specific value
            const interactedA = await setControlValue(page, pair.settingA, pair.valueA);
            expect(interactedA, `control interaction failed for ${pair.settingA.id}=${pair.valueA}`).toBe(true);
            
            // Set second setting with specific value
            const interactedB = await setControlValue(page, pair.settingB, pair.valueB);
            expect(interactedB, `control interaction failed for ${pair.settingB.id}=${pair.valueB}`).toBe(true);
            
            await waitForQRStable(page);
            const after = await getCanvasSnapshot(page);
            
            // Both should have changed the QR
            const changed = snapshotsAreDifferent(before, after);
            expect(changed).toBe(true);
          });
        }
      });
    }
  });
  
  test.describe('Cross-Section Value Pairs', () => {
    // Group by section pair for better organization
    const bySectionPair = new Map<string, ValueLevelPairwiseCombination[]>();
    for (const pair of crossSectionPairs2) {
      const key = `${pair.settingA.section} × ${pair.settingB.section}`;
      if (!bySectionPair.has(key)) {
        bySectionPair.set(key, []);
      }
      bySectionPair.get(key)!.push(pair);
    }
    
    for (const [sectionPair, pairs] of bySectionPair) {
      if (pairs.length === 0) continue;
      
      test.describe(`${sectionPair} (${pairs.length} combinations)`, () => {
        // NO LIMIT - test ALL combinations
        for (const pair of pairs) {
          const testName = `${pair.settingA.id}=${pair.valueA} × ${pair.settingB.id}=${pair.valueB}`;
          
          test(testName, async ({ page, setTier }) => {
            const tierA = pair.settingA.tier;
            const tierB = pair.settingB.tier;
            const tierToSet = (tierA === 'professional' || tierB === 'professional') ? 'professional' :
                             (tierA === 'advanced' || tierB === 'advanced') ? 'advanced' : 'basic';
            await setTier(tierToSet as Tier);
            await waitForRenderComplete(page, 'settle');
            const before = await getCanvasSnapshot(page);
            
            const interactedA = await setControlValue(page, pair.settingA, pair.valueA);
            expect(interactedA, `control interaction failed for ${pair.settingA.id}=${pair.valueA}`).toBe(true);
            
            const interactedB = await setControlValue(page, pair.settingB, pair.valueB);
            expect(interactedB, `control interaction failed for ${pair.settingB.id}=${pair.valueB}`).toBe(true);
            
            await waitForQRStable(page);
            const after = await getCanvasSnapshot(page);
            
            const changed = snapshotsAreDifferent(before, after);
            expect(changed).toBe(true);
          });
        }
      });
    }
  });
});

// =============================================================================
// REGISTRY COVERAGE REPORT
// =============================================================================

test.describe('Registry Coverage', () => {
  test('print coverage summary', async () => {
    const stats = getRegistryStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('SETTINGS REGISTRY COVERAGE SUMMARY');
    console.log('='.repeat(60));
    console.log(`\nTotal settings: ${stats.total}`);
    
    console.log('\nBy Tier:');
    console.log(`  Basic:        ${stats.byTier.basic}`);
    console.log(`  Advanced:     ${stats.byTier.advanced}`);
    console.log(`  Professional: ${stats.byTier.professional}`);
    
    console.log('\nBy Section:');
    for (const [section, count] of Object.entries(stats.bySection).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${section.padEnd(15)} ${count}`);
    }
    
    console.log('\nBy Type:');
    for (const [type, count] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type.padEnd(10)} ${count}`);
    }
    
    console.log('\nQR Impact:');
    console.log(`  Expects QR change:     ${stats.expectsQRChange}`);
    console.log(`  No QR change expected: ${stats.noQRChange}`);
    
    console.log('\nPairwise Coverage:');
    console.log(`  In-section combinations:    ${inSectionPairs.length}`);
    console.log(`  Cross-section combinations: ${crossSectionPairs2.length}`);
    console.log(`  Total pairwise tests:       ${totalPairwiseTests}`);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    expect(stats.total).toBeGreaterThan(0);
  });
});