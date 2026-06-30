import { Expose } from 'class-transformer';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { HouseholdEntity } from '../entities/household.entity';

export class HouseholdDto extends HouseholdEntity {}

export class HouseholdQueryDto extends PaginationQueryDto {}

export class HouseholdPaginatedDto {
  @Expose()
  items: HouseholdDto[];

  @Expose()
  pagination: PaginationDto;
}
