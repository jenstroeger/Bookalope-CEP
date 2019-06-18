/**
 * Select Custom Style
 *
 */
// UMD pattern via umdjs
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like
        module.exports = factory();
    } else {
        // Browser
        root.selectCustomStyle = factory();
    }
}(this, function () {
// End of UMD module

    var CLASS_NAMES = {
        dropdown: 'spectrum-Dropdown',
        dropdownPopover: 'spectrum-Dropdown-popover',
        dropdownItem: 'spectrum-Menu-item',
        dropdownItemLabel: 'spectrum-Menu-itemLabel',
        dropdownMenuDivider: 'spectrum-Menu-divider',
        dropdownTrigger: 'spectrum-Dropdown-trigger',
        dropdownLabel: 'spectrum-Dropdown-label'
    };

    var STATE = {
        isPlaceholder: 'is-placeholder',
        isSelected: 'is-selected',
        isDisabled: 'is-disabled',
        isOpen: 'is-open',
        isDropUp: 'is-dropup'
    };

    // Quick aliases and polyfills if needed
    var query = document.querySelector.bind(document);
    var queryAll = document.querySelectorAll.bind(document);

    // IE 9-11 CustomEvent polyfill
    // From https://developer.mozilla.org/en/docs/Web/API/CustomEvent
    function CustomEvent(eventName, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail);
        return event;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;


    // See https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    }
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;

            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    // Return true if any ancestor matches selector
    // Borrowed from ancestorMatches() from agave.js (MIT)
    function isAncestorOf(element, selector, includeSelf) {
        var parent = element.parentNode;
        if (includeSelf && element.matches(selector)) {
            return true
        }
        // While parents are 'element' type nodes
        // See https://developer.mozilla.org/en-US/docs/DOM/Node.nodeType
        while (parent && parent.nodeType && parent.nodeType === 1) {
            if (parent.matches(selector)) {
                return true
            }
            parent = parent.parentNode;
        }
        return false;
    }

    function getHeight(element) {
        var element_style = window.getComputedStyle(element),
            element_display = element_style.display,
            element_maxHeight = element_style.maxHeight.replace('px', '').replace('%', ''),
            height = 0;

        // if its not hidden we just return normal height
        if (element_display !== 'none' && element_maxHeight !== '0') {
            return element.offsetHeight;
        }

        // the element is hidden so:
        // making the el block so we can meassure its height but still be hidden
        element.style.position = 'absolute';
        element.style.visibility = 'hidden';
        element.style.display = 'block';

        height = element.offsetHeight;

        // reverting to the original values
        element.style.display = '';
        element.style.position = '';
        element.style.visibility = '';

        return height;
    }


    function toggleOpenDropdown(dropdown, viewport) {

        viewport = viewport || query('body');

        var viewportEl = typeof viewport == 'object' ? viewport : dropdown.closest(viewport);

        if (viewportEl == null)viewportEl = query('body');

        if (dropdown.classList.contains(STATE.isOpen)) {
            closeDropdown(dropdown);
            
        } else {
            
            // If we're closed and about to open, close other style selects on the page
            closeAllDropdown(dropdown);

            var dropdownPopover = dropdown.querySelector('.' + CLASS_NAMES.dropdownPopover + '');

            var limit = dropdown.offsetTop + dropdown.offsetHeight + getHeight(dropdownPopover) > viewportEl.offsetHeight + viewportEl.scrollTop && dropdown.offsetTop > getHeight(dropdownPopover);

            if (limit) dropdown.classList.add(STATE.isDropUp);

            dropdown.classList.add(STATE.isOpen);
            dropdownPopover.classList.add(STATE.isOpen);
        }
    }

    function closeDropdown(dropdown) {
        dropdown.classList.remove(STATE.isOpen);
        dropdown.classList.remove(STATE.isDropUp);
        var dropdownPopover = dropdown.querySelector('.' + CLASS_NAMES.dropdownPopover + '');
        if (dropdownPopover !== null) {
            dropdownPopover.classList.remove(STATE.isOpen);
        }
    }

    function closeAllDropdown(exception) {
        var dropdownAll = queryAll('.' + CLASS_NAMES.dropdown + '');
        for (var i = 0; i < dropdownAll.length; i++) {
            var dropdown = dropdownAll[i];
            if (dropdown !== exception) {
                closeDropdown(dropdown);
            }
        }
    }

    function initSelect(select, options) {

        var selectOptions = select.children,
            selectedIndex = select.selectedIndex,
            selectPlaceholder = select.getAttribute('data-placeholder') || 'Choose';

        var id = select.getAttribute('id') || Math.random().toString(36).substr(2, 9);

        select.classList.add('hidden');

        var dropdownHTML, dropdownPopoverHTML, dropdownTriggerHTML;

        dropdownHTML = '<div class="' + CLASS_NAMES.dropdown + '" data-id="' + id + '">';
        dropdownPopoverHTML = '<div class="spectrum-Popover ' + CLASS_NAMES.dropdownPopover + '" aria-hidden="true"><ul class="spectrum-Menu" role="listbox">';

        for (var index = 0; index < selectOptions.length; index++) {
            var option = selectOptions[index],
                optionText = option.textContent,
                optionValue = option.getAttribute('value') || '';

            var isPlaceholder = option.getAttribute('data-placeholder') === 'true',
                isDivider = option.getAttribute('data-divider') === 'true';

            var cssClass = isDivider ? CLASS_NAMES.dropdownMenuDivider : CLASS_NAMES.dropdownItem,
                role = isDivider ? 'separator' : 'option',
                itemHTML = '';

            if (isPlaceholder) cssClass += ' ' + STATE.isPlaceholder;
            if (option.selected === true) cssClass += ' ' + STATE.isSelected;
            if (option.disabled === true) cssClass += ' ' + STATE.isDisabled;
            if (!isDivider) itemHTML = '<span class="' + CLASS_NAMES.dropdownItemLabel + '">' + optionText + "</span>";


            // Continue building dropdownPopoverHTML
            dropdownPopoverHTML += '<li class="' + cssClass + '" data-value="' + optionValue + '" role="' + role + '">' + itemHTML + '</li>';
        }

        dropdownPopoverHTML += '</ul></div>';

        dropdownTriggerHTML = '<button class="spectrum-FieldButton ' + CLASS_NAMES.dropdownTrigger + '" aria-haspopup="true">' +
            '<span class="' + CLASS_NAMES.dropdownLabel + ' ' + STATE.isPlaceholder + '">' + selectPlaceholder + '</span>' +
            '<svg class="spectrum-Icon spectrum-Icon--sizeS spectrum-UIIcon-Alert" focusable="false"><use xlink:href="#icon-AlertMedium"></use></svg>' +
            '<svg class="spectrum-Icon spectrum-UIIcon-ChevronDownMedium spectrum-Dropdown-icon" focusable="false">' +
            '<use xlink:href="#icon-ChevronDownMedium"/></svg></button>';

        dropdownHTML += dropdownTriggerHTML += dropdownPopoverHTML += '</div>';

        //render dropdownHTML
        select.insertAdjacentHTML('afterend', dropdownHTML);


        var dropdown = query('.' + CLASS_NAMES.dropdown + '[data-id="' + id + '"]'),
            dropdownPopover = dropdown.querySelector('.' + CLASS_NAMES.dropdownPopover + ''),
            dropdownItems = dropdown.querySelectorAll('.' + CLASS_NAMES.dropdownItem + ''),
            dropdownLabel = dropdown.querySelector('.' + CLASS_NAMES.dropdownLabel + ''),
            dropdownTrigger = dropdown.querySelector('.' + CLASS_NAMES.dropdownTrigger + '');

        if (select.disabled === true)dropdownTrigger.classList.add(STATE.isDisabled);

        var changeDropdownLabel = function (newValue, newLabel, isPlaceholder) {
                dropdownLabel.textContent = newLabel;
                dropdownLabel.setAttribute('data-value', newValue);
                dropdownLabel.classList.toggle(STATE.isPlaceholder, isPlaceholder === true);
            },
            changeSelectValue = function (newValue, newLabel) {

                // Close dropdown
                dropdown.classList.remove(STATE.isOpen);
                dropdownPopover.classList.remove(STATE.isOpen);

                if (select.value === newValue)return;

                var isPlaceholderValue = false;

                // Update the 'selected' that shows the option with the current value
                for (var indexItem = 0; indexItem < dropdownItems.length; indexItem++) {
                    var dropdownItem = dropdownItems[indexItem];
                    if (dropdownItem.getAttribute('data-value') === newValue) {
                        dropdownItem.classList.add(STATE.isSelected);
                        isPlaceholderValue = dropdownItem.classList.contains(STATE.isPlaceholder);
                    } else {
                        dropdownItem.classList.remove(STATE.isSelected)
                    }
                }

                // Update styled value
                changeDropdownLabel(newValue, newLabel, isPlaceholderValue);

                // Update real select box
                select.value = newValue;

                // Send 'change' event to real select - to trigger any change event listeners
                var changeEvent = new CustomEvent('change');
                select.dispatchEvent(changeEvent);
            };


        for (var indexItem = 0; indexItem < dropdownItems.length; indexItem++) {
            var dropdownItem = dropdownItems[indexItem];

            if (dropdownItem.classList.contains(STATE.isDisabled)) {
                return;
            }

            // Bind click handler function to dropdownItem
            dropdownItem.addEventListener('click', function (ev) {
                var target = this,
                    dropdown = target.parentNode.parentNode.parentNode,
                    id = dropdown.getAttribute('data-id'),
                    newValue = target.getAttribute('data-value'),
                    newLabel = target.textContent;

                changeSelectValue(newValue, newLabel);
            });

            var value = dropdownItem.getAttribute('data-value');
            if (value === select.value) {
                changeDropdownLabel(value, dropdownItem.textContent, dropdownItem.classList.contains(STATE.isPlaceholder));
            }
        }

        // Bind click handler function to dropdownTrigger
        dropdownTrigger.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this.classList.contains(STATE.isDisabled) === false) {
                toggleOpenDropdown(this.parentNode, options.viewport);
            }
        });
    }

    return {
        init: function (selector, options) {

            options = options || {};

            var selectAll = typeof selector == 'object' ? selector : queryAll(selector);

            for (var count = 0; count < selectAll.length; count++) {
                initSelect(selectAll[count], options);
            }

            // Clicking outside of the styled select box closes any open styled select boxes
            document.addEventListener('click', function (ev) {
                if (!isAncestorOf(ev.target, '.' +  CLASS_NAMES.dropdown, true)) {
                    closeAllDropdown();
                }
            });

        }
    };


// Close UMD module
}));
