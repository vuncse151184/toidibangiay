import { Module } from "@nestjs/common";
import { SearchModule, SearchConsumerModule } from "./modules/search/search.module";

@Module({ imports: [SearchModule, SearchConsumerModule] })
export class AppModule {}