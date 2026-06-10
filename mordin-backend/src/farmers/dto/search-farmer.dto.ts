import { BaseSearchDto } from "src/common/dto/base-search.dto";

export class SearchFarmerDto extends BaseSearchDto {
    override sortBy?: string = 'farmerId';
}
