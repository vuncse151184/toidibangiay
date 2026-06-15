import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";
import { SearchService } from "./search.service";

@Injectable()
export class SearchConsumer {
  private readonly logger = new Logger(SearchConsumer.name);

  constructor(private readonly searchService: SearchService) {}

  @RabbitSubscribe({ exchange: "products", routingKey: "product.created", queue: "search.product.created" })
  async onCreated(payload: any) {
    this.logger.log(`Event product.created: ${payload.id}`);
    await this.searchService.indexProduct(payload);
  }

  @RabbitSubscribe({ exchange: "products", routingKey: "product.updated", queue: "search.product.updated" })
  async onUpdated(payload: any) {
    this.logger.log(`Event product.updated: ${payload.id}`);
    await this.searchService.indexProduct(payload);
  }

  @RabbitSubscribe({ exchange: "products", routingKey: "product.deleted", queue: "search.product.deleted" })
  async onDeleted(payload: { id: string }) {
    this.logger.log(`Event product.deleted: ${payload.id}`);
    await this.searchService.deleteProduct(payload.id);
  }
}