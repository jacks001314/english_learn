const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function safeURL(value){
  const url=String(value||'').trim();
  if(!url)return '';
  if(/^(https?:|mailto:)/i.test(url)||/^(#|\/|\.\/|\.\.\/)/.test(url))return escapeHTML(url);
  return '';
}

function inlineMarkdown(text,stash){
  let value=escapeHTML(text);
  value=value.replace(/`([^`\n]+)`/g,(_,code)=>stash(`<code>${code}</code>`));
  value=value.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g,(_,alt,url)=>{const safe=safeURL(url);return safe?`<img src="${safe}" alt="${alt}" loading="lazy">`:`![${alt}](${escapeHTML(url)})`});
  value=value.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g,(_,label,url)=>{const safe=safeURL(url);return safe?`<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`:`${label} (${escapeHTML(url)})`});
  value=value.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_\n]+)__/g,'<strong>$1</strong>');
  value=value.replace(/~~([^~\n]+)~~/g,'<del>$1</del>');
  value=value.replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>').replace(/(^|[^_])_([^_\n]+)_/g,'$1<em>$2</em>');
  return value;
}

function renderTable(lines,start,inline){
  if(start+1>=lines.length||!/^\s*\|?\s*:?-{3,}/.test(lines[start+1]))return null;
  const split=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
  const heads=split(lines[start]),separators=split(lines[start+1]);
  if(heads.length<2||separators.length!==heads.length||separators.some(x=>!/^:?-{3,}:?$/.test(x)))return null;
  const aligns=separators.map(x=>x.startsWith(':')&&x.endsWith(':')?'center':x.endsWith(':')?'right':'left');
  const rows=[];let i=start+2;
  while(i<lines.length&&lines[i].includes('|')&&lines[i].trim()){const cells=split(lines[i]);rows.push(cells);i++}
  const head=heads.map((x,j)=>`<th style="text-align:${aligns[j]}">${inline(x)}</th>`).join('');
  const body=rows.map(row=>`<tr>${heads.map((_,j)=>`<td style="text-align:${aligns[j]}">${inline(row[j]||'')}</td>`).join('')}</tr>`).join('');
  return {html:`<div class="md-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,next:i};
}

export function renderMarkdown(source){
  const tokens=[];
  const stash=html=>{const key=`\u0000MD${tokens.length}\u0000`;tokens.push(html);return key};
  let text=String(source??'').replace(/\r\n?/g,'\n');
  text=text.replace(/```([^\n`]*)\n([\s\S]*?)```/g,(_,lang,code)=>stash(`<pre><code${lang.trim()?` class="language-${escapeHTML(lang.trim().replace(/[^\w-]/g,''))}"`:''}>${escapeHTML(code.replace(/\n$/,''))}</code></pre>`));
  const lines=text.split('\n'),out=[];let paragraph=[],list=null;
  const inline=value=>inlineMarkdown(value,stash);
  const flushParagraph=()=>{if(paragraph.length){out.push(`<p>${inline(paragraph.join('\n')).replace(/\n/g,'<br>')}</p>`);paragraph=[]}};
  const flushList=()=>{if(list){out.push(`<${list.type}>${list.items.join('')}</${list.type}>`);list=null}};
  for(let i=0;i<lines.length;){const line=lines[i],trim=line.trim();
    if(!trim){flushParagraph();flushList();i++;continue}
    const table=renderTable(lines,i,inline);if(table){flushParagraph();flushList();out.push(table.html);i=table.next;continue}
    const heading=/^(#{1,6})\s+(.+)$/.exec(trim);if(heading){flushParagraph();flushList();const n=heading[1].length;out.push(`<h${n}>${inline(heading[2])}</h${n}>`);i++;continue}
    if(/^([-*_])(?:\s*\1){2,}$/.test(trim)){flushParagraph();flushList();out.push('<hr>');i++;continue}
    const quote=/^>\s?(.*)$/.exec(trim);if(quote){flushParagraph();flushList();const parts=[];while(i<lines.length){const q=/^\s*>\s?(.*)$/.exec(lines[i]);if(!q)break;parts.push(q[1]);i++}out.push(`<blockquote><p>${inline(parts.join('\n')).replace(/\n/g,'<br>')}</p></blockquote>`);continue}
    const unordered=/^[-+*]\s+(.+)$/.exec(trim),ordered=/^\d+[.)]\s+(.+)$/.exec(trim),match=unordered||ordered;
    if(match){flushParagraph();const type=ordered?'ol':'ul';if(list&&list.type!==type)flushList();if(!list)list={type,items:[]};let body=match[1];const task=/^\[([ xX])\]\s+(.+)$/.exec(body);if(task)body=`<input type="checkbox" disabled${task[1].toLowerCase()==='x'?' checked':''}> ${inline(task[2])}`;else body=inline(body);list.items.push(`<li>${body}</li>`);i++;continue}
    flushList();paragraph.push(line);i++;
  }
  flushParagraph();flushList();
  let html=out.join('');tokens.forEach((token,index)=>{html=html.split(`\u0000MD${index}\u0000`).join(token)});
  return html;
}
