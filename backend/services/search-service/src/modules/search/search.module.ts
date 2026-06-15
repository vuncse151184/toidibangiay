import { Module } from "@nestjs/common";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { OpenSearchClient } from "./opensearch.client";
import { SearchService } from "./search.service";
import { SearchConsumer } from "./search.consumer";
import { SearchController } from "./search.controller";

@Module({
  providers: [OpenSearchClient, SearchService],
  exports: [OpenSearchClient, SearchService],
  controllers: [SearchController],
})
export class SearchModule {}

@Module({
  imports: [
    SearchModule,
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL!,
      exchanges: [{ name: "products", type: "topic" }],
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [SearchConsumer],
})
export class SearchConsumerModule {}