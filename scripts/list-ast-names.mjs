#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { Project, SyntaxKind } from "ts-morph";

const DEFAULT_GLOBS = ["**/*.{ts,tsx,d.ts}", "!**/node_modules/**", "!**/.git/**", "!**/dist/**"];

process.stdout.on("error", (error) => {
  if (error?.code === "EPIPE") {
    process.exit(0);
  }
  throw error;
});

const parseArgs = (argv) => {
  const options = {
    json: false,
    byFile: false,
    paths: [],
  };

  for (const arg of argv) {
    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--by-file") {
      options.byFile = true;
      continue;
    }

    options.paths.push(arg);
  }

  return options;
};

const normalizePath = (filePath) => path.relative(process.cwd(), filePath).replaceAll("\\", "/");

const isExportedNode = (node) => {
  if (typeof node.isExported === "function") {
    return node.isExported();
  }
  return false;
};

const isFunctionLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ArrowFunction ||
  initializer?.getKind() === SyntaxKind.FunctionExpression;

const isClassLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ClassExpression;

const isObjectLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ObjectLiteralExpression;

const isIifeInitializer = (initializer) => {
  if (!initializer || initializer.getKind() !== SyntaxKind.CallExpression) return false;
  const expression = initializer.getExpression();
  return (
    expression.getKind() === SyntaxKind.FunctionExpression ||
    expression.getKind() === SyntaxKind.ArrowFunction ||
    expression.getKind() === SyntaxKind.ParenthesizedExpression
  );
};

const describeVariableDeclaration = (statement, declaration) => {
  const initializer = declaration.getInitializer();
  const name = declaration.getName();
  const exported = isExportedNode(statement);
  const line = declaration.getStartLineNumber();

  if (isFunctionLikeInitializer(initializer)) {
    return {
      kind: "variable.arrow_function",
      name,
      exported,
      line,
    };
  }

  if (isClassLikeInitializer(initializer)) {
    return {
      kind: "variable.class_expression",
      name,
      exported,
      line,
    };
  }

  if (isIifeInitializer(initializer)) {
    return {
      kind: "variable.iife",
      name,
      exported,
      line,
    };
  }

  if (isObjectLikeInitializer(initializer)) {
    return {
      kind: "variable.object_literal",
      name,
      exported,
      line,
    };
  }

  return {
    kind: "variable",
    name,
    exported,
    line,
  };
};

const collectTopLevelEntries = (sourceFile) => {
  const entries = [];

  for (const statement of sourceFile.getStatements()) {
    switch (statement.getKind()) {
      case SyntaxKind.FunctionDeclaration:
        entries.push({
          kind: "function",
          name: statement.getName() ?? "<anonymous>",
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.ClassDeclaration:
        entries.push({
          kind: "class",
          name: statement.getName() ?? "<anonymous>",
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.InterfaceDeclaration:
        entries.push({
          kind: "interface",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.TypeAliasDeclaration:
        entries.push({
          kind: "type",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.EnumDeclaration:
        entries.push({
          kind: "enum",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.ModuleDeclaration:
        entries.push({
          kind: "module",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.VariableStatement:
        for (const declaration of statement.getDeclarations()) {
          entries.push(describeVariableDeclaration(statement, declaration));
        }
        break;

      default:
        break;
    }
  }

  return entries;
};

const flattenResults = (sourceFiles) =>
  sourceFiles.flatMap((sourceFile) => {
    const filePath = normalizePath(sourceFile.getFilePath());
    const entries = collectTopLevelEntries(sourceFile);

    return entries.map((entry) => ({
      path: filePath,
      line: entry.line,
      kind: entry.kind,
      name: entry.name,
      exported: entry.exported,
    }));
  });

const groupByFile = (items) => {
  const map = new Map();

  for (const item of items) {
    if (!map.has(item.path)) {
      map.set(item.path, []);
    }
    map.get(item.path).push(item);
  }

  return [...map.entries()]
    .map(([filePath, entries]) => ({
      path: filePath,
      entries: entries.sort((a, b) => a.line - b.line || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
};

const formatFlat = (item) =>
  `${item.path}:${String(item.line).padStart(4, " ")}  ${item.kind.padEnd(24, " ")}  ${item.exported ? "export" : "local "}  ${item.name}`;

const formatGroupedFile = (group) => {
  const lines = [group.path];
  for (const entry of group.entries) {
    lines.push(
      `  L${String(entry.line).padStart(4, " ")}  ${entry.kind.padEnd(24, " ")}  ${entry.exported ? "export" : "local "}  ${entry.name}`,
    );
  }
  return lines.join("\n");
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));

  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const globs = options.paths.length > 0 ? options.paths : DEFAULT_GLOBS;
  const sourceFiles = project.addSourceFilesAtPaths(globs);

  const items = flattenResults(sourceFiles).sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.line - b.line ||
      a.kind.localeCompare(b.kind) ||
      a.name.localeCompare(b.name),
  );

  if (options.json) {
    const payload = options.byFile ? groupByFile(items) : items;
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (options.byFile) {
    const groups = groupByFile(items);
    for (const group of groups) {
      process.stdout.write(`${formatGroupedFile(group)}\n`);
      process.stdout.write("\n");
    }
    return;
  }

  for (const item of items) {
    process.stdout.write(`${formatFlat(item)}\n`);
  }
};

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
