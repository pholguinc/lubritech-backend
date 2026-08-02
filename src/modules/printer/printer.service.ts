import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import { Readable } from 'stream';
import * as pdfMakeImport from 'pdfmake';

interface IPdfKitDocument extends Readable {
  end(): void;
}

interface IPdfMake {
  setFonts(fonts: TFontDictionary): void;
  setUrlAccessPolicy?(cb: (url: string) => boolean): void;
  setLocalAccessPolicy?(cb: (url: string) => boolean): void;
  createPdf(docDefinition: TDocumentDefinitions): {
    getStream(): Promise<IPdfKitDocument>;
  };
}

const pdfMake = pdfMakeImport as unknown as IPdfMake;

const fontsDir = path.join(process.cwd(), 'src', 'assets', 'fonts');

const fonts: TFontDictionary = {
  Roboto: {
    normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
    bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
    italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
    bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
  },
};

export interface TicketData {
  ticketNumber: string;
  date: string;
  customerName: string;
  customerDoc: string;
  items: Array<{
    quantity: number;
    description: string;
    subtotal: string;
  }>;
  total: string;
}

@Injectable()
export class PrinterService {
  constructor() {
    pdfMake.setFonts(fonts);
    if (pdfMake.setUrlAccessPolicy) {
      pdfMake.setUrlAccessPolicy(() => true);
    }
    if (pdfMake.setLocalAccessPolicy) {
      pdfMake.setLocalAccessPolicy(() => true);
    }
  }

  async createPdf(docDefinition: TDocumentDefinitions): Promise<Readable> {
    const doc = pdfMake.createPdf(docDefinition);
    const stream = await doc.getStream();

    stream.end();
    return stream;
  }

  async generateTicketPdf(data: TicketData): Promise<Buffer> {
    const fs = require('fs');
    const handlebars = require('handlebars');
    const puppeteer = require('puppeteer');

    const templatePath = path.join(process.cwd(), 'src', 'assets', 'templates', 'ticket.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    
    const template = handlebars.compile(templateHtml);
    const html = template(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const bodyHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    // Configurar el PDF para formato ticket 80mm
    const pdfBuffer = await page.pdf({
      width: '80mm',
      height: `${bodyHeight}px`,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
