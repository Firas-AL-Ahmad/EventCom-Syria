document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.index-tab-link');
    const tabContents = document.querySelectorAll('.index-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.tabTarget);

            tabContents.forEach(tabContent => {
                tabContent.classList.remove('active');
            });

            tabs.forEach(tab => {
                tab.classList.remove('active');
            });

            tab.classList.add('active');
            target.classList.add('active');
        });
    });
});
