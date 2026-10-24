function appendInput(form, fileField, textField, value) {
  if (value instanceof File) {
    form.append(fileField, value);
  } else {
    form.append(textField, value);
  }
}

export async function fuse(fridge, craving, { spookify = false, dietary = [], servings = 2 } = {}) {
  const form = new FormData();
  appendInput(form, "fridge", "fridgeText", fridge);
  appendInput(form, "craving", "cravingText", craving);
  form.append("spookify", String(spookify));
  form.append("dietary", JSON.stringify(dietary));
  form.append("servings", String(servings));

  const res = await fetch("/api/fuse", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function extractOnly(fridge, craving) {
  const form = new FormData();
  appendInput(form, "fridge", "fridgeText", fridge);
  appendInput(form, "craving", "cravingText", craving);

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
