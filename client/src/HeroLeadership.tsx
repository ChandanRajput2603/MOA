import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api } from "./api";

type Member = { _id: string; title: string; designation?: string; imageUrl?: string };
const featured = [
  { id: "6aa458466fd73ffbc1417486", name: "murlidharmohol" },
  { id: "986ff74815916faa088c4f56", name: "sanjayshete" },
];
const normalize = (name: string) => name.toLowerCase().replace(/^(?:(?:shri|mr|mrs|ms|dr|adv)\.?\s+)+/g, "").replace(/[^a-z]/g, "");
function Portrait({ member }: { member: Member }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [member.imageUrl]);
  return <Link className="ch-leader" to={"/committee/" + member._id} aria-label={"View profile of " + member.title}>
    <span className="ch-leader-photo">
      {member.imageUrl && !failed
        ? <img src={member.imageUrl} alt="" onError={() => setFailed(true)} />
        : <span className="ch-leader-monogram" aria-hidden="true">MOA</span>}
    </span>
    <span className="ch-leader-caption"><span className="ch-leader-role">{member.designation || "Executive Council"}</span><strong>{member.title}</strong><span className="ch-leader-link">View profile <ArrowUpRight size={14}/></span></span>
  </Link>;
}
export default function HeroLeadership() {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    let active = true;
    api.get("/public/committee").then(({ data }) => {
      if (!active || !Array.isArray(data)) return;
      const rows = data as Member[];
      setMembers(featured.flatMap(person => {
        const member = rows.find(row => row._id === person.id) ||
          rows.find(row => normalize(row.title || "") === person.name);
        return member ? [member] : [];
      }));
    }).catch(() => { /* Keep the hero available if this optional feed is offline. */ });
    return () => { active = false; };
  }, []);
  if (!members.length) return null;
  return <aside className="ch-leadership" aria-label="Association leadership">
    <p className="ch-leadership-label">OUR LEADERSHIP</p>
    <div className="ch-leadership-pair">{members.map(member => <Portrait key={member._id} member={member}/>)}</div>
  </aside>;
}
