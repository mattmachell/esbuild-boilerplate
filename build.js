import {sassPlugin} from 'esbuild-sass-plugin'
import esbuild from 'esbuild'
import { cp } from 'fs/promises';

(async () => {

  const width= process.stdout.columns || 40;
  const hr = "\r\n".padStart(width/1.5, '-');

  let config = {
    entrypoints : ['./example/main.js', './example/main.scss'],
    copy_files : {
      './example/component/component_icon.svg':'component/component_icon.svg',
      './node_modules/govuk-frontend/govuk/assets':'assets'
    },
    out_dir:'./dist'
  }

  console.log(`${hr}- Building with:\r\n\r\n${config.entrypoints.join("\r\n")}\r\n${hr}`);

  let result = await esbuild.build({
      entryPoints: config.entrypoints,
      bundle: true,
      outdir: config.out_dir,
      minify: true,
      target: ['es6'],
      plugins: [sassPlugin()],
      metafile : true,
      treeShaking: true,
      }).catch(() => process.exit(1))
  console.log(hr);

  let text = await esbuild.analyzeMetafile(result.metafile)
  console.log(`- Analysis:\r\n${text}${hr}`)

  //files to copy (uses experimental node cp)
  console.log(`- Copying files:\r\n`)
  for (const [file, file_dest] of Object.entries(config.copy_files)) { 
    const destination = config.out_dir + '/' + file_dest;
    await cp(file, destination, {recursive:true});
    console.log(`Copied file from ${file} file to ${destination}`);
  }
  console.log(hr);

})()
