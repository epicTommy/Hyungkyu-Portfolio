import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
const read = name => readFile(path.join(root, 'content', name), 'utf8');
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const routes = { 'Building Energy Modeling & Monitoring.md': 'building-energy.html', 'heat_recovery.md': 'heat-recovery.html' };
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
function inline(text) {
  return esc(text.replaceAll('📄 ', '').replaceAll('Presentaion', 'Presentation'))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const target = routes[decodeURIComponent(href)] || href;
      const external = /^(https:|documents\/)/.test(target);
      return `<a class="text-link" href="${target}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}${arrow}${external ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
const alts = {
 'vip-f-26-1.png': 'Air handling unit energy consumption analysis',
 'vip-f-26-3.png': 'Building carbon emissions analysis',
 'S-26-VIP-Poster.png': 'Foundation Building energy modeling research poster',
 'S26-IS-2.png': 'Foundation Building eQUEST model and thermal zoning',
 'S26-IS-1.png': 'Foundation Building energy modeling study',
 'S26-VIP.png': 'Foundation Building energy conservation analysis',
 'F26-VIP.png': 'Foundation Building air handling unit monitoring study',
 'F26-VIP-1.png': 'Air handling unit current measurements',
 'heat-recovery-concept.png': 'HVAC exhaust heat recovery concept',
 'heat-exchanger-performance.png': 'Heat exchanger performance comparison'
};
function markdown(source) {
  // These supplied Markdown files often omit a blank line after subheadings.
  // Split heading lines before grouping paragraphs so their body is never a heading.
  source = source.replace(/^### ([^\n]+)\n/gm, '### $1\n\n');
  source = source.replace(/^\*\*(Description|What I Did|Key Findings|Methods)\*\*[ \t]*\n/gm, '**$1**\n\n');
  const galleries = [];
  source = source.replace(/<p align="center">([\s\S]*?)<\/p>/g, (_, block) => {
    const imgs = [...block.matchAll(/src="([^"]+)"/g)].map(([,src]) => {
      const alt = alts[src.split('/').pop()] || 'Project research figure';
      return `<a class="figure-link" href="${src}" data-lightbox aria-label="Enlarge: ${esc(alt)}"><img src="${src}" alt="${esc(alt)}" loading="lazy" width="960" height="540"><span class="expand-mark" aria-hidden="true">↗</span></a>`;
    });
    galleries.push(`<div class="figure-grid">${imgs.join('')}</div>`);
    return `\n\nGALLERY${galleries.length - 1}\n\n`;
  });
  return source.trim().split(/\n\s*\n/).map(block => {
    block = block.trim();
    if (/^GALLERY\d+$/.test(block)) return galleries[Number(block.slice(7))];
    if (block === '---') return '';
    if (block.startsWith('- ')) return `<ul>${block.split('\n').filter(Boolean).map(x=>`<li>${inline(x.replace(/^- /,''))}</li>`).join('')}</ul>`;
    if (/^#### /.test(block)) return `<div class="document-links">${block.split('\n').map(x => inline(x.replace(/^#### /,''))).join('')}</div>`;
    if (/^### /.test(block)) return `<h3>${inline(block.slice(4))}</h3>`;
    if (/^\*\*(Description|What I Did|Key Findings|Methods)\*\*$/.test(block)) return `<h3>${inline(block.replaceAll('**',''))}</h3>`;
    if (/^\*[^*]+\*$/.test(block)) return `<p class="meta">${inline(block.replaceAll('*',''))}</p>`;
    return `<p>${inline(block).replaceAll('\n',' ')}</p>`;
  }).join('\n');
}
function shell(title, description, content, detail = false) {
  return `<!doctype html>
<html lang="en" data-type="service"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#f7f7f5"><meta name="page-type" content="service"><meta name="site-kind" content="other">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website">
<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<script src="app.js" defer></script></head>
<body id="top" class="${detail ? 'detail-page' : 'home-page'}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header wrap"><a class="wordmark" href="index.html">Hyungkyu Lee</a><nav aria-label="Main navigation"><a href="${detail ? 'index.html' : ''}#selected-work">Selected Work</a><a href="${detail ? 'index.html' : ''}#other-work">Other Work</a><a href="documents/Hyungkyu_Lee_CV.pdf" target="_blank" rel="noopener noreferrer">CV<span class="sr-only"> (opens in a new tab)</span></a><a href="https://www.linkedin.com/in/hyungkyutom" target="_blank" rel="noopener noreferrer">LinkedIn<span class="sr-only"> (opens in a new tab)</span></a></nav></header>
${content}
<footer class="site-footer wrap"><span>Hyungkyu (Tom) Lee <span class="footer-field"> / Mechanical Engineering</span></span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></footer>
<dialog class="lightbox" aria-label="Enlarged project figure"><div class="lightbox-bar"><span>Project figure</span><button type="button" class="close-lightbox" aria-label="Close enlarged figure">Close <span aria-hidden="true">×</span></button></div><img class="lightbox-image" alt=""></dialog>
</body></html>`;
}
const home = await read('index.md');
const intro = home.split('# Hyungkyu (Tom) Lee\n')[1].split('\n\n')[0].trim();
const selected = home.split('# Selected Work\n')[1].split('# Other Work')[0];
const selectedHTML = selected.split(/^## \d+\. /m).slice(1).map((part, i) => {
  const [title, ...bodyLines] = part.split('\n');
  const thumb = i === 0 ? 'image/S26-IS-2.png' : 'image/heat-recovery-concept.png';
  const link = i === 0 ? 'building-energy.html' : 'heat-recovery.html';
  return `<article class="selected-project"><div class="project-text"><h3><a href="${link}">${esc(title)}</a></h3>${markdown(bodyLines.join('\n'))}</div><a class="project-preview" href="${link}" tabindex="-1" aria-hidden="true"><img src="${thumb}" alt="" loading="lazy" width="960" height="540"></a></article>`;
}).join('');
const other = home.split('# Other Work\n')[1];
const otherImages = JSON.parse(await read('other-work-images.json'));
const otherHTML = other.split(/^## /m).slice(1).map(group => {
  const [category, ...rest] = group.split('\n');
  const items = rest.join('\n').split(/^### /m).slice(1).map(block => {
    const [title, ...lines] = block.split('\n');
    const text = lines.join('\n');
    const date = text.match(/\*([^*]+)\*/)?.[1] || '';
    const image = otherImages[title];
    const preview = image ? `<a class="figure-link other-preview" href="${esc(image.image)}" data-lightbox aria-label="Enlarge: ${esc(image.alt)}"><img src="${esc(image.preview)}" alt="${esc(image.alt)}" loading="lazy" width="${image.width}" height="${image.height}"></a>` : '';
    return `<article class="other-project"><div class="other-title"><h4>${esc(title)}</h4><p class="meta">${esc(date.replace('2023-Spring','2023–Spring'))}</p><div class="other-body">${markdown(text.replace(/\*[^*]+\*/,''))}</div></div>${preview}</article>`;
  }).join('');
  return `<section class="work-category"><h3 class="category-heading">${esc(category)}</h3>${items}</section>`;
}).join('');
const homeContent = `<main id="main" class="wrap"><section class="intro" aria-labelledby="name"><p class="eyebrow">Mechanical Engineering <span aria-hidden="true">/</span> The Cooper Union</p><h1 id="name">Hyungkyu (Tom) Lee</h1><p class="intro-copy">${esc(intro)}</p><ul class="interests" aria-label="Interests"><li>Thermal Energy</li><li>Energy Storage</li><li>Building Energy</li><li>Data-Driven Methods</li><li>AI Applications</li><li>Startups</li></ul></section><section id="selected-work" class="work-section"><div class="section-heading"><h2>Selected Work</h2><span aria-hidden="true">01 — 02</span></div>${selectedHTML}</section><section id="other-work" class="work-section other-work"><div class="section-heading"><h2>Other Work</h2></div>${otherHTML}</section></main>`;
await writeFile(path.join(out,'index.html'), shell('Hyungkyu (Tom) Lee — Mechanical Engineering', intro, homeContent));
const research = await read('Building Energy Modeling & Monitoring.md');
const [researchIntro, ...projects] = research.split(/^## \d+\. /m);
const researchTitle = researchIntro.split('\n')[0].replace('# ','');
const researchDescription = researchIntro.split('\n').slice(1).filter(line => line.trim() !== '---').join('\n').trim();
// Preserve existing deep links when projects are reordered or their titles are refined.
const researchAnchors = {
  'Hybrid Heat Pump Retrofit with Thermal Energy Storage and Optimal Control for 41 Cooper Square': 'project-5',
  'Building Energy & Carbon Analysis': 'project-1',
  'Foundation Building Energy Modeling & HVAC Optimization': 'project-2',
  'BEAM: Building Energy Monitoring & Forecasting': 'project-3',
  'Foundation Building AHU Monitoring': 'project-4'
};
const sections = projects.map((part, i) => { const [title, ...body] = part.split('\n'); return {id:researchAnchors[title] || `project-${i+1}`,title,body:body.join('\n')}; });
const researchContent = `<main id="main" class="wrap"><div class="detail-intro"><a class="back-link" href="index.html#selected-work">← Selected Work</a><h1>${esc(researchTitle)}</h1><p class="detail-lede">${esc(researchDescription)}</p></div><div class="research-layout"><nav class="project-nav" aria-label="Research projects"><p>Projects</p>${sections.map((s,i)=>`<a href="#${s.id}"><span class="project-number">0${i+1}</span><span>${esc(s.title)}</span></a>`).join('')}</nav><div class="research-content">${sections.map((s,i)=>`<section id="${s.id}" class="research-project"><span class="project-index">0${i+1}</span><h2>${esc(s.title)}</h2>${markdown(s.body)}</section>`).join('')}</div></div></main>`;
await writeFile(path.join(out,'building-energy.html'),shell(`${researchTitle} — Hyungkyu (Tom) Lee`,researchDescription,researchContent,true));
const heat = await read('heat_recovery.md');
const heatTitle = heat.split('\n')[0].replace('# ','');
const heatBody = heat.split('\n').slice(2).join('\n');
const heatContent = `<main id="main" class="wrap"><div class="detail-intro heat-intro"><a class="back-link" href="index.html#selected-work">← Selected Work</a><h1>${esc(heatTitle)}</h1><p class="meta">Heat Transfer · Spring 2026</p></div><article class="heat-content">${markdown(heatBody)}</article></main>`;
await writeFile(path.join(out,'heat-recovery.html'),shell(`${heatTitle} — Hyungkyu (Tom) Lee`,'Heat exchanger design and analysis for HVAC exhaust heat recovery at Cooper Union’s 41 Cooper Square.',heatContent,true));
for (const folder of ['image','documents']) await cp(path.join(root,'content',folder),path.join(out,folder),{recursive:true});
for (const file of ['styles.css','app.js','favicon.svg']) await cp(path.join(root,'src',file),path.join(out,file));
console.log('Built 3 pages with original project images and documents in dist/.');
