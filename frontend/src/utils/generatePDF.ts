import type { Facture } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Temporary container for rendering the invoice HTML
const createInvoiceHTML = (facture: Facture): HTMLDivElement => {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '-9999px';
  div.style.width = '595px'; // A4 width in mm at 72 DPI
  div.style.padding = '32px';
  div.style.background = 'linear-gradient(145deg, #ffffff, #f9fcff)';
  div.style.border = '1px solid #edf2f7';
  div.style.fontFamily = "'Inter', 'Roboto', sans-serif";
  
  div.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
      <div>
        <img src="/assets/logistics.jpeg" alt="L&N ENTREPRISE Logo" style="height: 60px; width: auto; margin-bottom: 8px;" />
        <h2 style="margin-top: 16px; font-weight: 700; color: #1a3c6d;">L&N ENTREPRISE</h2>
        <p style="color: #718096; line-height: 1.6;">LOT 37 MERMOZ</p>
        <p style="color: #718096; line-height: 1.6;">Tél: 78 879 98 67 / 77 634 45 68</p>
        <p style="color: #718096; line-height: 1.6;">Email: llogistsn@gmail.com</p>
      </div>
      <div style="text-align: right;">
        <h3 style="font-weight: 700; color: #2b6cb0;">Facture ${facture.numero || 'INV-XXXX'}</h3>
        <p style="color: #718096; margin-top: 8px;">Date: ${
          facture.date ? new Date(facture.date).toLocaleDateString('fr-FR') : 'N/A'
        }</p>
        <span style="display: inline-block; margin-top: 16px; padding: 4px 8px; border-radius: 4px; background: ${
          facture.statut === 'payée' ? '#4caf50' : facture.statut === 'envoyée' ? '#ff9800' : '#e6f3ff'
        }; color: ${facture.statut === 'brouillon' ? '#1a3c6d' : '#fff'}; font-size: 12px;">
          ${facture.statut || 'Brouillon'}
        </span>
      </div>
    </div>
    <div style="margin: 20px 0; background: #f7fafc; padding: 16px; border-radius: 8px;">
      <h3 style="font-weight: 600; color: #1a3c6d; margin-bottom: 8px;">Facture à</h3>
      <p style="font-weight: 500; color: #2d3748;">${facture.clientNom || 'Nom du Client'}</p>
      <p style="color: #718096; line-height: 1.6;">${facture.clientAdresse || 'Adresse du Client'}</p>
      ${facture.clientTelephone ? `<p style="color: #718096; line-height: 1.6;">Tél: ${facture.clientTelephone}</p>` : ''}
      ${facture.clientEmail ? `<p style="color: #718096; line-height: 1.6;">Email: ${facture.clientEmail}</p>` : ''}
    </div>
    <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 16px 0;" />
    <div style="border: 1px solid #edf2f7; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f7fafc;">
            <th style="font-weight: 600; color: #1a3c6d; padding: 8px; text-align: left;">Poids</th>
            <th style="font-weight: 600; color: #1a3c6d; padding: 8px; text-align: left;">Désignation</th>
            <th style="font-weight: 600; color: #1a3c6d; padding: 8px; text-align: left;">Destination</th>
            <th style="font-weight: 600; color: #1a3c6d; padding: 8px; text-align: right;">Prix Unitaire (F)</th>
            <th style="font-weight: 600; color: #1a3c6d; padding: 8px; text-align: right;">Montant Total (F)</th>
          </tr>
        </thead>
        <tbody>
          ${facture.lignes
            ?.map(
              (ligne, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fcff'};">
                  <td style="color: #2d3748; padding: 8px;">${ligne.poids || 'N/A'}</td>
                  <td style="color: #2d3748; padding: 8px;">${ligne.designation || 'N/A'}</td>
                  <td style="color: #2d3748; padding: 8px;">${ligne.destination || 'N/A'}</td>
                  <td style="color: #2d3748; padding: 8px; text-align: right;">${(ligne.prixUnitaire || 0).toFixed(2)}</td>
                  <td style="color: #2d3748; padding: 8px; text-align: right; font-weight: 500;">${(ligne.totalLigne || 0).toFixed(2)}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top: 20px; text-align: right; padding: 16px; background: #f7fafc; border-radius: 8px;">
      <p style="color: #2d3748;">Total HT: ${(facture.totalHT || 0).toFixed(2)} F</p>
      <p style="color: #2d3748; margin-top: 8px;">TVA (${facture.tva || 0}%): ${(((facture.totalHT || 0) * (facture.tva || 0)) / 100 || 0).toFixed(2)} F</p>
      <h3 style="font-weight: 700; color: #2b6cb0; margin-top: 16px;">Total TTC: ${(facture.totalTTC || 0).toFixed(2)} F</h3>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #718096; line-height: 1.5;">
      <p>Tous les chèques doivent être libellés à l'ordre de L&N ENTREPRISE / MOHAMED LEE.</p>
      <p style="margin-top: 8px;">Montant dû dans les 15 jours. Les comptes en retard sont soumis à des frais de 3% par mois.</p>
    </div>
    ${
      facture.commentaire
        ? `
          <div style="margin-top: 24px; padding: 16px; background: #f7fafc; border-radius: 8px;">
            <h3 style="font-weight: 600; color: #1a3c6d; margin-bottom: 8px;">Commentaires</h3>
            <p style="color: #718096;">${facture.commentaire}</p>
          </div>
        `
        : ''
    }
    <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #718096; font-weight: 500;">
      Merci pour votre confiance ! 🚚
    </div>
  `;
  return div;
};

export const generatePDFBase64 = async (facture: Facture): Promise<string> => {
  const div = createInvoiceHTML(facture);
  document.body.appendChild(div);
  try {
    const canvas = await html2canvas(div, {
      scale: 1.5, // Optimized for file size
      useCORS: true,
      logging: true,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG with 80% quality
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    return pdfBase64;
  } finally {
    document.body.removeChild(div);
  }
};

export const downloadPDF = async (facture: Facture) => {
  const pdfBase64 = await generatePDFBase64(facture);
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${pdfBase64}`;
  link.download = `facture-${facture.numero || 'INV-XXXX'}.pdf`;
  link.click();
};