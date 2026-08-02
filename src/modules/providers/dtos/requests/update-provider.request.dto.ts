import { PartialType } from '@nestjs/swagger';
import { CreateProviderRequestDto } from './create-provider.request.dto';

export class UpdateProviderRequestDto extends PartialType(CreateProviderRequestDto) {}