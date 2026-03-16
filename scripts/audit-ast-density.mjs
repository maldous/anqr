#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { Project, SyntaxKind } from "ts-morph";

const DEFAULT_GLOBS = [
  "**/*.{ts,tsx,d.ts}",
  "!**/node_modules/**",
  "!netlify/functions/qr.ts",
  "!netlify/edge-functions/seo.ts",
  "!netlify/functions/qr-render-background.ts",
  "!vite.config.ts",
];
const DEFAULT_THRESHOLD = 1;

process.stdout.on("error", (error) => {
  if (error?.code === "EPIPE") {
    process.exit(0);
  }
  throw error;
});

const parseArgs = (argv) => {
  const options = {
    threshold: DEFAULT_THRESHOLD,
    json: false,
    paths: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--threshold") {
      const raw = argv[i + 1];
      if (raw === undefined) {
        throw new Error("--threshold requires a numeric value");
      }
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid threshold: ${raw}`);
      }
      options.threshold = parsed;
      i += 1;
      continue;
    }
    options.paths.push(arg);
  }

  return options;
};

const normalizePath = (filePath) => path.relative(process.cwd(), filePath).replaceAll("\\", "/");

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

const describeVariableDeclaration = (declaration) => {
  const initializer = declaration.getInitializer();
  const name = declaration.getName();

  if (isFunctionLikeInitializer(initializer)) {
    return {
      kind: "variable.arrow_function",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  if (isClassLikeInitializer(initializer)) {
    return {
      kind: "variable.class_expression",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  if (isIifeInitializer(initializer)) {
    return {
      kind: "variable.iife",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  if (isObjectLikeInitializer(initializer)) {
    return {
      kind: "variable.object_literal",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  return null;
};

const collectHeavyNodes = (sourceFile) => {
  const heavyNodes = [];

  for (const statement of sourceFile.getStatements()) {
    switch (statement.getKind()) {
      case SyntaxKind.FunctionDeclaration: {
        heavyNodes.push({
          kind: "function",
          name: statement.getName() ?? "<anonymous>",
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.ClassDeclaration: {
        heavyNodes.push({
          kind: "class",
          name: statement.getName() ?? "<anonymous>",
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.InterfaceDeclaration: {
        heavyNodes.push({
          kind: "interface",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.TypeAliasDeclaration: {
        heavyNodes.push({
          kind: "type",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.EnumDeclaration: {
        heavyNodes.push({
          kind: "enum",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.ModuleDeclaration: {
        heavyNodes.push({
          kind: "module",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.VariableStatement: {
        for (const declaration of statement.getDeclarations()) {
          const description = describeVariableDeclaration(declaration);
          if (description) heavyNodes.push(description);
        }
        break;
      }
      default:
        break;
    }
  }

  return heavyNodes;
};

const formatEntry = (entry) => {
  const grouped = entry.nodes.reduce((acc, node) => {
    acc[node.kind] = (acc[node.kind] ?? 0) + 1;
    return acc;
  }, {});

  const summary = Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kind, count]) => `${kind}:${count}`)
    .join(", ");

  return `${String(entry.count).padStart(3, " ")} ${entry.path}  ${summary}`;
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const globs = options.paths.length > 0 ? options.paths : DEFAULT_GLOBS;
  const sourceFiles = project.addSourceFilesAtPaths(globs);

  const results = sourceFiles
    .map((sourceFile) => {
      const nodes = collectHeavyNodes(sourceFile);
      return {
        path: normalizePath(sourceFile.getFilePath()),
        count: nodes.length,
        nodes,
      };
    })
    .filter((entry) => entry.count > options.threshold)
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));

  if (options.json) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return;
  }

  for (const entry of results) {
    process.stdout.write(`${formatEntry(entry)}\n`);
  }
};

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
