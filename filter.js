// Main function to initialise the list section filters

function initialiseListSectionFilters() {

    // Helper function to find the intended list section using the targeting block

    function findListSection() {
        let targetBlock = document.querySelector('#filtered-list-section');
        if (targetBlock) {
            let listSection = targetBlock.closest('section').nextElementSibling;
            return listSection;
        }
    }

    // Helper function to create the filter components and add them to the list section

    function addFilterComponents(listSection) {
        let targetBlock = document.querySelector('#filtered-list-section');
        if (targetBlock) {
            let filterWrapper = document.createElement('div');
            filterWrapper.id = 'list-section-filter-wrapper';
            filterWrapper.classList.add('sqs-block-form');
            // Adding the search bar if it is enabled
            if (targetBlock.getAttribute('data-search-enabled') === 'true') {
                // Creating the search bar and adding its classes/event listener
                let searchBar = document.createElement('input');
                searchBar.type = 'text';
                searchBar.placeholder = 'Search items...';
                searchBar.id = 'list-section-search-bar';
                searchBar.addEventListener('input', updateListSection);
                // Creating the search bar wrapper and adding its classes and id
                let searchBarWrapper = document.createElement('div');
                searchBarWrapper.id = "list-section-filters-search-bar-wrapper";
                searchBarWrapper.classList.add('form-item', 'field', 'text');
                // Adding the search bar to the wrapper
                searchBarWrapper.appendChild(searchBar);
                // Creating the form styling div and adding its classes and inner elements
                let formStylings = document.createElement('span');
                formStylings.classList.add('form-input-effects');
                formStylings.innerHTML = '<span class="form-input-effects-border"></span>';
                // Adding the form styling to the search bar wrapper
                searchBarWrapper.appendChild(formStylings);
                // Adding the search bar wrapper to the filter wrapper
                filterWrapper.appendChild(searchBarWrapper);
            }
            // Adding the category select bar if it is enabled
            if (targetBlock.getAttribute('data-categories-enabled') === 'true') {
                // Creating the categories select bar and adding its classes/event listener
                let selectBar = document.createElement('select');
                selectBar.id = 'list-section-select-bar';
                selectBar.addEventListener('change', updateListSection);
                // Creating the default option for the select bar
                let defaultOption = document.createElement('option');
                defaultOption.value = 'all';
                defaultOption.innerText = 'All Categories';
                selectBar.appendChild(defaultOption);
                // Creating the category select wrapper and adding its classes and id
                let categoriesWrapper = document.createElement('div');
                categoriesWrapper.id = "list-section-filters-categories-wrapper";
                categoriesWrapper.classList.add('form-item', 'field', 'select');
                // Adding the category select inner to the category select wrapper
                categoriesWrapper.appendChild(selectBar);
                // Creating the dropdown icon and adding it to the category select wrapper
                let dropdownIcon = document.createElement('div');
                dropdownIcon.classList.add('select-dropdown-icon');
                dropdownIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.439453 1.49825L1.56057 0.501709L9.00001 8.87108L16.4395 0.501709L17.5606 1.49825L9.00001 11.1289L0.439453 1.49825Z"></path></svg>';
                categoriesWrapper.appendChild(dropdownIcon);
                // Creating the form styling div and adding its classes and inner elements
                let formStylings = document.createElement('span');
                formStylings.classList.add('form-input-effects');
                formStylings.innerHTML = '<span class="form-input-effects-border"></span>';
                // Adding the form styling to the category select wrapper
                categoriesWrapper.appendChild(formStylings);
                // Adding the category select wrapper to the filter wrapper
                filterWrapper.appendChild(categoriesWrapper);
            }
            // Adding the pricing filter if it is enabled
            if (targetBlock.getAttribute('data-pricing-enabled') === 'true') {
                // Creating the pricing select bar and adding its classes/event listener
                let selectBar = document.createElement('select');
                selectBar.id = 'list-section-pricing-bar';
                selectBar.addEventListener('change', updateListSection);
                // Creating the default option for the select bar
                let defaultOption = document.createElement('option');
                defaultOption.value = 'all';
                defaultOption.innerText = 'All Pricing';
                selectBar.appendChild(defaultOption);
                // Creating the pricing options
                let freeOption = document.createElement('option');
                freeOption.value = 'Free';
                freeOption.innerText = 'Free';
                selectBar.appendChild(freeOption);
                let subscriptionOption = document.createElement('option');
                subscriptionOption.value = 'Subscription';
                subscriptionOption.innerText = 'Subscription';
                selectBar.appendChild(subscriptionOption);
                let lifetimeOption = document.createElement('option');
                lifetimeOption.value = 'Lifetime';
                lifetimeOption.innerText = 'Lifetime Access';
                selectBar.appendChild(lifetimeOption);
                // Creating the pricing select wrapper and adding its classes and id
                let pricingWrapper = document.createElement('div');
                pricingWrapper.id = "list-section-filters-pricing-wrapper";
                pricingWrapper.classList.add('form-item', 'field', 'select');
                // Adding the pricing select to the wrapper
                pricingWrapper.appendChild(selectBar);
                // Creating the dropdown icon and adding it to the pricing select wrapper
                let dropdownIcon = document.createElement('div');
                dropdownIcon.classList.add('select-dropdown-icon');
                dropdownIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.439453 1.49825L1.56057 0.501709L9.00001 8.87108L16.4395 0.501709L17.5606 1.49825L9.00001 11.1289L0.439453 1.49825Z"></path></svg>';
                pricingWrapper.appendChild(dropdownIcon);
                // Creating the form styling div and adding its classes and inner elements
                let formStylings = document.createElement('span');
                formStylings.classList.add('form-input-effects');
                formStylings.innerHTML = '<span class="form-input-effects-border"></span>';
                // Adding the form styling to the pricing select wrapper
                pricingWrapper.appendChild(formStylings);
                // Adding the pricing select wrapper to the filter wrapper
                filterWrapper.appendChild(pricingWrapper);
            }
            if (targetBlock.getAttribute('data-sorting-enabled') === 'true') {
                // Creating the categories select bar and adding its classes/event listener
                let selectBar = document.createElement('select');
                selectBar.id = 'list-section-sorting-bar';
                selectBar.addEventListener('change', updateListSection);
                // Creating the default option for the select bar
                let defaultOption = document.createElement('option');
                defaultOption.value = 'none';
                defaultOption.innerText = 'Sort by...';
                selectBar.appendChild(defaultOption);
                let ascendingOption = document.createElement('option');
                ascendingOption.value = 'a-z';
                ascendingOption.innerText = 'Sort A-Z';
                selectBar.appendChild(ascendingOption);
                let descendingOption = document.createElement('option');
                descendingOption.value = 'z-a';
                descendingOption.innerText = 'Sort Z-A';
                selectBar.appendChild(descendingOption);
                // Creating the category select wrapper and adding its classes and id
                let sortingWrapper = document.createElement('div');
                sortingWrapper.id = "list-section-filters-sorting-wrapper";
                sortingWrapper.classList.add('form-item', 'field', 'select');
                // Adding the category select inner to the category select wrapper
                sortingWrapper.appendChild(selectBar);
                // Creating the dropdown icon and adding it to the category select wrapper
                let dropdownIcon = document.createElement('div');
                dropdownIcon.classList.add('select-dropdown-icon');
                dropdownIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.439453 1.49825L1.56057 0.501709L9.00001 8.87108L16.4395 0.501709L17.5606 1.49825L9.00001 11.1289L0.439453 1.49825Z"></path></svg>';
                sortingWrapper.appendChild(dropdownIcon);
                // Creating the form styling div and adding its classes and inner elements
                let formStylings = document.createElement('span');
                formStylings.classList.add('form-input-effects');
                formStylings.innerHTML = '<span class="form-input-effects-border"></span>';
                // Adding the form styling to the category select wrapper
                sortingWrapper.appendChild(formStylings);
                // Adding the category select wrapper to the filter wrapper
                filterWrapper.appendChild(sortingWrapper);
            }
            // Adding the inset class if required
            listSection.querySelector('.user-items-list').insertBefore(filterWrapper, listSection.querySelector('.user-items-list').firstChild);
            if (listSection.querySelector('ul').getAttribute('data-layout-width') === 'inset') {
                filterWrapper.classList.add('inset');
            }
            
            // Aligning the components depending on user selection
            let alignment = targetBlock.getAttribute('data-horizontal-alignment');
            switch (alignment) {
                case 'center': {
                    filterWrapper.style.justifyContent = 'center';
                    break;
                }
                case 'right': {
                    filterWrapper.style.justifyContent = 'flex-end';
                    break;
                }
                case 'left': {
                    filterWrapper.style.justifyContent = 'flex-start';
                }
            }
            let spacing = targetBlock.getAttribute('data-bottom-margin');
            filterWrapper.style.marginBottom = spacing;
        }
    }

    // Helper function to find the user created categories and add them to a list

    function findCategories(listSection) {
        // Creating the empty category list
        let categories = [];
        // Finding all the list item descriptions
        let listItemDescriptions = listSection.querySelectorAll('.list-item-content__description p');
        // Check if the feature is enabled
        let targetBlock = document.querySelector('#filtered-list-section');
        let displayCategories = targetBlock && targetBlock.getAttribute('data-display-categories') === 'true';
    
        // Iterating over the descriptions
        listItemDescriptions.forEach(description => {
            // Finding the category from the description text, looking for the text '#category/'
            let text = description.innerText;
            let categoryMatches = text.match(/#category\/([^\/]*)\//g);
            let pricingMatch = text.match(/#pricing\/([^\/]*)\//); // Extract pricing
            // If a category is found
            if (categoryMatches) {
                let listItem = description.closest('.list-item');
                if (listItem) {
                    // Extract category names and assign them as a comma-separated list
                    let categoryList = categoryMatches.map(match => match.match(/#category\/([^\/]*)\//)[1]);
                    
                    // Get existing categories from the data-category attribute
                    let existingCategories = listItem.getAttribute('data-category');
                    let existingCategoryList = existingCategories ? existingCategories.split(',') : [];
    
                    // Combine existing categories with the new ones, avoiding duplicates
                    let combinedCategories = [...new Set([...existingCategoryList, ...categoryList])];
    
                    // Update the data-category attribute
                    listItem.setAttribute('data-category', combinedCategories.join(','));
    
                    // Add the '.list-item-categories' element to display categories if enabled
                    if (displayCategories) {
                        let textWrapper = listItem.querySelector('.list-item-content__text-wrapper');
                        if (textWrapper) {
                            // Remove existing categories container if it exists
                            let existingCategoriesContainer = textWrapper.querySelector('.list-item-categories');
                            if (existingCategoriesContainer) {
                                existingCategoriesContainer.remove();
                            }
    
                            // Create the categories container
                            let categoriesContainer = document.createElement('div');
                            categoriesContainer.classList.add('list-item-categories');
    
                            // Set bottom margin to match the top margin of '.list-item-content__description'
                            let descriptionElement = listItem.querySelector('.list-item-content__description');
                            if (descriptionElement) {
                                let topMargin = window.getComputedStyle(descriptionElement).marginTop;
                                categoriesContainer.style.marginBottom = topMargin;
                            }
    
                            // Add individual category elements
                            combinedCategories.forEach(category => {
                                let categoryElement = document.createElement('span');
                                categoryElement.classList.add('list-item-category');
                                categoryElement.innerText = category;
                                categoriesContainer.appendChild(categoryElement);
                            });
    
                            // Add the categories container as the first child of the text wrapper
                            textWrapper.insertBefore(categoriesContainer, textWrapper.firstChild);
                        }
                    }
    
                    listItem.classList.add('visible');
                }
    
                // Remove all category tags from the description text
                text = text.replace(/#category\/([^\/]*)\//g, '');
            }

            // If pricing is found
            if (pricingMatch) {
                let listItem = description.closest('.list-item');
                if (listItem) {
                    let pricing = pricingMatch[1];
                    listItem.setAttribute('data-pricing', pricing);
                }
                // Remove pricing tag from the description text
                text = text.replace(/#pricing\/([^\/]*)\//g, '');
            }

            // Add unique categories to the categories array
            if (categoryMatches) {
                categoryMatches.forEach(match => {
                    let category = match.match(/#category\/([^\/]*)\//)[1];
                    if (!categories.includes(category)) {
                        categories.push(category);
                    }
                });
            }

            // Update description and remove if empty
            description.innerText = text;
            if (description.innerText.trim() === '') {
                description.remove();
            }
        });
        return categories;
    }

    // Helper function to add the categories to the select bar

    function addCategoryOptions(categories) {
        let selectBar = document.querySelector('#list-section-select-bar');
        if (!selectBar) return;
        categories.forEach(category => {
            let option = document.createElement('option');
            option.value = category;
            option.innerText = category;
            selectBar.appendChild(option);
        });
    }

    function updateListSection() {
        let listSection = findListSection();
        if (!listSection) return;
    
        let searchBar = document.querySelector('#list-section-search-bar');
        let selectBar = document.querySelector('#list-section-select-bar');
        let pricingBar = document.querySelector('#list-section-pricing-bar');
        let sortingBar = document.querySelector('#list-section-sorting-bar');

        // Get the current values of the filters
        let searchQuery = searchBar ? searchBar.value.toLowerCase().trim() : '';
        let categoryQuery = selectBar ? selectBar.value : 'all';
        let pricingQuery = pricingBar ? pricingBar.value : 'all';
        let sortOption = sortingBar ? sortingBar.value : 'none';
    
        let listItems = Array.from(listSection.querySelectorAll('.list-item')); // Convert NodeList to Array
    
        // Sort the visible items based on the selected sorting option
        const sortItems = () => {
            return new Promise(resolve => {
                listItems.sort((a, b) => {
                    let titleA = a.querySelector('.list-item-content__title').innerText.toLowerCase();
                    let titleB = b.querySelector('.list-item-content__title').innerText.toLowerCase();
    
                    if (sortOption === 'a-z') {
                        return titleA.localeCompare(titleB); // Sort A-Z
                    } else if (sortOption === 'z-a') {
                        return titleB.localeCompare(titleA); // Sort Z-A
                    } else {
                        return 0; // No sorting
                    }
                });
    
                // Reorder the DOM to reflect the sorted order without clearing it
                let listContainer = listSection.querySelector('.user-items-list ul');
                if (listContainer) {
                    listItems.forEach(item => {
                        item.classList.remove('visible');
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 250);
                        setTimeout(() => {
                            listContainer.appendChild(item);
                        }, 250); // Move each item to its new position
                    });
                }
    
                // Resolve the promise after sorting is complete
                resolve();
            });
        };
    
        // Filter the list items based on the search and category filters
        const filterItems = () => {
            listItems.forEach(item => {
                let itemName = item.querySelector('.list-item-content__title').innerText.toLowerCase();
                let itemDescription = item.querySelector('.list-item-content__description').innerText.toLowerCase();
                let itemCategories = item.getAttribute('data-category') ? item.getAttribute('data-category').split(',') : [];
                let itemPricing = item.getAttribute('data-pricing') || '';

                // Check if the search query matches the name, description, or any category
                const matchesSearch = !searchQuery || (
                    itemName.includes(searchQuery) ||
                    itemDescription.includes(searchQuery) ||
                    itemCategories.some(category => category.toLowerCase().includes(searchQuery))
                );

                // Check if the item matches the selected category
                const matchesCategory = categoryQuery === 'all' || itemCategories.includes(categoryQuery);

                // Check if the item matches the selected pricing
                const matchesPricing = pricingQuery === 'all' || itemPricing === pricingQuery;

                // Toggle visibility based on filters with smooth animation
                setTimeout(() => {
                    if (matchesSearch && matchesCategory && matchesPricing) {
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, 10);
                    }
                }, 250);
            });
        };
    
        // Run the sorting and filtering in sequence
        sortItems().then(filterItems); // Sort first, then filter
    }

     // Running all the functions in the right order 
     
    let listSection = findListSection();
    let categories = findCategories(listSection);
    addFilterComponents(listSection);
    addCategoryOptions(categories);
}

document.addEventListener('DOMContentLoaded', initialiseListSectionFilters);
