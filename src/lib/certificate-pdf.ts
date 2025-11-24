import { jsPDF } from 'jspdf';
import type { Certificate, User } from '@/types';

interface GenerateCertificatePdfOptions {
  certificate: Certificate;
  participant: User;
  logoUrl?: string;
}

interface LogoInfo {
  dataUrl: string;
  width: number;
  height: number;
}

let cachedLogoInfo: LogoInfo | null = null;

const loadLogoInfo = async (logoUrl: string): Promise<LogoInfo | null> => {
  if (cachedLogoInfo) {
    return cachedLogoInfo;
  }

  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const reader = new FileReader();

    const dataUrl: string = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Criar uma imagem para obter as dimensões reais
    const img = new Image();
    const imgInfo: LogoInfo = await new Promise((resolve, reject) => {
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });

    cachedLogoInfo = imgInfo;
    return imgInfo;
  } catch (error) {
    console.warn('Não foi possível carregar o logo do certificado:', error);
    return null;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(date);
};

export const generateCertificatePdf = async ({
  certificate,
  participant,
  logoUrl = '/ifpass.png',
}: GenerateCertificatePdfOptions) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 60; // Margens maiores

  // Fundo branco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Carregar logo com dimensões corretas e posicionar no topo centralizado
  const logoInfo = await loadLogoInfo(logoUrl);
  let logoHeight = 0;
  if (logoInfo) {
    // Calcular proporção mantendo aspect ratio
    const maxLogoWidth = 280;
    const maxLogoHeight = 100;
    const aspectRatio = logoInfo.width / logoInfo.height;
    
    let logoWidth = maxLogoWidth;
    logoHeight = maxLogoWidth / aspectRatio;
    
    if (logoHeight > maxLogoHeight) {
      logoHeight = maxLogoHeight;
      logoWidth = maxLogoHeight * aspectRatio;
    }

    // Posicionar logo no topo centralizado
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = margin;
    doc.addImage(
      logoInfo.dataUrl,
      'PNG',
      logoX,
      logoY,
      logoWidth,
      logoHeight,
    );
  }

  // Título (posicionado após o logo)
  const titleY = margin + (logoHeight > 0 ? logoHeight + 40 : 80);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(30);
  doc.text('Certificado de Participação', pageWidth / 2, titleY, { align: 'center' });

  // Texto introdutório
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.text('Certificamos que', pageWidth / 2, titleY + 50, { align: 'center' });

  // Nome do participante
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text(participant.fullName.toUpperCase(), pageWidth / 2, titleY + 100, { align: 'center' });

  // Texto de participação
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  const eventName = certificate.event.name;
  const eventDate = formatDate(certificate.event.date);
  const eventLocation = certificate.event.location;

  const participationText = `participou do evento "${eventName}" realizado em ${eventLocation}, no dia ${eventDate}.`;
  const textLines = doc.splitTextToSize(participationText, pageWidth - margin * 4);
  doc.text(textLines, pageWidth / 2, titleY + 160, { align: 'center' });

  // Número do certificado
  doc.setFontSize(16);
  doc.text(
    `Certificado nº ${certificate.certificateNumber}`,
    pageWidth / 2,
    pageHeight - margin - 100,
    { align: 'center' },
  );

  // Data de emissão
  doc.setFontSize(14);
  doc.text(
    `Emitido em ${formatDate(certificate.issuedAt)}`,
    pageWidth / 2,
    pageHeight - margin - 70,
    { align: 'center' },
  );

  // Token de verificação (embaixo, letra menor)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Token de verificação: ${certificate.verificationToken}`,
    pageWidth / 2,
    pageHeight - margin - 40,
    { align: 'center' },
  );

  doc.save(`certificado-${certificate.certificateNumber}.pdf`);
};

