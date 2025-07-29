import Snippet from "../models/Snippet.js";

// GET all snippets (sorted by latest)
export const getAllSnippets = async (req, res) => {
  try {
    const { language, tags, search } = req.query;

    const filter = {};

    if (language) {
      filter.language = language;
    }

    if (tags) {
      const tagsArray = tags.split(",").map(tag => tag.trim());
      filter.tags = { $all: tagsArray };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const snippets = await Snippet.find(filter).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch snippets" });
  }
};

// POST create snippet (Admin only)
export const createSnippet = async (req, res) => {
  const { title, code, language, description, tags } = req.body;

  if (!title || !code || !language) {
    return res.status(400).json({ message: "Title, code, and language are required." });
  }

  try {
    const snippet = await Snippet.create({
      title,
      code,
      language,
      description: description || "",
      tags: tags || [],
      createdBy: req.admin?.email || "unknown",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Snippet created", snippet });
  } catch (err) {
    console.error("Create Snippet Error:", err);
    res.status(500).json({ message: "Failed to create snippet" });
  }
};

// PUT update snippet by ID
export const updateSnippet = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await Snippet.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Snippet not found" });
    res.status(200).json({ message: "Snippet updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update snippet" });
  }
};

// DELETE snippet by ID
export const deleteSnippet = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Snippet.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Snippet not found" });
    res.status(200).json({ message: "Snippet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete snippet" });
  }
};
