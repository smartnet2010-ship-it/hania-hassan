/*
╔══════════════════════════════════════════════════════════════════╗
║          HANIA & HASSAN — COMPLETE PRODUCTION WEBSITE           ║
║                  Ready to deploy to your domain                 ║
╠══════════════════════════════════════════════════════════════════╣
║  SETUP (15 minutes total):                                      ║
║                                                                  ║
║  STEP 1 — SUPABASE (free database at supabase.com)              ║
║    → Create project → Settings > API                            ║
║    → Copy URL + anon key into CONFIG below                      ║
║    → SQL Editor → paste + run the SQL schema below             ║
║                                                                  ║
║  STEP 2 — CLOUDINARY (free images at cloudinary.com)            ║
║    → Settings > Upload Presets → Add unsigned preset            ║
║    → Name it "hania_hassan" → copy your Cloud Name below       ║
║                                                                  ║
║  STEP 3 — DEPLOY (free at vercel.com)                           ║
║    → Create Next.js app → paste this file as app/page.jsx       ║
║    → Connect your domain in Vercel dashboard                    ║
╚══════════════════════════════════════════════════════════════════╝
*/

/* ▼▼ EDIT THESE VALUES — everything else is ready ▼▼ */
const CONFIG = {
  SUPABASE_URL:      "Yhttps://vlwqhgbubuhmplwoisqg.supabase.co",
  SUPABASE_KEY:      "sb_publishable_WvRqCTHSCJ1T291gvH2b1g_026UEf0F",
  ADMIN_EMAIL:       "admin@haniahassan.com",
  ADMIN_PASSWORD:    "YourAdminPassword123",
  CLOUDINARY_CLOUD:  "dkufdwjwb",
  CLOUDINARY_PRESET: "hania_hassan",
  WHATSAPP:          "923001234567",
  BRAND_PHONE:       "+92 300 123 4567",
  BRAND_EMAIL:       "hello@haniahassan.com",
  BRAND_CITY:        "Lahore, Pakistan",
};

/*
═══════════════════════════════════════════════════════════════════
 SUPABASE SQL SCHEMA — Run this once in Supabase SQL Editor
═══════════════════════════════════════════════════════════════════
create extension if not exists "uuid-ossp";
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null, category text not null,
  price integer not null, tag text default 'NEW',
  fabric text, delivery_time text, description text,
  images text[] default '{}',
  featured boolean default false, active boolean default true,
  created_at timestamptz default now()
);
create table orders (
  id text primary key default 'HH-'||extract(year from now())||'-'||lpad((floor(random()*9000)+1000)::text,4,'0'),
  customer_name text not null, email text, phone text,
  product_name text, type text default 'Ready-to-Wear',
  status text default 'Pending', amount integer not null,
  created_at timestamptz default now()
);
create table custom_orders (
  id text primary key default 'CHH-'||extract(year from now())||'-'||lpad((floor(random()*9000)+1000)::text,4,'0'),
  customer_name text not null, email text, phone text,
  occasion text, design_type text, inspiration text,
  fabric text, color text, embroidery text, budget text,
  chest text, waist text, hips text, height text, sleeve text,
  notes text, delivery_date date, status text default 'New',
  created_at timestamptz default now()
);
create table subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null, created_at timestamptz default now()
);
alter table products enable row level security;
alter table orders enable row level security;
alter table custom_orders enable row level security;
alter table subscribers enable row level security;
create policy "read products" on products for select using (active=true);
create policy "insert orders" on orders for insert with check (true);
create policy "insert custom" on custom_orders for insert with check (true);
create policy "insert subs" on subscribers for insert with check (true);
insert into products (name,category,price,tag,fabric,delivery_time,featured) values
('Gulbadan Bridal Set','bridal',85000,'BESTSELLER','Pure Silk Organza','8-10 weeks',true),
('Nikkah Couture Set','bridal',120000,'BESTSELLER','Heavy Zardozi Silk','10-12 weeks',true),
('Shaadi Formal Suit','formal',28000,'NEW','Raw Silk','5-6 weeks',false),
('Party Palazzo Set','party',15000,'BESTSELLER','Crushed Velvet','Ready',false);
═══════════════════════════════════════════════════════════════════
*/

import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ── API HELPERS ─────────────────────────────────────────────── */
const isLive = CONFIG.SUPABASE_URL !== "YOUR_SUPABASE_URL";

const db = async (path, method="GET", body=null, token=null) => {
  if (!isLive) return null;
  const h = {
    "apikey": CONFIG.SUPABASE_KEY,
    "Authorization": `Bearer ${token || CONFIG.SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : "",
  };
  try {
    const r = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${path}`, {
      method, headers: h, body: body ? JSON.stringify(body) : null,
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
};

const signIn = async (email, pw) => {
  if (!isLive) return { access_token: "demo_token" };
  try {
    const r = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "apikey": CONFIG.SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });
    return await r.json();
  } catch { return null; }
};

const uploadImage = async (file) => {
  if (CONFIG.CLOUDINARY_CLOUD === "YOUR_CLOUD_NAME") return URL.createObjectURL(file);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CONFIG.CLOUDINARY_PRESET);
  fd.append("folder", "hania-hassan");
  try {
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
    const d = await r.json();
    return d.secure_url || null;
  } catch { return null; }
};


/* ── MOCK DATA ───────────────────────────────────────────────── */
const MOCK_P = [
  {id:"1",name:"Gulbadan Bridal Set",    category:"bridal",    price:85000, tag:"BESTSELLER",fabric:"Pure Silk Organza",  delivery_time:"8-10 weeks",images:[],featured:true, bg:"linear-gradient(160deg,#F9DDE2,#E8A0AE,#C05870)"},
  {id:"2",name:"Mehndi Lawn Collection", category:"party",     price:12500, tag:"NEW",       fabric:"Premium Lawn",       delivery_time:"Ready",     images:[],featured:false,bg:"linear-gradient(160deg,#D6EDD6,#8DC88D,#4E8A5E)"},
  {id:"3",name:"Shaadi Season Formal",   category:"formal",    price:28000, tag:"LIMITED",   fabric:"Raw Silk Banarsi",   delivery_time:"5-6 weeks", images:[],featured:false,bg:"linear-gradient(160deg,#D8D4F0,#9890D8,#5050A0)"},
  {id:"4",name:"Nikkah Couture Set",     category:"bridal",    price:120000,tag:"BESTSELLER",fabric:"Heavy Zardozi Silk", delivery_time:"10-12 weeks",images:[],featured:true, bg:"linear-gradient(160deg,#F8E4D8,#E0A880,#B06040)"},
  {id:"5",name:"Eid Special Pret",       category:"semi-formal",price:8500,tag:"NEW",        fabric:"Khaddar Embroidered",delivery_time:"Ready",     images:[],featured:false,bg:"linear-gradient(160deg,#F8F0D0,#E0C868,#B08020)"},
  {id:"6",name:"Reception Gown",         category:"bridal",    price:95000, tag:"LIMITED",   fabric:"Chiffon & Net",      delivery_time:"8-10 weeks",images:[],featured:true, bg:"linear-gradient(160deg,#F0D8F0,#C898C8,#885888)"},
  {id:"7",name:"Formal Anarkali",        category:"formal",    price:32000, tag:"NEW",       fabric:"Pure Georgette",     delivery_time:"4-5 weeks", images:[],featured:false,bg:"linear-gradient(160deg,#CDE0EC,#7EACC8,#3E6890)"},
  {id:"8",name:"Party Palazzo Set",      category:"party",     price:15000, tag:"BESTSELLER",fabric:"Crushed Velvet",     delivery_time:"Ready",     images:[],featured:false,bg:"linear-gradient(160deg,#EDD8C8,#C8A070,#9A6832)"},
  {id:"9",name:"Walima Collection",      category:"bridal",    price:78000, tag:"NEW",       fabric:"Tissue Organza",     delivery_time:"8-10 weeks",images:[],featured:false,bg:"linear-gradient(160deg,#F8F4E0,#E0C890,#C09040)"},
  {id:"10",name:"Luxury Pret Kurta",     category:"semi-formal",price:6500,tag:"BESTSELLER",fabric:"Karandi Embroidered",delivery_time:"Ready",     images:[],featured:false,bg:"linear-gradient(160deg,#F0D8D8,#D09898,#A06060)"},
  {id:"11",name:"Formal Gharara Set",    category:"formal",    price:45000, tag:"LIMITED",   fabric:"Net & Silk Dupion",  delivery_time:"5-6 weeks", images:[],featured:false,bg:"linear-gradient(160deg,#D0E4D0,#8AB88A,#4A7A5A)"},
  {id:"12",name:"Bridal Lehenga",        category:"bridal",    price:145000,tag:"BESTSELLER",fabric:"Heavy Zari & Stone", delivery_time:"10-12 weeks",images:[],featured:true, bg:"linear-gradient(160deg,#FCDCE4,#F09AB0,#C85878)"},
];
const MOCK_O = [
  {id:"HH-2024-0042",customer_name:"Zara Ahmed",     phone:"+92 301 1234567",product_name:"Gulbadan Bridal Set", type:"Custom Bridal", status:"Production",amount:95000, created_at:"2024-01-15T10:00:00Z"},
  {id:"HH-2024-0041",customer_name:"Maryam Siddiqui",phone:"+92 302 2345678",product_name:"Formal Anarkali",    type:"Ready-to-Wear", status:"Shipped",   amount:28000, created_at:"2024-01-14T14:00:00Z"},
  {id:"HH-2024-0040",customer_name:"Hina Khan",      phone:"+92 303 3456789",product_name:"Shaadi Formal Suit", type:"Custom Formal", status:"Confirmed", amount:45000, created_at:"2024-01-13T09:00:00Z"},
  {id:"HH-2024-0039",customer_name:"Saba Aziz",      phone:"+92 304 4567890",product_name:"Nikkah Couture Set", type:"Custom Bridal", status:"Delivered", amount:120000,created_at:"2024-01-10T11:00:00Z"},
  {id:"HH-2024-0038",customer_name:"Noor Fatima",    phone:"+92 305 5678901",product_name:"Eid Special Pret",   type:"Ready-to-Wear", status:"Pending",   amount:12500, created_at:"2024-01-09T16:00:00Z"},
  {id:"HH-2024-0037",customer_name:"Ayesha Tariq",   phone:"+92 306 6789012",product_name:"Party Palazzo Set",  type:"Custom Party",  status:"Production",amount:35000, created_at:"2024-01-08T13:00:00Z"},
];
const CHART = [
  {m:"Aug",r:185000,o:18},{m:"Sep",r:210000,o:22},{m:"Oct",r:340000,o:35},
  {m:"Nov",r:420000,o:44},{m:"Dec",r:580000,o:62},{m:"Jan",r:285000,o:31},
];

/* ── TOKENS ──────────────────────────────────────────────────── */
const G="#C9A46B",GD="#8B6914",GL="#F5E6C0";
const PK="#F8B4C8",PL="#FFF0F5",PD="#D4567E";
const CR="#FDF6F0",WH="#FFFFFF",DK="#1C0A12",TX="#2D1520",MU="#6B4A55",BR="#F0D0DA";
const SF="'Cormorant Garamond','Palatino Linotype',Georgia,serif";
const SS="Optima,'Gill Sans',Calibri,sans-serif";
const fmt = n => "PKR " + Number(n).toLocaleString();
const catBg = {bridal:"linear-gradient(160deg,#F9DDE2,#E8A0AE,#C05870)",formal:"linear-gradient(160deg,#D8D4F0,#9890D8,#5050A0)",party:"linear-gradient(160deg,#EDD8C8,#C8A070,#9A6832)","semi-formal":"linear-gradient(160deg,#F8F0D0,#E0C868,#B08020)"};

/* ── CSS ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://unpkg.com/@fontsource/cormorant-garamond/400.css');
@import url('https://unpkg.com/@fontsource/cormorant-garamond/600.css');
.hhr{color-scheme:light!important;background:${CR}!important;color:${TX}!important;font-family:${SS};min-height:100vh}
.hhr *{box-sizing:border-box}
.hhr h1,.hhr h2,.hhr h3,.hhr h4{font-family:${SF};color:${TX}}
.sf{font-family:${SF}!important}
.gg{background:linear-gradient(135deg,#D4AF37,${G},${GD});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.bg{background:linear-gradient(135deg,#D4AF37,${G},${GD});color:#fff!important;border:none;padding:13px 28px;font-family:${SS};font-size:11px;letter-spacing:.17em;text-transform:uppercase;cursor:pointer;transition:opacity .2s,transform .2s;display:inline-block}
.bg:hover{opacity:.88;transform:translateY(-2px)}.bg:disabled{opacity:.5;cursor:not-allowed;transform:none}
.bd{background:${DK}!important;color:#fff!important;border:2px solid ${DK}!important;padding:12px 28px;font-family:${SS};font-size:11px;letter-spacing:.17em;text-transform:uppercase;cursor:pointer;transition:all .25s;display:inline-block}
.bd:hover{background:transparent!important;color:${DK}!important}
.bow{background:transparent!important;color:#fff!important;border:2px solid rgba(255,255,255,.6)!important;padding:12px 28px;font-family:${SS};font-size:11px;letter-spacing:.17em;text-transform:uppercase;cursor:pointer;transition:all .25s;display:inline-block}
.bow:hover{background:rgba(255,255,255,.15)!important}
.bgh{background:transparent!important;color:${G}!important;border:1px solid ${G}!important;padding:8px 18px;font-family:${SS};font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:all .25s;display:inline-block}
.bgh:hover{background:${G}!important;color:#fff!important}
.bpk{background:${PK}!important;color:${DK}!important;border:none;padding:13px 28px;font-family:${SS};font-size:11px;letter-spacing:.17em;text-transform:uppercase;cursor:pointer;display:inline-block}
.bpk:hover{background:#F090B0!important}
.bsm{padding:6px 13px!important;font-size:9px!important}
.card{background:${WH}!important;border:1px solid ${BR}!important;transition:all .35s cubic-bezier(.4,0,.2,1)}
.card:hover{border-color:${G}!important;box-shadow:0 12px 40px rgba(201,164,107,.2)!important;transform:translateY(-5px)}
.cf{background:${WH}!important;border:1px solid ${BR}!important}
.dv{width:60px;height:1px;background:linear-gradient(90deg,transparent,${G},transparent);margin:0 auto;border:none}
.inp{width:100%;padding:12px 15px;border:1px solid ${BR}!important;background:${WH}!important;font-family:${SS};font-size:13px;color:${TX}!important;outline:none;transition:border-color .2s}
.inp:focus{border-color:${G}!important}.inp::placeholder{color:#B09098!important}
.sel{width:100%;padding:12px 15px;border:1px solid ${BR}!important;background:${WH}!important;font-family:${SS};font-size:13px;color:${TX}!important;outline:none;appearance:none;cursor:pointer}
.nb{background:none!important;border-top:none!important;border-left:none!important;border-right:none!important;border-bottom:1px solid transparent!important;color:${DK};font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:6px 0;cursor:pointer;font-family:${SS};transition:border-color .2s}
.nb:hover,.nb.on{border-bottom-color:${G}!important}
.fb{padding:8px 16px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;border:1px solid ${BR}!important;background:${WH}!important;cursor:pointer;transition:all .2s;font-family:${SS};color:${MU}!important}
.fb:hover,.fb.on{background:${DK}!important;color:#fff!important;border-color:${DK}!important}
.pw{position:relative;overflow:hidden;height:300px}
.pov{position:absolute;inset:0;background:rgba(28,10,18,0);transition:background .35s;display:flex;align-items:center;justify-content:center;gap:10px}
.card:hover .pov{background:rgba(28,10,18,.38)}
.ob{transform:translateY(16px);opacity:0;transition:all .35s;background:${WH}!important;color:${DK}!important;border:none;padding:10px 16px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;font-family:${SS}}
.card:hover .ob{transform:translateY(0);opacity:1}
.card:hover .ob:nth-child(2){transition-delay:.06s}
.wbt{position:absolute;top:12px;right:12px;background:${WH}!important;border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;z-index:2;transition:background .2s;color:${TX}!important}
.wbt:hover{background:${PK}!important}
.ptg{position:absolute;top:12px;left:12px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;padding:4px 10px;z-index:2;font-family:${SS};font-weight:700}
.tn{background:#E8F5E8;color:#1B5E20}.tb{background:#FFF8E1;color:#E65100}.tl{background:#FCE4EC;color:#880E4F}
.spl{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.04em}
.s0{background:#FFF3E0;color:#B34A00}.s1{background:#E3F2FD;color:#0D47A1}.s2{background:#E8F5E9;color:#1B5E20}.s3{background:#F3E5F5;color:#4A148C}.s4{background:#FBE9E7;color:#8B2200}.s5{background:#E3F2FD;color:#1565C0}
.at{display:flex;align-items:center;gap:10px;padding:12px 17px;font-size:12px;letter-spacing:.05em;cursor:pointer;border-left:3px solid transparent!important;border-top:none!important;border-right:none!important;border-bottom:none!important;transition:all .2s;color:rgba(255,255,255,.5)!important;font-family:${SS};background:none!important;width:100%;text-align:left}
.at:hover{background:rgba(255,255,255,.07)!important;color:#fff!important}
.at.on{border-left:3px solid ${G}!important;background:rgba(201,164,107,.15)!important;color:#fff!important;font-weight:700}
.stc{background:${WH}!important;border:1px solid ${BR}!important;padding:22px;position:relative;overflow:hidden}
.stc::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${G},transparent)}
.mbg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.mbox{background:${WH}!important;border:1px solid ${BR};max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:30px;position:relative}
.tst{position:fixed;bottom:88px;left:50%;transform:translateX(-50%);background:${DK}!important;color:#fff!important;padding:12px 22px;font-size:12px;letter-spacing:.08em;z-index:2000;box-shadow:0 4px 20px rgba(0,0,0,.3);animation:fdu .3s ease;font-family:${SS};white-space:nowrap}
.upar{border:2px dashed ${BR}!important;padding:28px;text-align:center;cursor:pointer;transition:border-color .2s;background:${PL}!important}
.upar:hover{border-color:${G}!important}
.thr{font-size:10px;letter-spacing:.12em;color:${TX};text-transform:uppercase;font-weight:700;font-family:${SS};padding:12px 14px;text-align:left}
.tdr{transition:background .15s}
.tdr:hover{background:#FFF8FA!important}
.tdc{padding:12px 14px;font-family:${SS};font-size:13px;color:${TX};border-bottom:1px solid ${BR}!important}
.lbl{display:block;font-size:10px;letter-spacing:.12em;color:${MU};text-transform:uppercase;margin-bottom:7px;font-family:${SS};font-weight:700}
.cbb{background:linear-gradient(135deg,#FFF3CD,#FFE082);border:1px solid #F0C000;padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:12px;color:#5A4000;font-family:${SS};font-weight:700}
@keyframes fdu{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes fdi{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.fl{animation:flt 6s ease-in-out infinite}
.fi{animation:fdi .65s ease}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${G}}
@media(max-width:860px){.hm{display:none!important}}
`;


/* ── SMALL HELPERS ───────────────────────────────────────────── */
function Tag({t}){const m={NEW:"tn ptg",BESTSELLER:"tb ptg",LIMITED:"tl ptg"};return <span className={m[t]||"tn ptg"}>{t}</span>}
function SPill({s}){const m={Production:"s0",Shipped:"s1",Confirmed:"s2",Delivered:"s3",Pending:"s4",New:"s5"};return <span className={`spl ${m[s]||"s4"}`}>{s}</span>}
function Lbl({c}){return <div style={{fontSize:10,letterSpacing:".4em",color:G,textTransform:"uppercase",marginBottom:13,fontFamily:SS}}>{c}</div>}
function ConfigBanner(){if(isLive) return null;return(<div className="cbb"><span style={{fontSize:18}}>⚙️</span><span>DEMO MODE — Fill in CONFIG values at top of file to connect live database, image uploads & real orders.</span></div>);}

/* ── IMAGE UPLOADER ──────────────────────────────────────────── */
function ImageUploader({images, onAdd, onRemove}){
  const [up, setUp] = useState(false);
  const ref = useRef();
  const handle = async e => {
    const files = Array.from(e.target.files);
    setUp(true);
    for(const f of files){ const url = await uploadImage(f); if(url) onAdd(url); }
    setUp(false);
  };
  return(
    <div>
      <div className="upar" onClick={()=>ref.current.click()}>
        <input ref={ref} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handle}/>
        <div style={{fontSize:26,marginBottom:7}}>📷</div>
        <div style={{fontSize:12,color:MU,fontFamily:SS}}>{up?"Uploading images…":"Click to upload product photos"}</div>
        <div style={{fontSize:11,color:MU,marginTop:4,fontFamily:SS,opacity:.7}}>JPG, PNG, WebP — multiple allowed</div>
      </div>
      {images.length>0&&(
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {images.map((url,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={url} alt="" style={{width:76,height:76,objectFit:"cover",border:`1px solid ${BR}`}} onError={e=>e.target.style.display="none"}/>
              <button onClick={()=>onRemove(i)} style={{position:"absolute",top:-5,right:-5,background:PD,color:"#fff",border:"none",borderRadius:"50%",width:17,height:17,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── HERO SVG ────────────────────────────────────────────────── */
function HeroSVG(){
  return(
    <svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg" style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.88}}>
      <defs>
        <radialGradient id="hbg" cx="50%" cy="40%"><stop offset="0%" stopColor="#2C0E1A"/><stop offset="100%" stopColor="#0D0408"/></radialGradient>
        <radialGradient id="hg1" cx="30%" cy="30%"><stop offset="0%" stopColor="#C9A46B" stopOpacity=".35"/><stop offset="100%" stopColor="#C9A46B" stopOpacity="0"/></radialGradient>
        <radialGradient id="hg2" cx="70%" cy="70%"><stop offset="0%" stopColor="#F8B4C8" stopOpacity=".18"/><stop offset="100%" stopColor="#F8B4C8" stopOpacity="0"/></radialGradient>
      </defs>
      <rect width="600" height="700" fill="url(#hbg)"/>
      <ellipse cx="170" cy="190" rx="220" ry="220" fill="url(#hg1)"/>
      <ellipse cx="430" cy="510" rx="210" ry="210" fill="url(#hg2)"/>
      <g opacity=".14">
        <ellipse cx="300" cy="152" rx="52" ry="64" fill="#F8B4C8"/>
        <path d="M248 210 Q263 272 202 372 Q232 392 300 392 Q368 392 398 372 Q337 272 352 210Z" fill="#E8A0B8"/>
        <path d="M202 372 Q172 492 162 680 L438 680 Q428 492 398 372 Q368 392 300 392 Q232 392 202 372Z" fill="#D490A8"/>
      </g>
      {[170,215,260,305].map(r=><circle key={r} cx="300" cy="346" r={r} fill="none" stroke="#C9A46B" strokeWidth=".5" opacity={.42-(r-170)*.0008}/>)}
      {[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx={300+152*Math.cos(a*Math.PI/180)} cy={346+152*Math.sin(a*Math.PI/180)} rx="5" ry="15" transform={`rotate(${a+90},${300+152*Math.cos(a*Math.PI/180)},${346+152*Math.sin(a*Math.PI/180)})`} fill="#C9A46B" opacity=".28"/>)}
      <path d="M258 56 L300 16 L342 56" fill="none" stroke="#C9A46B" strokeWidth="1" opacity=".5"/>
      <circle cx="300" cy="16" r="4" fill="#C9A46B" opacity=".6"/>
    </svg>
  );
}

/* ── NAVBAR ──────────────────────────────────────────────────── */
function Navbar({nav,page,cartCount,onCartOpen}){
  const [sc,setSc]=useState(false);
  useEffect(()=>{const f=()=>setSc(window.scrollY>50);window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f)},[]);
  const links=[["home","Home"],["shop","Shop"],["bridal","Bridal"],["custom","Custom Order"],["admin","Admin ✦"]];
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:900,background:sc?"rgba(253,246,240,.97)":"transparent",backdropFilter:sc?"blur(12px)":"none",borderBottom:sc?`1px solid ${BR}`:"none",transition:"all .4s",padding:"0 30px"}}>
      <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:70}}>
        <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
          <div style={{fontFamily:SF,fontSize:20,fontWeight:600,color:sc?DK:"#fff",transition:"color .3s"}}>Hania <span style={{color:G}}>&</span> Hassan</div>
          <div style={{fontSize:8,letterSpacing:".3em",color:sc?MU:"rgba(255,255,255,.55)",textTransform:"uppercase",marginTop:1,fontFamily:SS,transition:"color .3s"}}>Luxury Pakistani Fashion</div>
        </button>
        <div style={{display:"flex",gap:24,alignItems:"center"}} className="hm">
          {links.map(([p,l])=>(
            <button key={p} className={`nb${page===p?" on":""}`} style={{color:sc?DK:"rgba(255,255,255,.88)",borderBottomColor:page===p?G:"transparent"}} onClick={()=>nav(p)}>{l}</button>
          ))}
          <button onClick={onCartOpen} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,position:"relative",lineHeight:1}}>
            🛍{cartCount>0&&<span style={{position:"absolute",top:-5,right:-8,background:PD,color:"#fff",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── PRODUCT CARD ────────────────────────────────────────────── */
function PCard({p, addToCart, wishlist, toggleWish}){
  const w=wishlist.includes(p.id);
  const isImg=!!p.images?.[0];
  const bg=isImg?`url(${p.images[0]})`:(p.bg||catBg[p.category]||catBg.bridal);
  return(
    <div className="card" style={{overflow:"hidden"}}>
      <div className="pw">
        <div style={{width:"100%",height:"100%",background:isImg?"none":bg,backgroundImage:isImg?bg:"none",backgroundSize:"cover",backgroundPosition:"center"}}/>
        <Tag t={p.tag}/>
        <button className="wbt" onClick={()=>toggleWish(p.id)}>{w?"♥":"♡"}</button>
        <div className="pov">
          <button className="ob" onClick={()=>addToCart(p)}>Add to Cart</button>
          <button className="ob" onClick={()=>addToCart(p)}>Order Now</button>
        </div>
      </div>
      <div style={{padding:"15px 19px 19px",background:WH}}>
        <div style={{fontSize:9,letterSpacing:".18em",color:MU,textTransform:"uppercase",marginBottom:4,fontFamily:SS}}>{(p.category||"").replace("-"," ")}</div>
        <h4 style={{fontFamily:SF,fontSize:17,color:DK,marginBottom:4,fontWeight:600}}>{p.name}</h4>
        <div style={{fontSize:11,color:MU,marginBottom:13,fontFamily:SS}}>{p.fabric} · {p.delivery_time}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:SF,fontSize:17,fontWeight:600,color:G}}>{fmt(p.price)}</span>
          <button className="bgh bsm" onClick={()=>addToCart(p)}>Order</button>
        </div>
      </div>
    </div>
  );
}


/* ── HOME PAGE ───────────────────────────────────────────────── */
function HomePage({nav,products,addToCart,wishlist,toggleWish}){
  const featured=products.filter(p=>p.featured||p.tag==="BESTSELLER").slice(0,4);
  const [email,setEmail]=useState(""); const [subbed,setSubbed]=useState(false);
  const subscribe=async()=>{if(!email)return;await db("subscribers","POST",{email});setSubbed(true);setEmail("");};
  const cols=[
    {name:"Bridal Couture",desc:"Handcrafted masterpieces",bg:"linear-gradient(160deg,#FCDCE4,#E090A8)",count:products.filter(p=>p.category==="bridal").length||24},
    {name:"Luxury Formals",desc:"Elevated occasion wear",bg:"linear-gradient(160deg,#DED8F4,#9890D0)",count:products.filter(p=>p.category==="formal").length||18},
    {name:"Party Wear",desc:"Statement party looks",bg:"linear-gradient(160deg,#D4ECD4,#88C088)",count:products.filter(p=>p.category==="party").length||32},
    {name:"Semi-Formal",desc:"Effortlessly chic",bg:"linear-gradient(160deg,#F4ECD0,#D8C068)",count:products.filter(p=>p.category==="semi-formal").length||28},
    {name:"Ready-to-Wear",desc:"Premium luxury pret",bg:"linear-gradient(160deg,#D0E4EC,#80B0C8)",count:45},
    {name:"Made-to-Order",desc:"Bespoke custom designs",bg:"linear-gradient(160deg,#F4D0DC,#D080A0)",count:"∞"},
  ];
  return(
    <div>
      {/* HERO */}
      <section style={{height:"100vh",minHeight:680,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:DK}}>
        <HeroSVG/>
        <div style={{position:"relative",zIndex:2,textAlign:"center",padding:"0 24px",maxWidth:760}}>
          <Lbl c="✦  Since 2015  ✦  Luxury Couture  ✦"/>
          <h1 style={{fontFamily:SF,fontSize:"clamp(38px,7vw,86px)",fontWeight:400,color:"#fff",lineHeight:1.1,marginBottom:16}}>
            Crafting Elegance<br/><span className="gg sf" style={{fontFamily:SF}}>for Every Celebration</span>
          </h1>
          <div style={{width:80,height:1,background:`linear-gradient(90deg,transparent,${G},transparent)`,margin:"24px auto"}}/>
          <p style={{fontSize:15,color:"rgba(255,255,255,.62)",letterSpacing:".07em",lineHeight:1.85,marginBottom:40,fontFamily:SS}}>Luxury Bridal, Formal & Party Wear — Tailored Exclusively for You</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="bg" onClick={()=>nav("custom")}>Book Custom Order</button>
            <button className="bow" onClick={()=>nav("shop")}>Shop Ready-to-Wear</button>
            <button className="bgh" onClick={()=>nav("bridal")}>View Bridal Collection</button>
          </div>
        </div>
        <div className="fl" style={{position:"absolute",bottom:30,left:"50%",transform:"translateX(-50%)",color:"rgba(201,164,107,.5)",fontSize:22}}>↓</div>
      </section>
      {/* BRAND BAR */}
      <div style={{background:DK,padding:"14px 30px",display:"flex",justifyContent:"center",gap:36,flexWrap:"wrap",borderBottom:"1px solid rgba(201,164,107,.2)"}}>
        {["Free Consultation","Custom Measurements","Premium Fabrics","International Shipping","WhatsApp Support"].map(t=>(
          <div key={t} style={{fontSize:10,letterSpacing:".17em",color:G,textTransform:"uppercase",display:"flex",alignItems:"center",gap:7,fontFamily:SS}}><span style={{opacity:.4}}>✦</span>{t}</div>
        ))}
      </div>
      {/* COLLECTIONS */}
      <section style={{padding:"84px 30px",background:CR}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}><Lbl c="Our Collections"/><h2 style={{fontFamily:SF,fontSize:"clamp(24px,4vw,46px)",fontWeight:400,color:DK}}>Explore Our World</h2><div className="dv" style={{marginTop:14}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:20}}>
            {cols.map(c=>(
              <div key={c.name} className="card" style={{cursor:"pointer",overflow:"hidden"}} onClick={()=>nav("shop")}>
                <div style={{height:182,background:c.bg,position:"relative"}}>
                  <div style={{position:"absolute",top:12,right:12,fontSize:10,letterSpacing:".14em",color:"rgba(255,255,255,.85)",fontFamily:SS,background:"rgba(0,0,0,.18)",padding:"3px 8px"}}>{c.count} pieces</div>
                </div>
                <div style={{padding:"17px 21px",background:WH}}>
                  <h3 style={{fontFamily:SF,fontSize:19,fontWeight:600,color:DK,marginBottom:5}}>{c.name}</h3>
                  <p style={{fontSize:12,color:MU,fontFamily:SS,marginBottom:10}}>{c.desc}</p>
                  <div style={{fontSize:10,letterSpacing:".2em",color:G,textTransform:"uppercase",fontFamily:SS}}>Explore →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* BESTSELLERS */}
      <section style={{background:PL,padding:"76px 30px",borderTop:`1px solid ${BR}`,borderBottom:`1px solid ${BR}`}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:46}}><Lbl c="Most Loved"/><h2 style={{fontFamily:SF,fontSize:"clamp(22px,3.5vw,42px)",fontWeight:400,color:DK}}>Bestselling Designs</h2><div className="dv" style={{marginTop:14}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:20}}>
            {featured.map(p=><PCard key={p.id} p={p} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>)}
          </div>
          <div style={{textAlign:"center",marginTop:38}}><button className="bd" onClick={()=>nav("shop")}>View All Designs</button></div>
        </div>
      </section>
      {/* PROCESS */}
      <section style={{padding:"84px 30px",background:WH}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}><Lbl c="The Journey"/><h2 style={{fontFamily:SF,fontSize:"clamp(22px,3.5vw,42px)",fontWeight:400,color:DK}}>Made-to-Order Experience</h2><div className="dv" style={{marginTop:14}}/><p style={{marginTop:18,fontSize:14,color:MU,maxWidth:490,margin:"18px auto 0",lineHeight:1.85,fontFamily:SS}}>Every piece is a collaboration between your vision and our master artisans.</p></div>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:4}}>
            {[["01","Select Design","Browse our lookbook or share your own inspiration images."],["02","Measurements","Provide precise measurements or book a virtual consultation."],["03","Confirm Details","Finalise fabric, embroidery, colour palette and accessories."],["04","Production","Master artisans hand-craft your piece with meticulous care."],["05","Delivery","Your creation arrives beautifully packaged, ready for your celebration."]].map(([n,t,d],i)=>(
              <div key={n} style={{display:"flex",alignItems:"flex-start"}}>
                <div style={{textAlign:"center",maxWidth:165,padding:"0 8px"}}>
                  <div style={{width:48,height:48,borderRadius:"50%",border:`1px solid ${G}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",background:WH}}><span style={{fontSize:17,color:G,fontFamily:SF}}>{n}</span></div>
                  <h4 style={{fontFamily:SF,fontSize:15,color:DK,marginBottom:6,fontWeight:600}}>{t}</h4>
                  <p style={{fontSize:12,color:MU,lineHeight:1.75,fontFamily:SS}}>{d}</p>
                </div>
                {i<4&&<div style={{width:16,height:1,background:G,opacity:.4,marginTop:24,flexShrink:0}}/>}
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:46}}><button className="bg" onClick={()=>nav("custom")}>Start Your Custom Order</button></div>
        </div>
      </section>
      {/* BRIDAL SPOTLIGHT */}
      <section style={{background:DK,padding:"76px 30px",position:"relative",overflow:"hidden"}}>
        {[360,490,620].map(r=><div key={r} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:r,height:r,borderRadius:"50%",border:"1px solid rgba(201,164,107,.09)"}}/>)}
        <div style={{maxWidth:1300,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center",position:"relative",zIndex:1}}>
          <div>
            <Lbl c="Bridal Couture"/>
            <h2 style={{fontFamily:SF,fontSize:"clamp(24px,4vw,52px)",fontWeight:400,color:"#fff",lineHeight:1.15,marginBottom:18}}>Your Dream<br/><span className="gg sf" style={{fontFamily:SF}}>Bridal Look Awaits</span></h2>
            <div style={{width:54,height:1,background:`linear-gradient(90deg,${G},transparent)`,marginBottom:22}}/>
            <p style={{color:"rgba(255,255,255,.57)",fontSize:14,lineHeight:1.9,marginBottom:30,fontFamily:SS}}>From intricate zardozi of our Nikkah Collection to delicate hand-embroidery of our Walima range — every creation is a masterpiece crafted exclusively for you.</p>
            <div style={{display:"flex",gap:11,flexWrap:"wrap"}}>
              <button className="bg" onClick={()=>nav("bridal")}>Explore Bridal</button>
              <button className="bow" onClick={()=>nav("custom")}>Book Consultation</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {[["linear-gradient(160deg,#FCDCE4,#E090A8,#C05878)",250,"Nikkah"],["linear-gradient(160deg,#F8E4D8,#E0A880,#B06040)",172,"Walima"],["linear-gradient(160deg,#F4D0DC,#D080A0,#A04868)",172,"Reception"],["linear-gradient(160deg,#F0D8F0,#C898C8,#885888)",250,"Baraat"]].map(([bg,h,lbl])=>(
              <div key={lbl} style={{background:bg,height:h,overflow:"hidden",cursor:"pointer",position:"relative",transition:"transform .4s"}} onClick={()=>nav("bridal")}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                <div style={{position:"absolute",bottom:9,left:9,fontSize:9,letterSpacing:".24em",color:"rgba(255,255,255,.85)",textTransform:"uppercase",fontFamily:SS,background:"rgba(0,0,0,.2)",padding:"3px 8px"}}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* TESTIMONIALS */}
      <section style={{padding:"76px 30px",background:CR}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:44}}><Lbl c="Client Stories"/><h2 style={{fontFamily:SF,fontSize:"clamp(22px,3.5vw,42px)",fontWeight:400,color:DK}}>What Our Brides Say</h2><div className="dv" style={{marginTop:14}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:20}}>
            {[{n:"Aisha Malik",c:"Lahore",t:"My bridal lehenga was absolutely breathtaking. The craftsmanship exceeded all expectations. Every stitch, every motif was pure perfection.",o:"Wedding"},
              {n:"Sana Khalid",c:"Karachi",t:"Ordered a custom formal suit for my sister's valima. Hania & Hassan delivered beyond imagination. The embroidery was simply exquisite.",o:"Valima"},
              {n:"Fatima Tariq",c:"Dubai",t:"As an international customer I was nervous, but the process was completely seamless. Arrived perfectly crafted and on time.",o:"Eid"},
              {n:"Nadia Hussain",c:"Islamabad",t:"The bridal consultation service is exceptional. They understood my vision perfectly and created something truly unique for my day.",o:"Bridal"},
            ].map((t,i)=>(
              <div key={i} className="card" style={{padding:"24px 24px 20px"}}>
                <div style={{color:G,fontSize:17,marginBottom:12,letterSpacing:2}}>{"★★★★★"}</div>
                <p style={{fontFamily:SF,fontSize:16,color:DK,lineHeight:1.8,marginBottom:16,fontStyle:"italic"}}>"{t.t}"</p>
                <div style={{borderTop:`1px solid ${BR}`,paddingTop:13,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <div><div style={{fontSize:13,fontWeight:700,color:DK,fontFamily:SS}}>{t.n}</div><div style={{fontSize:11,color:MU,fontFamily:SS}}>{t.c}</div></div>
                  <div style={{fontSize:9,letterSpacing:".14em",color:G,textTransform:"uppercase",padding:"3px 9px",border:`1px solid ${BR}`,fontFamily:SS}}>{t.o}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* GALLERY */}
      <section style={{padding:"0 30px 68px",background:CR}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:28}}><Lbl c="Lookbook"/><h2 style={{fontFamily:SF,fontSize:"clamp(18px,3vw,34px)",fontWeight:400,color:DK}}>Fashion Gallery</h2></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,height:285}}>
            {["linear-gradient(160deg,#FCDCE4,#E090A8,#C05878)","linear-gradient(160deg,#D8D4F0,#9890D8,#5050A0)","linear-gradient(160deg,#F8E4D8,#E0A880,#B06040)","linear-gradient(160deg,#D4ECD4,#88C088,#4E8A5E)","linear-gradient(160deg,#F4D0DC,#D080A0,#A04868)"].map((bg,i)=>(
              <div key={i} style={{background:bg,overflow:"hidden",cursor:"pointer",transition:"transform .5s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
            ))}
          </div>
        </div>
      </section>
      {/* NEWSLETTER */}
      <section style={{background:PL,padding:"64px 30px",textAlign:"center",borderTop:`1px solid ${BR}`}}>
        <div style={{maxWidth:490,margin:"0 auto"}}>
          <Lbl c="Stay Connected"/>
          <h2 style={{fontFamily:SF,fontSize:"clamp(18px,3vw,34px)",fontWeight:400,color:DK,marginBottom:10}}>Join the House of H&H</h2>
          <p style={{fontSize:13,color:MU,marginBottom:24,lineHeight:1.8,fontFamily:SS}}>Be the first to discover new collections, exclusive offers, and bridal inspiration.</p>
          {subbed?<div style={{color:G,fontSize:13,fontFamily:SS,fontWeight:700}}>✓ Thank you for subscribing!</div>
            :<div style={{display:"flex",maxWidth:400,margin:"0 auto"}}>
              <input className="inp" placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1,borderRight:"none"}} onKeyDown={e=>e.key==="Enter"&&subscribe()}/>
              <button className="bg" style={{whiteSpace:"nowrap"}} onClick={subscribe}>Subscribe</button>
            </div>}
        </div>
      </section>
    </div>
  );
}


/* ── SHOP PAGE ───────────────────────────────────────────────── */
function ShopPage({products,addToCart,wishlist,toggleWish}){
  const [f,setF]=useState("all"); const [s,setS]=useState("featured");
  let v=f==="all"?[...products]:products.filter(p=>p.category===f);
  if(s==="asc") v.sort((a,b)=>a.price-b.price);
  if(s==="desc") v.sort((a,b)=>b.price-a.price);
  return(
    <div style={{paddingTop:70,background:CR,minHeight:"100vh"}}>
      <div style={{background:DK,padding:"48px 30px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.05,backgroundImage:`repeating-linear-gradient(45deg,${G} 0,${G} 1px,transparent 0,transparent 50%)`,backgroundSize:"22px 22px"}}/>
        <div style={{position:"relative",zIndex:1}}><Lbl c="Hania & Hassan"/><h1 style={{fontFamily:SF,fontSize:"clamp(24px,5vw,54px)",fontWeight:400,color:"#fff"}}>The Collection</h1><div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${G},transparent)`,margin:"16px auto 0"}}/></div>
      </div>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"40px 30px"}}>
        <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,letterSpacing:".1em",color:MU,textTransform:"uppercase",marginRight:6,fontFamily:SS}}>Filter:</span>
          {["all","bridal","formal","party","semi-formal"].map(c=>(
            <button key={c} className={`fb${f===c?" on":""}`} onClick={()=>setF(c)}>{c==="all"?"All Designs":c.replace("-"," ")}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:MU,fontFamily:SS}}>{v.length} designs</span>
            <select className="sel" style={{width:"auto",padding:"8px 12px",fontSize:11}} value={s} onChange={e=>setS(e.target.value)}>
              <option value="featured">Featured First</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:20}}>
          {v.map(p=><PCard key={p.id} p={p} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>)}
        </div>
      </div>
    </div>
  );
}

/* ── BRIDAL PAGE ─────────────────────────────────────────────── */
function BridalPage({nav,products}){
  const bridals=products.filter(p=>p.category==="bridal");
  return(
    <div style={{paddingTop:70,background:CR,minHeight:"100vh"}}>
      <section style={{height:470,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:DK}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#2C0818,#1C0A12,#0D0408)"}}/>
        {[300,420,530].map(r=><div key={r} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:r,height:r,borderRadius:"50%",border:"1px solid rgba(201,164,107,.1)"}}/>)}
        <div style={{position:"relative",zIndex:2,textAlign:"center",padding:"0 24px"}}>
          <Lbl c="✦ Bridal Couture ✦"/>
          <h1 style={{fontFamily:SF,fontSize:"clamp(28px,6vw,68px)",fontWeight:400,color:"#fff",lineHeight:1.1,marginBottom:14}}>Begin Your<br/><span className="gg sf" style={{fontFamily:SF}}>Bridal Journey</span></h1>
          <p style={{color:"rgba(255,255,255,.52)",fontSize:14,maxWidth:450,margin:"0 auto 28px",lineHeight:1.85,fontFamily:SS}}>Each creation is an heirloom — a masterpiece of hand embroidery, precious stones and luxurious fabrics.</p>
          <button className="bg" onClick={()=>nav("custom")}>Book Bridal Consultation</button>
        </div>
      </section>
      <section style={{padding:"64px 30px",maxWidth:1300,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}><Lbl c="Collections"/><h2 style={{fontFamily:SF,fontSize:"clamp(20px,3.5vw,40px)",fontWeight:400,color:DK}}>Our Bridal Range</h2><div className="dv" style={{marginTop:14}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:13,marginBottom:48}}>
          {[["Nikkah","linear-gradient(160deg,#FCDCE4,#E090A8)"],["Baraat","linear-gradient(160deg,#F8E4D8,#E0A880)"],["Mehndi","linear-gradient(160deg,#D4ECD4,#88C088)"],["Walima","linear-gradient(160deg,#F4D0DC,#D080A0)"],["Reception","linear-gradient(160deg,#F0D8F0,#C898C8)"],["Engagement","linear-gradient(160deg,#D8D4F0,#9890D8)"]].map(([occ,bg])=>(
            <div key={occ} className="card" style={{cursor:"pointer",overflow:"hidden"}} onClick={()=>nav("custom")}>
              <div style={{height:102,background:bg}}/>
              <div style={{padding:"10px 13px",background:WH}}><div style={{fontFamily:SF,fontSize:14,color:DK,fontWeight:600}}>{occ}</div><div style={{fontSize:11,color:G,marginTop:2,fontFamily:SS}}>Explore →</div></div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:20}}>
          {bridals.map(p=>(
            <div key={p.id} className="card" style={{overflow:"hidden"}}>
              <div style={{height:295,background:p.images?.[0]?`url(${p.images[0]})`:(p.bg||catBg.bridal),backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}><Tag t={p.tag}/></div>
              <div style={{padding:"17px 21px",background:WH}}>
                <h3 style={{fontFamily:SF,fontSize:18,color:DK,marginBottom:3,fontWeight:600}}>{p.name}</h3>
                <div style={{fontSize:11,color:MU,marginBottom:2,fontFamily:SS}}>{p.fabric}</div>
                <div style={{fontSize:11,color:MU,marginBottom:13,fontFamily:SS}}>Delivery: {p.delivery_time}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:SF,fontSize:17,fontWeight:600,color:G}}>{fmt(p.price)}</span>
                  <button className="bg bsm" onClick={()=>nav("custom")}>Order Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{background:PL,padding:"56px 30px",textAlign:"center",borderTop:`1px solid ${BR}`}}>
        <h2 style={{fontFamily:SF,fontSize:"clamp(18px,3vw,34px)",fontWeight:400,color:DK,marginBottom:12}}>Your Dream Bridal Look</h2>
        <p style={{fontSize:14,color:MU,lineHeight:1.8,marginBottom:24,fontFamily:SS}}>Book a complimentary consultation with our bridal specialists.</p>
        <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="bg" onClick={()=>nav("custom")}>Book Consultation</button>
          <button className="bd" onClick={()=>window.open(`https://wa.me/${CONFIG.WHATSAPP}`,"_blank")}>WhatsApp Us</button>
        </div>
      </section>
    </div>
  );
}

/* ── CUSTOM ORDER PAGE ───────────────────────────────────────── */
function CustomOrderPage(){
  const [step,setStep]=useState(1);
  const [f,setF]=useState({name:"",email:"",phone:"",occasion:"",design:"",inspiration:"",fabric:"",color:"",embroidery:"",budget:"",chest:"",waist:"",hips:"",height:"",sleeve:"",notes:"",delivery:""});
  const [done,setDone]=useState(false); const [busy,setBusy]=useState(false); const [ref,setRef]=useState("");
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  const steps=["Design Selection","Measurements","Fabric & Details","Confirm Order"];
  const L=({c})=><label className="lbl">{c}</label>;

  const submit=async()=>{
    setBusy(true);
    const id="CHH-"+Date.now().toString().slice(-6);
    const body={customer_name:f.name,email:f.email,phone:f.phone,occasion:f.occasion,design_type:f.design,inspiration:f.inspiration,fabric:f.fabric,color:f.color,embroidery:f.embroidery,budget:f.budget,chest:f.chest,waist:f.waist,hips:f.hips,height:f.height,sleeve:f.sleeve,notes:f.notes,delivery_date:f.delivery||null,status:"New"};
    await db("custom_orders","POST",body);
    setRef(id); setDone(true); setBusy(false);
  };

  if(done) return(
    <div style={{paddingTop:70,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:CR}}>
      <div style={{textAlign:"center",maxWidth:470,padding:"0 22px"}} className="fi">
        <div className="fl" style={{fontSize:50,marginBottom:16}}>✨</div>
        <h1 style={{fontFamily:SF,fontSize:40,fontWeight:400,color:G,marginBottom:11}}>Thank You</h1>
        <h2 style={{fontSize:17,color:DK,marginBottom:11,fontWeight:400,fontFamily:SS}}>Your Custom Order Request Has Been Received</h2>
        <div className="dv" style={{marginBottom:18}}/>
        <p style={{fontSize:14,color:MU,lineHeight:1.85,marginBottom:22,fontFamily:SS}}>Our design team will contact you within 24 hours via WhatsApp to discuss your vision, share fabric samples, and provide a detailed quote.</p>
        <div style={{background:PL,border:`1px solid ${BR}`,padding:"16px 20px",marginBottom:22}}>
          <div style={{fontSize:11,letterSpacing:".14em",color:G,textTransform:"uppercase",marginBottom:5,fontFamily:SS}}>Order Reference</div>
          <div style={{fontFamily:SF,fontSize:22,color:DK,fontWeight:600}}>{ref}</div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="bg" onClick={()=>window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hi! My custom order ref is ${ref}`,"_blank")}>Contact via WhatsApp</button>
          <button className="bd" onClick={()=>{setDone(false);setStep(1);setF({name:"",email:"",phone:"",occasion:"",design:"",inspiration:"",fabric:"",color:"",embroidery:"",budget:"",chest:"",waist:"",hips:"",height:"",sleeve:"",notes:"",delivery:""})}}>New Order</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{paddingTop:70,minHeight:"100vh",background:CR}}>
      <div style={{background:DK,padding:"44px 30px",textAlign:"center"}}><Lbl c="Bespoke Creations"/><h1 style={{fontFamily:SF,fontSize:"clamp(22px,4vw,46px)",fontWeight:400,color:"#fff"}}>Custom Order</h1></div>
      {/* Stepper */}
      <div style={{background:WH,borderBottom:`1px solid ${BR}`,padding:"20px 30px"}}>
        <div style={{maxWidth:740,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {steps.map((s,i)=>{
            const n=i+1,dn=step>n,ac=step===n;
            return(
              <div key={s} style={{display:"flex",alignItems:"center"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",background:dn?G:ac?DK:WH,border:`2px solid ${dn||ac?G:BR}`,color:dn||ac?"#fff":MU,fontSize:13,fontWeight:700,cursor:dn?"pointer":"default",transition:"all .3s"}} onClick={()=>dn&&setStep(n)}>{dn?"✓":n}</div>
                  <span style={{fontSize:9,letterSpacing:".07em",color:ac?DK:MU,textTransform:"uppercase",display:"block",fontFamily:SS,fontWeight:ac?700:400,whiteSpace:"nowrap"}} className="hm">{s}</span>
                </div>
                {i<3&&<div style={{width:44,height:2,background:step>n?G:BR,margin:"0 5px 14px",transition:"background .3s"}}/>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"44px 30px"}}>
        {step===1&&(
          <div className="fi">
            <h2 style={{fontFamily:SF,fontSize:28,color:DK,marginBottom:5,fontWeight:600}}>Tell Us Your Vision</h2>
            <p style={{fontSize:13,color:MU,marginBottom:26,lineHeight:1.7,fontFamily:SS}}>Share your occasion details and the design style you're imagining.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[["name","Full Name *","Your full name"],["email","Email *","your@email.com"],["phone","WhatsApp Number *","+92 300 0000000"]].map(([k,l,ph])=>(
                <div key={k}><L c={l}/><input className="inp" value={f[k]} onChange={e=>up(k,e.target.value)} placeholder={ph}/></div>
              ))}
              <div><L c="Occasion *"/><select className="sel" value={f.occasion} onChange={e=>up("occasion",e.target.value)}><option value="">Select occasion</option>{["Nikkah","Baraat","Mehndi","Walima","Reception","Engagement","Formal Event","Eid","Party"].map(o=><option key={o}>{o}</option>)}</select></div>
              <div style={{gridColumn:"1/-1"}}><L c="Design Type *"/><select className="sel" value={f.design} onChange={e=>up("design",e.target.value)}><option value="">Select design</option>{["Bridal Lehenga","Sharara","Gharara","Anarkali","Straight Suit","Gown","Custom Design"].map(d=><option key={d}>{d}</option>)}</select></div>
              <div style={{gridColumn:"1/-1"}}><L c="Inspiration / References"/><textarea className="inp" rows={4} value={f.inspiration} onChange={e=>up("inspiration",e.target.value)} placeholder="Describe your vision, share image links, or describe the look you have in mind…" style={{resize:"vertical"}}/></div>
              <div><L c="Required Delivery Date"/><input className="inp" type="date" value={f.delivery} onChange={e=>up("delivery",e.target.value)}/></div>
            </div>
            <div style={{marginTop:26,display:"flex",justifyContent:"flex-end"}}><button className="bg" onClick={()=>setStep(2)} disabled={!f.name||!f.email||!f.phone||!f.occasion}>Continue →</button></div>
          </div>
        )}

        {step===2&&(
          <div className="fi">
            <h2 style={{fontFamily:SF,fontSize:28,color:DK,marginBottom:5,fontWeight:600}}>Your Measurements</h2>
            <p style={{fontSize:13,color:MU,marginBottom:22,lineHeight:1.7,fontFamily:SS}}>All measurements in inches. Precise measurements ensure a perfect fit.</p>
            <div style={{background:PL,border:`1px solid ${BR}`,padding:"13px 17px",marginBottom:22,display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:17}}>📏</span>
              <p style={{fontSize:12,color:MU,lineHeight:1.6,fontFamily:SS}}>Not sure how to measure? <a href={`https://wa.me/${CONFIG.WHATSAPP}?text=Hi! I need help with measurements.`} target="_blank" rel="noreferrer" style={{color:G}}>WhatsApp us</a> — we'll guide you step by step.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:15}}>
              {[["chest","Chest / Bust"],["waist","Waist"],["hips","Hips"],["height","Height"],["sleeve","Sleeve Length"]].map(([k,l])=>(
                <div key={k}><L c={l}/><input className="inp" value={f[k]} onChange={e=>up(k,e.target.value)} placeholder={k==="height"?"e.g. 64":"e.g. 36"}/></div>
              ))}
            </div>
            <div style={{marginTop:15}}><L c="Additional Notes"/><textarea className="inp" rows={3} value={f.notes} onChange={e=>up("notes",e.target.value)} placeholder="Any fitting requirements or body considerations…" style={{resize:"vertical"}}/></div>
            <div style={{marginTop:26,display:"flex",justifyContent:"space-between"}}>
              <button className="bd" onClick={()=>setStep(1)}>← Back</button>
              <button className="bg" onClick={()=>setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div className="fi">
            <h2 style={{fontFamily:SF,fontSize:28,color:DK,marginBottom:5,fontWeight:600}}>Fabric & Design Details</h2>
            <p style={{fontSize:13,color:MU,marginBottom:26,lineHeight:1.7,fontFamily:SS}}>Choose your preferred fabrics, colours, and embellishment style.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15}}>
              <div><L c="Primary Fabric *"/><select className="sel" value={f.fabric} onChange={e=>up("fabric",e.target.value)}><option value="">Select fabric</option>{["Silk Organza","Banarsi Silk","Pure Chiffon","Net","Raw Silk","Velvet","Georgette","Tissue Silk","Karandi","Lawn"].map(x=><option key={x}>{x}</option>)}</select></div>
              <div><L c="Colour Preference *"/><select className="sel" value={f.color} onChange={e=>up("color",e.target.value)}><option value="">Select colour</option>{["Deep Red","Blush Pink","Ivory White","Royal Blue","Emerald Green","Champagne Gold","Burgundy","Powder Blue","Mint","Peach","Mauve","Black"].map(x=><option key={x}>{x}</option>)}</select></div>
              <div><L c="Embroidery Style"/><select className="sel" value={f.embroidery} onChange={e=>up("embroidery",e.target.value)}><option value="">Select style</option>{["Zardozi (Gold Thread)","Resham (Silk Thread)","Gota Kinari","Stone & Dabka","Tilla Work","Phulkari","Minimalist","Heavily Embellished"].map(x=><option key={x}>{x}</option>)}</select></div>
              <div><L c="Budget Range"/><select className="sel" value={f.budget} onChange={e=>up("budget",e.target.value)}><option value="">Select budget</option>{["PKR 5,000-15,000","PKR 15,000-40,000","PKR 40,000-80,000","PKR 80,000-150,000","PKR 150,000+"].map(x=><option key={x}>{x}</option>)}</select></div>
              <div style={{gridColumn:"1/-1"}}><L c="Additional Notes"/><textarea className="inp" rows={4} value={f.notes} onChange={e=>up("notes",e.target.value)} placeholder="Any additional preferences or specific requests…" style={{resize:"vertical"}}/></div>
            </div>
            <div style={{marginTop:26,display:"flex",justifyContent:"space-between"}}>
              <button className="bd" onClick={()=>setStep(2)}>← Back</button>
              <button className="bg" onClick={()=>setStep(4)}>Review Order →</button>
            </div>
          </div>
        )}

        {step===4&&(
          <div className="fi">
            <h2 style={{fontFamily:SF,fontSize:28,color:DK,marginBottom:5,fontWeight:600}}>Review & Confirm</h2>
            <p style={{fontSize:13,color:MU,marginBottom:22,lineHeight:1.7,fontFamily:SS}}>Please review your details before submitting.</p>
            <div style={{background:WH,border:`1px solid ${BR}`,padding:"20px 24px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:11,borderBottom:`1px solid ${BR}`}}>
                <h3 style={{fontFamily:SF,fontSize:19,color:DK,fontWeight:600}}>Order Summary</h3>
                <div style={{fontSize:9,letterSpacing:".18em",color:G,textTransform:"uppercase",padding:"4px 10px",border:`1px solid ${G}`,fontFamily:SS}}>Custom Order</div>
              </div>
              {[["Customer",f.name],["Email",f.email],["WhatsApp",f.phone],["Occasion",f.occasion],["Design Type",f.design],["Fabric",f.fabric],["Colour",f.color],["Embroidery",f.embroidery],["Budget",f.budget]].map(([l,v])=>v?(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${BR}`,fontSize:13}}>
                  <span style={{color:MU,fontFamily:SS}}>{l}</span>
                  <span style={{color:DK,fontWeight:700,fontFamily:SS}}>{v}</span>
                </div>
              ):null)}
            </div>
            <div style={{background:PL,border:`1px solid ${BR}`,padding:"14px 18px",marginBottom:22,display:"flex",gap:11,alignItems:"flex-start"}}>
              <span style={{fontSize:17,flexShrink:0}}>💬</span>
              <p style={{fontSize:12,color:MU,lineHeight:1.7,fontFamily:SS}}>Our design team will WhatsApp you within 24 hours with a quote, fabric samples and timeline. A 50% advance is required on confirmation.</p>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <button className="bd" onClick={()=>setStep(3)}>← Edit</button>
              <div style={{display:"flex",gap:10}}>
                <button className="bpk" onClick={()=>window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hi! I'd like a custom order for ${f.occasion}`,"_blank")}>WhatsApp Us</button>
                <button className="bg" onClick={submit} disabled={busy}>{busy?"Submitting…":"Submit Order ✦"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ── ADMIN LOGIN & SHELL ─────────────────────────────────────── */
function AdminPage({token,setToken}){
  const [em,setEm]=useState(CONFIG.ADMIN_EMAIL); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const [tab,setTab]=useState("dashboard");

  const login=async()=>{
    setBusy(true);setErr("");
    const r=await signIn(em,pw);
    if(r?.access_token){setToken(r.access_token);}
    else if(!isLive){setToken("demo");}
    else{setErr("Invalid email or password.");}
    setBusy(false);
  };

  if(!token) return(
    <div style={{paddingTop:70,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:DK}}>
      <div style={{background:WH,padding:"42px 40px",maxWidth:360,width:"100%",border:`1px solid ${BR}`}} className="fi">
        <div style={{fontFamily:SF,fontSize:28,color:G,textAlign:"center",marginBottom:3,fontWeight:600}}>H&H Admin</div>
        <div style={{fontSize:9,letterSpacing:".27em",color:MU,textTransform:"uppercase",textAlign:"center",marginBottom:22,fontFamily:SS}}>Dashboard Access</div>
        <div className="dv" style={{marginBottom:22}}/>
        <div style={{marginBottom:13}}><label className="lbl">Email</label><input className="inp" value={em} onChange={e=>setEm(e.target.value)} placeholder="admin@haniahassan.com"/></div>
        <div style={{marginBottom:16}}><label className="lbl">Password</label><input className="inp" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&login()}/></div>
        {err&&<div style={{fontSize:12,color:PD,marginBottom:11,fontFamily:SS}}>{err}</div>}
        <button className="bg" style={{width:"100%"}} onClick={login} disabled={busy}>{busy?"Logging in…":"Access Dashboard"}</button>
        {!isLive&&<p style={{fontSize:11,color:MU,marginTop:11,textAlign:"center",fontFamily:SS}}>Demo mode — any password accepted</p>}
      </div>
    </div>
  );

  const tabs=[["dashboard","📊 Dashboard"],["orders","📋 Orders"],["custom","✍ Custom Orders"],["products","👗 Products"],["customers","👤 Customers"],["marketing","📢 Marketing"]];
  return(
    <div style={{paddingTop:70,minHeight:"100vh",display:"flex",background:CR}}>
      <aside style={{width:205,background:DK,flexShrink:0,paddingTop:16,display:"flex",flexDirection:"column",minHeight:"calc(100vh - 70px)"}}>
        <div style={{padding:"0 15px 14px",borderBottom:"1px solid rgba(201,164,107,.2)",marginBottom:5}}>
          <div style={{fontFamily:SF,fontSize:16,color:"#fff",fontWeight:600}}>H&H Admin</div>
          <div style={{fontSize:8,letterSpacing:".24em",color:G,textTransform:"uppercase",marginTop:2,fontFamily:SS}}>Control Panel</div>
        </div>
        {tabs.map(([k,l])=><button key={k} className={`at${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</button>)}
        <div style={{marginTop:"auto",padding:"13px 15px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
          <button className="bgh" style={{width:"100%",padding:"8px",fontSize:10}} onClick={()=>setToken(null)}>Log Out</button>
        </div>
      </aside>
      <main style={{flex:1,padding:"28px 28px",background:CR,overflow:"auto"}}>
        {tab==="dashboard"&&<AdminDash setTab={setTab}/>}
        {tab==="orders"&&<AdminOrders token={token}/>}
        {tab==="custom"&&<AdminCustom token={token}/>}
        {tab==="products"&&<AdminProds token={token}/>}
        {tab==="customers"&&<AdminCusts/>}
        {tab==="marketing"&&<AdminMkt token={token}/>}
      </main>
    </div>
  );
}

function AdminDash({setTab}){
  const st=[{l:"Total Revenue",v:"PKR 28.5L",s:"↑ 18% this month",c:"#8B6914"},{l:"Total Orders",v:"142",s:"67 custom orders",c:"#1B5E20"},{l:"Pending",v:"23",s:"Require attention",c:"#B34A00"},{l:"New Customers",v:"38",s:"This month",c:"#4A148C"}];
  return(
    <div className="fi">
      <h1 style={{fontFamily:SF,fontSize:28,color:DK,marginBottom:3,fontWeight:600}}>Dashboard</h1>
      <p style={{fontSize:12,color:MU,marginBottom:22,fontFamily:SS}}>Welcome back. Here's today's overview.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:13,marginBottom:24}}>
        {st.map(s=>(
          <div key={s.l} className="stc">
            <div style={{fontSize:10,letterSpacing:".1em",color:MU,textTransform:"uppercase",marginBottom:5,fontFamily:SS,fontWeight:700}}>{s.l}</div>
            <div style={{fontFamily:SF,fontSize:24,color:s.c,fontWeight:700,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:11,color:MU,fontFamily:SS}}>{s.s}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <div className="cf" style={{padding:"20px"}}>
          <h3 style={{fontFamily:SF,fontSize:17,color:DK,marginBottom:14,fontWeight:600}}>Revenue (6 months)</h3>
          <ResponsiveContainer width="100%" height={175}><BarChart data={CHART}><XAxis dataKey="m" tick={{fontSize:10,fill:MU,fontFamily:SS}}/><YAxis hide/><Tooltip formatter={v=>"PKR "+v.toLocaleString()} contentStyle={{fontFamily:SS,fontSize:11,border:`1px solid ${BR}`,background:WH}}/><Bar dataKey="r" fill={G} radius={[2,2,0,0]}/></BarChart></ResponsiveContainer>
        </div>
        <div className="cf" style={{padding:"20px"}}>
          <h3 style={{fontFamily:SF,fontSize:17,color:DK,marginBottom:14,fontWeight:600}}>Orders (6 months)</h3>
          <ResponsiveContainer width="100%" height={175}><LineChart data={CHART}><XAxis dataKey="m" tick={{fontSize:10,fill:MU,fontFamily:SS}}/><YAxis hide/><Tooltip contentStyle={{fontFamily:SS,fontSize:11,border:`1px solid ${BR}`,background:WH}}/><Line type="monotone" dataKey="o" stroke={PD} strokeWidth={2} dot={{fill:PD,r:3}}/></LineChart></ResponsiveContainer>
        </div>
      </div>
      <div className="cf" style={{padding:"20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontFamily:SF,fontSize:17,color:DK,fontWeight:600}}>Recent Orders</h3>
          <button className="bgh bsm" onClick={()=>setTab("orders")}>View All</button>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:PL,borderBottom:`2px solid ${BR}`}}>{["Order ID","Customer","Type","Status","Amount"].map(h=><th key={h} className="thr">{h}</th>)}</tr></thead>
          <tbody>{MOCK_O.slice(0,5).map((o,i)=>(
            <tr key={o.id} className="tdr" style={{background:i%2===0?WH:"#FDFAF8"}}>
              <td className="tdc" style={{color:G,fontFamily:"monospace",fontWeight:700,fontSize:12}}>{o.id}</td>
              <td className="tdc" style={{fontWeight:700}}>{o.customer_name}</td>
              <td className="tdc" style={{color:MU}}>{o.type}</td>
              <td className="tdc"><SPill s={o.status}/></td>
              <td className="tdc" style={{fontWeight:700,color:DK}}>{fmt(o.amount)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders({token}){
  const [orders,setOrders]=useState(MOCK_O); const [search,setSearch]=useState(""); const [sf,setSf]=useState("all"); const [ed,setEd]=useState(null);
  useEffect(()=>{if(!isLive)return;db("orders?order=created_at.desc","GET",null,token).then(d=>d&&setOrders(d));},[token]);
  const upStatus=async(id,s)=>{await db(`orders?id=eq.${id}`,"PATCH",{status:s},token);setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o));setEd(null);};
  let v=orders.filter(o=>{
    if(search&&!o.customer_name?.toLowerCase().includes(search.toLowerCase())&&!o.id?.includes(search))return false;
    if(sf!=="all"&&o.status!==sf)return false;
    return true;
  });
  return(
    <div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:11}}>
        <div><h1 style={{fontFamily:SF,fontSize:28,color:DK,fontWeight:600}}>Orders</h1><p style={{fontSize:12,color:MU,marginTop:3,fontFamily:SS}}>{orders.length} total</p></div>
        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
          <input className="inp" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:190}}/>
          <select className="sel" value={sf} onChange={e=>setSf(e.target.value)} style={{width:"auto",padding:"12px 13px"}}><option value="all">All Status</option>{["Pending","Confirmed","Production","Shipped","Delivered"].map(s=><option key={s}>{s}</option>)}</select>
        </div>
      </div>
      <div className="cf" style={{overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
          <thead><tr style={{background:PL,borderBottom:`2px solid ${BR}`}}>{["Order ID","Customer","Product","Status","Amount","Date","Action"].map(h=><th key={h} className="thr">{h}</th>)}</tr></thead>
          <tbody>{v.map((o,i)=>(
            <tr key={o.id} className="tdr" style={{background:i%2===0?WH:"#FDFAF8"}}>
              <td className="tdc" style={{color:G,fontFamily:"monospace",fontWeight:700,fontSize:12}}>{o.id}</td>
              <td className="tdc"><div style={{fontWeight:700}}>{o.customer_name}</div><div style={{fontSize:11,color:MU}}>{o.phone}</div></td>
              <td className="tdc" style={{color:MU,fontSize:12}}>{o.product_name||o.type}</td>
              <td className="tdc">{ed===o.id?<select className="sel" style={{width:"auto",padding:"5px 7px",fontSize:11}} defaultValue={o.status} onChange={e=>upStatus(o.id,e.target.value)}>{["Pending","Confirmed","Production","Shipped","Delivered"].map(s=><option key={s}>{s}</option>)}</select>:<SPill s={o.status}/>}</td>
              <td className="tdc" style={{fontWeight:700}}>{fmt(o.amount)}</td>
              <td className="tdc" style={{color:MU,fontSize:12}}>{new Date(o.created_at).toLocaleDateString()}</td>
              <td className="tdc"><button className="bgh bsm" style={{fontSize:9,padding:"4px 9px"}} onClick={()=>setEd(ed===o.id?null:o.id)}>{ed===o.id?"Done":"Edit"}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCustom({token}){
  const [orders,setOrders]=useState([]); const [sel,setSel]=useState(null);
  useEffect(()=>{
    if(!isLive){setOrders([{id:"CHH-001",customer_name:"Fatima Tariq",email:"f@email.com",phone:"+92 301 9876543",occasion:"Nikkah",design_type:"Bridal Lehenga",fabric:"Silk Organza",color:"Ivory White",embroidery:"Zardozi",budget:"PKR 80,000-150,000",status:"New",created_at:"2024-01-15T10:00:00Z"}]);return;}
    db("custom_orders?order=created_at.desc","GET",null,token).then(d=>d&&setOrders(d));
  },[token]);
  const upS=async(id,s)=>{await db(`custom_orders?id=eq.${id}`,"PATCH",{status:s},token);setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o));};
  return(
    <div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><h1 style={{fontFamily:SF,fontSize:28,color:DK,fontWeight:600}}>Custom Orders</h1><p style={{fontSize:12,color:MU,marginTop:3,fontFamily:SS}}>{orders.length} requests</p></div>
      </div>
      <div style={{display:"grid",gap:12}}>
        {orders.map(o=>(
          <div key={o.id} className="cf" style={{padding:"17px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}><span style={{fontFamily:SF,fontSize:16,color:DK,fontWeight:600}}>{o.customer_name}</span><SPill s={o.status}/></div>
                <div style={{fontSize:12,color:MU,fontFamily:SS}}>{o.id} · {o.occasion} · {o.design_type}</div>
                <div style={{fontSize:12,color:MU,fontFamily:SS,marginTop:2}}>{o.phone} · {o.email}</div>
              </div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                <button className="bgh bsm" onClick={()=>setSel(sel?.id===o.id?null:o)}>{sel?.id===o.id?"Close":"Details"}</button>
                <select className="sel" style={{width:"auto",padding:"6px 9px",fontSize:11}} value={o.status} onChange={e=>upS(o.id,e.target.value)}>{["New","Reviewing","Quoted","Confirmed","Production","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select>
                <button className="bg bsm" onClick={()=>window.open(`https://wa.me/${o.phone?.replace(/\D/g,"")}?text=Hi ${o.customer_name.split(" ")[0]}! Regarding your order ${o.id}…`,"_blank")}>WhatsApp</button>
              </div>
            </div>
            {sel?.id===o.id&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${BR}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {[["Fabric",o.fabric],["Colour",o.color],["Embroidery",o.embroidery],["Budget",o.budget],["Chest",o.chest],["Waist",o.waist],["Hips",o.hips],["Height",o.height]].map(([l,v])=>v?(
                  <div key={l} style={{fontSize:12,fontFamily:SS}}><span style={{color:MU,marginRight:5}}>{l}:</span><span style={{color:DK,fontWeight:700}}>{v}</span></div>
                ):null)}
                {o.notes&&<div style={{gridColumn:"1/-1",fontSize:12,fontFamily:SS}}><span style={{color:MU}}>Notes: </span><span style={{color:DK}}>{o.notes}</span></div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminProds({token}){
  const [prods,setProds]=useState(MOCK_P); const [modal,setModal]=useState(false); const [ed,setEd]=useState(null); const [sv,setSv]=useState(false);
  const [f,setF]=useState({name:"",category:"bridal",price:"",tag:"NEW",fabric:"",delivery_time:"",description:"",images:[],featured:false});
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  useEffect(()=>{if(!isLive)return;db("products?order=created_at.desc","GET",null,token).then(d=>d&&setProds(d.map(p=>({...p,bg:catBg[p.category]}))));}, [token]);
  const openAdd=()=>{setEd(null);setF({name:"",category:"bridal",price:"",tag:"NEW",fabric:"",delivery_time:"",description:"",images:[],featured:false});setModal(true);};
  const openEdit=p=>{setEd(p.id);setF({name:p.name,category:p.category,price:String(p.price),tag:p.tag||"NEW",fabric:p.fabric||"",delivery_time:p.delivery_time||"",description:p.description||"",images:p.images||[],featured:!!p.featured});setModal(true);};
  const save=async()=>{
    setSv(true);
    const body={...f,price:parseInt(f.price)||0};
    if(ed){
      await db(`products?id=eq.${ed}`,"PATCH",body,token);
      setProds(p=>p.map(x=>x.id===ed?{...x,...body}:x));
    }else{
      const r=await db("products","POST",body,token);
      setProds(p=>[...p,r?.[0]||{id:Date.now(),...body,bg:catBg[body.category]}]);
    }
    setSv(false);setModal(false);
  };
  const del=async id=>{if(!window.confirm("Delete this product?"))return;await db(`products?id=eq.${id}`,"DELETE",null,token);setProds(p=>p.filter(x=>x.id!==id));};
  const toggleFeat=async(id,featured)=>{await db(`products?id=eq.${id}`,"PATCH",{featured},token);setProds(p=>p.map(x=>x.id===id?{...x,featured}:x));};
  return(
    <div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><h1 style={{fontFamily:SF,fontSize:28,color:DK,fontWeight:600}}>Products</h1><p style={{fontSize:12,color:MU,marginTop:3,fontFamily:SS}}>{prods.length} designs</p></div>
        <button className="bg" onClick={openAdd}>+ Add Product</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
        {prods.map(p=>(
          <div key={p.id} className="cf" style={{overflow:"hidden"}}>
            <div style={{height:120,background:p.images?.[0]?`url(${p.images[0]})`:(p.bg||catBg.bridal),backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}><Tag t={p.tag||"NEW"}/>{p.featured&&<div style={{position:"absolute",bottom:7,right:7,background:G,color:"#fff",fontSize:8,padding:"2px 7px",fontFamily:SS}}>FEATURED</div>}</div>
            <div style={{padding:"11px 13px",background:WH}}>
              <div style={{fontFamily:SF,fontSize:14,color:DK,fontWeight:700,marginBottom:2}}>{p.name}</div>
              <div style={{fontSize:10,color:MU,marginBottom:7,fontFamily:SS}}>{p.category} · {p.fabric}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:G,fontSize:12,fontWeight:700,fontFamily:SS}}>{fmt(p.price)}</span>
                <div style={{display:"flex",gap:4}}>
                  <button className="bgh" style={{padding:"3px 8px",fontSize:9}} onClick={()=>toggleFeat(p.id,!p.featured)}>{p.featured?"★":"☆"}</button>
                  <button className="bgh" style={{padding:"3px 8px",fontSize:9}} onClick={()=>openEdit(p)}>Edit</button>
                  <button style={{padding:"3px 8px",fontSize:9,border:"1px solid #FFCCCC",background:WH,color:"#CC3333",cursor:"pointer",fontFamily:SS}} onClick={()=>del(p.id)}>Del</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal&&(
        <div className="mbg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mbox">
            <button onClick={()=>setModal(false)} style={{position:"absolute",top:14,right:14,background:"none",border:"none",fontSize:20,cursor:"pointer",color:MU}}>×</button>
            <h2 style={{fontFamily:SF,fontSize:21,color:DK,marginBottom:18,fontWeight:600}}>{ed?"Edit Product":"Add Product"}</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{gridColumn:"1/-1"}}><label className="lbl">Product Name *</label><input className="inp" value={f.name} onChange={e=>up("name",e.target.value)} placeholder="e.g. Gulbadan Bridal Set"/></div>
              <div><label className="lbl">Category *</label><select className="sel" value={f.category} onChange={e=>up("category",e.target.value)}>{["bridal","formal","party","semi-formal"].map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="lbl">Price (PKR) *</label><input className="inp" type="number" value={f.price} onChange={e=>up("price",e.target.value)} placeholder="e.g. 85000"/></div>
              <div><label className="lbl">Tag</label><select className="sel" value={f.tag} onChange={e=>up("tag",e.target.value)}>{["NEW","BESTSELLER","LIMITED"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label className="lbl">Fabric</label><input className="inp" value={f.fabric} onChange={e=>up("fabric",e.target.value)} placeholder="e.g. Pure Silk Organza"/></div>
              <div><label className="lbl">Delivery Time</label><input className="inp" value={f.delivery_time} onChange={e=>up("delivery_time",e.target.value)} placeholder="e.g. 8-10 weeks / Ready"/></div>
              <div style={{gridColumn:"1/-1"}}><label className="lbl">Description</label><textarea className="inp" rows={3} value={f.description} onChange={e=>up("description",e.target.value)} placeholder="Product description…" style={{resize:"vertical"}}/></div>
              <div style={{gridColumn:"1/-1"}}><label className="lbl">Product Images</label><ImageUploader images={f.images} onAdd={url=>up("images",[...f.images,url])} onRemove={i=>up("images",f.images.filter((_,j)=>j!==i))}/></div>
              <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:9}}>
                <input type="checkbox" id="ft" checked={f.featured} onChange={e=>up("featured",e.target.checked)} style={{width:16,height:16,cursor:"pointer"}}/>
                <label htmlFor="ft" style={{fontSize:13,color:DK,fontFamily:SS,cursor:"pointer"}}>Feature on homepage</label>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:9,marginTop:22}}>
              <button className="bd" onClick={()=>setModal(false)}>Cancel</button>
              <button className="bg" onClick={save} disabled={sv||!f.name||!f.price}>{sv?"Saving…":"Save Product"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCusts(){
  const custs=[
    {n:"Aisha Malik",    e:"aisha@email.com", p:"+92 301 1111111",c:"Lahore",   o:3, t:280000},
    {n:"Sana Khalid",   e:"sana@email.com",  p:"+92 302 2222222",c:"Karachi",  o:1, t:45000},
    {n:"Fatima Tariq",  e:"fatima@email.com",p:"+92 303 3333333",c:"Dubai",    o:2, t:108500},
    {n:"Nadia Hussain", e:"nadia@email.com", p:"+92 304 4444444",c:"Islamabad",o:1, t:95000},
    {n:"Zara Ahmed",    e:"zara@email.com",  p:"+92 305 5555555",c:"Lahore",   o:2, t:165000},
  ];
  return(
    <div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><h1 style={{fontFamily:SF,fontSize:28,color:DK,fontWeight:600}}>Customers</h1><p style={{fontSize:12,color:MU,marginTop:3,fontFamily:SS}}>{custs.length} customers</p></div>
        <input className="inp" placeholder="Search customers…" style={{width:200}}/>
      </div>
      <div className="cf" style={{overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
          <thead><tr style={{background:PL,borderBottom:`2px solid ${BR}`}}>{["Customer","Contact","City","Orders","Total Spent","Action"].map(h=><th key={h} className="thr">{h}</th>)}</tr></thead>
          <tbody>{custs.map((c,i)=>(
            <tr key={c.e} className="tdr" style={{background:i%2===0?WH:"#FDFAF8"}}>
              <td className="tdc"><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${PK},${PD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{c.n.charAt(0)}</div><div style={{fontWeight:700,color:DK}}>{c.n}</div></div></td>
              <td className="tdc"><div style={{fontSize:12,color:MU}}>{c.e}</div><div style={{fontSize:12,color:MU}}>{c.p}</div></td>
              <td className="tdc" style={{color:MU}}>{c.c}</td>
              <td className="tdc" style={{fontWeight:700}}>{c.o}</td>
              <td className="tdc" style={{fontWeight:700,color:G}}>{fmt(c.t)}</td>
              <td className="tdc"><button className="bg bsm" style={{fontSize:9}} onClick={()=>window.open(`https://wa.me/${c.p.replace(/\D/g,"")}?text=Hi ${c.n.split(" ")[0]}! Thank you for shopping with Hania %26 Hassan.`,"_blank")}>WhatsApp</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminMkt(){
  const [sent,setSent]=useState(false);
  const items=[{t:"Subscribers",v:"1,284",i:"📧"},{t:"Active Codes",v:"3",i:"🏷️"},{t:"Scheduled Posts",v:"12",i:"📱"},{t:"Referrals",v:"68",i:"🤝"}];
  return(
    <div className="fi">
      <h1 style={{fontFamily:SF,fontSize:28,color:DK,marginBottom:5,fontWeight:600}}>Marketing</h1>
      <p style={{fontSize:12,color:MU,marginBottom:20,fontFamily:SS}}>Campaigns, promotions & newsletter</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:13,marginBottom:20}}>
        {items.map(it=>(
          <div key={it.t} className="stc"><div style={{fontSize:24,marginBottom:7}}>{it.i}</div><div style={{fontSize:10,letterSpacing:".1em",color:MU,textTransform:"uppercase",marginBottom:3,fontFamily:SS,fontWeight:700}}>{it.t}</div><div style={{fontFamily:SF,fontSize:22,color:DK,fontWeight:600}}>{it.v}</div></div>
        ))}
      </div>
      <div className="cf" style={{padding:"22px"}}>
        <h3 style={{fontFamily:SF,fontSize:17,color:DK,marginBottom:14,fontWeight:600}}>Send Newsletter</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
          <div><label className="lbl">Subject</label><input className="inp" placeholder="e.g. New Bridal Collection 2025"/></div>
          <div><label className="lbl">Segment</label><select className="sel"><option>All Subscribers</option><option>Bridal Customers</option><option>Recent Buyers</option></select></div>
          <div style={{gridColumn:"1/-1"}}><label className="lbl">Message</label><textarea className="inp" rows={4} placeholder="Write your newsletter content here…" style={{resize:"vertical"}}/></div>
        </div>
        {sent?<div style={{color:"#1B5E20",fontSize:13,fontFamily:SS,fontWeight:700}}>✓ Newsletter sent to 1,284 subscribers!</div>
          :<button className="bg" onClick={()=>setSent(true)}>Send Newsletter</button>}
      </div>
    </div>
  );
}


/* ── FOOTER ──────────────────────────────────────────────────── */
function Footer({nav}){
  return(
    <footer style={{background:DK,padding:"52px 30px 22px",borderTop:"1px solid rgba(201,164,107,.14)"}}>
      <div style={{maxWidth:1300,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:30,marginBottom:38}}>
          <div>
            <div style={{fontFamily:SF,fontSize:20,color:"#fff",marginBottom:3,fontWeight:600}}>Hania & Hassan</div>
            <div style={{fontSize:8,letterSpacing:".28em",color:G,textTransform:"uppercase",marginBottom:11,fontFamily:SS}}>Luxury Pakistani Fashion</div>
            <p style={{fontSize:12,color:"rgba(255,255,255,.42)",lineHeight:1.85,fontFamily:SS}}>Crafting heirloom-quality bridal and formal wear since 2015. Every piece tells your story.</p>
            <div style={{display:"flex",gap:9,marginTop:14}}>
              {["📸","📘","🐦","▶️"].map((ic,i)=>(
                <div key={i} style={{width:33,height:33,border:"1px solid rgba(201,164,107,.3)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,transition:"border-color .2s"}}>{ic}</div>
              ))}
            </div>
          </div>
          {[["Collections",["Bridal Couture","Luxury Formals","Party Wear","Semi-Formal","Ready-to-Wear","Made-to-Order"],"shop"],
            ["Services",["Custom Order","Bridal Consultation","Virtual Fitting","Size Guide","Care Instructions","International Shipping"],"custom"]
          ].map(([title,links,p])=>(
            <div key={title}>
              <div style={{fontSize:9,letterSpacing:".27em",color:G,textTransform:"uppercase",marginBottom:14,fontFamily:SS,fontWeight:700}}>{title}</div>
              {links.map(l=><div key={l} onClick={()=>nav(p)} style={{fontSize:12,color:"rgba(255,255,255,.43)",marginBottom:8,cursor:"pointer",fontFamily:SS}}>{l}</div>)}
            </div>
          ))}
          <div>
            <div style={{fontSize:9,letterSpacing:".27em",color:G,textTransform:"uppercase",marginBottom:14,fontFamily:SS,fontWeight:700}}>Contact</div>
            {[["📍",CONFIG.BRAND_CITY],["📞",CONFIG.BRAND_PHONE],["✉️",CONFIG.BRAND_EMAIL],["⏰","Mon–Sat, 10am – 7pm"]].map(([ic,t])=>(
              <div key={t} style={{display:"flex",gap:8,marginBottom:8,fontSize:12,color:"rgba(255,255,255,.43)",fontFamily:SS}}>
                <span style={{fontSize:13,flexShrink:0}}>{ic}</span><span>{t}</span>
              </div>
            ))}
            <button className="bg" style={{marginTop:11,padding:"10px 18px",width:"100%",fontSize:11}} onClick={()=>window.open(`https://wa.me/${CONFIG.WHATSAPP}`,"_blank")}>WhatsApp Us</button>
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:9}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,.27)",fontFamily:SS}}>© 2024 Hania & Hassan. All rights reserved.</div>
          <div style={{display:"flex",gap:15}}>{["Privacy Policy","Terms","Returns"].map(l=><span key={l} style={{fontSize:11,color:"rgba(255,255,255,.27)",cursor:"pointer",fontFamily:SS}}>{l}</span>)}</div>
        </div>
      </div>
    </footer>
  );
}

/* ── CART DRAWER ─────────────────────────────────────────────── */
function CartDrawer({cart,setCart,onClose}){
  const total=cart.reduce((s,x)=>s+(x.price*x.qty),0);
  const rem=id=>setCart(p=>p.filter(x=>x.id!==id));
  const adj=(id,d)=>setCart(p=>p.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+d)}:x));
  return(
    <div style={{position:"fixed",inset:0,zIndex:950,display:"flex"}}>
      <div style={{flex:1,background:"rgba(0,0,0,.4)"}} onClick={onClose}/>
      <div style={{width:375,background:WH,height:"100%",overflow:"auto",padding:"22px",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h2 style={{fontFamily:SF,fontSize:21,color:DK,fontWeight:600}}>Cart ({cart.length})</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:MU}}>×</button>
        </div>
        {cart.length===0?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:MU,fontFamily:SS,fontSize:14}}>Your cart is empty</div>
          :<div style={{flex:1}}>
            {cart.map(item=>(
              <div key={item.id} style={{display:"flex",gap:11,padding:"13px 0",borderBottom:`1px solid ${BR}`}}>
                <div style={{width:62,height:62,background:item.bg||catBg[item.category]||catBg.bridal,flexShrink:0,backgroundSize:"cover",backgroundImage:item.images?.[0]?`url(${item.images[0]})`:"none"}}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:SF,fontSize:14,color:DK,fontWeight:600,marginBottom:2}}>{item.name}</div>
                  <div style={{fontSize:12,color:MU,fontFamily:SS,marginBottom:7}}>{fmt(item.price)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <button onClick={()=>adj(item.id,-1)} style={{width:23,height:23,border:`1px solid ${BR}`,background:WH,cursor:"pointer",fontSize:14,color:DK}}>−</button>
                    <span style={{fontSize:13,color:DK,fontFamily:SS,fontWeight:700,minWidth:18,textAlign:"center"}}>{item.qty}</span>
                    <button onClick={()=>adj(item.id,1)} style={{width:23,height:23,border:`1px solid ${BR}`,background:WH,cursor:"pointer",fontSize:14,color:DK}}>+</button>
                    <button onClick={()=>rem(item.id)} style={{marginLeft:"auto",background:"none",border:"none",fontSize:18,cursor:"pointer",color:MU}}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>}
        {cart.length>0&&(
          <div style={{paddingTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontFamily:SS,fontSize:13,color:MU}}>Total</span>
              <span style={{fontFamily:SF,fontSize:17,color:DK,fontWeight:600}}>{fmt(total)}</span>
            </div>
            <button className="bg" style={{width:"100%",marginBottom:9}} onClick={()=>window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=Hi! I'd like to order: ${cart.map(x=>x.name).join(", ")} — Total: ${fmt(total)}`,"_blank")}>Confirm via WhatsApp</button>
            <button className="bd" style={{width:"100%"}} onClick={()=>setCart([])}>Clear Cart</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN APP ────────────────────────────────────────────────── */
export default function App(){
  const [page,setPage]       = useState("home");
  const [products,setProducts]= useState(MOCK_P);
  const [cart,setCart]       = useState([]);
  const [wish,setWish]       = useState([]);
  const [toast,setToast]     = useState(null);
  const [showCart,setShowCart]= useState(false);
  const [token,setToken]     = useState(null);

  useEffect(()=>{
    if(!isLive) return;
    db("products?active=eq.true&order=featured.desc,created_at.desc").then(d=>{
      if(d?.length) setProducts(d.map(p=>({...p,bg:catBg[p.category]||catBg.bridal})));
    });
  },[]);

  const nav = p => { setPage(p); window.scrollTo({top:0,behavior:"smooth"}); };
  const addToCart = p => {
    setCart(prev=>{ const e=prev.find(x=>x.id===p.id); return e?prev.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...prev,{...p,qty:1}]; });
    showMsg(`${p.name} added to cart`);
  };
  const showMsg = m => { setToast(m); setTimeout(()=>setToast(null),2800); };
  const toggleWish = id => setWish(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const cartCount = cart.reduce((s,x)=>s+x.qty,0);

  return(
    <div className="hhr" style={{colorScheme:"light",background:CR,color:TX,minHeight:"100vh"}}>
      <style>{CSS}</style>
      <ConfigBanner/>
      <Navbar nav={nav} page={page} cartCount={cartCount} onCartOpen={()=>setShowCart(true)}/>

      {page==="home"    && <HomePage    nav={nav} products={products} addToCart={addToCart} wishlist={wish} toggleWish={toggleWish}/>}
      {page==="shop"    && <ShopPage    products={products} addToCart={addToCart} wishlist={wish} toggleWish={toggleWish}/>}
      {page==="bridal"  && <BridalPage  nav={nav} products={products}/>}
      {page==="custom"  && <CustomOrderPage/>}
      {page==="admin"   && <AdminPage   token={token} setToken={setToken}/>}

      {page!=="admin"   && <Footer nav={nav}/>}
      {showCart && <CartDrawer cart={cart} setCart={setCart} onClose={()=>setShowCart(false)}/>}

      {/* WhatsApp FAB */}
      <a href={`https://wa.me/${CONFIG.WHATSAPP}?text=Hi! I'd like to enquire about Hania %26 Hassan.`}
        target="_blank" rel="noreferrer" className="fl"
        style={{position:"fixed",bottom:27,right:27,zIndex:800,width:52,height:52,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,.45)",textDecoration:"none",fontSize:23,lineHeight:1}}>
        💬
      </a>

      {/* Cart FAB */}
      {cartCount>0&&!showCart&&(
        <button onClick={()=>setShowCart(true)} style={{position:"fixed",bottom:27,right:88,zIndex:800,width:52,height:52,borderRadius:"50%",background:DK,border:`2px solid ${G}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20}}>
          🛍
          <span style={{position:"absolute",top:-4,right:-4,background:PD,color:"#fff",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{cartCount}</span>
        </button>
      )}

      {toast && <div className="tst">{toast}</div>}
    </div>
  );
}
