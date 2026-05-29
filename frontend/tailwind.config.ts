import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "tertiary-fixed-dim": "#ffb2b7",
                "surface-variant": "#e0e3e5",
                "surface": "#f7f9fb",
                "surface-container-highest": "#e0e3e5",
                "primary": "#6b38d4",
                "on-tertiary-fixed": "#40000d",
                "inverse-primary": "#d0bcff",
                "secondary-fixed": "#acedff",
                "inverse-on-surface": "#eff1f3",
                "background": "#f7f9fb",
                "on-primary-fixed": "#23005c",
                "tertiary": "#b90538",
                "secondary": "#00687a",
                "error-container": "#ffdad6",
                "on-secondary-container": "#006172",
                "on-primary-fixed-variant": "#5516be",
                "error": "#ba1a1a",
                "on-tertiary": "#ffffff",
                "surface-dim": "#d8dadc",
                "primary-fixed-dim": "#d0bcff",
                "outline": "#7b7486",
                "on-secondary": "#ffffff",
                "secondary-container": "#57dffe",
                "primary-fixed": "#e9ddff",
                "tertiary-fixed": "#ffdadb",
                "on-primary-container": "#fffbff",
                "surface-container-low": "#f2f4f6",
                "surface-container-lowest": "#ffffff",
                "surface-tint": "#6d3bd7",
                "surface-container": "#eceef0",
                "surface-bright": "#f7f9fb",
                "on-error-container": "#93000a",
                "surface-container-high": "#e6e8ea",
                "on-secondary-fixed-variant": "#004e5c",
                "outline-variant": "#cbc3d7",
                "secondary-fixed-dim": "#4cd7f6",
                "on-background": "#191c1e",
                "on-error": "#ffffff",
                "on-surface": "#191c1e",
                "on-tertiary-container": "#fffbff",
                "on-primary": "#ffffff",
                "on-secondary-fixed": "#001f26",
                "on-tertiary-fixed-variant": "#92002a",
                "primary-container": "#8455ef",
                "on-surface-variant": "#494454",
                "inverse-surface": "#2d3133",
                "tertiary-container": "#dc2c4f"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "gutter": "24px",
                "unit": "4px",
                "margin-desktop": "64px",
                "margin-mobile": "20px",
                "container-max": "1440px"
            },
            fontFamily: {
                "body-md": ["Sora", "sans-serif"],
                "label-md": ["Sora", "sans-serif"],
                "headline-md": ["Sora", "sans-serif"],
                "headline-lg-mobile": ["Sora", "sans-serif"],
                "headline-lg": ["Sora", "sans-serif"],
                "body-lg": ["Sora", "sans-serif"],
                "label-sm": ["Sora", "sans-serif"],
                "display": ["Sora", "sans-serif"]
            },
            fontSize: {
                "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
                "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
                "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
                "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
                "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                "label-sm": ["12px", { lineHeight: "1.2", fontWeight: "500" }],
                "display": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }]
            }
        },
    },
    plugins: [],
};
export default config;