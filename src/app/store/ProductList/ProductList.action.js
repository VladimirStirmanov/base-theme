/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

export const APPEND_PAGE = 'APPEND_PAGE';
export const UPDATE_PRODUCT_LIST = 'UPDATE_PRODUCT_LIST';
export const UPDATE_LOAD_STATUS = 'UPDATE_LOAD_STATUS';

/**
 * Apped page to the list.
 * @param {Array<Object>} items List of products returned from fetch
 * @param {Number} minPrice Minimal products price returned from fetch
 * @param {Number} maxPrice Maximal products price returned from fetch
 * @param {Number} currentPage Number of requested page
 */
const appendPage = (items, minPrice, maxPrice, currentPage) => ({
    type: APPEND_PAGE,
    items,
    minPrice,
    maxPrice,
    currentPage
});

/**
 * Update product list with new list (rewrite if already exists).
 * @param {Array<Object>} items List of products returned from fetch
 * @param {Number} totalItems Total number of products in this filter
 * @param {Number} minPrice Minimal products price returned from fetch
 * @param {Number} maxPrice Maximal products price returned from fetch
 * @param {Object} sortFields List of sortable fields
 * @param {Array<Object>} filters List of filters
 * @param {Number} currentPage Numver of requested page
 * @return {void}
 */
const updateProductList = (items, totalItems, minPrice, maxPrice, sortFields, filters, currentPage) => ({
    type: UPDATE_PRODUCT_LIST,
    items,
    totalItems,
    minPrice,
    maxPrice,
    sortFields,
    filters,
    currentPage
});

/**
 * Change loading status
 * @param {Boolean} status Loading indication boolean
 * @return {void}
 */
const updateLoadStatus = status => ({
    type: UPDATE_LOAD_STATUS,
    isLoading: status
});

export {
    appendPage,
    updateProductList,
    updateLoadStatus
};
