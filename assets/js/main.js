// Main JavaScript for the City Events Guide

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Apply the saved theme on page load
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            
            // Switch theme
            if (theme === 'dark') {
                theme = 'light';
            } else {
                theme = 'dark';
            }
            
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme); // Save the new theme
        });
    }
});
