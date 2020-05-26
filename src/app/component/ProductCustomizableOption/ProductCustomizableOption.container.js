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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from 'Util/Price';
import ProductCustomizableOption from './ProductCustomizableOption.component';

class ProductCustomizableOptionContainer extends PureComponent {
    static propTypes = {
        option: PropTypes.object.isRequired,
        setSelectedCheckboxValues: PropTypes.func.isRequired,
        setCustomizableOptionTextFieldValue: PropTypes.func.isRequired,
        setSelectedDropdownValue: PropTypes.func.isRequired
    };

    state = {
        textValue: '',
        selectedDropdownValue: 0
    };

    containerFunctions = {
        getDropdownOptions: this.getDropdownOptions.bind(this),
        getSelectedCheckboxValue: this.getSelectedCheckboxValue.bind(this),
        updateTextFieldValue: this.updateTextFieldValue.bind(this),
        setDropdownValue: this.setDropdownValue.bind(this),
        renderOptionLabel: this.renderOptionLabel.bind(this),
        getHeading: this.getHeading.bind(this)
    };

    containerProps = () => ({
        optionType: this.getOptionType()
    });


    getOptionType() {
        const { option } = this.props;
        const {
            checkboxValues,
            dropdownValues,
            fieldValues,
            areaValues
        } = option;

        if (checkboxValues) {
            return 'checkbox';
        } if (dropdownValues) {
            return 'dropdown';
        } if (fieldValues) {
            return 'field';
        } if (areaValues) {
            return 'area';
        }

        return null;
    }

    renderOptionLabel(priceType, price) {
        switch (priceType) {
        case 'PERCENT':
            return `${ price }%`;
        default:
            return `${ formatCurrency() }${ price }`;
        }
    }

    getSelectedCheckboxValue(value) {
        const { option, setSelectedCheckboxValues } = this.props;
        const { option_id } = option;

        setSelectedCheckboxValues(option_id, value);
    }

    updateTextFieldValue(value) {
        const { option, setCustomizableOptionTextFieldValue } = this.props;
        const { option_id } = option;

        setCustomizableOptionTextFieldValue(option_id, value);
        this.setState({ fieldValue: value });
    }

    setDropdownValue(value) {
        const { setSelectedDropdownValue, option } = this.props;
        const { selectedDropdownValue } = this.state;

        if (selectedDropdownValue === value) {
            setSelectedDropdownValue(null, option);
            this.setState({ selectedDropdownValue: 0 });
        } else {
            setSelectedDropdownValue(value, option);
            this.setState({ selectedDropdownValue: value });
        }
    }

    getHeading(mainTitle, titleBold) {
        return (
            <>
                <span
                  block="ProductCustomizableOptions"
                  elem="Heading"
                >
                    { `${ mainTitle } + ` }
                </span>
                <span
                  block="ProductCustomizableOptions"
                  elem="HeadingBold"
                >
                    { titleBold }
                </span>
            </>
        );
    }

    getDropdownOptions(values) {
        return values.reduce((acc, {
            option_type_id, title, price, price_type
        }) => {
            acc.push({
                id: option_type_id,
                name: title,
                value: option_type_id,
                label: `${title} + ${this.renderOptionLabel(price_type, price)}`
            });

            return acc;
        }, []);
    }

    render() {
        return (
            <ProductCustomizableOption
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default ProductCustomizableOptionContainer;
