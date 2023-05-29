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

## TODO

Here's a list of tasks I plan to work on:

- [ ] Fix error types
- [ ] Add test coverage
- [ ] Add support for IDs
- [ ] Enable handling of multiple CSS files
- [ ] Implement support for CSS variables
- [ ] Include server-side rendering support
- [ ] Move temporal files to a temporary directory instead of the root of the project

## Licence

The codebase of this project is distributed under the [GNU General Public License (GPL) version 3.0](LICENCE). However, it is important to note that certain resources utilized within the project may be subject to different licenses. It is recommended to review the specific licenses associated with each resource to ensure compliance with their respective terms and conditions.

## Credits

Special thanks to the following individuals and projects:

- [postcss-rename](https://github.com/google/postcss-rename) by Google
- [@JSC0DER](https://github.com/JSC0DER) for their assistance with the [initial idea](https://github.com/google/postcss-rename/discussions/44)
