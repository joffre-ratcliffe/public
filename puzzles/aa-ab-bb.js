//solution(11, 0, 0);
//solution(0, 0, 11);
//solution(0, 11, 0);
solution(5, 3, 3);

function solution (AA, AB, BB){
    console.log("inside solution");
    
    var totaliter = AA+AB+BB;
    var retstring = '';
    
    if (AA == 0 && AB == 0) {
        retstring = 'BB';
    }
    else if (BB == 0 && AB == 0) {
        retstring = 'AA';
    }
    else if (AA == 0 && BB == 0) {
        while (AB-- > 0) {
            retstring+='AB';
        }
    }
    else {
        for (let i=0; i<totaliter; i++) {
            console.log(i+',AA='+AA+',BB='+BB+',AB='+AB);
            if (AB > 0 && retstring.slice(-2) != 'AA') {
                    retstring+='AB';
                    AB--;
                }
            else if (BB > 0 && retstring.slice(-1) != 'B') {
                    retstring+='BB';
                    BB--;
                }
                else if (AA > 0 && retstring.slice(-1) != 'A') {
                    retstring+='AA';
                    AA--;
                }
                
            
            else {
                if (retstring.slice(-2) == 'BB' && AA > 0) {
                retstring+='AA';
                AA--;
            }
            else if (retstring.slice(-2) != 'BB' && AB > 0) {
                retstring+='AB';
                AB--;
            }
            else if (retstring.slice(-2) == 'AA' && BB > 0) {
                retstring+='BB';
                BB--;
            }
            else if (retstring.slice(-2) != 'AA' && AB > 0) {
                retstring+='AB';
                AB--;
            }
                
            }
            console.log(retstring);
        }
    }
    
    console.log(retstring);
}
