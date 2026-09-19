#!/usr/bin/env node

const url = process.env.API_HEALTH_URL || 'http://localhost:4000/health/ready';

const run = async () => {
  const response = await fetch(url, { method: 'GET' });
  const text = await response.text();

  if (!response.ok) {
    console.error(`Health check failed for ${url}: ${response.status} ${response.statusText}`);
    console.error(text);
    process.exit(1);
  }

  console.log(`Health check passed for ${url}`);
  console.log(text);
};

run().catch((error) => {
  console.error(`Health check failed for ${url}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
