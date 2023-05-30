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
Processed: 9.94 kB (reduced 52% of original 20.7 kB) of 1\index.html.
Processed: 9.81 kB (reduced 52% of original 20.6 kB) of 10\index.html.
Processed: 9.91 kB (reduced 52% of original 20.7 kB) of 11\index.html.
Processed: 9.82 kB (reduced 52% of original 20.6 kB) of 12\index.html.
Processed: 9.84 kB (reduced 52% of original 20.6 kB) of 13\index.html.
Processed: 9.78 kB (reduced 52% of original 20.5 kB) of 14\index.html.
Processed: 9.9 kB (reduced 52% of original 20.7 kB) of 15\index.html.
Processed: 9.98 kB (reduced 51% of original 20.7 kB) of 16\index.html.
Processed: 9.92 kB (reduced 52% of original 20.7 kB) of 17\index.html.
Processed: 9.67 kB (reduced 52% of original 20.4 kB) of 18\index.html.
Processed: 9.82 kB (reduced 52% of original 20.6 kB) of 19\index.html.
Processed: 9.8 kB (reduced 52% of original 20.6 kB) of 2\index.html.
Processed: 12 kB (reduced 47% of original 22.8 kB) of 20\index.html.
Processed: 9.93 kB (reduced 52% of original 20.7 kB) of 21\index.html.
Processed: 11.3 kB (reduced 48% of original 22 kB) of 22\index.html.
Processed: 9.94 kB (reduced 51% of original 20.7 kB) of 23\index.html.
Processed: 6.82 kB (reduced 50% of original 13.8 kB) of 24\index.html.
Processed: 9.66 kB (reduced 52% of original 20.4 kB) of 3\index.html.
Processed: 9.72 kB (reduced 52% of original 20.5 kB) of 4\index.html.
Processed: 9.54 kB (reduced 53% of original 20.3 kB) of 5\index.html.
Processed: 9.75 kB (reduced 52% of original 20.5 kB) of 6\index.html.
Processed: 9.58 kB (reduced 52% of original 20.3 kB) of 7\index.html.
Processed: 9.68 kB (reduced 52% of original 20.4 kB) of 8\index.html.
Processed: 9.71 kB (reduced 52% of original 20.5 kB) of 9\index.html.
Processed: 8.98 kB (reduced 49% of original 17.9 kB) of artifacts\1\index.html.
Processed: 9.68 kB (reduced 52% of original 20.4 kB) of avatars\1\index.html.
Processed: 9.8 kB (reduced 52% of original 20.6 kB) of avatars\10\index.html.
Processed: 9.71 kB (reduced 52% of original 20.5 kB) of avatars\11\index.html.
Processed: 9.9 kB (reduced 52% of original 20.7 kB) of avatars\12\index.html.
Processed: 9.89 kB (reduced 52% of original 20.7 kB) of avatars\13\index.html.
Processed: 9.77 kB (reduced 52% of original 20.5 kB) of avatars\14\index.html.
Processed: 9.62 kB (reduced 52% of original 20.4 kB) of avatars\15\index.html.
Processed: 7.77 kB (reduced 51% of original 16 kB) of avatars\16\index.html.
Processed: 9.78 kB (reduced 52% of original 20.5 kB) of avatars\2\index.html.
Processed: 9.52 kB (reduced 53% of original 20.3 kB) of avatars\3\index.html.
Processed: 9.71 kB (reduced 52% of original 20.5 kB) of avatars\4\index.html.
Processed: 9.64 kB (reduced 52% of original 20.4 kB) of avatars\5\index.html.
Processed: 9.67 kB (reduced 52% of original 20.4 kB) of avatars\6\index.html.
Processed: 9.68 kB (reduced 52% of original 20.4 kB) of avatars\7\index.html.
Processed: 9.82 kB (reduced 52% of original 20.6 kB) of avatars\8\index.html.
Processed: 9.93 kB (reduced 52% of original 20.7 kB) of avatars\9\index.html.
Processed: 9.97 kB (reduced 51% of original 20.7 kB) of badges-and-borders\1\index.html.
Processed: 9.88 kB (reduced 52% of original 20.6 kB) of badges-and-borders\2\index.html.
Processed: 10.1 kB (reduced 51% of original 20.8 kB) of badges-and-borders\3\index.html.
Processed: 8.79 kB (reduced 51% of original 18.3 kB) of badges-and-borders\4\index.html.
Processed: 9.98 kB (reduced 51% of original 20.7 kB) of dell-rewards\1\index.html.
Processed: 10.2 kB (reduced 51% of original 21 kB) of dell-rewards\2\index.html.
Processed: 12.2 kB (reduced 46% of original 22.9 kB) of game-vault\1\index.html.
Processed: 6.47 kB (reduced 44% of original 11.6 kB) of game-vault\2\index.html.
Processed: 9.89 kB (reduced 52% of original 20.7 kB) of index.html.
Processed: 9.81 kB (reduced 52% of original 20.6 kB) of unknown\1\index.html.
Processed: 9.14 kB (reduced 54% of original 19.9 kB) of unknown\10\index.html.
Processed: 9.36 kB (reduced 53% of original 20.1 kB) of unknown\11\index.html.
Processed: 9 kB (reduced 54% of original 19.8 kB) of unknown\12\index.html.
Processed: 8.9 kB (reduced 54% of original 19.7 kB) of unknown\13\index.html.
Processed: 9.77 kB (reduced 52% of original 20.5 kB) of unknown\2\index.html.
Processed: 8.92 kB (reduced 54% of original 19.7 kB) of unknown\3\index.html.
Processed: 8.84 kB (reduced 54% of original 19.6 kB) of unknown\4\index.html.
Processed: 8.84 kB (reduced 54% of original 19.6 kB) of unknown\5\index.html.
Processed: 8.84 kB (reduced 54% of original 19.6 kB) of unknown\6\index.html.
Processed: 8.84 kB (reduced 54% of original 19.6 kB) of unknown\7\index.html.
Processed: 8.92 kB (reduced 54% of original 19.7 kB) of unknown\8\index.html.
Processed: 9.07 kB (reduced 54% of original 19.8 kB) of unknown\9\index.html.
Processed: 1.76 kB (reduced 0% of original 1.76 kB) of _astro\page.07ed4ffe.js.


Total saved 663 kB.
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
- [ ] Show size of the result files with gzip and brotli

## Licence

The codebase of this project is distributed under the [GNU General Public License (GPL) version 3.0](LICENCE). However, it is important to note that certain resources utilized within the project may be subject to different licenses. It is recommended to review the specific licenses associated with each resource to ensure compliance with their respective terms and conditions.

## Credits

Special thanks to the following individuals and projects:

- [postcss-rename](https://github.com/google/postcss-rename) by Google
- [@JSC0DER](https://github.com/JSC0DER) for their assistance with the [initial idea](https://github.com/google/postcss-rename/discussions/44)
- [@Gechu03](https://github.com/Gechu03) and [@sergiomalagon](https://github.com/sergiomalagon) for their assistance with the regular expressions to match the CSS selectors
