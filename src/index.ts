import { mkdir, readFile, rmdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import md5 from 'md5';
import prettyBytes from 'pretty-bytes';

import { defaultOptions } from './options.js';
import {
  MAPS_DIRECTORY,
  calculatePercent,
  escapeRegExp,
  getViteConfiguration,
  walkFiles,
} from './utils.js';

import type { AstroIntegration } from 'astro';
import type { InteralRenameOptions, RenameOptions } from './types.js';

export default function renameIntegration(
  options?: RenameOptions
): AstroIntegration {
  const _options = {
    ...defaultOptions,
    ...options,
    rename: {
      ...defaultOptions.rename,
      ...options?.rename,
      outputMapCallback: async (map) => {
        const content = JSON.stringify(map);
        const dir = MAPS_DIRECTORY;

        try {
          await mkdir(dir);
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error(
            `\u001b[31mTemporal directory to process files couldn't be created.\u001b[39m`
          );
          return;
        }

        try {
          await writeFile(`${dir}/class-map-${md5(content)}.json`, content, {
            encoding: 'utf8',
            flag: 'w',
          });
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error(
            `\u001b[31mThere was an error saving the CSS map.\u001b[39m`
          );
          return;
        }

        options?.rename?.outputMapCallback?.(map);
      },
    },
  } satisfies InteralRenameOptions;

  return {
    name: 'astro-rename',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, command }) => {
        if (command !== 'build') return;

        try {
          await rmdir(MAPS_DIRECTORY, { recursive: true });
          // if the directory doesn't exist, it's fine
        } catch (_) {}

        updateConfig({
          // TODO: Check types
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          vite: await getViteConfiguration(_options?.rename, config.vite),
        });
      },
      'astro:config:done': async ({ config }) => {
        // TODO: Check types
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (config.output !== 'static') {
          throw new Error(
            `[astrojs-rename] \`output: "static"\` is only supported right now for this plugin.`
          );
        }
      },
      'astro:build:done': async ({ dir }) => {
        const dist = fileURLToPath(dir);
        let classMap = {};
        let totalSaved = 0;

        try {
          for await (const map of walkFiles(MAPS_DIRECTORY)) {
            classMap = {
              ...classMap,
              ...JSON.parse(await readFile(map, 'utf8')),
            };
          }
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error(
            `\u001b[31mA CSS map of transformed classes it isn't provided\u001b[39m`
          );
          return;
        }

        try {
          for await (const file of walkFiles(dist)) {
            if (!_options.targetExt.some((ext) => file.endsWith(ext))) continue;

            const fileName = file.replace(dist, '');
            let content = await readFile(file, 'utf-8');
            const oldSize = content.length;

            Object.keys(classMap).forEach((key) => {
              const regex = new RegExp(
                _options.matchClasses?.(escapeRegExp(key)),
                'g'
              );

              content = content.replaceAll(
                regex,
                `$1${classMap[key as keyof typeof classMap]}$3`
              );
            });

            await writeFile(file, content, {
              encoding: 'utf8',
              flag: 'w',
            });

            const newSize = content.length;
            const percent = calculatePercent(oldSize, newSize);
            totalSaved += oldSize - newSize;

            // eslint-disable-next-line no-console
            console.info(
              `Processed: ${prettyBytes(
                newSize
              )} (reduced ${percent}% of original ${prettyBytes(
                oldSize
              )}) of ${fileName}.`
            );
          }

          // eslint-disable-next-line no-console
          console.info('\n');
          // eslint-disable-next-line no-console
          console.info(
            `\u001b[32mTotal saved ${prettyBytes(totalSaved)}.\u001b[39m`
          );
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error(
            `\u001b[31mThe build directory doesn't exists.\u001b[39m`
          );
          return;
        }

        try {
          await rmdir(MAPS_DIRECTORY, { recursive: true });
        } catch (_) {
          // eslint-disable-next-line no-console
          console.error(
            `\u001b[31mIt was not possible to remove the class maps directory.\u001b[39m`
          );
        }
      },
    },
  };
}
