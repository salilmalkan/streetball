(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function a(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=a(r);fetch(r.href,i)}})();const f={handSize:5,possessionsPerWave:8,maxCrew:3,maxPlayCards:3,hypePerPoint:4,tagBonus:1,redrawCardsMax:2},L=[{id:"nez",name:"Nez",tags:["Slash"],starter:!0},{id:"kito",name:"Kito",tags:["Splash"],starter:!0},{id:"deo",name:"Deo",tags:["Dish"],starter:!0},{id:"brick",name:"Brick",tags:["Screen"],starter:!0},{id:"moose",name:"Moose",tags:["Rim"],starter:!0},{id:"jax",name:"Jax",tags:["Slash","Dish"],starter:!0},{id:"ven",name:"Ven",tags:["Splash","Slash"],starter:!0},{id:"tally",name:"Tally",tags:["Screen","Rim"],starter:!0},{id:"rio",name:"Rio",tags:["Splash","Dish"]},{id:"haze",name:"Haze",tags:["Slash","Screen"]},{id:"loom",name:"Loom",tags:["Rim","Dish"]},{id:"pix",name:"Pix",tags:["Splash","Screen"]}],G=[{id:"radio",name:"Radio Guy",text:"Splash plays earn +2 Hype",effect:"splashHype"},{id:"hinge",name:"Hinge Bro",text:"Once/wave: Screen play refunds the screener",effect:"screenRefund"},{id:"spark",name:"Spark Plug",text:"Spent Hype is worth +6 each (instead of +4)",effect:"hypeEfficient"},{id:"bypass",name:"Bypass",text:"Once/wave: ignore the rival tax",effect:"ignoreTax"},{id:"orbit",name:"Orbit",text:"Motion plays get +0.5 mult",effect:"motionMult"},{id:"emcee",name:"Emcee",text:"Dish plays earn +2 Hype",effect:"dishHype"},{id:"corner",name:"Corner Cop",text:"Kick-Out +5 score before mult",effect:"kickOutBonus"},{id:"paint",name:"Paint Dog",text:"Rim tags give +2 bonus each",effect:"rimPower"}],N=[{id:"corner-park",name:"Corner Park",target:25,court:"Splash plays earn +2 Hype",rival:"Iso scores half",courtId:"splashHype",rivalId:"isoHalf"},{id:"night-lights",name:"Night Lights",target:80,court:"Repeating the same play type scores half",rival:"Splash is muted unless Screen is in the play",courtId:"noRepeat",rivalId:"muteSplash"},{id:"king-court",name:"King Court",target:200,court:"Iso scores 0",rival:"Dish earns 0 Hype (unless Bypass)",courtId:"noIso",rivalId:"muteDishHype"}];function S(e){const s=L.find(a=>a.id===e);if(!s)throw new Error(`Unknown player ${e}`);return s}function k(e){const s=G.find(a=>a.id===e);if(!s)throw new Error(`Unknown crew ${e}`);return s}const ae={iso:"Iso",twoMan:"Two-Man",kickOut:"Kick-Out",lob:"Lob",motion:"Motion",fastBreak:"Fast Break",postUp:"Post-Up",waste:"Waste"},y={iso:4,twoMan:10,kickOut:12,lob:14,motion:16,fastBreak:11,postUp:11,waste:2};function c(e,s){return e.some(a=>a.includes(s))}function ne(e){return e.length!==3?!1:["Slash","Splash","Dish","Screen","Rim"].some(a=>e.every(n=>n.includes(a)))}function re(e){const s=e.length,a=[];return s===3&&ne(e)&&a.push({id:"motion",base:y.motion}),s===2&&c(e,"Dish")&&c(e,"Rim")&&a.push({id:"lob",base:y.lob}),s===2&&c(e,"Slash")&&c(e,"Splash")&&a.push({id:"kickOut",base:y.kickOut}),s===2&&c(e,"Slash")&&c(e,"Dish")&&a.push({id:"fastBreak",base:y.fastBreak}),s===2&&c(e,"Rim")&&c(e,"Screen")&&a.push({id:"postUp",base:y.postUp}),s===2&&c(e,"Screen")&&(c(e,"Slash")||c(e,"Splash")||c(e,"Rim"))&&a.push({id:"twoMan",base:y.twoMan}),s===1&&a.push({id:"iso",base:y.iso}),a.length===0?"waste":(a.sort((n,r)=>r.base-n.base),a[0].id)}function g(e,s){return e.crewIds.some(a=>k(a).effect===s)}function te(e,s){return!s||c(e,"Screen")?e:e.map(n=>n.filter(r=>r!=="Splash"))}function ie(e,s,a,n,r){if(a.length<1||a.length>f.maxPlayCards)return null;const i=a.map(B=>S(B.defId).tags),o=r&&g(e,"ignoreTax")&&e.ignoreTaxAvailable,h=s.rivalId==="muteSplash"&&!o,d=te(i,h),m=re(d),u=[];let I=y[m],x=0;for(const B of d)for(const se of B)x+=se==="Rim"&&g(e,"rimPower")?2:f.tagBonus;const X=g(e,"hypeEfficient")?6:f.hypePerPoint,F=Math.min(Math.max(0,n),e.hype),j=F*X;let C=0,M=0;m==="kickOut"&&g(e,"kickOutBonus")&&(C+=5,u.push("Corner Cop +5")),m==="motion"&&g(e,"motionMult")&&(M+=.5,u.push("Orbit +0.5×")),s.courtId==="noIso"&&m==="iso"&&(I=0,u.push("Court: Iso = 0")),s.rivalId==="isoHalf"&&m==="iso"&&!o&&(I=Math.floor(I/2),x=Math.floor(x/2),u.push("Rival: Iso half"));const q=s.courtId==="noRepeat"&&e.lastPlayId!==null&&e.lastPlayId===m;q&&u.push("Court: repeat half");let A=I+x+j+C;q&&(A=Math.floor(A/2));const Z=Math.max(0,Math.floor(A*(1+M)));let H=m==="waste"?0:1;s.courtId==="splashHype"&&c(d,"Splash")&&(H+=2,u.push("Court +2 Hype")),g(e,"splashHype")&&c(d,"Splash")&&(H+=2,u.push("Radio +2 Hype"));const ee=s.rivalId==="muteDishHype"&&!o;return g(e,"dishHype")&&c(i,"Dish")&&(ee?u.push("Rival: Dish Hype muted"):(H+=2,u.push("Emcee +2 Hype"))),h&&c(i,"Splash")&&!c(i,"Screen")&&u.push("Rival: Splash muted"),o&&u.push("Bypass on"),{playId:m,playName:ae[m],base:I,tagBonuses:x,spentHypeBonus:j,crewFlat:C,crewMult:M,score:Z,hypeEarned:H,hypeSpent:F,notes:u}}let D=0;function de(){return D+=1,`c${D}`}function $(e){const s=[...e];for(let a=s.length-1;a>0;a-=1){const n=Math.floor(Math.random()*(a+1));[s[a],s[n]]=[s[n],s[a]]}return s}function _(e){return{uid:de(),defId:e}}function R(e){for(;e.hand.length<f.handSize;){if(e.deck.length===0){if(e.discard.length===0)break;e.deck=$(e.discard),e.discard=[]}const s=e.deck.shift();if(!s)break;e.hand.push(s)}}function T(e){return N[e.waveIndex]}function P(e,s){return e.crewIds.some(a=>k(a).effect===s)}function Y(){D=0;const e=L.filter(a=>a.starter).map(a=>_(a.id)),s={phase:"play",waveIndex:0,score:0,hype:0,possessionsLeft:f.possessionsPerWave,deck:$(e),hand:[],discard:[],selectedUids:[],hypeToSpend:0,redrawsLeft:1,crewIds:[],lastPlayId:null,ignoreTaxAvailable:!1,screenRefundAvailable:!1,draftOptions:[],flashScore:null,message:"Clear the court target. Build Hype. Draft between waves.",totalScore:0};return V(s),R(s),s}function V(e){e.ignoreTaxAvailable=P(e,"ignoreTax"),e.screenRefundAvailable=P(e,"screenRefund"),e.lastPlayId=null,e.possessionsLeft=f.possessionsPerWave,e.score=0,e.hype=0,e.hypeToSpend=0,e.redrawsLeft=1,e.selectedUids=[],e.flashScore=null}function oe(e,s){if(e.phase!=="play")return e;const a={...e,selectedUids:[...e.selectedUids]},n=a.selectedUids.indexOf(s);return n>=0?a.selectedUids.splice(n,1):a.selectedUids.length<f.maxPlayCards&&a.selectedUids.push(s),a}function z(e,s){return{...e,hypeToSpend:Math.max(0,Math.min(s,e.hype))}}function W(e){return e.selectedUids.map(s=>e.hand.find(a=>a.uid===s)).filter(s=>!!s)}function J(e,s){const a=T(e);return ie(e,a,W(e),e.hypeToSpend,s)}function ce(e,s){if(e.phase!=="play")return e;const a=J(e,s);if(!a||e.possessionsLeft<=0)return e;const n={...e,hand:[...e.hand],discard:[...e.discard],deck:[...e.deck],selectedUids:[],message:""},r=W(e),i=new Set(r.map(d=>d.uid));let o=null;n.screenRefundAvailable&&P(n,"screenRefund")&&r.some(d=>S(d.defId).tags.includes("Screen"))&&(o=r.find(d=>S(d.defId).tags.includes("Screen"))??null,o&&(n.screenRefundAvailable=!1,n.message=`Hinge Bro: ${S(o.defId).name} stays in hand.`)),n.hand=n.hand.filter(d=>!i.has(d.uid));for(const d of r)o&&d.uid===o.uid?n.hand.push(d):n.discard.push(d);s&&n.ignoreTaxAvailable&&P(n,"ignoreTax")&&(n.ignoreTaxAvailable=!1),n.score+=a.score,n.totalScore+=a.score,n.hype=n.hype-a.hypeSpent+a.hypeEarned,n.hypeToSpend=0,n.possessionsLeft-=1,n.lastPlayId=a.playId,n.flashScore=a.score,R(n);const h=T(n);return n.score>=h.target?le(n):n.possessionsLeft<=0?{...n,phase:"lost",message:`Busted at ${h.name}. ${n.score}/${h.target}.`}:(n.message||(n.message=`${a.playName} for ${a.score}.`),n)}function le(e){return e.waveIndex>=N.length-1?{...e,phase:"won",message:`King Court cleared. Run score ${e.totalScore}.`,draftOptions:[]}:{...e,phase:"draft",message:`${T(e).name} cleared! Draft one upgrade.`,draftOptions:pe(e),selectedUids:[],hypeToSpend:0}}function pe(e){const s=new Set([...e.deck,...e.hand,...e.discard].map(i=>i.defId)),a=$(L.filter(i=>!s.has(i.id)).map(i=>i.id)),n=$(G.filter(i=>!e.crewIds.includes(i.id)).map(i=>i.id)),r=[];for(a[0]&&r.push({kind:"player",defId:a[0]}),n[0]&&r.push({kind:"crew",defId:n[0]}),a[1]?r.push({kind:"player",defId:a[1]}):n[1]&&r.push({kind:"crew",defId:n[1]});r.length<3;)if(n[r.length])r.push({kind:"crew",defId:n[r.length]});else if(a[r.length])r.push({kind:"player",defId:a[r.length]});else break;return $(r).slice(0,3)}function ue(e,s,a){if(e.phase!=="draft")return e;const n=e.draftOptions[s];if(!n)return e;const r={...e,deck:[...e.deck],hand:[...e.hand],discard:[...e.discard],crewIds:[...e.crewIds]};if(n.kind==="player")r.discard.push(_(n.defId)),r.message=`Added ${S(n.defId).name} to your rotation.`;else{if(r.crewIds.includes(n.defId))return r.message="Already have that crew piece.",U(r);if(r.crewIds.length>=f.maxCrew){if(!a||!r.crewIds.includes(a))return{...e,message:"Crew full (3). Tap a crew badge to replace, then draft again."};r.crewIds=r.crewIds.filter(i=>i!==a)}r.crewIds.push(n.defId),r.message=`Crewed up: ${k(n.defId).name}.`}return U(r)}function fe(e){return e.phase!=="draft"?e:U({...e,message:"Skipped draft."})}function U(e){const s={...e,phase:"play",waveIndex:e.waveIndex+1,draftOptions:[]};s.deck=$([...s.deck,...s.hand,...s.discard]),s.hand=[],s.discard=[],V(s),R(s);const a=T(s);return s.message=`${a.name} — target ${a.target}.`,s}function he(e){if(e.phase!=="play"||e.redrawsLeft<=0)return e;if(e.selectedUids.length<1||e.selectedUids.length>f.redrawCardsMax)return{...e,message:"Select 1–2 cards to redraw."};const s={...e,hand:[...e.hand],discard:[...e.discard],deck:[...e.deck],selectedUids:[],redrawsLeft:e.redrawsLeft-1},a=W(e),n=new Set(a.map(r=>r.uid));return s.hand=s.hand.filter(r=>!n.has(r.uid)),s.discard.push(...a),R(s),s.message=`Redrawn ${a.length}.`,s}function me(e){return{...e,flashScore:null}}function ye(e){return N[e.waveIndex]}const Q=document.querySelector("#app");if(!Q)throw new Error("#app missing");const v=Q;let t=Y(),b=!1,w;const ve={Slash:"tag-slash",Splash:"tag-splash",Dish:"tag-dish",Screen:"tag-screen",Rim:"tag-rim"};function p(){const e=ye(t),s=J(t,b),a=t.crewIds.some(r=>k(r).effect==="ignoreTax")&&t.ignoreTaxAvailable,n=`
    <div class="rotate-gate" aria-live="polite">
      <div>
        <div class="rotate-icon" aria-hidden="true"></div>
        <strong>Turn your phone</strong>
        <span>Streetball plays in landscape.</span>
      </div>
    </div>
  `;if(t.phase==="won"||t.phase==="lost"){v.innerHTML=`
      ${n}
      <div class="shell end-shell">
        <h1>${t.phase==="won"?"Run Cleared":"Run Over"}</h1>
        <p class="lede">${l(t.message)}</p>
        <p class="big-stat">Total ${t.totalScore}</p>
        <button class="btn primary" data-action="new-run">New Run</button>
      </div>
    `,E();return}if(t.phase==="draft"){const r=t.crewIds.length>=f.maxCrew;v.innerHTML=`
      ${n}
      <div class="shell draft-shell">
        <header class="top">
          <div class="brand">Streetball</div>
          <div class="wave-name">Draft</div>
        </header>
        <div class="left-col" style="grid-column:1/-1">
          <p class="lede">${l(t.message)}</p>
          ${r?`<p class="hint">Crew full. Tap a crew chip to mark replacement, then pick a crew draft.</p>
                 <div class="crew-row">${O(!0)}</div>`:`<div class="crew-row">${O(!1)}</div>`}
          <div class="draft-list">
            ${t.draftOptions.map((i,o)=>{if(i.kind==="player"){const d=S(i.defId);return`<button class="draft-card" data-draft="${o}">
                    <span class="draft-kind">Player</span>
                    <strong>${l(d.name)}</strong>
                    <span class="tags">${d.tags.map(K).join("")}</span>
                  </button>`}const h=k(i.defId);return`<button class="draft-card" data-draft="${o}">
                  <span class="draft-kind">Crew</span>
                  <strong>${l(h.name)}</strong>
                  <span class="draft-text">${l(h.text)}</span>
                </button>`}).join("")}
          </div>
        </div>
        <div class="draft-actions">
          <button class="btn ghost" data-action="skip-draft">Skip</button>
        </div>
      </div>
    `,E();return}v.innerHTML=`
    ${n}
    <div class="shell ${t.flashScore!==null?"flash":""}">
      <header class="top">
        <div class="brand">Streetball</div>
        <div class="wave-name">${l(e.name)} · W${t.waveIndex+1}/3</div>
      </header>

      <aside class="left-col">
        <section class="status">
          <div class="stat">
            <span class="label">Score</span>
            <span class="value ${t.flashScore!==null?"bump":""}">${t.score}<small>/${e.target}</small></span>
          </div>
          <div class="stat">
            <span class="label">Poss.</span>
            <span class="value">${t.possessionsLeft}</span>
          </div>
          <div class="stat">
            <span class="label">Hype</span>
            <span class="value hype">${t.hype}</span>
          </div>
        </section>
        <div class="meter"><div class="meter-fill" style="width:${Math.min(100,t.score/e.target*100)}%"></div></div>
        <section class="rules">
          <div><span class="pill">Court</span> ${l(e.court)}</div>
          <div><span class="pill rival">Rival</span> ${l(e.rival)}</div>
        </section>
        <div class="crew-row">${O(!1)}</div>
      </aside>

      <section class="center-col">
        <p class="message">${l(t.message)}</p>
        <div class="hand" aria-label="Hand">
          ${t.hand.map(r=>{const i=S(r.defId);return`<button class="card ${t.selectedUids.includes(r.uid)?"selected":""}" data-card="${r.uid}">
                <span class="card-name">${l(i.name)}</span>
                <span class="tags">${i.tags.map(K).join("")}</span>
              </button>`}).join("")}
        </div>
      </section>

      <aside class="right-col">
        <section class="preview">
          ${s?`<div class="preview-title">${l(s.playName)} → <strong>${s.score}</strong></div>
                 <div class="preview-sub">base ${s.base} + tags ${s.tagBonuses} + hype ${s.spentHypeBonus}${s.crewFlat?` + crew ${s.crewFlat}`:""}${s.crewMult?` ×${(1+s.crewMult).toFixed(1)}`:""} · Hype ${s.hypeSpent>0?`-${s.hypeSpent}`:""}${s.hypeEarned?` +${s.hypeEarned}`:""}</div>
                 ${s.notes.length?`<div class="preview-notes">${s.notes.map(l).join(" · ")}</div>`:""}`:`<div class="preview-title">Select 1–3 cards</div>
                 <div class="preview-sub">Named plays score more. Spend Hype to spike.</div>`}
        </section>
        <div class="action-bar">
          <div class="hype-spend">
            <button class="btn icon" data-action="hype-dec" aria-label="Less hype">−</button>
            <span>Hype ${t.hypeToSpend}</span>
            <button class="btn icon" data-action="hype-inc" aria-label="More hype">+</button>
          </div>
          ${a?`<label class="bypass"><input type="checkbox" data-action="bypass" ${b?"checked":""}/> Bypass</label>`:""}
          <button class="btn" data-action="redraw" ${t.redrawsLeft?"":"disabled"}>Redraw (${t.redrawsLeft})</button>
          <button class="btn primary" data-action="commit" ${s?"":"disabled"}>Commit</button>
        </div>
      </aside>
    </div>
  `,E(),t.flashScore!==null&&window.setTimeout(()=>{t=me(t),p()},450)}function O(e){return t.crewIds.length===0?'<span class="muted">No crew pieces yet</span>':t.crewIds.map(s=>{const a=k(s),n=w===s;return e?`<button class="crew-chip ${n?"marked":""}" data-replace-crew="${s}" title="${l(a.text)}">${l(a.name)}</button>`:`<span class="crew-chip" title="${l(a.text)}">${l(a.name)}</span>`}).join("")}function K(e){return`<span class="tag ${ve[e]}">${e}</span>`}function l(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function E(){v.querySelectorAll("[data-card]").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.card;a&&(t=oe(t,a),p())})}),v.querySelectorAll("[data-action]").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.action;a==="commit"?(t=ce(t,b),b=!1,p()):a==="redraw"?(t=he(t),p()):a==="hype-inc"?(t=z(t,t.hypeToSpend+1),p()):a==="hype-dec"?(t=z(t,t.hypeToSpend-1),p()):a==="new-run"?(t=Y(),b=!1,w=void 0,p()):a==="skip-draft"&&(t=fe(t),w=void 0,p())})});const e=v.querySelector('[data-action="bypass"]');e?.addEventListener("change",()=>{b=!!e.checked,p()}),v.querySelectorAll("[data-draft]").forEach(s=>{s.addEventListener("click",()=>{const a=Number(s.dataset.draft),n=t;t=ue(t,a,w),t.phase,t.phase!=="draft"&&(w=void 0),p()})}),v.querySelectorAll("[data-replace-crew]").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.replaceCrew;w=w===a?void 0:a,p()})})}p();window.addEventListener("orientationchange",()=>{window.setTimeout(p,50)});
