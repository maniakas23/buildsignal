s, createdAt FROM reports WHERE userId = ? AND provenance = 'LIVE' ORDER BY createdAt DESC LIMIT 50").bind(userId).all();
  return trpcResult({ reports: reports.results || [] });
}

async function handleReportGet(db, userId, input) {
  const { id } = input;
  const report = await db.prepare("SELECT * FROM reports WHERE id = ? AND userId = ? AND provenance = 'LIVE'").bind(id, userId).first();
  if (!report) return trpcError("Report not found", "NOT_FOUND");
  return trpcResult(report);
}