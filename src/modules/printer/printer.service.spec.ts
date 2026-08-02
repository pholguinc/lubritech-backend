import { Test, TestingModule } from '@nestjs/testing';
import { PrinterService } from './printer.service';
import pdfmake from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

jest.mock('pdfmake', () => {
  const m = {
    setFonts: jest.fn(),
    setUrlAccessPolicy: jest.fn(),
    createPdf: jest.fn(),
  };
  return {
    __esModule: true,
    default: m,
    ...m,
  };
});

interface MockPdfMake {
  setFonts: jest.Mock;
  setUrlAccessPolicy: jest.Mock;
  createPdf: jest.Mock;
}

interface MockStream {
  end: jest.Mock;
}

const mockedPdfMake = pdfmake as unknown as MockPdfMake;

describe('PrinterService', () => {
  let service: PrinterService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrinterService],
    }).compile();

    service = module.get<PrinterService>(PrinterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPdf', () => {
    it('should create a PDF stream and call end()', async () => {
      const mockStream: MockStream = {
        end: jest.fn(),
      };
      const mockDoc = {
        getStream: jest.fn().mockResolvedValue(mockStream),
      };

      mockedPdfMake.createPdf.mockReturnValue(mockDoc);

      const docDefinition: TDocumentDefinitions = {
        content: ['Test Content'],
      };

      const result = await service.createPdf(docDefinition);

      expect(mockedPdfMake.createPdf).toHaveBeenCalledWith(docDefinition);
      expect(mockDoc.getStream).toHaveBeenCalled();
      expect(mockStream.end).toHaveBeenCalled();
      expect(result).toBe(mockStream);
    });
  });
});
