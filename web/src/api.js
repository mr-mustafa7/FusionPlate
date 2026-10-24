export async function fuse(fridgeFile, cravingFile) {
  const form = new FormData();
  form.append("fridge", fridgeFile);
  form.append("craving", cravingFile);

  const res = await fetch("/api/fuse", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function extractOnly(fridgeFile, cravingFile) {
  const form = new FormData();
  form.append("fridge", fridgeFile);
  form.append("craving", cravingFile);

  const res = await fetch("/api/extract", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function health() {
  const res = await fetch("/api/health");
  return res.json();
}
