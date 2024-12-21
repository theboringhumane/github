export async function getRepoInfo(url: string) {
  const res = await fetch(`/api/github/repo?url=${encodeURIComponent(url)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repository info");
  }

  return res.json();
}
