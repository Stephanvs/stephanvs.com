require(`dotenv`).config();

module.exports = {
  siteMetadata: {
    title: `Stephanvs.`,
    description: `A personal blogging theme for Gatsby with great typography and dark mode.`,
    siteUrl: process.env.SITE_URL || `http://localhost`,
    startUrl: `/`,
    copyright: `© 2020 Stephan van Stekelenburg. All rights reserved.`,
    icon: `src/images/icon.png`,
    color: `#D42C68`,
    menuLinks: [
      {
        name: `Home`,
        link: `/`,
      },
      {
        name: `Blog`,
        link: `/blog`,
      },
      {
        name: `Projects`,
        link: `/projects`,
      },
      {
        name: `Photography`,
        link: `/photography`,
      },
    ],
    socialLinks: [
      {
        name: `Twitter`,
        url: `https://twitter.com/stephanvs`,
        icon: `twitter`,
      },
      {
        name: `Github`,
        url: `https://github.com/stephanvs`,
        icon: `github`,
      },
      {
        name: `Instagram`,
        url: `https://instagram.com/stephanvs`,
        icon: `instagram`,
      },
      {
        name: `LinkedIn`,
        url: `https://nl.linkedin.com/in/stephanvanstekelenburg`,
        icon: `linkedin`,
      },
      {
        name: `Twitch`,
        url: `https://twitch.tv/devStephanvs`,
        icon: `twitch`,
      },
      {
        name: `YouTube`,
        url: `https://youtube.com/channel/UCp7S7EdwOQ0rJmkjjm07VtQ`,
        icon: `youtube`,
      },
    ],
  },
  plugins: [
    // This is a list of all themes that this starter is using.
    // To disable a theme, remove it here and run `yarn remove @arshad/gatsby-theme-NAME`.
    `@arshad/gatsby-theme-blog-core`,
    `@arshad/gatsby-theme-page-core`,
    // `@arshad/gatsby-theme-portfolio-core`,
    {
      resolve: `@arshad/gatsby-theme-portfolio-core`,
      options: {
        contentPath: `content/projects`,
        basePath: `/projects`,
        pageTitle: `Projects`,
        pageExcerpt: null,
      },
    },
    `@arshad/gatsby-theme-photo-core`,
    `@arshad/gatsby-theme-phoenix`,
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [
          require("tailwindcss")(
            require("./src/@arshad/gatsby-theme-phoenix/tailwind.config")
          ),
          require("autoprefixer"),
          require("postcss-color-function"),
        ],
      },
    },
  ],
};
