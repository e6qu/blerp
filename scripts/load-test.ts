async function runTest() {
  const baseUrl = "http://localhost:3000";
  const tenantId = "load-test-tenant";
  const iterations = 100;
  const start = Date.now();

  console.log(`🚀 Starting load test: ${iterations} requests to ${baseUrl}`);

  const requests = Array.from({ length: iterations }).map(async (_, i) => {
    const res = await fetch(`${baseUrl}/v1/ping`, {
      headers: { "X-Tenant-Id": `${tenantId}-${i % 5}` },
    });
    return res.status;
  });

  const results = await Promise.all(requests);
  const duration = Date.now() - start;
  const successCount = results.filter((s) => s === 200).length;

  console.log(`✅ Finished in ${duration}ms`);
  console.log(`📊 Success rate: ${successCount}/${iterations}`);
  console.log(`⏱️ Avg latency: ${duration / iterations}ms`);
}

runTest().catch(console.error);
