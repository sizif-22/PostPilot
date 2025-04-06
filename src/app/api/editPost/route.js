export default async function handler(req, res) {
     if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
   
     const { postId, message, time } = req.body;
     const ACCESS_TOKEN = process.env.ACCESS_TOKEN;   
     const url = `https://graph.facebook.com/${postId}?access_token=${ACCESS_TOKEN}`;
     const body = JSON.stringify({ message, scheduled_publish_time: time });
   
     const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
     const data = await response.json();
   
     res.status(200).json(data);
   }
   