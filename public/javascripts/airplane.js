 var socket = io.connect();

 socket.on('connect', function(err){
    console.log('I connected properly');
 })

socket.on('error', function(err) {
        console.log(err);
});

var index;
var indexb;
var diffa;
var diffb;

$(document).ready(function() {
    var sc = $('#seat-map').seatCharts({
        map: [
                        'aa__aaa__aa',
                        'aa__aaa__aa',
                        'aa__aaa__aa',
                        '___________',
                        'bb__bbb__bb',
                        'bb__bbb__bb',
                        '___________',  
                        'cc__ccc__cc', 
                        'cc__ccc__cc',
                        'cc__ccc__cc', 
                        'cc__ccc__cc',
                        '___________', 
                        'ddd_ddd_ddd',
                        'ddd_ddd_ddd',
                        'ddd_ddd_ddd', 
                        'ddd_ddd_ddd',
                        'ddd_ddd_ddd', 
                        'ddd_ddd_ddd', 
                        'ddd_ddd_ddd', 
                        'ddd_ddd_ddd', 
                        '___________',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        'eee_eee_eee',
                        '_ee_eee_ee_',  
        ],
        naming: {
            columns: ['A','B','C','','D','E','F','','H','J','K'],
            rows:['1','2','3','','6','7','','10','11','12','13','','20','21','22','23','24','25','26','27','','30','31','32','33','34','35','36','37','38','39'],
           
        },
        seats: {
            a: {
                price   : 99.99,
                classes : 'first-class', //your custom CSS class
                category: 'first-class'
            },
            b: {
                classes : 'second-class', 
                category: 'second-class', 
            },
            c: {
                classes : 'third-class', 
                category: 'third-class', 
            },
            d: {
                classes : 'fourth-class', 
                category: 'fourth-class',
            },    
            e: {
                classes : 'fifth-class',
                category: 'fifth-class',
            }    
        },
        click: function () {
            if (this.status() == 'available') {
                //do some stuff, i.e. add to the cart
                return 'selected';
            } else if (this.status() == 'selected') {
                //seat has been vacated
                return 'available';
            } else if (this.status() == 'unavailable') {
                //seat has been already booked
                return 'unavailable';
            } else {
                return this.style();
            }
        },
        legend: {
            node  : $('#legend'),
            items : [
                ['a', 'available', 'First Class (Dock A)'],
                ['b', 'available', 'Business Class (Dock B)'],
                ['c', 'available', 'Premium Economy Class (Dock C)'],
                ['d', 'available', 'Economy Class (Dock D)'],
                ['e', 'available', 'Lower Economy Class (Dock E)']
            ]
        },
    });

    //Make all available 'c' seats unavailable
   // sc.find('c.available').status('unavailable');

     sc.find('available').node().text(0);

    /*
    Get seats with ids 2_6, 1_7 (more on ids later on),
    put them in a jQuery set and change some css
    */
    sc.get(['2_6', '1_7']).node().css({
        color: '#ffcfcf'
    });

    var a = sc.get('1_A').node().text();
    //console.log(a);
    console.log(a);
    //console.log('Seat 1_2 costs ' + sc.get('1_2').data().price + ' and is currently ' + sc.status('1_2'));

    $('div.seatCharts-cell.seatCharts-space').filter(function(index) {
        return this.innerHTML <= 3;
    }).css("color","#FF9900");

    $('div.seatCharts-cell.seatCharts-space').filter(function(index) {
        return (this.innerHTML >= 6 && this.innerHTML <=7);
    }).css("color","#3a78c3");

    $('div.seatCharts-cell.seatCharts-space').filter(function(index) {
        return (this.innerHTML >= 10 && this.innerHTML <=13);
    }).css("color"," #FF00FF");

    $('div.seatCharts-cell.seatCharts-space').filter(function(index) {
       return (this.innerHTML >= 20 && this.innerHTML <=27);
    }).css("color"," #B9DEA0");

    $('div.seatCharts-cell.seatCharts-space').filter(function(index) {
       return (this.innerHTML >= 30 && this.innerHTML <=41);
    }).css("color"," #FF0000");

    socket.on('update', function (results) {
        index = Number(results['Seat_ID'].substring(0,2)) + '_' + results['Seat_ID'].substring(2,3);
        console.log(index); 
        console.log(results['Number_of_Baggage']);
        console.log('Initial update of map');


        console.log(results['Number_of_Baggage']);
        console.log(results['NumOfClaimBag']);
        diffa = results['Number_of_Baggage'] - results['NumOfClaimBag'];

        //sc.get(index).node().text(results['Number_of_Baggage']);
        sc.get(index).node().text(diffa);
        if(diffa >0 ){
           sc.status(index, 'unavailable');
        }
        else{
            sc.status(index, 'available');
        }
    })
    
    socket.on('newdata', function (results) {
        indexb = Number(results['Seat_ID'].substring(0,2)) + '_' + results['Seat_ID'].substring(2,3);
        console.log(results['Seat_ID'] + ' ' + results['Number_of_Baggage']);

        diffb = results['Number_of_Baggage'] - results['NumOfClaimBag'];
        //sc.get(indexb).node().text(results['Number_of_Baggage']);
        sc.get(indexb).node().text(diffb);
        if(diffb >0 ){
           sc.status(indexb, 'unavailable');
        }
        else{
            sc.status(indexb, 'available');
        }
        console.log('Just update redundant');
    })
});