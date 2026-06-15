import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";
import { SearchProductsDto } from "./dto/search-products.dto";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() dto: SearchProductsDto) {
    return this.searchService.search(dto);
  }

  @Get("suggest")
  suggest(@Query("q") q: string) {
    return this.searchService.suggest(q ?? "");
  }
}