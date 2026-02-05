/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
