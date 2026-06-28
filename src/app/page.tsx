'use client'
import { useEffect, useRef, useState } from 'react'

export default function HomePage() {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const heroRef          = useRef<HTMLDivElement>(null)
  const [navScrolled,    setNavScrolled]    = useState(false)
  const [countersActive, setCountersActive] = useState(false)
  const [counts, setCounts] = useState({ products:0, tenants:0, policies:0, partitions:0, concepts:0 })

  // ── Navbar scroll blur ───────────────────────────────────────
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // ── Canvas particle network ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const hero   = heroRef.current
    if (!canvas || !hero) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = hero.offsetWidth; canvas.height = hero.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    type P = { x:number; y:number; vx:number; vy:number; r:number; o:number }
    const pts: P[] = Array.from({ length:80 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 1.4 + 0.3,
      o:  Math.random() * 0.45 + 0.1,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width
        p.y = (p.y + p.vy + canvas.height) % canvas.height
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16,185,129,${p.o})`
        ctx.fill()
      })
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d  = Math.sqrt(dx*dx + dy*dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(16,185,129,${0.09*(1-d/110)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // ── Scroll reveal + counter trigger ─────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sfv')
          if ((e.target as HTMLElement).id === 'sf-stats') setCountersActive(true)
        }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.sfr, #sf-stats').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ── Count-up animation ───────────────────────────────────────
  useEffect(() => {
    if (!countersActive) return
    const targets = [500, 5, 25, 9, 4]
    const keys    = ['products','tenants','policies','partitions','concepts'] as const
    const dur = 2400
    const t0  = performance.now()
    let raf: number
    const tick = (now: number) => {
      const prog = Math.min((now - t0) / dur, 1)
      const ease = 1 - Math.pow(1 - prog, 4)
      const next = {} as typeof counts
      keys.forEach((k, i) => { next[k] = Math.round(ease * targets[i]) })
      setCounts(next)
      if (prog < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [countersActive])

  // ── 3D tilt handlers ────────────────────────────────────────
  const onTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el   = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x    = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
    const y    = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
    el.style.transform   = `perspective(700px) rotateY(${x*11}deg) rotateX(${-y*11}deg) scale(1.03)`
    el.style.boxShadow   = `${-x*18}px ${y*18}px 40px rgba(0,0,0,0.16), 0 0 30px rgba(5,150,105,0.1)`
    el.style.zIndex      = '2'
    const shine = el.querySelector<HTMLElement>('.sf-shine')
    if (shine) {
      shine.style.opacity    = '1'
      shine.style.background = `radial-gradient(circle at ${(x+1)*50}% ${(y+1)*50}%, rgba(255,255,255,0.11) 0%, transparent 65%)`
    }
  }
  const onTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)'
    el.style.boxShadow = 'none'
    el.style.zIndex    = '1'
    const shine = el.querySelector<HTMLElement>('.sf-shine')
    if (shine) shine.style.opacity = '0'
  }

  // ── DATA ─────────────────────────────────────────────────────
  const concepts = [
    { icon:'🔒', title:'Row-Level Security',  tag:'Concept 1', tc:'#059669', tb:'#ECFDF5', desc:'25+ PostgreSQL RLS policies enforce tenant isolation at the database engine level — not in application code. Even if a developer writes a bug, the database blocks cross-tenant access.', code:'auth.jwt() → user_metadata → tenant_id' },
    { icon:'🗄️', title:'Table Partitioning', tag:'Concept 2', tc:'#1D4ED8', tb:'#EFF6FF', desc:'inventory_logs is RANGE-partitioned by log_date into 9 monthly child tables. PostgreSQL automatically prunes irrelevant partitions — proven via EXPLAIN ANALYZE.', code:'PARTITION BY RANGE (log_date)' },
    { icon:'🏢', title:'Multi-Tenancy Schema', tag:'Concept 3', tc:'#7C3AED', tb:'#F5F3FF', desc:'5 independent companies share one PostgreSQL database and one Next.js application. Every table has a tenant_id column. RLS enforces zero data leakage between tenants.', code:'Shared schema · 500 products · 5 tenants' },
    { icon:'🔄', title:'Replication',         tag:'Concept 4', tc:'#0891B2', tb:'#ECFEFF', desc:'Supabase streaming replication configured in Prisma schema. Primary database handles writes. Read Replica handles analytics SELECT queries for load distribution.', code:'url = DATABASE_URL · directUrl = DIRECT_URL' },
  ]

  const features = [
    { icon:'📦', title:'Products Management',    desc:'Full CRUD — search, sort, debounce filtering, RLS auto-isolates per tenant'         },
    { icon:'📊', title:'Recharts Analytics',     desc:'Bar, pie & area charts with inventory value, category breakdown, low stock alerts'   },
    { icon:'📈', title:'Stock Movement Chart',   desc:'Queries partitioned inventory_logs with date filter — partition pruning visualised'   },
    { icon:'🛒', title:'Purchase Orders',        desc:'Header-detail pattern — Draft → Submitted → Delivered with automatic stock update'   },
    { icon:'🤖', title:'Claude AI Assistant',    desc:'Live inventory analysis, velocity calculation, smart reorder suggestions via API'    },
    { icon:'📧', title:'Email Alerts',           desc:'HTML email via Resend when stock falls below reorder point — one-click send'         },
    { icon:'📂', title:'CSV Bulk Import',        desc:'Papa Parse + upsert — import 500 products from a spreadsheet in seconds'            },
    { icon:'⚡', title:'Realtime Updates',       desc:'Supabase WebSocket channel — dashboard refreshes live without page reload'          },
    { icon:'🔍', title:'Audit Log Trigger',      desc:'PostgreSQL AFTER trigger auto-logs every INSERT/UPDATE/DELETE — zero code in app'   },
    { icon:'👑', title:'Super Admin Panel',      desc:'Prisma $queryRaw bypasses RLS to show all tenants, products, inventory value'       },
    { icon:'🗃️', title:'DB Concepts Live Page', desc:'Queries pg_policies, pg_inherits, pg_class in real time — live proof for teacher'   },
    { icon:'🌐', title:'Vercel Deployment',      desc:'Production-deployed with serverless functions, HTTPS, global CDN, env variables'    },
  ]

  const techStack = [
    { name:'PostgreSQL 15', role:'Database',     color:'#336791' },
    { name:'Supabase',      role:'Cloud + Auth', color:'#3ECF8E' },
    { name:'Next.js 14',    role:'Full-Stack',   color:'#000000' },
    { name:'Prisma ORM',    role:'Type-safe DB', color:'#2D3748' },
    { name:'TypeScript',    role:'Language',     color:'#3178C6' },
    { name:'Tailwind CSS',  role:'Styling',      color:'#06B6D4' },
    { name:'Recharts',      role:'Charts',       color:'#FF6B6B' },
    { name:'Claude API',    role:'AI Assistant', color:'#D97706' },
    { name:'Resend',        role:'Email Alerts', color:'#3B82F6' },
    { name:'Papa Parse',    role:'CSV Import',   color:'#059669' },
    { name:'Faker.js',      role:'Seed Data',    color:'#7C3AED' },
    { name:'Vercel',        role:'Deployment',   color:'#1a1a1a' },
  ]

  const proofLinks = [
    { label:'RLS Policies',      url:'/dashboard/db-info',             detail:'Live from pg_policies',  color:'#059669', icon:'🔒' },
    { label:'Partition Pruning', url:'/dashboard/db-info/explain',     detail:'EXPLAIN ANALYZE output', color:'#1D4ED8', icon:'🗄️' },
    { label:'Multi-Tenant View', url:'/dashboard/admin',               detail:'Super Admin panel',      color:'#7C3AED', icon:'🏢' },
    { label:'Stock Movement',    url:'/dashboard/analytics/movement',  detail:'Partitioned table query',color:'#0891B2', icon:'📈' },
  ]

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:'Arial,Helvetica,sans-serif', color:'#0F172A' }}>

      {/* ── GLOBAL CSS ─────────────────────────────────────── */}
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes sf-float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes sf-glow-orb  { 0%,100%{opacity:0.35} 50%{opacity:0.7} }
        @keyframes sf-ring      { to{transform:scale(2.4);opacity:0} }
        @keyframes sf-text-ani  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes sf-fade-up   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sf-scale-in  { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes sf-bar-grow  { from{width:0} to{width:var(--w)} }

        .sf-grad-text {
          background: linear-gradient(135deg, #10B981 0%, #34D399 25%, #6EE7B7 50%, #059669 75%, #10B981 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: sf-text-ani 4s ease infinite;
        }

        /* Scroll reveal */
        .sfr { opacity:0; transform:translateY(30px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .sfr.sfv { opacity:1; transform:translateY(0); }
        .sfr.sl  { transform:translateX(-30px); }
        .sfr.sl.sfv { transform:translateX(0); }
        .sfr.sc  { transform:scale(0.88); }
        .sfr.sc.sfv { transform:scale(1); }

        /* Stagger */
        .d1{transition-delay:0.08s!important} .d2{transition-delay:0.16s!important}
        .d3{transition-delay:0.24s!important} .d4{transition-delay:0.32s!important}
        .d5{transition-delay:0.40s!important} .d6{transition-delay:0.48s!important}

        /* Glow button */
        .sf-glow-btn:hover { box-shadow: 0 0 25px rgba(5,150,105,0.55), 0 0 60px rgba(5,150,105,0.2) !important; }

        /* Nav link */
        .sfnl:hover { color:#10B981 !important; }

        /* Feature card */
        .sf-feat:hover { transform:translateY(-4px)!important; box-shadow:0 10px 28px rgba(5,150,105,0.12)!important; border-color:#6EE7B7!important; background:#F0FDF4!important; }
        .sf-feat { transition:all 0.22s ease!important; }

        /* Tech badge */
        .sf-tech { transition:all 0.2s ease!important; }
        .sf-tech:hover { transform:translateY(-6px) scale(1.06)!important; }

        /* Shine overlay */
        .sf-shine { position:absolute; inset:0; border-radius:inherit; pointer-events:none; opacity:0; transition:opacity 0.25s; }

        /* Proof card */
        .sfp { transition:all 0.22s ease; }
        .sfp:hover { transform:translateY(-5px)!important; }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position:'sticky', top:0, zIndex:50, height:'62px',
        padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between',
        background: navScrolled ? 'rgba(6,14,9,0.92)' : '#060E09',
        backdropFilter: navScrolled ? 'blur(16px)' : 'none',
        borderBottom: navScrolled ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.07)',
        transition:'all 0.35s ease',
      }}>

        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', color:'#fff', boxShadow:'0 0 18px rgba(5,150,105,0.45)', flexShrink:0 }}>SF</div>
          <span style={{ color:'#F1F5F9', fontWeight:'700', fontSize:'15px', letterSpacing:'-0.01em' }}>StockFlow</span>
          <span style={{ fontSize:'10px', color:'#34D399', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.22)', borderRadius:'999px', padding:'2px 10px', letterSpacing:'0.04em', fontWeight:'600' }}>DBMS Project · UCP</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'28px' }}>
          {['Features','DB Concepts','Tech Stack'].map(lnk => (
            <a key={lnk} href={`#${lnk.toLowerCase().replace(' ','-')}`} className="sfnl" style={{ color:'#475569', fontSize:'13px', textDecoration:'none', transition:'color 0.15s', fontWeight:'500' }}>{lnk}</a>
          ))}
        </div>

        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <a href="/login"
             style={{ color:'#94A3B8', fontSize:'13px', fontWeight:'500', textDecoration:'none', padding:'7px 16px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', transition:'all 0.18s' }}
             onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#E2E8F0' }}
             onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94A3B8' }}
          >Sign In</a>
          <a href="/register" className="sf-glow-btn"
             style={{ color:'#fff', fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'7px 18px', background:'#059669', borderRadius:'8px', border:'1px solid #047857', transition:'all 0.2s' }}
             onMouseEnter={e => { e.currentTarget.style.background='#047857'; e.currentTarget.style.transform='translateY(-1px)' }}
             onMouseLeave={e => { e.currentTarget.style.background='#059669'; e.currentTarget.style.transform='translateY(0)' }}
          >Get Started</a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position:'relative', background:'#060E09', padding:'100px 32px 110px', textAlign:'center', overflow:'hidden', minHeight:'700px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>

        {/* Canvas */}
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />

        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'8%',  left:'12%',  width:'400px', height:'400px', borderRadius:'50%', background:'rgba(5,150,105,0.055)', filter:'blur(90px)', pointerEvents:'none', animation:'sf-glow-orb 5s ease infinite' }} />
        <div style={{ position:'absolute', bottom:'8%', right:'12%', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(16,185,129,0.04)', filter:'blur(70px)', pointerEvents:'none', animation:'sf-glow-orb 6s ease infinite 1.5s' }} />

        {/* Grid overlay */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(16,185,129,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.025) 1px, transparent 1px)', backgroundSize:'56px 56px' }} />

        {/* Content */}
        <div style={{ position:'relative', zIndex:2, maxWidth:'900px', margin:'0 auto' }}>

          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.22)', borderRadius:'999px', padding:'6px 18px', marginBottom:'30px', animation:'sf-fade-up 0.55s ease both' }}>
            <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10B981', display:'inline-block', position:'relative' }}>
              <span style={{ position:'absolute', inset:'-3px', borderRadius:'50%', border:'1px solid #10B981', animation:'sf-ring 1.8s ease infinite' }} />
            </span>
            <span style={{ fontSize:'12px', color:'#34D399', fontWeight:'600', letterSpacing:'0.04em' }}>G1F24UBSCS024 · University of Central Punjab · DBMS Project</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:'54px', fontWeight:'800', color:'#F8FAFC', lineHeight:'1.1', letterSpacing:'-0.03em', margin:'0 0 6px', animation:'sf-fade-up 0.6s ease 0.1s both' }}>
            Cloud-Based Multi-Tenant
          </h1>
          <h1 style={{ fontSize:'54px', fontWeight:'800', lineHeight:'1.1', letterSpacing:'-0.03em', margin:'0 0 26px', animation:'sf-fade-up 0.6s ease 0.18s both' }}>
            <span className="sf-grad-text">SaaS Inventory System</span>
          </h1>

          {/* Description */}
          <p style={{ fontSize:'17px', color:'#64748B', lineHeight:'1.7', maxWidth:'580px', margin:'0 auto 42px', animation:'sf-fade-up 0.6s ease 0.28s both' }}>
            A production-grade full-stack application demonstrating four advanced PostgreSQL concepts —
            Row-Level Security, Table Partitioning, Multi-Tenancy, and Replication.
            Built with Next.js 14, Supabase, Prisma ORM, and Claude AI.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'64px', animation:'sf-fade-up 0.6s ease 0.36s both' }}>
            <a href="/register" className="sf-glow-btn"
               style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#059669', color:'#fff', padding:'14px 34px', borderRadius:'11px', fontSize:'15px', fontWeight:'700', textDecoration:'none', border:'1px solid #047857', transition:'all 0.22s' }}
               onMouseEnter={e => { e.currentTarget.style.background='#047857'; e.currentTarget.style.transform='translateY(-2px)' }}
               onMouseLeave={e => { e.currentTarget.style.background='#059669'; e.currentTarget.style.transform='translateY(0)' }}
            >Create Free Account <span style={{ fontSize:'18px' }}>→</span></a>
            <a href="/login"
               style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.04)', color:'#CBD5E1', padding:'14px 34px', borderRadius:'11px', fontSize:'15px', fontWeight:'500', textDecoration:'none', border:'1px solid rgba(255,255,255,0.1)', transition:'all 0.22s' }}
               onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#E2E8F0'; e.currentTarget.style.transform='translateY(-2px)' }}
               onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#CBD5E1'; e.currentTarget.style.transform='translateY(0)' }}
            >Sign In to Dashboard</a>
          </div>

          {/* Count-up stats */}
          <div id="sf-stats" style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', border:'1px solid rgba(16,185,129,0.14)', borderRadius:'16px', overflow:'hidden', maxWidth:'740px', margin:'0 auto', background:'rgba(255,255,255,0.025)', backdropFilter:'blur(10px)', animation:'sf-scale-in 0.65s ease 0.45s both' }}>
            {([
              { v:counts.products,   s:'+', label:'Seed Products'      },
              { v:counts.tenants,    s:'',  label:'Tenant Companies'   },
              { v:counts.policies,   s:'+', label:'RLS Policies'       },
              { v:counts.partitions, s:'',  label:'Monthly Partitions' },
              { v:counts.concepts,   s:'',  label:'DBMS Concepts'      },
            ] as { v:number; s:string; label:string }[]).map((stat, i, arr) => (
              <div key={stat.label} style={{ flex:'1 1 120px', padding:'24px 14px', textAlign:'center', borderRight:i<arr.length-1?'1px solid rgba(255,255,255,0.07)':'none' }}>
                <div style={{ fontSize:'30px', fontWeight:'800', color:'#10B981', lineHeight:'1', marginBottom:'5px', fontVariantNumeric:'tabular-nums' }}>
                  {stat.v}{stat.s}
                </div>
                <div style={{ fontSize:'11px', color:'#475569', letterSpacing:'0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DBMS CONCEPTS ──────────────────────────────────── */}
      <section id="db-concepts" style={{ background:'#F8FAFC', padding:'96px 32px' }}>
        <div style={{ maxWidth:'1120px', margin:'0 auto' }}>

          <div className="sfr" style={{ textAlign:'center', marginBottom:'56px' }}>
            <div style={{ display:'inline-block', fontSize:'11px', fontWeight:'700', color:'#059669', letterSpacing:'0.1em', background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:'999px', padding:'5px 14px', marginBottom:'16px' }}>TEACHER REQUIREMENTS</div>
            <h2 style={{ fontSize:'38px', fontWeight:'800', color:'#0F172A', margin:'0 0 12px', letterSpacing:'-0.02em' }}>4 DBMS Concepts Implemented</h2>
            <p style={{ fontSize:'16px', color:'#64748B', margin:0, maxWidth:'500px', marginLeft:'auto', marginRight:'auto', lineHeight:'1.65' }}>Each concept is live-queryable from the DB Concepts page using PostgreSQL system tables.</p>
          </div>

          {/* 3D Tilt cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'18px' }}>
            {concepts.map((c, i) => (
              <div key={c.title}
                   className={`sfr d${i+1}`}
                   style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:'16px', padding:'26px', borderTop:`3px solid ${c.tc}`, position:'relative', overflow:'hidden', cursor:'default', transition:'transform 0.15s ease, box-shadow 0.15s ease', willChange:'transform' }}
                   onMouseMove={onTiltMove}
                   onMouseLeave={onTiltLeave}
              >
                <div className="sf-shine" />
                <div style={{ fontSize:'30px', marginBottom:'14px', display:'inline-block', animation:`sf-float ${3.2+i*0.6}s ease-in-out infinite` }}>{c.icon}</div>
                <div style={{ display:'inline-block', fontSize:'10px', fontWeight:'700', color:c.tc, background:c.tb, borderRadius:'999px', padding:'3px 11px', marginBottom:'12px', letterSpacing:'0.06em', marginLeft:'10px' }}>{c.tag}</div>
                <h3 style={{ fontSize:'16px', fontWeight:'700', color:'#0F172A', margin:'0 0 10px', lineHeight:'1.3' }}>{c.title}</h3>
                <p style={{ fontSize:'13px', color:'#64748B', lineHeight:'1.65', margin:'0 0 16px' }}>{c.desc}</p>
                <code style={{ display:'block', fontSize:'10px', fontFamily:'Consolas,monospace', color:c.tc, background:c.tb, padding:'8px 12px', borderRadius:'8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.code}</code>
              </div>
            ))}
          </div>

          <div className="sfr" style={{ textAlign:'center', marginTop:'38px' }}>
            <a href="/dashboard/db-info"
               style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'#059669', fontSize:'14px', fontWeight:'700', textDecoration:'none', padding:'12px 26px', border:'1px solid #A7F3D0', borderRadius:'10px', background:'#ECFDF5', transition:'all 0.22s' }}
               onMouseEnter={e => { e.currentTarget.style.background='#D1FAE5'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(5,150,105,0.22)' }}
               onMouseLeave={e => { e.currentTarget.style.background='#ECFDF5'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
            >View DB Concepts Live Proof Page →</a>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:'1120px', margin:'0 auto' }}>

          <div className="sfr" style={{ textAlign:'center', marginBottom:'56px' }}>
            <div style={{ display:'inline-block', fontSize:'11px', fontWeight:'700', color:'#7C3AED', letterSpacing:'0.1em', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:'999px', padding:'5px 14px', marginBottom:'16px' }}>ALL FEATURES</div>
            <h2 style={{ fontSize:'38px', fontWeight:'800', color:'#0F172A', margin:'0 0 12px', letterSpacing:'-0.02em' }}>Production-grade in every way</h2>
            <p style={{ fontSize:'16px', color:'#64748B', margin:0 }}>12 core features — not just CRUD</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'12px' }}>
            {features.map((f, i) => (
              <div key={f.title}
                   className={`sfr sf-feat d${(i%6)+1}`}
                   style={{ display:'flex', gap:'14px', padding:'18px 20px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px' }}
              >
                <span style={{ fontSize:'22px', flexShrink:0, lineHeight:'1.3' }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight:'700', fontSize:'13px', color:'#0F172A', margin:'0 0 4px' }}>{f.title}</p>
                  <p style={{ fontSize:'12px', color:'#64748B', margin:0, lineHeight:'1.55' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ─────────────────────────────────────── */}
      <section id="tech-stack" style={{ background:'#F8FAFC', padding:'96px 32px' }}>
        <div style={{ maxWidth:'1120px', margin:'0 auto' }}>

          <div className="sfr" style={{ textAlign:'center', marginBottom:'56px' }}>
            <div style={{ display:'inline-block', fontSize:'11px', fontWeight:'700', color:'#0891B2', letterSpacing:'0.1em', background:'#ECFEFF', border:'1px solid #A5F3FC', borderRadius:'999px', padding:'5px 14px', marginBottom:'16px' }}>TECHNOLOGY STACK</div>
            <h2 style={{ fontSize:'38px', fontWeight:'800', color:'#0F172A', margin:'0 0 12px', letterSpacing:'-0.02em' }}>Built with industry-standard tools</h2>
            <p style={{ fontSize:'16px', color:'#64748B', margin:0 }}>Same stack real startups use in production</p>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', justifyContent:'center' }}>
            {techStack.map((t, i) => (
              <div key={t.name}
                   className={`sfr sf-tech d${(i%6)+1}`}
                   style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 22px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:'14px', minWidth:'110px', gap:'5px', cursor:'default' }}
                   onMouseEnter={e => { e.currentTarget.style.borderColor=t.color; e.currentTarget.style.boxShadow=`0 12px 32px ${t.color}28` }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.boxShadow='none' }}
              >
                <span style={{ display:'inline-block', fontSize:'10px', fontWeight:'700', color:'#fff', background:t.color, borderRadius:'5px', padding:'2px 8px', letterSpacing:'0.03em' }}>{t.name.split(' ')[0]}</span>
                <span style={{ fontSize:'12px', fontWeight:'600', color:'#0F172A' }}>{t.name}</span>
                <span style={{ fontSize:'10px', color:'#94A3B8' }}>{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PROOF ─────────────────────────────────────── */}
      <section style={{ background:'#0B1A12', padding:'76px 32px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'980px', margin:'0 auto' }}>

          <div className="sfr" style={{ textAlign:'center', marginBottom:'44px' }}>
            <h2 style={{ fontSize:'32px', fontWeight:'800', color:'#F8FAFC', margin:'0 0 10px', letterSpacing:'-0.02em' }}>
              Every concept has{' '}<span className="sf-grad-text">live proof</span>
            </h2>
            <p style={{ fontSize:'14px', color:'#334155', margin:0 }}>Queryable in real-time from your dashboard</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:'12px' }}>
            {proofLinks.map((item, i) => (
              <a key={item.label} href={item.url}
                 className={`sfr sfp d${i+1}`}
                 style={{ display:'block', padding:'26px 20px', textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', textDecoration:'none', transition:'all 0.22s' }}
                 onMouseEnter={e => { e.currentTarget.style.background=`${item.color}15`; e.currentTarget.style.borderColor=`${item.color}45`; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${item.color}18` }}
                 onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
              >
                <div style={{ fontSize:'26px', marginBottom:'10px' }}>{item.icon}</div>
                <p style={{ fontSize:'13px', fontWeight:'700', color:'#E2E8F0', margin:'0 0 5px' }}>{item.label}</p>
                <p style={{ fontSize:'11px', color:'#475569', margin:'0 0 12px' }}>{item.detail}</p>
                <code style={{ fontSize:'10px', color:item.color, fontFamily:'Consolas,monospace', background:'rgba(255,255,255,0.04)', padding:'4px 10px', borderRadius:'999px', border:`1px solid ${item.color}28` }}>{item.url}</code>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{ background:'#060E09', padding:'108px 32px', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.06)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'rgba(5,150,105,0.04)', filter:'blur(120px)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="sfr" style={{ display:'inline-block', fontSize:'11px', fontWeight:'700', color:'#34D399', letterSpacing:'0.1em', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.22)', borderRadius:'999px', padding:'5px 16px', marginBottom:'26px' }}>LIVE DEPLOYED ON VERCEL</div>
          <h2 className="sfr" style={{ fontSize:'46px', fontWeight:'800', color:'#F8FAFC', margin:'0 0 18px', letterSpacing:'-0.03em', lineHeight:'1.1' }}>Ready to explore?</h2>
          <p className="sfr" style={{ fontSize:'17px', color:'#475569', margin:'0 auto 42px', maxWidth:'460px', lineHeight:'1.65' }}>
            Register a company account to see RLS in action — your data will be completely
            isolated from other tenants sharing the same database.
          </p>
          <div className="sfr" style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/register" className="sf-glow-btn"
               style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#059669', color:'#fff', padding:'16px 38px', borderRadius:'12px', fontSize:'15px', fontWeight:'700', textDecoration:'none', border:'1px solid #047857', transition:'all 0.22s' }}
               onMouseEnter={e => { e.currentTarget.style.background='#047857'; e.currentTarget.style.transform='translateY(-2px)' }}
               onMouseLeave={e => { e.currentTarget.style.background='#059669'; e.currentTarget.style.transform='translateY(0)' }}
            >Create Account — It&apos;s Free</a>
            <a href="/login"
               style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'transparent', color:'#94A3B8', padding:'16px 38px', borderRadius:'12px', fontSize:'15px', fontWeight:'500', textDecoration:'none', border:'1px solid rgba(255,255,255,0.1)', transition:'all 0.22s' }}
               onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#E2E8F0'; e.currentTarget.style.transform='translateY(-2px)' }}
               onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94A3B8'; e.currentTarget.style.transform='translateY(0)' }}
            >Sign In to Dashboard</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ background:'#040B08', padding:'28px 32px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:'1120px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'800', color:'#fff' }}>SF</div>
            <span style={{ color:'#334155', fontSize:'12px' }}>StockFlow · G1F24UBSCS024 · University of Central Punjab</span>
          </div>
          <div style={{ display:'flex', gap:'20px' }}>
            {[{l:'Dashboard',h:'/dashboard'},{l:'DB Concepts',h:'/dashboard/db-info'},{l:'Analytics',h:'/dashboard/analytics'},{l:'Super Admin',h:'/dashboard/admin'}].map(lnk => (
              <a key={lnk.l} href={lnk.h} style={{ color:'#334155', fontSize:'12px', textDecoration:'none', transition:'color 0.15s' }}
                 onMouseEnter={e => (e.currentTarget.style.color='#64748B')}
                 onMouseLeave={e => (e.currentTarget.style.color='#334155')}
              >{lnk.l}</a>
            ))}
          </div>
          <div style={{ display:'flex', gap:'6px' }}>
            {['PostgreSQL','Next.js','Supabase','Prisma'].map(t => (
              <span key={t} style={{ fontSize:'10px', color:'#1E3A5F', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'4px', padding:'2px 7px' }}>{t}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}