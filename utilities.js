//@ts-check


// FOR DOM MANIPULATION

/**
 * 
 * @param {string} elementType 
 * @param {object} options 
 * @returns {HTMLElement}
 */
export function createElement(elementType, options = {}) {
    const element = document.createElement(elementType);
    Object.entries(options).forEach(([key, value]) => {
        if (key === 'class' && Array.isArray(value)) {
            value.forEach(val => {
                element.classList.add(val);
            });
            return;
        } else if (key === 'class' && !Array.isArray(value)) {
            element.classList.add(value);
            return;
        };

        if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
            return;
        };

        if (key === 'text') {
            element.textContent = value;
            return;
        };

        if (key === 'style') {
            let holder = '';
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                holder += `${styleKey}: ${styleValue}; `
            });
            element.style.cssText = holder;
            return;
        };

        element.setAttribute(key, value);
    });

    return element;
};

/**
 * Returns an array of HTML elements from the DOM
 * @param {string} selector 
 * @param {Document|HTMLElement} parent 
 * @returns {Element[]}
 */
export function qsa(selector, parent = document) {
    return [...parent?.querySelectorAll(selector)];
};

/**
 * Returns an HTML element from the DOM.
 * @param {string} selector 
 * @param {Document|HTMLElement} parent 
 * @returns {HTMLElement|null}
 */
export function qs(selector, parent = document) {
    const element = parent?.querySelector(selector);
    if (element instanceof HTMLElement) {
        return element;
    };
    return null;
};

/**
 * Selects data attributed elements.
 * @param {string} selector 
 * @param {boolean} dataSet 
 * @param {Document|HTMLElement} parent 
 * @returns 
 */
export function dataAttributesSelector(selector, dataSet = false, parent = document) {
    const element = parent?.querySelector(`[data-${selector}]`);
    if (dataSet) {
        //@ts-ignore
        return element?.dataset;
    } else {
        return element;
    };
}

/**
 * Appends elements to a specific element.
 * @param {HTMLElement} parent 
 * @param  {...any} args 
 */
export function append(parent, ...args) {
    parent.append(...args);
};

/**
 * This is a Global Event Listener, it automatically listens for any element with a sepcified identifier.
 * @param {string} type Type of Event to listen for, i.e "click", "mouseover".
 * @param {string|string[]} selector HTML element to be selected to listen out for, i.e class or id.
 * @param {(e: Event, targetedItem: false | EventTarget, selector: string, type: string) => any} callbackfn Your function. You have access to 4 parameters namely: e, targeted items, selector(s), type of event
 * @param {boolean|AddEventListenerOptions} options Event Listener options.
 * @param {Document|HTMLElement} parent This value is initially set to "Document", it can also be set to any HTML element of your choice.
 */
export function addGlobalEventListener(type, selector, callbackfn, options, parent = document) {
    if (Array.isArray(type)) {
        type.forEach(typeArr => {
            if (typeof (typeArr) === 'string') {
                parent?.addEventListener(typeArr, e => {
                    if (Array.isArray(selector)) {
                        selector.forEach(item => {
                            if (typeof (item) === 'string') {
                                //@ts-ignore
                                if (e.target?.matches(item)) callbackfn(e, e.target?.matches(item) ? e.target : false, item, typeArr);
                            };
                        });
                    };
                    if (typeof (selector) === 'string') {
                        //@ts-ignore
                        if (e.target?.matches(selector)) callbackfn(e, e.target?.matches(selector) ? e.target : false, selector, typeArr);
                    };
                }, options);
            };
        });
    } else {
        parent?.addEventListener(type, e => {
            if (Array.isArray(selector)) {
                selector.forEach(item => {
                    if (typeof (item) === 'string') {
                        //@ts-ignore
                        if (e.target?.matches(item)) callbackfn(e, e.target?.matches(item) ? e.target : false, item, type);
                    };
                });
            };
            if (typeof (selector) === 'string') {
                //@ts-ignore
                if (e.target?.matches(selector)) callbackfn(e, e.target?.matches(selector) ? e.target : false, selector, type);
            };
        }, options);
    };
};













// Array Helper Functions

/**
 * Returns the nth number of elements in an array starting from the begining of the array.
 * @param {number[]|any[]} array 
 * @param {number} n 
 * @returns {Array | number}
 */
export function first(array, n = 1) {
    if (n === 1) return array[0];
    return array.filter((_, index) => index < n);
}

/**
 * Returns the nth number of elements in an array starting from the last of the array.
 * @param {number[]|any[]} array 
 * @param {number} n 
 * @returns {Array | number}
 */
export function last(array, n = 1) {
    if (n === 1) return array[array.length - 1];
    return array.filter((_, index) => array.length - index <= n);
}

/**
 * Returns a random element from an array.
 * @param {any[]} array 
 * @returns {any}
 */
export function sample(array) {
    return array[randomNumber(0, array.length - 1)];
};

/**
 * This function was designed for arrays with objects as elements, it's purpose is to get every value that has the same key i.e arr = [{name: 'john', age: 26}, {name: 'eve', age: 42}], pluck(arr, 'name') => ['john', 'eve'].
 * @param {any[]} array 
 * @param {string} key 
 * @returns {any[]}
 */
export function pluck(array, key) {
    return array.map(element => element[key]);
};

/**
 * 
 * @param {any[]} array 
 * @param {(param: any) => any} callbackfn 
 * @returns 
 */
export function groupBy(array, callbackfn) {
    return array.reduce((group, element) => {
        const value = callbackfn(element);
        return {
            ...group, [value]: [...(group[value] ?? []), element]
        };
    }, {});
};













// FORMATTERS
/**
 * 
 * @param {number} number 
 * @returns {string}
 */
export function formatNumbers(number) {
    const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);
    return NUMBER_FORMATTER.format(number);
};

/**
 * 
 * @param {number} amount 
 * @param {string} currencyNomination 
 * @returns {string}
 */
export function formatCurrency(amount, currencyNomination) {
    const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
        currency: currencyNomination,
        style: 'currency'
    });

    return CURRENCY_FORMATTER.format(amount);
};

/**
 * 
 * @param {number} number 
 * @returns {string}
 */
export function FormatCompactNumber(number) {
    const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(undefined, {
        notation: 'compact'
    });
    return COMPACT_NUMBER_FORMATTER.format(number);
};










// HELPER FUNCTIONS 

/**
 * Returns a random number within a given range.
 * @param {number} max
 * @param {number} min 
 * @returns {number}
 */
export function randomNumber(max, min) {
    if (max < min) [max, min] = [min, max];
    return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Takes an external function as a callback and calls the function the amount of times specified.
 * @param {(...args: any) => any} callbackfn Callback Function.
 * @param {number} n Number of time to call the function.
 * @param  {*} [args] Arguments for your callback if any.
 * @returns {*}
 */
export function NthCall(callbackfn, n, ...args) {
    for (let i = 1; i <= n; i++) {
        callbackfn(...args);
    };
};

/**
 * This is a delayed function call function, it returns a promise. It's purpose is to run a set of instructions after a specified time.
 * @param {number} duration This is the time delay you need in seconds(s) and not milliseconds(ms).
 * @returns {Promise}
 */
export function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration * 1000);
    });
};

/**
 * 
 * @param {(...args) => any} callbackfn 
 * @returns {any}
 */
export function memoize(callbackfn) {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        //@ts-ignore
        if (callbackfn(...args) === (undefined || null)) return;

        const result = callbackfn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Generates a string of text with numbers, Uppercase and symbols if true.
 * @param {number} characterAmount 
 * @param {boolean} includeUppercae 
 * @param {boolean} includeNumbers 
 * @param {boolean} includeSymbols 
 */
export function generateStringOfTextWithLengthN(characterAmount, includeUppercae = false, includeNumbers = false, includeSymbols = false) {
    const UPPERCASE_CHAR_CODES = arrayFromLowToHigh(65, 90);
    const LOWERCASE_CHAR_CODES = arrayFromLowToHigh(97, 122);
    const NUMBER_CHAR_CODES = arrayFromLowToHigh(48, 57);
    const SYMBOLS_CHAR_CODES = arrayFromLowToHigh(33, 47).concat(arrayFromLowToHigh(58, 64)).concat(arrayFromLowToHigh(91, 96)).concat(arrayFromLowToHigh(123, 126)).concat(128, 165);
    let charCodes = LOWERCASE_CHAR_CODES;

    /**
     * Generates an array of ranged numbers given.
     * @param {number} low Lowest number in range.
     * @param {number} high Highest number in range.
     * @returns {number[]}
     */
    function arrayFromLowToHigh(low, high) {
        let arr = [];
        for (let i = low; i <= high; i++) {
            arr.push(i);
        };
        return arr;
    };

    if (includeUppercae) charCodes = charCodes.concat(UPPERCASE_CHAR_CODES);
    if (includeNumbers) charCodes = charCodes.concat(NUMBER_CHAR_CODES);
    if (includeSymbols) charCodes = charCodes.concat(SYMBOLS_CHAR_CODES);

    const STRINGED_TEXT = [];

    for (let i = 0; i < characterAmount; i++) {
        const characterCode = sample(charCodes);;
        STRINGED_TEXT.push(String.fromCharCode(characterCode));
    };

    return STRINGED_TEXT.join('');
};

/**
 * Finds the duplicate in an array and returns a boolean. It returns false if the is no duplicate and ture if there is a duplicate
 * @param {number[]|string[]} array
 * @param {(param1: any, param2?: any) => boolean|any[]} callbackfn 
 * @returns {boolean|any[]}
 */
export function DuplicatesInArray(array, callbackfn) {
    const result = [];
    const temp = {};
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        temp[element] = (temp[element] || 0) + 1;
    };
    const Temp = Object.entries(temp);
    Temp.forEach(entry => {
        if (entry[1] > 1) {
            result.push(entry[0]);
        };
    });
    if (result.length === 0) {
        return callbackfn(false);
    } else {
        return callbackfn(true, result);
    };
}

/**
 * This function is similar to the flatten method on the array object. This functions flattens not only arrays but objects as well.
 * @param {object|number[]|string[]} holder Object or Array.
 * @param {boolean} includeArraysInObjects For objects, i.e if you have an array within an object, true if you want to flatten the array as well or false if you want to keep the value as an array.
 * @returns {any}
 */
export function flatten(holder, includeArraysInObjects = false) {
    let result;
    if (includeArraysInObjects === false ? typeof (holder) === "object" && !Array.isArray(holder) : typeof (holder) === "object") {
        result = {};
        for (const i in holder) {
            const element1 = holder[i];
            if (typeof (element1) === "object" && !Array.isArray(element1)) {
                const temp = flatten(element1);
                for (const j in temp) {
                    result[i + "." + j] = temp[j];
                };
            } else {
                result[i] = element1;
            };
        };

        return result;
    } else if (Array.isArray(holder)) {
        let storage = [...holder];
        result = [];

        while (storage.length > 0) {
            const next = storage.pop();
            if (Array.isArray(next)) {
                storage.push(...next);
            } else {
                result.push(next)
            };
        };

        return result.reverse();
    } else {
        console.error("Handler is neither an object or array.");
    };
};










// CUSTOM EVENTLISTENERS

/**
 *      CLICK AND HOLD EVENT  
 */

export class ClickAndHold {
    /** 
     * @param {EventTarget} target 
     * @param {Function} callbackfn 
     */
    constructor(target, callbackfn) {
        this.target = target;
        this.callbackfn = callbackfn;
        this.isHeld = false;
        this.activeHoldTimeOutID = undefined;

        ['mousedown', 'touchstart'].forEach(type => {
            this.target.addEventListener(type, this._onHoldStart.bind(this));
        });

        ['mouseup', 'mouseleave', 'mouseout', 'touchend', 'touchcancel'].forEach(type => {
            this.target.addEventListener(type, this._onHoldEnd.bind(this));
        });
    };

    _onHoldStart(e) {
        this.isHeld = true;

        this.activeHoldTimeOutID = setTimeout(() => {
            if (this.isHeld) this.callbackfn(e, this.target);
        }, 500);
    };

    _onHoldEnd() {
        this.isHeld = false;
        clearTimeout(this.activeHoldTimeOutID);
    };

    /** 
     * @param {EventTarget} target 
     * @param {Function} callbackfn 
     */
    static apply(target, callbackfn) {
        new ClickAndHold(target, callbackfn);
    };
}

/**
 * As the name says it makes your desired element draggable. It should be used only with addGlobalEventListener.
 * @param {MouseEvent} e Mouse event.
 * @param {HTMLElement} target Desired HTML Element.
 */
export function dragAndDrop(e, target) {
    if (target.dataset.draggable) {
        target.style.position = 'absolute';
        let offsetX, offsetY

        offsetX = e.clientX - target.offsetLeft;
        offsetY = e.clientY - target.offsetTop;

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stopMoving);

        function move(e) {
            target.style.top = `${e.clientY - offsetY}px`;
            target.style.left = `${e.clientX - offsetX}px`;
        };

        function stopMoving() {
            document.removeEventListener('mousemove', move);
        };
    };
};

/**
 * This function is to resize two partitioned layouts that are adjacent to eachother.
 * @param  {HTMLElement} resizerParent The container containing the resizer.
 * @param {HTMLElement} resizer The resier element.
 */
export function col_Resizer(resizerParent, resizer) {
    let x, w;

    function resizing(e) {
        x = e.clientX;

        const resizerParentWidth = window.getComputedStyle(resizerParent).width;
        w = parseInt(resizerParentWidth, 10);

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    }

    function mouseMove(e) {
        let dx = e.clientX - x;
        let dw = resizerParent.getBoundingClientRect().x > 0 ? w - dx : w + dx;

        if (dw <= ((window.outerWidth - 16) / 3)) {
            resizerParent.style.width = `${dw}px`;
        };

        console.log("dx: \n",dx, '\n \n','dw: \n',dw, '\n \n','e.clientX: \n', e.clientX, '\n \n', 'x: \n', x, '\n \n','window.getComputedStyle().width: \n', window.getComputedStyle(resizerParent).width, '\n \n','((window.outerWidth - 16) / 3): \n', ((window.outerWidth - 16) / 3), '\n \n', 'resizerParent.getBoundingClientRect(): \n', resizerParent.getBoundingClientRect());        
    };

    function mouseUp(e) {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    };

    resizer.addEventListener('dblclick', resizing)
}