"use client"

import { useState } from 'react';
import { Download, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/types';

interface Props {
  result: AnalysisResult;
  fileName?: string;
}

export default function DownloadPDFButton({ result, fileName }: Props) {
  const [exporting, setExporting]     = useState(false);
  const [patientName, setPatientName] = useState(result.patient_name ?? '');

  const handleExport = async () => {
    setExporting(true);
    try {
      const { default: jsPDF }     = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc   = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();   // 210 mm
      const pageH = doc.internal.pageSize.getHeight();  // 297 mm
      const mg    = 15;                                  // margin
      const cw    = pageW - mg * 2;                      // content width = 180 mm

      /* ── Colour palette ────────────────────────────────── */
      type RGB = [number, number, number];
      const C: Record<string, RGB> = {
        indigo:      [79,  70,  229],
        indigoLight: [238, 242, 255],
        indigoBdr:   [199, 210, 254],
        dark:        [22,  22,  35],
        body:        [55,  65,  81],
        muted:       [107, 114, 128],
        faint:       [156, 163, 175],
        divider:     [226, 232, 240],
        slate50:     [248, 250, 252],
        amberBg:     [255, 251, 235],
        amberBdr:    [253, 230, 138],
        amberText:   [146, 64,  14],
        amber500:    [245, 158, 11],
        redBg:       [254, 242, 242],
        redBdr:      [252, 165, 165],
        redText:     [185, 28,  28],
        red500:      [239, 68,  68],
        white:       [255, 255, 255],
        indigo200:   [180, 180, 255],
        indigo100:   [200, 200, 240],
      };

      const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const docId = `MRB-${Date.now().toString(36).toUpperCase().slice(-8)}`;

      /* ── Helpers ───────────────────────────────────────── */
      const setF = (
        size: number,
        style: 'normal' | 'bold' = 'normal',
        color: RGB = C.body,
      ) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(color[0], color[1], color[2]);
      };

      /** Draw a filled indigo section-header bar; returns new y. */
      const sectionBar = (label: string, y: number): number => {
        doc.setFillColor(C.indigoLight[0], C.indigoLight[1], C.indigoLight[2]);
        doc.setDrawColor(C.indigoBdr[0],   C.indigoBdr[1],   C.indigoBdr[2]);
        doc.setLineWidth(0.2);
        doc.roundedRect(mg, y, cw, 8.5, 1, 1, 'FD');
        doc.setFillColor(C.indigo[0], C.indigo[1], C.indigo[2]);
        doc.rect(mg, y, 2.5, 8.5, 'F');
        setF(8.5, 'bold', C.indigo);
        doc.text(label, mg + 6, y + 5.8);
        return y + 13;
      };

      /** Add a page if there isn't room; returns updated y. */
      const pageBreak = (y: number, needed: number): number => {
        if (y + needed > pageH - 22) { doc.addPage(); return 20; }
        return y;
      };

      /* ══════════════════════════════════════════════════════
         PAGE 1 — HEADER BAND
      ══════════════════════════════════════════════════════ */
      doc.setFillColor(C.indigo[0], C.indigo[1], C.indigo[2]);
      doc.rect(0, 0, pageW, 30, 'F');

      setF(16, 'bold', C.white);
      doc.text('MyReportBuddy', mg, 13.5);

      setF(7.5, 'normal', C.indigo200);
      doc.text('AI-ASSISTED MEDICAL REPORT ANALYSIS', mg, 21);

      setF(7.5, 'bold', C.white);
      doc.text('CONFIDENTIAL', pageW - mg, 13.5, { align: 'right' });
      setF(6.5, 'normal', C.indigo100);
      doc.text('For personal use only', pageW - mg, 21, { align: 'right' });

      let y = 38;

      /* ── Patient & Report Information Box ─────────────── */
      doc.setFillColor(C.slate50[0], C.slate50[1], C.slate50[2]);
      doc.setDrawColor(C.divider[0], C.divider[1], C.divider[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(mg, y, cw, 42, 2, 2, 'FD');

      setF(6.5, 'bold', C.muted);
      doc.text('PATIENT & REPORT INFORMATION', mg + 4, y + 6.5);

      const col1 = mg + 4;
      const col2 = mg + cw / 2 + 2;
      const LW   = 28;                   // label column width
      const halfCW = cw / 2 - LW - 6;   // value truncation width

      const leftRows  = [
        { label: 'Patient Name', value: patientName.trim() || 'Not specified' },
        { label: 'Report Type',  value: result.report_type                     },
        { label: 'Source File',  value: fileName || 'Not specified'            },
      ];
      const rightRows = [
        { label: 'Date Generated', value: today          },
        { label: 'Document ID',    value: docId          },
        { label: 'Prepared by',    value: 'MyReportBuddy' },
      ];

      leftRows.forEach(({ label, value }, i) => {
        const ry = y + 14 + i * 9;
        setF(7.5, 'bold',   C.muted);  doc.text(label, col1, ry);
        setF(7.5, 'normal', C.dark);   doc.text(doc.splitTextToSize(value, halfCW)[0], col1 + LW, ry);
      });
      rightRows.forEach(({ label, value }, i) => {
        const ry = y + 14 + i * 9;
        setF(7.5, 'bold',   C.muted);  doc.text(label, col2, ry);
        setF(7.5, 'normal', C.dark);   doc.text(doc.splitTextToSize(value, halfCW)[0], col2 + LW, ry);
      });

      y += 50;

      /* ── Medical Disclaimer ────────────────────────────── */
      const dLines = doc.splitTextToSize(result.disclaimer, cw - 10);
      const dH     = dLines.length * 4.5 + 14;

      doc.setFillColor(C.amberBg[0],  C.amberBg[1],  C.amberBg[2]);
      doc.setDrawColor(C.amberBdr[0], C.amberBdr[1], C.amberBdr[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(mg, y, cw, dH, 2, 2, 'FD');
      doc.setFillColor(C.amber500[0], C.amber500[1], C.amber500[2]);
      doc.rect(mg, y, 2.5, dH, 'F');

      setF(7,   'bold',   C.amberText);  doc.text('MEDICAL DISCLAIMER', mg + 6, y + 7);
      setF(7.5, 'normal', C.amberText);  doc.text(dLines, mg + 6, y + 12.5);

      y += dH + 10;

      /* ══════════════════════════════════════════════════════
         SUMMARY
      ══════════════════════════════════════════════════════ */
      y  = pageBreak(y, 40);
      y  = sectionBar('SUMMARY', y);
      setF(10, 'normal', C.body);
      const sumLines = doc.splitTextToSize(result.summary, cw);
      doc.text(sumLines, mg, y);
      y += sumLines.length * 5.5 + 10;

      /* ══════════════════════════════════════════════════════
         RED FLAGS
      ══════════════════════════════════════════════════════ */
      if (result.red_flags?.length) {
        y = pageBreak(y, 30);
        y = sectionBar('RED FLAGS — REQUIRES IMMEDIATE ATTENTION', y);

        result.red_flags.forEach((flag) => {
          const lines = doc.splitTextToSize(flag, cw - 10);
          const fh    = lines.length * 5 + 8;
          y = pageBreak(y, fh + 3);

          doc.setFillColor(C.redBg[0],  C.redBg[1],  C.redBg[2]);
          doc.setDrawColor(C.redBdr[0], C.redBdr[1], C.redBdr[2]);
          doc.setLineWidth(0.2);
          doc.roundedRect(mg, y, cw, fh, 1.5, 1.5, 'FD');
          doc.setFillColor(C.red500[0], C.red500[1], C.red500[2]);
          doc.rect(mg, y, 2.5, fh, 'F');

          setF(9, 'normal', C.redText);
          doc.text(lines, mg + 6, y + 5.5);
          y += fh + 3;
        });
        y += 5;
      }

      /* ══════════════════════════════════════════════════════
         KEY FINDINGS TABLE
      ══════════════════════════════════════════════════════ */
      if (result.key_findings?.length) {
        y = pageBreak(y, 50);
        y = sectionBar('KEY FINDINGS', y);

        autoTable(doc, {
          startY: y,
          head: [['Parameter', 'Observed Value', 'Reference Range', 'Status']],
          body: result.key_findings.map((f) => [
            f.parameter,
            f.value,
            f.normal_range,
            f.status.charAt(0).toUpperCase() + f.status.slice(1),
          ]),
          styles: {
            fontSize: 9,
            cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 },
            lineColor:   [226, 232, 240] as RGB,
            lineWidth:   0.2,
            textColor:   C.body,
            font:        'helvetica',
          },
          headStyles: {
            fillColor:  C.indigo,
            textColor:  C.white,
            fontStyle:  'bold',
            fontSize:   8.5,
            cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          },
          alternateRowStyles: { fillColor: C.slate50 },
          columnStyles: {
            0: { cellWidth: 58 },
            1: { cellWidth: 38 },
            2: { cellWidth: 52 },
            3: { cellWidth: 32 },
          },
          didParseCell(data) {
            if (data.column.index === 3 && data.section === 'body') {
              const s = (data.cell.raw as string).toLowerCase();
              const map: Record<string, { text: RGB; bg: RGB }> = {
                critical: { text: [185, 28,  28], bg: [254, 226, 226] },
                high:     { text: [154, 52,  18], bg: [255, 237, 213] },
                low:      { text: [30,  64,  175], bg: [219, 234, 254] },
                normal:   { text: [4,   120, 87],  bg: [209, 250, 229] },
              };
              const st = map[s] ?? map.normal;
              data.cell.styles.textColor  = st.text;
              data.cell.styles.fillColor  = st.bg;
              data.cell.styles.fontStyle  = 'bold';
            }
          },
          margin: { left: mg, right: mg },
        });

        y = (doc as unknown as { lastAutoTable: { finalY: number } })
          .lastAutoTable.finalY + 10;
      }

      /* ══════════════════════════════════════════════════════
         CLINICAL INSIGHTS
      ══════════════════════════════════════════════════════ */
      if (result.insights?.length) {
        y = pageBreak(y, 40);
        y = sectionBar('CLINICAL INSIGHTS', y);

        result.insights.forEach((insight, i) => {
          const lines = doc.splitTextToSize(insight, cw - 12);
          const h     = lines.length * 5.2 + 6;
          y = pageBreak(y, h + 3);

          /* Numbered circle */
          doc.setFillColor(C.indigoLight[0], C.indigoLight[1], C.indigoLight[2]);
          doc.setDrawColor(C.indigoBdr[0],   C.indigoBdr[1],   C.indigoBdr[2]);
          doc.setLineWidth(0.2);
          doc.ellipse(mg + 3.5, y + 3.5, 3, 3, 'FD');
          setF(7, 'bold', C.indigo);
          doc.text(String(i + 1), mg + 3.5, y + 4.8, { align: 'center' });

          setF(9, 'normal', C.body);
          doc.text(lines, mg + 10, y + 4.5);
          y += h + 3;
        });
        y += 4;
      }

      /* ══════════════════════════════════════════════════════
         RECOMMENDED ACTIONS
      ══════════════════════════════════════════════════════ */
      if (result.recommended_actions?.length) {
        y = pageBreak(y, 40);
        y = sectionBar('RECOMMENDED ACTIONS', y);

        result.recommended_actions.forEach((action, i) => {
          const lines = doc.splitTextToSize(action, cw - 12);
          const h     = lines.length * 5.2 + 6;
          y = pageBreak(y, h + 3);

          /* Numbered circle (rose) */
          doc.setFillColor(255, 241, 242);
          doc.setDrawColor(252, 165, 165);
          doc.setLineWidth(0.2);
          doc.ellipse(mg + 3.5, y + 3.5, 3, 3, 'FD');
          setF(7, 'bold', [190, 18, 60]);
          doc.text(String(i + 1), mg + 3.5, y + 4.8, { align: 'center' });

          setF(9, 'normal', C.body);
          doc.text(lines, mg + 10, y + 4.5);
          y += h + 3;
        });
      }

      /* ══════════════════════════════════════════════════════
         FOOTER — drawn on every page
      ══════════════════════════════════════════════════════ */
      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } })
        .internal.getNumberOfPages();

      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(C.divider[0], C.divider[1], C.divider[2]);
        doc.setLineWidth(0.2);
        doc.line(mg, pageH - 13, pageW - mg, pageH - 13);

        setF(6.5, 'normal', C.faint);
        doc.text(
          'Generated by MyReportBuddy · For informational purposes only · Not a substitute for professional medical advice.',
          pageW / 2, pageH - 8.5,
          { align: 'center' },
        );
        doc.text(`Page ${p} / ${totalPages}`, pageW - mg, pageH - 8.5, { align: 'right' });
        doc.text(today, mg, pageH - 8.5);
      }

      /* ── Save ──────────────────────────────────────────── */
      const safeName    = result.report_type.replace(/[^a-z0-9]+/gi, '_');
      const safePatient = patientName.trim()
        ? `_${patientName.trim().replace(/[^a-z0-9\s]+/gi, '').trim().replace(/\s+/g, '_')}`
        : '';
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`MyReportBuddy_${safeName}${safePatient}_${dateStr}.pdf`);

    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Patient name input */}
      <div className="relative">
        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Patient name"
          maxLength={80}
          disabled={exporting}
          aria-label="Patient name for PDF report"
          className="
            h-9 pl-7 pr-3 text-sm rounded-xl w-36 sm:w-44
            border border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 focus:border-indigo-400 dark:focus:border-indigo-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        />
      </div>

      {/* Download button */}
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        disabled={exporting}
        className="rounded-xl whitespace-nowrap shrink-0"
        aria-label="Download analysis as PDF"
      >
        {exporting
          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          : <Download className="mr-2 h-4 w-4"              aria-hidden="true" />
        }
        {exporting ? 'Exporting…' : 'Download PDF'}
      </Button>
    </div>
  );
}
