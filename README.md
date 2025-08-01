# Admin Dashboard Frontend

A modern, responsive admin dashboard built with React, TypeScript, Tailwind CSS, and ShadCN UI.

## 🚀 Features

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **ShadCN UI** for beautiful, accessible components
- **GSAP** for smooth animations
- **Lucide React** for modern icons
- **Dark mode** support
- **Responsive design** for all devices

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Animations**: GSAP
- **Icons**: Lucide React
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd adminfrontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
adminfrontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx          # ShadCN UI Button component
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles with Tailwind
├── public/                         # Static assets
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies and scripts
```

## 🎨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Key Features

### Modern UI Components
- Built with ShadCN UI for consistent, accessible components
- Customizable design system with CSS variables
- Dark mode support out of the box

### Smooth Animations
- GSAP-powered animations for enhanced user experience
- Staggered animations for card elements
- Smooth transitions and hover effects

### Type Safety
- Strict TypeScript configuration
- Proper type definitions for all components
- Path aliases for clean imports (`@/` prefix)

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive grid layouts
- Optimized for all screen sizes

## 🎨 Customization

### Colors and Theme
The project uses CSS custom properties for theming. You can customize colors in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more color variables */
}
```

### Adding New Components
1. Create new components in `src/components/`
2. Use the `cn()` utility function for class merging
3. Follow ShadCN UI patterns for consistency

### Styling
- Use Tailwind CSS classes for styling
- Leverage the design system colors and spacing
- Use the `cn()` utility for conditional classes

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and ShadCN UI
