# astro-rename

Astro-Rename is an Astro integration that brings [postcss-rename](https://github.com/google/postcss-rename) functionality to your Astro project without the need for configuration.

## Features

- [x] Compress CSS classes
- [ ] Compress CSS IDs
- [ ] Compress CSS Variables
- [x] Replace CSS classes in HTML, JS, and other files

## Installation

```bash
npm install --save-dev astro-rename

# or

yarn add --dev astro-rename
```

## Usage

Add the plugin to your Astro config file:

```js
import rename from 'astro-rename';

export default defineConfig({
  // It's important to set the output directory to "static" because it's the only method that will work with the current version of the plugin.
  // If you don't set this, the plugin will throw an error.
  output: 'static',
  integrations: [rename()],
});
```

## Options

The plugin is typed, allowing you to see the available options in your editor. Here's a list of them:

````ts
type RenameOptions = {
  rename?: {
    /**
     * The renaming strategy to use:
     *  - "none": Don't change names at all. This is the default strategy.
     * - "debug": Add an underscore at the end of each name. This is useful for keeping classes readable during debugging while still verifying that your templates and JavaScript aren't accidentally using non-renamed classes.
     * - "minimal": Use the shortest possible names, in order of appearance: the first class is renamed to .a, the second to .b, and so on.
     *
     * This can also be a function that takes a CSS name (the full name in by-whole mode and the part in by-part mode) and returns its renamed value.
     *
     * @default 'minimal'
     */
    strategy?: 'none' | 'debug' | 'minimal' | ((string: any) => string);
    /**
     * Whether to rename in "by-whole mode" or "by-part mode".
     * - "whole": Rename the entire name at once, so for example .tall-image might become .a. This is the default mode.
     * - "part": Rename each hyphenated section of a name separately, so for example .tall-image might become .a-b.
     *
     * @default 'whole'
     */
    by?: 'whole' | 'part';
    /**
     * A string prefix to add before every renamed class. This applies even if strategy is set to none.
     * In by-part mode, the prefix is applied to the entire class, but it isn't included in the output map.
     *
     * @default undefined
     */
    prefix?: string;
    /**
     * An array (or other Iterable) of names that shouldn't be renamed.
     *
     * @default undefined
     */
    except?: Iterable<string | RegExp>;
    /**
     * A callback that's passed a map from original class names to their renamed equivalents, so that an HTML template or JS class references can also be renamed.
     *
     * In by-part mode, this contains separate entries for each part of a class name. It doesn't contain any names that weren't renamed because of except.
     *
     * @default undefined
     */
    outputMapCallback?(map: { [key: string]: string }): void;
  };
  /**
   * The target file extensions to process.
   *
   * @default '["html", "js"]''
   */
  targetExt?: string[];
  /**
   * A function that takes a CSS name (the full name in by-whole mode and the part in by-part mode) and returns a regular expression that matches that name.
   * This is used to find references to the original class names in HTML templates and JS classes.
   * The default is to match the name with word boundaries on either side, but you can change this to match only the start or end of the name, or to match more or less than a whole word.
   *
   * @default ```js
   * (key: string) => `(:^|[^-&;:_])(${key})(:$|[^-&;:_\./])`
   * ```
   */
  matchClasses?: (key: string) => string;
};
````

## Configuration with other plugins

If you're using other plugins that modify your CSS, you may need to adjust the order in which they are applied. For example:

```ts
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import critters from 'astro-critters';
import rename from 'astro-rename';

export default defineConfig({
  output: 'static',
  integrations: [
    // First, run Tailwind to generate the CSS
    tailwind(),
    // Then, compress the class names
    rename(),
    // Finally, inline the critical CSS
    critters(),
    // And compress the CSS, HTML, JS... files
    compress(),
  ],
});
```

## Example

Here's an example of the plugin in action in my [awa-db](https://github.com/RodrigoTomeES/awa-db) project. The average size reduction of HTML files is around 50%.

```bash
┌─────────────────────────────────┬───────────────┬──────────┬─────────┬─────────┬─────────┐
│                            File │ Original Size │ New Size │ Reduced │    Gzip │  Brotli │
├─────────────────────────────────┼───────────────┼──────────┼─────────┼─────────┼─────────┤
│                    1\index.html │       20.7 kB │  9.94 kB │     52% │ 2.68 kB │ 2.21 kB │
│                   10\index.html │       20.6 kB │  9.81 kB │     52% │ 2.68 kB │ 2.21 kB │
│                   11\index.html │       20.7 kB │  9.91 kB │     52% │ 2.71 kB │ 2.22 kB │
│                   12\index.html │       20.6 kB │  9.82 kB │     52% │ 2.65 kB │ 2.18 kB │
│                   13\index.html │       20.6 kB │  9.84 kB │     52% │ 2.71 kB │ 2.22 kB │
│                   14\index.html │       20.5 kB │  9.78 kB │     52% │ 2.63 kB │ 2.15 kB │
│                   15\index.html │       20.7 kB │   9.9 kB │     52% │ 2.72 kB │ 2.27 kB │
│                   16\index.html │       20.7 kB │  9.98 kB │     51% │ 2.72 kB │ 2.24 kB │
│                   17\index.html │       20.7 kB │  9.92 kB │     52% │  2.7 kB │ 2.22 kB │
│                   18\index.html │       20.4 kB │  9.67 kB │     52% │ 2.54 kB │ 2.08 kB │
│                   19\index.html │       20.6 kB │  9.82 kB │     52% │ 2.63 kB │ 2.15 kB │
│                    2\index.html │       20.6 kB │   9.8 kB │     52% │  2.7 kB │  2.2 kB │
│                   20\index.html │       22.8 kB │    12 kB │     47% │ 3.72 kB │ 2.97 kB │
│                   21\index.html │       20.7 kB │  9.93 kB │     52% │ 2.79 kB │ 2.25 kB │
│                   22\index.html │         22 kB │  11.3 kB │     48% │ 3.48 kB │ 2.84 kB │
│                   23\index.html │       20.7 kB │  9.94 kB │     51% │ 2.52 kB │ 2.04 kB │
│                   24\index.html │       13.8 kB │  6.82 kB │     50% │ 2.21 kB │ 1.81 kB │
│                    3\index.html │       20.4 kB │  9.66 kB │     52% │  2.6 kB │ 2.16 kB │
│                    4\index.html │       20.5 kB │  9.72 kB │     52% │ 2.58 kB │ 2.12 kB │
│                    5\index.html │       20.3 kB │  9.54 kB │     53% │ 2.52 kB │ 2.09 kB │
│                    6\index.html │       20.5 kB │  9.75 kB │     52% │ 2.63 kB │ 2.17 kB │
│                    7\index.html │       20.3 kB │  9.58 kB │     52% │  2.6 kB │ 2.15 kB │
│                    8\index.html │       20.4 kB │  9.68 kB │     52% │ 2.62 kB │ 2.16 kB │
│                    9\index.html │       20.5 kB │  9.71 kB │     52% │ 2.64 kB │ 2.19 kB │
│          artifacts\1\index.html │       17.9 kB │  8.98 kB │     49% │ 2.74 kB │ 2.19 kB │
│            avatars\1\index.html │       20.4 kB │  9.68 kB │     52% │  2.6 kB │ 2.15 kB │
│           avatars\10\index.html │       20.6 kB │   9.8 kB │     52% │ 2.69 kB │  2.2 kB │
│           avatars\11\index.html │       20.5 kB │  9.71 kB │     52% │ 2.57 kB │ 2.12 kB │
│           avatars\12\index.html │       20.7 kB │   9.9 kB │     52% │ 2.74 kB │ 2.25 kB │
│           avatars\13\index.html │       20.7 kB │  9.89 kB │     52% │ 2.65 kB │ 2.18 kB │
│           avatars\14\index.html │       20.5 kB │  9.77 kB │     52% │ 2.58 kB │ 2.12 kB │
│           avatars\15\index.html │       20.4 kB │  9.62 kB │     52% │ 2.58 kB │ 2.13 kB │
│           avatars\16\index.html │         16 kB │  7.77 kB │     51% │ 2.34 kB │ 1.92 kB │
│            avatars\2\index.html │       20.5 kB │  9.78 kB │     52% │ 2.58 kB │ 2.12 kB │
│            avatars\3\index.html │       20.3 kB │  9.52 kB │     53% │ 2.52 kB │ 2.08 kB │
│            avatars\4\index.html │       20.5 kB │  9.71 kB │     52% │ 2.56 kB │ 2.12 kB │
│            avatars\5\index.html │       20.4 kB │  9.64 kB │     52% │  2.6 kB │ 2.16 kB │
│            avatars\6\index.html │       20.4 kB │  9.67 kB │     52% │ 2.63 kB │ 2.17 kB │
│            avatars\7\index.html │       20.4 kB │  9.68 kB │     52% │ 2.62 kB │ 2.17 kB │
│            avatars\8\index.html │       20.6 kB │  9.82 kB │     52% │ 2.62 kB │ 2.15 kB │
│            avatars\9\index.html │       20.7 kB │  9.93 kB │     52% │ 2.67 kB │ 2.19 kB │
│ badges-and-borders\1\index.html │       20.7 kB │  9.97 kB │     51% │ 2.69 kB │ 2.21 kB │
│ badges-and-borders\2\index.html │       20.6 kB │  9.88 kB │     52% │ 2.68 kB │ 2.21 kB │
│ badges-and-borders\3\index.html │       20.8 kB │  10.1 kB │     51% │ 2.76 kB │ 2.26 kB │
│ badges-and-borders\4\index.html │       18.3 kB │  8.79 kB │     51% │ 2.46 kB │ 2.03 kB │
│       dell-rewards\1\index.html │       20.7 kB │  9.98 kB │     51% │  2.7 kB │ 2.22 kB │
│       dell-rewards\2\index.html │         21 kB │  10.2 kB │     51% │ 2.35 kB │ 1.89 kB │
│         game-vault\1\index.html │       22.9 kB │  12.2 kB │     46% │ 3.76 kB │ 3.02 kB │
│         game-vault\2\index.html │       11.6 kB │  6.47 kB │     44% │ 2.54 kB │ 2.05 kB │
│                      index.html │       20.7 kB │  9.89 kB │     52% │ 2.66 kB │  2.2 kB │
│            unknown\1\index.html │       20.6 kB │  9.81 kB │     52% │ 1.86 kB │ 1.48 kB │
│           unknown\10\index.html │       19.9 kB │  9.14 kB │     54% │ 1.83 kB │ 1.44 kB │
│           unknown\11\index.html │       20.1 kB │  9.36 kB │     53% │ 1.87 kB │ 1.47 kB │
│           unknown\12\index.html │       19.8 kB │     9 kB │     54% │ 1.85 kB │ 1.45 kB │
│           unknown\13\index.html │       19.7 kB │   8.9 kB │     54% │ 1.83 kB │ 1.45 kB │
│            unknown\2\index.html │       20.5 kB │  9.77 kB │     52% │ 1.84 kB │ 1.46 kB │
│            unknown\3\index.html │       19.7 kB │  8.92 kB │     54% │ 1.86 kB │ 1.48 kB │
│            unknown\4\index.html │       19.6 kB │  8.84 kB │     54% │ 1.82 kB │ 1.44 kB │
│            unknown\5\index.html │       19.6 kB │  8.84 kB │     54% │ 1.82 kB │ 1.44 kB │
│            unknown\6\index.html │       19.6 kB │  8.84 kB │     54% │ 1.82 kB │ 1.44 kB │
│            unknown\7\index.html │       19.6 kB │  8.84 kB │     54% │ 1.82 kB │ 1.45 kB │
│            unknown\8\index.html │       19.7 kB │  8.92 kB │     54% │ 1.84 kB │ 1.45 kB │
│            unknown\9\index.html │       19.8 kB │  9.07 kB │     54% │ 1.84 kB │ 1.45 kB │
└─────────────────────────────────┴───────────────┴──────────┴─────────┴─────────┴─────────┘
```

## TODO

Here's a list of tasks I plan to work on:

- [ ] Fix error types
- [ ] Add test coverage
- [ ] Add support for IDs
- [ ] Enable handling of multiple CSS files
- [ ] Implement support for CSS variables
- [ ] Include server-side rendering support
- [ ] Move temporal files to a temporary directory instead of the root of the project
- [ ] Improve stadistics of file size reduction
- [x] Show size of the result files with gzip and brotli

## Licence

The codebase of this project is distributed under the [GNU General Public License (GPL) version 3.0](LICENCE). However, it is important to note that certain resources utilized within the project may be subject to different licenses. It is recommended to review the specific licenses associated with each resource to ensure compliance with their respective terms and conditions.

## Credits

Special thanks to the following individuals and projects:

- [postcss-rename](https://github.com/google/postcss-rename) by Google
- [@JSC0DER](https://github.com/JSC0DER) for their assistance with the [initial idea](https://github.com/google/postcss-rename/discussions/44)
- [@Gechu03](https://github.com/Gechu03) and [@sergiomalagon](https://github.com/sergiomalagon) for their assistance with the regular expressions to match the CSS selectors
