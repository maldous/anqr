#!/usr/bin/env node
/**
 * Split remaining multi-export files by extracting type/interface exports
 * into .types.ts files, leaving only the single value export in the original.
 */
import fs from 'fs';
import path from 'path';

const FILES = [
  'src/domain/qr/analyze/telemetry-logging.ts',
  'src/modules/qr-analyzer/export.ts',
  'src/domain/render/overlay/crop-handler.ts',
  'src/domain/qr/spec/verify.ts',
  'src/app/routing/page-resolution.ts',
  'src/domain/render/dither/kernels.ts',
  'src/domain/qr/qart/image-utils.ts',
  'src/domain/qr/decode/rs-rootability.ts',
  'src/ui/primitives/date-time-picker.tsx',
  'src/platform/ads/components/AdUnit.tsx',
  'src/app/pages/StaticPage.tsx',
];

let totalSplit = 0;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Find all exported type/interface declarations
  const typeExports = [];
  const typeExportLines = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Match: export type X = ... or export interface X {
    const typeMatch = trimmed.match(/^export\s+(type|interface)\s+(\w+)/);
    if (typeMatch) {
      const kind = typeMatch[1]; // 'type' or 'interface'
      const name = typeMatch[2];
      
      // Collect the full declaration (may span multiple lines)
      let endLine = i;
      if (kind === 'interface') {
        // Find closing brace
        let braceDepth = 0;
        for (let j = i; j < lines.length; j++) {
          for (const ch of lines[j]) {
            if (ch === '{') braceDepth++;
            if (ch === '}') braceDepth--;
          }
          if (braceDepth <= 0 && j > i) { endLine = j; break; }
          if (braceDepth === 0 && lines[j].includes('{') && lines[j].includes('}')) { endLine = j; break; }
        }
      } else {
        // type alias - find the semicolon
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes(';')) { endLine = j; break; }
        }
      }
      
      const block = lines.slice(i, endLine + 1).join('\n');
      typeExports.push({ name, kind, block, startLine: i, endLine });
      for (let j = i; j <= endLine; j++) typeExportLines.add(j);
    }
  }
  
  if (typeExports.length === 0) {
    
    continue;
  }
  
  // Count value exports (function, const, class, etc.)
  let valueExportCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (typeExportLines.has(i)) continue;
    const trimmed = lines[i].trim();
    if (/^export\s+(function|async function|const|let|var|class|default|enum)\s/.test(trimmed)) {
      valueExportCount++;
    }
  }
  
  // Only split if there's at least 1 value export AND at least 1 type export
  if (valueExportCount === 0) {
    
    continue;
  }
  
  // Determine .types.ts path
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const typesPath = `${base}.types${ext === '.tsx' ? '.ts' : '.ts'}`;
  
  // Check if types file already exists
  if (fs.existsSync(typesPath)) {
    // Append to existing types file
    const existingTypes = fs.readFileSync(typesPath, 'utf-8');
    const newTypes = typeExports.map(t => t.block).join('\n\n');
    
    // Check which types are already there
    const missingTypes = typeExports.filter(t => !existingTypes.includes(`export ${t.kind} ${t.name}`));
    if (missingTypes.length > 0) {
      fs.writeFileSync(typesPath, existingTypes.trimEnd() + '\n\n' + missingTypes.map(t => t.block).join('\n\n') + '\n');
      
    }
  } else {
    // Check if any type exports have imports they depend on
    // Collect imports from the original file that the types might need
    const importLines = [];
    for (const line of lines) {
      if (line.trim().startsWith('import ') && (line.includes('type') || line.includes('interface'))) {
        importLines.push(line);
      }
    }
    
    // Build the types file content
    const typeBlocks = typeExports.map(t => t.block).join('\n\n');
    
    // Check if any type references another type from an import
    const neededImports = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('import')) continue;
      // Check if any type block references names from this import
      const importNames = trimmed.match(/\{([^}]+)\}/)?.[1]?.split(',').map(n => n.trim().replace(/^type\s+/, '')) || [];
      const isNeeded = importNames.some(name => typeBlocks.includes(name));
      if (isNeeded) {
        // Make sure it's a type import
        if (trimmed.startsWith('import type')) {
          neededImports.push(line);
        } else {
          // Convert to type import if it only imports types used in our type blocks
          neededImports.push(line.replace('import {', 'import type {').replace('import { type', 'import type {'));
        }
      }
    }
    
    const typesContent = (neededImports.length > 0 ? neededImports.join('\n') + '\n\n' : '') + typeBlocks + '\n';
    fs.writeFileSync(typesPath, typesContent);
    
  }
  
  // Remove type declarations from original file and add import from .types.ts
  const newLines = [];
  const typeNames = typeExports.map(t => t.name);
  
  // Add type import
  const typesRelPath = './' + path.basename(typesPath).replace(/\.tsx?$/, '');
  const typeImportLine = `export type { ${typeNames.join(', ')} } from '${typesRelPath}';`;
  
  let addedImport = false;
  let skipUntilLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (i <= skipUntilLine) continue;
    
    if (typeExportLines.has(i)) {
      // Find the end of this type block and skip it
      const typeExport = typeExports.find(t => t.startLine === i);
      if (typeExport) {
        skipUntilLine = typeExport.endLine;
        // Insert the re-export line at the position of the first removed type
        if (!addedImport) {
          newLines.push(typeImportLine);
          addedImport = true;
        }
      }
      continue;
    }
    
    newLines.push(lines[i]);
  }
  
  // If we didn't add the import yet (unlikely), add it after imports
  if (!addedImport) {
    let lastImportIdx = -1;
    for (let i = 0; i < newLines.length; i++) {
      if (newLines[i].trim().startsWith('import ')) lastImportIdx = i;
    }
    newLines.splice(lastImportIdx + 1, 0, typeImportLine);
  }
  
  // Clean up double blank lines
  const cleaned = newLines.join('\n').replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(filePath, cleaned);
  
  
  totalSplit++;
}


