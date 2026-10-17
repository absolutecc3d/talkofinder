
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const token = String(req.body?.token ?? "").trim();
    const id = String(req.body?.discordId ?? "").trim();

    if (!token) {
      return res.status(400).json({ error: "Enter your Discord bot token." });
    }

    if (!/^\d{17,20}$/.test(id)) {
      return res.status(400).json({ error: "Invalid Discord user ID." });
    }

    const response = await fetch(
      `https://discord.com/api/v10/users/${id}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
          "User-Agent": "TalkomaticAvatarGenerator/1.0"
        }
      }
    );

    const user = await response.json();

    if (!response.ok) {
      return res.status(response.status === 401 ? 401 : 400).json({
        error:
          response.status === 401
            ? "Invalid Discord bot token."
            : user.message || `Discord API error: ${response.status}`
      });
    }

    if (!user.avatar) {
      return res.status(200).json({
        discordId: user.id,
        hash: null,
        animated: false,
        message: "This user has no custom avatar."
      });
    }

    return res.status(200).json({
      discordId: user.id,
      hash: user.avatar,
      animated: user.avatar.startsWith("a_")
    });
  } catch {
    return res.status(500).json({
      error: "Server error while contacting Discord."
    });
  }
}
