/**
 * Filter Plugin for Squarespace List Sections
 * Optimized for performance with cached DOM queries and batched updates
 */

(function () {
    'use strict';

    /**
     * Configuration defaults
     */
    const CONFIG = {
        DEBOUNCE_DELAY: 200,
        ANIMATION_DURATION: 250,
        SELECTORS: {
            targetBlock: '#filtered-list-section',
            listItem: '.list-item',
            title: '.list-item-content__title',
            description: '.list-item-content__description',
            textWrapper: '.list-item-content__text-wrapper',
            userItemsList: '.user-items-list',
            listContainer: '.user-items-list ul'
        }
    };

    /**
     * Item data cache - stores pre-computed values to avoid DOM queries during filtering
     * @type {WeakMap<Element, {title: string, description: string, categories: string[], pricing: string}>}
     */
    const itemDataCache = new WeakMap();

    /**
     * Main filter controller
     */
    class FilterController {
        constructor(targetBlock) {
            this.targetBlock = targetBlock;
            this.listSection = null;
            this.listContainer = null;
            this.listItems = [];
            this.categories = new Set();

            // UI element references
            this.ui = {
                filterWrapper: null,
                searchBar: null,
                categorySelect: null,
                pricingSelect: null,
                sortingSelect: null
            };

            // Configuration from data attributes
            this.config = this.parseConfig();
        }

        /**
         * Parse configuration from data attributes
         */
        parseConfig() {
            const get = (attr) => this.targetBlock.getAttribute(attr) === 'true';
            const getVal = (attr) => this.targetBlock.getAttribute(attr);

            return {
                searchEnabled: get('data-search-enabled'),
                categoriesEnabled: get('data-categories-enabled'),
                pricingEnabled: get('data-pricing-enabled'),
                sortingEnabled: get('data-sorting-enabled'),
                displayCategories: get('data-display-categories'),
                displayPricing: get('data-display-pricing'),
                horizontalAlignment: getVal('data-horizontal-alignment'),
                bottomMargin: getVal('data-bottom-margin'),
                pricingOptions: this.parsePricingOptions(getVal('data-pricing-options'))
            };
        }

        /**
         * Parse custom pricing options or use defaults
         */
        parsePricingOptions(optionsStr) {
            const defaults = [
                { value: 'all', text: 'All Pricing' },
                { value: 'Free', text: 'Free' },
                { value: 'Subscription', text: 'Subscription' },
                { value: 'Lifetime', text: 'Lifetime Access' }
            ];

            if (!optionsStr) return defaults;

            try {
                const custom = JSON.parse(optionsStr);
                return [{ value: 'all', text: 'All Pricing' }, ...custom];
            } catch {
                return defaults;
            }
        }

        /**
         * Initialize the filter system
         */
        init() {
            this.listSection = this.findListSection();
            if (!this.listSection) return false;

            this.listContainer = this.listSection.querySelector(CONFIG.SELECTORS.listContainer);
            if (!this.listContainer) return false;

            // Cache all items and extract metadata
            this.cacheItemsAndMetadata();

            // Build UI
            this.createFilterUI();
            this.populateCategoryOptions();

            return true;
        }

        /**
         * Find the list section adjacent to the target block
         */
        findListSection() {
            return this.targetBlock.closest('section')?.nextElementSibling ?? null;
        }

        /**
         * Cache all list items and extract/cache their metadata
         * This is the key performance optimization - all text is cached upfront
         */
        cacheItemsAndMetadata() {
            const items = this.listSection.querySelectorAll(CONFIG.SELECTORS.listItem);

            items.forEach(item => {
                const titleEl = item.querySelector(CONFIG.SELECTORS.title);
                const descEl = item.querySelector(CONFIG.SELECTORS.description);

                // Get raw text content
                const rawDescription = descEl?.textContent ?? '';

                // Extract metadata from description
                const { categories, pricing, cleanText } = this.extractMetadata(rawDescription);

                // Cache computed values for fast filtering
                const cachedData = {
                    title: (titleEl?.textContent ?? '').toLowerCase(),
                    description: cleanText.toLowerCase(),
                    categories: categories,
                    pricing: pricing
                };

                itemDataCache.set(item, cachedData);

                // Store as data attributes for CSS/external access
                if (categories.length > 0) {
                    item.setAttribute('data-category', categories.join(','));
                    categories.forEach(cat => this.categories.add(cat));
                }

                if (pricing) {
                    item.setAttribute('data-pricing', pricing);
                }

                // Update description text (remove metadata tags)
                if (descEl && cleanText !== rawDescription) {
                    const p = descEl.querySelector('p');
                    if (p) {
                        p.textContent = cleanText.trim();
                        if (!p.textContent) p.remove();
                    }
                }

                // Display tags if enabled
                if (this.config.displayCategories && categories.length > 0) {
                    this.displayMetadataTags(item, 'categories', categories);
                }

                if (this.config.displayPricing && pricing) {
                    this.displayMetadataTags(item, 'pricing', [pricing]);
                }

                // Set initial visibility
                item.classList.add('visible');
                this.listItems.push(item);
            });
        }

        /**
         * Extract metadata tags from description text
         */
        extractMetadata(text) {
            const categories = [];
            const categoryRegex = /#category\/([^\/]+)\//g;
            const pricingRegex = /#pricing\/([^\/]+)\//;

            let match;
            while ((match = categoryRegex.exec(text)) !== null) {
                categories.push(match[1]);
            }

            const pricingMatch = text.match(pricingRegex);
            const pricing = pricingMatch ? pricingMatch[1] : '';

            // Clean text by removing all metadata tags
            const cleanText = text
                .replace(/#category\/[^\/]+\//g, '')
                .replace(/#pricing\/[^\/]+\//g, '')
                .trim();

            return { categories, pricing, cleanText };
        }

        /**
         * Display metadata as visual tags
         */
        displayMetadataTags(item, type, values) {
            const textWrapper = item.querySelector(CONFIG.SELECTORS.textWrapper);
            if (!textWrapper) return;

            const containerClass = type === 'categories' ? 'list-item-categories' : 'list-item-pricing';
            const tagClass = type === 'categories' ? 'list-item-category' : 'list-item-pricing-tag';

            // Remove existing container
            textWrapper.querySelector(`.${containerClass}`)?.remove();

            // Create container with tags
            const container = document.createElement('div');
            container.className = containerClass;

            values.forEach(value => {
                const tag = document.createElement('span');
                tag.className = tagClass;
                tag.textContent = value;
                container.appendChild(tag);
            });

            textWrapper.insertBefore(container, textWrapper.firstChild);
        }

        /**
         * Create the filter UI components
         */
        createFilterUI() {
            const wrapper = document.createElement('div');
            wrapper.id = 'list-section-filter-wrapper';
            wrapper.className = 'sqs-block-form';

            const debouncedUpdate = debounce(() => this.updateFilters(), CONFIG.DEBOUNCE_DELAY);
            const immediateUpdate = () => this.updateFilters();

            // Search bar
            if (this.config.searchEnabled) {
                const { wrapper: searchWrapper, input } = this.createInput({
                    type: 'text',
                    id: 'list-section-search-bar',
                    placeholder: 'Search items...',
                    onInput: debouncedUpdate
                });
                this.ui.searchBar = input;
                wrapper.appendChild(searchWrapper);
            }

            // Category select
            if (this.config.categoriesEnabled) {
                const { wrapper: catWrapper, input } = this.createSelect({
                    id: 'list-section-select-bar',
                    options: [{ value: 'all', text: 'All Categories' }],
                    onChange: immediateUpdate
                });
                this.ui.categorySelect = input;
                wrapper.appendChild(catWrapper);
            }

            // Pricing select
            if (this.config.pricingEnabled) {
                const { wrapper: priceWrapper, input } = this.createSelect({
                    id: 'list-section-pricing-bar',
                    options: this.config.pricingOptions,
                    onChange: immediateUpdate
                });
                this.ui.pricingSelect = input;
                wrapper.appendChild(priceWrapper);
            }

            // Sorting select
            if (this.config.sortingEnabled) {
                const { wrapper: sortWrapper, input } = this.createSelect({
                    id: 'list-section-sorting-bar',
                    options: [
                        { value: 'none', text: 'Sort by...' },
                        { value: 'a-z', text: 'Sort A-Z' },
                        { value: 'z-a', text: 'Sort Z-A' }
                    ],
                    onChange: immediateUpdate
                });
                this.ui.sortingSelect = input;
                wrapper.appendChild(sortWrapper);
            }

            // Apply styling
            this.applyWrapperStyles(wrapper);

            // Insert into DOM
            const userItemsList = this.listSection.querySelector(CONFIG.SELECTORS.userItemsList);
            if (userItemsList) {
                userItemsList.insertBefore(wrapper, userItemsList.firstChild);

                const listUl = this.listSection.querySelector('ul');
                if (listUl?.getAttribute('data-layout-width') === 'inset') {
                    wrapper.classList.add('inset');
                }
            }

            this.ui.filterWrapper = wrapper;
        }

        /**
         * Create a text input element
         */
        createInput({ type, id, placeholder, onInput }) {
            const wrapper = document.createElement('div');
            wrapper.id = `${id}-wrapper`;
            wrapper.className = 'form-item field text';

            const input = document.createElement('input');
            input.type = type;
            input.id = id;
            input.placeholder = placeholder;
            input.addEventListener('input', onInput);

            wrapper.appendChild(input);
            wrapper.appendChild(this.createFormEffects());

            return { wrapper, input };
        }

        /**
         * Create a select element
         */
        createSelect({ id, options, onChange }) {
            const wrapper = document.createElement('div');
            wrapper.id = `${id}-wrapper`;
            wrapper.className = 'form-item field select';

            const select = document.createElement('select');
            select.id = id;
            select.addEventListener('change', onChange);

            // Add options
            options.forEach(({ value, text }) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = text;
                select.appendChild(option);
            });

            // Dropdown icon
            const icon = document.createElement('div');
            icon.className = 'select-dropdown-icon';
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.439453 1.49825L1.56057 0.501709L9.00001 8.87108L16.4395 0.501709L17.5606 1.49825L9.00001 11.1289L0.439453 1.49825Z"></path></svg>';

            wrapper.appendChild(select);
            wrapper.appendChild(icon);
            wrapper.appendChild(this.createFormEffects());

            return { wrapper, input: select };
        }

        /**
         * Create form styling effects element
         */
        createFormEffects() {
            const span = document.createElement('span');
            span.className = 'form-input-effects';
            span.innerHTML = '<span class="form-input-effects-border"></span>';
            return span;
        }

        /**
         * Apply wrapper alignment and spacing styles
         */
        applyWrapperStyles(wrapper) {
            const alignmentMap = {
                'center': 'center',
                'right': 'flex-end',
                'left': 'flex-start'
            };

            if (alignmentMap[this.config.horizontalAlignment]) {
                wrapper.style.justifyContent = alignmentMap[this.config.horizontalAlignment];
            }

            if (this.config.bottomMargin) {
                wrapper.style.marginBottom = this.config.bottomMargin;
            }
        }

        /**
         * Populate category dropdown with discovered categories
         */
        populateCategoryOptions() {
            if (!this.ui.categorySelect || this.categories.size === 0) return;

            const sortedCategories = Array.from(this.categories).sort();
            const fragment = document.createDocumentFragment();

            sortedCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                fragment.appendChild(option);
            });

            this.ui.categorySelect.appendChild(fragment);
        }

        /**
         * Main filter update function - optimized for performance
         */
        updateFilters() {
            const searchQuery = this.ui.searchBar?.value.toLowerCase().trim() ?? '';
            const categoryQuery = this.ui.categorySelect?.value ?? 'all';
            const pricingQuery = this.ui.pricingSelect?.value ?? 'all';
            const sortOption = this.ui.sortingSelect?.value ?? 'none';

            // Filter items using cached data (no DOM queries!)
            const visibleItems = this.listItems.filter(item => {
                const data = itemDataCache.get(item);
                if (!data) return false;

                // Search filter
                const matchesSearch = !searchQuery || (
                    data.title.includes(searchQuery) ||
                    data.description.includes(searchQuery) ||
                    data.categories.some(cat => cat.toLowerCase().includes(searchQuery))
                );

                // Category filter
                const matchesCategory = categoryQuery === 'all' ||
                    data.categories.includes(categoryQuery);

                // Pricing filter
                const matchesPricing = pricingQuery === 'all' ||
                    data.pricing === pricingQuery;

                return matchesSearch && matchesCategory && matchesPricing;
            });

            // Sort using cached titles (no DOM queries!)
            if (sortOption !== 'none') {
                visibleItems.sort((a, b) => {
                    const titleA = itemDataCache.get(a)?.title ?? '';
                    const titleB = itemDataCache.get(b)?.title ?? '';

                    return sortOption === 'a-z'
                        ? titleA.localeCompare(titleB)
                        : titleB.localeCompare(titleA);
                });
            }

            // Batch DOM updates
            this.renderFilteredItems(visibleItems);
        }

        /**
         * Render filtered items with batched DOM operations
         */
        renderFilteredItems(visibleItems) {
            const visibleSet = new Set(visibleItems);

            // Single requestAnimationFrame for all updates
            requestAnimationFrame(() => {
                // Hide all items and remove visible class
                this.listItems.forEach(item => {
                    item.classList.remove('visible');
                    item.classList.add('hidden');
                });

                // Use DocumentFragment for batch append
                const fragment = document.createDocumentFragment();
                visibleItems.forEach(item => {
                    item.classList.remove('hidden');
                    fragment.appendChild(item);
                });

                // Single DOM append
                this.listContainer.appendChild(fragment);

                // Trigger visibility animation in next frame
                requestAnimationFrame(() => {
                    visibleItems.forEach(item => {
                        item.classList.add('visible');
                    });
                });
            });
        }
    }

    /**
     * Debounce utility function
     */
    function debounce(func, wait) {
        let timeoutId = null;

        return function debounced(...args) {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                timeoutId = null;
                func.apply(this, args);
            }, wait);
        };
    }

    /**
     * Initialize when DOM is ready
     */
    function init() {
        const targetBlock = document.querySelector(CONFIG.SELECTORS.targetBlock);
        if (!targetBlock) return;

        const controller = new FilterController(targetBlock);
        controller.init();

        // Expose controller for external access if needed
        window.filterController = controller;
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
