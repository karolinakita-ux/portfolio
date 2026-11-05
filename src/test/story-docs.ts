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

const COMPONENT_NAME = /^[A-Z]/;

/** The members of a props type: an interface, or a type alias of an object type or an intersection of them. */
const propMembers = (node: ts.Node): readonly ts.TypeElement[] => {
  if (ts.isInterfaceDeclaration(node)) return node.members;
  if (!ts.isTypeAliasDeclaration(node)) return [];
  const parts = ts.isIntersectionTypeNode(node.type) ? node.type.types : [node.type];
  return parts.flatMap((part) => (ts.isTypeLiteralNode(part) ? [...part.members] : []));
};

/**
 * The comments Storybook shows on a docs page, from one source file: the one above `meta` (the page's description)
 * and above each story (the story's: any exported value of a story file), above an exported component (its
 * description, where the stories give none: a function or a const with a capitalised name), and on each prop of a
 * `...Props` interface or type (the props table's Description column).
 */
export function docsComments(path: string): string[] {
  const text = readFileSync(join(process.cwd(), path), "utf8");
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  const storyFile = path.endsWith(".stories.tsx");
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isVariableStatement(node)) {
      const [declaration] = node.declarationList.declarations;
      const name = declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : "";
      const shown = name === "meta" || (isExported(node) && (storyFile || COMPONENT_NAME.test(name)));
      if (shown) found.push(...jsDocText(node));
    } else if (ts.isFunctionDeclaration(node) && isExported(node) && COMPONENT_NAME.test(node.name?.text ?? "")) {
      found.push(...jsDocText(node));
    } else if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text.endsWith("Props")
    ) {
      for (const member of propMembers(node)) found.push(...jsDocText(member));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/** A docs comment without its code (fenced blocks, then spans such as `as="p"`): what is left is prose. */
export const proseOf = (comment: string): string =>
  comment.replace(/```[\s\S]*?```/g, "```…```").replace(/`[^`]*`/g, "`…`");
