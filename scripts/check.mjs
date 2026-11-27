import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const pages=['index.html','building-energy.html','heat-recovery.html'];
let checked=0;
for(const page of pages){
 const html=await readFile(path.join(root,page),'utf8');
 if((html.match(/<h1[\s>]/g)||[]).length!==1)throw Error(`${page}: expected one h1`);
 if(/\b(?:TODO|undefined|GALLERY\d+)\b/.test(html))throw Error(`${page}: unresolved content`);
 for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(?:https?:|data:)/.test(raw))continue;
  const url=new URL(raw,`https://portfolio.local/${page}`);
  const file=path.join(root,decodeURIComponent(url.pathname));
  await access(file);
  if(url.hash){
   const target=await readFile(file,'utf8');
   if(!target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))throw Error(`Broken anchor ${page}: ${raw}`);
  }
  checked++;
 }
 for(const image of html.matchAll(/<img\b[^>]*>/g))if(!/alt="[^"]*"/.test(image[0]))throw Error(`${page}: missing image alt`);
}
const home=await readFile(path.join(root,'index.html'),'utf8');
if((home.match(/class="other-project"/g)||[]).length!==7)throw Error('Expected seven other projects');
const research=await readFile(path.join(root,'building-energy.html'),'utf8');
if((research.match(/class="research-project"/g)||[]).length!==5)throw Error('Expected five research projects');
if((research.match(/<li>/g)||[]).length!==19)throw Error('Expected 19 research contribution and finding bullets');
if((research.match(/<h3>/g)||[]).length!==16)throw Error('Expected 16 research subsection headings');
console.log(`PASS: 3 pages, ${checked} local file/anchor references, image alt text, 7 other projects, 5 research projects.`);
