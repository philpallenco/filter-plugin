// Main function to initialise the list section filters

function initialiseListSectionFilters() {
    // Cache DOM elements for better performance
    const targetBlock = document.querySelector('#filtered-list-section');
    if (!targetBlock) return;

    const cache = {
        targetBlock,
        listSection: null,
        searchBar: null,
        categorySelect: null,
        pricingSelect: null,
        sortingSelect: null,
        listItems: []
    };

    // Helper function to find the intended list section using the targeting block
    function findListSection() {
        if (cache.listSection) return cache.listSection;
        cache.listSection = targetBlock.closest('section')?.nextElementSibling;
        return cache.listSection;
    }

    // Debounce helper for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Helper function to create filter input/select elements
    function createFilterElement(config) {
        const { type, id, placeholder, options, eventHandler } = config;
        const wrapper = document.createElement('div');
        wrapper.id = `${id}-wrapper`;
        wrapper.classList.add('form-item', 'field', type);

        let inputElement;
        if (type === 'text') {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.placeholder = placeholder;
            inputElement.id = id;
            inputElement.addEventListener('input', eventHandler);
        } else if (type === 'select') {
            inputElement = document.createElement('select');
            inputElement.id = id;
            inputElement.addEventListener('change', eventHandler);

            // Add options
            options.forEach(({ value, text }) => {
                const option = document.createElement('option');
                option.value = value;
                option.innerText = text;
                inputElement.appendChild(option);
            });

            // Add dropdown icon for select elements
            const dropdownIcon = document.createElement('div');
            dropdownIcon.classList.add('select-dropdown-icon');
            dropdownIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.439453 1.49825L1.56057 0.501709L9.00001 8.87108L16.4395 0.501709L17.5606 1.49825L9.00001 11.1289L0.439453 1.49825Z"></path></svg>';
            wrapper.appendChild(inputElement);
            wrapper.appendChild(dropdownIcon);
        }

        // Add form styling effects
        const formStylings = document.createElement('span');
        formStylings.classList.add('form-input-effects');
        formStylings.innerHTML = '<span class="form-input-effects-border"></span>';

        if (type === 'text') {
            wrapper.appendChild(inputElement);
        }
        wrapper.appendChild(formStylings);

        return { wrapper, element: inputElement };
    }

    // Helper function to create the filter components and add them to the list section
    function addFilterComponents(listSection) {
        const filterWrapper = document.createElement('div');
        filterWrapper.id = 'list-section-filter-wrapper';
        filterWrapper.classList.add('sqs-block-form');

        const debouncedUpdate = debounce(updateListSection, 300);

        // Adding the search bar if it is enabled
        if (targetBlock.getAttribute('data-search-enabled') === 'true') {
            const { wrapper, element } = createFilterElement({
                type: 'text',
                id: 'list-section-search-bar',
                placeholder: 'Search items...',
                eventHandler: debouncedUpdate
            });
            cache.searchBar = element;
            filterWrapper.appendChild(wrapper);
        }
        // Adding the category select bar if it is enabled (will be populated later)
        if (targetBlock.getAttribute('data-categories-enabled') === 'true') {
            const { wrapper, element } = createFilterElement({
                type: 'select',
                id: 'list-section-select-bar',
                options: [{ value: 'all', text: 'All Categories' }],
                eventHandler: updateListSection
            });
            cache.categorySelect = element;
            filterWrapper.appendChild(wrapper);
        }

        // Adding the pricing filter if it is enabled
        if (targetBlock.getAttribute('data-pricing-enabled') === 'true') {
            const { wrapper, element } = createFilterElement({
                type: 'select',
                id: 'list-section-pricing-bar',
                options: [
                    { value: 'all', text: 'All Pricing' },
                    { value: 'Free', text: 'Free' },
                    { value: 'Subscription', text: 'Subscription' },
                    { value: 'Lifetime', text: 'Lifetime Access' }
                ],
                eventHandler: updateListSection
            });
            cache.pricingSelect = element;
            filterWrapper.appendChild(wrapper);
        }

        // Adding the sorting select bar if it is enabled
        if (targetBlock.getAttribute('data-sorting-enabled') === 'true') {
            const { wrapper, element } = createFilterElement({
                type: 'select',
                id: 'list-section-sorting-bar',
                options: [
                    { value: 'none', text: 'Sort by...' },
                    { value: 'a-z', text: 'Sort A-Z' },
                    { value: 'z-a', text: 'Sort Z-A' }
                ],
                eventHandler: updateListSection
            });
            cache.sortingSelect = element;
            filterWrapper.appendChild(wrapper);
        }
        // Insert filter wrapper and apply styling
        const userItemsList = listSection.querySelector('.user-items-list');
        const listUl = listSection.querySelector('ul');

        if (userItemsList) {
            userItemsList.insertBefore(filterWrapper, userItemsList.firstChild);

            // Add inset class if required
            if (listUl?.getAttribute('data-layout-width') === 'inset') {
                filterWrapper.classList.add('inset');
            }
        }

        // Apply horizontal alignment
        const alignment = targetBlock.getAttribute('data-horizontal-alignment');
        const alignmentMap = {
            'center': 'center',
            'right': 'flex-end',
            'left': 'flex-start'
        };
        if (alignmentMap[alignment]) {
            filterWrapper.style.justifyContent = alignmentMap[alignment];
        }

        // Apply bottom margin
        const spacing = targetBlock.getAttribute('data-bottom-margin');
        if (spacing) {
            filterWrapper.style.marginBottom = spacing;
        }
    }

    // Helper function to extract metadata (categories, pricing) from item descriptions
    function extractMetadataFromItems(listSection) {
        const categories = new Set();
        const listItemDescriptions = listSection.querySelectorAll('.list-item-content__description p');
        const displayCategories = targetBlock.getAttribute('data-display-categories') === 'true';
        const displayPricing = targetBlock.getAttribute('data-display-pricing') === 'true';

        listItemDescriptions.forEach(description => {
            const text = description.innerText;
            const listItem = description.closest('.list-item');
            if (!listItem) return;

            let updatedText = text;

            // Extract categories
            const categoryMatches = text.match(/#category\/([^\/]*)\//g);
            if (categoryMatches) {
                const categoryList = categoryMatches.map(match => match.match(/#category\/([^\/]*)\//)[1]);
                const existingCategories = listItem.getAttribute('data-category')?.split(',').filter(Boolean) || [];
                const combinedCategories = [...new Set([...existingCategories, ...categoryList])];

                listItem.setAttribute('data-category', combinedCategories.join(','));
                categoryList.forEach(cat => categories.add(cat));
                updatedText = updatedText.replace(/#category\/([^\/]*)\//g, '');
            }

            // Extract pricing
            const pricingMatch = text.match(/#pricing\/([^\/]*)\//);
            if (pricingMatch) {
                const pricing = pricingMatch[1];
                listItem.setAttribute('data-pricing', pricing);
                updatedText = updatedText.replace(/#pricing\/([^\/]*)\//g, '');
            }

            // Display categories if enabled
            if (displayCategories && categoryMatches) {
                displayMetadataTags(listItem, 'categories',
                    listItem.getAttribute('data-category').split(','));
            }

            // Display pricing if enabled
            if (displayPricing && pricingMatch) {
                displayMetadataTags(listItem, 'pricing',
                    [listItem.getAttribute('data-pricing')]);
            }

            // Update description text and remove if empty
            description.innerText = updatedText.trim();
            if (!description.innerText) {
                description.remove();
            }

            listItem.classList.add('visible');
        });

        return Array.from(categories);
    }

    // Helper function to display metadata tags (categories or pricing)
    function displayMetadataTags(listItem, type, values) {
        const textWrapper = listItem.querySelector('.list-item-content__text-wrapper');
        if (!textWrapper) return;

        const containerClass = type === 'categories' ? 'list-item-categories' : 'list-item-pricing';
        const tagClass = type === 'categories' ? 'list-item-category' : 'list-item-pricing-tag';

        // Remove existing container
        textWrapper.querySelector(`.${containerClass}`)?.remove();

        // Create new container
        const container = document.createElement('div');
        container.classList.add(containerClass);

        // Set margin to match description
        const descriptionElement = listItem.querySelector('.list-item-content__description');
        if (descriptionElement) {
            const topMargin = window.getComputedStyle(descriptionElement).marginTop;
            container.style.marginBottom = topMargin;
        }

        // Add tags
        values.forEach(value => {
            const tag = document.createElement('span');
            tag.classList.add(tagClass);
            tag.innerText = value;
            container.appendChild(tag);
        });

        // Insert at the beginning of text wrapper
        textWrapper.insertBefore(container, textWrapper.firstChild);
    }

    // Helper function to add the categories to the select bar
    function addCategoryOptions(categories) {
        if (!cache.categorySelect || categories.length === 0) return;

        const fragment = document.createDocumentFragment();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.innerText = category;
            fragment.appendChild(option);
        });
        cache.categorySelect.appendChild(fragment);
    }

    // Optimized function to update list section with filtering and sorting
    function updateListSection() {
        const listSection = cache.listSection || findListSection();
        if (!listSection) return;

        // Use cached elements
        const searchQuery = cache.searchBar?.value.toLowerCase().trim() || '';
        const categoryQuery = cache.categorySelect?.value || 'all';
        const pricingQuery = cache.pricingSelect?.value || 'all';
        const sortOption = cache.sortingSelect?.value || 'none';

        // Cache list items if not already cached
        if (cache.listItems.length === 0) {
            cache.listItems = Array.from(listSection.querySelectorAll('.list-item'));
        }

        const listItems = cache.listItems;
        const listContainer = listSection.querySelector('.user-items-list ul');
        if (!listContainer) return;

        // Filter items
        const visibleItems = listItems.filter(item => {
            const itemName = item.querySelector('.list-item-content__title')?.innerText.toLowerCase() || '';
            const itemDescription = item.querySelector('.list-item-content__description')?.innerText.toLowerCase() || '';
            const itemCategories = item.getAttribute('data-category')?.split(',').filter(Boolean) || [];
            const itemPricing = item.getAttribute('data-pricing') || '';

            // Search filter
            const matchesSearch = !searchQuery || (
                itemName.includes(searchQuery) ||
                itemDescription.includes(searchQuery) ||
                itemCategories.some(category => category.toLowerCase().includes(searchQuery))
            );

            // Category filter
            const matchesCategory = categoryQuery === 'all' || itemCategories.includes(categoryQuery);

            // Pricing filter
            const matchesPricing = pricingQuery === 'all' || itemPricing === pricingQuery;

            return matchesSearch && matchesCategory && matchesPricing;
        });

        // Sort visible items if needed
        if (sortOption !== 'none') {
            visibleItems.sort((a, b) => {
                const titleA = a.querySelector('.list-item-content__title')?.innerText.toLowerCase() || '';
                const titleB = b.querySelector('.list-item-content__title')?.innerText.toLowerCase() || '';

                return sortOption === 'a-z'
                    ? titleA.localeCompare(titleB)
                    : titleB.localeCompare(titleA);
            });
        }

        // Batch DOM updates using requestAnimationFrame
        requestAnimationFrame(() => {
            // Hide all items first
            listItems.forEach(item => {
                item.classList.remove('visible');
                item.classList.add('hidden');
            });

            // Show and reorder visible items
            requestAnimationFrame(() => {
                visibleItems.forEach(item => {
                    listContainer.appendChild(item);
                    item.classList.remove('hidden');
                    // Small delay for animation
                    setTimeout(() => item.classList.add('visible'), 10);
                });
            });
        });
    }

    // Initialize the filter system
    const listSection = findListSection();
    if (!listSection) return;

    const categories = extractMetadataFromItems(listSection);
    addFilterComponents(listSection);
    addCategoryOptions(categories);
}

document.addEventListener('DOMContentLoaded', initialiseListSectionFilters);
