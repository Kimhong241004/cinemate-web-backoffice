# Internationalization (i18n) Implementation

This project includes full bilingual support for **English** and **Khmer** languages.

## 📁 Project Structure

```
src/
├── i18n/
│   ├── en.ts          # English translations
│   ├── km.ts          # Khmer translations (ភាសាខ្មែរ)
│   ├── index.ts       # Export all translations
│   └── README.md      # This file
├── app/
│   └── context/
│       └── LanguageContext.tsx  # Language state management
```

## 🌍 Features

- **Complete Translation Coverage**: 100% of UI text is translated
- **Persistent Language Selection**: User's language choice is saved to localStorage
- **Easy Language Switching**: Click the language button in the navbar
- **Type-Safe Translations**: Full TypeScript support with autocomplete
- **Default Language**: Khmer (🇰🇭)

## 🎯 How to Use

### For Users

1. **Switch Language**: Click the flag button (🇰🇭 or 🇬🇧) in the top navigation bar
2. **Select Language**: Choose between "ភាសាខ្មែរ" (Khmer) or "English"
3. **Automatic Save**: Your selection is saved and persists across sessions

### For Developers

#### Using Translations in Components

1. Import the `useLanguage` hook:
```tsx
import { useLanguage } from '../context/LanguageContext';
```

2. Use the hook in your component:
```tsx
const MyComponent = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <p>{t.dashboard.welcome}</p>
    </div>
  );
};
```

#### Available Translation Keys

Access translations using the `t` object:

```tsx
// Common
t.common.search
t.common.cancel
t.common.delete
t.common.save

// Navbar
t.navbar.profile
t.navbar.settings
t.navbar.logout

// Sidebar
t.sidebar.menu.dashboard
t.sidebar.menu.userManagement
t.sidebar.sections.overview

// Dashboard
t.dashboard.title
t.dashboard.welcome
t.dashboard.stats.totalUsers

// User Management
t.userManagement.title
t.userManagement.searchPlaceholder
t.userManagement.table.phone
```

#### Adding New Translations

1. Add the key to `src/i18n/en.ts`:
```typescript
export const en = {
  // ... existing translations
  myNewSection: {
    title: 'My New Title',
    description: 'My description',
  },
};
```

2. Add the corresponding Khmer translation to `src/i18n/km.ts`:
```typescript
export const km = {
  // ... existing translations
  myNewSection: {
    title: 'ចំណងជើងថ្មី',
    description: 'ការពិពណ៌នា',
  },
};
```

3. Use it in your component:
```tsx
<h1>{t.myNewSection.title}</h1>
```

## 🔧 Language API

### `useLanguage()` Hook

Returns:
- `language`: Current language code ('en' | 'km')
- `setLanguage`: Function to change language
- `t`: Translation object with all text

Example:
```tsx
const { language, setLanguage, t } = useLanguage();

// Get current language
console.log(language); // 'km' or 'en'

// Change language
setLanguage('en'); // Switch to English
setLanguage('km'); // Switch to Khmer
```

## 📝 Translation Coverage

### ✅ Fully Translated Components

- ✅ Navbar
- ✅ Sidebar
- ✅ Dashboard
- ✅ User Management (complete with all modals)
- ✅ Login
- ✅ Profile Settings
- ✅ Settings
- ✅ Content Library
- ✅ Subscriptions
- ✅ Transactions
- ✅ Promo Codes
- ✅ Movies
- ✅ TV Channels
- ✅ Radio
- ✅ Creators
- ✅ Author
- ✅ User System
- ✅ Not Found (404)

## 🎨 UI/UX Features

- **Flag Icons**: Visual representation (🇰🇭 for Khmer, 🇬🇧 for English)
- **Dropdown Menu**: Clean language selection interface
- **Active State**: Highlighted current language
- **Smooth Transitions**: No page reload required
- **Persistent State**: Language choice saved across sessions

## 🚀 Performance

- **Lazy Loading**: Translations loaded only when needed
- **Type Safety**: Full TypeScript support prevents errors
- **Optimized**: Minimal bundle size impact

## 🔒 Type Safety

All translations are fully typed using TypeScript:

```typescript
type Language = 'en' | 'km';
type TranslationKeys = typeof en;
```

This provides:
- Autocomplete in your IDE
- Compile-time error checking
- Prevents typos in translation keys

## 📱 Supported Languages

| Language | Code | Default | Flag |
|----------|------|---------|------|
| Khmer (ភាសាខ្មែរ) | `km` | ✅ Yes | 🇰🇭 |
| English | `en` | No | 🇬🇧 |

## 🛠️ Maintenance

When adding new features:

1. Add English text to `src/i18n/en.ts`
2. Add Khmer translation to `src/i18n/km.ts`
3. Use `t.yourKey` in components instead of hardcoded strings
4. Test both languages to ensure proper display

## 💡 Best Practices

1. **Never hardcode text**: Always use translation keys
2. **Consistent naming**: Use clear, descriptive keys
3. **Organize logically**: Group related translations
4. **Test both languages**: Ensure both work properly
5. **Consider context**: Some words need different translations based on context

## 🎯 Example Implementation

Complete example of a translated component:

```tsx
import { useLanguage } from '../context/LanguageContext';

const ExamplePage = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <p>{t.dashboard.welcome}</p>
      
      <button>{t.common.save}</button>
      <button>{t.common.cancel}</button>
    </div>
  );
};
```

---

**Note**: This implementation provides 100% translation coverage for all existing components. New components should follow the same pattern using the `useLanguage()` hook.
