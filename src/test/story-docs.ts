import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";

/** Every story file under src, relative to the project root, with forward slashes. */
export function storyFiles(dir = "src"): string[] {
  return readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return storyFiles(path);
    return entry.name.endsWith(".stories.tsx") ? [path] : [];
  });
}

/**
 * The files whose comments a story file's docs page shows: the story file, and beside it the component its folder is
 * named after (`Button/Button.tsx`) and that component's props (`Button.types.ts`).
 */
export function docsSources(storyFile: string): string[] {
  const dir = dirname(storyFile);
  const name = basename(dir);
  return [storyFile, `${dir}/${name}.tsx`, `${dir}/${name}.types.ts`].filter((path) =>
    existsSync(join(process.cwd(), path)),
  );
}

const jsDocText = (node: ts.Node): string[] =>
  ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? "")
    .filter((text) => text !== "");

const isExported = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

/**
 * The comments Storybook shows on a docs page, from one source file: the one above `meta` (the page's description)
 * and above each story (the story's), above an exported component (its description, where the stories give none),
 * and on each prop of a `...Props` interface (the props table's Description column).
 */
export function docsComments(path: string): string[] {
  const text = readFileSync(join(process.cwd(), path), "utf8");
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isVariableStatement(node)) {
      const [declaration] = node.declarationList.declarations;
      const name = declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : "";
      const story = isExported(node) && declaration?.type?.getText(source).includes("Story") === true;
      if (name === "meta" || story) found.push(...jsDocText(node));
    } else if (ts.isFunctionDeclaration(node) && isExported(node) && /^[A-Z]/.test(node.name?.text ?? "")) {
      found.push(...jsDocText(node));
    } else if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith("Props")) {
      for (const member of node.members) found.push(...jsDocText(member));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/** A docs comment without its code spans (`as="p"`, `"light"`): what is left is prose. */
export const proseOf = (comment: string): string => comment.replace(/`[^`]*`/g, "`…`");
