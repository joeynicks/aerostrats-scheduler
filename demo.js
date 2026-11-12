/* Shared demo state for the AS&S scheduler demo. Stored in this browser only; every page works without it. */
(function(){
  const K="ass_demo_v2";
  const load=()=>{try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return {}}};
  const save=d=>{try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}};
  const ROLES=[
    {id:"owner",label:"Owner \u00b7 J. Nichols",page:"index.html"},
    {id:"instructor",label:"Pilot \u00b7 M. Houston",page:"index.html"},
    {id:"desk",label:"Operations \u00b7 G. Nichols",page:"index.html"},
    {id:"student",label:"Student \u00b7 J. Snuffy",page:"student.html"}];
  /* items for sale: one shared list used by the Sell screen, lesson check-in and tour check-in */
  const ITEMS0=[
    {id:"logbk",n:"Pilot logbook",cat:"Training supplies",p:24.95,tax:true,on:true},
    {id:"fold",n:"Training folder",cat:"Training supplies",p:15,tax:true,on:true},
    {id:"knee",n:"Kneeboard",cat:"Training supplies",p:32,tax:true,on:true},
    {id:"tee",n:"AS&S T-shirt",cat:"Souvenirs",p:20,tax:true,on:true},
    {id:"hat",n:"AS&S hat",cat:"Souvenirs",p:25,tax:true,on:true},
    {id:"patch",n:"Helicopter patch",cat:"Souvenirs",p:8,tax:true,on:true},
    {id:"stick",n:"Sticker",cat:"Souvenirs",p:3,tax:true,on:true}];
  /* Pilot accounts carry roles the owner switches on per person */
  const PILOT_ROLES=[["instructor","Instructor"],["tour","Tour"],["job","AS&S jobs"],["sched","Schedule changes"]];
  const ROLES0={"J. Nichols":{instructor:true,tour:true,job:true,sched:true},"M. Houston":{instructor:true,tour:true,job:false,sched:true},"R. Ellis":{instructor:false,tour:true,job:true,sched:true}};
  /* today's bookings, shared by the owner console and the student app */
  const BOOK0=[
  {ac:"N7187K",who:"J. Nichols",s:8,e:9.5,type:"dual",t:"Jordan Kim \u00b7 F20",st:"done",amt:412.5},
  {ac:"N931QA",who:"R. Ellis",s:8.25,e:10.5,type:"tour",t:"Tour block \u00b7 5 loads \u00b7 13 pax",st:"overdue",amt:415,block:true},
  {ac:"N7187K",who:"M. Houston",s:10.5,e:12.5,type:"dual",t:"Sam Patel \u00b7 F5",st:"live",amt:0},
  {ac:"N931QA",who:"J. Nichols",s:11,e:12.75,type:"job",t:"AS&S \u00b7 Powerline patrol",st:"up",amt:0},
  {ac:null,who:"J. Nichols",s:13,e:14,type:"ground",t:"J. Snuffy \u00b7 G7",st:"up",amt:0},
  {ac:"N7187K",who:null,s:13,e:14.5,type:"solo",t:"Jordan Kim \u00b7 F21 solo",st:"up",amt:0},
  {id:"pmTour",ac:"N931QA",who:"R. Ellis",s:13,e:16,type:"tour",t:"Tour block \u00b7 walk-ups",st:"attn",amt:0,block:true},
  {ac:"N7187K",who:"M. Houston",s:15,e:17,type:"dual",t:"Chris Morgan \u00b7 F3",st:"up",amt:0},
  {id:"alexF14",ac:"N7187K",who:"J. Nichols",s:17,e:19,type:"dual",t:"J. Snuffy \u00b7 F14",st:"up",amt:0},
  {ac:"N931QA",who:null,s:16.5,e:18,type:"mx",t:"100-hr inspection",st:"up",amt:0,roles:"all"},
  {ac:null,who:"J. Nichols",s:16,e:17,type:"ground",t:"Taylor Brooks \u00b7 G4",st:"up",amt:0}];
  BOOK0.forEach((b,i)=>{if(!b.id)b.id="b"+i});
  /* weather: sample METARs for the demo and the standard flight category rules */
  const WX_SAMPLES=[ // demo only; live data comes from the KCMD METAR
    {time:"10:35",wind:"210\u00b0 12G18 kt",vis:10,cov:"BKN",ceil:4500,temp:18,da:1450,raw:"KCMD {DD}1635Z AUTO 21012G18KT 10SM BKN045 18/09 A3002 RMK AO2"},
    {time:"10:35",wind:"180\u00b0 08 kt",vis:4,cov:"OVC",ceil:2200,temp:14,da:900,raw:"KCMD {DD}1635Z AUTO 18008KT 4SM BR OVC022 14/11 A2998 RMK AO2"},
    {time:"10:35",wind:"160\u00b0 06 kt",vis:2,cov:"OVC",ceil:700,temp:12,da:650,raw:"KCMD {DD}1635Z AUTO 16006KT 2SM BR OVC007 12/11 A2995 RMK AO2"},
    {time:"10:35",wind:"Calm",vis:0.5,cov:"OVC",ceil:300,temp:11,da:500,raw:"KCMD {DD}1635Z AUTO 00000KT 1/2SM FG OVC003 11/11 A2993 RMK AO2"}];
  const wxCat=function(w){const c=w.ceil??Infinity,v=w.vis; // ceiling = lowest BKN or OVC layer
    if(c<500||v<1)return "LIFR";if(c<1000||v<3)return "IFR";if(c<=3000||v<=5)return "MVFR";return "VFR"}
  const WX_WHY={VFR:"Ceiling above 3,000 ft and visibility above 5 SM",MVFR:"Ceiling 1,000\u20133,000 ft or visibility 3\u20135 SM",IFR:"Ceiling 500\u2013999 ft or visibility 1 to less than 3 SM",LIFR:"Ceiling below 500 ft or visibility below 1 SM"};
  
  const DEMO={
    ROLES,PILOT_ROLES,BOOK0,WX_SAMPLES,wxCat,WX_WHY,
    wx(){const w=WX_SAMPLES[DEMO.get("wxSample",0)%WX_SAMPLES.length],dd=String(new Date().getDate()).padStart(2,"0") /* sample report is from 10:35 local this morning */;return Object.assign({cat:wxCat(w)},w,{raw:w.raw.replace("{DD}",dd)})},
    /* today's schedule as everyone currently sees it: base + saved changes + bookings made in the demo */
    dayBook(){const bs=DEMO.get("bookState",{}),L=BOOK0.map(b=>Object.assign({},b,bs[b.id]||{}));
      DEMO.get("newBookings",[]).forEach(b=>{if(!L.some(x=>x.id===b.id))L.push(Object.assign({},b,bs[b.id]||{}))});return L},
    pilotRoles(){return Object.assign({},ROLES0,DEMO.get("pilotRoles",{}))},
    hasRole(name,r){const x=DEMO.pilotRoles()[name];return !!(x&&x[r])},
    items(){return DEMO.get("items",ITEMS0)},
    taxRate(){return DEMO.get("taxRate",9)},
    /* cart = {itemId: qty} \u2192 priced lines, tax only on taxable items */
    cartTotals(cart){const L=DEMO.items(),r=DEMO.taxRate()/100;let sub=0,tax=0;const lines=[];
      Object.entries(cart||{}).forEach(([id,q])=>{const it=L.find(x=>x.id===id);if(!it||!(q>0))return;const amt=Math.round(it.p*q*100)/100;sub+=amt;if(it.tax)tax+=amt*r;lines.push([it.n,q,amt])});
      tax=Math.round(tax*100)/100;sub=Math.round(sub*100)/100;return {lines,sub,tax,total:Math.round((sub+tax)*100)/100}},
    recordSale(s){DEMO.push("sales",Object.assign({id:"s"+Date.now(),at:new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})},s))},
    get(k,def){const d=load();return k in d?d[k]:def},
    set(k,v){const d=load();d[k]=v;save(d)},
    push(k,v){const d=load();(d[k]=d[k]||[]).push(v);save(d)},
    role(){const r=DEMO.get("role","owner");return r==="pilot"?"instructor":r},
    go(id){const r=ROLES.find(x=>x.id===id)||ROLES[0];DEMO.set("role",r.id);
      const here=(location.pathname.split("/").pop()||"index.html");
      if(here===r.page||(r.page==="index.html"&&!/\.html$/.test(here)))location.reload();else location.href=r.page},
    reset(){try{localStorage.removeItem(K)}catch(e){}location.href="index.html"},
    select(){const cur=DEMO.role();
      return `<select class="demo-role" aria-label="View the demo as">${ROLES.map(r=>`<option value="${r.id}" ${r.id===cur?"selected":""}>${r.label}</option>`).join("")}</select>`},
    /* thin bar for the student and tour pages */
    bar(){
      const el=document.createElement("div");el.className="demo-bar";el.setAttribute("role","region");el.setAttribute("aria-label","Demo controls");
      el.innerHTML=`<span class="db-k">Demo \u00b7 viewing as</span>${DEMO.select()}<a class="db-a" href="index.html" data-demo-home>Main console</a><button type="button" class="db-a" data-demo-reset>Reset demo</button>`;
      document.body.prepend(el);
      const st=document.createElement("style");st.textContent=`.demo-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#0f1d2b;color:#c9d5e1;font:13px "IBM Plex Sans",system-ui,sans-serif;
        padding-block:8px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
        .demo-bar .db-k{color:#f3c37a;font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-size:11px}
        .demo-role{font:inherit;font-size:14px;color:#fff;background:#1d2f42;border:1px solid #3a5068;border-radius:8px;padding:5px 8px}
        .demo-bar .db-a{color:#9cc7f2;font-weight:600;background:none;border:0;cursor:pointer;font:inherit;font-weight:600;text-decoration:none}
        .demo-bar .db-a:first-of-type{margin-left:auto}`;
      document.head.appendChild(st);
      DEMO.wire(el);
    },
    wire(root){
      root.querySelectorAll(".demo-role").forEach(s=>s.addEventListener("change",()=>DEMO.go(s.value)));
      root.querySelectorAll("[data-demo-reset]").forEach(b=>b.addEventListener("click",()=>DEMO.reset()));
      root.querySelectorAll("[data-demo-home]").forEach(a=>a.addEventListener("click",e=>{if(DEMO.role()==="student")DEMO.set("role","owner")}));
    }
  };
  window.DEMO=DEMO;
})();
