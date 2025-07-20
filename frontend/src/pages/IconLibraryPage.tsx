import { useState } from 'react';

interface Icon {
  name: string;
  svg: string;
  category: string;
}

const icons: Icon[] = [
  {
    name: 'Eye (Visible)',
    category: 'UI',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2"/>
  <path d="M20 12C20 12 18 17 12 17C6 17 4 12 4 12C4 12 6 7 12 7C18 7 20 12 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>`
  },
  {
    name: 'Eye Off (Hidden)',
    category: 'UI',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 12C20 12 18 17 12 17C6 17 4 12 4 12C4 12 6 7 12 7C18 7 20 12 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2"/>
  <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>`
  },
  {
    name: 'Dice',
    category: 'Actions',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9c-.83 0-1.5-.67-1.5-1.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/>
</svg>`
  }
];

export function IconLibraryPage() {
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(icons.map(icon => icon.category)))];

  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = async (iconName: string, svg: string) => {
    try {
      await navigator.clipboard.writeText(svg);
      setCopiedIcon(iconName);
      setTimeout(() => setCopiedIcon(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-term-white mb-2">ICON LIBRARY</h1>
          <p className="text-term-gray">Terminal-style SVG icons for reference</p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-transparent border border-term-gray-dark px-3 py-2 text-term-white focus:outline-none focus:border-term-white"
            />

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 border transition-colors ${
                    selectedCategory === category
                      ? 'border-term-white bg-term-white text-black'
                      : 'border-term-gray-dark text-term-gray hover:border-term-gray hover:text-term-white'
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIcons.map((icon) => (
            <div
              key={icon.name}
              className="border border-term-gray-dark p-6 hover:border-term-gray transition-colors"
            >
              {/* Icon Display */}
              <div className="flex justify-center mb-4 h-12">
                <div 
                  className="text-term-white [&>svg]:w-10 [&>svg]:h-10"
                  dangerouslySetInnerHTML={{ __html: icon.svg }} 
                />
              </div>

              {/* Icon Info */}
              <div className="space-y-2">
                <h3 className="text-term-white font-medium text-center">{icon.name}</h3>
                <p className="text-xs text-term-gray text-center">{icon.category}</p>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(icon.name, icon.svg)}
                className={`mt-4 w-full py-2 px-4 border transition-all ${
                  copiedIcon === icon.name
                    ? 'border-term-green text-term-green'
                    : 'border-term-gray-dark text-term-gray hover:border-term-white hover:text-term-white'
                }`}
              >
                {copiedIcon === icon.name ? 'COPIED!' : 'COPY SVG'}
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIcons.length === 0 && (
          <div className="text-center py-16">
            <p className="text-term-gray">No icons found matching your criteria</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-term-gray hover:text-term-white transition-colors"
          >
            ← Back to App
          </button>
        </div>

        {/* Copy Notification */}
        {copiedIcon && (
          <div className="fixed bottom-8 right-8 bg-term-green text-black px-4 py-2 font-medium animate-pulse">
            Copied {copiedIcon} to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}