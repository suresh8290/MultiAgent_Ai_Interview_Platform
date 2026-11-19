import { useRef } from "react";
import { FiDownload, FiX, FiExternalLink } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

const normalizeUrl = (value = "") => {
    if (typeof value !== "string" || !value.trim()) return "";
    const url = value.trim();
    if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
    return `https://${url}`;
};

const isExternalUrl = (url = "") => /^https?:\/\//i.test(url);

const hasValue = (value) => {
    if (typeof value === "string") return Boolean(value.trim());
    if (typeof value === "number") return true;
    if (Array.isArray(value)) return value.some(hasValue);
    if (value && typeof value === "object") return Object.values(value).some(hasValue);
    return Boolean(value);
};

function ResumeLink({ href, label, className = "" }) {
    if (typeof href !== "string" || !href.trim()) return null;
    const url = normalizeUrl(href);
    return (
        <a className={`resume-link ${className}`} href={url}
            target={isExternalUrl(url) ? "_blank" : undefined}
            rel={isExternalUrl(url) ? "noopener noreferrer" : undefined} title={href}>
            {label || href}
        </a>
    );
}

function Section({ title, children }) {
    if (children == null || children === false || children === "") return null;
    return <section className="resume-section"><h2 className="section-title">{title}</h2>{children}</section>;
}

function BulletList({ items, field = "description" }) {
    const clean = (value) => String(value ?? "").split("\n")
        .map((line) => line.replace(/^[\s•*-]+/, "").trim()).filter(Boolean);
    const list = Array.isArray(items)
        ? items.flatMap((item) => typeof item === "string" ? clean(item) : item && typeof item === "object"
            ? clean(item[field] || item.description || item.detail || item.title || item.text) : [])
        : typeof items === "string" ? clean(items) : [];
    return list.length ? <ul className="resume-bullets">{list.map((item, i) => <li key={i}>{item}</li>)}</ul> : null;
}

const joinDate = (...values) => values.filter(Boolean).join(" – ");

export default function ResumePreview({ data = {}, onClose,
  useCoins,
  setUser, }) {
    const resumeRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: resumeRef,
        documentTitle: "MultiAiPDF",
        pageStyle: `
      @page { size: A4; margin: 10mm 8mm 8mm; }
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .resume-toolbar { display: none !important; }
        .resume-preview-overlay { position: static !important; padding: 0 !important; overflow: visible !important; background: #fff !important; }
        .resume-preview-container { max-width: none !important; margin: 0 !important; }
        .resume-paper { width: 100% !important; max-width: none !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; font-size: 9px !important; }
        .resume-section, .education-table tr, .project-header, .experience-header, .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .section-title { background: #c9c9c9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        a { color: #234b96 !important; text-decoration: underline !important; }
      }
    `,
    });

const handleDownload = async () => {
  try {
    const coinResponse = await useCoins({
      coins: 20,
      action: "resume-scorer",
    });

    if (!coinResponse) {
      throw new Error("Unable to deduct coins. Please try again.");
    }

    // Update the logged-in user's coin balance here,
    // using your actual authentication/user state updater.

    handlePrint();
  } catch (error) {
    if (error.response?.status === 403) {
      alert("Not enough Interview Coins.");
      return;
    }

    alert(
      error.response?.data?.message ||
        error.message ||
        "Something went wrong."
    );
  }
};


    const rawSkills = Array.isArray(data.skills) ? data.skills : typeof data.skills === "string" ? data.skills.split("\n") : [];
    const skillGroups = rawSkills.map((line) => typeof line === "string" ? line.trim() : "")
        .filter(Boolean).map((line) => {
            const colon = line.indexOf(":");
            return colon < 0 ? { category: "", skills: line } : { category: line.slice(0, colon).trim(), skills: line.slice(colon + 1).trim() };
        }).filter((group) => group.skills);

    const achievements = data.achievement || data.achievements || data.awards || [];
    const codingProfiles = data.codingProfile || data.codingProfiles || data.profiles || [];
    const responsibilities = data.responsibility || data.responsibilities || data.positionsOfResponsibility || [];
    const projects = (Array.isArray(data.projects) ? data.projects : []).filter((project) => {
        if (!project || typeof project !== "object") return false;
        return [
            project.name, project.technologies, project.date, project.year, project.startDate, project.endDate,
            project.liveDemo, project.liveLink, project.demoLink, project.githubLink, project.link, project.github,
            project.description, project.highlights,
        ].some(hasValue);
    });
    const education = (Array.isArray(data.education) ? data.education : []).filter(hasValue);
    const experience = (Array.isArray(data.experience) ? data.experience : []).filter(hasValue);
    const validAchievements = (Array.isArray(achievements) ? achievements : []).filter(hasValue);
    const validCodingProfiles = (Array.isArray(codingProfiles) ? codingProfiles : []).filter(hasValue);
    const validResponsibilities = (Array.isArray(responsibilities) ? responsibilities : []).filter(hasValue);
    const hasPersonalProfiles = Boolean(data.linkedin || data.github || data.leetcode || data.portfolio || data.website);

    return (
        <div className="resume-preview-overlay">
            <style>{`
        .resume-preview-overlay { position: fixed; inset: 0; z-index: 50; overflow-y: auto; padding: 24px; background: rgba(0,0,0,.55); color: #171717; font-family: Arial, Helvetica, sans-serif; }
        .resume-preview-container { width: 100%; max-width: 900px; margin: 0 auto; }
        .resume-toolbar { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 16px; }
        .resume-toolbar-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #ddd; border-radius: 6px; padding: 10px 16px; background: #fff; color: #171717; font-size: 14px; font-weight: 600; cursor: pointer; }
        .resume-toolbar-button.primary { border-color: #000; background: #000; color: #fff; }
        .resume-toolbar-button:hover { opacity: .85; }
        .resume-paper { box-sizing: border-box; width: 100%; max-width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm; background: #fff; color: #171717; font-size: 10px; line-height: 1.35; box-shadow: 0 2px 12px rgba(0,0,0,.12); overflow-wrap: anywhere; }
        .resume-header { margin-bottom: 8px; text-align: center; }
        .resume-name { margin: 0 0 7px; font-size: 23px; line-height: 1.15; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; }
        .resume-contact-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 12px; text-align: left; font-size: 9px; }
        .resume-contact-left, .resume-contact-right { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .resume-contact-right { text-align: right; align-items: flex-end; }
        .resume-contact-line { margin: 0; }
        .resume-link { color: #234b96; text-decoration: underline; cursor: pointer; overflow-wrap: anywhere; word-break: break-word; }
        .coding-profile-link { font-weight: 600; }
        .resume-section { margin-top: 9px; }
        .section-title { margin: 0 0 5px; padding: 4px 6px; background: #c9c9c9; color: #111; font-size: 10px; font-weight: 700; line-height: 1.2; text-transform: uppercase; letter-spacing: .2px; }
        .resume-entry { margin-bottom: 8px; }
        .education-table { width: 100%; border-collapse: collapse; table-layout: auto; font-size: 9px; }
        .education-table th, .education-table td { border: 1px solid #888; padding: 3px 5px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
        .education-table th { background: #f1f1f1; font-weight: 700; }
        .project-header, .experience-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; width: 100%; margin-bottom: 3px; }
        .project-info, .experience-info { flex: 1; min-width: 0; }
        .project-name, .experience-role { font-size: 10px; font-weight: 700; }
        .project-technologies, .experience-company { display: block; margin-top: 2px; font-size: 9px; font-style: italic; }
        .project-meta, .experience-meta { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 3px; max-width: 45%; text-align: right; font-size: 9px; }
        .project-links { display: flex; justify-content: flex-end; align-items: center; gap: 3px; flex-wrap: wrap; }
        .project-action-link { display: inline-flex; align-items: center; justify-content: center; gap: 3px; white-space: nowrap; font-size: 9px; font-weight: 500; text-decoration: none; }
        .project-action-link svg { flex-shrink: 0; }
        .project-action-link:hover { color: #1d4ed8; text-decoration: underline; }
        .resume-bullets, .profile-list { margin: 3px 0 0; padding-left: 17px; list-style-type: disc; }
        .resume-bullets li, .profile-list li { margin-bottom: 2px; padding-left: 1px; }
        .skills-groups { display: flex; flex-direction: column; gap: 3px; line-height: 1.4; }
        .skills-group { overflow-wrap: anywhere; }
        .resume-empty { color: #777; font-style: italic; }
        .resume-entry-title { font-size: 10px; font-weight: 700; }
        .resume-entry-subtitle { margin-top: 2px; font-size: 9px; font-style: italic; }
        
.certifications-section {
  width: 100%;
  margin-bottom: 14px;
}

.certifications-section h2 {
  margin-bottom: 8px;
}

.certifications-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.certification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.certification-name {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.certificate-link {
  flex-shrink: 0;
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.certificate-link:hover {
  text-decoration: underline;
}

        @media (max-width: 600px) {
          .resume-preview-overlay { padding: 12px; }
          .resume-paper { padding: 16px; font-size: 10px; }
          .resume-name { font-size: 20px; }
          .resume-contact-grid { gap: 8px; }
          .project-header, .experience-header { gap: 8px; }
          .project-meta, .experience-meta { max-width: 48%; }
        }
      `}</style>

            <div className="resume-preview-container">
                <div className="resume-toolbar">
                    {onClose && <button type="button" className="resume-toolbar-button" onClick={onClose}><FiX /> Close Preview</button>}
                    <button type="button" className="resume-toolbar-button primary" onClick={handleDownload}><FiDownload /> Download PDF</button>
                </div>

                <div className="resume-paper" ref={resumeRef}>
                    <header className="resume-header">
                        <h1 className="resume-name">{data.name || "Your Name"}</h1>
                        <div className="resume-contact-grid">
                            <div className="resume-contact-left">
                                {data.roll && <p className="resume-contact-line">University Roll: {data.roll}</p>}
                                {data.location && <p className="resume-contact-line">Location: {data.location}</p>}
                                {data.email && <p className="resume-contact-line">Email: <ResumeLink href={data.email} /></p>}
                            </div>
                            <div className="resume-contact-right">
                                {data.phone && <p className="resume-contact-line">Mobile: <a className="resume-link" href={`tel:${String(data.phone).replace(/[^\d+]/g, "")}`}>{data.phone}</a></p>}
                                {data.github && <p className="resume-contact-line">GitHub: <ResumeLink href={data.github} /></p>}
                                {data.linkedin && <p className="resume-contact-line">LinkedIn: <ResumeLink href={data.linkedin} /></p>}
                                {data.leetcode && <p className="resume-contact-line">LeetCode: <ResumeLink href={data.leetcode} /></p>}
                                {data.portfolio && <p className="resume-contact-line">Portfolio: <ResumeLink href={data.portfolio} /></p>}
                                {data.website && <p className="resume-contact-line">Website: <ResumeLink href={data.website} /></p>}
                                {!hasPersonalProfiles && <span className="resume-empty">Add your profile URLs in the form</span>}
                            </div>
                        </div>
                    </header>

                    {hasValue(data.summary) && <Section title="Professional Summary"><p style={{ margin: "0 0 4px" }}>{data.summary}</p></Section>}

                    {education.length > 0 && <Section title="Education">
                        <table className="education-table">
                            <thead><tr><th>Year</th><th>Degree / Branch</th><th>Institute</th><th>CGPA / %</th></tr></thead>
                            <tbody>{education.map((edu, i) => <tr key={i}>
                                <td>{edu.year || joinDate(edu.startYear, edu.endYear) || "—"}</td>
                                <td>{[edu.degree, edu.branch].filter(Boolean).join(" — ") || "—"}</td>
                                <td>{edu.college || edu.institute || "—"}</td>
                                <td>{edu.cgpa || edu.percentage || "—"}</td>
                            </tr>)}</tbody>
                        </table>
                    </Section>}

                    {projects.length > 0 && <Section title="Projects">
                        {projects.map((project, i) => {
                            const date = project.date || project.year || joinDate(project.startDate, project.endDate);
                            const liveDemo = project.liveDemo || project.liveLink || project.demoLink || "";
                            const github = project.githubLink || project.link || project.github || "";
                            return <article className="resume-entry" key={i}>
                                <div className="project-header">
                                    <div className="project-info">
                                        {project.name && <div className="project-name">{project.name}</div>}
                                        {project.technologies && <span className="project-technologies">{project.technologies}</span>}
                                    </div>
                                    <div className="project-meta">
                                        {date && <span>{date}</span>}
                                        <div className="project-links">
                                            {liveDemo && <a className="resume-link project-action-link" href={normalizeUrl(liveDemo)} target="_blank" rel="noopener noreferrer" title="Open live demo"><FiExternalLink size={12} aria-hidden="true" /><span>Live Demo</span></a>}
                                            {github && <a className="resume-link project-action-link" href={normalizeUrl(github)} target="_blank" rel="noopener noreferrer" title="Open GitHub repository"><FaGithub size={13} aria-hidden="true" /><span>GitHub</span></a>}
                                        </div>
                                    </div>
                                </div>
                                <BulletList items={project.description || project.highlights || []} />
                            </article>;
                        })}
                    </Section>}

                    {experience.length > 0 && <Section title="Work Experience">
                        {experience.map((item, i) => <article className="resume-entry" key={i}>
                            <div className="experience-header">
                                <div className="experience-info">
                                    <div className="experience-role">{item.role || item.position || "Role"}</div>
                                    {item.company && <span className="experience-company">{item.company}{item.location ? ` (${item.location})` : ""}</span>}
                                </div>
                                {(item.duration || item.startDate || item.endDate) && <div className="experience-meta"><span>{item.duration || joinDate(item.startDate, item.endDate)}</span></div>}
                            </div>
                            <BulletList items={item.description || []} />
                        </article>)}
                    </Section>}

                    {skillGroups.length > 0 && <Section title="Technical Skills">
                        <div className="skills-groups">{skillGroups.map((group, i) => <div className="skills-group" key={i}>
                            {group.category && <strong>{group.category}: </strong>}<span>{group.skills}</span>
                        </div>)}</div>
                    </Section>}

                    {validAchievements.length > 0 && <Section title="Achievements"><BulletList items={validAchievements} field="title" /></Section>}


                  

{/* CERTIFICATIONS */}
{Array.isArray(data.certifications) &&
  data.certifications.some(
    (cert) =>
      cert &&
      (cert.name ||
        cert.issuer ||
        cert.issueDate ||
        cert.credentialUrl)
  ) && (
    <Section title="Certifications">
      <ul className="profile-list">
        {data.certifications
          .filter(
            (cert) =>
              cert &&
              (cert.name ||
                cert.issuer ||
                cert.issueDate ||
                cert.credentialUrl)
          )
          .map((cert, index) => (
            <li key={index}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>
                    {cert.name || "Certification"}
                  </strong>

                  {cert.issuer && ` — ${cert.issuer}`}
                  {cert.issueDate && ` | ${cert.issueDate}`}
                </div>

                {cert.credentialUrl && (
                  <ResumeLink
                    href={cert.credentialUrl}
                    label="View"
                  />
                )}
              </div>
            </li>
          ))}
      </ul>
    </Section>
  )}





                    {validCodingProfiles.length > 0 && <Section title="Coding Profiles">
                        <ul className="profile-list">{validCodingProfiles.map((profile, i) => {
                            const url = typeof profile === "string" ? profile : profile.url || profile.link || "";
                            const platform = typeof profile === "string" ? "" : profile.platform || profile.name || "";
                            const source = `${platform} ${url}`;
                            let label = platform || "Profile";
                            if (/leetcode/i.test(source)) label = "LeetCode";
                            else if (/geeksforgeeks|\bgfg\b/i.test(source)) label = "GFG";
                            else if (/github/i.test(source)) label = "GitHub";
                            const score = typeof profile === "object" && profile ? profile.score || profile.solved || "" : "";
                            return <li key={i}>
                                {url ? <a className="resume-link coding-profile-link" href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer">{label}</a> : <span>{label}</span>}
                                {score ? ` — ${score}` : ""}
                            </li>;
                        })}</ul>
                    </Section>}

                    {validResponsibilities.length > 0 && <Section title="Position of Responsibility">
                        {validResponsibilities.map((item, i) => typeof item === "string" ? <BulletList key={i} items={[item]} /> : <article className="resume-entry" key={i}>
                            <div className="resume-entry-title">{item.role || item.title || "Position"}</div>
                            {(item.organization || item.duration) && <div className="resume-entry-subtitle">{[item.organization, item.duration].filter(Boolean).join(" | ")}</div>}
                            <BulletList items={item.description || []} />
                        </article>)}
                    </Section>}
                </div>
            </div>
        </div>    
    );
}
