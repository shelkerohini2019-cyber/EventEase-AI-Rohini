import { jsPDF } from 'jspdf';
import { EventData } from '../types/event';
import { formatCurrency, formatDate } from './formatters';

export function generateEventPlanPDF(event: EventData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      // Header banner on subsequent pages
      doc.setFontSize(8);
      doc.setTextColor(140, 130, 160);
      doc.text(`${event.name} • EventEase AI Blueprint`, margin, y);
      y += 6;
      doc.setDrawColor(230, 220, 245);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;
    }
  };

  // --- COVER / HEADER BANNER ---
  doc.setFillColor(109, 40, 217); // #6d28d9 purple
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('EventEase AI – Smart Event Blueprint', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(237, 233, 254);
  doc.text(
    `${event.eventType.toUpperCase()} • Generated on ${new Date().toLocaleDateString('en-US')}`,
    margin + 6,
    y + 17
  );

  y += 30;

  // --- EVENT OVERVIEW BOX ---
  doc.setFillColor(250, 248, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 27, 75);
  doc.text(event.name, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${formatDate(event.date)} ${event.time ? 'at ' + event.time : ''}`, margin + 5, y + 14);
  doc.text(`Location: ${event.location} (${event.locationType})`, margin + 5, y + 20);

  doc.text(`Guest Count: ${event.guestCount} guests`, margin + 100, y + 14);
  doc.text(
    `Total Budget: ${formatCurrency(event.totalBudget, event.currency)}`,
    margin + 100,
    y + 20
  );

  y += 34;

  // --- 1. AI THEME & CONCEPT ---
  if (event.plan) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('1. THEME CONCEPT & COLOR PALETTE', margin, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`"${event.plan.themeTitle}" — ${event.plan.tagline}`, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitConcept = doc.splitTextToSize(event.plan.conceptDescription, contentWidth);
    doc.text(splitConcept, margin, y);
    y += splitConcept.length * 4 + 4;

    // Color Palette Swatches
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Color Palette: ', margin, y);

    let colorX = margin + 25;
    event.plan.colorPalette.forEach((c) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${c.name} (${c.hex})`, colorX, y);
      colorX += 32;
    });
    y += 8;

    // Decor Highlights
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 27, 75);
    doc.text('Key Decoration Highlights:', margin, y);
    y += 5;

    event.plan.decorIdeas.slice(0, 3).forEach((d) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(109, 40, 217);
      doc.text(`• [${d.area}] ${d.title}`, margin + 2, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const splitDesc = doc.splitTextToSize(`${d.description} (Budget Tip: ${d.budgetFriendlyTip})`, contentWidth - 4);
      doc.text(splitDesc, margin + 4, y);
      y += splitDesc.length * 3.8 + 2;
    });
    y += 4;
  }

  // --- 2. FOOD & BEVERAGES ---
  if (event.plan?.foodSuggestions) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('2. FOOD & BEVERAGE CURATION', margin, y);
    y += 6;

    const fs = event.plan.foodSuggestions;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Appetizers: ', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(fs.appetizers.join(', '), margin + 22, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Mains: ', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(fs.mainCourses.join(', '), margin + 22, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Drinks: ', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(fs.drinks.join(', '), margin + 22, y);
    y += 8;
  }

  // --- 3. BUDGET BREAKDOWN ---
  checkPageBreak(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(109, 40, 217);
  doc.text('3. BUDGET & EXPENSE BREAKDOWN', margin, y);
  y += 6;

  const totalSpent = event.budgetCategories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + (it.actualCost || 0), 0),
    0
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Budget: ${formatCurrency(event.totalBudget, event.currency)} | Total Spent: ${formatCurrency(
      totalSpent,
      event.currency
    )} | Balance: ${formatCurrency(event.totalBudget - totalSpent, event.currency)}`,
    margin,
    y
  );
  y += 6;

  // Budget Table Header
  doc.setFillColor(243, 232, 255);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(88, 28, 135);
  doc.text('Category', margin + 3, y + 4.2);
  doc.text('Allocated', margin + 60, y + 4.2);
  doc.text('Actual Spent', margin + 90, y + 4.2);
  doc.text('Status', margin + 125, y + 4.2);
  y += 7;

  event.budgetCategories.forEach((cat) => {
    checkPageBreak(7);
    const catSpent = cat.items.reduce((s, it) => s + (it.actualCost || 0), 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${cat.name} (${cat.percentage}%)`, margin + 3, y + 4);
    doc.text(formatCurrency(cat.allocatedAmount, event.currency), margin + 60, y + 4);
    doc.text(formatCurrency(catSpent, event.currency), margin + 90, y + 4);

    const diff = cat.allocatedAmount - catSpent;
    doc.setTextColor(diff < 0 ? 220 : 16, diff < 0 ? 38 : 140, diff < 0 ? 38 : 60);
    doc.text(diff < 0 ? 'Over Budget' : 'On Track', margin + 125, y + 4);
    y += 5.5;
  });
  y += 4;

  // --- 4. PREPARATION TIMELINE ---
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(109, 40, 217);
  doc.text('4. PREPARATION TIMELINE MILESTONES', margin, y);
  y += 6;

  event.timeline.forEach((m) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(m.isCompleted ? 140 : 15, m.isCompleted ? 140 : 23, m.isCompleted ? 140 : 42);
    const checkmark = m.isCompleted ? '[X]' : '[ ]';
    doc.text(`${checkmark} ${m.title} (${m.phaseLabel})`, margin + 2, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      m.calculatedDate ? formatDate(m.calculatedDate) : `${m.targetDaysBefore}d before`,
      margin + 130,
      y + 4
    );
    y += 5.5;
  });
  y += 4;

  // --- 5. VENDOR CHECKLIST ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(109, 40, 217);
  doc.text('5. KEY VENDOR CHECKLIST', margin, y);
  y += 6;

  event.vendors.forEach((v) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`• ${v.categoryLabel}: ${v.task}`, margin + 2, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(v.vendorName || 'Not Booked', margin + 85, y + 4);
    doc.text(v.status.toUpperCase(), margin + 135, y + 4);
    y += 5.5;
  });
  y += 4;

  // --- 6. GUEST SUMMARY ---
  if (event.guests && event.guests.length > 0) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('6. GUEST & RSVP SUMMARY', margin, y);
    y += 6;

    const attendingCount = event.guests.filter((g) => g.rsvpStatus === 'attending').length;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Total Guests Tracked: ${event.guests.length} | Confirmed Attending: ${attendingCount} | Pending: ${
        event.guests.filter((g) => g.rsvpStatus === 'pending').length
      }`,
      margin,
      y
    );
    y += 6;
  }

  // Footer on final page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(160, 150, 180);
  doc.text('Crafted with EventEase AI • Smart Event Planner', margin, pageHeight - margin + 5);

  // Trigger download
  const safeName = event.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  doc.save(`${safeName}_EventPlan.pdf`);
}
