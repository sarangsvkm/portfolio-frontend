import jsPDF from 'jspdf';
import { resolveAssetUrl } from './assetUrl';
import type { ResumeViewModel } from '../types';

export async function downloadAtsPdf(resume: ResumeViewModel, withImage: boolean, resumeProfileImageUrl?: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const { profile, experiences, educations, skills, projects } = resume;

  const margin = 57.6; // 0.8 inch margin
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxTextWidth = pageWidth - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;
  const lineHeight = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  doc.setFont('times', 'normal');

  // Load Image if needed
  const imageUrlToUse = resumeProfileImageUrl || profile.imageUrl;
  if (withImage && imageUrlToUse) {
    try {
      const imgUrl = resolveAssetUrl(imageUrlToUse);
      // Position image at top right
      const imgSize = 75;
      doc.addImage(imgUrl, 'JPEG', pageWidth - margin - imgSize, y, imgSize, imgSize);
      // y += 10; // Slight offset for name if needed
    } catch (e) {
      console.warn('Could not load profile image for PDF', e);
    }
  }

  // HEADER (Center aligned)
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  if (profile.name) {
    const textWidth = doc.getTextWidth(profile.name.toUpperCase());
    doc.text(profile.name.toUpperCase(), pageWidth / 2 - textWidth / 2, y + 15);
    y += 30;
  }

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  
  const alignCenter = (text: string) => {
      const w = doc.getTextWidth(text);
      doc.text(text, pageWidth / 2 - w / 2, y);
      y += 14;
  };

  const contactInfo = [
    profile.location,
    profile.phone,
    profile.email
  ].filter(Boolean).join(' | ');

  if (contactInfo) {
    alignCenter(contactInfo);
  }

  const links = [
    ...profile.socialMediaLinks.map(s => s.url.replace('https://', '').replace('http://', '')),
    'sarangsvkm.in'
  ].join(' | ');
  
  if (links) {
    alignCenter(links);
  }

  // Ensure y is below the image if it was added
  if (withImage && imageUrlToUse) {
      y = Math.max(y, margin + 85);
  } else {
      y += 10;
  }

  const drawSectionHeader = (title: string) => {
    checkPageBreak(40);
    y += 10;
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
    doc.setFontSize(10);
  };

  // SUMMARY
  if (profile.about) {
    drawSectionHeader('Professional Summary');
    doc.setFont('times', 'normal');
    const lines = doc.splitTextToSize(profile.about, maxTextWidth);
    checkPageBreak(lines.length * lineHeight);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + 10;
  }

  // EXPERIENCE
  if (experiences.length > 0) {
    drawSectionHeader('Experience');
    experiences.forEach((exp) => {
      checkPageBreak(60);
      
      doc.setFont('times', 'bold');
      doc.text(exp.role || '', margin, y);
      
      const dates = `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
      const datesWidth = doc.getTextWidth(dates);
      doc.setFont('times', 'italic');
      doc.text(dates, pageWidth - margin - datesWidth, y);
      y += 14;

      doc.setFont('times', 'bold');
      doc.setTextColor(80, 80, 80); 
      doc.text(exp.company || '', margin, y);
      doc.setTextColor(0, 0, 0); 
      y += 16;

      doc.setFont('times', 'normal');
      if (exp.description) {
        const points = exp.description.split(/(?:\n|\r|•)/).filter(p => p.trim());
        points.forEach(point => {
            const lines = doc.splitTextToSize(`• ${point.trim()}`, maxTextWidth - 15);
            checkPageBreak(lines.length * lineHeight);
            doc.text(lines, margin + 10, y);
            y += lines.length * lineHeight + 4;
        });
      }
      y += 8;
    });
  }

  // PROJECTS
  if (projects.length > 0) {
    drawSectionHeader('Projects');
    projects.forEach((proj) => {
      checkPageBreak(40);
      doc.setFont('times', 'bold');
      doc.text(proj.title || '', margin, y);
      y += 14;

      doc.setFont('times', 'normal');
      if (proj.description) {
        const lines = doc.splitTextToSize(proj.description, maxTextWidth);
        checkPageBreak(lines.length * lineHeight);
        doc.text(lines, margin, y);
        y += lines.length * lineHeight + 6;
      }
      
      if (proj.techStack) {
          doc.setFont('times', 'bold');
          doc.text(`Technologies: `, margin, y);
          doc.setFont('times', 'normal');
          doc.text(proj.techStack, margin + doc.getTextWidth('Technologies: '), y);
          y += 14;
      }
      y += 8;
    });
  }

  // SKILLS
  if (skills.length > 0) {
    drawSectionHeader('Technical Skills');
    doc.setFont('times', 'normal');

    const categorizedSkills: Record<string, string[]> = {};
    skills.forEach(skill => {
        const cat = skill.category || 'General';
        if (!categorizedSkills[cat]) categorizedSkills[cat] = [];
        categorizedSkills[cat].push(skill.name);
    });

    for (const [category, skillNames] of Object.entries(categorizedSkills)) {
        const categoryText = category + ': ';
        const namesText = skillNames.join(', ');
        
        doc.setFont('times', 'bold');
        doc.text(categoryText, margin, y);
        
        doc.setFont('times', 'normal');
        doc.text(namesText, margin + doc.getTextWidth(categoryText), y);
        
        y += 16;
    }
    y += 10;
  }

  // EDUCATION
  if (educations.length > 0) {
    drawSectionHeader('Education');
    educations.forEach((edu) => {
      checkPageBreak(50);
      doc.setFont('times', 'bold');
      doc.text(`${edu.degree || ''} — ${edu.fieldOfStudy || ''}`, margin, y);
      
      const dates = `${edu.startDate || ''} – ${edu.endDate || ''}`;
      const datesWidth = doc.getTextWidth(dates);
      doc.setFont('times', 'italic');
      doc.text(dates, pageWidth - margin - datesWidth, y);
      y += 14;

      doc.setFont('times', 'normal');
      doc.text(edu.institution || '', margin, y);
      y += 20;
    });
  }

  doc.save(`${profile.name.replace(/\s+/g, '_')}_Resume.pdf`);
}
