document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const tabContent = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.tabTarget);

            tabContent.forEach(content => {
                content.classList.remove('active');
            });

            tabs.forEach(t => {
                t.classList.remove('active');
            });

            tab.classList.add('active');
            target.classList.add('active');
        });
    });
});
