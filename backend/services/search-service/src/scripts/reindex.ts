/**
 * Bulk reindex all active products into OpenSearch.
 * Run from search-service: npm run reindex
 * Requires PRODUCT_SERVICE_URL and OPENSEARCH_ENDPOINT in .env
 */
import "dotenv/config";
import { OpenSearchClient } from "../modules/search/opensearch.client";
import { SearchService } from "../modules/search/search.service";

const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL ?? "http://localhost:4001";
const PAGE_SIZE = 100;

async function fetchAllProducts(): Promise<any[]> {
  const products: any[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${PRODUCT_URL}/products?page=${page}&limit=${PAGE_SIZE}`);
    if (!res.ok) throw new Error(`product-service error: ${res.status}`);
    const json = await res.json() as any;
    const items: any[] = json.data ?? [];
    products.push(...items);
    if (items.length < PAGE_SIZE) break;
    page++;
  }
  return products;
}

async function main() {
  const service = new SearchService(new OpenSearchClient());
  const products = await fetchAllProducts();
  console.log(`Reindexing ${products.length} products...`);

  const CHUNK = 500;
  for (let i = 0; i < products.length; i += CHUNK) {
    await service.bulkIndex(products.slice(i, i + CHUNK));
    console.log(`  ${Math.min(i + CHUNK, products.length)} / ${products.length}`);
  }
  console.log("Done!");
}

main().catch((e) => { console.error(e); process.exit(1); });