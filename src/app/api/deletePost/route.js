export default async function handler(req, res) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { postId } = req.query;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const url = `https://graph.facebook.com/${postId}?access_token=${ACCESS_TOKEN}`;

  const response = await fetch(url, { method: "DELETE" });
  const data = await response.json();

  res.status(200).json(data);
}
