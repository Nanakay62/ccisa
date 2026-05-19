import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Backend API route/controller for deletion with error handling
  app.delete("/api/books/:id", async (req, res) => {
    try {
      const bookId = req.params.id;
      
      if (!bookId) {
        return res.status(400).json({ error: "Book ID is required" });
      }
      
      // In a real application, database operations like removing from PostgreSQL/Supabase 
      // or clearing local chunks from Redis/S3 would happen here.
      // E.g., awawit supabase.from('books').delete().eq('id', bookId)
      
      console.log(`Backend API: Attempting to delete book payload/reference chunks for ID: ${bookId}`);

      res.status(200).json({ success: true, message: `Document ${bookId} successfully deleted` });
    } catch (error) {
      console.error("Backend error during deletion:", error);
      res.status(500).json({ error: "Internal server error during deletion" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
