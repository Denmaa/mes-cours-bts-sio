/* ==========================================================
   CONVERTISSEUR DÉCIMAL · BINAIRE · HEXADÉCIMAL
   HTML : section id="cvb" dans math.html — styles : css/outils.css
   Pour qu'il soit ouvert au chargement : ajoute la classe "cvb-open"
   sur <section id="cvb">.
   ========================================================== */
(function(){
  var root=document.getElementById("cvb");
  /* Accordéon */
  var tog=document.getElementById("cvb-toggle"),body=document.getElementById("cvb-body"),sub=root.querySelector(".cvb-acc-sub");
  function setOpen(o){
    root.classList.toggle("cvb-open",o);tog.setAttribute("aria-expanded",String(o));
    if(o)body.removeAttribute("inert");else body.setAttribute("inert","");
    sub.textContent="Décimal, binaire et hexadécimal, nombres à virgule compris. "+(o?"Clique pour fermer.":"Clique pour ouvrir.");
  }
  tog.addEventListener("click",function(){setOpen(!root.classList.contains("cvb-open"));});
  setOpen(root.classList.contains("cvb-open"));
  var $=function(id){return document.getElementById(id)};
  var inDec=$("cvb-in-dec"),inBin=$("cvb-in-bin"),inHex=$("cvb-in-hex"),err=$("cvb-err");
  var BASE={dec:10,bin:2,hex:16};
  var MAXF={10:40,2:32,16:8};          /* chiffres max après la virgule */
  var cur=null;                          /* valeur exacte : {n: numérateur, d: dénominateur} (BigInt) */
  var KEY="cvb-rows-v2";
  var DEFAULTS=["0","1","2","8","10","15","16","42","127","255","256","1024","0,5","0,25","0,1","12,375","3,14"];

  function pw(b,k){return BigInt(b)**BigInt(k);}
  function gcd(a,b){while(b){var t=a%b;a=b;b=t;}return a;}
  function reduce(n,d){var g=gcd(n,d);return g>1n?{n:n/g,d:d/g}:{n:n,d:d};}
  function toBig(s,base){return base===10?BigInt(s):BigInt((base===2?"0b":"0x")+s);}

  /* valeur exacte -> chiffres dans une base (partie entière, partie après la virgule, exact ou tronqué) */
  function toBase(v,base,maxF){
    var B=BigInt(base),ip=v.n/v.d,r=v.n%v.d,f="";
    if(maxF===undefined)maxF=MAXF[base];
    while(r>0n&&f.length<maxF){r*=B;f+=(r/v.d).toString(base);r%=v.d;}
    return {i:ip.toString(base).toUpperCase(),f:f.toUpperCase(),exact:r===0n};
  }
  function groupInt(s){if(s==="0")return "0";var p=s.padStart(Math.ceil(s.length/4)*4,"0");return p.match(/.{4}/g).join(" ");}
  function groupFrac(s){return s.match(/.{1,4}/g).join(" ");}
  function fmt(v,base,maxF){
    var o=toBase(v,base,maxF),s=base===2?groupInt(o.i):o.i;
    if(o.f)s+=","+(base===2?groupFrac(o.f):o.f);
    return s+(o.exact?"":"…");
  }
  function dec(v,maxF){return fmt(v,10,maxF===undefined?30:maxF);}

  function parse(src,raw){
    var v=raw.replace(/[\s_…]/g,"").replace(/^0[bx]/i,"").replace(",",".");
    if(v==="")return {empty:true};
    var base=BASE[src];
    var re={dec:/^\d*\.?\d*$/,bin:/^[01]*\.?[01]*$/,hex:/^[0-9a-f]*\.?[0-9a-f]*$/i}[src];
    if(!re.test(v)||v==="."){
      return {error:{dec:"Décimal : chiffres 0 à 9, avec une seule virgule.",bin:"Binaire : des 0 et des 1, avec une seule virgule.",hex:"Hexadécimal : 0–9 et A–F, avec une seule virgule."}[src]};
    }
    var p=v.split("."),ip=p[0]||"0",fp=p[1]||"";
    return reduce(toBig(ip+fp,base),pw(base,fp.length));
  }
  function fill(except){
    if(except!=="dec")inDec.value=fmt(cur,10);
    if(except!=="bin")inBin.value=fmt(cur,2);
    if(except!=="hex")inHex.value=fmt(cur,16);
  }
  function update(src){
    var el={dec:inDec,bin:inBin,hex:inHex}[src],r=parse(src,el.value);
    if(r.empty){cur=null;[inDec,inBin,inHex].forEach(function(i){if(i!==el)i.value=""});err.textContent="";render();return;}
    if(r.error){err.textContent=r.error;cur=null;render();return;}
    err.textContent="";cur=r;fill(src);render();
  }
  function setVal(v){cur=v;fill();err.textContent="";render();}

  function render(){
    var bits=$("cvb-bits"),steps=$("cvb-steps");
    if(cur===null){bits.innerHTML="";steps.innerHTML='<h3>Calcul détaillé</h3><p class="cvb-muted">Entre un nombre pour voir les étapes.</p>';return;}
    var b=toBase(cur,2),h=toBase(cur,16);
    var ni=b.i.padStart(Math.ceil(b.i.length/4)*4,"0").match(/.{4}/g);
    var nf=b.f?b.f.padEnd(Math.ceil(b.f.length/4)*4,"0").match(/.{4}/g):[];
    function nib(q){return '<div class="cvb-nib"><div class="cvb-nib-bits">'+q.split("").map(function(c){return '<span class="cvb-bit'+(c==="1"?" on":"")+'">'+c+'</span>'}).join("")+'</div><span class="cvb-nib-hex">'+parseInt(q,2).toString(16).toUpperCase()+'</span></div>';}
    bits.innerHTML=(ni.length+nf.length)>16?"":ni.map(nib).join("")+(nf.length?'<span class="cvb-point">,</span>'+nf.map(nib).join(""):"");

    var html='<h3 style="font-size:1.05rem">Calcul détaillé</h3>';
    var ip=cur.n/cur.d,fr={n:cur.n%cur.d,d:cur.d};

    /* Décimal -> binaire */
    var lines=[];
    if(ip<=1000000n){
      var n=ip,w=String(ip).length;
      if(n===0n)lines.push("0 ÷ 2 = 0  reste 0");
      while(n>0n){var q=n/2n;lines.push(String(n).padStart(w)+" ÷ 2 = "+String(q).padEnd(w)+"  reste "+(n%2n));n=q;}
      lines.push('<span class="cvb-muted">Restes lus de bas en haut :</span> <span class="cvb-bin">'+b.i+'</span>');
    }
    if(fr.n>0n){
      if(lines.length)lines.push("");
      lines.push('<span class="cvb-muted">Partie après la virgule : on multiplie par 2 et on garde le chiffre avant la virgule</span>');
      var r=fr.n,k=0,got="";
      while(r>0n&&k<16){var r2=r*2n,bit=r2/fr.d;lines.push(dec({n:r,d:fr.d})+" × 2 = "+dec({n:r2,d:fr.d})+"  → "+bit);got+=bit;r=r2%fr.d;k++;}
      if(r>0n)lines.push("… (ça ne tombe jamais juste : on s'arrête)");
      lines.push('<span class="cvb-muted">Chiffres lus de haut en bas :</span> <span class="cvb-bin">0,'+got+(r>0n?"…":"")+'</span>');
    }
    if(lines.length)html+='<div><h3><span class="cvb-dec">Décimal</span> → <span class="cvb-bin">binaire</span></h3><pre>'+lines.join("\n")+'</pre></div>';

    /* Binaire -> décimal (puissances de 2) */
    var bits2=b.i+b.f;
    if(bits2.length<=24){
      var t=[];
      for(var i=0;i<b.i.length;i++)if(b.i[i]==="1")t.push(b.i.length-1-i);
      for(var j=0;j<b.f.length;j++)if(b.f[j]==="1")t.push(-(j+1));
      var vals=t.map(function(p){return p>=0?String(pw(2,p)):dec({n:1n,d:pw(2,-p)})});
      html+='<div><h3><span class="cvb-bin">Binaire</span> → <span class="cvb-dec">décimal</span> : puissances de 2</h3><pre>'+(t.length?t.map(function(p){return "2^"+p}).join(" + "):"0")+'\n= '+(t.length?vals.join(" + "):"0")+'\n'+(b.exact?"= ":"≈ ")+'<span class="cvb-dec">'+dec(cur)+'</span></pre></div>';
    }

    /* Hexa -> décimal (puissances de 16) */
    if(h.i.length+h.f.length<=8){
      var parts=[];
      h.i.split("").forEach(function(c,i){parts.push({c:c,v:parseInt(c,16),p:h.i.length-1-i})});
      h.f.split("").forEach(function(c,i){parts.push({c:c,v:parseInt(c,16),p:-(i+1)})});
      parts=parts.filter(function(x){return x.v>0||parts.length===1});
      html+='<div><h3><span class="cvb-hex">Hexa</span> → <span class="cvb-dec">décimal</span> : puissances de 16</h3><pre>'+parts.map(function(x){return x.c+"("+x.v+") × 16^"+x.p}).join(" + ")+'\n= '+parts.map(function(x){return x.p>=0?String(BigInt(x.v)*pw(16,x.p)):dec({n:BigInt(x.v),d:pw(16,-x.p)})}).join(" + ")+'\n'+(h.exact?"= ":"≈ ")+'<span class="cvb-dec">'+dec(cur)+'</span></pre></div>';
    }

    /* Binaire <-> hexa */
    if(ni.length+nf.length<=16){
      var top=ni.join("   ")+(nf.length?" , "+nf.join("   "):"");
      var bot=ni.map(function(q){return parseInt(q,2).toString(16).toUpperCase().padStart(4)}).join("   ")+(nf.length?"   "+nf.map(function(q){return parseInt(q,2).toString(16).toUpperCase().padStart(4)}).join("   "):"");
      html+='<div><h3><span class="cvb-bin">Binaire</span> ↔ <span class="cvb-hex">hexa</span> : paquets de 4 bits</h3><pre>'+top+'\n'+bot+'\n<span class="cvb-muted">Avant la virgule on complète à gauche, après la virgule on complète à droite.</span></pre></div>';
    }
    if(!b.exact)html+='<p class="cvb-muted" style="font-size:.85rem">« … » : la conversion ne tombe pas juste. Le résultat est coupé à 32 bits (8 chiffres hexa) après la virgule.</p>';
    steps.innerHTML=html;
  }

  /* Tableau perso : chaque ligne est stockée en "numérateur/dénominateur" */
  function key(v){return v.n+"/"+v.d;}
  function unkey(s){var p=String(s).split("/");return {n:BigInt(p[0]),d:BigInt(p[1]||"1")};}
  var rows;try{rows=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  function defaults(){return DEFAULTS.map(function(s){return key(parse("dec",s))});}
  if(!Array.isArray(rows))rows=defaults();
  function save(){try{localStorage.setItem(KEY,JSON.stringify(rows))}catch(e){}}
  function renderTable(){
    var tb=$("cvb-tbody");
    if(!rows.length){tb.innerHTML='<tr><td colspan="4" class="cvb-muted">Tableau vide : convertis un nombre puis clique « Ajouter au tableau ».</td></tr>';return;}
    tb.innerHTML=rows.slice().sort(function(a,b){a=unkey(a);b=unkey(b);var x=a.n*b.d,y=b.n*a.d;return x<y?-1:x>y?1:0}).map(function(k){
      var v=unkey(k);
      return '<tr data-v="'+k+'"><td class="cvb-dec">'+fmt(v,10)+'</td><td class="cvb-bin">'+fmt(v,2)+'</td><td class="cvb-hex">'+fmt(v,16)+'</td><td class="cvb-del"><button type="button" data-del="'+k+'" aria-label="Supprimer">✕</button></td></tr>';
    }).join("");
  }

  inDec.addEventListener("input",function(){update("dec")});
  inBin.addEventListener("input",function(){update("bin")});
  inHex.addEventListener("input",function(){update("hex")});
  inBin.addEventListener("blur",function(){if(cur!==null&&!err.textContent)inBin.value=fmt(cur,2)});
  $("cvb-tbody").addEventListener("click",function(e){
    var d=e.target.closest("[data-del]");
    if(d){rows=rows.filter(function(r){return r!==d.dataset.del});save();renderTable();return;}
    var tr=e.target.closest("tr[data-v]");
    if(tr){setVal(unkey(tr.dataset.v));root.scrollIntoView({behavior:"smooth",block:"start"});}
  });
  $("cvb-add").addEventListener("click",function(){
    if(cur===null){err.textContent="Entre d'abord un nombre valide.";return;}
    var k=key(cur);if(rows.indexOf(k)<0){rows.push(k);save();}renderTable();
  });
  $("cvb-clear").addEventListener("click",function(){inDec.value=inBin.value=inHex.value="";cur=null;err.textContent="";render();inDec.focus();});
  $("cvb-reset").addEventListener("click",function(){rows=defaults();save();renderTable();});
  root.querySelectorAll(".cvb-chips button").forEach(function(btn){btn.addEventListener("click",function(){setVal(parse("dec",btn.dataset.v))})});

  var ref="";for(var k=0;k<16;k++)ref+='<div><span class="cvb-dec">'+k+'</span><span class="cvb-bin">'+k.toString(2).padStart(4,"0")+'</span><span class="cvb-hex">'+k.toString(16).toUpperCase()+'</span></div>';
  $("cvb-ref").innerHTML=ref;

  /* Pas de valeur par défaut : les champs sont vides au chargement */
  render();renderTable();
})();
