import { Injectable, NotFoundException } from '@nestjs/common';
import { SalesRepository } from '../repositories/sales.repository';
import { CreateSaleRequestDto } from '../dtos/requests/create-sale.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { PrinterService } from '../../printer/printer.service';

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly printerService: PrinterService,
  ) {}

  findAll(query: PaginationRequestDto) {
    return this.salesRepository.findAll(query);
  }

  findById(id: string) {
    return this.salesRepository.findById(id);
  }

  create(data: CreateSaleRequestDto) {
    return this.salesRepository.create(data);
  }

  async generateTicketPdf(id: string): Promise<Buffer> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    const data = {
      ticketNumber: `VENTA-${sale.id.split('-')[0].toUpperCase()}`,
      date: new Date(sale.date).toLocaleDateString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      customerName: sale.customer ? sale.customer.name : 'Cliente General',
      customerDoc: sale.customer?.documentNumber || 'N/A',
      items: sale.items.map(item => ({
        quantity: item.quantity,
        description: item.description,
        subtotal: item.subtotal.toFixed(2),
      })),
      total: sale.total.toFixed(2),
    };

    return this.printerService.generateTicketPdf(data);
  }
}
