/**
 * ITR Export Utilities — generates PDF and Excel for ITR filing.
 * PDF: jspdf + jspdf-autotable
 * Excel: xlsx (SheetJS)
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { ItrExportData } from "@/hooks/use-itr-export";

const INR = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── PDF Export ─────────────────────────────────────────────────────────────────
export function exportItrPdf(data: ItrExportData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const { shopInfo, financialYear, period, plSummary, gstSummary, paymentSummary,
    expenseByCategory, salesRegister, purchaseRegister, expenseRegister,
    receivables, payables } = data;

  const PAGE_W = doc.internal.pageSize.getWidth();
  const MARGIN = 14;

  // ── Cover / Header ──────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ITR Financial Report", PAGE_W / 2, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Financial Year: FY ${financialYear}  |  Period: ${period.start} to ${period.end}`, PAGE_W / 2, 25, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Shop: ${shopInfo.name}  |  GST: ${shopInfo.gstNumber || "N/A"}  |  Owner: ${shopInfo.ownerName}`, PAGE_W / 2, 31, { align: "center" });
  if (shopInfo.address) doc.text(`Address: ${shopInfo.address}`, PAGE_W / 2, 37, { align: "center" });

  let y = 44;

  const sectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setDrawColor(99, 102, 241);
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 8, 2, 2, "FD");
    doc.setTextColor(49, 46, 129);
    doc.text(title, MARGIN + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 11;
  };

  // ── 1. P&L Summary ─────────────────────────────────────────────────────────
  sectionTitle("1. Profit & Loss Summary");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Particulars", "Amount (₹)"]],
    body: [
      ["Gross Turnover (Sales)", INR(plSummary.totalSales)],
      ["(-) Purchases", INR(plSummary.totalPurchases)],
      ["Gross Profit", INR(plSummary.grossProfit)],
      ["(-) Business Expenses", INR(plSummary.totalExpenses)],
      ["Net Profit", INR(plSummary.netProfit)],
      ["GST / Tax Collected", INR(plSummary.taxCollected)],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
    bodyStyles: { halign: "left" },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    didParseCell: (d) => {
      if (d.row.index === 2 || d.row.index === 4) d.cell.styles.fontStyle = "bold";
    },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 2. GST Summary ─────────────────────────────────────────────────────────
  sectionTitle("2. GST / Tax Summary");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Component", "Amount (₹)"]],
    body: [
      ["Total Tax Collected", INR(gstSummary.totalTaxCollected)],
      ["IGST (Interstate)", INR(gstSummary.igst)],
      ["CGST (Intrastate - Central)", INR(gstSummary.cgst)],
      ["SGST (Intrastate - State)", INR(gstSummary.sgst)],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [16, 185, 129] },
    columnStyles: { 1: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 3. Payment Mode Breakdown ───────────────────────────────────────────────
  sectionTitle("3. Payment Mode Breakdown");
  const payRows = Object.entries(paymentSummary).map(([mode, v]) => [
    mode.toUpperCase(), v.count.toString(), INR(v.total),
  ]);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Mode", "Transactions", "Total (₹)"]],
    body: payRows.length ? payRows : [["No payments", "", ""]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [245, 158, 11] },
    columnStyles: { 2: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 4. Expense by Category ─────────────────────────────────────────────────
  const newPage = () => { doc.addPage(); y = 14; };
  newPage();
  sectionTitle("4. Expenses by Category");
  const expCatRows = Object.entries(expenseByCategory).map(([cat, amt]) => [cat, INR(amt)]);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Category", "Total (₹)"]],
    body: expCatRows.length ? expCatRows : [["No expenses", ""]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [239, 68, 68] },
    columnStyles: { 1: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 5. Sales Register ──────────────────────────────────────────────────────
  newPage();
  sectionTitle("5. Sales Register");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Invoice #", "Date", "Customer", "Taxable Value", "IGST", "CGST", "SGST", "Total Tax", "Total Amount", "Status"]],
    body: salesRegister.map((s) => [
      s.invoiceNumber, s.date, s.customerName,
      INR(s.taxableValue), INR(s.igst), INR(s.cgst), INR(s.sgst),
      INR(s.totalTax), INR(s.totalAmount), s.paymentStatus,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" }, 7: { halign: "right" }, 8: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 6. Purchase Register ────────────────────────────────────────────────────
  newPage();
  sectionTitle("6. Purchase Register");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["PO Ref", "Date", "Supplier", "Supplier GST", "Description", "Amount"]],
    body: purchaseRegister.map((p) => [
      p.referenceId, p.date, p.supplierName, p.supplierGst, p.description, INR(p.amount),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [249, 115, 22] },
    columnStyles: { 5: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 7. Expense Register ────────────────────────────────────────────────────
  newPage();
  sectionTitle("7. Expense Register");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenseRegister.map((e) => [e.date, e.category, e.description, INR(e.amount)]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [239, 68, 68] },
    columnStyles: { 3: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 8. Receivables ─────────────────────────────────────────────────────────
  newPage();
  sectionTitle("8. Debtors / Receivables at Year-End");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Customer", "Total Billed", "Total Received", "Outstanding"]],
    body: receivables.length ? receivables.map((r) => [
      r.customerName, INR(r.debit), INR(r.credit), INR(r.outstanding),
    ]) : [["No outstanding receivables", "", "", ""]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [6, 182, 212] },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right", fontStyle: "bold" } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── 9. Payables ────────────────────────────────────────────────────────────
  sectionTitle("9. Creditors / Payables at Year-End");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Supplier", "Total Purchased", "Total Paid", "Outstanding"]],
    body: payables.length ? payables.map((p) => [
      p.supplierName, INR(p.debit), INR(p.credit), INR(p.outstanding),
    ]) : [["No outstanding payables", "", "", ""]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [168, 85, 247] },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right", fontStyle: "bold" } },
  });

  // ── Footer on every page ───────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}  ·  Generated by Dukaandari  ·  FY ${financialYear}`, PAGE_W / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });
    doc.setTextColor(0);
  }

  doc.save(`ITR_Report_FY${financialYear}_${shopInfo.name.replace(/\s+/g, "_")}.pdf`);
}

// ── Excel Export ───────────────────────────────────────────────────────────────
export function exportItrExcel(data: ItrExportData) {
  const { shopInfo, financialYear, period, plSummary, gstSummary,
    paymentSummary, expenseByCategory, salesRegister, purchaseRegister,
    expenseRegister, receivables, payables } = data;

  const wb = XLSX.utils.book_new();

  const addSheet = (name: string, rows: (string | number)[][]) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  // Sheet 1: P&L Summary
  addSheet("P&L Summary", [
    [`ITR Financial Report — FY ${financialYear}`],
    [`Shop: ${shopInfo.name}`, `GST: ${shopInfo.gstNumber || "N/A"}`],
    [`Period: ${period.start} to ${period.end}`],
    [],
    ["Particulars", "Amount (INR)"],
    ["Gross Turnover (Sales)", plSummary.totalSales],
    ["(-) Purchases", plSummary.totalPurchases],
    ["Gross Profit", plSummary.grossProfit],
    ["(-) Business Expenses", plSummary.totalExpenses],
    ["Net Profit", plSummary.netProfit],
    ["GST / Tax Collected", plSummary.taxCollected],
    [],
    ["Invoice Count", plSummary.invoiceCount],
    ["Purchase Entries", plSummary.purchaseCount],
    ["Expense Entries", plSummary.expenseCount],
  ]);

  // Sheet 2: GST Summary
  addSheet("GST Summary", [
    ["GST Component", "Amount (INR)"],
    ["Total Tax Collected", gstSummary.totalTaxCollected],
    ["IGST (Interstate)", gstSummary.igst],
    ["CGST (Intrastate Central)", gstSummary.cgst],
    ["SGST (Intrastate State)", gstSummary.sgst],
    [],
    ["Payment Mode", "Transactions", "Total (INR)"],
    ...Object.entries(paymentSummary).map(([mode, v]) => [mode.toUpperCase(), v.count, v.total]),
  ]);

  // Sheet 3: Sales Register
  addSheet("Sales Register", [
    ["Invoice #", "Date", "Customer", "Subtotal", "Discount", "Taxable Value", "IGST", "CGST", "SGST", "Total Tax", "Total Amount", "Payment Status"],
    ...salesRegister.map((s) => [
      s.invoiceNumber, s.date, s.customerName,
      s.subtotal, s.discount, s.taxableValue,
      s.igst, s.cgst, s.sgst, s.totalTax, s.totalAmount, s.paymentStatus,
    ]),
    [],
    ["TOTAL", "", "", salesRegister.reduce((a, s) => a + s.subtotal, 0), "", salesRegister.reduce((a, s) => a + s.taxableValue, 0), salesRegister.reduce((a, s) => a + s.igst, 0), salesRegister.reduce((a, s) => a + s.cgst, 0), salesRegister.reduce((a, s) => a + s.sgst, 0), salesRegister.reduce((a, s) => a + s.totalTax, 0), plSummary.totalSales, ""],
  ]);

  // Sheet 4: Purchase Register
  addSheet("Purchase Register", [
    ["PO Reference", "Date", "Supplier", "Supplier GST", "Description", "Amount"],
    ...purchaseRegister.map((p) => [p.referenceId, p.date, p.supplierName, p.supplierGst, p.description, p.amount]),
    [],
    ["TOTAL", "", "", "", "", plSummary.totalPurchases],
  ]);

  // Sheet 5: Expense Register
  addSheet("Expense Register", [
    ["Date", "Category", "Description", "Amount"],
    ...expenseRegister.map((e) => [e.date, e.category, e.description, e.amount]),
    [],
    ["TOTAL", "", "", plSummary.totalExpenses],
    [],
    ["--- By Category ---"],
    ["Category", "Total"],
    ...Object.entries(expenseByCategory).map(([cat, amt]) => [cat, amt]),
  ]);

  // Sheet 6: Receivables
  addSheet("Receivables", [
    ["Customer", "Total Billed", "Total Received", "Outstanding"],
    ...receivables.map((r) => [r.customerName, r.debit, r.credit, r.outstanding]),
  ]);

  // Sheet 7: Payables
  addSheet("Payables", [
    ["Supplier", "Total Purchased", "Total Paid", "Outstanding"],
    ...payables.map((p) => [p.supplierName, p.debit, p.credit, p.outstanding]),
  ]);

  XLSX.writeFile(wb, `ITR_Report_FY${financialYear}_${shopInfo.name.replace(/\s+/g, "_")}.xlsx`);
}
