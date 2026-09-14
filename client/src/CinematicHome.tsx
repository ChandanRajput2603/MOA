import TypingText from "./TypingText";
import { sortSports } from "../../shared/sports";
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from './api';
import './cinematic-home.css';
type Row = Record<string, any>;
const sportKey = (value: string = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '').replace('kabbadi', 'kabaddi').replace('triathalon', 'triathlon').replace('sepakte kraw'.replace(/ /g, ''), 'sepaktakraw');
const regions = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Kolhapur', 'Chhatrapati Sambhajinagar'];
function FeedState({ pending, failed, empty }: { pending: boolean; failed: boolean; empty: boolean }) {
  return pending ? <p role="status">Loading published updates…</p> : failed ? <p role="status">Updates are temporarily unavailable. Please refresh to try again.</p> : empty ? <p>Updates will appear here when published by the association.</p> : null;
}
function NumberReveal({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(value);
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced') { setCount(value); return; }
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect(); const start = performance.now();
      const tick = (now: number) => { const p = Math.min((now-start)/900,1); setCount(Math.round(value*(1-Math.pow(1-p,3)))); if(p<1) frame=requestAnimationFrame(tick); };
      frame=requestAnimationFrame(tick);
    }); observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={ref} aria-label={String(value)}><span aria-hidden="true">{String(count).padStart(2,'0')}</span></span>;
}
export default function CinematicHome() {
  const root = useRef<HTMLElement>(null);
  const [feeds, setFeeds] = useState<Record<string, Row[]>>({events:[], news:[], athletes:[], results:[], sports:[]});
  const [pending, setPending] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedSport, setSport] = useState('');
  const sportRecords = sortSports(feeds.sports as (Row & {title: string; order?: number})[]);
  const sports = sportRecords.map(s => s.title);
  const sport = sports.includes(selectedSport) ? selectedSport : sports[0] || '';
  const selectedSportRecord = sportRecords.find(s => s.title === sport);
  const [sportQuery, setSportQuery] = useState('');
  const visibleSports = sports.filter(s => sportKey(s).includes(sportKey(sportQuery)));
  const [champion, setChampion] = useState(0);
  const [region, setRegion] = useState('Pune');
  useEffect(() => {
    let active=true;
    const names=['events','news','athletes','results','sports'];
    Promise.allSettled(names.map(name=>api.get('/public/'+name))).then(values=> {
      if(!active)return; const next: Record<string,Row[]>={}; const failed:string[]=[];
      values.forEach((v,i)=>{next[names[i]]=v.status==='fulfilled'?v.value.data:[];if(v.status==='rejected')failed.push(names[i]);});
      setFeeds(next);setErrors(failed);setPending(false);
    }); return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    const el=root.current;if(!el)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let observer:IntersectionObserver|undefined;let frame=0;
    const reduced=()=>media.matches||document.documentElement.dataset.motion==='reduced';
    if(!reduced()&&'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ch-seen');observer?.unobserve(entry.target);}}),{threshold:.07});
      el.querySelectorAll('.ch-chapter').forEach(n=>{n.classList.add('ch-reveal');observer!.observe(n);});
    }
    const move=(event:PointerEvent)=>{
      if(reduced()||event.pointerType!=='mouse'||innerWidth<900)return;
      cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{el.style.setProperty('--ch-x',`${(event.clientX/innerWidth-.5)*12}px`);el.style.setProperty('--ch-y',`${(event.clientY/innerHeight-.5)*8}px`);});
    };
    const reset=()=>{el.style.setProperty('--ch-x','0px');el.style.setProperty('--ch-y','0px');};
    el.addEventListener('pointermove',move);el.addEventListener('pointerleave',reset);
    return ()=>{observer?.disconnect();cancelAnimationFrame(frame);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset);};
  },[]);
  const state=(name:string, rows=feeds[name])=><FeedState pending={pending} failed={errors.includes(name)} empty={!rows.length}/>;
  const events=[...feeds.events].filter(e=>!['Completed','Cancelled'].includes(e.eventStatus)&&(!e.endDate||e.endDate>=new Date().toISOString().slice(0,10))).sort((a,b)=>(a.startDate||'9999').localeCompare(b.startDate||'9999'));
  const athletes=feeds.athletes;
  const athlete=athletes[champion%Math.max(athletes.length,1)];
  const sportAthlete=athletes.find(a=>sportKey(a.sport)===sportKey(sport)&&a.imageUrl);
  const sportEvents=feeds.events.filter(e=>sportKey(e.sport)===sportKey(sport));
  const localEvents=feeds.events.filter(e=>[e.city,e.district].some(v=>v?.toLowerCase()===region.toLowerCase()));
  return <main ref={root} className="cinematic-home">
    <section className="ch-hero" aria-labelledby="ch-title">
      <div className="ch-stadium" aria-hidden="true"><div className="ch-orbit"/><div className="ch-orbit ch-orbit-two"/><div className="ch-beam"/>{Array.from({length:18},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*23)%100}%`,animationDelay:`-${i*.8}s`}}/>)}</div>
      <div className="ch-hero-copy"><p className="ch-kicker">ONE STATE. LIMITLESS POTENTIAL.</p><h1 id="ch-title">WHERE<br/>MAHARASHTRA<br/><TypingText text="MEETS EXCELLENCE." delay={1900} /></h1><p className="ch-intro-copy">The ambition of a state.<br/>The spirit of every athlete.</p><Link className="ch-action" to="/events">Enter the action <ArrowUpRight/></Link></div>
      <div className="ch-hero-bottom"><a href="#ch-sports">SCROLL TO EXPLORE <ArrowDown size={16}/></a><span>01 / THE STARTING LINE</span></div>
    </section>
    <section className="ch-chapter ch-sports" id="ch-sports"><div className="ch-heading"><p className="ch-kicker">02 / FIND YOUR DISCIPLINE</p><h2>SPORTS<br/><TypingText text="IN MOTION." /></h2></div>{state('sports')}<div className="ch-sport-stage"><div className="ch-sport-browser"><label htmlFor="ch-sport-search">Find your sport</label><input id="ch-sport-search" type="search" placeholder="Search all sports…" value={sportQuery} onChange={e=>setSportQuery(e.target.value)}/><p className="ch-sport-count" role="status">{visibleSports.length} of {sports.length} sports</p><div className="ch-sport-menu" aria-label="Select a sport">{visibleSports.map(s=><button key={s} aria-pressed={s===sport} onClick={()=>setSport(s)}><small>{String(sports.indexOf(s)+1).padStart(2,'0')}</small><span>{s}</span><ArrowUpRight size={20}/></button>)}</div>{sports.length>0&&!visibleSports.length&&<p>No matching sports. Try another name.</p>}</div>{sport&&<div className="ch-sport-visual" key={sport}>{selectedSportRecord?.imageUrl?<img src={selectedSportRecord.imageUrl} alt={sport} loading="lazy"/>:sportAthlete?<img src={sportAthlete.imageUrl} alt={sportAthlete.title} loading="lazy"/>:<div className="ch-track-art" aria-hidden="true"><i/><i/><i/><i/><i/></div>}<div className="ch-sport-caption"><span>FOCUS / {sport.toUpperCase()}</span><h3>{sport}</h3><p>{pending?'Loading events…':errors.includes('events')?'Event updates currently unavailable.':`${sportEvents.length} published events`}</p><Link to="/events">Explore the event calendar <ArrowUpRight size={18}/></Link></div></div>}</div></section>
    <section className="ch-chapter ch-events"><div className="ch-section-top"><div><p className="ch-kicker">03 / ON THE CALENDAR</p><h2>THE NEXT<br/><TypingText text="BIG MOMENT." /></h2></div><Link to="/events">All events <ArrowUpRight/></Link></div>{state('events',events)}<div className="ch-event-list">{events.slice(0,3).map((e,i)=><Link className="ch-event" to={'/events/'+e._id} key={e._id}><span className="ch-event-index">0{i+1}</span><div><span className="ch-kicker">{e.eventStatus} / {e.sport||'SPORT'}</span><h3>{e.title}</h3><p>{[e.venue,e.city].filter(Boolean).join(' · ')||'Venue to be announced'}</p></div><div className="ch-event-date">{e.startDate||'Date to be announced'}<ArrowUpRight/></div></Link>)}</div></section>
    <section className="ch-chapter ch-champions"><p className="ch-kicker">04 / THE PEOPLE BEHIND THE PERFORMANCE</p><h2>THE <TypingText text="CHAMPIONS." /></h2>{state('athletes')}{athlete?<div className="ch-athlete" key={athlete._id}><div className="ch-athlete-photo">{athlete.imageUrl?<img src={athlete.imageUrl} alt={athlete.title} loading="lazy"/>:<div className="ch-monogram" aria-hidden="true">MOA</div>}</div><div className="ch-athlete-story"><p className="ch-kicker">{athlete.sport} · {athlete.district||'MAHARASHTRA'}</p><h3>{athlete.title}</h3><p>{athlete.achievements||athlete.description||'Discover this athlete’s journey.'}</p><Link className="ch-action" to={'/athletes/'+athlete._id}>Discover the athlete <ArrowUpRight/></Link></div></div>:<div className="ch-champion-empty"><span>EVERY JOURNEY<br/>STARTS WITH <TypingText text="BELIEF." /></span><Link to="/athletes">Explore our athletes <ArrowUpRight/></Link></div>}{athletes.length>1&&<div className="ch-controls"><button aria-label="Previous athlete" onClick={()=>setChampion((champion+athletes.length-1)%athletes.length)}><ChevronLeft/></button><span>{champion%athletes.length+1} / {athletes.length}</span><button aria-label="Next athlete" onClick={()=>setChampion((champion+1)%athletes.length)}><ChevronRight/></button></div>}</section>
    <section className="ch-chapter ch-medals"><div><p className="ch-kicker">05 / EVERY FINISH TELLS A STORY</p><h2>PRIDE.<br/>IN EVERY<br/><TypingText text="PERFORMANCE." /></h2><Link to="/medals">Explore the medal tally <ArrowUpRight/></Link></div><div className="ch-medal-board">{['Gold','Silver','Bronze'].map((m,i)=><div className={'ch-medal-row ch-metal-'+i} key={m}><div className="ch-medal" aria-hidden="true"><span>{i+1}</span></div><span>{m.toUpperCase()}</span><strong>{pending||errors.includes('results')?'—':<NumberReveal value={feeds.results.filter(r=>r.medal===m).length}/>}</strong></div>)}<p>Medals from published results</p></div></section>
    <section className="ch-chapter ch-regions"><p className="ch-kicker">06 / CONNECTED BY SPORT</p><h2>ACROSS<br/><TypingText text="MAHARASHTRA." /></h2><p>Explore the sporting calendar by city and district.</p><div className="ch-region-controls" aria-label="Choose a region">{regions.map(r=><button key={r} aria-pressed={r===region} onClick={()=>setRegion(r)}>{r}</button>)}</div><div className="ch-region-result" aria-live="polite"><h3>{region}</h3>{state('events',localEvents)}{localEvents.slice(0,3).map(e=><Link key={e._id} to={'/events/'+e._id}>{e.title}<ArrowUpRight size={18}/></Link>)}</div></section>
    <section className="ch-chapter ch-results"><div className="ch-section-top"><div><p className="ch-kicker">07 / THE FINISH LINE</p><h2>RESULTS THAT<br/><TypingText text="SPEAK VOLUMES." /></h2></div><Link to="/results">All results <ArrowUpRight/></Link></div>{state('results')}{[...feeds.results].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,4).map(r=><Link className="ch-result-row" to={'/results/'+r._id} key={r._id}><strong>{String(r.position).padStart(2,'0')}</strong><div><h3>{r.athlete}</h3><p>{r.tournament} · {r.sport}</p></div><span>{r.medal==='None'?'RESULT':r.medal.toUpperCase()}</span><ArrowUpRight/></Link>)}</section>
    <section className="ch-chapter ch-news"><div className="ch-section-top"><div><p className="ch-kicker">08 / FROM THE ASSOCIATION</p><h2>BEYOND<br/><TypingText text="THE ARENA." /></h2></div><Link to="/news">All news <ArrowUpRight/></Link></div>{state('news')}<div className="ch-news-grid">{[...feeds.news].sort((a,b)=>(b.publishDate||'').localeCompare(a.publishDate||'')).slice(0,3).map(n=><Link to={'/news/'+n._id} key={n._id}>{n.imageUrl&&<img src={n.imageUrl} alt="" loading="lazy"/>}<p className="ch-kicker">{n.category||'NEWS'} · {n.publishDate}</p><h3>{n.title}</h3><ArrowUpRight/></Link>)}</div><Link className="ch-document-link" to="/circulars">Official bulletins & circulars <ArrowUpRight/></Link></section>
    <section className="ch-chapter ch-closing"><p className="ch-kicker">ONE MOVEMENT. ONE MAHARASHTRA.</p><h2>THE FUTURE<br/>OF SPORT.<br/><TypingText text="TOGETHER." /></h2><Link className="ch-action" to="/about/vision">Our vision <ArrowUpRight/></Link></section>
  </main>;
}
