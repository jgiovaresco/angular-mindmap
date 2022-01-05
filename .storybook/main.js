module.exports = {
  "stories": ['../projects/**/*.stories.@(ts|mdx)'],
  "addons": [
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/angular",
  "angularOptions": {
    "enableIvy": true,
  },
  "core": {
    "builder": "webpack5"
  }
}
