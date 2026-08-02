import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerRequestDto } from '../dtos/requests/create-customer.request.dto';
import { UpdateCustomerRequestDto } from '../dtos/requests/update-customer.request.dto';
import { UpdateCustomerStatusRequestDto } from '../dtos/requests/update-customer-status.request.dto';
import { PaginationRequestDto } from 'src/core/dtos/pagination/pagination.request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { HandleServiceError } from 'src/core/decorators/handle-service-error.decorator';

@ApiTags('👥 Clientes')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ResponseMessage('Cliente creado exitosamente')
  @HandleServiceError('Error al crear el cliente')
  async create(@Body() createCustomerDto: CreateCustomerRequestDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar clientes con paginación' })
  @ResponseMessage('Clientes obtenidos exitosamente')
  @HandleServiceError('Error al listar clientes')
  async findAll(@Query() query: PaginationRequestDto) {
    return this.customersService.findAll(query);
  }

  @Get('next-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener el siguiente código de cliente' })
  @ResponseMessage('Siguiente código obtenido exitosamente')
  @HandleServiceError('Error al obtener el siguiente código')
  async getNextCode() {
    return this.customersService.getNextCode();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ResponseMessage('Cliente obtenido exitosamente')
  @HandleServiceError('Error al obtener el cliente')
  async findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar cliente' })
  @ResponseMessage('Cliente actualizado exitosamente')
  @HandleServiceError('Error al actualizar el cliente')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerRequestDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar estado del cliente' })
  @ResponseMessage('Estado del cliente actualizado exitosamente')
  @HandleServiceError('Error al actualizar el estado del cliente')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCustomerStatusRequestDto,
  ) {
    return this.customersService.updateStatus(id, updateStatusDto);
  }
}
