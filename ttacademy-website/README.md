# Tech Trailblazer Academy

Responsive Next.js implementation of the Tech Trailblazer Academy website. The academy has its own package manifest and lockfile, separate from the repository-root Next.js app.

## Development

```bash
npm install
npm run dev:academy
```

Run these commands from the repository root. The academy uses Next.js's default port, `http://localhost:3000/` (Next.js selects another port if 3000 is already occupied). The academy shares the root dependencies and lockfile while keeping its own Next.js config and TypeScript config. Use the header or footer navigation to visit Home, Courses, About, and Contact. Course details expand and collapse on the Courses page, and the interest/contact forms validate in the browser.

## Production build

```bash
npm run build:academy
npm run start:academy
```

Course imagery is stored in `public/design/`.
