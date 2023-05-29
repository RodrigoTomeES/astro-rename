import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcssRename from 'postcss-rename';

import type { AstroConfig } from 'astro';
import type { RenameOptions } from './types.js';

export const MAPS_DIRECTORY = './class-maps';

export const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const calculatePercent = (before: number, after: number) =>
  (100 - (after / before) * 100) | 0;

// TODO: Check types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export async function* walkFiles(dir: string) {
  const dirents = await readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);

    if (dirent.isDirectory()) yield* walkFiles(res);
    else yield res;
  }
}

export const getPostCssConfig = async (
  // TODO: Check types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  root: UserConfig['root'],
  // TODO: Check types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  postcssInlineOptions: CSSOptions['postcss']
) => {
  let postcssConfigResult;

  // Check if postcss config is not inlined
  if (
    !(typeof postcssInlineOptions === 'object' && postcssInlineOptions !== null)
  ) {
    // TODO: Check types
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { default: postcssrc } = await import('postcss-load-config');
    const searchPath =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      typeof postcssInlineOptions === 'string' ? postcssInlineOptions : root!;

    try {
      postcssConfigResult = await postcssrc({}, searchPath);
    } catch (e) {
      postcssConfigResult = null;
    }
  }

  return postcssConfigResult;
};

export const getViteConfiguration = async (
  // TODO: Check types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  options: RenameOptions['rename'],
  // TODO: Check types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  viteConfig: AstroConfig['vite']
) => {
  // We need to manually load postcss config files because when inlining the tailwind and autoprefixer plugins,
  // that causes vite to ignore postcss config files
  const postcssConfigResult = await getPostCssConfig(
    viteConfig.root,
    viteConfig.css?.postcss
  );
  const postcssOptions =
    (postcssConfigResult && postcssConfigResult.options) || {};
  const postcssPlugins =
    postcssConfigResult && postcssConfigResult.plugins
      ? postcssConfigResult.plugins.slice()
      : [];

  postcssPlugins.push(postcssRename(options));

  return {
    css: {
      postcss: {
        options: postcssOptions,
        plugins: postcssPlugins,
      },
    },
  };
};
