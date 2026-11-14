import { defineConfig } from "astro/config";

// The editor (PageStack) loads only when asked for: `EDITOR=dev astro dev` (npm run dev:editor).
// Plain `astro dev` / `astro build` never import it, so the public site is fully static.
// Explicit values only: $EDITOR is also the shell's default text editor.
const editor = process.env.EDITOR === "dev" || process.env.EDITOR === "1";
const { default: pagestack } = editor ? await import("@pirateandfox/pagestack") : {};

/**
 * /blocks: every block in the library, one after another, with a labelled bar above each and a
 * theme switcher. It exists while developing and in the editor, never in the public build.
 */
function allBlocksPage() {
  return {
    name: "starter:all-blocks",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command === "dev" || editor) injectRoute({ pattern: "/blocks", entrypoint: "./src/editor/AllBlocks.astro", prerender: false });
      },
    },
  };
}

export default defineConfig({
  site: "https://example.com",
  output: "static",
  devToolbar: { enabled: false },
  trailingSlash: "ignore",
  integrations: [
    allBlocksPage(),
    ...(editor
      ? [
          pagestack({
            renderer: "./src/components/SectionPage.astro",
            sections: "./src/sections/index.ts",
            siteName: "Meridian",
            // Local development: no login, saves write straight to the working tree.
            // For a deployed editor see the PageStack README (auth: "passkey", storage: "github").
            auth: "none",
            storage: "local",
          }),
        ]
      : []),
  ],
});
