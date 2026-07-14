<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>みんなの捨てる家 | 6A 学級演劇</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --paper:#EDE6D6;
    --paper-deep:#E1D6BE;
    --ink:#2A2420;
    --indigo:#22344D;
    --indigo-deep:#182739;
    --kaki:#B5533C;
    --gold:#A98A4E;
    --night:#171A22;
    --font-display:'Shippori Mincho', serif;
    --font-body:'Zen Kaku Gothic New', sans-serif;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    margin:0;
    position:relative;
    background:transparent;
    color:var(--ink);
    font-family:var(--font-body);
    line-height:1.9;
    overflow-x:hidden;
  }
  body.locked{overflow:hidden;height:100vh;}
  ::selection{background:var(--kaki);color:var(--paper);}
  a{color:inherit;}
  :focus-visible{outline:2px solid var(--kaki);outline-offset:3px;}

  /* ---------- texture (無効化: 自前の背景に置き換えるため) ---------- */
  .washi{
    position:relative;
  }
  .washi::before{
    content:none;
  }

  /* ---------- full-page background pattern (seigaiha / 青海波) ---------- */
  /* 元々あった和柄の背景パターンは無効化しています（自前の背景に置き換えるため） */
  .bg-pattern{display:none;}
  /* 背景動画: SITE_MEDIA.bgVideo を指定すると表示されます（透明度は高め＝控えめ） */
  .bg-video{
    position:fixed;inset:0;z-index:0;pointer-events:none;
    width:100%;height:100%;object-fit:cover;
    opacity:0.5;
    display:none;
  }
  .bg-video.is-active{display:block;}
  /* スクロールで一緒に動く背景画像: SITE_MEDIA.scrollImage を指定すると表示されます（不透明度80%） */
  .bg-scroll-image{
    position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;pointer-events:none;
    width:100%;height:100%;object-fit:cover;
    opacity:1.0;
    display:none;
  }
  .bg-scroll-image.is-active{display:block;}
  /* content sits above the fixed pattern layer */
  header.nav, section, footer{position:relative;z-index:1;}

  /* ================= INTRO ================= */
  #intro{
    position:fixed;inset:0;z-index:999;
    background:linear-gradient(180deg,#0F1621 0%, #1B2436 45%, #2A2233 100%);
    display:flex;align-items:center;justify-content:center;
    overflow:hidden;
    cursor:pointer;
  }
  #intro .stars{
    position:absolute;inset:0;
    background-image:
      radial-gradient(1.5px 1.5px at 20% 30%, #E7DCC0 40%, transparent 41%),
      radial-gradient(1px 1px at 70% 20%, #E7DCC0 40%, transparent 41%),
      radial-gradient(1px 1px at 85% 55%, #E7DCC0 40%, transparent 41%),
      radial-gradient(1.5px 1.5px at 35% 65%, #E7DCC0 40%, transparent 41%),
      radial-gradient(1px 1px at 55% 15%, #E7DCC0 40%, transparent 41%),
      radial-gradient(1px 1px at 10% 75%, #E7DCC0 40%, transparent 41%);
    opacity:0.7;
  }
  .house-wrap{
    position:relative;
    width:min(70vw,420px);
    aspect-ratio:4/3;
    opacity:0;
    transform:translateY(18px) scale(0.96);
    transition:opacity 1s ease, transform 1s ease;
  }
  #intro.ready .house-wrap{opacity:1;transform:translateY(0) scale(1);}
  #intro.zooming .house-wrap{
    transform:scale(9);
    opacity:0;
    transition:transform 1.5s cubic-bezier(.55,0,.85,.35), opacity 1.5s ease 0.4s;
  }
  #intro.zooming .stars{opacity:0;transition:opacity 1.3s ease;}
  #intro.hide{opacity:0;pointer-events:none;transition:opacity .5s ease;}

  /* house-photo: swap the background-image below for a specific photo.
     door-overlay: repositions the animated door on top of that photo via
     --door-x/--door-y/--door-w/--door-h (percentages of the house-wrap box). */
  .house-photo{
    position:absolute;inset:0;width:100%;height:100%;
    display:block;object-fit:cover;box-shadow:0 30px 60px rgba(0,0,0,0.45);
  }
  .house-wrap{
    --door-x:50%; --door-y:60%; --door-w:22%; --door-h:42%;
  }
  .door-overlay{
    position:absolute;
    left:var(--door-x); top:var(--door-y);
    width:var(--door-w); height:var(--door-h);
    transform:translate(-50%,-50%);
    overflow:visible;
  }
  .door-overlay svg{width:100%;height:100%;display:block;overflow:visible;}

  /* オープニング動画: SITE_MEDIA.introVideo を指定すると、扉のアニメーションの代わりに
     動画が自動再生されます（再生が終わると自動でサイト本体へ） */
  .intro-video{
    position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
    display:none;
  }
  #intro.use-video .intro-video{display:block;}
  #intro.use-video .house-wrap,
  #intro.use-video .intro-hint{display:none;}
  .door-left, .door-right{transition:transform 1.3s cubic-bezier(.6,0,.3,1);}
  #intro.open .door-left{transform:translateX(-46px);}
  #intro.open .door-right{transform:translateX(46px);}
  .light-glow{opacity:0;transition:opacity 1.3s ease;}
  #intro.open .light-glow{opacity:1;}

  .intro-hint{
    position:absolute;bottom:9%;left:50%;transform:translateX(-50%);
    color:#E7DCC0;font-family:var(--font-body);
    font-size:0.85rem;letter-spacing:0.15em;
    opacity:0.85;
    animation:pulseHint 2.2s ease-in-out infinite;
  }
  @keyframes pulseHint{0%,100%{opacity:.5}50%{opacity:1}}
  #intro.open .intro-hint, #intro.zooming .intro-hint{opacity:0;}

  .skip-btn{
    position:absolute;top:20px;right:20px;
    background:transparent;border:1px solid rgba(231,220,192,0.4);
    color:#E7DCC0;font-family:var(--font-body);font-size:0.75rem;
    padding:8px 16px;border-radius:2px;letter-spacing:0.1em;cursor:pointer;
    z-index:5;
  }
  .skip-btn:hover{background:rgba(231,220,192,0.12);}

  /* ================= NAV ================= */
  header.nav{
    position:fixed;top:0;left:0;right:0;z-index:200;
    background:transparent;
    border-bottom:1px solid rgba(169,138,78,0.35);
    display:flex;align-items:center;justify-content:space-between;
    padding:14px clamp(16px,4vw,48px);
    transform:translateY(-110%);
    opacity:0;
    transition:transform .8s ease, opacity .8s ease;
  }
  header.nav.show{transform:translateY(0);opacity:1;}
  .nav-title{
    font-family:var(--font-display);font-weight:700;
    font-size:1rem;color:var(--indigo);letter-spacing:0.05em;
    text-decoration:none;white-space:nowrap;
  }
  .nav-links{
    display:flex;gap:clamp(10px,2vw,28px);flex-wrap:wrap;
    list-style:none;margin:0;padding:0;
  }
  .nav-links a{
    text-decoration:none;font-size:0.82rem;color:var(--ink);
    letter-spacing:0.05em;position:relative;padding-bottom:3px;
  }
  .nav-links a::after{
    content:"";position:absolute;left:0;bottom:0;width:0;height:1px;
    background:var(--kaki);transition:width .3s ease;
  }
  .nav-links a:hover::after{width:100%;}

  /* ================= LAYOUT ================= */
  section{
    position:relative;
    padding:clamp(64px,10vw,120px) clamp(20px,7vw,90px);
  }
  .chapter{
    display:inline-flex;align-items:center;gap:10px;
    font-family:var(--font-display);color:var(--gold);
    font-size:0.85rem;letter-spacing:0.35em;margin-bottom:18px;
  }
  .chapter::before{content:"";width:26px;height:1px;background:var(--gold);}

  h1,h2,h3{font-family:var(--font-display);margin:0;color:var(--indigo);}

  .reveal{opacity:0;transform:translateY(26px);transition:opacity .9s ease, transform .9s ease;}
  .reveal.in-view{opacity:1;transform:translateY(0);}
  .reveal-stagger > *{opacity:0;transform:translateY(22px);transition:opacity .7s ease, transform .7s ease;}
  .reveal-stagger.in-view > *{opacity:1;transform:translateY(0);}
  .reveal-stagger.in-view > *:nth-child(1){transition-delay:.05s}
  .reveal-stagger.in-view > *:nth-child(2){transition-delay:.15s}
  .reveal-stagger.in-view > *:nth-child(3){transition-delay:.25s}
  .reveal-stagger.in-view > *:nth-child(4){transition-delay:.35s}
  .reveal-stagger.in-view > *:nth-child(5){transition-delay:.45s}
  .reveal-stagger.in-view > *:nth-child(6){transition-delay:.55s}
  .reveal-stagger.in-view > *:nth-child(7){transition-delay:.65s}
  .reveal-stagger.in-view > *:nth-child(8){transition-delay:.75s}
  .reveal-stagger.in-view > *:nth-child(9){transition-delay:.85s}
  .reveal-stagger.in-view > *:nth-child(10){transition-delay:.95s}

  /* ---- HERO / HOME ---- */
  #home{
    min-height:100vh;
    display:flex;flex-direction:column;justify-content:center;
    background:transparent;
    padding-top:140px;
  }
  /* ページ最上部の画像: SITE_MEDIA.heroImage を指定すると表示されます */
  .hero-top-image{
    width:100%;max-width:720px;height:auto;
    display:none;margin:0 0 32px;
  }
  .hero-top-image.is-active{display:block;}
  .class-tag{
    display:inline-block;font-family:var(--font-body);font-weight:700;
    color:var(--paper);background:var(--indigo);
    padding:6px 18px;border-radius:2px;font-size:0.85rem;
    letter-spacing:0.2em;margin-bottom:28px;
  }
  .play-title{
    font-size:clamp(2.6rem,7vw,5rem);
    font-weight:800;line-height:1.25;color:var(--indigo);
    max-width:14ch;
  }
  .play-title .accent{color:var(--kaki);}
  /* タイトルを画像に差し替える場合: SITE_MEDIA.titleLogo を指定してください */
  .title-logo{max-width:min(90vw,520px);height:auto;display:none;}
  .title-logo.is-active{display:block;}
  .title-logo.is-active + .play-title{display:none;}
  .divider{
    width:64px;height:3px;background:var(--kaki);margin:34px 0;border:none;
  }
  .synopsis{
    max-width:620px;font-size:1.02rem;color:#3A342E;
  }
  .synopsis strong{color:var(--indigo);font-weight:700;}
  /* 「あらすじ」の見出しを画像に差し替える場合: SITE_MEDIA.synopsisLabel を指定してください */
  .synopsis-label-img{height:28px;width:auto;display:none;margin-bottom:6px;}
  .synopsis-label-img.is-active{display:block;}
  .synopsis-label-img.is-active + .synopsis-label-text{display:none;}

  /* ---- CHARACTERS ---- */
  #characters{background:transparent;}
  .char-grid{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
    gap:28px;margin-top:40px;
  }
  .char-card{
    background:var(--paper);border:1px solid rgba(169,138,78,0.3);
    padding:26px 24px;position:relative;
  }
  .char-card::before{
    content:"";position:absolute;top:0;left:0;width:100%;height:3px;
    background:var(--indigo);
  }
  .char-name{font-family:var(--font-display);font-size:1.15rem;color:var(--indigo);margin-bottom:6px;}
  .char-role{font-size:0.78rem;color:var(--kaki);letter-spacing:0.08em;margin-bottom:14px;display:block;}
  .char-desc{font-size:0.92rem;color:#4a443c;}

  /* ---- JOBS ---- */
  #jobs{background:transparent;}
  .job-filters{
    display:flex;gap:10px;flex-wrap:wrap;margin-top:28px;
  }
  .job-filter-btn{
    font-family:var(--font-body);font-size:0.8rem;letter-spacing:0.05em;
    background:transparent;border:1px solid rgba(169,138,78,0.5);
    color:var(--indigo);padding:8px 18px;border-radius:2px;cursor:pointer;
    transition:background .25s ease, color .25s ease, border-color .25s ease;
  }
  .job-filter-btn:hover{border-color:var(--kaki);}
  .job-filter-btn.active{background:var(--indigo);border-color:var(--indigo);color:var(--paper);}
  .job-grid{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:2px;margin-top:28px;background:rgba(169,138,78,0.3);
  }
  .job-card{
    background:var(--paper);padding:0;cursor:pointer;
    transition:opacity .3s ease, transform .3s ease;
    display:flex;flex-direction:column;
  }
  .job-card.is-hidden{display:none;}
  .job-thumb{
    aspect-ratio:16/10;position:relative;overflow:hidden;
    background:
      repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 14px),
      linear-gradient(160deg, var(--indigo) 0%, #3B4E63 60%, var(--kaki) 140%);
  }
  .job-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
  .job-cat-tag{
    position:absolute;top:10px;left:10px;font-size:0.68rem;letter-spacing:0.08em;
    background:rgba(23,26,34,0.65);color:var(--paper);padding:3px 10px;border-radius:2px;
  }
  .job-body{padding:22px;flex:1;}
  .job-num{font-family:var(--font-display);color:var(--gold);font-size:0.85rem;letter-spacing:0.1em;}
  .job-name{font-family:var(--font-display);font-size:1.1rem;color:var(--indigo);margin:8px 0 10px;}
  .job-desc{font-size:0.86rem;color:#4a443c;}
  .job-assign{
    margin-top:14px;font-size:0.78rem;color:var(--kaki);
    border-top:1px dashed rgba(181,83,60,0.4);padding-top:10px;
  }
  .job-more{
    margin-top:10px;font-size:0.75rem;color:var(--indigo);letter-spacing:0.05em;
    display:flex;align-items:center;gap:4px;
  }
  .job-card:hover .job-more{color:var(--kaki);}

  /* ---- JOB MODAL ---- */
  .modal-overlay{
    position:fixed;inset:0;z-index:500;
    background:rgba(17,20,27,0.72);
    display:flex;align-items:center;justify-content:center;
    padding:24px;
    opacity:0;pointer-events:none;
    transition:opacity .3s ease;
  }
  .modal-overlay.show{opacity:1;pointer-events:auto;}
  .modal-box{
    background:var(--paper);max-width:560px;width:100%;max-height:86vh;overflow-y:auto;
    position:relative;transform:translateY(16px);transition:transform .3s ease;
    border-top:4px solid var(--indigo);
  }
  .modal-overlay.show .modal-box{transform:translateY(0);}
  .modal-thumb{
    aspect-ratio:16/9;
    background:
      repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 14px),
      linear-gradient(160deg, var(--indigo) 0%, #3B4E63 60%, var(--kaki) 140%);
    position:relative;overflow:hidden;
  }
  .modal-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
  .modal-close{
    position:absolute;top:14px;right:14px;z-index:2;
    width:34px;height:34px;border-radius:50%;border:none;
    background:rgba(23,26,34,0.6);color:var(--paper);font-size:1rem;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
  }
  .modal-close:hover{background:var(--kaki);}
  .modal-content{padding:28px 30px 32px;}
  .modal-cat{font-size:0.72rem;letter-spacing:0.1em;color:var(--kaki);margin-bottom:8px;display:block;}
  .modal-content h3{font-size:1.4rem;margin-bottom:14px;}
  .modal-content p{font-size:0.92rem;color:#4a443c;margin:0 0 14px;}
  .modal-assign{font-size:0.85rem;color:var(--indigo);border-top:1px dashed rgba(181,83,60,0.4);padding-top:14px;}

  /* ---- LOCATION ---- */
  #location{background:transparent;color:var(--paper);}
  #location h2{color:var(--paper);}
  #location .chapter{color:#D8C9A3;}
  #location .chapter::before{background:#D8C9A3;}
  .loc-wrap{
    display:flex;gap:56px;flex-wrap:wrap;margin-top:40px;align-items:flex-start;
  }
  .loc-info{flex:1;min-width:260px;}
  .loc-info p{color:#DCD4C2;}
  .loc-info .room{
    font-family:var(--font-display);font-size:1.6rem;color:var(--paper);margin-bottom:6px;
  }
  .route{flex:1;min-width:260px;}
  .route-step{
    display:flex;align-items:center;gap:16px;margin-bottom:22px;position:relative;
  }
  .route-step:not(:last-child)::after{
    content:"";position:absolute;left:19px;top:42px;width:1px;height:22px;
    background:rgba(216,201,163,0.5);
  }
  .route-dot{
    width:40px;height:40px;border-radius:50%;border:1px solid var(--gold);
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    font-family:var(--font-display);color:var(--gold);font-size:0.85rem;
  }
  .route-text b{color:var(--paper);display:block;font-size:0.95rem;margin-bottom:2px;}
  .route-text span{color:#B9AF95;font-size:0.8rem;}
  .edit-note{
    margin-top:24px;font-size:0.75rem;color:#B9AF95;border-left:2px solid var(--kaki);padding-left:12px;
  }

  /* ---- GALLERY ---- */
  #gallery{background:transparent;}
  .gal-grid{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:18px;margin-top:40px;
  }
  .gal-item{
    aspect-ratio:4/3;position:relative;overflow:hidden;
    display:flex;align-items:flex-end;
    border:1px solid rgba(169,138,78,0.35);
  }
  .gal-item .bg{
    position:absolute;inset:0;
    background:
      repeating-linear-gradient(135deg, rgba(34,52,77,0.08) 0 2px, transparent 2px 14px),
      linear-gradient(160deg, var(--indigo) 0%, #3B4E63 55%, var(--kaki) 130%);
    transition:transform .6s ease;
  }
  .gal-item:hover .bg{transform:scale(1.06);}
  .gal-cam{
    position:absolute;top:14px;left:14px;color:rgba(237,230,214,0.85);font-size:0.75rem;
    letter-spacing:0.1em;
  }
  .gal-label{
    position:relative;z-index:1;padding:14px 16px;font-size:0.85rem;
    color:var(--paper);background:linear-gradient(0deg, rgba(23,26,34,0.55), transparent);
    width:100%;font-family:var(--font-body);letter-spacing:0.04em;
  }
  .gallery-note{margin-top:24px;font-size:0.78rem;color:#6b6255;}

  /* ---- FOOTER / CONTACT ---- */
  footer{
    background:transparent;color:#CFC6B3;
    padding:70px clamp(20px,7vw,90px) 34px;
    text-align:center;
  }
  footer h2{color:var(--paper);font-size:1.6rem;margin-bottom:10px;}
  footer p{color:#9C9484;max-width:480px;margin:0 auto 30px;font-size:0.9rem;}
  .sns-row{
    display:flex;gap:20px;justify-content:center;margin-bottom:40px;flex-wrap:wrap;
  }
  .sns-link{
    display:flex;align-items:center;gap:8px;
    border:1px solid rgba(169,138,78,0.5);color:var(--paper);
    text-decoration:none;padding:10px 22px;font-size:0.85rem;letter-spacing:0.06em;
    transition:background .3s ease, border-color .3s ease;
  }
  .sns-link:hover{background:rgba(181,83,60,0.18);border-color:var(--kaki);}
  .sns-link svg{width:16px;height:16px;fill:currentColor;}
  footer .fine{font-size:0.72rem;color:#5f584c;border-top:1px solid rgba(169,138,78,0.2);padding-top:20px;margin-top:10px;}

  /* ---- 付喪神 マスコット ---- */
  .tsukumogami{
    position:fixed;right:clamp(12px,3vw,28px);bottom:clamp(12px,3vw,28px);
    z-index:300;cursor:pointer;
  }
  .tsuku-img{
    width:clamp(64px,9vw,92px);height:auto;display:block;
    filter:drop-shadow(0 8px 14px rgba(0,0,0,0.35));
    animation:tsukuFloat 3.2s ease-in-out infinite;
    transition:transform .25s ease;
  }
  .tsukumogami:hover .tsuku-img{transform:scale(1.06);}
  @keyframes tsukuFloat{
    0%,100%{transform:translateY(0) rotate(-2deg);}
    50%{transform:translateY(-10px) rotate(2deg);}
  }
  .tsuku-bubble{
    position:absolute;bottom:110%;right:0;
    width:220px;background:var(--paper);color:var(--ink);
    border:1px solid rgba(169,138,78,0.5);
    padding:14px 16px;font-size:0.78rem;line-height:1.7;
    box-shadow:0 10px 24px rgba(0,0,0,0.2);
    opacity:0;transform:translateY(8px);pointer-events:none;
    transition:opacity .25s ease, transform .25s ease;
  }
  .tsukumogami.talking .tsuku-bubble{opacity:1;transform:translateY(0);}
  .tsuku-bubble::after{
    content:"";position:absolute;bottom:-6px;right:22px;
    width:12px;height:12px;background:var(--paper);
    border-right:1px solid rgba(169,138,78,0.5);border-bottom:1px solid rgba(169,138,78,0.5);
    transform:rotate(45deg);
  }

  @media (prefers-reduced-motion: reduce){
    *{animation-duration:0.01ms !important;transition-duration:0.01ms !important;}
  }
</style>
</head>
<body class="locked">
<div class="bg-pattern" aria-hidden="true"></div>
<video class="bg-video" id="bgVideo" muted loop playsinline aria-hidden="true"></video>
<img class="bg-scroll-image" id="bgScrollImage" alt="" aria-hidden="true">

<!-- ============ OPENING ============ -->
<div id="intro">
  <div class="stars"></div>
  <button class="skip-btn" id="skipBtn">スキップ</button>
  <div class="house-wrap">
    <!-- ▼▼ ここを差し替え: src を指定の家の画像に変更してください ▼▼ -->
    <img class="house-photo" id="housePhoto" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231B2436'/%3E%3Cpath d='M40 120 L200 40 L360 120 L340 120 L200 55 L60 120 Z' fill='%23182739'/%3E%3Cpath d='M55 122 L200 50 L345 122 L345 132 L200 62 L55 132 Z' fill='%2322344D'/%3E%3Crect x='70' y='122' width='260' height='150' fill='%232C3D53'/%3E%3Crect x='70' y='122' width='260' height='8' fill='%23182739'/%3E%3Ccircle cx='120' cy='140' r='6' fill='%23E8C77E' opacity='0.8'/%3E%3C/svg%3E" alt="劇の舞台となる和風の家">
    <!-- ▲▲ ここまで ▲▲ -->
    <div class="door-overlay">
      <svg viewBox="0 0 80 122" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="80" height="122" fill="#0F1621"/>
        <rect class="light-glow" x="0" y="0" width="80" height="122" fill="#E8C77E" opacity="0.9"/>
        <g class="door-left">
          <rect x="0" y="0" width="40" height="122" fill="#B5533C"/>
          <line x1="0" y1="32" x2="40" y2="32" stroke="#8C3E2C" stroke-width="1"/>
          <line x1="0" y1="62" x2="40" y2="62" stroke="#8C3E2C" stroke-width="1"/>
          <line x1="0" y1="92" x2="40" y2="92" stroke="#8C3E2C" stroke-width="1"/>
          <line x1="20" y1="0" x2="20" y2="122" stroke="#8C3E2C" stroke-width="1"/>
        </g>
        <g class="door-right">
          <rect x="40" y="0" width="40" height="122" fill="#B5533C"/>
          <line x1="40" y1="32" x2="80" y2="32" stroke="#8C3E2C" stroke-width="1"/>
          <line x1="40" y1="62" x2="80" y2="62" stroke="#8C3E2C" stroke-width="1"/>
          <line x1="40" y1="92" x2="80" y2="92" stroke="#8C3E2C" stroke-width="1"/>
          <line x1="60" y1="0" x2="60" y2="122" stroke="#8C3E2C" stroke-width="1"/>
        </g>
      </svg>
    </div>
  </div>
  <!-- オープニング動画（門・扉が開く動画など）: SITE_MEDIA.introVideo を指定すると自動再生されます -->
  <video class="intro-video" id="introVideoEl" muted playsinline></video>
  <p class="intro-hint">クリックして扉を開ける</p>
</div>

<!-- ============ NAV ============ -->
<header class="nav" id="siteNav">
  <a href="#home" class="nav-title">みんなの捨てる家</a>
  <ul class="nav-links">
    <li><a href="#characters">登場人物紹介</a></li>
    <li><a href="#jobs">仕事一覧</a></li>
    <li><a href="#location">教室の場所</a></li>
    <li><a href="#gallery">ギャラリー</a></li>
  </ul>
</header>

<!-- ============ HOME ============ -->
<section id="home" class="washi">
  <!-- ページの一番上に画像を載せる場合: SITE_MEDIA.heroImage を指定してください -->
  <img class="hero-top-image reveal" id="heroImage" alt="">
  <div class="reveal">
    <span class="class-tag">6年A組 学級演劇</span>
  </div>
  <!-- タイトルを画像に差し替える場合: SITE_MEDIA.titleLogo を指定してください -->
  <img class="title-logo reveal" id="titleLogo" alt="みんなの捨てる家">
  <h1 class="play-title reveal">みんなの<span class="accent">捨てる</span>家</h1>
  <hr class="divider reveal">
  <div class="synopsis reveal">
    <img class="synopsis-label-img" id="synopsisLabelImg" alt="あらすじ">
    <p class="synopsis-label-text"><strong>あらすじ</strong></p>
    <p>
      僕らに残された家。<br><br>

僕も、姉も、兄も、妹も、<br>
かつてはこの一つ屋根の下で過ごした。<br><br>

この家に兄弟全員が揃う日なんて、<br>
よっぽど良いことがある日か、悪いことがある日だ。<br><br>

卒業アルバム眺めながら、姉は言う。<br>
箪笥から溢れた紙袋出しながら、兄は言う。<br>
鮭を咥えた熊抱きながら、妹は言う。<br><br>

この家どうする。<br><br>

捨てるに捨てられないものに埋もれながら言い争う、<br>
僕らが兄弟の進まない片付けコメディ。
    </p>
  </div>
</section>

<!-- ============ CHARACTERS ============ -->
<section id="characters" class="washi">
  <div class="chapter reveal">CHARACTERS</div>
  <h2 class="reveal" style="font-size:clamp(1.6rem,4vw,2.4rem);">登場人物紹介</h2>
  <div class="char-grid reveal-stagger">
    <div class="char-card">
      <div class="char-name">田中 陽子（たなか ようこ）</div>
      <span class="char-role">この家の長女・東京在住</span>
      <p class="char-desc">家を出て10年。取り壊しの知らせを受けて久しぶりに帰ってきた。家より思い出を手放すのが怖い。</p>
    </div>
    <div class="char-card">
      <div class="char-name">田中 修二（たなか しゅうじ）</div>
      <span class="char-role">陽子の弟・地元在住</span>
      <p class="char-desc">家を継ぐか手放すか、ずっと一人で悩んでいた。姉には言えない本音を抱えている。</p>
    </div>
    <div class="char-card">
      <div class="char-name">山田 みつる</div>
      <span class="char-role">幼なじみ・骨董屋の店主</span>
      <p class="char-desc">古い道具の値打ちなら誰よりも詳しい。だけど、この家の物だけは値段がつけられない。</p>
    </div>
    <div class="char-card">
      <div class="char-name">木村 先生</div>
      <span class="char-role">かつての家庭教師</span>
      <p class="char-desc">この家で子どもたちに勉強を教えていた老人。誰も知らない家の歴史を知っている。</p>
    </div>
    <div class="char-card">
      <div class="char-name">フク</div>
      <span class="char-role">家に住み着いた猫</span>
      <p class="char-desc">いつからかこの家にいる。言葉は話さないが、すべてを見てきた唯一の証人。</p>
    </div>
  </div>
</section>

<!-- ============ JOBS ============ -->
<section id="jobs" class="washi">
  <div class="chapter reveal">STAFF</div>
  <h2 class="reveal" style="font-size:clamp(1.6rem,4vw,2.4rem);">仕事一覧</h2>
  <div class="job-filters reveal">
    <button class="job-filter-btn active" data-filter="all">すべて</button>
    <button class="job-filter-btn" data-filter="interior">内装</button>
    <button class="job-filter-btn" data-filter="exterior">外装</button>
    <button class="job-filter-btn" data-filter="other">その他</button>
  </div>
  <div class="job-grid reveal-stagger" id="jobGrid"></div>
</section>

<!-- ============ LOCATION ============ -->
<section id="location">
  <div class="chapter reveal">VENUE</div>
  <h2 class="reveal" style="font-size:clamp(1.6rem,4vw,2.4rem);">教室の場所</h2>
  <div class="loc-wrap reveal">
    <div class="loc-info">
      <div class="room">3号館 2階 6年A組教室</div>
      <p>正面玄関からお越しの方は、下足箱で上履きに履き替えてお進みください。<br>教室前には「みんなの捨てる家」の看板が目印です。</p>
      <div class="edit-note">※ 実際の校舎・教室名に差し替えてご利用ください。</div>
    </div>
    <div class="route">
      <div class="route-step">
        <div class="route-dot">1</div>
        <div class="route-text"><b>正面玄関</b><span>受付にて上履きへ</span></div>
      </div>
      <div class="route-step">
        <div class="route-dot">2</div>
        <div class="route-text"><b>3号館 正面階段</b><span>2階へ上がる</span></div>
      </div>
      <div class="route-step">
        <div class="route-dot">3</div>
        <div class="route-text"><b>突き当たりを右へ</b><span>暖簾が目印</span></div>
      </div>
      <div class="route-step">
        <div class="route-dot">4</div>
        <div class="route-text"><b>6年A組 教室</b><span>ご来場ありがとうございます</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ============ GALLERY ============ -->
<section id="gallery" class="washi">
  <div class="chapter reveal">GALLERY</div>
  <h2 class="reveal" style="font-size:clamp(1.6rem,4vw,2.4rem);">ギャラリー</h2>
  <div class="gal-grid reveal-stagger">
    <div class="gal-item"><div class="bg"></div><span class="gal-cam">◎ 01</span><div class="gal-label">稽古風景</div></div>
    <div class="gal-item"><div class="bg"></div><span class="gal-cam">◎ 02</span><div class="gal-label">大道具制作</div></div>
    <div class="gal-item"><div class="bg"></div><span class="gal-cam">◎ 03</span><div class="gal-label">衣装合わせ</div></div>
    <div class="gal-item"><div class="bg"></div><span class="gal-cam">◎ 04</span><div class="gal-label">舞台美術</div></div>
    <div class="gal-item"><div class="bg"></div><span class="gal-cam">◎ 05</span><div class="gal-label">通し稽古</div></div>
    <div class="gal-item"><div class="bg"></div><span class="gal-cam">◎ 06</span><div class="gal-label">本番当日</div></div>
  </div>
  <p class="gallery-note">※ このギャラリーは仮の枠です。実際の写真に差し替えてご利用ください（&lt;div class="bg"&gt; を &lt;img&gt; タグに置き換え）。</p>
</section>

<!-- ============ FOOTER ============ -->
<footer>
  <h2>公演のお知らせ・お問い合わせ</h2>
  <p>稽古の様子や公演情報は、SNSでも発信しています。ぜひフォローしてください。</p>
  <div class="sns-row">
    <a class="sns-link" href="https://www.instagram.com/" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .24 2.4.4.6.24 1 .53 1.5 1 .47.5.76.9 1 1.5.16.4.34 1.2.4 2.4.06 1.3.07 1.7.07 4.9s-.01 3.6-.07 4.9c-.06 1.2-.24 2-.4 2.4-.24.6-.53 1-1 1.5-.5.47-.9.76-1.5 1-.4.16-1.2.34-2.4.4-1.3.06-1.7.07-4.9.07s-3.6-.01-4.9-.07c-1.2-.06-2-.24-2.4-.4-.6-.24-1-.53-1.5-1-.47-.5-.76-.9-1-1.5-.16-.4-.34-1.2-.4-2.4C2.21 15.6 2.2 15.2 2.2 12s.01-3.6.07-4.9c.06-1.2.24-2 .4-2.4.24-.6.53-1 1-1.5.5-.47.9-.76 1.5-1 .4-.16 1.2-.34 2.4-.4C8.4 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.75.07-1 .05-1.5.2-1.86.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.29.86-.34 1.86C3.1 8.5 3.1 8.85 3.1 12s0 3.5.06 4.75c.05 1 .2 1.5.34 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.86.29 1.86.34 1.25.06 1.6.07 4.75.07s3.5 0 4.75-.07c1-.05 1.5-.2 1.86-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.29-.86.34-1.86.06-1.25.07-1.6.07-4.75s0-3.5-.07-4.75c-.05-1-.2-1.5-.34-1.86a3 3 0 0 0-.75-1.15 3 3 0 0 0-1.15-.75c-.36-.14-.86-.29-1.86-.34C15.5 4 15.15 4 12 4zm0 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zm4.8-2a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16z"/></svg>
      Instagram
    </a>
    <a class="sns-link" href="mailto:example@school.jp">
      <svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.4 2 7.1 5.6a1 1 0 0 0 1 0L19.6 7H4.4zM4 8.4V17h16V8.4l-6.5 5.13a2.5 2.5 0 0 1-3 0L4 8.4z"/></svg>
      お問い合わせ
    </a>
  </div>
  <div class="fine">6年A組 学級演劇「みんなの捨てる家」 &nbsp;|&nbsp; 画像・リンク・情報はすべて仮のものです。差し替えてご利用ください。</div>
</footer>

<!-- ============ JOB DETAIL MODAL ============ -->
<div class="modal-overlay" id="jobModal">
  <div class="modal-box">
    <button class="modal-close" id="modalClose" aria-label="閉じる">✕</button>
    <div class="modal-thumb" id="modalThumb"></div>
    <div class="modal-content">
      <span class="modal-cat" id="modalCat"></span>
      <h3 id="modalName"></h3>
      <p id="modalDetail"></p>
      <div class="modal-assign" id="modalAssign"></div>
    </div>
  </div>
</div>

<!-- ============ 付喪神 マスコット ============ -->
<div class="tsukumogami" id="gami">
  <div class="tsuku-bubble" id="tsukuBubble">この家にも、長く使われた道具たちの魂が住んでいるらしい……</div>
  <!-- ▼ ここを差し替え: src を指定の付喪神の画像に変更してください ▼ -->
  <img class="tsuku-img" id="tsukuImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cellipse cx='60' cy='70' rx='38' ry='36' fill='%23B5533C'/%3E%3Cpath d='M22 70a38 36 0 0 1 76 0z' fill='%23A98A4E' opacity='0.35'/%3E%3Ccircle cx='46' cy='66' r='6' fill='%23EDE6D6'/%3E%3Ccircle cx='74' cy='66' r='6' fill='%23EDE6D6'/%3E%3Ccircle cx='46' cy='67' r='3' fill='%232A2420'/%3E%3Ccircle cx='74' cy='67' r='3' fill='%232A2420'/%3E%3Cpath d='M48 84q12 10 24 0' stroke='%232A2420' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cpath d='M60 22 L60 42' stroke='%232A2420' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='60' cy='18' r='6' fill='%23E8C77E'/%3E%3C/svg%3E" alt="付喪神のキャラクター">
</div>

<script>
  // ============================================================
  // ▼▼ 画像・動画を入れる場所はここだけです ▼▼
  // 完成した素材を用意したら、下の '' の中にファイル名（例: 'house.jpg', 'bg.mp4'）か
  // URLを入れてください。空の '' のままなら、仮の表示のままになります。
  // ※ HTMLファイルと同じフォルダに素材を置き、ファイル名をそのまま書くのが簡単です。
  const SITE_MEDIA = {
    house: '',          // オープニングの家の画像（動画を使わない場合）
    tsukumogami: 'atyamo.webp',    // 付喪神の画像
    titleLogo: 'title.png',      // 「みんなの捨てる家」タイトルの装飾画像
    synopsisLabel: '',  // 「あらすじ」見出しの装飾画像
    heroImage: 'a.jpg',       // トップページ最上部に載せる画像
    bgVideo: 'haikei.mp4',         // サイト全体の背景動画（透明度は控えめに自動調整・固定）
    scrollImage: 'sirokuro.jpg',     // スクロールで一緒に動く背景画像（不透明度80%）
    introVideo: 'haikei.mp4'       // オープニングで自動再生する動画（扉が開く動画など）
  };
  // ▲▲ ここまで ▲▲
  // ============================================================

  function setupMedia(){
    if(SITE_MEDIA.house) document.getElementById('housePhoto').src = SITE_MEDIA.house;
    if(SITE_MEDIA.tsukumogami) document.getElementById('tsukuImg').src = SITE_MEDIA.tsukumogami;

    if(SITE_MEDIA.titleLogo){
      const el = document.getElementById('titleLogo');
      el.src = SITE_MEDIA.titleLogo;
      el.classList.add('is-active');
    }
    if(SITE_MEDIA.synopsisLabel){
      const el = document.getElementById('synopsisLabelImg');
      el.src = SITE_MEDIA.synopsisLabel;
      el.classList.add('is-active');
    }
    if(SITE_MEDIA.heroImage){
      const el = document.getElementById('heroImage');
      el.src = SITE_MEDIA.heroImage;
      el.classList.add('is-active');
    }
    if(SITE_MEDIA.bgVideo){
      const el = document.getElementById('bgVideo');
      el.src = SITE_MEDIA.bgVideo;
      el.classList.add('is-active');
      el.play().catch(()=>{});
    }
    if(SITE_MEDIA.scrollImage){
      const el = document.getElementById('bgScrollImage');
      el.src = SITE_MEDIA.scrollImage;
      el.classList.add('is-active');
    }
    if(SITE_MEDIA.introVideo){
      document.getElementById('intro').classList.add('use-video');
      document.getElementById('introVideoEl').src = SITE_MEDIA.introVideo;
    }
  }
  document.addEventListener('DOMContentLoaded', setupMedia);

  // ---------- INTRO SEQUENCE ----------
  const intro = document.getElementById('intro');
  const nav = document.getElementById('siteNav');
  const skipBtn = document.getElementById('skipBtn');
  const introVideoEl = document.getElementById('introVideoEl');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let played = false;

  function finishIntro(){
    if(!introVideoEl.paused) introVideoEl.pause();
    document.body.classList.remove('locked');
    intro.classList.add('hide');
    nav.classList.add('show');
    setTimeout(()=> intro.style.display='none', 600);
  }

  function playIntro(){
    if(played) return;
    played = true;
    if(reduceMotion){ finishIntro(); return; }
    intro.classList.add('open');
    setTimeout(()=> intro.classList.add('zooming'), 1300);
    setTimeout(finishIntro, 2900);
  }

  window.addEventListener('load', ()=>{
    if(reduceMotion){ finishIntro(); return; }

    if(SITE_MEDIA.introVideo){
      // 動画モード: 動画が再生し終わったら自動でサイト本体へ
      played = true;
      introVideoEl.play().catch(()=>{});
      introVideoEl.addEventListener('ended', finishIntro);
    } else {
      // 通常モード: 家の画像＋扉のアニメーション
      requestAnimationFrame(()=> intro.classList.add('ready'));
      setTimeout(playIntro, 1400); // auto-play opening
    }
  });

  intro.addEventListener('click', ()=>{
    if(SITE_MEDIA.introVideo){ finishIntro(); }
    else { playIntro(); }
  });
  skipBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    finishIntro();
  });

  // ---------- SCROLL REVEAL ----------
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el=> observer.observe(el));

  // ---------- SMOOTH NAV ----------
  document.querySelectorAll('.nav-links a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // ---------- JOBS: data, render, filter, modal ----------
  // カテゴリー: interior = 内装 / exterior = 外装 / other = その他
  // img: 写真を追加する場合はここに画像パスやURLを入れてください（空のままなら仮のアイコン背景になります）
  const JOBS = [
    { id:1, category:'other',    name:'脚本・演出',    desc:'物語と舞台の全体像をつくる。',                    detail:'物語の筋書きを書き、稽古全体の方向性を決める役割です。役者の演技づけや場面ごとの狙いを整理し、稽古の司令塔として動きます。',            img:'atyamo.webp' },
    { id:2, category:'other',    name:'舞台監督',      desc:'本番と稽古の進行を管理する。',                    detail:'稽古や本番当日のタイムスケジュールを管理し、大道具・照明・音響など全ての係の動きをまとめます。当日の進行の要です。', img:'atyamo.webp' },
    { id:3, category:'exterior', name:'大道具',        desc:'家のセットや建具など舞台の骨格をつくる。',        detail:'舞台上に建つ「家」そのものを組み立てます。壁や柱、扉などの大きな構造物を設計・製作し、安全に立つように仕上げます。',      img:'atyamo.webp' },
    { id:4, category:'interior', name:'小道具・美術',  desc:'写真や手紙など物語を語る小物を用意する。',        detail:'劇中に登場する写真、手紙、家具など、部屋の中を彩る細かな道具を用意します。時代の空気を伝える大事な役割です。',            img:'atyamo.webp' },
    { id:5, category:'interior', name:'衣装',          desc:'昭和の空気をまとう衣装を選び、整える。',          detail:'登場人物ごとの衣装を選定・製作します。年代や役柄に合わせて素材や色味を工夫し、舞台写真にも映えるよう整えます。',          img:'atyamo.webp' },
    { id:6, category:'interior', name:'照明',          desc:'夕暮れや家の中の灯りで場面の空気をつくる。',      detail:'場面転換や時間の経過を光で表現します。夕焼け、室内の温かい灯り、緊迫した場面の陰影など、光で物語を支えます。',            img:'atyamo.webp' },
    { id:7, category:'interior', name:'音響',          desc:'扉の音、時計の音、静けさそのものを支える。',      detail:'効果音やBGMを選定・再生します。扉が開く音や時計の音など、家の中の「気配」を音でつくり出す繊細な仕事です。',              img:'atyamo.webp' },
    { id:8, category:'other',    name:'制作・広報',    desc:'ポスターやこのサイトなど外への発信を担う。',      detail:'ポスターやチラシ、このWebサイトなど、公演を外部に知らせるための制作物をつくります。',                                    img:'atyamo.webp' },
    { id:9, category:'other',    name:'受付',          desc:'当日お客様を迎え入れる最初の窓口。',              detail:'公演当日、来場されたお客様の案内や整理を行います。劇の第一印象を決める大切な役割です。',                                  img:'atyamo.webp' },
    { id:10,category:'other',    name:'記録',          desc:'写真・映像で稽古から本番までを残す。',            detail:'稽古風景や本番の様子を写真・映像で記録します。ここに集めた写真は、この後の「ギャラリー」にも使われます。',                img:'atyamo.webp' },
  ];
  const CAT_LABEL = { interior:'内装', exterior:'外装', other:'その他' };

  const jobGrid = document.getElementById('jobGrid');
  function renderJobs(){
    jobGrid.innerHTML = JOBS.map((j,i)=>`
      <div class="job-card" data-category="${j.category}" data-id="${j.id}" tabindex="0" role="button" aria-label="${j.name}の詳細を見る">
        <div class="job-thumb">
          <span class="job-cat-tag">${CAT_LABEL[j.category]}</span>
          ${j.img ? `<img src="${j.img}" alt="${j.name}の写真">` : ''}
        </div>
        <div class="job-body">
          <div class="job-num">${String(i+1).padStart(2,'0')}</div>
          <div class="job-name">${j.name}</div>
          <p class="job-desc">${j.desc}</p>
          <div class="job-assign">担当：＿＿＿＿＿</div>
          <div class="job-more">詳しく見る →</div>
        </div>
      </div>
    `).join('');
    jobGrid.querySelectorAll('.job-card').forEach(card=>{
      card.addEventListener('click', ()=> openJobModal(Number(card.dataset.id)));
      card.addEventListener('keypress', (e)=>{ if(e.key==='Enter') openJobModal(Number(card.dataset.id)); });
    });
  }
  renderJobs();

  // filters
  document.querySelectorAll('.job-filter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.job-filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      jobGrid.querySelectorAll('.job-card').forEach(card=>{
        card.classList.toggle('is-hidden', f!=='all' && card.dataset.category!==f);
      });
    });
  });

  // modal
  const jobModal = document.getElementById('jobModal');
  const modalThumb = document.getElementById('modalThumb');
  const modalCat = document.getElementById('modalCat');
  const modalName = document.getElementById('modalName');
  const modalDetail = document.getElementById('modalDetail');
  const modalAssign = document.getElementById('modalAssign');

  function openJobModal(id){
    const j = JOBS.find(x=>x.id===id);
    if(!j) return;
    modalThumb.innerHTML = j.img ? `<img src="${j.img}" alt="${j.name}の写真">` : '';
    modalCat.textContent = CAT_LABEL[j.category];
    modalName.textContent = j.name;
    modalDetail.textContent = j.detail;
    modalAssign.textContent = '担当：＿＿＿＿＿';
    jobModal.classList.add('show');
  }
  function closeJobModal(){ jobModal.classList.remove('show'); }
  document.getElementById('modalClose').addEventListener('click', closeJobModal);
  jobModal.addEventListener('click', (e)=>{ if(e.target === jobModal) closeJobModal(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeJobModal(); });

  // ---------- 付喪神 マスコット ----------
  const tsuku = document.getElementById('tsukumogami');
  tsuku.addEventListener('click', ()=> tsuku.classList.toggle('talking'));

</script>
</body>
</html>
