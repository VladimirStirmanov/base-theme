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

import { fetchMutation, fetchQuery } from 'Util/Request';
import {
    updateTotals,
    PRODUCTS_IN_CART
} from 'Store/Cart';
import { isSignedIn } from 'Util/Auth';
import { CartQuery } from 'Query';
import { showNotification } from 'Store/Notification';
import BrowserDatabase from 'Util/BrowserDatabase';

export const GUEST_QUOTE_ID = 'guest_quote_id';

/**
 * Product Cart Dispatcher
 * @class CartDispatcher
 */
export class CartDispatcher {
    updateInitialCartData(dispatch) {
        const guestQuoteId = this._getGuestQuoteId();

        if (isSignedIn()) {
            // This is logged in customer, no need for quote id
            this._syncCartWithBE(dispatch);
        } else if (guestQuoteId) {
            // This is guest
            this._syncCartWithBE(dispatch, guestQuoteId);
        } else {
            // This is guest, cart is empty
            // Need to create empty cart and save quote
            this._createEmptyCart(dispatch).then((data) => {
                BrowserDatabase.setItem(data, GUEST_QUOTE_ID);
                this._updateCartData({}, dispatch);
            });
        }
    }

    _createEmptyCart(dispatch) {
        return fetchMutation(CartQuery.getCreateEmptyCartMutation()).then(
            ({ createEmptyCart }) => createEmptyCart,
            error => dispatch(showNotification('error', error[0].message))
        );
    }

    _syncCartWithBE(dispatch) {
        // Need to get current cart from BE, update cart
        fetchQuery(CartQuery.getCartQuery(
            !isSignedIn() && this._getGuestQuoteId()
        )).then(
            ({ cartData }) => this._updateCartData(cartData, dispatch),
            () => {
                this._createEmptyCart(dispatch).then((data) => {
                    BrowserDatabase.setItem(data, GUEST_QUOTE_ID);
                    this._updateCartData({}, dispatch);
                });
            }
        );
    }

    changeItemQty(dispatch, options) {
        const { item_id, quantity, sku } = options;

        return fetchMutation(CartQuery.getSaveCartItemMutation(
            { sku, item_id, qty: quantity },
            !isSignedIn() && this._getGuestQuoteId()
        )).then(
            ({ saveCartItem: { cartData } }) => this._updateCartData(cartData, dispatch),
            error => dispatch(showNotification('error', error[0].message))
        );
    }

    addProductToCart(dispatch, options) {
        const { product, quantity } = options;
        const { item_id, quantity: originalQuantity } = this._getProductInCart(product);
        const { sku, type_id: product_type } = product;

        const productToAdd = {
            item_id,
            sku,
            product_type,
            qty: (parseInt(originalQuantity, 10) || 0) + parseInt(quantity, 10),
            product_option: { extension_attributes: this._getExtensionAttributes(product) }
        };

        if (this._canBeAdded(options)) {
            return fetchMutation(CartQuery.getSaveCartItemMutation(
                productToAdd, !isSignedIn() && this._getGuestQuoteId()
            )).then(
                ({ saveCartItem: { cartData } }) => this._updateCartData(cartData, dispatch),
                error => dispatch(showNotification('error', error[0].message))
            );
        }

        return Promise.reject();
    }

    removeProductFromCart(dispatch, item_id) {
        return fetchMutation(CartQuery.getRemoveCartItemMutation(
            item_id,
            !isSignedIn() && this._getGuestQuoteId()
        )).then(
            ({ removeCartItem: { cartData } }) => this._updateCartData(cartData, dispatch),
            error => dispatch(showNotification('error', error[0].message))
        );
    }

    applyCouponToCart(dispatch, couponCode) {
        return fetchMutation(CartQuery.getApplyCouponMutation(
            couponCode, !isSignedIn() && this._getGuestQuoteId()
        )).then(
            ({ applyCoupon: { cartData } }) => {
                this._updateCartData(cartData, dispatch);
                dispatch(showNotification('success', __('Coupon was applied!')));
            },
            error => dispatch(showNotification('error', error[0].message))
        );
    }

    removeCouponFromCart(dispatch) {
        return fetchMutation(CartQuery.getRemoveCouponMutation(
            !isSignedIn() && this._getGuestQuoteId()
        )).then(
            ({ removeCoupon: { cartData } }) => {
                this._updateCartData(cartData, dispatch);
                dispatch(showNotification('success', __('Coupon was removed!')));
            },
            error => dispatch(showNotification('error', error[0].message))
        );
    }

    _updateCartData(cartData, dispatch) {
        dispatch(updateTotals(cartData));
    }

    _getExtensionAttributes(product) {
        const {
            configurable_options,
            configurableVariantIndex,
            variants,
            type_id
        } = product;

        if (type_id === 'configurable') {
            const { attributes } = variants[configurableVariantIndex];

            const configurable_item_options = Object.values(configurable_options)
                .reduce((prev, { attribute_id, attribute_code }) => {
                    const { attribute_value } = attributes[attribute_code];

                    if (attribute_value) {
                        return [
                            ...prev,
                            {
                                option_id: attribute_id,
                                option_value: attribute_value
                            }
                        ];
                    }

                    return prev;
                }, []);

            return { configurable_item_options };
        }

        return {};
    }

    _getGuestQuoteId() {
        return BrowserDatabase.getItem(GUEST_QUOTE_ID);
    }

    _getProductInCart(product) {
        const id = this._getProductAttribute('id', product);
        const productsInCart = BrowserDatabase.getItem(PRODUCTS_IN_CART) || {};

        if (!productsInCart[id]) return {};
        return productsInCart[id];
    }

    /**
     * @param {*} attribute
     * @param {*} product
     */
    _getProductAttribute(attribute, product) {
        const { variants, configurableVariantIndex, [attribute]: attributeValue } = product;
        return configurableVariantIndex >= 0
            ? variants[configurableVariantIndex][attribute]
            : attributeValue;
    }

    /**
     * Check if it is allowed to add product to cart
     * @param {Object} options Cart options
     * @return {Boolean} Indicates is allowed or not
     * @memberof CartDispatcher
     */
    _canBeAdded(options) {
        if (options.product && options.quantity && (options.product.quantity + options.quantity) < 1) {
            return false;
        }

        if (options.quantity === 0) {
            return false;
        }

        return true;
    }
}

export default new CartDispatcher();
