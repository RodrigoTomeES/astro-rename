const config = {
  '**/*.(ts|tsx)': () => 'yarn tsc',

  '**/*.(ts|tsx|js|cjs|mjs|jsx|astro)': (filenames) => [
    `yarn lint --fix ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
  ],

  '**/*.css': (filenames) => [
    `yarn stylelint --fix ${filenames.join(' ')}`,
    `yarn prettier --write  ${filenames.join(' ')}`,
  ],

  '**/*.(md|json)': (filenames) =>
    `yarn prettier --write ${filenames.join(' ')}`,
};

module.exports = config;
