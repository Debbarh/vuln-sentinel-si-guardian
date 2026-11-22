import{defineConfig}from'vitest/config';import{fileURLToPath}from'node:url';import path from'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));export default defineConfig({root,resolve:{alias:{'lossless-json':path.join(root,'node_modules/lossless-json/lib/esm/index.js')}},test:{environment:'node',include:['qa/engine.test.mjs'],restoreMocks:true}});
