import { BaseSearchDto } from "src/common/dto/base-search.dto";

export class SearchFertilizerMajorDto extends BaseSearchDto {
    override sortBy: string = 'fertilizerMajorId';
}