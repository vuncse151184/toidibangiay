import { Injectable, Logger } from "@nestjs/common";
import { OpenSearchClient } from "./opensearch.client";
import { SearchProductsDto } from "./dto/search-products.dto";

const INDEX = "products";

const INDEX_MAPPING = {
  mappings: {
    properties: {
      id:           { type: "keyword" },
      name:         { type: "text", fields: { keyword: { type: "keyword" }, autocomplete: { type: "text" } } },
      description:  { type: "text" },
      brand:        { type: "text", fields: { keyword: { type: "keyword" } } },
      categoryId:   { type: "keyword" },
      categoryName: { type: "keyword" },
      tags:         { type: "keyword" },
      slug:         { type: "keyword" },
      isActive:     { type: "boolean" },
      minPrice:     { type: "float" },
      maxPrice:     { type: "float" },
      sizes:        { type: "keyword" },
      colors:       { type: "keyword" },
      imageUrl:     { type: "keyword", index: false },
      totalSold:    { type: "integer" },
      createdAt:    { type: "date" },
      updatedAt:    { type: "date" },
    },
  },
};

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly os: OpenSearchClient) {}

  async ensureIndex() {
    const exists = (await this.os.client.indices.exists({ index: INDEX })).body;
    if (!exists) {
      await this.os.client.indices.create({ index: INDEX, body: INDEX_MAPPING as any });
      this.logger.log(`Created index "${INDEX}" with mapping`);
    }
  }

  async search(params: SearchProductsDto) {
    const { q, category, brand, minPrice, maxPrice, sort = "popular", page = 1, limit = 20 } = params;
    const sizes = params.sizes?.split(",").filter(Boolean) ?? [];
    const colors = params.colors?.split(",").filter(Boolean) ?? [];

    const must: any[] = [{ term: { isActive: true } }];
    const filter: any[] = [];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ["name^4", "name.autocomplete^2", "brand^2", "description", "tags"],
          type: "best_fields",
          fuzziness: "AUTO",
          prefix_length: 1,
        },
      });
    }

    if (category) filter.push({ term: { categoryId: category } });
    if (brand)    filter.push({ term: { "brand.keyword": brand } });
    if (sizes.length)  filter.push({ terms: { sizes } });
    if (colors.length) filter.push({ terms: { colors } });
    if (minPrice !== undefined || maxPrice !== undefined)
      filter.push({ range: { minPrice: { gte: minPrice, lte: maxPrice } } });

    const sortMap: Record<string, any[]> = {
      popular:    [{ totalSold: "desc" }, { createdAt: "desc" }],
      newest:     [{ createdAt: "desc" }],
      price_asc:  [{ minPrice: "asc" }],
      price_desc: [{ maxPrice: "desc" }],
      relevance:  ["_score", { totalSold: "desc" }],
    };

    const response = await this.os.client.search({
      index: INDEX,
      body: {
        query: { bool: { must, filter } },
        sort: sortMap[sort] ?? sortMap.popular,
        from: (page - 1) * limit,
        size: limit,
        aggs: {
          brands:     { terms: { field: "brand.keyword", size: 30 } },
          sizes:      { terms: { field: "sizes",         size: 20 } },
          colors:     { terms: { field: "colors",        size: 20 } },
          categories: { terms: { field: "categoryName",  size: 20 } },
          priceStats: { stats: { field: "minPrice" } },
        },
      },
    });

    const body = response.body as any;
    const total = typeof body.hits.total === "number" ? body.hits.total : body.hits.total?.value ?? 0;

    return {
      products: body.hits.hits.map((h: any) => ({ id: h._id, ...h._source })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets: {
        brands:     body.aggregations?.brands?.buckets ?? [],
        sizes:      body.aggregations?.sizes?.buckets ?? [],
        colors:     body.aggregations?.colors?.buckets ?? [],
        categories: body.aggregations?.categories?.buckets ?? [],
        priceStats: body.aggregations?.priceStats ?? {},
      },
    };
  }

  async suggest(q: string): Promise<string[]> {
    if (!q || q.length < 2) return [];
    const response = await this.os.client.search({
      index: INDEX,
      body: {
        query: {
          bool: {
            must: [
              { term: { isActive: true } },
              { multi_match: { query: q, fields: ["name.autocomplete", "brand"], type: "phrase_prefix" } },
            ],
          },
        },
        _source: ["name"],
        size: 8,
      },
    });
    const body = response.body as any;
    const seen = new Set<string>();
    return body.hits.hits
      .map((h: any) => h._source.name as string)
      .filter((n: string) => !seen.has(n) && seen.add(n));
  }

  async indexProduct(product: any) {
    await this.os.client.index({ index: INDEX, id: product.id, body: this.toDoc(product), refresh: "wait_for" });
    this.logger.log(`Indexed ${product.id}: ${product.name}`);
  }

  async deleteProduct(id: string) {
    try {
      await this.os.client.delete({ index: INDEX, id, refresh: "wait_for" });
      this.logger.log(`Deleted ${id}`);
    } catch (err: any) {
      if (err?.meta?.statusCode !== 404) throw err;
    }
  }

  async bulkIndex(products: any[]) {
    await this.ensureIndex();
    const body = products.flatMap((p) => [{ index: { _index: INDEX, _id: p.id } }, this.toDoc(p)]);
    const response = await this.os.client.bulk({ body, refresh: "wait_for" });
    const result = response.body as any;
    if (result.errors) this.logger.error("Bulk index had errors");
    return result;
  }

  private toDoc(p: any) {
    const prices = p.variants?.map((v: any) => v.price).filter(Boolean) ?? [];
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      brand: p.brand ?? "",
      categoryId: p.categoryId ?? "",
      categoryName: p.category?.name ?? "",
      tags: p.tags ?? [],
      slug: p.slug,
      isActive: p.isActive ?? true,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      sizes: [...new Set(p.variants?.map((v: any) => v.size).filter(Boolean) ?? [])],
      colors: [...new Set(p.variants?.map((v: any) => v.color).filter(Boolean) ?? [])],
      imageUrl: p.images?.[0]?.url ?? "",
      totalSold: p.totalSold ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
