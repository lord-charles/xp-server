import { PartialType } from '@nestjs/swagger';
import { CreateWeatherDataDto } from './create-weather-data.dto';

export class UpdateWeatherDataDto extends PartialType(CreateWeatherDataDto) {}
