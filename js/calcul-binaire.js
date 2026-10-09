/* ==========================================================
   CALCULATRICE BINAIRE · + − × ÷ avec le calcul posé
   HTML : section id="cbc" dans math.html — styles : css/outils.css
   Même fonctionnement que le convertisseur : accordéon fermé par défaut,
   ajoute la classe "cvb-open" sur <section id="cbc"> pour l'ouvrir au chargement.
   ========================================================== */
(function(){
  var root=document.getElementById("cbc");
  if(!root)return;
  var $=function(id){return document.getElementById(id)};

  /* ---------- Accordéon ---------- */
  var tog=$("cbc-toggle"),body=$("cbc-body"),sub=root.querySelector(".cvb-acc-sub");
  var SUB="Addition, soustraction, multiplication et division en binaire, avec le calcul posé. ";
  function setOpen(o){
    root.classList.toggle("cvb-open",o);tog.setAttribute("aria-expanded",String(o));
    if(o)body.removeAttribute("inert");else body.setAttribute("inert","");
    sub.textContent=SUB+(o?"Clique pour fermer.":"Clique pour ouvrir.");
  }
  tog.addEventListener("click",function(){setOpen(!root.classList.contains("cvb-open"));});
  setOpen(root.classList.contains("cvb-open"));

  /* ---------- Éléments ---------- */
  var inA=$("cbc-a"),inB=$("cbc-b"),err=$("cbc-err"),out=$("cbc-result"),steps=$("cbc-steps"),bitsEl=$("cbc-bits");
  var opBtns=root.querySelectorAll(".cbc-ops button");
  var SYM={"+":"+","-":"−","*":"×","/":"÷"};
  var NOM={"+":"Addition","-":"Soustraction","*":"Multiplication","/":"Division"};
  var MAXBITS=64;
  var op="+",cur=null;
  var KEY="cbc-historique-v1";

  /* ---------- Outils ---------- */
  function bin(v){return v.toString(2);}
  function hex(v){return v.toString(16).toUpperCase();}
  function grp(s){return s.replace(/\B(?=(\d{4})+(?!\d))/g," ");}   /* paquets de 4 bits depuis la droite */
  function nbits(v,n){return grp(v.toString(2).padStart(n,"0"));}
  function sgn(v){return v<0n?"−":"";}
  function n10(v){return sgn(v)+abs(v);}                              /* nombre avec un vrai signe moins */
  function abs(v){return v<0n?-v:v;}
  function bitAt(s,i){var k=s.length-1-i;return k>=0?+s[k]:0;}         /* bit de rang i (0 = à droite) */
  function cols(s,W){return s.padStart(W," ").split("").join(" ");}    /* un chiffre par colonne */
  function row(label,s,W,note){return label.padEnd(12)+cols(s,W)+(note?"   "+note:"");}
  function line(W){return " ".repeat(12)+"─".repeat(2*W-1);}
  function d10(v){return '<span class="cvb-dec">'+v+'</span>';}
  function b2(s){return '<span class="cvb-bin">'+s+'</span>';}

  /* Lecture d'un nombre binaire tapé par l'élève */
  function parse(raw){
    var v=raw.replace(/[\s_]/g,"").replace(/^0b/i,"");
    if(v==="")return {empty:true};
    if(!/^[01]+$/.test(v))return {error:"Un nombre binaire ne contient que des 0 et des 1 (pas de virgule ici)."};
    var s=v.replace(/^0+(?=.)/,"");
    if(s.length>MAXBITS)return {error:"Maximum "+MAXBITS+" bits par nombre."};
    return {s:s,v:BigInt("0b"+s)};
  }

  /* Petit rappel sous chaque champ : la valeur en décimal et en hexa */
  function hint(el,r){
    if(!r||r.empty||r.error){el.innerHTML="&nbsp;";return;}
    el.innerHTML="= "+d10(r.v)+" en décimal · "+'<span class="cvb-hex">0x'+hex(r.v)+"</span>";
  }

  /* ---------- Calcul ---------- */
  function compute(a,b,o){
    if(o==="+")return {r:a.v+b.v};
    if(o==="-")return {r:a.v-b.v};
    if(o==="*")return {r:a.v*b.v};
    if(b.v===0n)return {error:"Division par 0 impossible."};
    return {r:a.v/b.v,rem:a.v%b.v};
  }

  function update(){
    var a=parse(inA.value),b=parse(inB.value);
    hint($("cbc-a-eq"),a);hint($("cbc-b-eq"),b);
    cur=null;
    var e=(a.error?"Nombre A : "+a.error:"")||(b.error?"Nombre B : "+b.error:"");
    if(!e&&!a.empty&&!b.empty){
      var c=compute(a,b,op);
      if(c.error)e=c.error;else cur={a:a,b:b,op:op,r:c.r,rem:c.rem};
    }
    err.textContent=e;
    render();
  }

  /* ---------- Affichage du résultat ---------- */
  function render(){
    if(!cur){
      out.innerHTML='<p class="cvb-muted">Entre deux nombres binaires pour voir le résultat.</p>';
      bitsEl.innerHTML="";
      steps.innerHTML='<h3>Calcul posé</h3><p class="cvb-muted">Le détail du calcul s\'affichera ici.</p>';
      return;
    }
    var r=cur.r,isDiv=cur.op==="/";
    var h='<div class="cbc-res-title">'+(isDiv?"Quotient":"Résultat")+' de '+b2(grp(cur.a.s))+" "+SYM[cur.op]+" "+b2(grp(cur.b.s))+'</div>';
    h+='<div class="cbc-res-grid">'
      +'<span class="cvb-label cvb-bin">Binaire</span><output class="cvb-bin">'+sgn(r)+grp(bin(abs(r)))+'</output>'
      +'<span class="cvb-label cvb-dec">Décimal</span><output class="cvb-dec">'+sgn(r)+abs(r)+'</output>'
      +'<span class="cvb-label cvb-hex">Hexa</span><output class="cvb-hex">'+sgn(r)+"0x"+hex(abs(r))+'</output>';
    if(isDiv)h+='<span class="cvb-label">Reste</span><output>'+b2(grp(bin(cur.rem)))+' <span class="cvb-muted">('+cur.rem+')</span></output>';
    h+='</div>';
    out.innerHTML=h;

    /* Bits du résultat, regroupés par 4 avec le chiffre hexa dessous */
    var s=bin(abs(r)),ni=s.padStart(Math.ceil(s.length/4)*4,"0").match(/.{4}/g);
    bitsEl.innerHTML=ni.length>16?"":(r<0n?'<span class="cvb-point">−</span>':"")+ni.map(function(q){
      return '<div class="cvb-nib"><div class="cvb-nib-bits">'+q.split("").map(function(c){return '<span class="cvb-bit'+(c==="1"?" on":"")+'">'+c+'</span>'}).join("")+'</div><span class="cvb-nib-hex">'+parseInt(q,2).toString(16).toUpperCase()+'</span></div>';
    }).join("");

    var html='<h3>Calcul posé : '+NOM[cur.op].toLowerCase()+'</h3>';
    html+={"+":stepsAdd,"-":stepsSub,"*":stepsMul,"/":stepsDiv}[cur.op](cur.a,cur.b,cur);
    steps.innerHTML=html;
  }

  /* ---------- Addition : retenues ---------- */
  function addCols(x,y){
    var W=Math.max(x.length,y.length)+1,c=[0],res="",expl=[];
    for(var i=0;i<W;i++){
      var ai=bitAt(x,i),bi=bitAt(y,i),t=ai+bi+c[i];
      res=(t%2)+res;c[i+1]=t>>1;
      if(i<W-1||t>0)expl.push("rang "+i+" : "+ai+" + "+bi+(c[i]?" + 1 (retenue)":"")+" = "+t.toString(2)+"  → on écrit "+(t%2)+(c[i+1]?", retenue 1":""));
    }
    return {res:res.replace(/^0+(?=.)/,""),c:c,expl:expl};
  }
  function stepsAdd(a,b,o){
    var k=addCols(a.s,b.s),W=Math.max(a.s.length,b.s.length,k.res.length);
    var car="";for(var i=W-1;i>=0;i--)car+=k.c[i]?"1":" ";
    var t=[
      '<span class="cvb-muted">'+row("retenues",car,W)+'</span>',
      row("A",a.s,W,"("+a.v+")"),
      row("+ B",b.s,W,"("+b.v+")"),
      line(W),
      row("=",k.res,W,"("+o.r+")")
    ];
    var html='<div><pre>'+t.join("\n")+'</pre></div>';
    if(W<=16)html+='<div><h3>Colonne par colonne (de droite à gauche)</h3><pre>'+k.expl.join("\n")+'</pre></div>';
    html+=check(a.v+" + "+b.v+" = "+o.r);
    return html;
  }

  /* ---------- Soustraction : emprunts + complément à 2 ---------- */
  function subCols(x,y){            /* x ≥ y */
    var W=x.length,br=[0],res="",expl=[];
    for(var i=0;i<W;i++){
      var ai=bitAt(x,i),bi=bitAt(y,i),d=ai-bi-br[i],neg=d<0;
      if(neg)d+=2;br[i+1]=neg?1:0;res=d+res;
      var calc=ai+" − "+bi+(br[i]?" − 1 (emprunt)":"");
      expl.push("rang "+i+" : "+calc+(neg?" < 0 → on emprunte 1 au rang "+(i+1)+" (il vaut 2 ici) : 2 + "+calc.replace(" (emprunt)","")+" = "+d:" = "+d)+"  → on écrit "+d);
    }
    return {res:res.replace(/^0+(?=.)/,""),br:br,expl:expl};
  }
  function stepsSub(a,b,o){
    var big=a,small=b,swap=a.v<b.v;
    if(swap){big=b;small=a;}
    var k=subCols(big.s,small.s),W=big.s.length;
    var emp="";for(var i=W-1;i>=0;i--)emp+=k.br[i]?"1":" ";
    var html="";
    if(swap)html+='<p class="cvb-muted">A est plus petit que B : on calcule B − A, puis on met un signe moins devant le résultat.</p>';
    var t=[
      '<span class="cvb-muted">'+row("emprunts",emp,W)+'</span>',
      row(swap?"B":"A",big.s,W,"("+big.v+")"),
      row(swap?"− A":"− B",small.s,W,"("+small.v+")"),
      line(W),
      row("=",k.res,W,"("+(big.v-small.v)+")")
    ];
    html+='<div><pre>'+t.join("\n")+'</pre></div>';
    if(swap)html+='<p>Donc A − B = '+b2("−"+grp(k.res))+' = '+d10(n10(o.r))+'</p>';
    if(W<=16)html+='<div><h3>Colonne par colonne (de droite à gauche)</h3><pre>'+k.expl.join("\n")+'</pre></div>';

    /* Méthode de la machine : A + complément à 2 de B */
    var m=Math.max(a.s.length,b.s.length)+1,n=m<=8?8:m<=16?16:m<=32?32:m<=64?64:0;
    if(n&&b.v>0n){
      var N=BigInt(n),mask=(1n<<N)-1n,inv=mask^b.v,c2=(inv+1n)&mask,sum=a.v+c2,res=sum&mask,over=sum>>N;
      var neg=(res>>(N-1n))===1n,mag=neg?((mask^res)+1n)&mask:res;
      var L=34,R=function(l,v){return l.padEnd(L)+v;};
      var u=[
        R("A sur "+n+" bits",nbits(a.v,n)),
        R("B sur "+n+" bits",nbits(b.v,n)),
        R("On inverse les bits de B (C1)",nbits(inv,n)),
        R("On ajoute 1 → C2(B) = −B",nbits(c2,n)),
        R("A + C2(B)",(over?"1 ":"")+nbits(res,n)+(over?'   <span class="cvb-muted">← le 1 qui dépasse est ignoré</span>':""))
      ];
      if(neg)u.push(R("Bit de gauche = 1 → négatif",'on reprend le C2 : '+nbits(mag,n)+' = '+mag+' → '+d10("−"+mag)));
      else u.push(R("Bit de gauche = 0 → positif",nbits(res,n)+" = "+d10(res)));
      html+='<div><h3>Méthode de l\'ordinateur : complément à 2</h3><pre>'+u.join("\n")+'</pre></div>';
    }
    html+=check(a.v+" − "+b.v+" = "+n10(o.r));
    return html;
  }

  /* ---------- Multiplication : produits partiels décalés ---------- */
  function stepsMul(a,b,o){
    var R=bin(o.r),W=Math.max(R.length,a.s.length,b.s.length);
    if(b.s.length>16||W>48)return '<p class="cvb-muted">Nombres trop longs pour poser le calcul ici : essaie avec moins de bits.</p>'+check(a.v+" × "+b.v+" = "+o.r);
    var t=[row("A",a.s,W,"("+a.v+")"),row("× B",b.s,W,"("+b.v+")"),line(W)],lignes=0;
    for(var i=0;i<b.s.length;i++){
      var bi=bitAt(b.s,i),p=(bi?a.s:"0".repeat(a.s.length))+"0".repeat(i);
      t.push(row(i===0?"":"+",p,W,'<span class="cvb-muted">← A × '+bi+(i?", décalé de "+i+" rang"+(i>1?"s":""):"")+'</span>'));
      if(bi)lignes++;
    }
    t.push(line(W));t.push(row("=",R,W,"("+o.r+")"));
    var html='<div><pre>'+t.join("\n")+'</pre></div>';
    html+='<p class="cvb-muted">Comme en décimal : chaque bit de B donne une ligne (A recopié si le bit vaut 1, que des 0 sinon), décalée d\'un rang de plus à chaque fois. On additionne ensuite les lignes avec les retenues.</p>';
    html+=check(a.v+" × "+b.v+" = "+o.r);
    return html;
  }

  /* ---------- Division euclidienne posée ---------- */
  function stepsDiv(a,b,o){
    if(a.s.length>32)return '<p class="cvb-muted">Nombre A trop long pour poser la division ici (32 bits max).</p>'+check(a.v+" = "+b.v+" × "+o.r+" + "+o.rem);
    var part=0n,q="",t=[],w=Math.max(a.s.length,b.s.length)+2;
    t.push('<span class="cvb-muted">On abaisse les bits de A un par un, de gauche à droite :</span>');
    for(var i=0;i<a.s.length;i++){
      part=part*2n+BigInt(a.s[i]);
      var ps=bin(part);
      if(part>=b.v){
        var rest=part-b.v;
        t.push("bit "+(i+1).toString().padStart(2)+" : "+ps.padStart(w)+"  ≥ "+b.s+"  → on écrit 1   "+ps+" − "+b.s+" = "+bin(rest));
        part=rest;q+="1";
      }else{
        t.push("bit "+(i+1).toString().padStart(2)+" : "+ps.padStart(w)+"  < "+b.s+"  → on écrit 0");
        q+="0";
      }
    }
    t.push("");
    t.push("Quotient = "+b2(q.replace(/^0+(?=.)/,""))+" ("+o.r+")   Reste = "+b2(bin(o.rem))+" ("+o.rem+")");
    t.push('<span class="cvb-muted">Vérification : B × quotient + reste = '+b.s+" × "+bin(o.r)+" + "+bin(o.rem)+" = "+bin(b.v*o.r+o.rem)+" = A</span>");
    var html='<div><pre>'+t.join("\n")+'</pre></div>';
    html+=check(a.v+" = "+b.v+" × "+o.r+" + "+o.rem+(o.rem>0n?"   (A ÷ B ≈ "+(Number(a.v)/Number(b.v)).toLocaleString("fr-FR",{maximumFractionDigits:4})+")":""));
    return html;
  }

  function check(txt){return '<p class="cbc-check">Vérification en décimal : '+d10(txt)+' ✓</p>';}

  /* ---------- Historique (stocké dans le navigateur) ---------- */
  var hist;try{hist=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!Array.isArray(hist))hist=[];
  function save(){try{localStorage.setItem(KEY,JSON.stringify(hist))}catch(e){}}
  function renderHist(){
    var tb=$("cbc-tbody");
    if(!hist.length){tb.innerHTML='<tr><td colspan="4" class="cvb-muted">Historique vide : fais un calcul puis clique « Ajouter à l\'historique ».</td></tr>';return;}
    tb.innerHTML=hist.map(function(h,i){
      var a=parse(h.a),b=parse(h.b);if(a.error||b.error||a.empty||b.empty)return "";
      var c=compute(a,b,h.op);if(c.error)return "";
      var res=sgn(c.r)+grp(bin(abs(c.r)))+(h.op==="/"?" reste "+grp(bin(c.rem)):"");
      var dec=n10(c.r)+(h.op==="/"?" reste "+c.rem:"");
      return '<tr data-i="'+i+'"><td class="cvb-bin">'+grp(a.s)+" "+SYM[h.op]+" "+grp(b.s)+'</td><td class="cvb-bin">'+res+'</td><td class="cvb-dec">'+a.v+" "+SYM[h.op]+" "+b.v+" = "+dec+'</td><td class="cvb-del"><button type="button" data-del="'+i+'" aria-label="Supprimer">✕</button></td></tr>';
    }).join("");
  }

  /* ---------- Événements ---------- */
  function setOp(o){
    op=o;
    opBtns.forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.op===o))});
    update();
  }
  opBtns.forEach(function(b){b.addEventListener("click",function(){setOp(b.dataset.op)})});
  inA.addEventListener("input",update);
  inB.addEventListener("input",update);
  [inA,inB].forEach(function(el){el.addEventListener("blur",function(){var r=parse(el.value);if(!r.empty&&!r.error)el.value=grp(r.s);});});

  $("cbc-add").addEventListener("click",function(){
    if(!cur){err.textContent="Fais d'abord un calcul valide.";return;}
    var h={a:cur.a.s,op:cur.op,b:cur.b.s};
    hist=hist.filter(function(x){return !(x.a===h.a&&x.op===h.op&&x.b===h.b)});
    hist.unshift(h);hist=hist.slice(0,50);save();renderHist();
  });
  $("cbc-clear").addEventListener("click",function(){inA.value=inB.value="";update();inA.focus();});
  $("cbc-swap").addEventListener("click",function(){var t=inA.value;inA.value=inB.value;inB.value=t;update();});
  $("cbc-reset").addEventListener("click",function(){hist=[];save();renderHist();});
  function load(a,o,b){inA.value=a;inB.value=b;setOp(o);}
  $("cbc-tbody").addEventListener("click",function(e){
    var d=e.target.closest("[data-del]");
    if(d){hist.splice(+d.dataset.del,1);save();renderHist();return;}
    var tr=e.target.closest("tr[data-i]");
    if(tr){var h=hist[+tr.dataset.i];load(grp(h.a),h.op,grp(h.b));root.scrollIntoView({behavior:"smooth",block:"start"});}
  });
  root.querySelectorAll(".cbc-chips button").forEach(function(btn){
    btn.addEventListener("click",function(){load(btn.dataset.a,btn.dataset.op,btn.dataset.b)});
  });

  /* Pas de valeur par défaut : les champs sont vides au chargement */
  setOp("+");renderHist();
})();
