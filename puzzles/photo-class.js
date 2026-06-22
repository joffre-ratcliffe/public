class Photo {
    constructor (stuff) {
        this.stuff = stuff;
    }
    
    bringup() {
        console.log(this.stuff);
    }
}

const album = [
    ph1 = new Photo("a"), 
    ph2 = new Photo("b"),
    ph3 = new Photo("c"),
    ph4 = new Photo("d"),
    ph5 = new Photo("e"),
    ph6 = new Photo("f"),
    ph7 = new Photo("g"),
    ph8 = new Photo("h")
];

const faves = [ph1, ph3, ph7];
let showthese = [];

faves.forEach(function (fav) {
    let x = fav.stuff;
    showthese.push(x);
});
album.forEach(function (pic) {
    let aha = false;
    let x = pic.stuff;
    faves.forEach(function (dupe) {
        if (dupe === pic) {aha = true;}
    });
    if (!aha) {
        showthese.push(x);
    }
});
//console.log(showthese);
function* getNextPhoto() {
    yield* showthese;
}

const show = getNextPhoto();
let i = 0;
while (i <= showthese.length) {
    console.log(show.next());
    i++;
}
