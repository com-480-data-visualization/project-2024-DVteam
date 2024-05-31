var playerImg = document.getElementById('player-img');


function changePlayer(newPlayer) {
    var playerImages = document.querySelectorAll('.player-img-img');
    playerImages.forEach(function (img) {
        img.classList.remove('selected');
    });

    var playerNameHeading = document.getElementById('player-name');
    var playerBorn = document.getElementById('player-born');
    var playerHeight = document.getElementById('player-height');
    var playerWeight = document.getElementById('player-weight');
    var playerSince = document.getElementById('player-since');
    

    console.log(newPlayer);
    if (newPlayer == 'james') {

        playerImg.src = 'figures/james2.png';
        var clickedImg = document.getElementById('player-james');
        clickedImg.classList.add('selected');

        playerNameHeading.textContent = 'Lebron James';
        playerBorn.textContent = 'Born: December 30, 1984';
        playerHeight.textContent = 'Height: 6 ft 9 in';
        playerWeight.textContent = 'Weight: 250 lb';
        playerSince.textContent = 'NBA since: 2003';
    } else if (newPlayer === 'curry') {

        var clickedImg = document.getElementById('player-curry');
        clickedImg.classList.add('selected');
        playerImg.src = 'figures/curry2.png';

        playerNameHeading.textContent = 'Stephen Curry';
        playerBorn.textContent = 'Born: March 14, 1988';
        playerHeight.textContent = 'Height: 6 ft 2 in';
        playerWeight.textContent = 'Weight: 185 lb';
        playerSince.textContent = 'NBA since: 2009';
    } else if (newPlayer == 'harden') {

        var clickedImg = document.getElementById('player-harden');
        clickedImg.classList.add('selected');
        playerImg.src = 'figures/harden2.png';

        playerNameHeading.textContent = 'James Harden';
        playerBorn.textContent = 'Born: August 26, 1989';
        playerHeight.textContent = 'Height: 6 ft 5 in';
        playerWeight.textContent = 'Weight: 220 lb';
        playerSince.textContent = 'NBA since: 2009';
    } else if (newPlayer == 'empty') {
        playerImg.src = 'figures/white.png';

        playerNameHeading.textContent = '';
    }
}