module.exports = {
  stories: ["../projects/**/*.stories.@(ts|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: "@storybook/angular",
  angularOptions: {
    enableIvy: true,
  },
  core: {
    builder: "webpack5",
  },
  staticDirs: [
    {
      from: "../node_modules/@gravitee/ui-particles-angular/assets",
      to: "/assets",
    },
  ],
};
