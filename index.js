const VK = require('vk-io');
const axios = require('axios');
const cheerio = require('cheerio');

const vk = new VK({
    token: '9c5e1677c00e007a6467495c364403ed886857eb62fd2ae6180296234dad077beda47a8ab654c9c85f23e'
});

var signs = [
  {name:'козерог', m:1, d:20, desc: 'capricorn'},
  {name:'водолей', m:2, d:20, desc: 'aquarius'},
  {name:'рыбы',    m:3, d:20, desc: 'pisces'},
  {name:'овен',    m:4, d:20, desc: 'aries'},
  {name:'телец',   m:5, d:20, desc: 'taurus'},
  {name:'близнецы',m:6, d:21, desc: 'gemini'},
  {name:'рак',     m:7, d:22, desc: 'cancer'},
  {name:'лев',     m:8, d:23, desc: 'lion'},
  {name:'дева',    m:9, d:23, desc: 'virgo'},
  {name:'весы',    m:10,d:23, desc: 'libra'},
  {name:'скорпион',m:11,d:22, desc: 'scorpio'},
  {name:'стрелец', m:12,d:21, desc: 'sagittarius'},
  {name:'козерог', m:13,d:20, desc: 'capricorn'}
  ];

vk.longpoll.start()

vk.longpoll.on('message', (data)=> {
    let chat = data.chat;
    let text = data.text;
    switch (text) {
        case 'Ромасик':
        case 'Роман':
        case 'Ромка':
        case 'Рома':
            vk.api.messages.send({
                chat_id: data.chat,
                message: 'Привет'
            })
            break;
        case 'Рома, гороскоп':
            vk.api.users.get({
                user_ids: data.user,
                fields: 'bdate'
            })
            .then((data)=> {
                let sd = data[0].bdate;
                let pattern =  sd.replace( ".", "-" ).replace( ".", "-" ).split("-");
                pattern[2] = '1994';
                var dt = new Date(pattern[2], pattern[1] - 1, pattern[0]);


                let m = dt.getMonth() + 1;
                let d = dt.getDate();
                let hor = '';

                if (signs[m-1].d <= d) {
                    hor = signs[m].name;
                    desc = signs[m].desc;
                } else {
                    hor = signs[m-1].name;
                    desc = signs[m-1].desc;
                }
                axios.get('http://orakul.com/horoscope/astrologic/more/'+ desc +'/today.html')
                    .then(function (response) {

                        var $ = cheerio.load(response.data, {decodeEntities: false});
                        var dataHoro = $('.horoBlock p').html();

                        vk.api.messages.send({
                            chat_id: chat,
                            message: 'Гороскоп для знака ' + hor + '<br>' + dataHoro
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            });

            break;
        case 'Рома, праздники':
        axios.get('http://kakoysegodnyaprazdnik.ru/')
            .then(function (response) {
                var $ = cheerio.load(response.data, {decodeEntities: false});
                var str = '';
                var dataPrazdnik = $('#main_frame').find('span[itemprop="text"]').each(function (i, elem) {
                    str += '- ' + $(this).text() + ';<br>';
                });

                vk.api.messages.send({
                    chat_id: data.chat,
                    message: 'Праздники на сегодня сучки: <br> ' + str
                });
            })
            .catch(function (error) {
                console.log(error);
            });
            break;
    }
});
