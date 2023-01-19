import A from "./util/analyze.js";

Object.assign(window, window.calc);

window.main = {
    getRandomExample : () => {
        const randItem = array => array[Math.floor(Math.random() * array.length)]

        const atk = [
            "+2 a252 한카 분산 지진", 
            "+1 a252+ 속임수주사위 드닐레이브 고드름침 5타", 
            '노말테라 풀보정 머리띠 망나뇽 신속', 
            'a252 심록 풀테라 마스카나 트릭플라워', 
            'a252 테크니션 버섯모 마하펀치',
            'a252+ 머리띠 변신돌핀맨 비 웨이브태클',
            "풀보정 안경 애널라이즈 전기테라 자포코일 10만볼트",
            "c252 생구 사이코필드 카디나르마 분산 와이드포스",
            "풀보정 재앙의구슬 안경 위유이 불대문자",
            "1음모 c252+ 생구 타부자고 골드러시",
            "악테라 풀보정 구애안경 삼삼드래 악의파동",
            "+6 라우드본 플레어송"
        ]

        const def = [
            '풀보정 2철벽 크레베이스',
            'h252 b252+ d4 천진 라우드본',
            '+2 h252 b252+ d4 독테라 정화의소금 콜로솔트',
            'h4 마스카나',
            'h252 b252+ d4 휘석 럭키',
            'h252 b4 d252+ 저수 토오',
            'h252 b148 d108 모래날림 하마돈',
            'h252 d4 돌조 모래날림 마기라스',
            'h252 돌조 리플렉터 드닐레이브',
            'h252 d252+ 해피너스',
            'h4 드래펄트',
            'h252 부유 워시로토무'
        ]

        return randItem(atk) + ' vs ' + randItem(def)
    }

}

var blank = true;
window.onload = () => {
    const $input = document.querySelector('input#aaa');
    $input.value = main.getRandomExample();
    aaa();
    $input.style.color = '#999'

    $input.addEventListener('focus', () => {
        if (blank) {
            blank = false;
            $input.value = '';
            $input.style.color = '#000'
        }
    })
    $input.addEventListener('blur', () => {
        if (!$input.value) {
            blank = true;
            $input.value = main.getRandomExample();
            aaa();
            $input.style.color = '#999'
        }
    })
    
    HTMLCollection.prototype.forEach = Array.prototype.forEach;

    const needTooltips = document.getElementsByClassName('needTooltip');

    for (var i=0;i<needTooltips.length;i++) {
        needTooltips[i].addEventListener('mouseout', hideAllTooltip);
        needTooltips[i].addEventListener('mouseover', showTooltip);
        needTooltips[i].addEventListener('click', showTooltip);
    }

}

window.aaa = function () {
    const text = document.querySelector("#aaa").value;
    const gen = Generations.get(9);
    const analyzed = A.analyze(text);
    var result = "";
    if (!analyzed) {
        result = "Error";
    } else if (analyzed.iserr) {
        result = analyzed.errorText;
    } else {
        switch (analyzed.mode) {
            case 'vs':
                const aP = new Pokemon(
                    gen,
                    analyzed.attacker.name,
                    analyzed.attacker.options
                );
                const dP = new Pokemon(
                    gen,
                    analyzed.defender.name,
                    analyzed.defender.options
                );
                const move = new Move(gen, analyzed.move.name, analyzed.move.options)
                const field = new Field(analyzed.field)
        
                aP.options = analyzed.attacker.options
                dP.options = analyzed.defender.options
        
                A.beforeCalc(gen, aP, dP, move, field, analyzed);
        
                result = calculate(gen, aP, dP, move, field);
        
                result = new cResult(result.gen, result.attacker, result.defender, result.move, result.field, result.damage, result.rawDesc, analyzed)
                
                console.log(result.attacker ? JSON.stringify(result.attacker) : "");
                console.log(result.defender ? JSON.stringify(result.defender) : "");
                break;
            case 'firepower':

                result = '결정력 : ' + Math.floor(analyzed.firepower);

                break;
            case 'durability':

                result = '물리내구 : ' + Math.floor(analyzed.physicalDurability) + '<br>' + '특수내구 : ' + Math.floor(analyzed.specialDurability);

                break;
        }

        
        
    }

    document.querySelector("#result").innerHTML = result.fullDesc
        ? result.fullDesc()
        : result;

};

window.showTooltip = (e) => {
    let id = e.target.id
    setTimeout(function(){
        document.getElementById(id).style.visibility = 'visible'
        var x = e.pageX + 250 < window.innerWidth ? e.pageX : window.innerWidth - 250;
        document.getElementById(id).style.left = x + 'px';
        document.getElementById(id).style.top = e.pageY + 'px';
    }, 1);
}

window.hideAllTooltip = () => {
    document.getElementsByClassName('tooltip').forEach(element => {
        element.style.visibility = 'hidden';
    });
}

