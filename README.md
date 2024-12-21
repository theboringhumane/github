# GitHub but in nextjs

A modern, feature-rich GitHub built with Next.js 13, React, and Tailwind CSS. View repositories, pull requests, issues, commits, and more with a beautiful, responsive interface.

## ✨ Features

- 🔍 **Repository Overview**
  - File tree explorer with lazy loading
  - README.md rendering with GitHub flavored markdown
  - Repository stats and metadata
  - Branch selection and management

- 📦 **Code Management**
  - File tree navigation with folder expansion
  - Branch overview with protection status
  - Commit history with conventional commit parsing
  - Emoji support for commit types

- 🎯 **Pull Requests & Issues**
  - Pull request list with status indicators
  - Issue tracking with labels
  - Comment threads and discussions
  - Review status and checks

- 💅 **Modern UI/UX**
  - Dark mode support
  - Responsive design
  - Loading skeletons with shimmer effect
  - Smooth animations and transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Integration**: GitHub REST API
- **State Management**: React Hooks
- **Markdown**: react-markdown with remark-gfm

## 🚀 Getting Started

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/github-repo-explorer.git
cd github-repo-explorer
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env.local\` file:
\`\`\`env
GITHUB_TOKEN=your_github_token_here
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables (optional) 
> Needed only for private repositories

- `GITHUB_TOKEN`: GitHub Personal Access Token with repo scope

## 📦 Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   ├── repo/              # Repository pages
│   ├── issues/            # Issues pages
│   ├── pulls/             # Pull requests pages
│   └── commits/           # Commit history pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                   # Utility functions
└── public/               # Static assets
```

## 🎨 Features in Detail

### Repository Overview
- Branch selection and management
- File tree explorer with lazy loading
- README.md rendering with GitHub flavored markdown
- Repository stats and metadata

### Code Management
- File tree navigation
- Branch overview
- Commit history with emoji support
- Conventional commit parsing

### Pull Requests & Issues
- PR list with status indicators
- Issue tracking
- Label management
- Comment threads

### UI/UX
- Dark mode support
- Responsive design
- Loading skeletons
- Smooth animations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m '✨ feat: Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification with emoji support:

- ✨ feat: New feature
- 🐛 fix: Bug fix
- 📚 docs: Documentation
- 💎 style: Code style
- ♻️ refactor: Code refactoring
- 🚀 perf: Performance improvement
- 🧪 test: Testing
- 🛠️ build: Build system
- ⚙️ ci: CI/CD
- 🧹 chore: Chores
- ⏪ revert: Revert changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [GitHub REST API](https://docs.github.com/rest) 