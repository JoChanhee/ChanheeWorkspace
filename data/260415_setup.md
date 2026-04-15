# Setup Guide 🛠️

Setting up this Markdown Reader is incredibly simple. 

## Requirements

- A modern web browser 🌍
- Local web server (for fetching the `documents.json` and `.md` files)

## How to Run Locally

If you just open `index.html` as a file (i.e. `file://`), CORS policies might prevent the fetch API from loading the JSON or Markdown files. To avoid this, run a simple local HTTP server.

### Python 3
```bash
python3 -m http.server 8000
```

### Node.js (http-server)
```bash
npx http-server
```

Then visit [http://localhost:8000](http://localhost:8000).

## Adding Documents

1. Create a `.md` file in the `docs` folder.
2. Open `documents.json` and add your file to the appropriate category:

```json
{
  "categories": [
    {
      "name": "My Category",
      "files": [
        { "title": "New File", "path": "docs/new-file.md" }
      ]
    }
  ]
}
```

That's it! Your file will now magically appear in the sidebar and be fully navigable.
