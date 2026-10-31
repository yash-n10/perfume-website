import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Convert an image URL to a base64 data URL for jsPDF embedding
 */
function getBase64ImageFromURL(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Download a formatted Tax Invoice PDF with MOHERA branding, GST number, and itemized table
 */
export async function downloadInvoicePDF(order, gstNumber = '27AABCM1234F1Z1') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ── 1. Header Banner & Branding ──────────────────────────────────────────
  doc.setFillColor(20, 20, 20); // Luxury dark slate
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent line under header
  doc.setDrawColor(180, 140, 32); // Gold
  doc.setLineWidth(1.2);
  doc.line(0, 42, pageWidth, 42);

  // Try loading logo
  try {
    const logoData = await getBase64ImageFromURL('/logo_white.png');
    if (logoData) {
      doc.addImage(logoData, 'PNG', margin, 7, 28, 28);
    }
  } catch {
    // Fallback if image load fails
  }

  // Header Titles
  doc.setTextColor(212, 175, 55); // Rich Gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('MOHERA', margin + 34, 17);

  doc.setTextColor(230, 220, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('HAUTE PARFUMERIE • ARTISANAL SCENTS', margin + 34, 23);

  doc.setFontSize(7.5);
  doc.setTextColor(190, 180, 160);
  doc.text(`GSTIN: ${gstNumber} (Authorized)`, margin + 34, 28);
  doc.text('Flagship Atelier • www.mohera.in • Care: moherafragrances@gmail.com', margin + 34, 33);

  // Invoice Label Box (Top Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.text(`Invoice #: MOH-ORD-${order.id}`, pageWidth - margin, 24, { align: 'right' });

  const orderDate = order.order_datetime
    ? new Date(order.order_datetime).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7.5);
  doc.text(`Date: ${orderDate}`, pageWidth - margin, 30, { align: 'right' });

  // ── 2. Invoice Details & Customer Info Grid ──────────────────────────────
  const metaY = 49;

  // Billed To Box
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(220, 210, 195);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, metaY, contentWidth * 0.58, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 140, 32);
  doc.text('BILLED TO (CUSTOMER DETAILS):', margin + 4, metaY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(order.customer_name || 'Valued Patron', margin + 4, metaY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text(`Phone: ${order.phone || 'N/A'}`, margin + 4, metaY + 19);
  doc.text(`Email: ${order.email || 'N/A'}`, margin + 4, metaY + 24);

  // Address wrapped
  const splitAddress = doc.splitTextToSize(`Address: ${order.address || 'In-Store Pickup'}`, (contentWidth * 0.58) - 8);
  doc.text(splitAddress, margin + 4, metaY + 29);

  // Payment & Order Details Box (Right)
  const rightBoxX = margin + (contentWidth * 0.61);
  const rightBoxWidth = contentWidth * 0.39;

  doc.roundedRect(rightBoxX, metaY, rightBoxWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 140, 32);
  doc.text('PAYMENT & ORDER SUMMARY:', rightBoxX + 4, metaY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  doc.text('Order Type:', rightBoxX + 4, metaY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text((order.order_type || 'offline').toUpperCase(), rightBoxX + 28, metaY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Payment Mode:', rightBoxX + 4, metaY + 19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(order.payment_mode || 'Cash', rightBoxX + 28, metaY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Payment Status:', rightBoxX + 4, metaY + 25);
  doc.setFont('helvetica', 'bold');
  const isSuccess = (order.payment_status || '').toLowerCase() === 'success';
  doc.setTextColor(isSuccess ? 16 : 180, isSuccess ? 120 : 40, isSuccess ? 40 : 40);
  doc.text((order.payment_status || 'Pending').toUpperCase(), rightBoxX + 28, metaY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Settlement:', rightBoxX + 4, metaY + 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(order.paid_status === 1 ? 16 : 180, order.paid_status === 1 ? 120 : 40, 40);
  doc.text(order.paid_status === 1 ? 'PAID (Settled)' : 'UNPAID', rightBoxX + 28, metaY + 31);

  // ── 3. Line Items Table (AutoTable) ──────────────────────────────────────
  const tableData = (order.items || []).map((item, index) => [
    index + 1,
    item.product_name || 'Luxury Fragrance Item',
    item.quantity || 1,
    `INR ${Number(item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `INR ${Number(item.total_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 93,
    head: [['Sr.', 'Fragrance Description', 'Qty', 'Unit Price', 'Total Amount']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'plain',
    headStyles: {
      fillColor: [180, 140, 32], // Gold
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 36, halign: 'right', fontStyle: 'bold', textColor: [180, 140, 32] },
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3.2,
      lineColor: [230, 220, 205],
      lineWidth: 0.2,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [252, 250, 246],
    },
  });

  const finalY = doc.lastAutoTable.finalY + 6;

  // ── 4. Totals & Tax Calculation ──────────────────────────────────────────
  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;

  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(220, 210, 195);
  doc.roundedRect(totalsBoxX, finalY, totalsBoxWidth, 32, 2, 2, 'FD');

  const grandTotal = Number(order.total_price || 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal (Exclusive):', totalsBoxX + 4, finalY + 7);
  doc.setTextColor(20, 20, 20);
  doc.text(`INR ${(grandTotal / 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, finalY + 7, { align: 'right' });

  doc.setTextColor(80, 80, 80);
  doc.text('GST (18% Applicable):', totalsBoxX + 4, finalY + 14);
  doc.setTextColor(20, 20, 20);
  doc.text(`INR ${(grandTotal - (grandTotal / 1.18)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, finalY + 14, { align: 'right' });

  doc.setDrawColor(180, 140, 32);
  doc.setLineWidth(0.6);
  doc.line(totalsBoxX + 4, finalY + 18, pageWidth - margin - 4, finalY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 140, 32);
  doc.text('Grand Total:', totalsBoxX + 4, finalY + 26);
  doc.text(`INR ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, finalY + 26, { align: 'right' });

  // ── 5. Terms & Signature Box ─────────────────────────────────────────────
  const noteY = finalY;
  const noteWidth = contentWidth - totalsBoxWidth - 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 220, 205);
  doc.roundedRect(margin, noteY, noteWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 140, 32);
  doc.text('TERMS & CONDITIONS:', margin + 4, noteY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  const termsText = [
    '• Handcrafted luxury artisanal fragrances formulated with fine botanical absolutes.',
    '• Goods once delivered cannot be returned or exchanged due to hygiene and artisanal integrity.',
    '• Store bottles in cool, dark environments away from direct thermal exposure.',
    '• This is a system-generated electronic tax invoice and requires no physical seal.',
  ];
  termsText.forEach((t, i) => doc.text(t, margin + 4, noteY + 12 + (i * 4.5)));

  // ── 6. Bottom Footer & Signature ─────────────────────────────────────────
  const footerY = pageHeight - 16;
  doc.setDrawColor(220, 210, 195);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for choosing MOHERA Haute Parfumerie • www.mohera.in', margin, footerY);

  doc.setFont('helvetica', 'italic');
  doc.text('Authorized Signatory for MOHERA Luxury Fragrances', pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF
  const filename = `MOHERA_Invoice_#${order.id || 'Order'}.pdf`;
  doc.save(filename);
}

/**
 * Open printable invoice window for direct browser printing
 */
export function printInvoice(order, gstNumber = '27AABCM1234F1Z1') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const orderDate = order.order_datetime
    ? new Date(order.order_datetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const grandTotal = Number(order.total_price || 0);
  const items = order.items || [];

  const itemsHtml = items.map((item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5ded3; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5ded3; font-weight: 600;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5ded3; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5ded3; text-align: right;">₹${Number(item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5ded3; text-align: right; font-weight: 700; color: #b48c20;">₹${Number(item.total_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MOHERA Invoice #${order.id}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f1f1f; margin: 0; padding: 20px; background: #fff; }
        .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 8px; padding: 30px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b48c20; padding-bottom: 20px; }
        .logo-title { font-size: 26px; font-weight: 700; color: #b48c20; letter-spacing: 0.15em; margin: 0; }
        .sub-tagline { font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.1em; margin: 4px 0 0; }
        .gst { font-size: 11px; color: #888; margin-top: 4px; }
        .inv-title { font-size: 20px; font-weight: 700; color: #111; text-align: right; margin: 0; }
        .meta-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px; margin: 24px 0; }
        .meta-box { background: #faf8f5; border: 1px solid #e8dfd3; border-radius: 6px; padding: 14px; font-size: 12px; }
        .meta-box h4 { margin: 0 0 8px; color: #b48c20; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
        th { background: #b48c20; color: #fff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .totals-table { width: 300px; margin-left: auto; margin-top: 10px; font-size: 13px; }
        .totals-table td { padding: 6px 0; }
        .grand-total { font-size: 16px; font-weight: 700; color: #b48c20; border-top: 2px solid #b48c20; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 14px; font-size: 11px; color: #777; display: flex; justify-content: space-between; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          .invoice-card { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: right; margin-bottom: 15px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #b48c20; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print / Save as PDF</button>
      </div>
      <div class="invoice-card">
        <div class="header">
          <div>
            <h1 class="logo-title">MOHERA</h1>
            <p class="sub-tagline">Haute Parfumerie • Luxury Artisanal Scents</p>
            <p class="gst"><strong>GSTIN:</strong> ${gstNumber}</p>
          </div>
          <div>
            <h2 class="inv-title">TAX INVOICE</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #b48c20; font-weight: 600; text-align: right;">#MOH-ORD-${order.id}</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #777; text-align: right;">${orderDate}</p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <h4>Billed To (Customer Details):</h4>
            <p style="margin: 0; font-weight: 700; font-size: 14px;">${order.customer_name || 'Valued Patron'}</p>
            <p style="margin: 4px 0 0; color: #555;">Phone: ${order.phone || '—'}</p>
            <p style="margin: 2px 0 0; color: #555;">Email: ${order.email || '—'}</p>
            <p style="margin: 2px 0 0; color: #555;">Address: ${order.address || 'In-Store'}</p>
          </div>
          <div class="meta-box">
            <h4>Payment & Summary:</h4>
            <p style="margin: 0;">Order Type: <strong>${(order.order_type || 'offline').toUpperCase()}</strong></p>
            <p style="margin: 4px 0 0;">Payment Mode: <strong>${order.payment_mode || 'Cash'}</strong></p>
            <p style="margin: 4px 0 0;">Payment Status: <strong>${(order.payment_status || 'Success').toUpperCase()}</strong></p>
            <p style="margin: 4px 0 0;">Settlement: <strong>${order.paid_status === 1 ? 'PAID' : 'UNPAID'}</strong></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th>Fragrance Description</th>
              <th style="width: 50px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Unit Price</th>
              <th style="width: 120px; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td style="color: #666;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">₹${(grandTotal / 1.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #666;">GST (18% Included):</td>
            <td style="text-align: right; font-weight: 600;">₹${(grandTotal - (grandTotal / 1.18)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td style="text-align: right;">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; background: #faf8f5; padding: 12px; border-radius: 4px; font-size: 11px; color: #666;">
          <strong>Terms:</strong> Handcrafted luxury artisanal fragrances. Goods once delivered cannot be returned or exchanged due to hygiene and artisanal nature. Keep away from direct thermal exposure.
        </div>

        <div class="footer">
          <span>Thank you for choosing MOHERA Haute Parfumerie • www.mohera.in</span>
          <span>Authorized Signatory</span>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

