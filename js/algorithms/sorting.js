// Sorting algorithm implementations using generators for step-by-step execution

export function* bubbleSort(array) {
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            yield {
                type: 'compare',
                indices: [j, j + 1],
                message: `Comparing elements at indices ${j} and ${j + 1}`,
            };
            
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swapped = true;
                
                yield {
                    type: 'swap',
                    indices: [j, j + 1],
                    message: `Swapping elements at indices ${j} and ${j + 1}`,
                };
            }
        }
        
        yield {
            type: 'sorted',
            indices: [n - i - 1],
            message: `Element at index ${n - i - 1} is in its final position`,
        };
        
        if (!swapped) break;
    }
    
    yield {
        type: 'complete',
        indices: Array.from({ length: n }, (_, i) => i),
        message: 'Bubble Sort complete!',
    };
}

export function* selectionSort(array) {
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        yield {
            type: 'current',
            indices: [i],
            message: `Finding minimum element from index ${i} onwards`,
        };
        
        for (let j = i + 1; j < n; j++) {
            yield {
                type: 'compare',
                indices: [minIdx, j],
                message: `Comparing elements at indices ${minIdx} and ${j}`,
            };
            
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        
        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            
            yield {
                type: 'swap',
                indices: [i, minIdx],
                message: `Swapping elements at indices ${i} and ${minIdx}`,
            };
        }
        
        yield {
            type: 'sorted',
            indices: [i],
            message: `Element at index ${i} is in its final position`,
        };
    }
    
    yield {
        type: 'complete',
        indices: Array.from({ length: n }, (_, i) => i),
        message: 'Selection Sort complete!',
    };
}

export function* insertionSort(array) {
    const n = array.length;
    
    for (let i = 1; i < n; i++) {
        const key = array[i];
        let j = i - 1;
        
        yield {
            type: 'current',
            indices: [i],
            message: `Inserting element at index ${i} into sorted portion`,
        };
        
        while (j >= 0 && array[j] > key) {
            yield {
                type: 'compare',
                indices: [j, j + 1],
                message: `Comparing and shifting elements`,
            };
            
            array[j + 1] = array[j];
            j--;
            
            yield {
                type: 'shift',
                indices: [j + 1, j + 2],
                message: `Shifting element to the right`,
            };
        }
        
        array[j + 1] = key;
        
        yield {
            type: 'insert',
            indices: [j + 1],
            message: `Inserted element at index ${j + 1}`,
        };
    }
    
    yield {
        type: 'complete',
        indices: Array.from({ length: n }, (_, i) => i),
        message: 'Insertion Sort complete!',
    };
}

export function* mergeSort(array, start = 0, end = array.length - 1) {
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    
    yield {
        type: 'divide',
        indices: [start, mid, end],
        message: `Dividing array from ${start} to ${end} at ${mid}`,
    };
    
    yield* mergeSort(array, start, mid);
    yield* mergeSort(array, mid + 1, end);
    yield* merge(array, start, mid, end);
}

function* merge(array, start, mid, end) {
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    
    let i = 0, j = 0, k = start;
    
    while (i < left.length && j < right.length) {
        yield {
            type: 'compare',
            indices: [start + i, mid + 1 + j],
            message: `Comparing elements during merge`,
        };
        
        if (left[i] <= right[j]) {
            array[k] = left[i];
            i++;
        } else {
            array[k] = right[j];
            j++;
        }
        
        yield {
            type: 'merge',
            indices: [k],
            message: `Merging element at index ${k}`,
        };
        
        k++;
    }
    
    while (i < left.length) {
        array[k] = left[i];
        yield {
            type: 'merge',
            indices: [k],
            message: `Copying remaining element at index ${k}`,
        };
        i++;
        k++;
    }
    
    while (j < right.length) {
        array[k] = right[j];
        yield {
            type: 'merge',
            indices: [k],
            message: `Copying remaining element at index ${k}`,
        };
        j++;
        k++;
    }
    
    yield {
        type: 'merged',
        indices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        message: `Merged subarray from ${start} to ${end}`,
    };
}

export function* quickSort(array, low = 0, high = array.length - 1) {
    if (low < high) {
        const pivotIndex = yield* partition(array, low, high);
        
        yield* quickSort(array, low, pivotIndex - 1);
        yield* quickSort(array, pivotIndex + 1, high);
    }
    
    if (low === 0 && high === array.length - 1) {
        yield {
            type: 'complete',
            indices: Array.from({ length: array.length }, (_, i) => i),
            message: 'Quick Sort complete!',
        };
    }
}

function* partition(array, low, high) {
    const pivot = array[high];
    let i = low - 1;
    
    yield {
        type: 'pivot',
        indices: [high],
        message: `Selected pivot: ${pivot} at index ${high}`,
    };
    
    for (let j = low; j < high; j++) {
        yield {
            type: 'compare',
            indices: [j, high],
            message: `Comparing element at ${j} with pivot`,
        };
        
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            
            yield {
                type: 'swap',
                indices: [i, j],
                message: `Swapping elements at indices ${i} and ${j}`,
            };
        }
    }
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    
    yield {
        type: 'swap',
        indices: [i + 1, high],
        message: `Placing pivot at index ${i + 1}`,
    };
    
    yield {
        type: 'sorted',
        indices: [i + 1],
        message: `Pivot is in its final position`,
    };
    
    return i + 1;
}

export function* heapSort(array) {
    const n = array.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield* heapify(array, n, i);
    }
    
    yield {
        type: 'heap_built',
        indices: Array.from({ length: n }, (_, i) => i),
        message: 'Max heap built',
    };
    
    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        
        yield {
            type: 'swap',
            indices: [0, i],
            message: `Moving max element to index ${i}`,
        };
        
        yield {
            type: 'sorted',
            indices: [i],
            message: `Element at index ${i} is in its final position`,
        };
        
        yield* heapify(array, i, 0);
    }
    
    yield {
        type: 'complete',
        indices: Array.from({ length: n }, (_, i) => i),
        message: 'Heap Sort complete!',
    };
}

function* heapify(array, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n) {
        yield {
            type: 'compare',
            indices: [left, largest],
            message: `Comparing left child with parent`,
        };
        
        if (array[left] > array[largest]) {
            largest = left;
        }
    }
    
    if (right < n) {
        yield {
            type: 'compare',
            indices: [right, largest],
            message: `Comparing right child with largest`,
        };
        
        if (array[right] > array[largest]) {
            largest = right;
        }
    }
    
    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]];
        
        yield {
            type: 'swap',
            indices: [i, largest],
            message: `Swapping to maintain heap property`,
        };
        
        yield* heapify(array, n, largest);
    }
}

export default {
    bubbleSort,
    selectionSort,
    insertionSort,
    mergeSort,
    quickSort,
    heapSort,
};
