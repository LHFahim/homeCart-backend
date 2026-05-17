import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum Sort {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationPageOnlyQueryDto {
  @ApiProperty({ required: false, type: Number, default: 1 })
  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @ApiProperty({ required: false, type: Number, default: 20 })
  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize = 20;
}

export class PaginationQueryDto extends PaginationPageOnlyQueryDto {
  @ApiProperty({ required: false })
  @Expose()
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ required: false, default: 'createdAt' })
  @Expose()
  @IsString()
  @IsOptional()
  @IsString()
  sortBy: string;

  @ApiProperty({ enum: Sort, required: false, default: Sort.DESC })
  @Expose()
  @IsEnum(Sort)
  @IsOptional()
  @IsEnum(Sort)
  sort: Sort;
}
