import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PdfGenerator {
  static generateQuotationPdf(quotation: any, settings?: any): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [184, 149, 90] as [number, number, number]; // #B8955A Gold
    const charcoalColor = [36, 33, 31] as [number, number, number]; // #24211F

    const businessName = settings?.businessName || 'Sathuragiri Decoration';
    const tagline = settings?.tagline || 'Every Celebration, Beautifully Crafted.';
    const phone = settings?.phone || '+91 98421 87654';
    const email = settings?.email || 'contact@sathuragiridecoration.com';
    const address = settings?.address || 'Plot No. 45, Temple View Avenue, Madurai - 625009';

    // Header Background Accent Bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, 'F');

    // Business Name & Tagline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text(businessName.toUpperCase(), 14, 22);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(119, 113, 107);
    doc.text(tagline, 14, 28);

    // Business Address
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoalColor);
    doc.text(`${address} | Phone: ${phone} | Email: ${email}`, 14, 34);

    // Document Title Banner
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...charcoalColor);
    doc.text('OFFICIAL EVENT QUOTATION', 14, 46);

    // Quotation Metadata Box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Quotation #: ${quotation.quotationNumber}`, 140, 44);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString('en-IN')}`, 140, 49);
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString('en-IN')}`, 140, 54);
    doc.text(`Status: ${quotation.status}`, 140, 59);

    // Customer Details Box
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT DETAILS:', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${quotation.customer?.name || 'Valued Client'}`, 14, 60);
    doc.text(`Phone: ${quotation.customer?.phone || 'N/A'}`, 14, 65);
    if (quotation.customer?.email) {
      doc.text(`Email: ${quotation.customer.email}`, 14, 70);
    }
    if (quotation.booking?.eventName) {
      doc.text(`Event: ${quotation.booking.eventName}`, 14, 75);
    }

    // Table of Items
    const startY = quotation.booking?.eventName ? 82 : 78;
    const tableData = quotation.items.map((item: any, index: number) => [
      String(index + 1),
      `${item.name}${item.description ? `\n${item.description}` : ''}`,
      `${item.quantity} ${item.unit || ''}`,
      `₹${Number(item.unitPrice).toLocaleString('en-IN')}`,
      item.discount > 0 ? `₹${Number(item.discount).toLocaleString('en-IN')}` : '-',
      `₹${Number(item.total).toLocaleString('en-IN')}`,
    ]);

    const runAutoTable = (docInstance: any, options: any) => {
      const at: any = autoTable;
      if (typeof at === 'function') {
        at(docInstance, options);
      } else if (typeof at?.default === 'function') {
        at.default(docInstance, options);
      } else if (typeof docInstance.autoTable === 'function') {
        docInstance.autoTable(options);
      }
    };

    runAutoTable(doc, {
      startY,
      head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Discount', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: charcoalColor,
      },
      alternateRowStyles: {
        fillColor: [250, 247, 242],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Totals Summary Box (Right aligned)
    doc.setFontSize(9);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`₹${Number(quotation.subtotal).toLocaleString('en-IN')}`, 196, finalY, { align: 'right' });

    if (quotation.discount > 0) {
      doc.text(`Overall Discount:`, 140, finalY + 5);
      doc.text(`- ₹${Number(quotation.discount).toLocaleString('en-IN')}`, 196, finalY + 5, { align: 'right' });
    }

    doc.text(`GST / Tax (${quotation.taxRate}%):`, 140, finalY + 10);
    doc.text(`₹${Number(quotation.taxAmount).toLocaleString('en-IN')}`, 196, finalY + 10, { align: 'right' });

    doc.setLineWidth(0.3);
    doc.setDrawColor(...primaryColor);
    doc.line(140, finalY + 13, 196, finalY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(`Grand Total:`, 140, finalY + 19);
    doc.text(`₹${Number(quotation.grandTotal).toLocaleString('en-IN')}`, 196, finalY + 19, { align: 'right' });

    // Terms & Payment Schedule (Left bottom)
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SCHEDULE & TERMS:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const terms = quotation.terms || settings?.termsDefault || '1. 30% advance on booking.\n2. 50% prior to event setup.\n3. 20% on completion.';
    doc.text(terms, 14, finalY + 5, { maxWidth: 115 });

    // Footer
    doc.setFillColor(250, 247, 242);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(119, 113, 107);
    doc.text('Thank you for choosing Sathuragiri Decoration. We craft your special moments into timeless memories.', 105, 290, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
  }

  static generateReceiptPdf(payment: any, settings?: any): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5', // A5 compact for receipts
    });

    const primaryColor = [184, 149, 90] as [number, number, number];
    const charcoalColor = [36, 33, 31] as [number, number, number];

    const businessName = settings?.businessName || 'Sathuragiri Decoration';
    const phone = settings?.phone || '+91 98421 87654';

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 148, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(businessName.toUpperCase(), 12, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(119, 113, 107);
    doc.text(`Official Payment Acknowledgement Receipt | Phone: ${phone}`, 12, 23);

    doc.setLineWidth(0.3);
    doc.setDrawColor(...primaryColor);
    doc.line(12, 27, 136, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...charcoalColor);
    doc.text('PAYMENT RECEIPT', 12, 35);

    doc.setFontSize(9);
    doc.text(`Receipt #: ${payment.receiptNumber}`, 85, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}`, 85, 40);
    doc.text(`Payment Mode: ${payment.paymentMethod}`, 85, 45);

    // Receipt details
    doc.text(`Received from: ${payment.customer?.name || 'Customer'}`, 12, 45);
    doc.text(`Phone: ${payment.customer?.phone || 'N/A'}`, 12, 50);
    doc.text(`Booking Ref: ${payment.booking?.reference || 'N/A'}`, 12, 55);
    doc.text(`Event: ${payment.booking?.eventName || 'Event'}`, 12, 60);
    if (payment.reference) {
      doc.text(`Txn Ref: ${payment.reference}`, 12, 65);
    }

    // Amount box
    doc.setFillColor(250, 247, 242);
    doc.roundedRect(12, 72, 124, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...charcoalColor);
    doc.text(`Amount Received (${payment.paymentType}):`, 18, 84);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(`₹${Number(payment.amount).toLocaleString('en-IN')}`, 130, 84, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(119, 113, 107);
    doc.text('This is a computer-generated receipt for Sathuragiri Decoration services.', 12, 102);

    return Buffer.from(doc.output('arraybuffer'));
  }
}
