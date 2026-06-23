let arr = ["hey", "hey", "maui", "maui", "moana", "maui"];
let store = [];
let beg = [];

for (let word of arr) {
    if (!store[word]) {store[word] = 1;}
    else{store[word]++;}
    if (!beg[word.substring(0,1)]) {beg[word.substring(0,1)] = 1;}
    else {beg[word.substring(0,1)]++;}
}

console.log(store);
console.log(beg);
let target = '';
let max = 0;
for (let key in store) {
    if (store[key] > max) {
        max = store[key];
        target = key;
    }
}

console.log(target);
