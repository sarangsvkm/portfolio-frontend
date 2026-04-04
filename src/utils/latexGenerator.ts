import type { ResumeViewModel } from '../types';

function escapeLatex(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/\\/g, '\\textbackslash{}');
}

export function generateLatex(resume: ResumeViewModel, withImage: boolean, resumeProfileImageUrl?: string): string {
    const { profile, experiences, educations, skills, projects } = resume;

    // Use dedicated resume photo if provided, otherwise fall back to profile image
    const imageUrlToUse = resumeProfileImageUrl || profile.imageUrl;

    const preamble = `\\documentclass[a4paper,10pt]{article}

\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=0.8in}
\\usepackage{hyperref}
\\usepackage{enumitem}
${withImage ? '\\usepackage{graphicx}\n\\usepackage{wrapfig}' : ''}

\\pagestyle{empty}

\\begin{document}
`;

    // HEADER
    let header = `\n%====================\n% HEADER\n%====================\n\n`;

    if (withImage && imageUrlToUse) {
        header += `
\\begin{wrapfigure}{r}{0.15\\textwidth}
  \\vspace{-15pt}
  \\begin{center}
    \\includegraphics[width=0.15\\textwidth]{profile.jpg}
  \\end{center}
  \\vspace{-15pt}
\\end{wrapfigure}
`;
    }

    header += `\\begin{center}\n\n`;
    header += `{\\Large \\textbf{${escapeLatex(profile.name)}}}\n\n`;
    if (profile.location) header += `${escapeLatex(profile.location)} \\\\\n`;
    if (profile.phone) header += `${escapeLatex(profile.phone)} \\\\\n`;
    if (profile.email) header += `\\href{mailto:${escapeLatex(profile.email)}}{${escapeLatex(profile.email)}}\n\n`;

    if (profile.socialMediaLinks && profile.socialMediaLinks.length > 0) {
        const links = profile.socialMediaLinks.map(s => `\\href{${escapeLatex(s.url)}}{${escapeLatex(s.url.replace('https://', '').replace('http://', ''))}}`);
        header += links.join(' |\n') + '\n\n';
    }

    header += `\\end{center}\n`;

    // SUMMARY
    let summary = '';
    if (profile.about) {
        summary += `\n%====================\n% SUMMARY\n%====================\n\n\\section*{Summary}\n\n`;
        summary += `${escapeLatex(profile.about)}\n`;
    }

    // SKILLS
    let skillsSection = '';
    if (skills.length > 0) {
        skillsSection += `\n%====================\n% SKILLS\n%====================\n\n\\section*{Technical Skills}\n\n`;
        skillsSection += `\\begin{tabular}{ l p{12cm} }\n\n`;

        // Group skills by category
        const categorizedSkills: Record<string, string[]> = {};
        const uncategorized: string[] = [];

        skills.forEach(skill => {
            if (skill.category) {
                if (!categorizedSkills[skill.category]) {
                    categorizedSkills[skill.category] = [];
                }
                categorizedSkills[skill.category].push(skill.name);
            } else {
                uncategorized.push(skill.name);
            }
        });

        for (const [category, skillNames] of Object.entries(categorizedSkills)) {
            skillsSection += `\\textbf{${escapeLatex(category)}:} & ${escapeLatex(skillNames.join(', '))} \\\\\n\n`;
        }
        
        if (uncategorized.length > 0) {
            skillsSection += `\\textbf{Other:} & ${escapeLatex(uncategorized.join(', '))} \\\\\n\n`;
        }

        skillsSection += `\\end{tabular}\n`;
    }

    // EXPERIENCE
    let experienceSection = '';
    if (experiences.length > 0) {
        experienceSection += `\n%====================\n% EXPERIENCE\n%====================\n\n\\section*{Experience}\n\n`;

        experiences.forEach(exp => {
            experienceSection += `\\textbf{${escapeLatex(exp.role)}} \\\\\n`;
            experienceSection += `${escapeLatex(exp.company)} \\\\\n`;
            experienceSection += `${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}\n\n`;

            if (exp.description) {
                experienceSection += `\\begin{itemize}[leftmargin=*]\n\n`;
                // Split description by newlines or bullets if stored that way
                const points = exp.description.split(/(?:\\n|\\r|•)/).filter(p => p.trim());
                if (points.length > 1) {
                    points.forEach(point => {
                       experienceSection += `\\item ${escapeLatex(point.trim())}\n\n`;
                    });
                } else {
                    experienceSection += `\\item ${escapeLatex(exp.description.trim())}\n\n`;
                }
                experienceSection += `\\end{itemize}\n\n`;
            }
        });
    }

    // PROJECTS
    let projectSection = '';
    if (projects.length > 0) {
        projectSection += `\n%====================\n% PROJECTS\n%====================\n\n\\section*{Projects}\n\n`;

        projects.forEach(proj => {
            projectSection += `\\textbf{${escapeLatex(proj.title)}}\n\n`;
            if (proj.description) {
                projectSection += `\\begin{itemize}[leftmargin=*]\n\n`;
                const points = proj.description.split(/(?:\\n|\\r|•)/).filter(p => p.trim());
                if (points.length > 1) {
                    points.forEach(point => {
                        projectSection += `\\item ${escapeLatex(point.trim())}\n\n`;
                    });
                } else {
                    projectSection += `\\item ${escapeLatex(proj.description.trim())}\n\n`;
                }
                projectSection += `\\end{itemize}\n\n`;
            }
        });
    }

    // EDUCATION
    let educationSection = '';
    if (educations.length > 0) {
        educationSection += `\n%====================\n% EDUCATION\n%====================\n\n\\section*{Education}\n\n`;

        educations.forEach(edu => {
            educationSection += `\\textbf{${escapeLatex(edu.degree)} — ${escapeLatex(edu.fieldOfStudy)}}\n\n`;
            educationSection += `${escapeLatex(edu.institution)}\n\n`;
            if (edu.startDate || edu.endDate) {
                 educationSection += `${escapeLatex(edu.startDate)} -- ${escapeLatex(edu.endDate)}\n\n`;
            }
        });
    }

    const documentEnd = `\\end{document}\n`;

    return preamble + header + summary + skillsSection + experienceSection + projectSection + educationSection + documentEnd;
}

export function downloadLatex(resume: ResumeViewModel, withImage: boolean, resumeProfileImageUrl?: string) {
    const texStr = generateLatex(resume, withImage, resumeProfileImageUrl);
    const blob = new Blob([texStr], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `resume${withImage ? '_photo' : ''}.tex`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
