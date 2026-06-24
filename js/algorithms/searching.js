// Searching algorithm implementations using generators

export function* linearSearch(array, target) {
    const n = array.length;
    
    for (let i = 0; i < n; i++) {
        yield {
            type: 'check',
            indices: [i],
            message: `Checking element at index ${i}: ${array[i]}`,
        };
        
        if (array[i] === target) {
            yield {
                type: 'found',
                indices: [i],
                message: `Target ${target} found at index ${i}!`,
            };
            return i;
        }
    }
    
    yield {
        type: 'not_found',
        indices: [],
        message: `Target ${target} not found in the array`,
    };
    
    return -1;
}

export function* binarySearch(array, target) {
    let left = 0;
    let right = array.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        yield {
            type: 'range',
            indices: [left, right],
            message: `Searching in range [${left}, ${right}]`,
        };
        
        yield {
            type: 'check',
            indices: [mid],
            message: `Checking middle element at index ${mid}: ${array[mid]}`,
        };
        
        if (array[mid] === target) {
            yield {
                type: 'found',
                indices: [mid],
                message: `Target ${target} found at index ${mid}!`,
            };
            return mid;
        }
        
        if (array[mid] < target) {
            yield {
                type: 'eliminate',
                indices: Array.from({ length: mid - left + 1 }, (_, i) => left + i),
                message: `Target is greater, eliminating left half`,
            };
            left = mid + 1;
        } else {
            yield {
                type: 'eliminate',
                indices: Array.from({ length: right - mid + 1 }, (_, i) => mid + i),
                message: `Target is smaller, eliminating right half`,
            };
            right = mid - 1;
        }
    }
    
    yield {
        type: 'not_found',
        indices: [],
        message: `Target ${target} not found in the array`,
    };
    
    return -1;
}

export function* jumpSearch(array, target) {
    const n = array.length;
    const jump = Math.floor(Math.sqrt(n));
    let prev = 0;
    
    // Jump through blocks
    while (array[Math.min(jump, n) - 1] < target) {
        yield {
            type: 'jump',
            indices: [prev, Math.min(jump, n) - 1],
            message: `Jumping from index ${prev} to ${Math.min(jump, n) - 1}`,
        };
        
        prev = jump;
        jump += Math.floor(Math.sqrt(n));
        
        if (prev >= n) {
            yield {
                type: 'not_found',
                indices: [],
                message: `Target ${target} not found in the array`,
            };
            return -1;
        }
    }
    
    // Linear search in the identified block
    yield {
        type: 'block',
        indices: Array.from({ length: Math.min(jump, n) - prev }, (_, i) => prev + i),
        message: `Performing linear search in block starting at ${prev}`,
    };
    
    while (prev < Math.min(jump, n)) {
        yield {
            type: 'check',
            indices: [prev],
            message: `Checking element at index ${prev}: ${array[prev]}`,
        };
        
        if (array[prev] === target) {
            yield {
                type: 'found',
                indices: [prev],
                message: `Target ${target} found at index ${prev}!`,
            };
            return prev;
        }
        
        prev++;
    }
    
    yield {
        type: 'not_found',
        indices: [],
        message: `Target ${target} not found in the array`,
    };
    
    return -1;
}

export default {
    linearSearch,
    binarySearch,
    jumpSearch,
};
