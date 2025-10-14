// Main JavaScript for the City Events Guide

document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    const themeToggle = document.querySelector('.theme-toggle input');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);

        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    }

    themeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Scroll to top button logic
    const scrollToTopBtn = document.querySelector('.scroll-to-top');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Event Gallery
    const mainImage = document.getElementById('mainEventImage');
    const thumbnails = document.querySelectorAll('.hero-gallery .thumbnail-gallery .img-thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            // Set the main image src to the clicked thumbnail's src
            mainImage.src = this.src;

            // Update the active class
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Draggable categories section
    const categoriesContent = document.querySelector('.categories-content');
    if (categoriesContent) {
        let isDown = false;
        let startX;
        let scrollLeft;

        categoriesContent.addEventListener('mousedown', (e) => {
            isDown = true;
            categoriesContent.classList.add('active');
            startX = e.pageX - categoriesContent.offsetLeft;
            scrollLeft = categoriesContent.scrollLeft;
            categoriesContent.style.cursor = 'grabbing';
        });

        categoriesContent.addEventListener('mouseleave', () => {
            isDown = false;
            categoriesContent.classList.remove('active');
            categoriesContent.style.cursor = 'grab';
        });

        categoriesContent.addEventListener('mouseup', () => {
            isDown = false;
            categoriesContent.classList.remove('active');
            categoriesContent.style.cursor = 'grab';
        });

        categoriesContent.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - categoriesContent.offsetLeft;
            const walk = (x - startX) * 2; //scroll-fast
            const dir = document.documentElement.getAttribute('dir') || 'ltr';
            if (dir === 'rtl') {
                categoriesContent.scrollLeft = scrollLeft + walk;
            } else {
                categoriesContent.scrollLeft = scrollLeft - walk;
            }
        });
    }
});
