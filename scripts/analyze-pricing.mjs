// Developer diagnostic: the application requests this analysis automatically.
import { products } from '../src/data.js';
import { createPricingService } from '../pricing-service.mjs';

const { results, evidenceVersion, summary } = await createPricingService({ products }).getLatest();
if (process.argv[2]) {
  const result = results[process.argv[2]];
  if (!result) { console.error('Unknown part ID'); process.exitCode = 2; }
  else console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Evidence version: ${evidenceVersion}\n${JSON.stringify(summary)}`);
  console.table(Object.entries(results).map(([part, result]) => ({ part, status: result.status,
    comparableQuote: result.references?.lowestComparable?.landedUnitPrice ?? '—', reason: result.headline })));
}
