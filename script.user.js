// ==UserScript==
// @name           FCup Script
// @name:tr        Futbolcup Scripti
// @name:de        Fcup-Tool

// @description    This script aims to improve the game appearance and increase your gaming experience by adding new features.
// @description:tr Bu script oyun görünümünü iyileştirmeyi ve yeni özellikler sunarak oyun deneyiminizi arttırmayı amaçlıyor.
// @description:de Dieses Skript zielt darauf ab, das Erscheinungsbild des Spiels zu verbessern und Ihr Spielerlebnis durch Hinzufügen neuer Funktionen zu verbessern.

// @version        4.0.0.0
// @icon           https://i.ibb.co/tJC5RX3/HFWRRt6.png

// @namespace      https://greasyfork.org/users/83290
// @author         Criyessei

// @homepage       https://greasyfork.org/tr/scripts/40715-fcup-script
// @supportURL     https://greasyfork.org/tr/scripts/40715-fcup-script/feedback

// @include        /^https?:\/\/(futbolcup.net|fussballcup.(de|at)|futbolcup.pl|footcup.fr|footballcup.nl).+/

// @require        https://code.jquery.com/jquery-3.3.1.min.js
// @require        https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require        https://raw.githubusercontent.com/AhmetEmsal/fcupScript/main/translate.js

// @compatible     chrome
// @compatible     firefox
// @compatible     opera

// @connect        greasyfork.org


// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_listValues
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @grant          unsafeWindow
// @grant          GM_info

// @license        MIT

// @run-at         document-body
// @noframes
// ==/UserScript==

/* eslint no-eval: 0, curly: 0, no-proto: 0, no-lone-blocks:0, no-sequences:0*/
/* global $, currentLive, worldId, toolTipObj, plObj, SelectBox, closeFocus, toolPipe, stadiumObj, Live, Cookies*/ //jquery script and Game veriables
/* global Translate */ //Translation.js

/* other dependencies game functions: (these functions will be modified)
       1. showServerTime: Necessary to take the server's time. [Temporary Modify]
       2. updateLayout: Necessary to understand that the page has changed and to detect that goals have been scored in other matches on the live match page. [Permanent Modify]
       3. Live: Neccessary to get old or new match events and to detect when the match is end on the live match page. [Permanent Modify]
       4. openCard: Necessary to display captain image. [Permanent Modify]
       5. messageScrollDown: Necessary to fix problem with scrolling down in chat. [Permanent Modify]
*/

"use strict";

if(typeof unsafeWindow.toolPipe != 'undefined') throw new Error("Script already works!");
if(location.protocol!='https:'){ //Routing to secure protocol
    let pageHref = location.href;
    location.href = 'https'+pageHref.substring(pageHref.indexOf(':'));
    return;
}
else if(location.search.indexOf('action=logout')!=-1){
    location.href = location.origin; //Go main page
    return;
}
console.clear();

const dev = !!GM_getValue('developer');

let serversDatas = {
    "tr":{
        "gameVersion"         : "2.4.1.718",
        "timeZone"            : "Europe/Istanbul",
        "flag"                : "TUR",
        "language"            : "Turkish",
        "footballerPositions" : ["KL", "DD", "DI", "OD", "OL", "OR", "OH", "FO"],
        "leagues"             : [
            "2. Amatör Lig",
            "1. Amatör Lig",
            "Süper Amatör Lig",
            "Bölgesel Amatör Lig",
            "TFF 3.Lig",
            "TFF 2.Lig",
            "Spor Toto 1.Lig",
            "Spor Toto Süper Lig"
        ],
        "replaceClubName"     : "'den Profil",
        "authorClubId"        : "670524",
        "ClubExchange"        : "Kulüp Değiştirme",
        "bidTexts"            : {
            'accept': 'kabul edildi',
            'reject': 'reddedildi',
            'read'  : 'okundu',
            'new'   : 'yeni'
        },
        'news'       : {
            "youngPlayer": {"title":'Genç Oyuncu',"beforeName":"yetiyor.","afterName":"Detaylı incele"},
            "increaseBid": {"title":"Transfer Pazarı","control":"tarafından geçildi.","beforeName":"Transfer Pazarı","afterName":"için transfer teklifin"},
            "sellPlayer" : {"title":"Assistent: Transfer Pazarı","control":"yıllık kontrat imzaladı","beforeName":"</h2>","afterName":", <div"}
        },
        "ageDates"   : []//[26402796, 26446632, 26490408, 26534184, 26579400, 26621736, 26665512, 26709288, 26753004, 26796780,26840676,26884452,26928228,26972004,27015780,27059556,27103332,27147108,27190884,27234660,27278436,27322212].map(v=> v-7200)
    },
    "de":{
        "gameVersion"         : "2.4.3.969",
        "timeZone"            : "Europe/Berlin",
        "flag"                : "DEU",
        "language"            : "German", /*The game language*/
        "footballerPositions" : ["TW", "AV", "IV", "DM", "LM", "RM", "OM", "ST"],
        "leagues"             : [
            "Kreisliga",
            "Landesliga",
            "Verbandsliga",
            "Oberliga",
            "Regionalliga",
            "3. Liga",
            "2. Bundesliga",
            "1. Bundesliga"
        ],
        "replaceClubName"     : "Profil von",
        "authorClubIds"       : {"Criyessei":"1468555", "mot33":"1286060"},
        "devManagerId"        : 'criyesse',
        "ClubExchange"        : "Vereinswechsel",
        "bidTexts"            : {
            'accept': 'akzeptiert',
            'reject': 'abgelehnt',
            'read'  : 'gelesen',
            'new'   : 'neu'
        },
        'news' : {
            "youngPlayer": {"title":'Jugendspieler',"beforeName":"diesen ","afterName":" mal"},
            "increaseBid": {"title":"Transfermarkt","control":"überboten","beforeName":"für ","afterName":" wurde"},
            "sellPlayer" : {"title":"Assistent: Transfermarkt","control":"ausgehandelt","beforeName":"Spieler ","afterName":" hat"},
            "rejectedBid": {"title":"Transfermarkt", "control":"abgelehnt.", "beforeName":"Ablöseangebot für", "afterName":"abgelehnt"},
            "acceptedBid": {"title":"Transfermarkt", "control":"angenommen.", "beforeName":"Ablöseangebot für", "afterName":"angenommen."},
            // "playerBought": {"title":"Transfermarkt", "control":"gewechselt.", "beforeName":"Spieler", "afterName":"ist vom Verein"},
        },
        "ageDates"            : [26402796, 26446632, 26490408, 26534184, 26579400, 26621736, 26665512, 26709288, 26753004, 26796780, 26840676, 26884452, 26928228, 26972004, 27015780, 27059556, 27103332, 27147108, 27190884, 27234660, 27278436, 27322212,/*cr*/ 27366042, 27409872, 27453702, 27497532, 27541362, 27585192, 27629022, 27672852, 27716682, 27760512]
    },
    "at":{
        "gameVersion"         : "2.4.3.969",
        "timeZone"            : "Europe/Vienna",
        "flag"                : "AUT",
        "language"            : "German",
        "footballerPositions" : ["TW", "AV", "IV", "DM", "LM", "RM", "OM", "ST"],
        "leagues"             : [
            "2. Klasse",
            "1. Klasse",
            "Gebietsliga",
            "2. Landesliga",
            "Landesliga",
            "Regionalliga",
            "Erste Liga",
            "Österreichische Bundesliga"
        ],
        "replaceClubName"     : "Profil von",
        "authorClubId"        : "1510674",
        "ClubExchange"        : "Vereinswechsel",
        "bidTexts"            : {
            'accept': 'akzeptiert',
            'reject': 'abgelehnt',
            'read'  : 'gelesen',
            'new'   : 'neu'
        },
        'news' : {
            "youngPlayer": {"title":'Jugendspieler',"beforeName":"diesen ","afterName":" mal"},
            "increaseBid": {"title":"Transfermarkt","control":"überboten","beforeName":"für ","afterName":" wurde"},
            "sellPlayer" : {"title":"Assistent: Transfermarkt","control":"ausgehandelt","beforeName":"Spieler ","afterName":" hat"}
        },
        "ageDates"            : [26542884,26588100,26630436,26674212,26717988,26761764,26805540]
    },
    "pl":{
        "gameVersion"         : "2.4.3.969",
        "timeZone"            : "Europe/Warsaw",
        "flag"                : "POL",
        "language"            : "Polish",
        "footballerPositions" : ["BR", "OZ", "OŚ", "DP", "LP", "PP", "OP","N"],
        "leagues"             : [
            "Klasa B",
            "Klasa A",
            "Liga okręgowa",
            "4 Liga",
            "3 Liga",
            "2 Liga",
            "1 Liga",
            "Ekstraklasa"
        ],
        "replaceClubName"     : "Profil",
        "authorClubId"        : "2074",
        "ClubExchange"        : "Zmienia klub",
        "bidTexts"            : {
            'accept': 'Zaakceptowane',
            'reject': 'Odrzucone',
            'read'  : 'przeczytana',
            'new'   : 'nowy'
        },
        'news' : {
            "youngPlayer": {"title":'Junior',"beforeName":"dokładniej","afterName":"i zaproś"},
            "increaseBid": {"title":"Rynek transferowy","control":"została przebita przez","beforeName":"spłaty za","afterName":"została"},
            "sellPlayer" : {"title":"Assistent: Rynek transferowy","control":"periodzie rynku transferowego","beforeName":"</h2>","afterName":"wynegocjował"}
        },
        "ageDates"            : [26196708, 26240484, 26284260, 26328036, 26371812, 26415588, 26459364, 26503140, 26546916, 26590692, 26634468, 26678244, 26722020, 26765796, 26809572, 26853348, 26897124, 26940900, 26984676, 27028452, 27072228, 27116004, 27159780, 27203556, 27247332],
    },
    "fr":{
        "gameVersion"         : "2.4.1.731",
        "timeZone"            : "Europe/Paris",
        "flag"                : "FRA",
        "language"            : "French",
        "footballerPositions" : ["GB", "DL", "DC", "Mdf", "MG", "MD", "MO", "BT"],
        "leagues"             : [
            "PH",
            "DHR",
            "DH",
            "CFA 2",
            "CFA",
            "National",
            "Ligue 2",
            "Ligue 1"
        ],
        "replaceClubName"     : "Profil de",
        "authorClubId"        : "169948",
        "ClubExchange"        : "Clubs Changer",
        "bidTexts"            : {
            'accept': 'approuvé',
            'reject': 'rejeté',
            'read'  : 'lu',
            'new'   : 'nouveau'
        },
        'news' : {
            "youngPlayer": {"title":'Jeune joueur',"beforeName":"d'œil sur ce","afterName":"..."},
            "increaseBid": undefined,
            "sellPlayer" : undefined
        },
        "ageDates"            : [25733556, 25778772, 25821109, 25864884, 25908660, 25952436, 25996212, 26039988, 26083764, 26127540, 26171316],
    },
    "nl":{
        "gameVersion"         : "2.4.1.731",
        "timeZone"            : "Europe/Amsterdam",
        "flag"                : "NLD",
        "language"            : "Dutch",
        "footballerPositions" : ["GK", "VV", "CV", "DM", "LM", "RM", "AM", "AV"],
        "leagues"             : [
            "4e Klasse",
            "3e Klasse",
            "2e Klasse",
            "1e Klasse",
            "Hoofdklasse",
            "Topklasse",
            "1e Divisie",
            "Eredivisie"
        ],
        "replaceClubName"     : "Profiel van",
        "authorClubId"        : "108310",
        //Aşağıdaki kısım düzeltilmeli!
        "ClubExchange"        : "Kulüp Değiştirme",
        "bidTexts"            : {
            'accept': 'Geaccepteerd',
            'reject': 'Afgewezen',
            'read'  : 'Gelezen',
            'new'   : 'Nieuw'
        },
        'news' : {
            "youngPlayer": {"title":'Jeugdspeler',"beforeName":"De speler","afterName":"zou zeker"},
            "increaseBid": {"title":"Transfer markt","control":"overboden","beforeName":"transferbod op","afterName":"werd door"},
            "sellPlayer" : undefined,
        },
        "ageDates"            : undefined
    }
};
let GetText = (key, opt={tag:1})=>Translate.getText(key, opt);

class Page{
    constructor(name, page_selector, run=null, sub_pages=null, parent_page=null){
        //essential params
        this.name = name;
        this.page_selector = page_selector;

        if(typeof run == 'function') this.run = run;

        //Page.sub_pages
        if(Array.isArray(sub_pages) && sub_pages.length){
            if(!Array.isArray(sub_pages[0])) sub_pages=[sub_pages];
            this.sub_pages = sub_pages.map((sub_page, i) => new Page(
                sub_page[0], //name
                sub_page[1], //page_selector
                sub_page.length>2?sub_page[2]:null, //page run function
                sub_page.length>3?sub_page[3]:null, //page sub pages
                this
            ));
            this.sub_pages.getByName = PageGetByName;
        }

        if(parent_page instanceof Page) this.parent_page = parent_page;

        this.features = [];
        this.features.getByName = FeatureGetByName;

        this.alwaysRunPartsOfFeas = [];
    }
    parentsByName(name){
        let temp = this.parent_page;
        while(temp instanceof Page && temp.name!=name) temp = temp.parent_page;
        return temp;
    }
    findPath(){
        let temp = this.parent_page,
            path = this.name;
        while(temp instanceof Page){
            path=temp.name+"->"+path;
            temp=temp.parent_page;
        }
        return path;
    }
    exec(){
        let res;
        if(typeof this.run == 'function') res = this.run();
        this.alwaysRunPartsOfFeas.forEach(([feature, runFunc])=>{
            runFunc.call(feature, this);
        });
        return res;
    }
}

let Game = new (class{
    constructor(){
        this.currentPage = null;
        this.link = new (function(){
            this.pr = {};
            this.parseURL = ()=>{
                this.pr = location.hash.substring(location.hash.indexOf('?')+1).split('&').reduce((acc, i)=>{
                    let p = i.split('=');
                    acc[p[0]] = p[1];
                    return acc;
                }, {});
            }
            this.on = function(a){
                if(!Array.isArray(a)) a = [a];
                for(let i=0,len=a.length;i<len;i++){
                    for(let p in a[i]){
                        let v=a[i][p];
                        if(!Array.isArray(v)) v = [v];
                        if(!(this.pr.hasOwnProperty(p) && v.includes(this.pr[p]))) return 0;
                    }
                }
                return 1;
            }
        })();
    }

    pageLoad(){
        return new Promise((res,rej)=>{
            setTimeout(()=>{
                if(!$('#body').hasClass('loading')) return res(10);
                let counter=0, a, b;
                b = setTimeout(()=>{
                    clearInterval(a);
                    res(1e4);
                }, 1e4);
                a = setInterval(()=>{
                    ++counter;
                    if(!$('#body').hasClass('loading')){
                        clearTimeout(b);
                        clearInterval(a);
                        res(counter*50);
                    }
                }, 50);
            }, 10);
        });
    }

    async initialConfigure(){
        delete this.__proto__.initialConfigure;

        //Difference between server and pc
        let now = Date.now();
        this.timeDifference = (
            await this.getInitialServerTime()
            + Math.round(Math.abs(window.performance.timing.responseEnd-window.performance.timing.requestStart)/2)
            + (now-window.performance.timing.responseEnd)
        ) - now;

        $('#chatToggleBtn').css('z-index', 9);
    }

    giveNotification(type, text){
        $('#feedback').prepend(
            `<p class="${type?'notice':'error'}" style="left: 0px;${type?'background:#1ba0de;border: 1px solid #000000;':''}">`+
            `   <span class="icon"></span>`+text+
            `</p>`
        );
        $('#feedback p:not(.minified)').each(function(a,e){
            $(e).css('left',($(document).width() - $(e).outerWidth()) / 2);
            setTimeout(()=>{
                $(e).addClass('minified').css({left : 0});
            },4000);
        });
        $('#feedback p').each(function(key){
            if(key>19) {
                $(this).slideUp(function(){
                    $(this).remove();
                });
            }
        });
    }

    getInitialServerTime(){
        delete this.__proto__.getInitialServerTime;
        return new Promise((res, rej)=>{
            $('<button id="TimeTrigger">').hide().appendTo('body').click(function(){
                $(this).off().remove();
                let server_time = JSON.parse($(this).attr('server_time'));
                Tool.modifyGameFunction('showServerTime', content=>{
                    return content.substring(content.indexOf('/*{end}*/')+9);
                });
                res(server_time);
            });
            Tool.modifyGameFunction('showServerTime', content=>{
                return `$('#TimeTrigger').attr('server_time',
                            (function getServerTime(args){
                                args[1] = parseInt(args[1])-1; // month [0-11]
                                return new Date(...args).getTime();
                            })([...arguments])
                        ).click();/*{end}*/` + content;
            });
        });
    }
    getTime(){
        return this.timeDifference + Date.now();
    }

    async detectPage(){
        let prev_page = this.currentPage;
        if(prev_page instanceof Page) console.clear();

        console.log('Game Time: ' + new Date(this.getTime()).toLocaleString());

        if(!!(Tool.settings.cb||{}).blurSomeInfos) ApplyToolSetting('blurSomeInfos', !0);

        this.link.parseURL();

        function find_page(pages){ //BFS Search
            if(!Array.isArray(pages) || !pages.length) return undefined;
            let page = pages.find(page=>{
                return Game.link.on(page.page_selector);
            });
            if(page!==undefined) return page;
            let pages_ = [];
            pages.filter(page=>{
                return page.sub_pages && Array.isArray(page.sub_pages) && page.sub_pages.length;
            }).forEach(page=>{
                pages_.push(...page.sub_pages);
            });
            return find_page(pages_);
        }

        this.currentPage = find_page(this.pages);
        console.log('Current Page : ' + (this.currentPage||{}).name+ (prev_page==null?"":"\nPrevious Page: " + prev_page.name));

        if(prev_page instanceof Page){
            delete Tool.temp;
            Tool.temp = {};

            //Özelliklerin olduğu tablo temizleniyor. Çünkü sayfa değiştirildi ve bu sayfada başka özellikler olabilir.
            Tool.featuresList.clear();

            //Önceki sayfalardan kalan sayaçlar sıfırlanıyor.
            Tool.intervals.clear();

            if(Tool.hasOwnProperty('leagueNavigation')){
                $(document.body).unbind('keyup', Tool.leagueNavigation);
                delete Tool.leagueNavigation;
            }
        }

        let globalFeatures = [];
        if(Game.globalPage instanceof Page){
            Game.globalPage.exec();
            globalFeatures.push(...Game.globalPage.features);
        }

        $('#ScriptMenu .not-detected-info').remove();
        if(this.currentPage == undefined){
            $('#featureList').after(
                `<p class="not-detected-info" style="color:red; font-weight:bold; text-align:center; border:1px dotted gray; border-radius:7px; margin:10px 0">${GetText('notdetected')}</p>`
            );
        }
        else{
            let failed = !1 === this.currentPage.exec();
            let pageFeatures = [];
            if(!failed){
                pageFeatures.push(...this.currentPage.features);
            }

            //Run only features that active
            let allFeatures = globalFeatures.concat(pageFeatures);
            allFeatures.filter(f=>f.active===true).forEach(f=>{
                if(!!f.runOnlyOneTime && f.workedOneTime) return;
                f.exec();
                if(!!f.runOnlyOneTime) f.workedOneTime = !0;
            });

            //Sayfalarda çalışan özelliklerin olduğu tablo gösteriliyor
            Tool.featuresList.show(allFeatures);
        }

        //Sayfanın düzeltildiği ana başlığa bildiriliyor.
        $('#content').find('h2:first').attr('fixed', this.getTime());
    }



    getPage(url,querySelector=null,callBack=null,fail=0,layoutData=null){
        //let argNames = ['url','querySelector','callBack','fail','layoutData'];
        //console.log(`[getPage] ${url}, arguments: %o`, Array.from(arguments).slice(1).reduce((acc,i,idx)=>{acc[argNames[idx+1]]=i;return acc;},{}));
        return new Promise((res,rej)=>{
            $.get(url, function(response){
                let layout = url.indexOf('&layout=none')!=-1,
                    page = $('<html>').html(layout?response.content:response);

                let newSecureId = page.find('input[name="secureId"][type="hidden"]');
                if(newSecureId.length) $('body').find('input[name="secureId"][type="hidden"]').val(newSecureId.first().val());

                if(layout && layoutData!=null){
                    if(!Array.isArray(layoutData)){
                        if(typeof layoutData != "string") throw new Error("layoutData must be array or string");
                        layoutData = [layoutData];
                    }
                    let data = Object.entries(response).filter(i=>layoutData.includes(i[0])), r;
                    if(querySelector != null && (r = data.find(i=>i[0]=='content'))!==undefined) r[1]=page.find(querySelector);
                    res(Object.fromEntries(data));
                    return;
                }

                if(typeof querySelector!='string' || (querySelector=querySelector.trim())==""){
                    res(page);
                    return;
                }
                let e = page.find(querySelector);
                if(e.length!=0){
                    if(typeof callBack=='function') callBack(e);
                    res(e);
                    return;
                }
                rej(new Error("Game->getPage->html->find->querySelector->length==0"));
            }).fail(function(){
                if(++fail<3){
                    setTimeout(()=>{Game.getPage(url,querySelector,callBack,fail);},250);
                }
                else rej(new Error("Game->getPage->fail 3 times"));
            }).always(function(){
            });
        });
    }
})();
Game.pages = new (class GamePages extends Array{
    constructor(...args){
        super(...args);
        this.getByName = PageGetByName;
    }

    add(name, ...oargs){
        if(this.getByName(name) instanceof Page) throw new Error(`A page with this name(${name}) was previously created as top page!`);
        let page = new Page(name, ...oargs);
        this.push(page);
        return page;
    }
})();

//CATEGORY: TEAM
Game.pages.add('squad',{
    'module':'team','action':'squad'
},function(){
    let table = $('#players-table-changes'),
        comingPlayers = table.find('>tbody> tr:has(.open-card)');
    if(comingPlayers.length){
        let totalStrength = comingPlayers.toArray().reduce((acc, row)=> acc+parseInt($(row).find('>td:nth-child(4)').text()), 0);
        table.prev().append(`<span style="float:right;">${comingPlayers.length} ${comingPlayers.length>1?GetText('Players'):GetText('Player')} (${totalStrength} Ø)</span>`);
    }
});
Game.pages.add('formation',{
    'module':'formation','action':['index', 'type']
},function(){
    if($('#squad >span.field-player:first').length || $('#bank >span.field-player').length ){
        if($('#squad >span.field-player:first').length){
            Create('squad');
            $('#squad').css('height', 'auto');
        }
        if($('#bank >span.field-player:first').length) Create('bank', 27);

        function Create(divId, addHeight=0){
            $('#'+divId).css('min-height',parseInt($('#'+divId).css('height'))+addHeight).find('>h3:first').after(
                '<p class="sorting_players">'+
                '   <label>'+
                '      <input type="radio" name="sorting_preference_'+divId+'" value="Position">'+GetText('Position')+
                '   </label>'+
                '   <label>'+
                '      <input type="radio" name="sorting_preference_'+divId+'" value="Strength">'+GetText('Strength')+
                '   </label>'+
                '</p>'+
                '<p class="filterByPositions"></p>'
            );
            let positions = [...new Set($('#'+divId).find('span.field-player').toArray().map(e=>$('>div >div.position',e).text()))],
                POSITIONS = Tool.footballerPositions;
            positions.sort((a,b)=> POSITIONS.findIndex(x=>x==a)-POSITIONS.findIndex(x=>x==b));

            let filterByPositions = $('#'+divId+' > p.filterByPositions'),
                b_colors = ['green','#72ed72','#72ed72','#3f8a83','yellow','yellow','yellow','red'],
                f_colors = ['white','black','black','white','black','black','black','white'];
            positions.forEach(pos=>{
                let index = POSITIONS.findIndex(x=>x==pos);
                filterByPositions.append(`<span class="filter_position disHighlight" style="background-color:${b_colors[index]};color:${f_colors[index]};">${pos}</span>`);
            });
            filterByPositions.find('.filter_position').click(function(){
                $(this).css("pointer-events", "none");
                let isActive = !$(this).hasClass('not_active'),
                    pos = $(this).text();
                $(this)[isActive?'addClass':'removeClass']('not_active').parents('div.ui-droppable').find('span.field-player').each(function(){
                    if($('> div > div.position',this).text()==pos) $(this)[isActive?'slideUp':'slideDown'](200);
                });
                setTimeout(()=>$(this).css("pointer-events", ""),200);
            });
        }
        $('#squad, #bank').find('>.sorting_players input').click(function(){
            let div = $(this).parents('div.ui-droppable'),
                players = div.find('span.field-player'),
                positions = Tool.footballerPositions;
            switch(this.value){
                case 'Position':
                    players.sort(function(a,b){
                        let compare;
                        if(compare = positions.findIndex(x=>x==$(' > div > div.position',a).text()) - positions.findIndex(x=>x==$(' > div > div.position',b).text())) return compare;
                        else if(compare = parseInt($(' > div > div.strength',b).text())-parseInt($(' > div > div.strength',a).text())) return compare;
                        return plObj[a.id.split('-')[2]].age-plObj[b.id.split('-')[2]].age;
                    }).appendTo(div);
                    break;
                case 'Strength':
                    players.sort(function(a,b){
                        let compare;
                        if(compare = parseInt($(' > div > div.strength',b).text()) - parseInt($(' > div > div.strength',a).text())) return compare;
                        else if(compare = positions.findIndex(x=>x==$(' > div > div.position',a).text()) - positions.findIndex(x=>x==$(' > div > div.position',b).text())) return compare;
                        return plObj[a.id.split('-')[2]].age-plObj[b.id.split('-')[2]].age;
                    }).appendTo(div);
                    break;
            }
        });

        let sorting_preferences = undefined || {squad:'Position',bank:'Strength'}
        $('#squad .sorting_players input[value="'+sorting_preferences.squad+'"]:first').click();
        $('#bank .sorting_players input[value="'+sorting_preferences.bank+'"]:first').click();
    }

    //To show the leadership values of football players
    {
        $('#formation-select-captain > span > select > option:not([value="0"])').each(function(){
            let playerId = this.value;
            if(!plObj[playerId]) return true;
            let attr_leadership = parseInt(plObj[playerId].attr_leadership),
                text = $(this).html(),
                find = text.indexOf(')');
            if(find==-1) return true;
            $(this).html("(" + attr_leadership + ")" + text.substring(find+1));
        });

        let selectedCaptain = plObj[$('#formation-select-captain > span > select > option:selected').val()];
        if(selectedCaptain){
            let attr_leadership = selectedCaptain.attr_leadership,
                text = $('#formation-select-captain > span > div.button > span.text').html(),
                find = text.indexOf(')');
            $('#formation-select-captain > span > div.button > span.text').html("(" + attr_leadership + ")" + text.substring(find+1));
        }

        let li = $(SelectBox.instances[$('#formation-select-captain > span').attr('instance')].expand[0]).find('li') ;
        li.each(function(){
            let playerId = this.getAttribute('idvalue');
            if(!plObj[playerId]) return true;
            let attr_leadership = parseInt(plObj[playerId].attr_leadership),
                text = $(this).html(),
                find = text.indexOf(')');
            if(find==-1) return true;
            $(this).html("(" + attr_leadership + ")" + text.substring(find+1));
            $(this).attr('leadership',attr_leadership);
        });

        let arr = li.map(function(_, o) {
            return {
                text       : $(o).text(),
                idvalue    : $(o).attr('idvalue'),
                leadership : $(o).attr('leadership')
            };
        }).get();

        arr.sort((o1, o2)=>{ return o2.leadership-o1.leadership;});

        li.each(function(i, option) {
            $(option).text(arr[i].text).attr({
                'idvalue':arr[i].idvalue,
                'leadership':arr[i].leadership
            });
        });
    }

    let abilities = [
        {name:'freekick', img: Tool.sources.get('freekick')},
        {name:'corner', img: Tool.sources.get('corner')},
        {name:'penalty', img: Tool.sources.get('penalty')},
        {name:'captain', img: Tool.sources.get('captain'), style:'height: 7px;position: absolute;top: 2px;left: -10px;transform: rotate(45deg);'}
    ];
    abilities.map(ability=>{
        let sb = Object.values(SelectBox.instances).find(sb=>$(sb.baseElement[0]).is(`[name="${ability.name}"]`)), plId, div;
        if(sb===undefined || (plId=sb.initValue)==0) return false;
        ability.sb = sb;
        ability.plId = plId;
        if((div=$(`#field-player-${plId}>div.own-player`)).length==0) return false;
        ability.div = div;
        return ability;
    }).filter(t=>t!==false).forEach(ability=>{
        let left = null;
        if(ability.name!='captain'){
            left = -16;
            let e = ability.div.find('.ability_img:last');
            if(e.length) left = parseInt(e.css('left'))+ e.outerWidth()+ 3;
        }
        ability.div.append(
            `<img id="ability_${ability.name}" class="ability_img" src="${ability.img}" style="${ability.style||'box-sizing:border-box; position: absolute; bottom:-5px; height:13px; background: darkseagreen; border-radius: 2px; border: 0.1px dashed black;'}">`
        );
        if(left!=null) $('#ability_'+ability.name).css('left',left);
        let func = ability.sb.removeOptionByValue;
        ability.sb.removeOptionByValue = (x)=>{
            func.call(ability.sb, x);
            if(x == ability.plId){
                setTimeout(()=> $('#ability_'+ability.name).remove(), 100);
            }
        }
    });
});
Game.pages.add('training',{
    'module':'team','action':['index','trainingBookPremium','book']
},null,[
    [
        'groups',
        {'module':'team','action':'groups'}
    ],[
        'settings',
        {'module':'team','action':'settings'},
        function(){
            $('#groupNameForm >table >tbody:first >tr >td.last-column input')
                .attr('maxlength', 16)
                .mouseenter(function(){
                $(this).focus().attr('placeHolder', $(this).val()).val('');
            })
                .mouseleave(function(){
                if($(this).val().trim()=="") $(this).val($(this).attr('placeHolder'));
                $(this).removeAttr('placeHolder').focusout();
            });
        }
    ]
]);
Game.pages.add('camp',{
    'module':'team','action':'camp'
});
Game.pages.add('scout',{
    'module':'transfermarket','action':'scout'
});
Game.pages.add('transfermarket',{
    'module':'transfermarket','action':'index'
},function(){

    // Filtering by whether the player is a foreigner or not
    {
        $('.table-container:first').children().first().after(
            `<div id="show_transfermarket_filter" style="margin:5px 0;">`+
            `&#10148; <span id="ShowAllPlayers" style="cursor:pointer;background-color:green;padding:2px;margin-left:-2px;border-radius:7px;">${GetText('ShowAllPlayers')}</span><br>`+
            `&#10148; <span id="OnlyForeignPlayers" style="cursor:pointer;" >${GetText('OnlyForeignPlayers')}</span><br>`+
            `</div>`
        );
        $('#ShowAllPlayers').click(function(){
            $('#content >div.container.transfermarket >div.table-container >table:first >tbody >tr').each(function(i){
                $(this).show().attr('class', i%2?"even":"odd");
            });
            $(this).css({
                'background-color':'green',
                'padding':'2px',
                'margin-left':'-2px',
                'border-radius':'7px'
            });
            $('#OnlyForeignPlayers')[0].style = "cursor:pointer;";
        });
        $('#OnlyForeignPlayers').click(function(){
            let counter=0;
            $('#content >div.container.transfermarket >div.table-container >table:first >tbody >tr').each(function(){
                if(!$('td:nth-child(1) > img',this).attr('src').endsWith(Tool.flag+'.gif')){
                    $(this).show().attr('class',counter++%2?'even':'odd');
                }
                else $(this).hide();
            });
            $(this).css({
                'background-color':'green',
                'padding':'2px',
                'margin-left':'-2px',
                'border-radius':'7px'
            });
            $('#ShowAllPlayers')[0].style = "cursor:pointer;";
        });
    }


    // To delete the club name in the player search by club name
    $(`<img style="float:right;margin:2px 2px 0 0;cursor:pointer;" src="${Tool.sources.get('remove')}" alt="remove.png" width="10px">`)
        .insertAfter('#club')
        .click(function(){
        (e=>{
            let text = e.val(),
                length = text.length;
            while(length>0){
                setTimeout(function(){
                    let t = e.val();
                    e.val(t.substring(0, t.length-1));
                },(text.length-length)*25);
                length--;
            }
        })($(this).prev());
    });

    // To fit text in tr server
    if(Game.server == 'tr') $('#age_min').closest('li').next().find('>span:first').css('margin-left','-34px').html('Yerli Futbolcu');

    if($('#club').val().trim() != Tool.clubName){
        // To show our own club's transfer market:
        $(CreateButton(
            null,
            GetText('ShowMyMarket'),
            `margin-Right:12px; top:71px; right:0; position:absolute; z-index:${$('#content .search-container:first').css('z-index')};`
        ))
            .appendTo('#content >.container:first')
            .click(function(){
            $('#age_min').val(16);
            $('#age_max').val(34);
            $('#searchform >ul >li.strength >span:nth-child(2) >input[type="text"]').val(0);
            $('#searchform >ul >li.strength >span:nth-child(3) >input[type="text"]').val(999);
            $('#positions').val(0);
            $('#club').val(Tool.clubName);
            $('#searchform >ul >li.transfermarket-search-button >span >a >span').click();
        });
    }
    else{
        // To show total bid
        let totalBid = 0;
        $('#content >div.container.transfermarket >div.table-container >table >tbody >tr').each(function(){
            let o = $('>td:nth-child(7)', this).find('.currency-number');
            if(o.length) totalBid += parseInt(o.first().text().replace(/\./g,''));
        });
        if(totalBid>0){
            $('#content >div.container.transfermarket >div.table-container >table >tfoot >tr').html(
                `<td colspan="5"></td>`+
                `<td colspan="2" style="color:#edfdff;font-weight:bold;text-align:right;">${GetText('totalBid')}: ${Number2String(totalBid)} <span class="icon currency"></span></td>`+
                `<td colspan="3"></td>`
            );
        }
    }


    // To change into next or prev page of the transfer market with the left and right arrow keys
    if($('#container .pager').length){
        let handler = function(e){
            let kc = e.keyCode;
            if(kc!=37 && kc!=39) return;
            if($(document.body).find('.ui-dialog:visible').length || ['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) return;

            let a=null;
            if(kc==37) a = $('#container .pager > strong:first').prev()[0];
            else if(kc==39) a = $('#container .pager > strong:first').next()[0];
            if(a!=null && a.tagName=='A'){
                a.click();
                $(document.body).unbind('keyup', handler);
            }
        };
        $(document.body).keyup(handler);
    }


    let passingAgingDate = Tool.aging.lastPassingDate,
        nextAgingDate = Tool.aging.getNearestAgingDate();
    if(passingAgingDate!=null && nextAgingDate!=null){

        //To show the actual age of players in the transfer market in decimal
        let decimalPartOfAging = GetDecimalPartOfAging(passingAgingDate, nextAgingDate, new Date(Game.getTime()))
        if(decimalPartOfAging != null){
            $('#content table:has(>tbody>tr .open-card:first) >tbody >tr >td:nth-child(5)').each(function(){
                let age = parseInt($(this).text());
                $(this).attr('age', age).text(age+decimalPartOfAging);
            });
        }

        // Moving the cursor to the text of the player's age will show how old this player will be if purchased.
        let table = $('#content >div.container.transfermarket >div.table-container >table:first');
        if(table.find('>tbody >tr:eq(0)').length && table.find('>tbody >tr:eq(0) >td:eq(1)').length){
            calcFotballerComingTime()
                .then(footballerComingTime=>{
                if(isNaN(footballerComingTime)) return;

                let doJumpAge = footballerComingTime>=nextAgingDate.getTime(),
                    decimalPartOfAging = null;
                if(!doJumpAge) decimalPartOfAging = GetDecimalPartOfAging(passingAgingDate, nextAgingDate, new Date(footballerComingTime));
                else if(Tool.aging.dates[1] != undefined)
                    decimalPartOfAging = GetDecimalPartOfAging(nextAgingDate, Tool.aging.convert2Date(Tool.aging.dates[1]), new Date(footballerComingTime));

                if(decimalPartOfAging != null)
                    table.find('>tbody >tr >td:nth-child(5)')
                        .mouseenter(function(){
                        let td = $(this);
                        let age = parseInt(td.attr('age'));
                        td.attr('orj-text', td.text());
                        if(doJumpAge) ++age;
                        age += decimalPartOfAging;
                        td.text(age);
                    })
                        .mouseleave(function(){
                        let td = $(this);
                        td.text(td.attr('orj-text'));
                        td.removeAttr('orj-text');
                    });
            });

            function calcFotballerComingTime(){
                return new Promise(async (res)=>{
                    let LeagueData = Tool.getVal('LeagueData'), save = !0;
                    if(typeof LeagueData=='object' && (LeagueData.lastMatchDate+86400000)>Game.getTime()) save = !1;

                    if(save){
                        let content = await Game.getPage('?w='+worldId+'&area=user&module=statistics&action=games','#content');
                        LeagueData = SaveLeagueData(content);
                        if(LeagueData==!1) return res(!1)
                    }

                    let aDay = 24*60*60*1e3,
                        timeToMs = (t)=> ((t.h*60+t.m)*60+t.s)*1e3,
                        fComingTime = timeToMs({h:6, m:0, s:0}),
                        tmChangingTime = timeToMs({h:0, m:0, s:0});

                    let {firstMatchDate, firstHalfFinalMatchDate, lastMatchDate} = LeagueData,
                        now = Game.getTime();

                    if((firstMatchDate-1*aDay+fComingTime)>now)/*Alınan Oyuncu Bir Sonraki Gün Gelecek*/
                        res(new Date( new Date(now).getFullYear(), new Date(now).getMonth(), new Date(now).getDate()+1 ).getTime() + fComingTime);
                    else if((firstHalfFinalMatchDate+fComingTime)>now)/*Alınan Oyuncular Lig Arasında Gelecek*/
                        res(firstHalfFinalMatchDate+aDay+fComingTime);
                    else res(lastMatchDate+aDay+fComingTime); /*Alınan Oyuncu Lig Sonunda Gelecek*/
                });
            }
        }
    }
});

//CATEGORY: SEASON
Game.pages.add('fixture',{
    'module':'statistics','action':'games'
}, function(){
    // To navigate prev and next league by pressing up and down keys
    createLeagueNavitagion(
        '#leagueCatalogueForm >ul >li:nth-child(1)',
        $('#leagueCatalogueForm >ul >li.league-search-button span[onclick]:first')
    );

    // Animation when hovering the cursor over the table showing cross matches
    let table = $('#league-crosstable');
    if(table.length){
        table.find('>tbody .club-logo-container').css({
            'display':'inline-block',
            'vertical-align':'middle'
        });

        table.find('>tbody td:not(.nomatch):not(:nth-child(1))').mouseenter(function(){
            let td = $(this), row = td.parent(), tbody = row.parent(),
                a = row.find('>td:first a[clubid]:first'),
                bColor = a.hasClass('self-link')? '#ff0': '#37f6e9cc',
                color = a.hasClass('self-link')? undefined: 'aqua';
            a.css('color', color).addClass('highlight2');
            while((td=td.prev()).length && td.index()>0) td.css('background-color', bColor).addClass('highlight');
            td = $(this);

            a = tbody.find(`>tr:nth-child(${this.cellIndex}) >td:first a[clubid]:first`);
            bColor = a.hasClass('self-link')? '#ff0': '#37f6e9cc';
            color = a.hasClass('self-link')? '#ff0' : 'aqua';
            $(`#league-crosstable >thead >tr:first>th:nth-child(${this.cellIndex+1})`).css('color', color).addClass('highlight2');
            for(let i=1; i<row[0].rowIndex; i++) tbody.find(`>tr:nth-child(${i})>td:nth-child(${this.cellIndex+1})`).css('background-color', bColor).addClass('highlight');

            td.css('background-color','#35e16fe8').find('>p').css({'font-weight':'bold', 'color':'darkred'});
        }).mouseleave(function(){
            $(this).css('background-color','').find('>p').css({'font-weight':'', 'color':''});
            table.find('>tbody td.highlight').removeClass('highlight').css('background-color', '');
            table.find('.highlight2').removeClass('highlight2').css('color', '');
        });
    }



    // Adding a button to go to the league table with the league fixture shown
    {
        let form = $('#leagueCatalogueForm'),
            li = form.find('> ul > li:nth-child(1)'),
            l1 = li.find('[name="leagues[0]"]:first').val(),
            l2 = li.find('[name="leagues[1]"]:first').val(),
            l3 = li.find('[name="leagues[2]"]:first').val();
        form.after(
            `<li style="margin-top: 3px; padding-left: 0;">`+
            `   <span class="button button-container-ButtonDefault">`+
            `      <a class="button" href="#/index.php?w=${worldId}&area=user&module=statistics&action=table&leagues%5B0%5D=${l1}&leagues%5B1%5D=${l2}&leagues%5B2%5D=${l3}">`+
            `         <span class="ButtonDefault">${GetText('goLeagueTablePage')}</span>`+
            `      </a>`+
            `   </span>`+
            `</li>`
        );
    }
});
Game.pages.add('league',{
    'module':'statistics','action':'table'
}, function(){
    // To navigate prev and next league by pressing up and down keys
    createLeagueNavitagion(
        '#leagueCatalogueForm >ul >li:nth-child(1)',
        $('#leagueCatalogueForm >ul >li.league-search-button span[onclick]:first')
    );

    // To add buttons to navigate fixture and betoffice page
    {
        let form = $('#leagueCatalogueForm'),
            li = form.find('>ul >li:nth-child(1)'),
            l1 = li.find('[name="leagues[0]"]:first').val(),
            l2 = li.find('[name="leagues[1]"]:first').val(),
            l3 = li.find('[name="leagues[2]"]:first').val();
        form.after(
            `<li style="margin-top: 3px; margin-left:-13px; padding-left: 0; padding-right:0;">`+
            `   <span class="button button-container-ButtonDefault">`+
            `      <a class="button" href="#/index.php?w=${worldId}&area=user&module=statistics&action=games&leagues%5B0%5D=${l1}&leagues%5B1%5D=${l2}&leagues%5B2%5D=${l3}">`+
            `         <span class="ButtonDefault">${GetText('goLeagueFixturePage')}</span>`+
            `      </a>`+
            `   </span>`+
            `</li>`+


            `<li style="margin-top: 3px; padding-left: 0;">`+
            `   <span class="button button-container-ButtonDefault">`+
            `      <a class="button" href="#/index.php?w=${worldId}&area=user&module=betoffice&action=index&${false?'gameDay=6&':''}leagues%5B0%5D=${l1}&leagues%5B1%5D=${l2}&leagues%5B2%5D=${l3}">`+
            `         <span class="ButtonDefault">${GetText('goLeagueBetofficePage')}</span>`+
            `      </a>`+
            `   </span>`+
            `</li>`
        );
    }
});
Game.pages.add('friendly',{
    'module':'friendly'
},function(){
    if(!$('#own-invitations-table >tbody >tr').find('.no-invites').length){
        //Kendi arkadaşlık maç davetlerimizin silinmesi
        $(CreateButton('ClearInvitations', GetText('CancelUnnecessaryDays'),'float:right;margin-right:5px;'))
            .appendTo('#invitations > div.table-container > div:nth-child(1) > h3')
            .click(function(){
            let doluTarihler = {};
            $('#friendly-matches >tbody >tr').each(function(){
                doluTarihler[$('>td:nth-child(2)', this).attr('sortvalue')] = '';
            });

            let silinecekIstekKeyleri = [];
            $('#own-invitations-table >tbody >tr').each(function(){
                if(doluTarihler[$('>td:nth-child(2)', this).attr('sortvalue')]===''){
                    let href = $('td.last-column >a', this)[0].href;
                    silinecekIstekKeyleri.push(href.substring(href.indexOf('delete=')+7, href.lastIndexOf('&')) );
                }
            });

            async function clearInvitations(){
                if(!silinecekIstekKeyleri.length){
                    Game.detectPage();
                    return;
                }
                var key = silinecekIstekKeyleri[0];
                silinecekIstekKeyleri.splice(0,1);
                location.href = "#/index.php?w="+worldId+"&area=user&module=friendly&action=index&delete="+key;
                await Game.pageLoad();
                clearInvitations();
            }
            if(silinecekIstekKeyleri.length) clearInvitations();
        });
    }
});
Game.pages.add('simulation',{
    'module':'simulation'
},function(){
    let LeagueData = Tool.getVal('LeagueData');
    if(LeagueData!=undefined){
        if((LeagueData.lastMatchDate+86400000)>Game.getTime()){
            let clubs = LeagueData.clubs;
            $('#simulations >tbody').find('.name-column').each(function(){
                let a = $(this).find('a:first'),
                    clubId = a.attr('clubid');
                if(!clubs.hasOwnProperty(clubId)) return;
                $(this).parent().css('background','green').attr({
                    'title': GetText('SameLeague', {tag:0}),
                    'tool_tt': 'SameLeague'
                });
            })
        }
        else Tool.delVal('LeagueData');
    }
});
Game.pages.add('tournament',{
    'module':'tournament','action':['index','tournament','holding']
});
Game.pages.add('betoffice',{
    'module':'betoffice'
}, function(){
    // To navigate prev and next league by pressing up and down keys
    createLeagueNavitagion(
        '#leagueCatalogueForm >ul >li:nth-child(2)',
        $('#leagueCatalogueForm >ul >li span[onclick]:first')
    );

    // Adding a button to go to the league table with the league betts shown
    {
        let form = $('#leagueCatalogueForm'),
            li = form.find('> ul > li:nth-child(2)'),
            l1 = li.find('[name="leagues[0]"]:first').val(),
            l2 = li.find('[name="leagues[1]"]:first').val(),
            l3 = li.find('[name="leagues[2]"]:first').val();
        form.find('>ul:first').append(
            `<li style="padding-left: 0;">`+
            `   <span class="button button-container-ButtonDefault">`+
            `      <a class="button" href="#/index.php?w=${worldId}&area=user&module=statistics&action=table&leagues%5B0%5D=${l1}&leagues%5B1%5D=${l2}&leagues%5B2%5D=${l3}">`+
            `         <span class="ButtonDefault">${GetText('goLeagueTablePage')}</span>`+
            `      </a>`+
            `   </span>`+
            `</li>`
        );
        let betForm = $('#bet-form');
        betForm.prev('.date-selector').css({'border-bottom':'0', 'padding-bottom':0}).after('<div style="display: block; clear: both;"></div>');
        betForm.find('>div.matches').css({'top':'unset', 'margin-top':'0', 'padding-top':'0'}).before('<div style="display: block; clear: both;"></div>');
    }


});

//CATEGORY: CLUB MANAGEMENT
Game.pages.add('sponsors',{
    'module':'club','action':'sponsors'
});
Game.pages.add('publicrelations',{
    'module':'publicrelations'
});
Game.pages.add('assistants',{
    'module':'assistants'
},function(){
    let bars = $('#assistants').find('.bar'),
        values = [];
    bars.each(function(){
        let w = parseInt(this.style.width.replace('%',''));
        values.push(w);
        this.style.width = '0%';
        $(this).attr('data_width', w);
    });
    if(values.length){
        Tool.intervals.create(function(){
            for(let i = 0, width ; i < bars.length ; i++){
                width = bars[i].style.width;
                width = parseInt(width.substring(0,width.lastIndexOf('%')));
                if(width<values[i]) bars[i].style.width = (width+1)+'%';
                else{
                    bars.splice(i,1);
                    values.splice(i,1);
                }
            }
            if(!bars.length) this.delete();
        },20,'Asistants');
    }
});
Game.pages.add('finances',{
    'module':'finances'
});
Game.pages.add('stadium',{
    'module':'stadium'
});
Game.pages.add('buildings',{
    'module':'buildings'
});
Game.pages.add('shop',{
    'module':'shop'
});

//CATEGORY: STATISTICS
Game.pages.add('rating',{
    'module':'rating'
});
Game.pages.add('statistics',{
    'module':'statistics','action':'season'
});
Game.pages.add('tournament_history',{
    'module':'tournament','action':'history'
});
Game.pages.add('squadstrenght',{
    'module':'statistics','action':'squadstrenght'
});
Game.pages.add('goalgetter',{
    'module':'statistics','action':'goalgetter'
});
Game.pages.add('sales',{
    'module':'statistics','action':'sales'
});
Game.pages.add('team_history',{
    'module':'team','action':'history'
});

//CATEGORY: COMMUNITY
Game.pages.add('press',{
    'module':'press','action':'index'
},null,[
    [
        'article',
        {'module':'press','action':'article'}
    ],[
        'topnews',
        {'module':'press','action':'topnews'}
    ],[
        'settings',
        {'module':'press','action':'settings'}
    ],[
        'comment',
        {'module':'press','action':'comment'}
    ]
]);
Game.pages.add('friends',{
    'module':'friends'
});
Game.pages.add('neighbors',{
    'module':'main','action':'neighbors'
});
Game.pages.add('signatures',{
    'module':'profile','action':'signatures'
});

//CATEGORY: CLUB
Game.pages.add('premium',{
    'module':'premium'
});
Game.pages.add('menager_profile',{
    'module':'profile','action':'index'
});
Game.pages.add('club_profile',{
    'module':'profile','action':'club'
}, function(){
    $('#Preview_profile-edit-club-information').css('position', 'relative');
});
Game.pages.add('manager',{
    'module':'profile','action':'show'
}, function(){
    if(!$('#profile-show').length) return !1;


});
Game.pages.add('mail',{
    'module':'mail','action':'index'
},null,[
    [
        'outbox',
        {'module':'mail','action':'outbox'}
    ],[
        'archive',
        {'module':'mail','action':'archive'}
    ],[
        'ignore',
        {'module':'mail','action':'ignore'}
    ]
]);
Game.pages.add('tricotshop',{
    'module':'tricotshop'
});

//NON-CATEGORY
Game.pages.add('main',{
    'module':'main','action':['home','acceptSimulation','deleteSimulation','accept']
});
Game.pages.add('live',{
    'module':'live','action':'index'
},null,[
    [
        'league',
        {'module':'live','action':'league'}
    ],[
        'match',
        {'module':'live','action':'match'},
        async function(){
            if(!$('#match').length || !(currentLive instanceof Live)) return;

            let LeagueData = Tool.getVal('LeagueData'), save = !0;
            if(typeof LeagueData=='object' && (LeagueData.lastMatchDate+86400000)>Game.getTime()) save = !1;

            if(save){
                let content = await Game.getPage('?w='+worldId+'&area=user&module=statistics&action=games','#content');
                LeagueData = SaveLeagueData(content);
                if(LeagueData==!1) LeagueData = {clubs:{}};
            }

            currentLive.ownMatch = $('#'+currentLive.matchId +' h3 a[clubid="'+Tool.clubId+'"]').length!=0; // Is this match own?
            currentLive.ownLeague = currentLive.ownMatch || LeagueData.clubs.hasOwnProperty($('#'+currentLive.matchId).find('a[clubid]:first').attr('clubid'));

            if(!currentLive.ownLeague){
                $('#match-observer').css('opacity', '.3');
            }

            // let browserLang = window.navigator.userLanguage || window.navigator.language;
            let synth = new SpeechSynthesisUtterance(),
                trSpeechCntrl = Game.server=="tr" && Tool.language=="Turkish";
            synth.lang = 'tr-TR';

            if(currentLive.homeId==0 || currentLive.awayId==0){ //If a match is played with a system player
                if(trSpeechCntrl){
                    setTimeout(()=>{
                        synth.text = "Maç başlamadan bitiyor. Tebrikler.";
                        window.speechSynthesis.speak(synth);
                    }, 500);
                }
                return;
            }

            // Add card images
            $('#goal-event-container').after(
                `<div id="DivCards" class="match event-container" style="display:none;">`+
                `   <img id="yellow_card" src="${Tool.sources.get('yellowCard')}" alt="yellowCard.png" style="display:none;">`+
                `   <img id="red_card" src="${Tool.sources.get('redCard')}" alt="redCard.png" style="display:none;">`+
                `   <img id="yellow_red_card" src="${Tool.sources.get('yellowRedCard')}" alt="yellowRedCard.png" style="display:none;">`+
                `</div>`
            );

            // Add audios
            $('#goal-event-container').after(
                '<div id="Songs">'+
                '   <audio id="goalSound" src="https://static.wixstatic.com/mp3/fcacd5_2794b8a8827a475eaf9a3241be0c42d5.mp3"></audio>'+
                '   <audio id="whistle1" src="https://static.wixstatic.com/mp3/fcacd5_4f0052fc29104ead86761cbb08d50774.mp3"></audio>'+
                '   <audio id="whistle2" src="https://static.wixstatic.com/mp3/fcacd5_b967408abf59401d9b71778ea45ae2b9.mp3"></audio>'+
                '   <audio id="whistle3" src="https://static.wixstatic.com/mp3/fcacd5_c4ccd759ec62404cb59f6a8ff906e110.mp3"></audio>'+
                '   <audio id="backgroundSound" loop src="https://static.wixstatic.com/mp3/fcacd5_5a27a4e8ed2a482099ea0ba8839d4db9.mp3"></audio>'+
                '   <audio id="fan1" loop src="https://static.wixstatic.com/mp3/fcacd5_d7123a0a3c2f469cbdf603067579de93.mp3"></audio>'+
                '   <audio id="fan2" loop src="https://static.wixstatic.com/mp3/fcacd5_fde7b7b934d24cf98771cc022eb6bee3.mp3"></audio>'+
                '</div>'
            );

            // Add Goals Container
            $('#match-messages').before(
                '<div style="width: 840px;position: absolute;left: 65px;top: 101px;color:white;">'+
                '   <div id="home-goals" style="float:left;width:48%;height:100%;text-align:center;overflow: auto;line-height:16px;height:38px;"></div>'+
                '   <div id="away-goals" style="float:right;width:48%;height:100%;text-align:center;overflow: auto;line-height:16px;height:38px;"></div>'+
                '</div>'
            );




            Tool.temp.MatchEventCatcher = event=> {

                if(event.message) {
                    switch(event.type){
                        case 'goal': case 'penalty': case 'penaltyShootout':
                            if(event.type!='penaltyShootout' || event.goal == 'goal'){
                                if(currentLive.lastActiveMin < 120){ // GOOOOALL : event['team']
                                    if(event._status == 'new'){
                                        if(currentLive.ownMatch && event.team == currentLive.ownSquad){
                                            $('#goalSound')[0].currentTime = 0;
                                            $('#goalSound')[0].play();
                                        }

                                        if(Tool.temp.NewGoalCatcher == 'function'){
                                            Tool.temp.NewGoalCatcher({
                                                [currentLive.matchId]: { //Note: New goal has not yet been added to the element (score-home or score-away)
                                                    "status": event.action=="end"?"ended":"active",
                                                    "home_goals": parseInt($('#'+currentLive.matchId + '> span.score > div:first > span.score-home').text()) + (event.team==currentLive.homeId?1:0),
                                                    "away_goals": parseInt($('#'+currentLive.matchId + '> span.score > div:first > span.score-away').text()) + (event.team==currentLive.awayId?1:0),
                                                    "min": event.min
                                                }
                                            });
                                        }
                                    }

                                    let message = event.message,
                                        team_matchId = event.team,
                                        min = event.min,
                                        team = currentLive.homeId==team_matchId?"home":"away",
                                        goal_scorer_lastname = $('<div>').html(message).find('.'+team+':last').text().trim(),
                                        fonded_players = Object.values(currentLive.players[team_matchId]).filter(p=>p.a_position!='Bank' && p.lastname.trim()==goal_scorer_lastname);



                                    if(fonded_players.length==1){

                                        let goal_scorer = fonded_players[0],
                                            spn = $('#player-goals-'+goal_scorer.id);
                                        if(!spn.length){ // player's first goal
                                            if($('#'+team+'-goals > span').length) $('#'+team+'-goals').append(' , ');
                                            $('#'+team+'-goals').append(
                                                `<span style="color:${team=="home"?'#f00':'#0ec6e7'};white-space:nowrap;">`+
                                                `   <img src="${Tool.sources.get('ball')}" alt="ball.png" height="15px;" style="vertical-align:middle;margin: 1px 2px 0 0;">`+
                                                `   <span id="player-goals-${goal_scorer.id}" style="color:white;font-size: 10px;font-weight:bold;">[${min}]</span> ${goal_scorer.lastname}`+
                                                `</span>`
                                            );
                                        }
                                        else{
                                            let text = spn.text();
                                            spn.text(text.substring(0,text.length-1)+','+min+']');
                                        }
                                    }
                                    else{

                                        if($('#'+team+'-goals > span').length) $('#'+team+'-goals').append(' , ');
                                        $('#'+team+'-goals').append(
                                            `<span style="color:${team=="home"?'#f00':'#0ec6e7'};white-space:nowrap;">`+
                                            `   <img src="${Tool.sources.get('ball')}" alt="ball.png" height="15px;" style="vertical-align:middle;margin: 1px 2px 0 0;">`+
                                            `   <span style="color:white;font-size: 10px;font-weight:bold;">[${min}]</span> <span style="font-style:italic;">${goal_scorer_lastname}</span>`+
                                            `</span>`
                                        );
                                    }

                                }
                            }
                            break;
                        case 'info':
                            if(event._status == 'new'){
                                let min = event.min,
                                    whistle = $('#whistle'+(
                                        min==1?1: //Match start
                                        min==45?2: //First half end
                                        event.action=='end'?3: //Match end
                                        2 //Else
                                    ));
                                if(whistle.length){
                                    whistle=whistle[0];
                                    whistle.currentTime = 0;
                                    whistle.play();
                                }
                            }
                            break;
                    }
                }

                switch(event.type){
                    case 'penaltyShootout':
                        if(event.goal == 'goal'){ //Penaltı atışı gol oldu
                            //Gol atan takım => event.team
                        }
                        else if(event.goal == 'miss'){ //Penaltı atışı kaçtı
                        }
                        break;
                    case 'penaltyShootoutScore': //Penaltı skor tablosu gösteriliyor
                        /*message = currentLive.getMessageElement(event['min']);
                            $(message).addClass('info');
                            $(message).append(event['template']);
                            $('#match-messages').prepend($(message));*/
                        break;
                    case 'red': case 'yellow': case 'yellow_red':
                        if(event._status == 'new'){
                            let whistle = $('#whistle1')[0];
                            whistle.currentTime=0;
                            whistle.play();
                            if(trSpeechCntrl){
                                setTimeout(()=>{
                                    synth.text = event.message;
                                    window.speechSynthesis.speak(synth);
                                }, 500);
                            }
                            if(currentLive.ownMatch && event.squad == currentLive.ownSquad){
                                $('#DivCards, #'+event.type+'_card').show();
                                setTimeout(()=>{
                                    $('#DivCards, #'+event.type+'_card').hide();
                                },event.delay);
                            }
                        }
                        /*var player = $('#field-player-' + event['player']);
                            player.removeClass('weak');
                            player.addClass(event['type']);
                            if (event['type'] != 'yellow') {
                                if (event['squad'] == currentLive.ownSquad) {
                                    $('#out-of-match').append($('#field-player-' + event['player']));
                                    var playerObj = currentLive.players[currentLive.ownSquad][event['player']];
                                    if (playerObj) {
                                        $('#field-player-points-' + event['player']).html(playerObj['points']);
                                        player.off();
                                    }
                                } else {
                                    $('#opponent-out-of-match').append($('#field-player-' + event['player']));
                                }
                                currentLive.players[event['squad']][event['player']]['a_position'] = 'Bank';
                            } */
                        break;
                    case 'move':
                        break;
                    case 'injured':
                        //var isOwnInjuredPlayer = currentLive.ownMatch && event.squad==currentLive.ownSquad;
                        /*currentLive.players[event['squad']][event['player']]['initial_health'] -= event['injuring'];
                        currentLive.setHealthStatus(event['player'], currentLive.players[event['squad']][event['player']]['initial_health']);*/
                        if(event._status == 'new'){
                            var isOwnInjuredPlayer = currentLive.ownMatch && event.squad==currentLive.ownSquad;
                            var player = currentLive.players[event.squad][event.player];
                            if(isOwnInjuredPlayer && trSpeechCntrl){
                                synth.text = `${player.lastname}, ${event.injuring} puan yaralandı.`;
                                window.speechSynthesis.speak(synth);
                            }
                        }
                        break;
                    case 'bonusHealthLoss':
                        break;
                    case 'bonusHealthGain':
                        break;
                    case 'bonusFormationLoss':
                        break;
                    case 'bonusFormationGain':
                        break;
                    case 'bonusLeadershipLoss':
                        break;
                }

                if(event.action == 'end'){


                    if(event._status == 'new'){
                        let playedSongs = ['backgroundSound','fan1','fan2'].map(n=>$('#'+n)[0]).filter(audio=> !audio.paused);
                        if(playedSongs.length){
                            let counter = 0;
                            playedSongs.forEach((audio,i)=>{
                                let j = audio.volume*100;
                                for(let t = j ; j>=0 ; j--){
                                    ((j)=>{ //eslint-disable-line no-loop-func
                                        setTimeout(function(){
                                            audio.volume = j/100;
                                            if(audio.volume < 1){
                                                audio.pause();
                                                if(++counter == playedSongs.length && trSpeechCntrl){
                                                    setTimeout(()=>{
                                                        synth.text = 'Maç bitti, herkes evlerine dağılsın.';
                                                        window.speechSynthesis.speak(synth);
                                                    }, 1500);
                                                }
                                            }
                                        },(t-j)*50);
                                    })(j);
                                }
                            });
                        }

                        if(event.min==1 && typeof Tool.temp.NewGoalCatcher == 'function'){ //the match is over due to insufficient number of players
                            let home_goals = $('<div>').html(event.message).find('span.away,span.home').first().attr('class')=="away"?3:0,
                                away_goals = home_goals==3?0:3;

                            Tool.temp.NewGoalCatcher({
                                [currentLive.matchId]: {
                                    "status": "ended",
                                    "home_goals": home_goals,
                                    "away_goals": away_goals,
                                    "min": event.min
                                }
                            });
                        }
                    }
                    else{ //Match has been already finished before, no new event will catched
                        $('#backgroundSound').attr('stop',true);
                        ['backgroundSound','fan1','fan2'].map(n=>$('#'+n)[0]).forEach(audio=>{
                            if(!audio.paused) audio.pause();
                        });
                    }
                }
            };
            if(Array.isArray(Tool.uncaught_events_queue)){
                Tool.uncaught_events_queue.forEach(event=> Tool.temp.MatchEventCatcher(event));
                delete Tool.uncaught_events_queue;
            }

            if(!Tool.hasOwnProperty('goalTrigger')) Tool.goalTrigger = 0;
            if(Tool.goalTrigger<3) ++Tool.goalTrigger;

            //Show or hide home/away team's players in field.
            for(let squadId in currentLive.players){
                ((index,playersClass)=>{ //eslint-disable-line no-loop-func
                    let data = {
                        home:{
                            style:'position:absolute;top:600px;',
                            id:"homePlayersFilter",
                            text:GetText('ShowHomeSquad')
                        },
                        away:{
                            style:"position:absolute;top:600px;right:20px;",
                            id:"awayPlayersFilter",
                            text:GetText('ShowAwaySquad')
                        }}[index];

                    $('#formation-container').append(
                        `<div style="${data.style}">`+
                        `   <input id="${data.id}" type="checkBox">`+
                        `   <label for="${data.id}" style="cursor:pointer;">${data.text}</label>`+
                        `</div>`
                    );

                    if(index==="away"){
                        $('#match-handle-container').css('height',"36px");
                        $('#match-handle-container > li:first').css('height',"36px");
                    }
                    $('#'+data.id).click(function(){
                        let checked = this.checked;
                        $('#field').find('.field-player').each(function(){
                            if($(this).hasClass(playersClass)){
                                $(this)[checked?'addClass':"removeClass"]('hover');
                            }
                        });
                    });
                })(
                    squadId == currentLive.homeId?"home":"away",
                    squadId == currentLive.ownSquad?"own-player":"opponent"
                );
            }

            try{
                //Background Sound is playing
                setTimeout(function(){
                    let backgroundSound = $('#backgroundSound')[0];
                    backgroundSound.currentTime = 0;
                    backgroundSound.volume = 0;
                    backgroundSound.play();
                    let intervals = [];
                    [...Array(51).keys()].slice(1).forEach(i=>{ // 1 to 50
                        intervals.push(setTimeout(()=>{
                            if(!$('#backgroundSound').attr('stop')){
                                backgroundSound.volume = i/100;
                            }
                            else{
                                intervals.forEach(id=>{ clearTimeout(id);});
                            }
                        },(i-1)*50));
                    });
                },250);
            }
            catch(err){console.error(err);};
        }
    ]
]);

//GLOBAL PAGE
Game.globalPage = Game.pages.add('global', {'module':'nomodule','action':'noaction'}, function(){ //This function will be worked on all pages.
    //Problem : https://forum.fussballcup.de/showpost.php?p=7513019&postcount=1
    $('#content table:has(.open-card)').each(function(){
        if($(this).width()>942){
            $(this).css({'display':'block','overflow-x':'auto'});
        }
    });

    // To make sticky headers for tables
    setTimeout(()=>{
        // select last thead row of tables that have second row
        let theadRows = $('#content table:has(>tbody>tr:eq(2)):not([id="league-crosstable"])>thead>tr:last-of-type');

        // add stick class to th of thead rows
        theadRows.find('>th').addClass('sticky');

        // set position relative to tables of thead rows' parents
        theadRows.closest('table').css('position', 'relative');

        // remove overflow=unset to work sticky attribute
        theadRows.parents().toArray().forEach(p=>{
            if(p == unsafeWindow.document.body) return !1;
            if($(p).css('overflow')=='hidden') $(p).css('overflow', 'unset');
        });
    }, 1e3);

    // The time remaining to the next age jump is added to the bottom menu as a counter
    (()=>{
        if($('#FutureAge').length || !Tool.aging.length) return;
        let nextAging = Tool.aging.getNearestAgingDate();
        if(isNaN(nextAging)) return;

        let remainingTime = parseInt((nextAging.getTime()-Game.getTime())/1e3);//Yaş atlamaya kalan saniye hesaplanıyor.
        $('#footer >div').css('width', '300px');
        $('#footer >.server-infos').prepend(
            `<li style="padding: 4px 5px;font-size:12px;" title="${nextAging.toLocaleString()}">`+
            `   ${GetText('NewAge')} : <label id="FutureAge">${SecToTime(remainingTime--)}</label>`+
            `</li>`
        );
        Tool.intervals.create(function(){
            $('#FutureAge').html(SecToTime(remainingTime--));
            if(remainingTime<1){
                $('#FutureAge').html('...');
                this.delete();
            }
        }, 1e3, 'agingCountdown');
    })();
});


class Feature{
    constructor(name, page_names, run, hover_selector=null, alwaysRunOnPages=null, opts={}){
        this.name = name;

        page_names = Array.isArray(page_names)?page_names:[page_names];
        this.pages = [];
        for(let page_name of page_names){
            let page = Game.pages.getByName(page_name);
            if(!(page instanceof Page)){
                console.error(new Error(`Page(${page_name}) doesn't exist, therefore feature(${name}) can't work in when it is opened.`));
                continue;
            }
            this.pages.push(page);
        }
        if(this.pages.length == 0) return {err:1, msg:'Pages empty!'};

        if(typeof run != 'function'){
            let errMsg = 'run must be function!';
            console.error(new Error(errMsg));
            return {err:2, msg:errMsg};
        }
        this.run = run;

        if(Array.isArray(alwaysRunOnPages) && alwaysRunOnPages.length){
            if(!Array.isArray(alwaysRunOnPages[0])) alwaysRunOnPages=[alwaysRunOnPages];

            for(let [pageName, runFunc] of alwaysRunOnPages){
                let page = Game.pages.getByName(pageName)
                if(!(page instanceof Page)){
                    let errMsg = `Page(${pageName}) doesn't exist, therefore feature(${name}) can't be added. (Page is in otherPages)`;
                    console.error(new Error(errMsg));
                    return {err:3, msg:errMsg};
                }

                page.alwaysRunPartsOfFeas.push([this, runFunc]);
            }
        }

        if(typeof hover_selector == 'string' && (hover_selector=hover_selector.trim())!="") this.hover_selector = hover_selector;

        this.active = null;
        this.work = null;

        if($.isPlainObject(opts)){
            for(let key in opts) this[key] = opts[key];
        }
        if(!!this.runOnlyOneTime) this.workedOneTime = !1;

        return this;
    }
    deactivate(){
        if(!this.active) return;
        let deactivated = !0;

        if(this.refreshWhenDeactivate){
            if(confirm(GetText('confirm2Refresh', {tag:0, args:[Translate.locale.texts.FeaturesName[this.name] || this.name]}))) location.reload()
            else deactivated = !1;
        }
        else $('.addedBy_'+this.name).remove();

        if(deactivated){
            this.update(!1);
        }
        return deactivated;
    }
    activate(neverWorked){
        if(this.active) return;
        this.update(!0);
        let ran = !0;

        if(neverWorked && (!this.runOnlyOneTime || !this.workedOneTime)){
            this.exec();
            if(this.runOnlyOneTime) this.workedOneTime = !0;
        }
        else ran = !1;
        return ran;
    }
    update(status){
        this.active = status;
        Tool.setVal('featuresActiveStatus', Tool.features.reduce((acc,feature)=>{acc[feature.name]=feature.active;return acc},{}));
    }
    exec(){
        this.work = !1 !== this.run(Game.currentPage);
    }
}

let Tool = new (class{
    constructor(){
        this.sources = {
            data_prefix: 'https://i.ibb.co/',
            datas: {
                "sendBtn": "QXtwTgY/sendBtn.png",
                "remove3": "9b7xQL4/remove3.png",
                "settings": "JHJpXSY/settings.png",
                "show": "7pg2PWQ/show.png",
                "tick": "hYRcQd2/tick.png",
                "tick2": "pP6xbGh/tick2.png",
                "translate": "7VdP5ff/translate.png",
                "unhappy": "2Yq2Yfg/unhappy.png",
                "uploadDatas": "jZWFtDL/upload-Datas.png",
                "yellowCard": "02LjHWV/yellow-Card.png",
                "again": "HqqB4JQ/again.png",
                "yellowRedCard": "p33n7Qg/yellow-Red-Card.png",
                "ball": "2qM7FzS/ball.png",
                "bundesligaCup": "h2JPTkW/bundesliga-Cup.png",
                "captain": "9nDdkt5/captain.png",
                "championsLeagueCup": "4NtgqHJ/champions-League-Cup.png",
                "chatBell": "3BdfDxd/chatBell.png",
                "chatBellDeaktive": "G9bbjK3/chat-Bell-Deaktive.png",
                "circle": "y6dqjtb/circle.png",
                "clock": "SyXfW49/clock.png",
                "const": "1bV1CHX/const.png",
                "construction": "TbrhX8h/construction.png",
                "corner": "qDXqqBV/corner.png",
                "cursor": "N2N99cK/cursor.png",
                "data": "3mGjmQG/data.png",
                "delete": "LnV2R4h/delete.png",
                "download": "JCnddMy/download.png",
                "europaligaCup": "WGVLy3M/europaliga-Cup.png",
                "exchange": "jZn1YzD/exchange.png",
                "freekick": "FwfBNCz/freekick.png",
                "hide": "VLSSg0n/hide.png",
                "image": "SszmP58/image.png",
                "menuBtn": "BNV6hCJ/menuBtn.png",
                "newVersion": "VxrRWBK/new-Version.png",
                "nextMatchesBacground": "fthHZKM/next-Matches-Bacground.png",
                "noChanging": "wrXhBkT/no-Changing.png",
                "penalty": "61Hm55P/penalty.png",
                "prev": "6yzV4DB/prev.png",
                "printscreen": "J39p4VF/printscreen.png",
                "redCard": "cxjvwJQ/redCard.png",
                "remove": "Fs4nqMN/remove.png",
                "remove2": "G7C723z/remove2.png",
                "x" : "p3DLnW7/x.png",

                "down": "bb1n8kD/down.gif",
                "here": "rwCXR32/here.gif",
                "up": "QCNGhCc/up.gif",
            },
            get: function(key){
                let d = this.datas[key];
                if(d == undefined) d = 'cy0JrFY/no-Image-Found.png';
                return this.data_prefix + d;
            }
        }

        this.intervals = new (class{
            constructor(log_intervals=!1){
                this.log_intervals = log_intervals;
                this.named = {};
                this.anonymous = [];
            }
            create(func, delay, name=null){
                let that = this, interval;
                if(typeof name == "string" && (name=name.trim())!=""){
                    if(this.named.hasOwnProperty(name)) throw new Error(`Intervals.create with name(${name}) was already used in one of previous intervals`);

                    interval = {
                        created_at : Date.now(),
                        name : name,
                        delete : function(){
                            clearInterval(that.named[this.name]);
                            let diff = Date.now() - this.created_at;
                            if(this.log_intervals) console.log('[intervals] Named('+this.name+') interval deleted itself after ' + SecToTime(parseInt((diff)/1000))+'.'+(diff%1000));
                            delete that.named[this.name];
                        },
                        func : func
                    };
                    this.named[name] = setInterval(function(){
                        func.call(interval);
                    },delay);
                    if(this.log_intervals) console.log('[intervals] Created named('+name+') interval with '+delay+' ms delay');
                }
                else{
                    let id;
                    interval = {
                        created_at : Date.now(),
                        delete : function(){
                            clearInterval(id);
                            let diff = Date.now() - this.created_at;
                            if(this.log_intervals) console.log('[intervals] Anonymous interval deleted itself id: '+id+' after ' + SecToTime(parseInt((diff)/1000))+'.'+(diff%1000));
                            that.anonymous.find((item,index,array)=>{
                                if(item==id){
                                    array.splice(index,1);
                                    if(this.log_intervals) console.log('[intervals]\t\t id in annoymous splice index: '+index);
                                    return 1;
                                }
                            });
                        }
                    };
                    id = setInterval(function(){
                        func.call(interval);
                    },delay);
                    this.anonymous.push(id);
                    if(this.log_intervals) console.log('[intervals] Created anonymous interval with '+delay+' ms delay , id: '+id);
                }
                return interval;
            }
            clear(){
                if(this.log_intervals) console.log('[intervals] Clear all intervals');
                let named = this.named;
                for(let name in named){
                    clearInterval(named[name]);
                    delete named[name];
                }

                this.anonymous.forEach(int=> clearInterval(int) );
                this.anonymous=[];
            }
        })();
        this.defaultFeaturesActiveStatus = {
            "ConstructionCountdown"           : !0,
            "RematchMatch"                    : !0,
            "NumberOfFootballerChecker"       : !0,
            "MatchAnalyst"                    : !0,
            "TrainingControl"                 : !0,
            "ClubExchange"                    : !0,
            "RankingOfPlayers"                : !0,
            "ShowStrengthChange"              : !0,
            "ShowRealStrength"                : !1,
            "CalculateFeatureOfPlayer"        : !0, //renamed(CalculateNonYoungPlayersStrength)
            "CalculatingStrengthOfYoungPlayer": !0,
            "YoungPlayersHistory"             : !0,
            "TrainingGroups"                  : !1,
            "CampHistory"                     : !0,
            "TransferDates"                   : !0,
            "GoOffer"                         : !0,
            "ShowBoughtPlayers"               : !0,
            "ShowOwnOfferInMarket"            : !0,
            "FilterOwnOffers"                 : !0,
            "FilterTransferMarket"            : !0,
            "DownloadTable"                   : !0,
            "CancelFriendlyMatchInvites"      : !0,
            "QuickBet"                        : !0,
            "ShowAsistantLevelIncrease"       : !0,
            "QuickShopping"                   : !0,
            "AddImage"                        : !0,
            "InviteSimulationMatch"           : !0,
            "ShowEloRating"                   : !0,
            "LiveMatchesTable"                : !0,
            "SortTournaments"                 : !0,

            //New features
            "FootballerAnalyzer"              : !0,
            "StadiumProgressCalculator"       : !0,
            "PartipicatedTournaments"         : !0,
            "ChatNotifier"                    : !0,
            "LeagueStatus"                    : !0,

        };

        this.started = !1;
        this.temp = {};
    }

    async start(){
        delete this.__proto__.start;

        //Get server name and check if it's datas is already in the script
        Game.server = $('body').attr('class').replace('loading','').trim();
        if(!(Game.server in serversDatas)){
            Game.giveNotification(!1, `This server(${Game.server}) is not available in the '${GM_info.script.name}'!`);
            throw new Error("This server is not available in the script!");
        }

        this.settings = this.getVal('settings', {});

        //Fix tool values and print
        this.fixValues();
        this.printValues();

        //Wait game page loading first time
        await new Promise(res=>{
            let a, b;
            b = setTimeout(()=>{
                clearInterval(a);
                res();
            }, 2500);
            a = setInterval(()=>{
                if($('body').hasClass('loading')){
                    clearTimeout(b);
                    clearInterval(a);
                    res();
                }
            },10);
        });

        //Wait game page loaded
        let ms = await Game.pageLoad();
        console.log(`Wait for the game to load for the first time : ${ms} ms`);
        if(!$('#logout').length) throw new Error("Logout button doesn't exist");

        await Game.initialConfigure(); //After that initialize game configure

        //Tool datas
        for(const [key,value] of Object.entries(serversDatas[Game.server])) this[key] = value;

        //Aging
        {
            function Aging(dates, server, serverTime, info=!1){
                this.info = info;
                this.lastPassingDate = null;
                this.pastDates = [];
                if(!Array.isArray(dates)) dates = [];
                const multiper = 60000;

                let ageDaysDiff2De = { //http://prntscr.com/1devg1p
                    pl: 11,
                    tr: -5,
                    nl: -7,
                    fr: -9,
                    at: 0, //not exists
                };

                this.initialize = function(dates, server, serverTime){
                    delete this.initialize;

                    dates = this.withoutPastDates(dates, serverTime);
                    if(server != 'de' && ageDaysDiff2De.hasOwnProperty(server)) this.addDatesAccording2DeAges(dates, server);
                    delete this.addDatesAccording2DeAges;

                    this.length = dates.length;
                    this.dates = dates;
                }
                this.getNearestAgingDate = function(){ // return null or Date
                    if(this.length == 0) return null;

                    let st = Game.getTime();
                    let date = this.convert2Date(this.dates[0]);
                    if(date.getTime()>st) return date;

                    this.dates.shift(0);
                    if(--this.length==0) return null;

                    return this.convert2Date(this.dates[0]);
                };
                this.convert2Date = function(date){ return new Date(date*multiper); }
                this.withoutPastDates = function(dates, serverTime){
                    if(dates[dates.length-1]*multiper<serverTime) return [];

                    let d, temp = null;
                    while(dates.length){
                        d = this.convert2Date(dates[0]);
                        if(d.getTime()>serverTime){
                            if(temp!=null) this.lastPassingDate = temp;
                            if(info) console.log(d.toLocaleString("tr-tr") + ' > ' + new Date(serverTime).toLocaleString("tr-tr") + ' stopped');
                            break;
                        }
                        if(info) console.log(d.toLocaleString("tr-tr") + ' <= ' + new Date(serverTime).toLocaleString("tr-tr") + ' removing it..');
                        this.pastDates.splice(0, 0, dates[0]);
                        dates.splice(0,1);
                        temp = d;
                    }
                    return dates;
                }
                this.addDatesAccording2DeAges = function(dates, server){
                    //http://prntscr.com/1dfdik3
                    /*eslint-disable-line*/function calcDiffTime(e,t){if(null==e)throw new Error("a musn't be empty!");var r,n;null==t?(n=e,r=Intl.DateTimeFormat().resolvedOptions().timeZone):(r=e,n=t);var i=new Date,a=e=>new Date(...(e=>((e=e.split(" "))[0]=e[0].split(".").reverse(),e[1]=e[1].split(":"),--(e=[...e[0],...e[1]].map(e=>parseInt(e)))[1],e))(i.toLocaleString("tr-tr",{timeZone:e}))),l=a(r),m=a(n);return l.getTime()-m.getTime()}

                    let diffAsMS = calcDiffTime(serversDatas.de.timeZone, Tool.timeZone);
                    if(info) console.log('diffAsMS: ' + diffAsMS);
                    let deAging = new Aging(serversDatas.de.ageDates, 'de', Game.getTime()+diffAsMS, !1);
                    if(info) console.log('deAging: %o', deAging);

                    let l1 = dates.length, l2 = deAging.length;
                    if(l1>=l2) return;

                    let daysDiff2De = ageDaysDiff2De[server];
                    let minutesInADay = 24*60;
                    let diffAsMin = parseInt(diffAsMS/multiper);
                    for(let i=l1; i<l2; i++){
                        dates.push((deAging.dates[i]/*-diffAsMin*/) + daysDiff2De*minutesInADay);
                        if(info) console.log(`Alman yaş atlama tarihine göre yaklaşık yaş atlama tarihi eklendi: ` + this.convert2Date(dates[dates.length-1]).toLocaleString("tr-tr"));
                    }
                };
                this.getDates = function(){ return this.withoutPastDates(dates, Game.getTime()); }

                this.initialize(dates, server, serverTime);
            }

            this.aging = new Aging(this.ageDates, Game.server, Game.getTime(), !1);
            delete this.ageDates;
            console.log('Aging: %o', this.aging);
        }
        serversDatas = undefined;

        //Get translations
        {
            let userLanguages = GM_getValue('userLanguage',{}),
                result, gameDefLanguage = this.language, chooseAlternative=!1;
            if(userLanguages.hasOwnProperty(Game.server) && Translate.existLanguage(userLanguages[Game.server])){
                result = Translate.start(userLanguages[Game.server]); //User preference language
            }
            else{
                if(Translate.existLanguage(gameDefLanguage)) result = Translate.start(this.language); //Default server language
                else{
                    result = Translate.start(); //Alternative language
                    chooseAlternative=!0;
                }
            }

            if(result.status=='error'){
                Game.giveNotification(!1, result.msg);
                throw new Error(JSON.stringify(result, null, '\t'));
            }
            this.language = Translate.locale.name;
            if(chooseAlternative)
                Game.giveNotification(!0, `This script hasn't yet been translated into ${gameDefLanguage}!<br>Alternative language[${this.language}] selected!`);
        }


        let news = $('#container div.focus.news:first'),
            makeSureNewsDialogNotShowing;
        if(news.length) makeSureNewsDialogNotShowing = WaitDialogClosed(news);
        else makeSureNewsDialogNotShowing = Promise.resolve();


            await this.checkVersion(async (getUpdateDialog)=>{
                await makeSureNewsDialogNotShowing;
                return WaitDialogClosed(getUpdateDialog());
            });


        if(this.hasOwnProperty('gameVersion')){
            await makeSureNewsDialogNotShowing;
            let runScript = await this.checkGameVersion();
            if(runScript==0) return console.info("Script is stopped by the user.");
        }


        //Get club datas
        {
            let clubDatas = Tool.getVal('clubDatas'),
                dataResult = this.checkClubData(clubDatas);
            if(dataResult == 'not-exist'){
                await makeSureNewsDialogNotShowing;
                clubDatas = await this.createWelcomeMenu();
                dataResult = this.checkClubData(clubDatas);
            }
            delete this.__proto__.createWelcomeMenu;
            delete this.__proto__.checkClubData;

            if(dataResult!='correct')
                return Game.giveNotification(!1, GetText('datasOfClubNotCorrect', {tag:0}));
            for(let [key,val] of Object.entries(clubDatas)) this[key] = val;
        }

        //...
        this.createToolMenu();
        this.createMenuEvents();
        this.createNoticeArea();

        //plObj[Oyuncu verileri] nin kaydedilmesi
        /*$.get('?area=user&module=formation&action=index&layout=none',function(response) {
            let r = response.content,
                b = r.lastIndexOf('var plObj');
            if(b!=-1){
                b = r.indexOf('=',b);
                playerObject = JSON.parse(r.substring(b+1,r.indexOf('}};',b)+2));
                if(!typeof playerObject=='object' //Kadroda oyuncu olunca "plObj = {...};" oluyor.
                   || Array.isArray(playerObject) //Kadroda hic oyuncu olmazsa "plObj = [];" oluyor.
                  ) playerObject = undefined;
            }
        });*/

        //trainingPlan , strengthFactors
        {
            let penalty_area_safety=0, catch_safety=1, two_footed=2, fitness=3, shot=4, header=5, duell=6,
                cover=7, speed=8, pass=9, endurance=10, running=11, ball_control=12, aggressive=13;
            let Positions = this.footballerPositions;

            // this is required to check whether player skill that is being improved is correct
            this.trainingPlan = new Proxy({
                [Positions[0]]: [penalty_area_safety, catch_safety, fitness, speed, duell, endurance, shot, two_footed], //TW
                [Positions[1]]: [pass, duell, fitness, cover, speed, endurance, header, shot, running, two_footed], //AV
                [Positions[2]]: [pass, duell, fitness, cover, speed, endurance, header, shot, running, two_footed], //IV
                [Positions[3]]: [duell, pass, fitness, cover, endurance, speed, shot, running, header, two_footed], //DM
                [Positions[4]]: [endurance, fitness, speed, header, pass, running, duell, shot, cover, two_footed], //LM
                [Positions[5]]: [endurance, fitness, speed, header, pass, running, duell, shot, cover, two_footed], //RM
                [Positions[6]]: [running, fitness, speed, endurance, two_footed, shot, duell, pass, header, cover], //OM
                [Positions[7]]: [running, fitness, speed, two_footed, endurance, duell, shot, header, pass, cover]  //ST
            }, {
                get: function(target, property, receiver) {
                    for(let k in target)
                        if(new RegExp(k, 'i').test(property.trim()))
                            return target[k];
                    return null;
                }
            });

            // this is required to calculate strength of a player
            this.strengthFactors = new Proxy({
                [['goalkeeper',Positions[0]].join('|')]          : [ //goalkeeper, TW
                    [penalty_area_safety, 5], [catch_safety, 5], [fitness, 4], [speed, 3], [duell, 2], [endurance, 1], [shot, 1], [two_footed, 1]
                ],
                [['defense',...Positions.slice(1,4)].join("|")]  : [ //defense, AV, IV, DM
                    [duell, 4], [pass, 4], [fitness, 3], [speed, 2], [endurance, 2], [shot, 2], [header, 2], [cover, 2], [running, 2], [two_footed, 1]
                ],
                [['midfield',...Positions.slice(4,6)].join("|")] : [ //midfield, LM, RM
                    [fitness, 4], [endurance, 4], [speed, 3], [header, 3], [duell, 2], [shot, 2], [cover, 2], [pass, 2], [running, 2], [two_footed, 1]
                ],
                [['offensive',...Positions.slice(6,8)].join("|")]: [ //offensive, OM, ST
                    [running, 4], [fitness, 3], [speed, 3], [endurance, 3], [two_footed, 3], [duell, 2], [shot, 2], [header, 1], [cover, 1], [pass, 1]
                ]
            }, {
                get: function(target, property, receiver) {
                    for(let k in target)
                        if(new RegExp(k, 'i').test(property.trim()))
                            return target[k];
                    return null;
                }
            });
        }

        this.started = !0;
    }
    checkClubData(clubDatas){
        if(typeof clubDatas == "object"){
            if(clubDatas.trainerLevel==undefined ||
               clubDatas.yTrainerLevel==undefined ||
               clubDatas.clubId==undefined ||
               clubDatas.clubName==undefined
              ) return 'incorrect';
            let self = $('.self-link:first');
            if(self.length){
                let clubName = $('.self-link').first().text().trim();
                if(clubDatas.clubName != clubName){ /*Detecting that club name was changed!*/
                    clubDatas.clubName = clubName;
                    Tool.setVal('clubDatas', clubDatas);
                }
            }
            return 'correct';
        }
        return 'not-exist';
    }

    createWelcomeMenu(){
        delete this.__proto__.createWelcomeMenu;
        //Eğer kulüp bilgileri mevcut değilse, kullanıcının verileri silinmiş olabilir yada kullanıcı scripti ilkkez yüklüyordur.
        return new Promise((res,rej)=>{
            ShowDialog(
                //header
                GetText('NeedNecessaryInformation')+`<img src="${Tool.sources.get('unhappy')}" alt="unhappy.png" height="25px" style="position:absolute;margin: 4px 0 4px 5px;">`,

                //content
                `<p style="color:red;margin-bottom:10px;font-weight:bold;text-align:left;font-size:12px;">${GetText('InformScriptWorking')}</p>`+
                `<p style="color:blue;font-weight:bold;text-align:left;font-size:12px;margin-Bottom:10px;">${GetText('HelpDataUploading')}</p>`+
                `<p style="text-align:center;margin-bottom:25px;">`+
                `   <img id="uploadDatas" class="grow" title="${GetText('UploadDatas', {tag:0})}" tool_tt="UploadDatas" src="${Tool.sources.get('uploadDatas')}" alt="uploadDatas.png" style="cursor:pointer;" height="40px">`+
                `</p>`+
                `<h3>${GetText('EnterClubInformation')} :</h3>`+
                `<table style="width:280px;margin:0 auto 15px auto;border-radius:6px;color:#111b9c;background-color:white;box-shadow: 5px 10px 8px #3939398c;">`+
                `   <tbody>`+
                `      <tr class="odd">`+
                `         <td style="border:0;text-align:center;padding-Left:5px;">${GetText('TrainerLevel')}</td>`+
                `         <td style="border:0;">`+
                `            <label class="menü">`+
                `               <select id="AntrenörSeviyesi1" style="font-size:12px;width:55px;margin:0 auto;text-align-last: center;"></select>`+
                `            </label>`+
                `         </td>`+
                `      </tr>`+
                `      <tr class="even">`+
                `         <td style="border:0;border-radius:6px 0 0 6px;text-align:center;padding-Left:5px;">${GetText('YoungTrainerLevel')}</td>`+
                `         <td style="border:0;border-radius:0 6px 6px 0;">`+
                `            <label class="menü">`+
                `               <select id="GAntrenörSeviyesi1" style="font-size:12px;width:55px;margin:0 auto;text-align-last: center;"></select>`+
                `            </label>`+
                `         </td>`+
                `      </tr>`+
                `   </tbody>`+
                `</table>`+
                `<p style="text-align:center;">${CreateButton('butonOnayla', GetText('Confirm')+' !')}</p>`
            );

            //Adding level options to selects
            let selects = $('#AntrenörSeviyesi1, #GAntrenörSeviyesi1');
            selects.append(`<option value="10" selected tool_ot="SortLevel_10 {X}">10 ${GetText('SortLevel', {tag:0})}</option>`)
            for(let lvl=9; lvl>-1; lvl--) selects.append(`<option value="${lvl}" tool_ot="SortLevel_${lvl} {X}">${lvl} ${GetText('SortLevel', {tag:0})}</option>`)

            $('#butonOnayla').click(async function(){
                $(this).off();
                let span = $(this).find('span:last'),
                    html = span.html(),
                    clubDatas = {
                        "trainerLevel"    : parseInt($('#AntrenörSeviyesi1').val()),
                        "yTrainerLevel"   : parseInt($('#GAntrenörSeviyesi1').val())
                    },
                    self = $('.self-link');
                span.html('<img src="/designs/redesign/images/icons/loading/16x16.gif" style="margin-top: -1px;">');
                if(self.length){
                    clubDatas.clubId = $('.self-link').first().attr('clubid');
                    clubDatas.clubName = $('.self-link').first().text().trim();
                }
                else{
                    try{
                        let profile_show = await Game.getPage('?w='+worldId+'&area=user&module=profile&action=show','#profile-show');
                        clubDatas.clubId = profile_show.find('div.container.profile-trophy > div.profile > ul.profile-box-club > li:nth-child(2) > a')[0].href.split('&').find(a=>a.split('=')[0]=='clubId').split('=')[1];
                        clubDatas.clubName = profile_show.find('h2').first().text().replace(Tool.replaceClubName,'').trim();
                    }
                    catch(err){
                        Game.giveNotification(!1, "An error is exist.\n"+err);
                        return;
                    }
                }

                span.html(html);
                Tool.setVal('clubDatas',clubDatas);
                closeFocus({target: $('.close')});
                res(clubDatas);
            });
            $('#uploadDatas').click(function(){
                ReadTextFile(
                    function(valuesText){
                        valuesText.split('CookieKey&:').slice(1).forEach(data=>{
                            let b = data.indexOf(':');
                            GM_setValue(data.substring(0,b),JSON.parse(data.substring(b+1)));
                        });
                        Tool.fixValues();
                        closeFocus({target: $('.close')});
                        Game.giveNotification(!0, GetText('DataLoaded'));
                        res(Tool.getVal('clubDatas'));
                    }
                );
            });
        });
    }

    createToolMenu(){
        delete this.__proto__.createToolMenu;

        $('html').animate({ scrollTop: 0 }, 'fast'); //Sayfanın başına getiriliyor. Menü ortaya çıkartılacak.

        //Script menüsü için toogle buton ekleniyor ve açılıp-kapanabilmesi için click eventi ekleniyor.
        $('#header').after('<div id="scriptMenuToggleBtn" class="active"></div>');
        $('#scriptMenuToggleBtn').click(function(){
            let active = $(this).hasClass('active');
            $(this)[active?'removeClass':'addClass']('active');
            $('#ScriptMenu')[active?'slideUp':'slideDown']();
        });

        //Script menüsü butondan sonra ekleniyor.
        $('#header').after(
            `<div id="ScriptMenu" class="box" style="position:absolute;">`+
            `   <h2>${GetText('ScriptMenuTitle')} <img id="fcupToolSettings" style="height: 16px; cursor: pointer; position: absolute; right: 5px; transform: translateY(-50%); top: 50%;" src="${Tool.sources.get('settings')}" alt="settings.png"></h2>`+
            `   <table class="table">`+
            `      <thead>`+
            `         <tr>`+
            `            <th>${GetText('Explanation')}</th>`+
            `            <th>${GetText('Action')}</th>`+
            `         </tr>`+
            `      </thead>`+
            `      <tbody>`+
            `         <tr class="odd">`+
            `            <td>${GetText('DownloadData')}</td>`+
            `            <td>${CreateButton('downloadValues', GetText('Download'), '', 'width:55px;')}</td>`+
            `         </tr>`+
            `         <tr class="even">`+
            `            <td>${GetText('UploadDatas')}</td>`+
            `            <td>${CreateButton('uploadValues', GetText('Load'), '', 'width:55px;')}</td>`+
            `         </tr>`+
            `         <tr class="odd">`+
            `            <td>${GetText('DeleteData')}</td>`+
            `            <td>${CreateButton('deleteValues', GetText('Delete'), '', 'width:55px;')}</td>`+
            `         </tr>`+
            `         <tr class="even">`+
            `            <td>${GetText('GameLanguage')}</td>`+
            `            <td>`+
            `               <label class="menü">`+
            `                 <select id="gameLanguage" style="width:69px;margin:0 auto;text-align-last: center;">`+
            `                    <option selected value="${Tool.language}">${GetText('Language', {tag:0})} *</option>`+
            `                 </select>`+
            `              </label>`+
            `           </td>`+
            `        </tr>`+
            `     </tbody>`+
            `     <tbody id="ExtraSettings" style="display:none;">`+
            `        <tr class="odd">`+
            `           <td>${GetText('TrainerLevelS')}</td>`+
            `           <td>`+
            `              <label class="menü">`+
            `                 <select id="AntrenörSeviyesi" k="trainerLevel" currentvalue="${Tool.trainerLevel}" style="width:55px; margin:0 auto; text-align-last:center;"></select>`+
            `               </label>`+
            `            </td>`+
            `         </tr>`+
            `         <tr class="even">`+
            `            <td>${GetText('YoungTrainerLevelS')}</td>`+
            `            <td>`+
            `               <label class="menü">`+
            `                  <select id="GAntrenörSeviyesi" k="yTrainerLevel" currentvalue="${Tool.yTrainerLevel}" style="width:55px;margin:0 auto;text-align-last: center;"></select>`+
            `               </label>`+
            `            </td>`+
            `         </tr>`+
            `         <tr style="height:20px;line-height:20px;display:none;">`+
            `            <td colspan="2" style="text-align:center;">${CreateButton('saveChangeProperties', GetText('Update'), '', 'padding:3px 8px; width:43px;')}</td>`+
            `         </tr>`+
            `      </tbody>`+
            `      <tfoot>`+
            `         <tr style="line-height:10px;height:10px;">`+
            `            <td colspan="2">`+
            `               <p style="width: 60px;border-top:1px solid gray;margin:0 auto 2px;">`+
            `                  <img id="toggleExtraSettings" src="${Tool.sources.get('show')}" alt="show.png" width="15px" style="cursor:pointer;margin-top:2px;">`+
            `               </p>`+
            `            </td>`+
            `         </tr>`+
            `      </tfoot>`+
            `   </table>`+

            //Scriptin özelliklerinin gösterileceği tablo ekleniyor.
            `   <table id="featureList" class="table" style="margin-Top:10px;display:none;table-layout:fixed;">`+
            `      <thead>`+
            `         <tr style="background:none;">`+
            `            <th width="60%">${GetText('Features')}</th>`+
            `            <th>${GetText('Action')}</th>`+
            `         </tr>`+
            `      </thead>`+
            `      <tbody></tbody>`+
            `   </table>`+

            //Script menüsünün en alt kısmı ekleniyor.
            `   <div style="font-family:Comic Sans MS; color:white; font-weight:bold; background-color:black; margin:15px -5px -6px -5px; border-radius: 0 0 6px 6px; padding:5px 0; text-align:center;">`+
            `      <p style="font-size:11px;margin:0;">`+
            `         ${GetText('QuestionHelp')} : `+
            `         <a href="https://forum.fussballcup.de/showthread.php?t=417372&page=22 "style="color:#14ffff; text-decoration:none; font-size:10px;" target="_blank">`+
            `            ${GetText('ClickMe')}`+
            `         </a>`+
            `      </p>`+
            `      <p style="font-size:11px;margin:0;">`+
            `         ${GetText('ScriptWriter')} : `+
            (()=>{
                let createLink = (text, clubId, color="#14ffff")=> `<a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${clubId}" style="color:${color}; text-decoration:none; cursor:pointer; font-size: 10px;">${text}</a>`;
                if(!Tool.hasOwnProperty('authorClubIds')) return createLink(GM_info.script.author, Tool.authorClubId);
                return Object.entries(Tool.authorClubIds).map(([author, clubId], idx)=> createLink(author, clubId) ).join(' | ');
            })()+
            `      </p>`+
            `   </div>`+
            `</div>`
        );

        //Script menüsüne seçili dil eklenmiş durumda fakat diğer diller şimdi ekleniyor.
        for(let [key,name] of Object.entries(Translate.locale.texts.OtherLanguages)) $('#gameLanguage').append(`<option value="${key}">${name}</option>`);

        let selects = $('#AntrenörSeviyesi, #GAntrenörSeviyesi');
        for(let lvl=10; lvl>-1; lvl--) selects.append(`<option value="${lvl}">${lvl} ${GetText('SortLevel', {tag:0})}</option>`)

        //Geçerli olan antrenör ve genç antrenör seviyeleri aktif ediliyor ve sonlarına ' *' ekleniyor.
        $('#AntrenörSeviyesi').val(Tool.trainerLevel);
        $('#AntrenörSeviyesi > option:selected')[0].innerHTML+=' *';
        $('#GAntrenörSeviyesi').val(Tool.yTrainerLevel);
        $('#GAntrenörSeviyesi > option:selected')[0].innerHTML+=' *';

        //CSS Ekle
        $('head').append('<link id="font-awesome" rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">'); //Required for ticks inside checkbox
        GM_addStyle(
            `.disHighlight{ user-select: none; -webkit-user-select: none; -ms-user-select: none; -webkit-touch-callout: none; -o-user-select: none; -moz-user-select: none; } @keyframes flickerAnimation { 0%   { opacity:1; } 50%  { opacity:0; } 100% { opacity:1; } } @-o-keyframes flickerAnimation{ 0%   { opacity:1; } 50%  { opacity:0; } 100% { opacity:1; } } @-moz-keyframes flickerAnimation{ 0%   { opacity:1; } 50%  { opacity:0; } 100% { opacity:1; } } @-webkit-keyframes flickerAnimation{ 0%   { opacity:1; } 50%  { opacity:0; } 100% { opacity:1; } } .animate-flicker { -webkit-animation: flickerAnimation 1s infinite; -moz-animation: flickerAnimation 1s infinite; -o-animation: flickerAnimation 1s infinite; animation: flickerAnimation 1s infinite; } #scriptMenuToggleBtn{ position:absolute; top: 141px; right: -23px; height:40px; width:40px; background-image: url(${Tool.sources.get('menuBtn')}); z-index:8; opacity:.5; cursor:pointer; } #scriptMenuToggleBtn:hover , #scriptMenuToggleBtn.active{ opacity:1; } #ScriptMenu > table > tbody > tr > td{ word-wrap: break-word; white-space: normal; line-height: 15.5px; padding:3px 6px; } #ScriptMenu{ z-index:9; position: absolute; width: 220px; background: white; left: 1010px; top: 192px; overflow-wrap: break-word; display: block; margin: 0 auto; padding:5px; border-radius: 8px; font-size:11px; border: 1px solid black!important; box-sizing: border-box; } #ScriptMenu > h2{ width: 100%; color: white; font-weight: bold; border: 0; margin: -5px 0 0 -5px; text-align: center; font-size: 14px; height: 30px; background:url(/designs/redesign/images/layout/headlines_sprite.gif) 0 -70px repeat-x; border-radius: 7px 7px 0 0; margin-bottom:5px; cursor:move; } table.table thead th:first-of-type{ border-radius : 7px 0 0 7px; } table.table thead th:last-of-type{ border-radius : 0 7px 7px 0; } table.table th{ background : #c01700; } table.table tbody tr.even > td{ background: #eee; } table.table tbody tr > td:first-of-type{ padding-left:5px; text-align:left; } table.table tbody tr.even > td:first-of-type{ border-radius : 7px 0 0 7px; } table.table tbody tr.even > td:last-of-type{ border-radius : 0 7px 7px 0; } table.table tbody td{ border-bottom: 0; } div.box p{ margin-Bottom:5px; } .slideThree input[type=checkbox]{ visibility: hidden; } .slideThree { cursor:pointer; width: 55px; height: 21px; background: #333; margin: 0; -webkit-border-radius: 55px; -moz-border-radius: 50px; border-radius: 50px; position: relative; -webkit-box-shadow: inset 0px 1px 1px rgba(0,0,0,0.5), 0px 1px 0px rgba(255,255,255,0.2); -moz-box-shadow: inset 0px 1px 1px rgba(0,0,0,0.5), 0px 1px 0px rgba(255,255,255,0.2); box-shadow: inset 0px 1px 1px rgba(0,0,0,0.5), 0px 1px 0px rgba(255,255,255,0.2); } .slideThree:after { content: \'Off\'; font: 9px/26px Arial, sans-serif; color: red; position: absolute; right: 7px; top: -2px; z-index: 0; font-weight: bold; text-shadow: 1px 1px 0px rgba(255,255,255,.15); } .slideThree:before { content: \'On\'; font: 9px/26px Arial, sans-serif; color: #00bf00; position: absolute; left: 7px; top: -2px; z-index: 0; font-weight: bold; } .slideThree label { display: block; width: 25px; height: 17px; -webkit-border-radius: 50px; -moz-border-radius: 50px; border-radius: 50px; -webkit-transition: all .4s ease; -moz-transition: all .4s ease; -o-transition: all .4s ease; -ms-transition: all .4s ease; transition: all .4s ease; cursor: pointer; position: absolute; top: 2px; left: 3px; z-index: 1; -webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3); -moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3); box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.3); background: #fcfff4; background: -webkit-linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%); background: -moz-linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%); background: -o-linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%); background: -ms-linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%); background: linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#fcfff4\', endColorstr=\'#b3bead\',GradientType=0 ); } .slideThree input[type=checkbox]:checked + label { left: 26px; } label.menü > select { padding:4px; margin: 0; -webkit-border-radius:9px; -moz-border-radius:4px; border-radius:4px; -webkit-box-shadow: 0 px 0 #ccc, 0 -1px #fff inset; -moz-box-shadow: 0 2px 0 #ccc, 0 -1px #fff inset; box-shadow: 0 2px 0 #ccc, 0 -1px #fff inset; background: #f8f8f8; color:#888; border:none; outline:none; display: inline-block; -webkit-appearance:none; -moz-appearance:none; appearance:none; cursor:pointer; } label.menü > select { padding-right:18px; font-size:11px; width:45px; margin:0 auto; text-align-last: center; } label.menü { position:relative } label.menü:after { content:'<>'; font:8px \"Consolas\", monospace; color:#aaa; -webkit-transform:rotate(90deg); -moz-transform:rotate(90deg); -ms-transform:rotate(90deg); transform:rotate(90deg); right:2px; top:2px; padding:0 0 2px; border-bottom:0px solid #ddd; position:absolute; pointer-events:none; } label.menü:before { content:''; right:0px; top:0px; width:5px; height:px; background:#f8f8f8; position:absolute; pointer-events:none; display:block; } @keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-1.25em); } 100% { opacity: 1; transform: translateY(0); } } .openClose[open] { animation-name: fadeInDown; animation-duration: 0.5s; } @keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-1.25em); } 100% { opacity: 1; transform: translateY(0); } } .details5[open] { animation-name: fadeInDown; animation-duration: 0.5s; } @keyframes fadeInUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-1.25em); } } .openClose[close] { animation-name: fadeInUp; animation-duration: 0.5s; } .checkbox_1 { display: none; } .checkbox_1 + label:before { cursor: pointer; content: \'\\2714\'; border: 0.1em solid #d95555; border-radius: 0.2em; display: inline-block; width: 1.1em; height: 1em; padding-left: 0em; padding-bottom: 0.3em; padding-top:-0.1em; margin-right: 0em; vertical-align: middle; text-align:center; color: #d95555; transition: .2s; } .checkbox_1 + label:active:before { transform: scale(0); } .checkbox_1:checked + label:before{ background-color: red; border-color: red; color: #fff; } /*** custom checkboxes ***/ .checkbox_2 { display:none; } /* to hide the checkbox itself */ .checkbox_2 + label:before { font-family: FontAwesome; display: inline-block; } .checkbox_2 + label:before { content: \'\\f096\'; } /* unchecked icon */ .checkbox_2 + label:before { letter-spacing: 2px; } /* space between checkbox and label */ .checkbox_2:not(:checked):hover + label:before{content: \'\\f046\';color:#6f6e6e;letter-spacing: 0;} .checkbox_2:checked + label:before { content: \'\\f046\'; } /* checked icon */ .checkbox_2:checked + label:before { letter-spacing: 0; } /* allow space for check mark */ .sorting_players{ font-size:10px; text-align:center; padding:5px 0; margin-bottom: 9px; border-bottom: 1px solid white; line-height:1.5; } .sorting_players > label{ display:inline-block; } .sorting_players > label:not(:first-child){ margin-left:8px; } .sorting_players > label > input{ vertical-align:middle; margin:-3px 1px 0 0; cursor:pointer; } .sorting_players st{ color:#c8c7c7; } .sorting_players input:checked + st{ color : #04da97; } .filterByPositions{ margin: -3px 0 7px; text-align: center; } .filterByPositions > .filter_position{ border-radius: 20%; background-color:green; cursor: pointer; display:inline-block; padding:2px 0; font-size: 8px; color: white; min-width: 20px; opacity:1; margin:2px; } .filterByPositions > .filter_position.not_active{ opacity:0.3; } .grow,.grow2 { transition: all .2s ease-in-out; } .grow:hover { transform: scale(1.1); } .grow2:hover{ transform: scale(1.5); } .slider { -webkit-appearance: none; width: 100%; height: 20px; background: #d3d3d3; outline: none; opacity: 0.7; -webkit-transition: .2s; transition: opacity .2s; } .slider:hover { opacity: 1; } .slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; border-radius:6px; width: 30px; height: 20px; background: #4CAF50; cursor: pointer; } .slider::-moz-range-thumb { border-radius:6px; width: 30px; height: 20px; background: #4CAF50; cursor: pointer; }`
            +`.rotating-dashed { position: relative; overflow: hidden; } .rotating-dashed .dashing:nth-of-type(1) { transform: rotate(0deg); } .rotating-dashed .dashing:nth-of-type(2) { transform: rotate(90deg); } .rotating-dashed .dashing:nth-of-type(3) { transform: rotate(180deg); } .rotating-dashed .dashing:nth-of-type(4) { transform: rotate(270deg); } .rotating-dashed .dashing { display: block; color:#4fdee8; width: 100%; height: 100%; position: absolute; } .rotating-dashed .dashing i { box-sizing:border-box; display: block; position: absolute; left: 0; top: 0; width: 200%; border-bottom: 2px dashed; animation: slideDash 3.5s infinite linear; } @keyframes slideDash { from { transform: translateX(-50%); } to { transform: translateX(0%); } }`
            +`table:has(th.sticky){ position:relative; } th.sticky{ position: sticky; top: 0; z-index: 10; background: url(/designs/redesign/images/table/header_bg.gif) repeat-x; }`
        );
    }
    createMenuEvents(){
        delete this.__proto__.createMenuEvents;

        //Script menüsü hareket ettirilebilecek.
        $("#ScriptMenu").draggable({ handle: "h2" });

        //Oyun dili değiştirilmek istendiğinde yapılacak kodlar ekleniyor.
        $('#gameLanguage').change(function(){
            //Select box kitleniyor.Bu sayede dil değiştirilene kadar tekrar değiştirilmesine izin verilmiyor.
            this.disabled = true;
            this.style.cursor = 'not-allowed';

            //Change Language
            let result = Translate.changeLanguage(this.value, this.selectedIndex);
            if(result.status=='success'){
                Tool.language = Translate.locale.name;

                //Update User Servers Language Preferences
                let userLanguage = GM_getValue('userLanguage',{});
                if(typeof userLanguage != 'object') userLanguage = {};
                userLanguage[Game.server] = Tool.language;
                GM_setValue('userLanguage', userLanguage);
            }
            else{
                Game.giveNotification(!1, result.msg);
                throw new Error(JSON.stringify(result, null, '\t'));
            }

            //Kitlenen select box açılıyor.
            this.disabled = false;
            this.style.cursor = '';
        });

        //Script menüsünde çok yer kaplamaması için gizlenen antrenör ve genç antrenör select boxlarının gizlenip-gösterilebilmesi için click eventi oluşturuluyor.
        $('#toggleExtraSettings').click(function(){
            $('#ExtraSettings').toggle();
            let a = $('#toggleExtraSettings').attr('alt')=='hide'?'show':'hide';
            $(this).attr({
                'src': Tool.sources.get(a),
                'alt': a + '.png'
            });
            if(a=='hide' && $('#saveChangeProperties').closest('tr').is(':visible')){ //Restore
                $('#AntrenörSeviyesi').val($('#AntrenörSeviyesi').attr('currentvalue'));
                $('#GAntrenörSeviyesi').val($('#GAntrenörSeviyesi').attr('currentvalue'));
                $('#saveChangeProperties').closest('tr').hide();
            }
        });

        //Antrenör veya genç antrenör seviyesi güncel seviyesinden farklı olursa kayıt etme butonu gösteriliyor,aksi taktirde gizleniyor.
        $('#AntrenörSeviyesi').add($('#GAntrenörSeviyesi')).change(function(){
            let o=$('#'+(this.id=='AntrenörSeviyesi'?'GAntrenörSeviyesi':'AntrenörSeviyesi'));
            $('#saveChangeProperties').closest('tr')[
                this.value!=$(this).attr('currentvalue') || o.val()!=o.attr('currentvalue')?'show':'hide'
            ]();
        });

        //Değiştirilen antrenör ve|veya genç antrenör seviyeleri kayıt ediliyor ve sayfa yenilenerek değişikli(ğin|klerin) gösterilmesi sağlanıyor.
        $('#saveChangeProperties').click(function(){
            $(this).closest('tr').hide();
            let clubDatas = Tool.getVal('clubDatas');
            clubDatas.trainerLevel = parseInt($('#AntrenörSeviyesi').val());
            clubDatas.yTrainerLevel = parseInt($('#GAntrenörSeviyesi').val());
            Tool.setVal('clubDatas',clubDatas);
            location.reload();
        });

        //Script verilerilerinin indirilmesi
        $('#downloadValues').click(function(){
            let cookies = GM_listValues().sort((a,b)=>{
                let i1=a.indexOf('_')+1,
                    i2=b.indexOf('_')+1;
                return ('' + a.substring(0, i1)).localeCompare(b.substring(0, i2)) || ('' + a.substring(i1)).localeCompare(b.substring(i2));
            }), result = '';

            for(let i=0, len=cookies.length, add, key, data; i<len; i++){
                key = cookies[i];
                add = '';
                if(!(data = GM_getValue(key))) continue;
                add = Array.isArray(data)? returnArrayString(data): JSON.stringify(data, null, '\t');
                result += `CookieKey&:${key}:${add}\n\n`;
            }
            if((result = result.trim()) != "") DownloadAsTextFile(result, GetText('ScriptMenuTitle', {tag:0}));
            else Game.giveNotification(!1, GetText('NotDataExist'));

            function returnArrayString(arr){
                let o = [];
                for(let i=0, len=arr.length, item; i<len; i++){
                    item = arr[i];
                    o.push(Array.isArray(item)? returnArrayString(item): JSON.stringify(item, null, '\t'));
                }
                return `[${o.join(',')}]`;
            }
        });

        //İndirilen script verilerinin yüklenmesi
        $('#uploadValues').click(function(){
            ReadTextFile((valuesText)=>{
                valuesText.split('CookieKey&:').slice(1).forEach(data=>{
                    let b = data.indexOf(':');
                    GM_setValue(data.substring(0,b), JSON.parse(data.substring(b+1)) );
                });
                Tool.fixValues();
                Game.giveNotification(!0, GetText('DataLoaded')+'!!');
                setTimeout(()=>location.reload(), 1e3);
            });
        });

        //Scriptin sıfırlanması
        $('#deleteValues').click(function(){
            let globaldatas = GM_listValues().filter(key=>{return key.indexOf('_')==-1}),
                opt = ["1","2"],
                exit = "3";
            if(globaldatas.length!=0){
                opt.push("3");
                exit = "4";
            };
            let wrongChoise = $(this).attr('wrong_choise'),
                choise = prompt(
                    (wrongChoise==undefined?"":`${GetText('wrongChoise', {tag:0})} ${wrongChoise}\n\n`)+
                    `1: ${GetText('delAllData', {tag:0})}\n`+
                    `2: ${GetText('delCurServerData', {tag:0, args:[Game.server]})}\n`+
                    (globaldatas.length==0?"":`3: ${GetText('delGlobalData', {tag:0})} ${globaldatas.join(', ')}\n`)+
                    `${exit}: ${GetText('exit', {tag:0})}\n`+
                    GetText('enterChoise', {tag:0}),2
                );
            $(this).removeAttr('wrong_choise');

            if(choise==null || choise==exit) return;
            if(!opt.includes(choise)){
                $(this).attr('wrong_choise', choise).click();
                return;
            }

            let keys;
            if(choise=="1") //Delete all servers datas
                keys = GM_listValues();
            else if(choise=="2"){ //Delete current server datas
                keys = GM_listValues().filter(key=>{
                    let find = key.indexOf('_');
                    return find!=-1 && key.substring(0,find).trim() == Game.server
                });
            }
            else keys = globaldatas;

            keys.forEach(key=>GM_deleteValue(key));
            Game.giveNotification(!0, GetText('DataCleared'));
            setTimeout(()=>location.reload(), 1e3);
        });

        //Show tool settings dialog
        $('#fcupToolSettings').click(function(){
            // $(this).prop('disabled', true);

            let focus = ShowDialog(
                GetText('fcupToolSettings'),
                `<p>${GetText('settingP1')}</p><br>`+
                (function addCheckBoxes(){
                    let checkBoxes = [
                        ['blurSomeInfos', GetText('set_blurSomeInfos'), !1]
                    ];

                    let settings = Tool.settings;
                    let cbs = settings.cb || {};

                    return checkBoxes.map(cb=>{
                        let enabled = (cbs.hasOwnProperty(cb[0]) && cbs[cb[0]]) || cb[2];
                        return `<p><label><input type="checkbox" cbid="${cb[0]}" class="tCbSettings" ${enabled?'checked':''} style="vertical-align: middle; margin-top: 0px;"> ${cb[1]}</label></p>`
                    });
                })()
            );

            $('input[type="checkbox"].tCbSettings', focus).change(function(){
                let cbid = ($(this).attr('cbid')||'').trim();
                if(cbid == "") return;

                let s = Tool.getVal('settings', {});
                if(s.cb) s.cb[cbid] = this.checked;
                else s.cb = {[cbid]: this.checked};
                Tool.setVal('settings', s);
                Tool.settings = s;

                ApplyToolSetting(cbid, this.checked);
            });

        });

        //For Features Table
        this.featuresList = {
            clear:function(){
                $('#featureList >tbody').html('').parent().hide();
            },
            show:function(features){
                let tbody = $('#featureList >tbody');
                if(!features.length){
                    tbody.parent().hide();
                    return;
                }

                features.forEach((feature, i)=>{
                    let div = $('<div class="slideThree"></div>'),
                        featureId = feature.name,
                        featureName = Translate.locale.texts.FeaturesName[featureId] || featureId;
                    if(feature.hover_selector!=undefined){
                        div.attr('hover_selector',feature.hover_selector);
                        $(feature.hover_selector).css('transition', 'background-color 1s');
                    }
                    div.append(
                        `<input type="checkbox" id="${featureId}" class="slideThreeInput" ${feature.active?'checked="checked"':''} data-active="${feature.active}" disabled>`+
                        `<label for="${featureId}"></label>`
                    );
                    tbody.append(
                        `<tr class="${i%2?'even':'odd'}">`+
                        `   <td><label k="${featureId}">${featureName}</label></td>`+
                        `   <td>${div[0].outerHTML}</td>`+
                        '</tr>'
                    );
                    if(feature.active && !feature.work){
                        $('>tr:last >td:first', tbody).css({
                            'color':'#e23f3fb5',
                            'font-style':'italic'
                        });
                    }
                });

                tbody.parent().show();
            }
        }

        $('#featureList >tbody')
            .on('mouseenter', '.slideThree:has(>.slideThreeInput:first)', function(){
            let feaName = $('>input', this).attr('id'),
                feature = Tool.features.getByName(feaName);
            if(!(feature instanceof Feature)) return;
            if(feature.work)
                $($(this).attr('hover_selector')).addClass('animate-flicker').css('background-color','#910e0ea8');
        })
            .on('mouseleave', '.slideThree:has(>.slideThreeInput:first)', function(){
            $($(this).attr('hover_selector')).removeClass('animate-flicker').css('background-color','');
        })
            .on('click', '>tr .slideThree', function(){
            let input = $('>.slideThreeInput', this)[0],
                checked = !input.checked,
                feaId = input.id,
                feature = Tool.features.getByName(feaId);
            if(!(feature instanceof Feature)) return;

            let css = {},
                title='',
                feaName = Translate.locale.texts.FeaturesName[feaId] || feaId;

            if(checked){
                input.checked = checked;
                let neverWorked = !1;
                if($(input).attr('data-active') == 'false'){
                    neverWorked = !0;
                    $(input).removeAttr('data-active');
                }
                let ran = feature.activate(neverWorked);
                if(ran){
                    if(feature.work) css = {'color':'turquoise','font-style':'normal'}, title = GetText('featureActivated', {args:[feaName]});
                    else css = {'color':'#e23f3fb5','font-style':'italic'}, title = GetText('feaTry2Run', {args:[feaName]});
                }
                else{
                    if(!neverWorked){
                        if(feature.work) css = {'color':'green'}, title = GetText('feaAlreadyWork', {args:[feaName]});
                        else css = {'color':'#e23f3fb5','font-style':'italic'}, title = GetText('feaReRun', {args:[feaName]});
                    }
                    else css = {'color':'purple'}, title = GetText('feaRunOnlyOnce', {args:[feaName]});
                }
            }
            else{
                let deactivated = feature.deactivate();
                if(deactivated){
                    input.checked = !1;
                }
                if(deactivated){
                    css = {'color':'#ffa500a8', 'font-style':'italic', 'text-shadow': '0 0 maroon'};
                    if(!feature.refreshWhenDeactivate)
                        title = GetText('featureDeactivated', {args:[feaName]});
                }
            }

            $(input).closest('tr').find('>td:first').css(css).attr('title', $('<div>').html(title).text());

            if(title){
                Game.giveNotification(!0, `<b>${checked?GetText('featureActivation'): GetText('featureDeactivation')}</b><br>${title}`);
            }
        });

        //Get tool features active status data
        let featuresActiveStatus = this.getVal('featuresActiveStatus', null),
            updated = 0;
        if(featuresActiveStatus == null) featuresActiveStatus = this.defaultFeaturesActiveStatus;
        else{
            Object.entries(this.defaultFeaturesActiveStatus).map(e=>{return {k:e[0],v:e[1]};}).forEach(f=>{
                //Yeni bir özellik geldiğinde veya var olan özellik bir şekilde kaybolduysa eklemek için;
                if(!featuresActiveStatus.hasOwnProperty(f.k)){
                    featuresActiveStatus[f.k] = f.v;
                    ++updated;
                }
            });
        }
        delete this.defaultFeaturesActiveStatus;

        for(let [featureKey,enable] of Object.entries(featuresActiveStatus)){ //Tool'a eklenen özelliklere başlangıç durumunu(etkin/devre dışı) verecek
            let feature = this.features.getByName(featureKey);
            if(feature==undefined){ //Özellik kaldırıldı veya verilerde yanlış düzenleme mevcut
                delete featuresActiveStatus[featureKey];
                ++updated;
                continue;
            }
            feature.active = enable;
        }
        if(updated>0) this.setVal('featuresActiveStatus', featuresActiveStatus);
    }
    checkVersion(versionDialogCB){
        delete this.__proto__.checkVersion;

        return new Promise(res=>{
            let scriptLink = "https://greasyfork.org/scripts/40715-fcup-script",
                scriptName = "FCup%20Script",
                versionControlLink = `${scriptLink}/code/${scriptName}.meta.js`,
                downloadLink = `${scriptLink}/code/${scriptName}.user.js`;

            let toMs = 2000,
                bTimeout = !1;
            let timeout = setTimeout(()=>{
                bTimeout = !0;
                console.log('[Version control] => %cTimeout 2000', 'color:maroon;');
                Game.giveNotification(!0, GetText('versionControlTimeout', {args:[toMs]}))
                res();
            }, toMs);

            GM_xmlhttpRequest({
                method: "GET",
                url: versionControlLink,
                onload: function(response) {
                    if(bTimeout) return;
                    clearTimeout(timeout);

                    let giveError = msg=>{
                        console.log('[Version control] => %cSomething is wrong in greasyfork.', 'color:red;');
                        Game.giveNotification(!0, msg || GetText('versionControlFailed'));
                        res();
                    };

                    try{
                        let text = response.responseText;
                        if(text === undefined) return giveError();

                        let b = text.indexOf('@version')+8;
                        if(b == -1) return giveError();

                        let b1 = text.indexOf('/',b);
                        if(b1 == -1) return giveError();

                        let compare = (t,n) => {if(t===n)return 0;for(var e=t.split("."),r=n.split("."),l=Math.min(e.length,r.length),a=0;a<l;a++){if(parseInt(e[a])>parseInt(r[a]))return 1;if(parseInt(e[a])<parseInt(r[a]))return-1}return e.length>r.length?1:e.length<r.length?-1:0};
                        let version = text.substring(b,b1).trim(),
                            currentVersion = GM_info.script.version;

                        if(version == "") return giveError();

                        if(compare(version, currentVersion) == 1){
                            res(
                                versionDialogCB(()=>{
                                    let dialog = ShowDialog(
                                        //Header
                                        `<span class="icon" style="background:url(/designs/redesign/images/layout/icons_sprite.png?v=2.2.6.14231) 0 -1180px no-repeat;margin-Right:10px;float:left;margin:6px;"></span>`+
                                        GetText('ReleasedVersion', {args:[version]}),

                                        //Content
                                        `<img src="${Tool.sources.get('newVersion')}" alt="newVersion.png" style="height:73px; float:left; margin:-15px 0 0 -15px;">`+
                                        `<p style="font-size:15px; margin-Bottom:10px; font-weight:bold; color:red; text-align:center;">`+
                                        `   ${GetText('CurrentVersion')+' '+currentVersion}`+
                                        `   <label style="color:green; margin-Left:50px;">${GetText('NewVersion')+" : "+ version}</label>`+
                                        `</p>`+
                                        `<p style="font-size:14px; font-weight:bold; color:blue;">`+
                                        `   ${GetText('UpdateTheScriptInfo', {args:[`<a href="${downloadLink}" style="font-size:14px">`,'</a>']})}`+
                                        `</p>`+
                                        `<p style="margin-Top:20px;text-align:center;">${CreateButton('relaodPage', GetText('RefreshPage'))}</p>`
                                    );
                                    $('[id="relaodPage"]:first', dialog).click(()=>location.reload());
                                    return dialog;
                                })
                            );
                        }
                        else{
                            console.log('[Version control] => %cVersion up to date.','color:green;');
                            res();
                        }
                    }
                    catch(err){
                        Game.giveNotification(!0, GetText('versionControlFailed2'));
                        console.log('[Version control] => Error: %o', err);
                        res();
                    }
                },
                onerror: function() {
                    if(bTimeout) return;
                    clearTimeout(timeout);

                    console.log('[Version control] => %cFail!','color:red;');
                    Game.giveNotification(!0, GetText('versionControlFailed')+'...');
                    res();
                }
            });
        });
    }
    createNoticeArea(){
        delete this.__proto__.createNoticeArea;

        GM_addStyle(`#notice_in { color: white; font-size: 12px; background-color: #088A08; padding: 3px; width: 130px; margin: auto; border-radius: 10px; cursor: pointer; letter-spacing: 0.11em; } #notice_out { width: 100%; background-color: transparent; padding: 10px; border: 0px solid #088A08; } #Notizbereich { position: static; margin: 5px; height: 150px; background-color: #FFFFFF; border: 1px solid #DF0101; border-radius: 10px; padding: 4px 5px; min-height: 59px; min-width: 345px; } .notiz_button { border-radius: 12px; background-color: #B40404; border: none; color: #FFFFFF; text-align: center; font-size: 13px; padding: 4px; width: 106px; transition: all 0.5s; cursor: pointer; margin: 2px 8px; }`);
        $('body').prepend(
            `<div id="notice_area">`+
            `   <div id="notice_in" class="disHighlight" lock="0">${GetText('OpenNote')}</div>`+
            `   <div id="notice_out">`+
            `      <p>`+
            `         <textarea id="Notizbereich" cols="80" rows="5" placeholder="${GetText('WriteANote', {tag:0})}" tool_pt="WriteANote" style="max-width:${$('#header').width()}px;">${Tool.getVal('Notiz','')}</textarea>`+
            `         <p>`+
            `            <input id="notiz_save_btn" class="notiz_button" type="button" value="${GetText('SaveNote', {tag:0})}" tool_vt="SaveNote">`+
            `            <input id="notiz_clr_btn" class="notiz_button" type="button" value="${GetText('ClearField', {tag:0})}" tool_vt="ClearField">`+
            `         </p>`+
            `      </p>`+
            `      <p>`+
            `         <font id="change_clue" style="color:#1C6125;border-radius:7px;padding:3px 4px;text-align:center;opacity:0;"></font>`+
            `      </p>`+
            `   </div>`+
            `</div>`
        );
        $('#notice_out').attr('outerHeight',$('#notice_out').outerHeight()).hide();
        $("#chatToggleBtn").css('top','+='+$('#notice_area').outerHeight()+'px');//Düzenleme yapılıyor.

        $('#notice_in').click(function(){
            if($(this).attr('lock')!=0) return;
            $(this).attr('lock',1);

            let open = !$('#notice_out').is(':visible'),
                time = 750;
            $('#notice_in').html(open?GetText('CloseNote'):GetText('OpenNote'));

            $('#notice_out').slideToggle(time);
            $("#chatToggleBtn").animate({ "top": (open?"+":"-")+"="+$('#notice_out').attr('outerHeight')+"px" }, time);
            setTimeout(()=>{ $(this).attr('lock',0); },time);
        });

        $('#notiz_save_btn').click(function(){
            Tool.setVal('Notiz', $('#Notizbereich').val());
            change_clue(GetText('SavedNote'));
        });
        $('#notiz_clr_btn').click(function(){
            $('#Notizbereich').val('');
            Tool.delVal('Notiz');
            change_clue(GetText('ClearedNote'));
        });

        let interval;
        function change_clue(value){
            $('#change_clue').animate({'opacity':1});
            clearTimeout(interval);
            $('#change_clue').html(value);
            interval = setTimeout(function() {
                $('#change_clue').animate({'opacity':0},200);
                setTimeout(()=>{
                    $('#change_clue').html('');
                },200);
            }, 2800);
        }
    }
    async checkGameVersion(){
        delete this.__proto__.checkGameVersion;

        let li = $('#footer >.server-infos> li:first');
        let regexp = /([^\s]+)\s\d{1,},\d{1,3}s$/;
        let gameVersion;
        while(li != undefined){
            let text = li.text().trim();
            let res = text.match(regexp);
            if(res != null){
                gameVersion = res[1];
                break;
            }
            li = li.find('~li:first');
        }
        if(!gameVersion) throw new Error("Game version didn't detected!");
        console.log("Game version: " + gameVersion);
        if(this.gameVersion != gameVersion){
            return await new Promise(res=>{
                let yesBtn = $(CreateButton('', GetText('Yes', {tag:0}), 'margin-right:10px;')).attr('data',1),
                    noBtn = $(CreateButton('', GetText('No', {tag:0}))).attr('data',0);

                let dialog = ShowDialog(
                    `[${GetText('ScriptMenuTitle', {tag:0})}] ${GetText('difGameVersHead', {tag:0})}`,
                    `<p>${GetText('difGameVersExp1', {tag:0, args:[`<b>${GM_info.script.version}</b>`, `<font color="maroon">${this.gameVersion}</font>`, ` <font color="seagreen">${gameVersion}</font>`]})}</p>`+
                    `<p>${GetText('difGameVersExp2', {tag:0})}</p>`+
                    `<p>${GetText('confirm2RunScript', {tag:0})}</p>`
                );
                dialog.append($('<p>').css({'text-align':'center','margin':'10px 0 -10px 0'}).append(yesBtn, noBtn))
                    .css('top', Math.max(190, ($(window).innerHeight() - dialog.height()) / 2) + 'px'); //Center horizontally

                yesBtn.add(noBtn).click(function(){
                    dialog.find('>div.close:first')[0].click();
                    res($(this).attr('data'));
                });
            });
        }
        return Promise.resolve();
    }

    pipe(p){
        if(typeof p == 'function') return p(Tool);
        else if(typeof p == 'string'){
            if(p!="") return eval(p);

            return null;
        }
    }

    printValues(){
        delete this.__proto__.printValues;
        let values = this.fixValues();
        if(!values.length){
            console.log("%c! ANY COOKIES ARE EXIST",'color:red;font-weight:bold;font-size:15px;');
            return;
        }

        console.log("%cVALUES","color:white;text-align:center;font-size:15px;padding:2px 500px;background-color:black;border-radius:7px;text-weight:bold;display:inline;");
        values.sort((a,b)=>{
            let i1=a.indexOf('_')+1,
                i2=b.indexOf('_')+1;
            return ('' + a.substring(0, i1)).localeCompare(b.substring(0, i2)) || ('' + a.substring(i1)).localeCompare(b.substring(i2));
        });

        let maxLongKey = values.reduce((acc, val)=>Math.max(acc, val.length), 0);
        values.forEach(cookieKey=>{
            let find = cookieKey.indexOf('_');
            console.log(
                '%c' + cookieKey.substring(0,find) + '%c' + (find!=-1?'_':'   ') + '%c' + cookieKey.substring(find+1) + (" ").repeat(Math.abs(maxLongKey-cookieKey.length+(find!=-1?0:-3))) + ' %c: %c%o',
                'font-weight:bold;color:blue;',
                'font-weight:bold;color:orange;',
                'font-weight:bold;color:green;',
                'font-weight:bold;color:black;',
                'color:black;',
                GM_getValue(cookieKey)
            );
        });
        console.log('\n');
    }
    fixValues(valuesList=GM_listValues()){
        for(let i=0, len=valuesList.length, find, server, valueKey, valueName, deleteValue; i<len; i++){
            valueKey = valuesList[i];
            deleteValue = !1;

            if((find=valueKey.indexOf('_'))==-1) server=null;
            else server = valueKey.substring(0,find);

            switch(valueName=valueKey.substring(find+1)){
                case 'clubDatas':
                    var clubDatas = GM_getValue(valueKey);
                    if(typeof clubDatas == 'object'){
                        if(clubDatas.hasOwnProperty('trainingProgram')){
                            delete clubDatas.trainingProgram;
                            GM_setValue(valueKey, clubDatas);
                        }
                    }
                    else deleteValue = !0;
                    break;
                case 'LeagueData':
                    var LeagueData = GM_getValue(valueKey);
                    if(typeof LeagueData == 'object' && !$.isEmptyObject(LeagueData)){
                        if(LeagueData.hasOwnProperty('IlkMacTarihi')){
                            LeagueData.firstMatchDate = LeagueData.IlkMacTarihi;
                            LeagueData.firstHalfFinalMatchDate = LeagueData.IlkYarıSonMacTarihi;
                            LeagueData.lastMatchDate = LeagueData.SonMacTarihi;
                            LeagueData.league = LeagueData.lig;
                            delete LeagueData.IlkMacTarihi;
                            delete LeagueData.IlkYarıSonMacTarihi;
                            delete LeagueData.SonMacTarihi;
                            delete LeagueData.lig;
                            GM_setValue(valueKey, LeagueData);
                        }
                    }
                    else deleteValue = !0;
                    break;
                /*case 'ClubExchange':
                    let ClubExchange = GM_getValue(cookieKey);
                    if(typeof ClubExchange == 'object' && !$.isEmptyObject(ClubExchange)){
                        for(let PlayerId in ClubExchange){
                            let date = ClubExchange.date; //03.02.2019
                        }
                    }
                    else deleteCookie = !0;
                    break;
                case 'YoungPlayers':
                    let YoungPlayers = GM_getValue(cookieKey);
                    if(typeof YoungPlayers == 'object'){

                    }
                    else deleteCookie = !0;
                    break;*/
                case 'AutomaticTraining':case 'PlayersHealth':case 'SquadsStrength':
                    deleteValue = !0;
                    break;
                case 'FeaturesOfScript': case 'featuresActiveStatus':
                    var featuresActiveStatus = GM_getValue(valueKey);
                    if(valueName=='FeaturesOfScript'){
                        GM_setValue(server+'_featuresActiveStatus',featuresActiveStatus);
                        deleteValue = !0;
                    }

                    if(typeof featuresActiveStatus == 'object'){
                        let changed = 0;
                        if(featuresActiveStatus.PlayersHealth){
                            delete featuresActiveStatus.PlayersHealth;
                            changed++;
                        }
                        else if(featuresActiveStatus.CalculateNonYoungPlayersStrength){
                            delete featuresActiveStatus.CalculateNonYoungPlayersStrength;
                            changed++;
                        }
                        if(changed){
                            if($.isEmptyObject(featuresActiveStatus)) deleteValue = !0;
                            else GM_setValue(valueKey,featuresActiveStatus);
                        }
                    }
                    break;
                case 'YoungPlayers':
                    var YoungPlayers = GM_getValue(valueKey), //Structure: http://prntscr.com/ucg9s3
                        updated = 0;
                    if(typeof YoungPlayers != 'object') YoungPlayers = {};
                    if(typeof YoungPlayers.MessageBox != 'object'){ YoungPlayers.MessageBox = {}; ++updated; }
                    if(!Array.isArray(YoungPlayers.show)){ YoungPlayers.show = []; ++updated; }

                    var MessageBox = YoungPlayers.MessageBox,
                        show = YoungPlayers.show;
                    for(let playerName in MessageBox){
                        var date = MessageBox[playerName];
                        if(show.find(p=>{return p.name==playerName && p.date==date;}) != undefined){ //eslint-disable-line no-loop-func
                            delete MessageBox[playerName];
                            ++updated;
                        }
                    }
                    if(updated) GM_setValue(valueKey,YoungPlayers);
                    break;
            }

            if(deleteValue){
                GM_deleteValue(valueKey);
                valuesList.splice(i--,1);
            }
        }
        return valuesList;
    }
    modifyGameFunction(funcName, callBack, opts={}){
        let v = unsafeWindow[funcName];
        if(typeof v != 'function') throw new Error(`Game function(${funcName}) try to been modified but it was't found!`);
        let codes = v.toString(),
            anonFunc = codes.substring(0,codes.indexOf('(')).replace('function','').trim() == "",
            start = codes.indexOf('{')+1;
        let res = callBack(codes.substring(start, codes.lastIndexOf('}')));
        if(typeof res==undefined || res.substr(0,1)=="") return;

        $(`<script id="modifyFunction_${funcName}" type="text/javascript">`).html(
            "/*This function was modified by FCUP Script*/\n"+
            (anonFunc?`window.${funcName}=${opts.async?'async ':''}`:"")+
            codes.substring(0, start) + res + '}'
        ).appendTo('body').remove();
    }
    setVal(key,data){
        GM_setValue(Game.server+'_'+key, data);
    }
    getVal(key,defaultValue=undefined){
        return GM_getValue(Game.server+'_'+key, defaultValue);
    }
    delVal(key){
        GM_deleteValue(Game.server+'_'+key);
    }


})();
Tool.features = new (class ToolFeatures extends Array{
    constructor(...args){
        super(...args);
        this.getByName = FeatureGetByName;
    }

    add(name, ...oargs){
        if(this.getByName(name) instanceof Feature){
            console.error(new Error(`A feature with this name(${name}) was previously created.`));
            return;
        }
        let feature = new Feature(name, ...oargs);
        if(feature.err){
            console.error(new Error(`A feature with this name(${name}) can't be added! Err code: ${feature.err}`));
            return;
        }
        this.push(feature);
        feature.pages.forEach(page=> {
            page.features.push(feature);
        });
    };

    updateOnToolMenu(){ //featureList
    }
})();

unsafeWindow.toolPipe = Tool.pipe;

//Live game function is in minified.js that is external function in head tag. This function had been already declarated and it must be modify before first game page loaded.
//Before Sammy->get->updateLayout->$('#content').html(value)
Tool.modifyGameFunction('Live',content=>{
    content = `\n\t$('#content > h2:first').append('<img src="${Tool.sources.get('tick')}" alt="tick.png" height="25px" style="position:absolute;right: 3px;top: 3px;">');\n`+
        content;
    let b = content.search(/this.writeMessage\s*=\s*function/);
    b = content.indexOf('{',b)+1;
    b = content.indexOf('{',b)+1;
    content = content.substring(0,b)+ GetFuncContent(()=>{
        /*This codes were written by FCUP Script.*/
        try{
            var event_ = Object.assign({'_status': this.requestMin==0?'old':'new'}, arguments[1]);
            toolPipe(Tool=>{
                if(Tool.temp.hasOwnProperty('MatchEventCatcher')){
                    Tool.temp.MatchEventCatcher(event_);
                    return;
                }

                //Match event catcher not yet created
                if(!Tool.uncaught_events_queue) Tool.uncaught_events_queue = [];
                Tool.uncaught_events_queue.push(event_);
            });
        }
        catch(err){console.error('MatchEventCatcher Trigger ERROR: ' + err.message);}
    }) + content.substring(b);

    b = content.search(/this\s*\.\s*commit\s*=/);
    let c = content.substring(b).search(/\$\s*\.\s*get/);
    return content.substring(0, b+c) + GetFuncContent(()=>{
        /*This codes were written by FCUP Script for Live League Table*/
        try{
            if(toolPipe(Tool=>typeof Tool.temp.MatchEndCatcher == 'function')) toolPipe(Tool=>Tool.temp.MatchEndCatcher(this.matchId));
        } catch(err){ console.error(err); };
    }) + content.substring(b+c);
});

//updateLayout function is will declerate asap in body script tag.
//When it is exist it will be updated to start detecting page changing
Tool.updateLayoutModified = new Promise(res=>{
    Tool.intervals.create(function(){
        if(typeof unsafeWindow.updateLayout != 'function') return;
        this.delete();

        //The function named updateLayout are needed update for the FCUP Script. Because when the page change, fcup script should work then.
        Tool.modifyGameFunction(
            'updateLayout',
            function(content){
                content = `\ntry{\n`+
                    GetFuncContent(async ()=>{
                    if(!toolPipe('Tool.started')) /*Wait until tool is ready...*/
                        await new Promise(res=>{
                            let a,b;
                            a = setTimeout(res, 1e4);
                            b = setInterval(()=>{
                                if(!toolPipe('Tool.started')) return;
                                clearTimeout(a);
                                clearInterval(b);
                                res();
                            }, 200);
                        });
                }) + content + `\n}\ncatch(e){ console.error('updateLayout: %o',e); }\ntoolPipe('Game.detectPage()');`;

                let codesToAdd = []; //string of codes that will be added to content

                //To catch goals in other live matches
                (()=>{
                    let idx = content.indexOf('scores.php?world');
                    if(idx==-1) return;
                    let idx2 = content.substring(idx).search(/function\s*\(\s*transport/);
                    if(idx2==-1) return;
                    idx = content.indexOf('{',idx+idx2);
                    if(idx==-1) return;
                    ++idx;

                    if(!Tool.hasOwnProperty('goalTrigger')) Tool.goalTrigger = 0;
                    Tool.goalTrigger+=2;

                    codesToAdd.push({
                        loc: idx,
                        codes : GetFuncContent(()=>{
                            try{ /*This codes were written by FCUP Script.*/
                                if(toolPipe(Tool=>typeof Tool.temp.NewGoalCatcher == 'function')){
                                    var datas = JSON.parse(transport); /*eslint-disable-line no-undef*/
                                    for(let matchId in datas){
                                        let data = datas[matchId], score = $('#'+matchId+' > .score');
                                        if(data.status=="ended" && toolPipe(Tool=>typeof Tool.temp.MatchEndCatcher == 'function')) toolPipe(Tool=>Tool.temp.MatchEndCatcher(matchId));
                                        if(
                                            [data.home_goals, data.away_goals].find(v=>[null, undefined].includes(v))!==undefined ||
                                            data.home_goals==parseInt(score.find('.score-home').text()) &&
                                            data.away_goals==parseInt(score.find('.score-away').text())
                                        ){
                                            delete datas[matchId];
                                            continue;
                                        }
                                    }
                                    if(Object.keys(datas).length) toolPipe(Tool=>Tool.temp.NewGoalCatcher(datas));
                                }
                            }catch(err){ console.error(err);}
                        })
                    });
                })();

                //To show where players can be placed appropriately, also in live matches
                (()=>{
                    let idx = content.search(/\$\s*\.\s*each\s*\(\s*data\s*/);
                    if(idx==-1) return;
                    let str = content.substring(idx);
                    let idx2 = str.search(/\$\s*\(\s*"#content"\s*\)\s*\.\s*html\(/);
                    if(idx2==-1) return;
                    let idx3 = str.indexOf(';',idx2);
                    if(idx3==-1) return;
                    ++idx3;

                    codesToAdd.push({
                        start: idx + idx2,
                        end  : idx + idx3,
                        codes: GetFuncContent(()=>{
                            try{
                                let usp = new URLSearchParams(location.href),
                                    orj = !0;

                                if(usp.get('module')=='live' && usp.get('action')=='match'){
                                    let content = $('<div>');
                                    content[0].innerHTML = value; /*eslint-disable-line no-undef*/

                                    content.find('script').each(function(){


                                        let text = this.innerHTML;

                                        let idx = text.lastIndexOf('currentFormation =');
                                        if(idx == -1) return;

                                        let end = text.lastIndexOf('}};', idx),
                                            start = text.search(/plObj\s*=/);
                                        if(start==-1 || end==-1) return;
                                        start = text.indexOf('=', start) + 1;
                                        end+=2;

                                        let plObj = JSON.parse(text.substring(start, end)),
                                            positions = toolPipe('Tool.footballerPositions') || ["TW", "AV", "IV", "DM", "LM", "RM", "OM", "ST"],
                                            possibleHVPositions = {
                                                [positions[0]]: positions[0],
                                                [positions[1]]: {"7":[0,1,3,4],"8":[0,1,3,4],"9":[0,1,3,4]},
                                                [positions[2]]: {"7":[1,2,3],"8":[1,2,3],"9":[1,2,3]},
                                                [positions[3]]: {"5":[1,2,3],"6":[1,2,3],"7":[1,2,3]},
                                                [positions[4]]: {"3":[0,1],"4":[0,1],"5":[0,1],"6":[0,1]},
                                                [positions[5]]: {"3":[3,4],"4":[3,4],"5":[3,4],"6":[3,4]},
                                                [positions[6]]: {"2":[1,2,3],"3":[1,2,3],"4":[1,2,3]},
                                                [positions[7]]: [[0,1,2,3,4],[0,1,2,3,4],[0,1,2,3,4]]
                                            };
                                        for(let plId in plObj){
                                            let player = plObj[plId];
                                            player.possibleHVPositions = possibleHVPositions[player.position_name];
                                        }
                                        this.innerHTML = text.substring(0, start) + JSON.stringify(plObj) + text.substring(end);

                                        orj = !1;
                                        return !1;
                                    });


                                    $("#content").html(orj? value: content[0].innerHTML); /*eslint-disable-line no-undef*/
                                }
                                else{
                                    $("#content").html(value); /*eslint-disable-line no-undef*/
                                }

                            }catch(err){ console.error(err); $("#content").html(value);}  /*eslint-disable-line no-undef*/
                        })
                    });

                })();

                if(codesToAdd.length){
                    codesToAdd.sort((a,b)=> b.location - a.location).forEach(c=>{
                        content = content.substring(0, c.loc || c.start) + c.codes + content.substring(c.loc || c.end);
                    });
                }

                return content;
            },
            {'async':1}
        );

        res();
    },20);
});

//Click event of .negotiation-bid-player is will declerate asap in body script tag.
//When the click event declarate, it will be deleted and new event created for them asap.
Tool.intervals.create(function(){
    let events = unsafeWindow.jQuery._data($('body')[0], "events");
    if(typeof events != 'object') return;
    if(events.click.filter(e=>e.selector=='.negotiation-bid-player').length == 0) return;
    this.delete();

    unsafeWindow.jQuery('body')
        .off('click', '.negotiation-bid-player')
        .on('click', '.negotiation-bid-player', function(e) {
        /* eslint no-multi-spaces: 0*/
        /* global amountControl,durationControl,updateAds*/
        let element  = $(this),                //Onaylama butonu
            id       = element.attr('unique'), //return player-29820872
            playerId = element.attr('player'), //Oyuncunun id si alınıyor.
            clubId   = element.attr('club'),   //Bizim kulüp id'imiz alınıyor.
            offer    = '',                     //Teklif ettiğimiz ücret
            amount   = '',                     //Oyuncuya vereceğimiz maaş
            duration = '',                     //Oyuncuyla anlaşacağımız sezon sayısı
            params,                            //Servere gönderilecek data
            negotiation_type,                  //Müzakere tipi = [offer,negotiateDebts,negotiateWithOwnPlayer,acceptNegotiation]
            pl; //Satın alınan oyuncunun isminin alınabilmesi için

        //Onaylama butonu gizleniyor.
        element.hide();

        //Onaylama butonunun olduğu yere yükleniyor gifi ekleniyor.
        element.parent().append($('<div class="load-icon loading" id="loading-'+id+'"></div>'));

        if($('#bid-offer-'+id).length && $('#bid-offer-'+id).val()){ //Oyuncuyu satın almak için kulübe teklif ettiğimiz input mevcutsa ve değeri boş değilse
            negotiation_type = 'offer'; //Oyuncuya teklif veriliyor.
            $('#info-player-'+playerId+' .abort-negotiation-button-container').first().hide(); //Geri dönmeyi sağlayan buton gizleniyor.
            offer = $('#bid-offer-' + id).val();
            params = {//Example : {"elements": '{"offer":{"0":"1111;2222;3333"}}'}
                'elements': JSON.stringify({
                    'offer': {
                        0: playerId+';'+clubId+';'+offer
                    }
                })
            };
        }
        else if($('#bid-amount-' + id).length && $ ('#bid-amount-' + id).val()){ //Teklif ettiğimiz maaş inputu mevcutsa ve değeri boş değilse
            if($('#own-offers').length){//Transfer pazarı sayfası açık ise ya kendi oyuncumuzla yeni sözleşme imzalıyoruz. Yada yeni bir oyuncu satın alırken futbolcuyla sözleşme imzalıyoruz.
                if((pl = $('#own-offers').find('tbody > tr span[pid="player-'+playerId+'"]')).length){ //Sözleşme imzalanan oyuncu tekliflerimiz tablosunda ise yeni bir oyuncu alarak sözleşme imzalıyoruz
                    negotiation_type = 'negotiateDebts';
                    pl = pl.closest('tr');
                }
                else//Tekliflerimizin bulunduğu tabloda yoksa, kendi oyuncumuz ile sözleşme imzalıyoruzdur.
                    negotiation_type = 'negotiateWithOwnPlayer'; //Oyuncu ile sözleşme yapılıyor.
            }
            else //Transfer pazarı sayfası açık değil. Not : Burada sıkıntı olabilir.
                negotiation_type = 'negotiateWithOwnPlayer';

            amount = amountControl[id].numberUnFormat($('#bid-amount-'+id).val()); //Formatı sıfırlıyor.Noktalar kaldırılıyor.Artık integer.

            if($('#bid-duration-' + id).length && $('#bid-duration-'+id).val()) //Teklif ettiğimiz sezon inputu mevcutsa ve değeri boş değilse
                duration = durationControl[id].numberUnFormat($('#bid-duration-'+id).val()); //Formatı sıfırlıyor.Noktalar kaldırılıyor.

            params = {//Example : {"elements":'{"negotiateDebts":{"0":"1111;2222;amount=33333;duration=3"}}'}
                'elements': JSON.stringify({
                    'negotiateDebts': {
                        0: playerId+';'+clubId+';amount='+amount+';duration='+duration
                    }
                })
            };
        }
        else{
            negotiation_type = 'acceptNegotiation'; //Gözlemcinin getirdiği oyuncu için kapora ödeniyor.
            params = { //Example : {"elements":'{"acceptNegotiation":{"0":"1111;2222"}}'}
                'elements': JSON.stringify({'acceptNegotiation': {0: playerId+';'+clubId}})
            };
        }

        $.get( //Servere istek gönderiliyor.
            '/index.php?w='+worldId+'&area=user&module=player&action=negotiate&complex=0',
            params,
            function(response) { //İstek başarılı oldu!
                $('#loading-'+id).remove(); //Yükleniyor gifi kaldırılıyor.
                let div = $('<div>').html(response);
                try{
                    let texts,negotiate_success = !1;
                    switch(negotiation_type){
                        case "offer":
                            {
                                if(typeof Tool.temp.newOffer == 'function') Tool.temp.newOffer(
                                    $(`#content >.transfermarket >.table-container >table:first >tbody >tr:has(>td >.open-card[pid="player-${playerId}"]):first`),
                                    playerId,
                                    parseInt(offer.replaceAll('.',''))
                                );

                                setTimeout(()=>{
                                    let dialog = $(`div[aria-labelledby="ui-dialog-title-info-player-${playerId}"]:first`);
                                    dialog.fadeOut(750, ()=> dialog.find('.ui-dialog-titlebar-close')[0].click() );
                                }, 250);
                                break;
                            }
                        case "acceptNegotiation":break;
                        case "negotiateDebts": //Yeni bir oyuncu satın alırken kontrat yapıyoruz
                        case "negotiateWithOwnPlayer": //Kendi oyuncumuzla kontrat yeniliyoruz
                            div.find('script').each(function(i){
                                texts = $(this).html();
                                //window.location.href = $('span[pid=player-' + 29823205 + ']').first().attr('ref')
                                if(-1 != texts.search(new RegExp(`window\\s*.\\s*location\\s*.\\s*href\\s*=\\s*\\$\\s*\\(\\s*'span\\[pid=player-'\\s*\\+\\s*${playerId}\\s*\\+\\s*']'\\s*\\)`))){
                                    div.find('script')[i].remove();
                                    negotiate_success = !0;
                                    let notification_text;
                                    if(negotiation_type=="negotiateWithOwnPlayer"){//Kendi oyuncumuz ile başarılı bir şekilde sözleşme imzaladık!
                                        notification_text = GetText('SuccessfullyContract');
                                    }
                                    else{//Yeni bir oyuncuyu sözleşme imzalayarak satın aldık.
                                        let data = Tool.getVal('PlayersData',{BuyPlayers:[]});  //Structure: http://prntscr.com/uc2p4v
                                        if(!Array.isArray(data.BuyPlayers)) data.BuyPlayers = [];
                                        let playerName = pl.find('.player-name:first').text().trim(),
                                            BuyPlayers = data.BuyPlayers,
                                            skillsDiv = element.closest('.ui-dialog').find('>.infosheet>.skills');
                                        BuyPlayers.splice(0,0,{
                                            playerCountry : pl.find('td:nth-child(1) > img').attr('src').match(/\w+.gif/)[0].replace('.gif',''),
                                            playerId      : playerId,
                                            playerName    : playerName,
                                            position      : pl.find('td:nth-child(3)').text().trim(),
                                            strength      : parseInt(pl.find('td:nth-child(4)').text()),
                                            age           : parseInt(pl.find('td:nth-child(5)').text()),
                                            salary        : parseInt(amount),
                                            price         : parseInt(pl.find('td:nth-child(8)').attr('sortvalue')),
                                            season        : parseInt(duration),
                                            club          : {
                                                id        : parseInt(pl.find('td:nth-child(6) > a').attr('clubid')),
                                                name      : pl.find('td:nth-child(6) > a').text().trim()
                                            },
                                            date          : GetDateText(Game.getTime()),
                                            skills        : skillsDiv.find('>ul:first .skill').toArray().map(s=>parseFloat(s.textContent)),
                                            gSkills       : skillsDiv.find('>ul.average:first >li').toArray().map(l=>parseFloat($(l).contents()[2].textContent))

                                        });
                                        Tool.setVal('PlayersData',data);
                                        notification_text = GetText('SuccessfullyTransferred', {args:[playerName]});
                                    }
                                    //Onaylama butonunu gizlemeye gerek yok çünkü en başta gizliyoruz : element.hide();
                                    //$('#negotiation-bid-player-' + playerId).hide();
                                    //Böyle bir element yok ki!
                                    $('#info-window-player-' + playerId + ' .abort-negotiation-button-container').first().hide();
                                    setTimeout(async function(){
                                        location.href = $('span[pid=player-'+playerId+']').first().attr('ref');
                                        if(notification_text){
                                            await Game.pageLoad();
                                            Game.giveNotification(!0, notification_text);
                                        }
                                    },2000);
                                    $('.negotiation table, .negotiation .info').each(function(key, e) {
                                        e.hide();
                                    });
                                    return false;
                                }
                            });
                            break;
                    }
                }
                catch(err){
                    CatchError(err,'negotiation-bid-player');
                }

                $('#negotiate-container-'+id).html(div.html()); //Konteynıra server tarafından verilen cevap konuluyor.

                updateAds(); //Reklamları güncelleme

                $('body').trigger('content:changed');
            }
        ).fail(function(){
        }).always(function(){
        });
    });
},20);

//openCard function is will declerate asap in body script tag.
//When it is exist it will be updated to display captain image
Tool.intervals.create(function(){
    if(typeof unsafeWindow.openCard != 'function') return
    this.delete();

    Tool.modifyGameFunction('openCard',function(content){/*To show Captain Image*/
        /*global element,pid*/
        return content + GetFuncContent(()=>{
            /*New codes added here by FCUP Script*/
            let div_dialog = element.parent();
            div_dialog.css('display','none').fadeIn(400);
            if(parseInt($('#agreement-info-'+pid+' > li:nth-child(8) > div > div.bar-text').text())>=55 && !$('#info-'+pid+' > div.name > img.captain_icon').length){
                $('#info-'+pid+' > div.name').append(
                    `<img class="captain_icon" title="Captain" src="${toolPipe(`Tool.sources.get('captain')`)}" alt="captain.png" style="height:20px; float:none; margin:-7px 0 0 3px; vertical-align:middle; cursor:info;">`
                );
            }
        });
    });
},20);

Tool.features.add('ConstructionCountdown','main',function(){
    $('.likebox').css('bottom','-28px');
    $('#clubinfocard >ul').append(
        `<li>`+
        `   <img width="16px" src="${Tool.sources.get('construction')}" alt="construction.png" style="margin:-3px 0 0 0; vertical-align:middle;">`+
        `   <span class="label">${GetText('Buildings')}:</span>`+
        `   <span id="countdown_buildings">${GetText('Loading')}...</span>`+
        `</li>`+

        `<li>`+
        `   <img width="16px" src="${Tool.sources.get('construction')}" alt="construction.png" style="margin:-3px 0 0 0; vertical-align:middle;">`+
        `   <span class="label">${GetText('Stadium')}:</span>`+
        `   <span id="countdown_stadium">${GetText('Loading')}...</span>`+
        `</li>`
    );
    ['buildings','stadium'].forEach(async module=>{
        let finishDate;
        if(Tool.hasOwnProperty('finishDate_'+module)) finishDate = Tool["finishDate_"+module];
        else{
            let content = await Game.getPage(`?w=${worldId}&area=user&module=${module}&action=index&_=squad`, '#content').catch(err=>{
                console.error(err);
                $('#countdown_'+module).html(`<font color="#751b1b">${GetText('error')}</font>`);
                return false;
            });
            if(content == false) return;

            let cd = content.find('.countdown');
            if(!cd.length){
                let result = '';
                if(module=='buildings'){//buildings
                    if(content.find('.build').length)
                        result = `<a href="#/index.php?w=${worldId}&area=user&module=${module}&action=index" style="color:#51ff44;">${GetText('GoToBuildings')}</a>`;
                    else result = `<font color="white">${GetText('Full')}</font>`;
                }
                else{//stadium
                    let capacity = parseInt(content.find('.stadium-separator').parent().find('>span').last().text().replace('.','').trim());
                    let full_infrastructure = undefined == $(content[0].querySelector('#infrastructure')).find('ul.options-list > li > .imagesprite-container > div[class]').toArray().find(d=>{return $(d).hasClass('inactive')});
                    if(capacity == 77800 && full_infrastructure) result = `<font color="white">${GetText('Full')}</font>`;
                    else result = `<a href="#/index.php?w=${worldId}&area=user&module=${module}&action=index" style="color:#51ff44;">${GetText('GoToStadium')}</a>`;
                }

                $('#countdown_'+module).html(result);
                return;
            }

            Tool["finishDate_"+module] = finishDate = Game.getTime() + parseInt(cd.first().attr('x'))*1000;
        }

        let seconds = parseInt((finishDate - Game.getTime()) /1000),
            cd = $('#countdown_'+module);
        if(seconds<1){
            cd.html(`<font style="color:#b20b0b; font-weight:bold;">${GetText('ItIsOver')} !</font>`);
            delete Tool["finishDate_"+module];
            return;
        }
        cd.attr('title', new Date(finishDate).toLocaleString());
        cd.html(SecToTime(seconds));
        Tool.intervals.create(function(){
            if(--seconds<1){
                cd.html(`<font style="color:#b20b0b; font-weight:bold;">${GetText('ItIsOver')} !</font>`);
                delete Tool["finishDate_"+module];
                this.delete();
                return;
            }
            cd.html(SecToTime(seconds));
        },1000,cd[0].id);
    });
},'#clubinfocard >ul >li:nth-child(6), #clubinfocard >ul >li:nth-child(7)');
Tool.features.add('RematchMatch','main',function(){
    let oppenent_accepted_req = [],
        own_req = [];
    $('#matches >ul.matches.simulations >li').each(function(){
        let ul = $('ul',this);
        if(ul.find('.squad-home .self-link').length) //Own Request
            own_req.push({clubId: $('li.col.info > span.squad-away > a', ul).attr('clubid'), ul});
        else //Oppenent's Request
            if(!ul.find('.show-button a[href*="acceptSimulation"]').length) //If is accepted
                oppenent_accepted_req.push({clubId: $('li.col.info > span.squad-home > a', ul).attr('clubid'), ul});
    });

    oppenent_accepted_req.forEach(req1=>{ //Kabul etmiş olduğumuz deplasman isteğimiz olacak fakat o takıma gönderdiğimiz bir simülasyon davetimiz olmayacak.
        if(own_req.find(req2=> req1.clubId == req2.clubId)) return;
        req1.ul.find('.show-button').append(`<img class="sendSimulation" k="${req1.clubId}" src="${Tool.sources.get('again')}" alt="again.png" style="cursor:pointer; vertical-align:middle;" width="35px">`);
    });
    oppenent_accepted_req = own_req = undefined;

    let images = $('img.sendSimulation');
    if(!images.length) return false;

    let get_club_matchId = (clubId)=>{
        return new Promise((res,rej)=>{
            Game.getPage(`?w=${worldId}&area=user&module=profile&action=show&clubId=${clubId}`,'#profile-show').then(profile_show=>{
                res(profile_show.find('.button-container-friendly-invite-button > a')[0].href.split('&').find(a=>a.split('=')[0]=='invite').split('=')[1]);
            }).catch(err=>{rej(err)});
        });
    };
    let send_similation_request = (matchId)=>{
        return new Promise((res,rej)=>{
            Game.getPage(`?w=${worldId}&area=user&module=simulation&action=index&squad=${matchId}`,'#feedback').then(feedback=>{
                res(!feedback.find('.error').length);
            }).catch(err=>{rej(err)});
        });
    };

    images.click(function(){
        let success,
            img = $(this).hide().after('<img src="/designs/redesign/images/icons/loading/16x16.gif" style="vertical-align:middle; margin-left:7px;">');

        get_club_matchId($(this).attr('k'))
            .then(match_id=>send_similation_request(match_id))
            .then(status=>{
            success = true;
            if(status) Game.giveNotification(!0, GetText('SimulationRequestSent'));
            else Game.giveNotification(!1, GetText('SimulationRequestAvailable'));
        }).catch(err=>{
            console.error(err);
        }).finally(function(){
            img.next().remove();
            if(success) img.remove();
        });
    });
},'.sendSimulation');
Tool.features.add('NumberOfFootballerChecker','main',function(){
    this.hover_selector = '#li_'+this.name;
    $('#clubinfocard > div.club-avatar').append(
        `<li>`+
        `   <span id="li_${this.name}" class="label">`+
        `      ${GetText('Team')}: <label id='auf_count_number'> ... </label>`+
        `   </span>`+
        `</li>`
    );
    Game.getPage(`?w=${worldId}&area=user&module=formation&action=index`, '#formation-count').then(formation_count=>{
        let count_number = formation_count.text();
        if(count_number == "11") $('#auf_count_number').html('11/11');
        else $('#auf_count_number').html(`<font style="color:red; text-shadow:0.5px 0.5px white;">${count_number}/11</font>`);
    }).catch(err=>{
        $('#auf_count_number').html(`<font color="#751b1b">${GetText('error')}</font>`);
        console.error(err);
    });
});
Tool.features.add('MatchAnalyst', 'main',function(){
    let box = $('#matches > ul.matches.next'), matches;
    if(box.find('.no-entry').length || !(matches = box.find('>li')).length) return !1;

    let get_club_info = (tricot,squad)=>{
        let a = squad.find('>a'),
            ellipsis = a.find('>.ellipsis');
        return {
            id  : a.attr('clubid')||1,
            name: ellipsis.length>0?ellipsis.text().trim(): a.text().trim(),
            shortName: ellipsis.length>0,
            logo: (squad.find('> .club-logo-container > img:first').attr('src')||"").split('/').splice(-2).shift() || 0,
            tricot : {
                shorts: tricot.find('img[src$="shorts.png"]').attr('color'),
                tricot: tricot.find('img[src$="tricot.png"]').attr('color'),
                design: tricot.find('img[src$="design.png"]').attr('color'),
                model : tricot.find('img[src$="details.png"]').attr('model')
            }
        }
    };
    matches= matches.toArray().map(m=>{
        let match={},
            li = $(m).find('>ul>li');
        match.type = $(li[0]).find('.icon.match')[0].className.replace('icon','').replace('match','').trim();
        match.time = $(li[1]).find('>p').text().match(/([0-9]{2}:[0-9]{2}:[0-9]{2})/)[0];
        match.date = $(li[1]).find('>p').text().replace(match.time,'').trim();
        match.home = get_club_info($(li[2]), $(li[3]).find('>.squad-home:first'));
        match.away = get_club_info($(li[4]), $(li[3]).find('>.squad-away:first'));
        if(match.type == 'tournament' && parseInt(match.time.split(':')[0])>17) match.isSpecialTournament = !0;
        return match;
    });
    get_club_info = undefined;

    box.html('');
    box[0].style=`display:none; margin:0px; height:214px; background:url('${Tool.sources.get('nextMatchesBacground')}'); color:white; padding:5px; position:relative;`;

    //Create Next Matches Tables
    let create_tricot = (t)=>$(
        t.model==undefined?`<div class="tricot-container" style="display:inline-block;">`:`<div class="tricot-container" style="display:inline-block;">`+
        `   <img class="background shorts png" src="/tricots/${t.model+'/'+t.shorts}/shorts.png" alt="shorts" model="${t.model}" color="${t.shorts}">`+
        `   <img class="background tricot png" src="/tricots/${t.model+'/'+t.tricot}/tricot.png" alt=tricot"" model="${t.model}" color="${t.tricot}">`+
        `   <img class="background design png" src="/tricots/${t.model+'/'+t.design}/design.png" alt="design" model="${t.model}" color="${t.design}">`+
        `   <img class="png" src="designs/redesign/images/tricots/${t.model}/details.png" alt="model" model="${t.model}">`+
        `</div>`
    );
    let create_comparision = (compares)=>{
        let e = $(`<div>`);
        if(compares.length){
            compares.forEach(key=>{
                e.append(`<p><strong>${GetText(key)}:</strong> <span>...</span></p>`);
            });
            e.find('>p').css({
                'text-align':'right',
                'font-size':'12px',
                'margin-bottom':'1px'
            });
            e.find('>p:not(:last)').css({
                'border-bottom':'1px solid white',
                'padding':'1px 0'
            });
            e.find('>p >strong').css('float','left');
        }
        else{
            e.append(`<p><font color="gray">${GetText('noCompCriteria')}${Tool.devManagerId?`<br>${GetText('clickForIdea', {args:[`<a href="#/index.php?w=${worldId}&area=user&module=mail&action=index&to=${Tool.devManagerId}">`, '</a>']})}`: ''}</font></p>`);
        }
        return e;
    };
    let create_clubHeader = (clubId, clubName)=>
    clubId==1?`<span style="font-size:13px; font-weight:bold; text-decoration:none;">${clubName}</span>`:
    `<a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${clubId}" `+
        `clubid="${clubId}" ${clubId==Tool.clubId?'class="self-link"':''} style="font-size:13px; font-weight:bold; text-decoration:none;">${clubName}</a>`;

    let pages={rating:{}, manager:{}, squadstrenght:{}, fixture:{}};
    matches.forEach((match,i )=>{
        let p_match= i-1>-1?matches[i-1]:0,
            n_match= i+1<matches.length?matches[i+1]:0,
            matchId= match.home.id+'_'+match.away.id+'_'+i;

        let compares = [];
        switch(match.type){
            case "tournament":
                //Turnuva sayfasına gidip, katıldığımız turnuvaları çek
                if(match.isSpecialTournament){// 20:00:00
                    /*compare = {
                        rating: {
                            elo_rating: 1
                        },
                        manager : {
                            squad_strength  : 1,
                            strongest_player: 1,
                            trophy: -1
                        }
                    };*/
                }
                else{// 14:00:00
                    compares = ['EloRank', 'SquadStrength', 'StrongestPlayer'];
                    [match.home.id, match.away.id].forEach((id,away)=>{
                        let squad = away?'away':'home',
                            e = matchId+'_'+squad,
                            n = match[squad].name;
                        if(match[squad].shortName) n = n.replace(/...$/,'');

                        if(!pages.rating.hasOwnProperty(id)) pages.rating[id] = {id, n, e:[]};
                        pages.rating[id].e.push(e);

                        if(!pages.manager.hasOwnProperty(id)) pages.manager[id] = {};
                        ['ss', 'sp'].forEach(k=>{
                            if(Array.isArray(pages.manager[id][k])) pages.manager[id][k].push(e);
                            else pages.manager[id][k] = [e]
                        });
                    });
                }
                break;
            case "friendly":// 16:00:00
                compares = ['StadiumCapacity', 'StadiumInfrastructure', 'HomeBonusCount', 'SquadStrength', 'StrongestPlayer'];

                [match.home.id, match.away.id].forEach((id,away)=>{
                    let squad = away?'away':'home',
                        e = matchId+'_'+squad;

                    if(!pages.manager.hasOwnProperty(id)) pages.manager[id] = {};
                    ['sc', 'si', 'hb', 'ss', 'sp',].forEach(k=>{
                        if(Array.isArray(pages.manager[id][k])) pages.manager[id][k].push(e);
                        else pages.manager[id][k] = [e]
                    });
                });
                break;
            case "league":// 18:00:00
                compares = ['EloRank', 'LeagueRank', 'SquadStrength', 'StrengthDetails', 'PrevMatchesScores', 'StrongestPlayer'];

                if(!pages.squadstrenght.hasOwnProperty(Tool.clubId)) pages.squadstrenght[Tool.clubId] = {};
                if(!pages.fixture.hasOwnProperty(Tool.clubId)) pages.fixture[Tool.clubId] = {};

                [match.home.id, match.away.id].forEach((id,away)=>{
                    let squad = away?'away':'home',
                        e = matchId+'_'+squad,
                        n = match[squad].name;
                    if(match[squad].shortName) n = n.replace(/...$/,'');

                    if(!pages.rating.hasOwnProperty(id)) pages.rating[id] = {id, n, e:[]};
                    pages.rating[id].e.push(e);

                    if(!pages.manager.hasOwnProperty(id)) pages.manager[id] = {};
                    ['ss', 'sp', 'lr'].forEach(k=>{
                        if(Array.isArray(pages.manager[id][k])) pages.manager[id][k].push(e);
                        else pages.manager[id][k] = [e]
                    });

                    if(!pages.squadstrenght[Tool.clubId].hasOwnProperty(id)) pages.squadstrenght[Tool.clubId][id] = [];
                    pages.squadstrenght[Tool.clubId][id].push(e);

                    if(!pages.fixture[Tool.clubId].hasOwnProperty(id)) pages.fixture[Tool.clubId][id] = [];
                    pages.fixture[Tool.clubId][id].push(e);
                });
                break;
        }

        $(`<div class="matches" style="height:100%; position:relative;${i>0?" display:none;":""}">`+
          `   <p style="font-size:15px; color:white; text-align:center; font-weight:bold;">`+
          `      ${GetText(match.type=='tournament'?(match.isSpecialTournament?'specialTournamentMatch':'tournamentMatch'):(match.type+'Match'))} - ${match.date}, ${match.time}</p>`+
          `   <span class="fixture ${match.type}" style="width:128px; position:absolute; bottom:0; left:0;"></span>`+
          `   <div style="height:70%; width:90%; margin:5px auto 0 auto; position:relative; z-index:1;">`+
          /*     Home Club*/
          `      <div style="height:100%; width:49%; float:left;">`+
          `         <div style="position:relative; margin-bottom: 22px;">`+
          `            ${create_tricot(match.home.tricot).css('margin','0 5px -14px 0')[0].outerHTML}`+
          `            ${create_clubHeader(match.home.id, match.home.name)}`+
          `            ${match.home.logo?`<img src="/avatars/${worldId}/squad/${match.home.logo}/${match.home.id}" style="position:absolute; top:7px; right:5px;">`:''}`+
          `         </div>`+
          `         ${create_comparision(compares).attr('id',`comparison_${matchId}_home`)[0].outerHTML}`+
          `      </div>`+

          `      <div style="width:0.1%; height:100%; background-color:white; float:left; margin-left:5px;"></div>`+

          /*     Away Club*/
          `      <div style="height:100%; width:49%; float:right; text-align:right;">`+
          `         <div style="position:relative; margin-bottom:22px;">`+
          `            ${match.away.logo?`<img src="/avatars/${worldId}/squad/${match.away.logo}/${match.away.id}" style="position:absolute; top:7px; left:5px;">`:''}`+
          `            ${create_clubHeader(match.away.id, match.away.name)}`+
          `            ${create_tricot(match.away.tricot).css('margin','0 0 -14px 5px')[0].outerHTML}`+
          `         </div>`+
          `         ${create_comparision(compares).attr('id',`comparison_${matchId}_away`)[0].outerHTML}`+
          `      </div>`+
          `   </div>`+
          `</div>`
         ).attr({
            id: matchId,
            prev_match: p_match? p_match.home.id+'_'+p_match.away.id+'_'+(i-1): null,
            next_match: n_match? n_match.home.id+'_'+n_match.away.id+'_'+(i+1): null
        }).appendTo(box);
    });
    create_tricot = create_comparision = undefined;

    Object.values(pages.rating).forEach(data=>{
        let e = data.e = $(data.e.map(e=>$(`#comparison_${e} strong>[k="EloRank"]`).parent().next())).map($.fn.toArray),
            club_name = data.n,
            id = data.id;

        e.html('<img src="/designs/redesign/images/icons/loading/16x16.gif" style="margin-left:10px; vertical-align:middle;">');
        Game.getPage(`index.php?w=${worldId}&area=user&module=rating&action=index&club=${encodeURIComponent(data.n)}&_qf__form=&league=&path=index.php&layout=none`,'#container-rating')
            .then(div=>{
            let row = div.find(`.table-rating >tbody >tr:has(a[clubid=${id}]):first`);
            if(!row.length){
                e.html('~');
                return;
            }
            let rank = parseInt(row.find('>td:first').text().split('.').join('')),
                change_r = parseInt(row.find('>td:nth-child(2)').text().split('.').join('')),
                points = parseInt(row.find('>td:nth-child(4)').text().split('.').join('')),
                points_r = parseInt(row.find('>td:nth-child(5)').text().split('.').join(''));
            e.html(rank);
        })
            .catch(err=>{
            e.html(`<font color="#f34949" style="border-bottom:1px dashed red;">${GetText('error')}</font>`);
            console.error(err);
        });
    });

    Object.entries(pages.manager).forEach(d=>{
        let clubId = d[0],
            data = d[1],
            ss = data.ss = $((Array.isArray(data.ss)?data.ss:[]).map(e=>$(`#comparison_${e} strong>[k="SquadStrength"]`).parent().next())).map($.fn.toArray),
            sp = data.sp = $((Array.isArray(data.sp)?data.sp:[]).map(e=>$(`#comparison_${e} strong>[k="StrongestPlayer"]`).parent().next())).map($.fn.toArray),
            lr = data.lr = $((Array.isArray(data.lr)?data.lr:[]).map(e=>$(`#comparison_${e} strong>[k="LeagueRank"]`).parent().next())).map($.fn.toArray),
            sc = data.sc = $((Array.isArray(data.sc)?data.sc:[]).map(e=>$(`#comparison_${e} strong>[k="StadiumCapacity"]`).parent().next())).map($.fn.toArray),
            si = data.si = $((Array.isArray(data.si)?data.si:[]).map(e=>$(`#comparison_${e} strong>[k="StadiumInfrastructure"]`).parent().next())).map($.fn.toArray),
            hb = data.hb = $((Array.isArray(data.hb)?data.hb:[]).map(e=>$(`#comparison_${e} strong>[k="HomeBonusCount"]`).parent().next())).map($.fn.toArray);

        let all = ss.add(sp).add(lr).add(sc).add(si).add(hb);

        if(0 == all.length) return;
        all.html('<img src="/designs/redesign/images/icons/loading/16x16.gif" style="margin-left:10px; vertical-align:middle;">');

        Game.getPage(`?w=${worldId}&area=user&module=profile&action=show&clubId=${clubId}&layout=none`, '#profile-show')
            .then(node=>{
            let contents = node.find('ul.profile-box-squad > li:nth-child(1)').contents();
            if(!contents.length) return; //Kein Verein gefunden.

            if(ss.length) ss.html(node.find('ul.profile-box-squad > li:nth-child(1)').contents()[1].textContent); //Squad_Strength

            if(lr.length){
                let leaguetable = node[0].querySelector('#leaguetable');
                if(leaguetable && !$('.no-entry',leaguetable).length){
                    //$('>h2',leaguetable).text().trim()+", " +
                    lr.html($('> div.container > div > table',leaguetable).find(`a[clubid="${clubId}"]`).closest('tr').find('>td:first').text().trim()); //League
                }
                else lr.html('~');
            }

            if(sp.length){
                let o = $('.profile-box-squad .open-card',node);
                if(!o.length){
                    sp.html(GetText('NotFound'));
                    return;
                }
                let name = o.next().find('.ellipsis'),
                    playerDetails;
                if(name.length){
                    let p = $(name.parent()[0].outerHTML);
                    name = name[0].title;
                    p.find('.ellipsis').remove();
                    playerDetails = p.html();
                }
                else{
                    name = o.next().text();
                    let idx = name.indexOf('(');
                    playerDetails = name.substring(idx).trim();
                    name = name.substring(0,idx).trim();
                }
                sp.html(`<span pid="player-${o.attr('pid').split('-')[1]}" class="icon details open-card" style="float:none;"></span>${/*name +" "+*/playerDetails}`);
            }

            if(sc.length) sc.html(node.find('.profile-box-stadium').text().trim().match(/[\d,\.]+/)[0]||"~");

            if(hb.length + si.length){
                unsafeWindow.jQuery.get(`/index.php?w=${worldId}&area=user&module=trophy&action=index&complex=0&clubId=${clubId}`).success(function(r){
                    if(si.length){
                        let node = $('<div>').html(r);
                        si.html(node.find('.trophy-50').hasClass('trophy-unavailable')?GetText("Missing"):GetText("Full"));
                    }

                    if(hb.length){
                        try{
                            let b = r.lastIndexOf('toolTipObj.addTooltips(')+23;
                            r = JSON.parse(r.substring(b,r.indexOf(');',b)));
                            let text= r.tt_trophy_70.trim();
                            text = text.substring(text.lastIndexOf(':')+1,text.lastIndexOf('<'));
                            let num = text;
                            if(!Number.isInteger(parseInt(text.replace('.', '')))) num = '~';
                            hb.html(num);
                        }
                        catch(err){
                            hb.html(`<font color="#f34949" style="border-bottom:1px dashed red;">${GetText('error')}</font>`);
                        }
                    }
                }).error(function(jqXHR, textStatus, errorThrown) {
                    if (textStatus == 'timeout')
                        console.log('The server is not responding');

                    if (textStatus == 'error')
                        console.log('error:' + errorThrown);

                    $(hb.add(si).toArray().filter(span=>$(span).find('>img').length)).html(`<font color="#f34949" style="border-bottom:1px dashed red;">${GetText('error')}</font>`);
                });
            }
        }).catch(err=>{
            $(all.toArray().filter(span=>$(span).find('>img').length)).html(`<font color="#f34949" style="border-bottom:1px dashed red;">${GetText('error')}</font>`);
            console.info(err);
        });
    });

    Object.entries(pages.squadstrenght).forEach(d=>{
        let clubId = d[0];
        if(clubId != Tool.clubId) return;
        let data = d[1] = Object.entries(d[1])
        .map(d=>[d[0], $(d[1].map(e=>$(`#comparison_${e} strong>[k="StrengthDetails"]`).parent().next())).map($.fn.toArray)])
        .reduce((acc,d)=>{acc[d[0]]=d[1];return acc;},{});

        $(Object.values(data)).map($.fn.toArray).html('<img src="/designs/redesign/images/icons/loading/16x16.gif" style="margin-left:10px; vertical-align:middle;">');

        Game.getPage(`?w=${worldId}&area=user&module=statistics&action=squadstrenght&layout=none`, '#squad-strengths')
            .then(table=>{
            let tbody = table.find('>tbody:first');
            Object.entries(data).forEach(d=>{
                let clubId = d[0],
                    e = d[1],
                    a = tbody.find(`td.name-column > a[clubid="${clubId}"]:first`);
                if(!a.length){
                    e.html('~');
                    return;
                }
                e.html(a.closest('tr').find('>td[sortvalue]:not(.last-column)').toArray().map(e=>$(e).attr('sortvalue')).join(' | '));
            });
        })
            .catch(err=>{
            $($(Object.values(data)).map($.fn.toArray).toArray().filter(span=>$(span).find('>img').length)).html(`<font color="#f34949" style="border-bottom:1px dashed red;">${GetText('error')}</font>`);
            console.error(err);
        });
    });

    Object.entries(pages.fixture).forEach(d=>{
        let clubId = d[0];
        if(clubId != Tool.clubId) return;

        let data = d[1] = Object.entries(d[1])
        .map(d=>[d[0], $(d[1].map(e=>$(`#comparison_${e} strong>[k="PrevMatchesScores"]`).parent().next())).map($.fn.toArray)])
        .reduce((acc,d)=>{acc[d[0]]=d[1];return acc;},{});

        let all = $(Object.values(data)).map($.fn.toArray);
        all.html('<img src="/designs/redesign/images/icons/loading/16x16.gif" style="margin-left:10px; vertical-align:middle;">');

        let images = {
            'W': Tool.sources.get('tick2'),
            'D': Tool.sources.get('noChanging'),
            'L': Tool.sources.get('x'),
            '-': Tool.sources.get('circle')
        }
        Game.getPage(`?w=${worldId}&area=user&module=statistics&action=games&layout=none`)
            .then(content=>{
            let table ,ul, trs;
            if(!(table=content.find('#league-crosstable')).length ||
               !(ul=content.find('.date-selector > ul:first')).length ||
               !(trs=table.find('>tbody > tr')).length){
                all.html('~');
                return;
            }
            let played = ul.find('li.day.past').length,
                getDatas = (td)=>{
                    let goals, week;
                    if((goals=$('>p',td).text().trim().split(':').map(n=>parseInt(n))).length!=2 ||
                       undefined !== goals.find(n=>isNaN(n)) ||
                       (week=$('>p',td).attr('title').trim().split(':')).length!=2 ||
                       isNaN(week=parseInt(week[1]))
                      ) return false;
                    return {goals:goals, week:week};
                }, r,
                thead = $('> thead > tr:nth-child(1)',table);
            Object.entries(data).forEach(d=>{
                let clubId = d[0],
                    e = d[1],
                    a = trs.find(`> td > a[clubid="${clubId}"]:first`);
                if(!a.length){
                    e.html('~');
                    return;
                }
                let tr = a.closest('tr'),
                    results = ["-","-","-","-","-"];
                tr.find('td:not(.nomatch):not(:first)').each(function(){ //Satırdaki bölümler incelenecek
                    if(!(r = getDatas(this))){
                        e.html('~');
                        return;
                    }
                    if(r.week<played-4 || played<r.week) return; //Too old score
                    results[4-Math.max(0,5-played)-played+r.week] = {
                        s: r.goals[0]>r.goals[1]?"W":r.goals[0]==r.goals[1]?"D":"L",
                        g: r.week+": " + a.text().trim() + " " + r.goals[0]+'-'+r.goals[1] + " " + thead.find(`>th:nth-child(${$(this).index()+1})`).text().trim()
                    };
                });
                trs.find(`>td:nth-child(${1+tr.index()+1}):not(.nomatch)`).each(function(i){ //Sutundaki bölümler incelenecek
                    if(!(r = getDatas(this))){
                        e.html('~');
                        return;
                    }
                    if(r.week<played-4 || played<r.week) return; //Too old score
                    results[4-Math.max(0,5-played)-played+r.week] = {
                        s: r.goals[1]>r.goals[0]?"W":r.goals[0]==r.goals[1]?"D":"L",
                        g: r.week+": " + $(this).parent().find('a[clubid]').text().trim() + " " + r.goals[0]+'-'+r.goals[1] + " " + a.text().trim()
                    };
                });
                e.html(`[${results.reduce((acc,r)=>acc+({W:3,D:1}[r.s]||0),0)} ${GetText('SPoints')}] `+results.map(r=>`<img src="${images[r=="-"?r:r.s]}" ${r=="-"?"":`title="${r.g}"`} style="margin:0 2px -1px 0; height:16px;">`).join(''));
            });
        })
            .catch(err=>{
            $(all.toArray().filter(span=>$(span).find('>img').length)).html(`<font color="#f34949" style="border-bottom:1px dashed red;">${GetText('error')}</font>`);
            console.error(err);
        });
    });

    //Create Animation
    if(matches.length>1){
        box.append(
            `<img id="prev_match" matches_length="${matches.length}" src="${Tool.sources.get('prev')}" alt="prev.png" style="height:18px; position:absolute; left:2px; top:50%; cursor:pointer; transform:translate(0,-50%); display:none; ">`+
            `<img id="next_match" matches_length="${matches.length}" src="${Tool.sources.get('prev')}" alt="prev.png->next.png" style="height:18px; position:absolute; right:2px; top:50%; cursor:pointer; transform:translate(0,-50%); -moz-transform:scaleX(-1); -o-transform:scaleX(-1); -webkit-transform:scaleX(-1); transform:scaleX(-1);">`
        );
        let stop=!1;
        $('#prev_match,#next_match').click(function(){
            if(!$(this).is(':visible')) return;
            stop=!0;
            $('#prev_match,#next_match').css("pointer-events", "none");

            let k = this.id=='next_match'?1:0,
                close_e = $('#matches > ul.matches.next').find('>div.matches:visible'),
                open_e = $('#'+close_e.attr(k?'next_match':'prev_match'));
            close_e.hide("slide", { direction: k?'left':'right' }, 200);

            $('#prev_match')[open_e.attr('prev_match')?'show':'hide']();
            $('#next_match')[open_e.attr('next_match')?'show':'hide']();

            setTimeout(()=>{
                open_e.show("slide", { direction: k?'right':'left' }, 300);
                setTimeout(()=>{
                    $('#prev_match,#next_match').css("pointer-events", "auto");
                    stop=!1;
                }, 300)
            },250);
        });

        $(document.body).keyup(function(e){
            let kc = e.keyCode;
            if(kc!=37 && kc!=39) return;
            if(stop || !$('#matches-handle-container >li[target=".matches.next"]').hasClass('active') || ['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) return;

            if(kc==37) $('#prev_match').click();
            else if(kc==39) $('#next_match').click();
        });
    }

},'#matches > ul.matches.next,#matches-handle-container > li.handle:nth-child(2)');

Tool.features.add('TrainingControl',['squad','training->groups'],function(){
    let trainingPlan = Tool.trainingPlan,
        Positions = Tool.footballerPositions,
        SkillsName = Translate.locale.texts.Skills,
        alerts = {i:[],e:[]};
    $('#players-table-skills >tbody >tr').each(function(){
        let position = $('>td:nth-child(3)', this).text().trim(),
            developSkills = trainingPlan[position];
        if(!developSkills) return;

        let skills = $('>td.skill-column', this);

        for(let i = 0 ; i < developSkills.length ; i++){//Geliştirilecek yetenek aranıyor
            let s = $(skills[developSkills[i]]).find('span');
            if(s.hasClass("maximum")) continue;//Bu geliştirilecek yetenek maksimumsa bir sonraki geliştirilecek yeteneğe bak.
            else if(s.hasClass("next-training")) break;//Bu geliştirilecek yetenek geliştirilmeye devam ediyorsa doğru yoldasın.
            else{//Bu geliştirilecek yetenek maksimum değil ve geliştirilmeye devam edilmiyorsa.Bir sıkıntı var.
                //Ya farklı bir yetenek geliştiriliyor yada hiçbir yetenek geliştirilmiyor.
                let skillName = SkillsName[developSkills[i]],
                    value = s.text().trim(),
                    playerName = $('.player-name:first', this).text().trim();

                s.html(
                    `<img title="${GetText('ImproveSkillTitle', {tag:0, args:[skillName]})}!!!" `+
                    `tool_tt="ImproveSkillTitle_${encodeURIComponent(JSON.stringify([skillName]))}" `+
                    `src="${Tool.sources.get('here')}" alt="here.gif" width="15px" height="15px" `+
                    `style="-webkit-transform:rotate(90deg); margin:-8px 0 0 ${(s.first().outerWidth()-15)/2}px; position:absolute;">`+
                    value
                )
                    .addClass('rotating-dashed')
                    .css('display','block')
                    .prepend('<span class="dashing"><i></i></span>'.repeat(4));

                if($('>td>span.next-training:first', this).length) alerts.e.push(playerName+'-> '+skillName.toLowerCase());
                else alerts.i.push(playerName+'-> '+skillName.toLowerCase());

                break;
            }
        }
    });

    if(alerts.i.length || alerts.e.length){
        let content="";
        if(alerts.i.length){
            content= `<span style="text-decoration:underline; color:#3fffe4;">${GetText('TrainingMessage')}</span><br>`+alerts.i.join('<br>');
        }
        if(alerts.e.length){
            if(content!="") content+="<br><br>"
            content+= `<span style="text-decoration:underline; color: #3fffe4;">${GetText('FaultyTrainingMessage')}</span><br>`+alerts.e.join('<br>');
        }
        Game.giveNotification(!0, content);
    }

    function fix(){
        new Promise((res,rej)=>{
            let timeout, interval = Tool.intervals.create(function(){
                let tags = $('.rotating-dashed');
                if(tags.length==0) return;
                if(tags[0].getBoundingClientRect().width==0) return;
                clearTimeout(timeout);
                this.delete();
                res(tags);
            },20);
            timeout = setTimeout(()=>{
                interval.delete();
                rej();
            }, 1000);
        }).then(tags=>{
            tags.each(function(){
                let tag = $(this);
                let height = tag[0].getBoundingClientRect().width;
                tag.find('>.dashing:odd').css('height', height);
            });
        }).catch(_=>{});
    }

    let page = Game.currentPage.findPath();
    if(page == 'squad'){
        $('#squad-handle-container > [target=".squad.skills"]').click(function(){
            $(this).off();
            fix();
        });
    }
    else if(page == 'training->groups') fix();
});
Tool.features.add('ClubExchange','squad',function(){
    let ClubExchange = {
        initial_data : Tool.getVal('ClubExchange',{}),
        new : {},// Exp : {3252352:0,234131:1} , 0=>error , 1=>success
        selector : [],
        finish : 0,
        initial : function(){
            let initial_data = ClubExchange.initial_data;
            $('#players-table-overview, #players-table-overview-club, #squad> div.squad.personal #players-table-agreements-transfer').find('> tbody > tr:has(.open-card)').each(function(){
                let openCard = $(this).find('.open-card'),
                    playerId = openCard.attr('pid').split('-')[1],
                    table = $(this).closest('table')[0].id.replace('players-table-',''),// overview or overview-club
                    index = $(this).index(),
                    td_contract = $('td:nth-child(11)',this);
                if(td_contract.text().indexOf(Tool.ClubExchange)!=-1){//td_contract da Kulüp Değişimi yazıyor olmali...
                    //Bu futbolcu kulüp değiştiriyor!!!
                    let playerData = initial_data[playerId];
                    if(!playerData) //Oyuncunun gidiş bilgileri mevcut değilse
                        ClubExchange.getPage(playerId,table,index);
                    else //Oyuncunun gidiş bilgileri mevcutsa
                        ClubExchange.addImage(playerData,table,index);
                }
            });
        },
        getPage : function(playerId,table,index){
            ClubExchange.new[playerId]=0;//Varsayılan değer olarak sayfa çekmeyi başarısız sayıyoruz.
            $.get(`index.php?w=${worldId}&area=user&module=player&action=index&complex=0&id=${playerId}`, function(response){
                ClubExchange.new[playerId]=1;//default olarak başarısız olarak varsayılan değeri başarılı değere çeviriyoruz.
                let li = $('<div>'+response+'</div>').find('.data.attributes > ul > li:last'),
                    a = li.find('a'),
                    club = {
                        id   : a.attr('clubid'),
                        name : a.text().trim()
                    };
                li.find('a,strong').remove();
                let li_text = li.text().trim(),
                    date = li_text.match(/(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})/g);
                if(date){
                    date=date[0];
                    let playerData = {date:date,club:club},
                        data = Tool.getVal('ClubExchange',{});
                    data[playerId] = playerData;
                    Tool.setVal('ClubExchange',data);
                    ClubExchange.addImage(playerData,table,index)
                }
            }).always(function() {
                let _new = ClubExchange.new;
                if(ClubExchange.finish++==Object.keys(_new).length){//Tüm istekler başarılı yada başarısız bir şekilde bitti!
                    //Eğer daha önceden kayıtlı edilmiş bir futbolcu varsa(kulübü terkeden) şimdi o oyuncu bulunmazsa kulübü terk etmiştir. Onu kayıtlardan çıkarmamız lazım.
                    let initial_data = ClubExchange.initial_data,
                        current_data = Tool.getVal('ClubExchange',{}),
                        counter = 0;
                    for(let playerId in initial_data){
                        if(_new[playerId]==undefined){//Oyuncu çoktan kulübü terk etmiş..
                            counter++;
                            delete current_data[playerId];
                        }
                    }
                    if(counter) Tool.setVal('ClubExchange',current_data);
                }
            });
        },
        addImage : function(playerData,table,index){
            let d = playerData.date.split('.'),
                sec = parseInt((new Date(d[2],parseInt(d[1])-1,d[0],3).getTime()-Game.getTime())/1000),
                tds = [
                    $(`#players-table-${table} >tbody >tr:nth-child(${index+1}) >td:nth-child(11)`),
                    $(`#players-table-${table=='overview'?'agreements':'agreements-club'} >tbody >tr:nth-child(${index+1}) >td:nth-child(8)`)
                ];
            //this.selector.push('#players-table-'+table+' > tbody > tr:nth-child('+(index+1)+') > td:nth-child(11)','#players-table-'+(table=='overview'?'agreements':'agreements-club')+' > tbody > tr:nth-child('+(index+1)+') > td:nth-child(8)');
            $(tds).each(function(){
                let time_text = $('<div>'+SecToTime(sec)+'</div>').text(),
                    args = [playerData.date, playerData.club.name];
                $(this).html(
                    `<a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${playerData.club.id}" target="_blank">`+
                    `   <img title="${GetText('ClubExchange', {tag:0, args:args})}" tool_tt="ClubExchange_${encodeURIComponent(JSON.stringify(args))}" src="${Tool.sources.get('exchange')}" alt="exchange.png" height="15px" style="background-color:#00fff7; border-radius:50%; cursor:pointer; margin-right:4px;">`+
                    `</a>`+
                    `<font title="${GetText('RemainingTime', {tag:0})} : ${time_text}"  tool_tt="RemainingTime_{X} : ${time_text}">${playerData.date}</font>`
                );
            });
        }
    };
    ClubExchange.initial();
});
Tool.features.add('RankingOfPlayers','squad',function(){
    let table = $('#players-table-overview');
    let players = $('>tbody >tr:has(>td>.open-card:first)', table);
    if(!players.length) return false;

    players.each(function(i){ $('>td:nth-child(6) >span >input[type="text"]', this).attr('tabindex', i+1); });

    let btn = $(`<input id="RankingOfPlayersButton" type="button" value="${GetText('SortPlayers', {tag:0})}" tool_vt="SortPlayers" title="${GetText('rankOfPlayerExplanation', {tag:0})}" tool_tt="rankOfPlayerExplanation" style="-webkit-border-radius:7px !important; padding:2px 5px; border:1px solid #999; font-size:9px; margin:16px 90px 0 40px;">`);
    $('#squad-handle-container').append(btn);

    this.hover_selector = '#'+btn[0].id;

    btn.click(function(){
        $(this).off().prop('disabled', true);
        let keeperPos = Tool.footballerPositions[0],
            keepers=[], youngs=[], others=[];

        players.each(function(i){
            if(IsYoungPlayer($('>td:nth-child(12)', this))){
                let d = $('>td:nth-child(11)', this)[0].textContent.split('.');
                d = new Date(d[2], parseInt(d[1])-1, d[0]).getTime();
                youngs.push({i, d});
                return;
            }

            let pos = $('>td:nth-child(3)', this)[0].textContent.trim(),
                str = parseInt($('>td:nth-child(4)', this)[0].textContent),
                age = parseInt($('>td:nth-child(5)', this)[0].textContent);
            if(pos==keeperPos) keepers.push({i, str, age});
            else others.push({i, str, age});
        });

        let bestKeeper = keepers.reduce((acc, p, i)=>{
            if(p.str>acc.str){
                acc.str = p.str;
                acc.i = p.i;
                acc.ki = i;
            }
            return acc;
        }, {str:0, i:null});

        let no = 1;
        if(bestKeeper.i!=null){
            //Kaleci varsa, en güçlü kaleciyi 1.sıraya al!
            players.eq(bestKeeper.i).find('>td:nth-child(6) >span >input[type="text"]:first').val(no).attr('tabindex', no++);

            //En güçlü kaleciyi çıkart ve geri kalanını others adlı diziye aktar
            keepers.splice(bestKeeper.ki, 1);
            others = others.concat(keepers);
            keepers = undefined;
        }

        //En güçlüden en güçsüze göre sırala
        others.sort((a,b)=> (b.str-a.str) || (a.age-b.age) );

        //Genç hariç geri kalanını sırala
        for(let p of others) players.eq(p.i).find('>td:nth-child(6) >span >input[type="text"]:first').val(no).attr('tabindex', no++);

        //Genç oyuncuları geliş tarihlerine göre sırala. Geliş tarihi en küçük olan ilk olmalı!
        youngs.sort((a,b)=> a.d-b.d );

        //Genç oyuncuları 90 dan başlayarak sırala
        youngs.forEach((p,i)=>{ players.eq(p.i).find('>td:nth-child(6) >span >input[type="text"]:first').val(90+i).attr('tabindex', 90+i) });
        $('>tfoot >tr >td:nth-child(2) >span >a >span', table).click();
    });

    $('#squad-handle-container > li').click(function(){
        btn[$(this).index()?'slideUp':'slideDown']('slow');
    });
});
Tool.features.add('ShowStrengthChange','squad',function(){
    let tbody = $('#players-table-changes >tbody');
    if(!tbody.find('>tr .open-card:first').length) return !1;

    let BuyPlayers = Tool.getVal('PlayersData',{BuyPlayers:[]}).BuyPlayers; //Structure: http://prntscr.com/uc2p4v
    if(!Array.isArray(BuyPlayers) || BuyPlayers.length==0) return !1;

    let openCards = tbody.find('>tr .open-card');
    if(!openCards.length) return !1;

    let cntrl = 0, trs=[];
    openCards.each(function(){
        let openCard = $(this),
            pid = getPlayerIdByOpenCard(openCard),
            p_data = getRecordedPlayerByPlayerId(pid);
        if(p_data==undefined) return;
        ++cntrl;

        let position = openCard.parent().next().text().trim(),
            tr = openCard.closest('tr'),
            currentStrength = parseInt(tr.find('>td:nth-child(4)').text()),
            oldStrength = p_data.strength,
            difference = currentStrength-oldStrength;
        if(difference>0) tr.find('>td:nth-child(4)').append(`<span class="changed-property new-player" style="color:#42ff35; margin-left:2px;">(+${difference})</span>`);

        let td = tr.find('>td:last-child'),
            remTrainings = FindNumberOfTrainings(GetDateFromText(p_data.date).getTime(), Game.getTime()),
            rem2Trainings = FindNumberOfTrainings(GetDateFromText(p_data.date).getTime(), new Date(parseInt(td.attr('sortvalue'))*1e3).getTime());
        td.css('position','relative').append(
            `<img title="${GetText('InfoStrengthChange', {tag:0})}" tool_tt="InfoStrengthChange" src="${Tool.sources.get('data')}" alt="data.png" height="15px" style="position:absolute; top:9px; right:10px;">`
        ).before(`<td>[${remTrainings.normal+"-"+(remTrainings.normal+remTrainings.premium)}] -> [${rem2Trainings.normal+"-"+(rem2Trainings.normal+rem2Trainings.premium)}]</td><td>${p_data.date}</td>`);

        tr.find('.open-card[pid]').click(function(){
            let openCard = $(this);
            openCard.off();

            let max = 300;
            Tool.intervals.create(function(){
                if(openCard.hasClass('loading')){
                    if(--max<1) this.delete();
                    return;
                }
                this.delete();

                let dialog = $('#info-player-'+pid);
                let ul_skills = dialog.find('div.data.skills >ul');

                //Add real strength
                dialog.find('div.player-info >.strength').append(
                    'Ø '+
                    Number2String(GetRealStrength(ul_skills.first().find('>li').toArray().map(li=> parseFloat($(li).text())), position), 2)//.toFixed(2).replace(/.00$/,'').replace(/(.[1-9])0$/,'$1')
                );

                //Show skills and general skills differences
                if(!['skills','gSkills'].find(k=>!p_data.hasOwnProperty(k))){
                    ul_skills.each(function(j){
                        $('>li', this).each(function(i){
                            let cs, ps;
                            if(j==0){
                                let e = $('>span.skill', this);
                                cs = parseFloat(e.text());
                                ps = p_data.skills[i];
                            }
                            else{
                                cs = parseFloat($(this).contents()[2].textContent)
                                ps = p_data.gSkills[i];
                            }
                            if(ps != cs){
                                let diff = Number2String(cs-ps, 2);//.toFixed(2).replace(/.00$/,'').replace(/(.[1-9])0$/,'$1');
                                $(this).append(`<font style="font-size: 10px; color: #15ffc9; line-height: 19px;">(${ps<cs?"+":""}${diff})</font>`);
                            }
                        });
                    });
                }

                //Show skill development sequence
                let TrainingSkills = Tool.trainingPlan[position];
                if(Array.isArray(TrainingSkills)){
                    let colors = ["#5E3278","#733A85","#894291","#9D4A9B","#A9539B","#B55C9A","#C06598","#C773AA","#CD81BA","#D38FC8","#D99ED5","#DEACDF","#E0BAE5","#E4C9EB"],
                        lis = ul_skills.find('>li');
                    TrainingSkills.forEach((index, i)=>{
                        lis.eq(index).css('backgroundColor', colors[i]).append(`<label style="float:left;">${i+1}</label>`);
                    });
                }

            },50,'OpenCard_'+pid);
        });
        trs.push(tr[0]);
    });
    if(cntrl){
        tbody.parent().find('>thead th:last-child').before('<th>Trainings</th><th>Bought Date</th>');
    }

    $(trs).mouseenter(function(e){
        if(!e.ctrlKey) return;
        let row = $(this),
            playerId = getPlayerIdByOpenCard(getOpenCardByRow(row)),
            p_data = getRecordedPlayerByPlayerId(playerId);
        if(p_data == undefined) return;

        let rows = $(getRecordedPlayersByClubId(p_data.club.id));
        rows.css({
            'background-color': '#70d3fd'
        });

        row.css({
            'background-color': 'yellow'
        });


    }).mouseleave(function(){
        $(trs).css({
            'background-color': ''
        });
    })

    function getOpenCardByRow(row){ return row.find('>td:nth-child(2) >.open-card'); }
    function getPlayerIdByOpenCard(oc){ return oc.attr('pid').split('-').slice(-1)[0]; };
    function getRecordedPlayerByPlayerId(pid){ return BuyPlayers.find(p=> p.playerId == pid); }
    function getRecordedPlayersByClubId(clubid){
        return trs.filter(tr=>{
            let pi = getPlayerIdByOpenCard(getOpenCardByRow($(tr)));
            return getRecordedPlayerByPlayerId(pi).club.id == clubid;
        });
    }

},'#players-table-changes > tbody span.changed-property.new-player');
Tool.features.add('ShowRealStrength','squad',function(){
    [
        ["#players-table-overview", "#players-table-agreements", "#players-table-skills"],
        ["#players-table-overview-club", "#players-table-agreements-club", "#players-table-skills-club"]
    ].forEach(tables=>{
        let table = $(tables[0]);
        if(!table.find('>tbody>tr>td >.open-card:first').length) return;

        $('>tbody>tr',table).each((idx, row)=>{ //eslint-disable-line no-loop-func
            let position = $(row).find('>td:nth-child(3)').text().trim(),
                skills = $(`${tables[2]} >tbody >tr:nth-child(${idx+1})> td.skill-column`).toArray().map(e=>parseFloat($(e).attr('sortvalue'))),
                strengthColumn = $(row).find('> td:nth-child(4)'),
                currentStrength = parseInt(strengthColumn.attr('sortvalue')),
                realStrength = GetRealStrength(skills,position);

            if(isNaN(realStrength)) return;
            realStrength = realStrength.toFixed(2);

            let difference = (realStrength - currentStrength).toFixed(2),
                color = difference>0?"green":difference<0?"#a62c2c":"#d9d9d9";

            tables.forEach(tableId=>{
                let cell = $(`${tableId}>tbody >tr:nth-child(${idx+1}) >td:nth-child(4)`);
                cell.html(cell.html().replace(currentStrength, realStrength)).css('color',color).attr('title',(difference>0?'+':'')+difference).attr('realstrength', realStrength);
            });
        });
    });
},"#players-table-overview > tbody td:nth-child(4)[realstrength],#players-table-overvie-club > tbody td:nth-child(4)[realstrength],#players-table-agreements > tbody td:nth-child(4)[realstrength],#players-table-agreement-club > tbody td:nth-child(4)[realstrength],#players-table-skills > tbody td:nth-child(4)[realstrength],#players-table-skill-club > tbody td:nth-child(4)[realstrength]");
Tool.features.add('CalculateFeatureOfPlayer','squad',function(){
    if(!Tool.aging.length) return !1;

    //INPUTS
    let withoutYoungPlayers = !1;

    //DATAS
    let tablesMtx = [
        [$('#players-table-overview'), $('#players-table-skills')],
        [$('#players-table-overview-club'), $('#players-table-skills-club')]
    ];
    let ageDates, p = {}, select, mainDiv;

    //SELECT
    select = $(
        `<select onfocus="this.style.backgroundColor='green'; this.style.color='black';" onfocusout="this.style.backgroundColor='black'; this.style.color='green';" style="margin:0 0 0 20px; text-align-last:center; border-radius:10px; padding:3px 2px; background-color:black; color:green;">`+
        `   <option value="0" tool_ot="ChoosePlayer">${GetText('ChoosePlayer', {tag:0})}</option>`+
        `</select>`
    );
    (function fillUpSelect(){
        tablesMtx.forEach((tables, tidx)=>{
            let t1 = tables[0];
            if(!t1.find('.open-card:first').length) return;
            let t2 = tables[1];

            t1.find('>tbody >tr').each(function(ridx){
                let row = $(this), young = IsYoungPlayer(row.find('>td:nth-child(12)'));
                if(withoutYoungPlayers && young) return;

                let position = row.find('>td:nth-child(3)').text().trim(),
                    playerId = row.find('.open-card:first').attr('pid').split('-')[1],
                    playerName = row.find('.player-name').text(),
                    age = row.find('td:nth-child(5)').text();
                select.append(`<option value="${playerId}" ${young?`style="background-color:turquoise;"` :''} position="${position}" age="${age}" tidx="${tidx}" ridx="${ridx}"${young?` young="${new Date(...row.find('>td:nth-last-child(3)').text().trim().split('.').reverse().map((n,i)=>parseInt(n)-(i==1?1:0))).getTime()}"`:''}>[${position}${young?'-'+GetText('shortYoungPlayer') :''}] ${playerName}</option>`);
            });
        });
    })();

    mainDiv = $(`<div style="text-align:center; margin:5px auto; border-radius:15px; background-color:#4a6b3247;">`)
        .append(`<div style="border-radius:15px; background-color:#4a6b32; padding:15px 15px 5px 15px; margin-bottom:20px;">`);

    let date = $(`<input type="date" min="${$.datepicker.formatDate('yy-mm-dd', new Date(Game.getTime()))}" max="${$.datepicker.formatDate('yy-mm-dd', new Date(Tool.aging.convert2Date(Tool.aging.getDates().slice(-1)[0])))}" value="${$.datepicker.formatDate('yy-mm-dd', new Date(Game.getTime()))}">`);
    let time = $(`<input type="time">`);
    mainDiv.find('>div:first').append(GetText('ChoosePlayer')+': ')
        .append(select)
        .append(
        `<span class="icon details open-card" style="display:none; float:none; margin-top:-3px;"></span>`+
        `<div style="display:none;">`+
        `   <p style="margin-top:5px;">`+
        `      ${GetText('SkillPassLimitPoint')} : `+
        `      <input id="ChangeSkillLimit" type="number" value="990" step="10" max="990" min="100" onkeypress="return event.charCode >= 48 && event.charCode <= 57" style="border-radius:7px; border:1px solid gray; width:75px; text-align:center; padding:0 2px;">`+
        `   </p>`+
        `   <p style="margin-top:5px;">`+
        `      ${GetText('TrainerLevel')} : ${Tool.trainerLevel} ${GetText('SortLevel')}`+
        `   </p>`+
        `   <p id="youngTrainerParagraph" style="margin-top:5px; display:none;">`+
        `      ${GetText('YoungTrainerLevel')} : ${Tool.yTrainerLevel} ${GetText('SortLevel')}`+
        `   </p>`+
        `   <p style="margin-top:5px;">Maximum aging calculation : ${Tool.aging.length}</p>`+
        `   <p id="chooseRange" style="margin:10px 0;">`+
        `      ${GetText('ChooseAge')} :`+
        `      <input id="changeAge" class="slider" type="range" style="vertical-align:middle; margin:0 5px; border-radius:8px; width:300px;">`+
        `      <label id="lblAge" style="position:relative;">-</label>`+
        `   </p>`+
        `</div>`
    );
    mainDiv.find('>div:first>div:last-of-type').append($('<p>').html(GetText('calcFeaOfPlayerBasedTime')).append(date, time));

    $('#squad >div.squad.personal').append(
        '<hr>'+
        `<h3>${GetText('calculateFeatureOfPlayer')}</h3>`
    ).append(mainDiv);

    let lastArgs = null,
        calcMethod = null;
    $('#ChangeSkillLimit')
        .keyup(function(){
        let t = $(this), val = t.val();
        if(isNaN(val)) val = t.attr('max');
        else val = Math.max(t.attr('min'), Math.min(t.attr('max'), parseInt(val)));
        if(t.val() != val) t.val(val);
    })
        .mouseenter(function(){
        $(this).focus().select();
    })
        .mouseout(function(){
        $(this).blur();
    })
        .change(function(){
        if(lastArgs){
            $('#Comparison').remove();calc(...lastArgs);
        }
    });

    //Change Player
    select.change(function(){
        $('#Comparison').remove();

        let playerId = this.value;
        if(playerId==0){
            mainDiv.find('>div:first').css('border-radius', '15px');
            select.nextAll().hide();
            ageDates = undefined;
            p = {};
            return;
        }

        let selectedOpt = $('>option:selected',this),
            position = selectedOpt.attr('position'),
            tidx = parseInt(selectedOpt.attr('tidx')),
            ridx = parseInt(selectedOpt.attr('ridx')),
            age = parseInt(selectedOpt.attr('age')),
            isYoung = selectedOpt.attr('young')!=undefined;

        p.curAge = age;
        p.position = position;
        p.skills = tablesMtx[tidx][1].find(`>tbody >tr:nth-child(${ridx+1})`).find('>td.skill-column').toArray().map(td=>parseFloat($(td).attr('sortvalue')));
        ageDates = Tool.aging.getDates();

        select.find('~.open-card:first').attr('pid', `player-${playerId}`);

        let maxAge;
        if(position == Tool.footballerPositions[0]){ //TW
            if(age<43) maxAge=43;
            else if(Game.server == 'de'){
                let text = tablesMtx[tidx][0].find(`>tbody >tr:nth-child(${ridx+1})`).find('>td:nth-last-child(3)').text().trim();
                if(text.endsWith('Saisons')) maxAge = age + parseInt(text.split(' ')[1]);

            }
        }
        else{
            if(age<41) maxAge=41;
            else if(Game.server == 'de'){
                let text = tablesMtx[tidx][0].find(`>tbody >tr:nth-child(${ridx+1})`).find('>td:nth-last-child(3)').text().trim();
                if(text.endsWith('Saisons')) maxAge = age + parseInt(text.split(' ')[1]);
            }
        }

        select.nextAll().show();
        $('#youngTrainerParagraph')[isYoung?'slideDown':'slideUp']();

        $('#changeAge').attr({
            'min': age+1,
            'max': Math.min(isNaN(maxAge)?age+1:maxAge, age+ageDates.length)
        }).val(age+1).focus().trigger('input');
    });

    //Change Age of the Player
    mainDiv.on('input', '#changeAge', function() {
        if(calcMethod != 'age'){
            $('#chooseRange').next().css('opacity', '.2');
            calcMethod = 'age';
        }
        $('#Comparison').remove();
        let hidden = $(this).is(":hidden");
        let focus = $(this).is(":focus")
        if(hidden || !focus) return;

        let nextAge = parseInt($('#changeAge').val());
        $('#lblAge').text(nextAge);
        if(nextAge<=p.curAge){
            mainDiv.find('>div:first').css('border-radius', '15px');
            return;
        }

        calc(Tool.aging.convert2Date(ageDates[nextAge - p.curAge - 1]), null, nextAge);
    });

    //Or Change End Date
    date.add(time).change(function(){
        if(calcMethod != 'time'){
            $('#chooseRange').css('opacity', '.2');
            calcMethod = 'time';
        }
        $('#Comparison').remove();
        let dateStr = date.val().trim(),
            timeStr = time.val().trim();
        if(dateStr==""){
            mainDiv.find('>div:first').css('border-radius', '15px');
            return;
        }
        if(timeStr=="") time.val(timeStr="00:00");
        dateStr = dateStr.split('-');
        calc(new Date(dateStr[0], parseInt(dateStr[1])-1, dateStr[2], ...timeStr.split(':')));
    });

    $('#chooseRange').add($('#chooseRange').next())
        .mouseenter(function(){
        if(this.id=='chooseRange'){
            if(calcMethod != 'age')
                $(this).css('opacity', 1).next().css('opacity', '.2');
        }
        else if(calcMethod != 'time')
            $(this).css('opacity', 1).prev().css('opacity', '.2');
        $(this).css('background-color', '#fff08617');
    })
        .mouseleave(function(){
        if(this.id=='chooseRange'){
            if(calcMethod != 'age') $(this).css('opacity', '.2').next().css('opacity', 1);
        }
        else if(calcMethod != 'time') $(this).css('opacity', '.2').prev().css('opacity', 1);
        $(this).css('background-color', 'unset');
    });

    function calcAgeOnNextDate(date){
        let age = p.curAge, c=0;
        date = date.getTime();
        let i=0,l=ageDates.length;
        for(; i<l && date>=Tool.aging.convert2Date(ageDates[i]).getTime(); i++, age++);
        if(i==l) age += parseInt((date-Tool.aging.convert2Date(ageDates.slice(-1)[0]).getTime())/(30*86400000));
        return age;
    }

    function calc(endDate, startDate=null, nextAge=null){
        lastArgs = arguments;
        let startIsNow = startDate===null;
        if(startIsNow) startDate = new Date(Game.getTime())
        if(nextAge === null) nextAge = calcAgeOnNextDate(endDate);

        mainDiv.find('>div:first').css('border-radius', '15px 15px 0 0');

        let youngEndDate = select.find('>option:selected').attr('young'),
            isYoung = youngEndDate != undefined,
            limit = parseInt($('#ChangeSkillLimit').val()),
            startAge = startIsNow?p.curAge: calcAgeOnNextDate(startDate);

        let result = CalculateFutureStrength({
            startTime : startDate.getTime(),
            youngUntil: isYoung?Math.min(parseInt(youngEndDate), endDate.getTime()): null,
            endTime   : endDate.getTime(),
            skills    : p.skills,
            position  : p.position,
            limit
        });

        let skillsId = ['penalty_area_safety', 'catch_safety', 'two_footed', 'fitness', 'shot', 'header', 'duell', 'cover', 'speed', 'pass', 'endurance', 'running', 'ball_control', 'aggressive'],
            divComp = $(`<div id="Comparison" class="infosheet" style="text-align:center; margin-bottom:10px;">`);

        [{
            title    : startIsNow?`${GetText('Now')} (${GetDateText(startDate.getTime())})`: GetDateText(startDate.getTime()),
            skills   : p.skills,
            age      : startAge,
            strength : result.start.strength
        }, {
            title            : GetText('NonCreditTraining')+' ('+GetDateText(endDate.getTime())+')',
            skills           : result.end.normal.skills,
            age              : nextAge,
            strength         : result.end.normal.strength,
            numberOfTraining : result.end.normal.trainings
        }, {
            title            : GetText('CreditTraining')+' ('+GetDateText(endDate.getTime())+')',
            skills           : result.end.premium.skills,
            age              : nextAge,
            strength         : result.end.premium.strength,
            numberOfTraining : result.end.premium.trainings
        }].forEach((table, ind)=>{
            let div = $(`<div class="data skills" style="height:100%; padding:5px; background-color:#58793d; border-radius:5px; position:static;${ind!=2?" margin-right:25px;":""}">`);
            div.append(`<h2 style="font-size:12px; margin-bottom:5px; border:none; line-height:25px; height:25px; background:#4a6b32; width:auto; font-weight:bold;">${table.title}</h2>`);
            div.append(
                `<ul style="margin:3px 0;">`+
                `   <li class="odd">`+
                `      <span style="float:left;">Ø</span>`+
                `      <span style="color:white;font-weight:bold;">${table.strength}</span>`+
                `   </li>`+
                `   <li class="odd">`+
                `      <span style="float:left;">${GetText('Age')}</span>`+
                `      <span style="color:white;font-weight:bold;">${table.age}</span>`+
                `   </li>`+
                `</ul>`
            );

            let ul = $('<ul style="margin:0;">');
            skillsId.forEach((skillId, i)=>{
                let span = $('<span>');
                let skillVal = table.skills[i];
                if(ind!=0){
                    let curSkillVal = p.skills[i];
                    if(skillVal!=curSkillVal){
                        let diff = parseFloat((skillVal-curSkillVal).toFixed(2));
                        if(parseInt(diff) != diff) diff.toFixed(2);
                        span.css('color', '#ff0808').append(`<span class="changed-property" style="color:#3db3d5e6;vertical-align: middle; display: inline-block; margin: -1.9px 0 0 2px; font-size: 8.3px;">(+${diff})</span>`);
                    }
                }
                if(skillVal>=limit) limit>=990?span.addClass('maximum'): span.css({'background-color': '#ffffff', 'padding':'0 3px'});
                span.prepend(skillVal);

                ul.append(
                    `<li class="odd">`+
                    `   <strong><span class="icon ${skillId}" tooltip="tt_${skillId}"></span></strong>`+
                    `</li>`
                ).find('>li:last').append(span);
            });

            div.append(ul);

            if(ind>0){
                div.append(
                    `<ul style="margin:4px auto 2px auto">`+
                    `   <li class="odd" style="float:none;margin:auto;margin-bottom:1px;">`+
                    `      <span style="float:left;">${GetText('Training')}</span>`+
                    `      <span style="color:white;font-weight:bold;">${table.numberOfTraining}</span>`+
                    `   </li>`+
                    `</ul>`
                );
            }
            divComp.append(div);
        });

        mainDiv.append(divComp);
    }

},'CalculateFutureStrength');
Tool.features.add('CalculatingStrengthOfYoungPlayer','squad',function(){
    if(!Tool.aging.length) return !1;

    //INPUT(S)
    let agingInfoDesign = 1, // 1 or 2
        design2Animation = !0; //true or false

    //VERIABLES
    let tableMtx = [
        ["#players-table-overview",      "#players-table-agreements",      "#players-table-skills"],
        ["#players-table-overview-club", "#players-table-agreements-club", "#players-table-skills-club"]
    ].map(tables=> tables.map(id=>$(id))).filter(tables=> tables[0].find('>tbody >tr .open-card:first').length);
    if(!tableMtx.length) return !1;

    const daysOfYouthPeriod = 100,
          refYouth = {
              time   : new Date(2021, 10, 21).getTime(),
              dateVal: 21637442000
          };

    let now = Game.getTime(),
        counter = 0;
    tableMtx.forEach((tables, mtxRowIdx)=>{
        tables[0].find('>tbody >tr').each(function(rowIdx){
            let row = $(this);
            if(!IsYoungPlayer(row.find('>td:nth-child(12)'))) return;
            ++counter;

            let p = Object.assign({
                id       : row.find('.open-card:first').attr('pid').split('-').slice(-1)[0],
                name     : row.find('>td.name-column >span.player-name:first').text().trim(),
                pos      : row.find('>td:nth-child(3)').text().trim(),
                curStr   : parseInt(row.find('>td:nth-child(4)').text()),
                curAge   : parseInt(row.find('>td:nth-child(5)').text()),
                curSkills: tables[2].find(`>tbody >tr:nth-child(${rowIdx+1}) >td.skill-column`).toArray().map(s=>parseFloat($(s).text()))
            }, (()=>{ //To calculate junior start end end times
                let dateCol = row.find('>td[sortvalue]:last'),
                    dateVal = dateCol.attr('sortvalue'),
                    endJuniorTime;
                if(!dateVal){
                    let endJuniorTime = dateCol.text().trim().match(/(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})/g);
                    endJuniorTime = endJuniorTime[0].split('.');
                    endJuniorTime = new Date(endJuniorTime[2], parseInt(endJuniorTime[1])-1, parseInt(endJuniorTime[0])).getTime();
                }
                else endJuniorTime = refYouth.time + (parseInt(dateVal) - refYouth.dateVal)*1e3;

                return {
                    startJuniorTime: endJuniorTime - daysOfYouthPeriod*86400000,
                    endJuniorTime
                };
            })()); //{pos, curAge, curSkills, endJuniorTime, startJuniorTime, /*ageWhenYouthEnd*/}

            if(mtxRowIdx==0){
                let trainingSkills = Tool.trainingPlan[p.pos]; // [9,6,3,7,8,10,5]
                for(let i=0, l=tables.length; i<l; i++)
                    listenClickingCard(tables[i].find(`>tbody >tr:nth-child(${rowIdx+1}) .open-card`), trainingSkills, mtxRowIdx);
            }1

            let {start:{strength:curRealStr}, end: future} = CalculateFutureStrength({
                startTime : now,
                youngUntil: p.endJuniorTime,
                skills    : p.curSkills,
                position  : p.pos
            }); //{start:{strength:'56.71', skills: float(14)}, end:{normal:{strength:'56.71', trainings:181, skills:float(14)}, premium:{strength:'56.71', trainings:181, skills:float(14)}}}
            p.curRealStr = curRealStr;

            let dates = calcAgingTimes(now, p.startJuniorTime, p.endJuniorTime);
            if(dates !== !1){
                p.ageWhenYouthEnd = p.curAge + dates.nextAgingTimes.length;
            }

            /*  Sequence of Dates:

                ageJumpTimeBeforePlayerCame
               *p.startJuniorTime
                ...pastAgingTimes
                ...nextAgingTimes
               *p.endJuniorTime
                ageJumpTimeAfterYouthEnd
            */

            let title =
                `${GetText('EndYouth', {tag:0, args:[Number2String((p.endJuniorTime-now)/86400000, 1), (d=> `${Pad2(d.getDate())}.${Pad2(d.getMonth()+1)}.${d.getFullYear()}`)(new Date(p.endJuniorTime))]})};\n`+
                (dates == !1 ? '' : `${GetText('Age', {tag:0})} : ${p.ageWhenYouthEnd}\n`)+
                `Ø : ${future.normal.strength} - ${future.premium.strength}\n`+
                `${GetText('YoungTrainerLevelS', {tag:0})} : ${Tool.yTrainerLevel} ${GetText('SortLevel', {tag:0})}\n`+
                `${GetText('pointsPerTraining')}: ${GetPointsPerTraining(!0)}\n`+
                `${GetText('RemainingNumberOfNormalTraining', {tag:0})} : ${future.normal.trainings}\n`+
                `${GetText('RemainingNumberOfCreditTraining', {tag:0})} : ${future.premium.trainings - future.normal.trainings}\n`+
                (dates == !1 ? '' : GetText('RemainingNextAgeDay', {tag:0, args:[Number2String((dates.ageJumpTimeAfterYouthEnd - p.endJuniorTime)/86400000, 1)]}) );

            createContentForStrengthInfo(p, future);

            if(dates != !1){
                if(agingInfoDesign == 2) createContentForAgeInfo(p, dates);
                else toolTipObj.data[`youngPlayerAgeInfo_${p.id}`] = "loading..."; //canvas will be created when cursor on the age column
            }

            for(let i=0; i<2; i++){
                createEnterLeaveEvent(
                    tables[i].find(`>tbody >tr:nth-child(${rowIdx+1}) >td:nth-child(4)`), // Strength column
                    tables[i].find(`>tbody >tr:nth-child(${rowIdx+1}) >td:nth-child(5)`), // Age column
                    p.id,
                    future.normal.strength,
                    future.premium.strength,
                    p.ageWhenYouthEnd,
                    agingInfoDesign==2?null: [p, dates, now]
                );

                tables[i].find(`>tbody >tr:nth-child(${rowIdx+1}) >td:nth-child(${[11, 8][i]})`).attr('title', title);
            }
        });
    });
    if(!counter) return !1;

    let animationTimeout;
    function calcAgingTimes(now, startJuniorTime, endJuniorTime){
        let ageJumpTimeBeforePlayerCame = null,
            ageJumpTimeAfterYouthEnd = null,
            pastAgingTimes = [],
            nextAgingTimes = [];

        // console.log('%cSPACE', 'background-color:black; color:white;');
        // console.log(
        //     'Şuan                    : ' + GetDateText(now) + '\n'+
        //     'Gencin geldiği zaman    : ' + GetDateText(startJuniorTime) + '\n'+
        //     'Gençliğin biteceği zaman: ' + GetDateText(endJuniorTime)
        // );
        for(let i=0, pastDates=Tool.aging.pastDates, l=pastDates.length, d; i<l; i++){
            d = Tool.aging.convert2Date(pastDates[i]).getTime();
            if(d > startJuniorTime) {
                // console.log('1| Gencin geldiği zamandan önceki yaş atlama bulunmaya çalışılıyor.. continue('+GetDateText(d)+')');
                continue;
            }

            // console.log('2| i='+i+' ageJumpTimeBeforePlayerCame: ' + GetDateText(d));
            ageJumpTimeBeforePlayerCame = d;

            for(let j=i-1; j>-1; j--){
                d = Tool.aging.convert2Date(pastDates[j]).getTime()
                if(d<now){
                    // console.log('3| d<now => pastAgingTimes.push('+GetDateText(d)+')');
                    pastAgingTimes.push(d);
                }
                else{
                    // console.log('4| now<=d => nextAgingTimes.push('+GetDateText(d)+')');
                    nextAgingTimes.push(d);
                    for(let k=j-1; k>-1;k--){
                        d = Tool.aging.convert2Date(pastDates[k]).getTime();
                        // console.log('5| nextAgingTimes.push('+GetDateText(d)+')');
                        nextAgingTimes.push(d);
                    }
                    break;
                }
            }
            break;
        }
        if(ageJumpTimeBeforePlayerCame == null) return !1;

        for(let i=0, nextDates=Tool.aging.dates, l=nextDates.length, s=!1, d; i<l; i++){
            d = Tool.aging.convert2Date(nextDates[i]).getTime();
            if(!s){
                // console.log('6| bir sonraki yaş atlama bulunmaya çalışıyor... d: ' + GetDateText(d));
                if(d<now){
                    // console.log('7| d<now => pastAgingTimes.push('+GetDateText(d)+')');
                    pastAgingTimes.push(d);
                    continue;
                }
                // console.log('8| bir sonraki yaş atlama bulundu!');
                s = !0;
            }

            if(d < endJuniorTime){
                // console.log('9| d< => nextAgingTimes.push('+GetDateText(d)+')');
                nextAgingTimes.push(d);
                continue;
            }

            // console.log('10| ageJumpTimeAfterYouthEnd: ' + GetDateText(d))
            ageJumpTimeAfterYouthEnd = d;
            break;
        }
        if(ageJumpTimeAfterYouthEnd == null) return !1;

        return {ageJumpTimeBeforePlayerCame, pastAgingTimes, nextAgingTimes, ageJumpTimeAfterYouthEnd};
    }
    function createEnterLeaveEvent(strCol, ageCol, p_id, f_normal_str, f_prem_str, ageWhenYouthEnd, extraParams){
        strCol.attr({'tooltip':`youngPlayerStrengthInfo_${p_id}`, title:''});
        let existOfDates = ageWhenYouthEnd != undefined;
        if(existOfDates) ageCol.attr('tooltip', `youngPlayerAgeInfo_${p_id}`);

        let orjStrContent = strCol.html(),
            orjAgeContent = ageCol.html();
        strCol.add(existOfDates?ageCol:null).mouseenter(function(){
            strCol.html(`<label style="color:#00e7ff;">${f_normal_str} / ${f_prem_str}</label>`);
            if(ageWhenYouthEnd) ageCol.html(`<label style="color:#00e7ff;">${ageWhenYouthEnd}</label>`);
            if(agingInfoDesign == 1 && this == ageCol[0] && existOfDates) setTimeout(()=>showAgeInfoWithCanvas(...extraParams), 1);
        }).mouseleave(function(){
            $(toolTipObj.toolTipLayer).hide();
            strCol.html(orjStrContent);
            if(ageWhenYouthEnd) ageCol.html(orjAgeContent);
            clearTimeout(animationTimeout);
        });
    }
    function listenClickingCard(openCard, trainingSkills, mtxRowIdx){
        openCard.click(function(){
            let openCard = $(this).off(),
                rowIdx = openCard.closest('tr').index()+1,
                playerId = openCard.attr('pid').split('-')[1];

            $(tableMtx[mtxRowIdx].map(e=>e[0])).find(`>tbody >tr:nth-child(${rowIdx}) .open-card`).off();

            if($(`#info-player-${playerId}`).length) return;

            let max = 300;
            Tool.intervals.create(function(){
                if(openCard.hasClass('loading')){
                    if(--max<1) this.delete();
                    return
                }
                this.delete();

                let infoDiv = $('#info-player-'+playerId),
                    lis = infoDiv.find('div.data.skills > ul:first > li'),
                    romanNumerals = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"];
                for(let p=0; p<3; p++)
                    lis.eq(trainingSkills[p]).css('backgroundColor', '#00585d')
                        .append(`<label style="float:left;">${romanNumerals[p]}</label>`);

                infoDiv.find('.skill:not(.maximum)').each(function(){
                    let skillValue = parseFloat(this.textContent);
                    $(this).mouseenter(function(){
                        let result = GetMaxSkill(skillValue, GetPointsPerTraining(!0)),
                            args = [result.required_trainings];
                        if(result.required_trainings>0){
                            $(this).css({
                                'color':'#5eff0c',
                                'font-weight':'bold'
                            }).attr({
                                'title': GetText('AfterTrainings', {tag:0, args:args}),
                                'tool_tt': `AfterTrainings_${encodeURIComponent(JSON.stringify(args))}`
                            }).text(result.max_value);
                        }
                    }).mouseleave(function(){
                        $(this).css({
                            'color':'',
                            'font-weight':''
                        }).removeAttr('title').text(skillValue);
                    });
                });
            }, 50, 'OpenCard_'+playerId);
        });
    }
    function createContentForStrengthInfo({id, name, curStr, curRealStr}, future){
        let tr =
            [
                [GetText('Strength'), curStr],
                [GetText('RealStrength'), curRealStr],
                [GetText('YoungTrainerLevelS'), `${Tool.yTrainerLevel} ${GetText('SortLevel')}`],
                [GetText('NonCreditTraining'), `${future.normal.strength} (${((future.normal.strength-curRealStr)>0?'+':'') + Number2String(future.normal.strength-curRealStr, 2).replace(',', '.')})`],
                [GetText('CreditTraining'), `${future.premium.strength} (${((future.premium.strength-curRealStr)>0?'+':'') + Number2String(future.premium.strength-curRealStr, 2).replace(',', '.')})`]
            ];
        let content =
            `<h3 style="text-align:center; margin-bottom:2px;">`+
            `   <label style="border-bottom:1px solid white;padding:0 2px;">${name}</label>`+
            `</h3>`+
            `<table>`+
            `   <tbody>`;
        for(let i=0, l=tr.length; i<l; i++){
            content +=
                `<tr style="line-height:20px; height:20px;">`+
                `   <td style="border-bottom:none; text-align:left;">`+
                `      ${tr[i][0]}`+
                `      <span style="float:right; margin:0 2px;">:</span>`+
                `   </td>`+
                `   <td style="border-bottom:none; text-align:left;">`+
                `      ${tr[i][1]}`+
                `   </td>`+
                `</tr>`;
        }
        content += `</tbody></html>`;
        toolTipObj.data[`youngPlayerStrengthInfo_${id}`] = content;
    }
    function createContentForAgeInfo(p/*player*/, d/*dates*/){
        let content =
            `<h3 style="text-align:center; margin-bottom:2px;">`+
            `   <label style="border-bottom:1px solid white; padding:0 2px 2px 2px; display:block;">`+
            `      ${GetText('Age')} : ${p.curAge}${p.ageWhenYouthEnd? ` => ${p.ageWhenYouthEnd} (${(p.ageWhenYouthEnd-p.curAge>0?'+':'')+(p.ageWhenYouthEnd-p.curAge)})` : '' }`+
            `      <span style="color:#24ffd2d4; font-size:9px; display:block;">(Now: ${GetDateText(now)})</span>`+
            `   </label>`+
            `</h3>`;

        // console.log(
        //     'ageJumpTimeBeforePlayerCame: ' + GetDateText(d.ageJumpTimeBeforePlayerCame) + "\n"+
        //     'startJuniorTime            : ' + GetDateText(p.startJuniorTime) + "\n"+
        //     'pastAgingTimes             : ' + d.pastAgingTimes.map(ms=> GetDateText(ms)).join('\n' + ' '.repeat(29)) + '\n'+
        //     'nextAgingTimes             : ' + d.nextAgingTimes.map(ms=> GetDateText(ms)).join('\n' + ' '.repeat(29)) + '\n'+
        //     'endJuniorTime              : ' + GetDateText(p.endJuniorTime) + "\n"+
        //     'ageJumpTimeAfterYouthEnd   : ' + GetDateText(d.ageJumpTimeAfterYouthEnd)
        // );

        let valuesOfDates = [
            {s:'color:maroon; border-bottom:1px solid white; padding:-bottom:1px; margin-bottom:1px; opacity:0.3', t: d.ageJumpTimeBeforePlayerCame},
            {s:'color:turquoise; opacity:0.3', t: p.startJuniorTime},
            ...(times=>{
                let l=times.length;
                return times.map((time, i)=>{ return {s:'color: yellow; opacity:0.3', t:time, a:p.curAge-l+i+1}; });
            })(d.pastAgingTimes),
            ...d.nextAgingTimes.map((time, i)=>{ return {s:'color:white', t:time, a:p.curAge+i+1}; }),
            {s:'color:turquoise', t:p.endJuniorTime},
            {s:'color:aqua; border-top:1px solid white; padding-top:1px; margin-top:1px', t: d.ageJumpTimeAfterYouthEnd, a:p.ageWhenYouthEnd+1}
        ],
            l = valuesOfDates.length;

        valuesOfDates[2 + d.pastAgingTimes.length].n = 1; //For ➤

        valuesOfDates.forEach((date, i)=>{
            content += `<label style="${date.s}; display:block; text-align:right;">${date.n?`➤ `:''}${date.a?`${date.a-1}=>${date.a} | `:''}${GetDateText(date.t)}</label>`;
            if(i+1 < l){
                let date2 = valuesOfDates[i+1];
                content += `<label style="display:block; text-align:right; font-size:8px; color:#ccc;">${Number2String((date2.t - date.t)/86400000, 2)} ${GetText('Days')}</label>`;
            }
        });
        toolTipObj.data[`youngPlayerAgeInfo_${p.id}`] = content;
    }
    function showAgeInfoWithCanvas(p/*player*/, d/*dates*/, now){
        //p //{pos, curAge, curSkills, endJuniorTime, startJuniorTime, /*ageWhenYouthEnd*/}
        //d //{ageJumpTimeBeforePlayerCame, pastAgingTimes, nextAgingTimes, ageJumpTimeAfterYouthEnd}

        let container = $(toolTipObj.toolTipLayer).css('max-width', 'none').html(
            `<h3 style="text-align:center; border-bottom:1px dashed white; display:block; width:50%; margin:auto; padding-bottom:2px; color:black;">`+
            ` <label style="text-decoration:underline;">${p.name}</label> | ${p.curAge} -> ${p.ageWhenYouthEnd}`+
            `</h3>`
        );

        let calcDiffDays = (d1, d2) => parseInt((d2-d1)/86400000);
        let calcMarginLeft = diffDays => diffDays/30*100;
        let yatayCizgiCiz = (content, x, y, color, top, bottom, padd=0, writeText=!0)=>{
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.moveTo(x, y-top)
            ctx.lineTo(x, y+bottom);
            ctx.strokeStyle = color;
            ctx.lineCap = 'square'
            ctx.stroke();
            ctx.restore();

            if(!writeText) return;
            //Yazı
            ctx.save();
            ctx.beginPath();
            ctx.font = "12px Monospace";
            let textHeight = 4, textWidth = 42;
            ctx.textAlign = "center";
            ctx.translate(x, y);
            ctx.rotate(-Math.PI/2);
            ctx.fillStyle  = color;
            ctx.fillText(content instanceof Date?content.toLocaleString('tr-TR'): content, +(20 + textWidth+top+padd), textHeight);
            ctx.restore();
        };

        let sLeft = 25;
        let left = sLeft;
        let height = 320,
            width = left*2+calcMarginLeft(calcDiffDays(new Date(d.ageJumpTimeBeforePlayerCame), new Date(d.ageJumpTimeAfterYouthEnd))),
            canvas = $(`<canvas width="${width}" height="${height}" style="box-sizing:border-box; display:block;"> Your browser does not support the canvas element. </canvas>`).appendTo(container),
            ctx = canvas[0].getContext("2d");

        let date, date2, diffDays, marginLeft;

        //ageJumpTimeAfterYouthEnd
        date2 = new Date(d.ageJumpTimeAfterYouthEnd);
        diffDays = calcDiffDays(new Date(d.ageJumpTimeBeforePlayerCame), new Date(d.ageJumpTimeAfterYouthEnd));
        marginLeft = calcMarginLeft(calcDiffDays(new Date(d.ageJumpTimeBeforePlayerCame), new Date(d.ageJumpTimeAfterYouthEnd)));

        canvas.attr('width', width = left*2+calcMarginLeft(calcDiffDays(new Date(d.ageJumpTimeBeforePlayerCame), new Date(d.ageJumpTimeAfterYouthEnd))));
        let counter = 0;
        $(container).append(
            `<div style="text-align:left; width:${width}px; border-top:1px dashed white; padding-top:2px; margin-top:2px;">`+
            [
                ['maroon', GetText('ageJumpTimeBeforePlayerCame')],
                ['turquoise', GetText('startJuniorTime')],
                ['yellow', GetText('pastAgeJumpTimes'), d.pastAgingTimes.length>0],
                ['white', GetText('nextAgeJumpTimes'), d.nextAgingTimes.length>0],
                ['blue', GetText('endJuniorTime')],
                ['lightGreen', GetText('ageJumpTimeAfterYouthEnd')]
            ].map(p=>{
                if(p.length>2 && !p[2]) return "";
                return `<p style="width:50%; padding-left:20px; box-sizing:border-box; font-size:10px; ${counter++%2?'float:right;': 'float:left;'}">`+
                    `   <font color="${p[0]}">◉ ${p[1]}</font>`+
                    `</p>`;
            }).join('')+
            `</div>`
        );

        function draw(){
            left = sLeft;
            let top = height/2+14;
            //Yatay çizgi
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.moveTo(left, top);
            ctx.lineTo(width-left, top);
            ctx.strokeStyle = '#ccc';
            // ctx.lineCap = 'round';
            ctx.stroke();

            //ageJumpTimeAfterYouthEnd
            date2 = new Date(d.ageJumpTimeAfterYouthEnd);
            diffDays = calcDiffDays(new Date(d.ageJumpTimeBeforePlayerCame), date2)
            marginLeft = calcMarginLeft(diffDays);
            yatayCizgiCiz(date2, left+marginLeft, top, 'lightGreen', 30, 0, 5);

            //ageJumpTimeBeforePlayerCame
            let firstDate = new Date(d.ageJumpTimeBeforePlayerCame),
                firstLeft = left;
            yatayCizgiCiz(firstDate, firstLeft, top, 'maroon', 30, 0, 5);

            date = firstDate;
            left = firstLeft;
            d.pastAgingTimes.map(d=>new Date(d)).forEach(date2=>{
                diffDays = calcDiffDays(date, date2);
                marginLeft = calcMarginLeft(diffDays);

                yatayCizgiCiz(date2, left+marginLeft, top, 'yellow', 20, 0, 10);

                date = date2;
                left += marginLeft;
            });

            d.nextAgingTimes.map(d=>new Date(d)).forEach(date2=>{
                diffDays = calcDiffDays(date, date2);
                marginLeft = calcMarginLeft(diffDays);

                yatayCizgiCiz(date2, left+marginLeft, top, 'white', 20, 0, 10);

                date = date2;
                left += marginLeft;
            });

            //startJuniorTime
            date = new Date(p.startJuniorTime);
            diffDays = calcDiffDays(firstDate, date);
            marginLeft = calcMarginLeft(diffDays);
            yatayCizgiCiz(date, firstLeft+marginLeft, top, 'turquoise', 0, 10, -140);

            //endJuniorTime
            date = new Date(p.endJuniorTime);
            diffDays = calcDiffDays(firstDate, date);
            marginLeft = calcMarginLeft(diffDays);
            yatayCizgiCiz(date, firstLeft+marginLeft, top, 'blue', 0, 10, -140);

            //now
            // now = new Date(Game.getTime());
            diffDays = calcDiffDays(firstDate, new Date(now));
            marginLeft = calcMarginLeft(diffDays);
            yatayCizgiCiz('NOW', firstLeft+marginLeft, top, 'orange', 10, 10, -109);

            let r = 6,
                ty = r * Math.cos(Math.PI / 6),
                sx = firstLeft+marginLeft - Math.ceil(ty/2),
                sy = top+10+ ty +6;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx+r, sy);
            ctx.lineTo(sx+r/2, sy - r * Math.cos(Math.PI / 6));
            ctx.closePath();
            // the outline
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#666666';
            ctx.stroke();
            // the fill color
            ctx.fillStyle = "#FFCC00";
            ctx.fill();
        }
        draw();

        if(!design2Animation) return;

        let orjNOW = now,
            status = 'start';

        update();
        function update(){
            let timeout = 5;
            if(status == 'start'){
                timeout += 1000;
                orjNOW = now;
                now = p.startJuniorTime;
                status = 'c';
            }
            else if(status == 'c'){
                now += 5*60*60*1e3;
                status = now<p.endJuniorTime?status:'end';
            }
            else if(status == 'end'){
                timeout += 1000;
                now = orjNOW;
                status == 'r'
            }
            else return;

            d = calcAgingTimes(now, p.startJuniorTime, p.endJuniorTime);

            animationTimeout = setTimeout(function(){
                ctx.clearRect(0, 0, width, height);
                draw();
                update();
            }, timeout);
        }
    }
});
Tool.features.add('YoungPlayersHistory','squad',function(){
    let YoungPlayers = Tool.getVal('YoungPlayers', {MessageBox:{},show:[]}); //Structure: http://prntscr.com/ucg9s3
    if(!Array.isArray(YoungPlayers.show)) YoungPlayers.show = [];

    let players = YoungPlayers.show;
    if(!players.length) return !1;

    //INPUT(S)
    let playersPerPage = 10, //maximum number of players shown on a page
        startPageNo = 1;

    players.sort((a,b)=> {
        a = (a.date || a.date_).split('.');
        b = (b.date || b.date_).split('.');
        return new Date(b[2], parseInt(b[1])-1, b[0]).getTime() - new Date(a[2], parseInt(a[1])-1, a[0]).getTime();
    });

    $('#squad >div.squad.personal').append(
        `<hr>`+
        `<div id="container-youngs-history" class="table-container">`+
        `   <h3>${GetText('TitleOfYoungPlayersTable')}</h3>`+
        `   <table id="players-table-youngs-history" class="sortable-table sortable">`+
        `      <thead>`+
        `         <tr>`+
        `            <th class="name-column sortcol">${GetText('Name')}</th>`+
        `            <th class="position-column sortcol">${GetText('Position')}</th>`+
        `            <th class="strength-column sortcol" tooltip="tt_strength">Ø</th>`+
        `            <th class="age-column sortcol">${GetText('Age')}</th>`+
        `            <th class="sortcol">${GetText('Date')}</th>`+
        `         </tr>`+
        `      </thead>`+
        `      <tbody></tbody>`+
        `   </table>`+
        `</div>`
    );

    !function addRows(players, currentPage){
        let playersCount = players.length,
            pagesCount = Math.ceil(playersCount/playersPerPage),
            e = $('#players-table-youngs-history');
        if(!playersCount){
            e.parent().add(e.parente().prev('hr')).remove();
            return;
        }

        //Check if player is in the club.
        let playerIds = $('#players-table-overview, #players-table-overview-club').find('>tbody >tr >td.name-column >.open-card').toArray().map(o=>$(o).attr('pid').replace(/^player-/, ''));
        players.forEach(player=>{
            let idx = playerIds.indexOf(player.id);
            if(idx == -1) return;
            playerIds.splice(idx, 1);
            player.inClub = 1;
        });

        //Add rows
        for(let i = 0, k = (currentPage-1)*playersPerPage, p; i < playersPerPage && i+k < playersCount ; i++){
            p = players[i+k];
            e.find('>tbody').append(
                `<tr class="${i%2?"even":"odd"}" pid="${p.id}">`+
                `   <td class="name-column">`+
                `      ${p.inClub?`<span pid="player-${p.id}" class="icon details open-card"></span>`:''}`+
                `      <span class="player-name"${p.inClub?'':` style="margin-left:21px;"`}>${p.name}</span>`+
                `   </td>`+
                `   <td>${p.position}</td>`+
                `   <td sortvalue="${p.strength}">${p.strength}</td>`+
                `   <td>${p.age}</td>`+
                `   <td${p.hasOwnProperty('date_')?` title="${GetText('mayNotTrue', {tag:0})}" tool_tt="mayNotTrue" style="font-style:italic;"`:''}>${p.date||p.date_}</td>`+
                `</tr>`
            );
        }

        if(pagesCount<2) return;

        CreatePager(e, currentPage, pagesCount, playersCount, function(){
            let currentPage = parseInt($(this).text()),
                players = Tool.getVal('YoungPlayers',{MessageBox:{},show:[]}).show; //Structure: http://prntscr.com/ucg9s3
            e.find('>tbody').html('');
            addRows(players, currentPage);
        });
    }(players, startPageNo);

    $('#players-table-youngs-history>tbody').on('mouseenter', '>tr',function(){
        $('#remove_young_data').remove();
        let row = $(this),
            pid = row.attr('pid');
        row.find('>td:last').css('position', 'relative').append(
            `<img id="remove_young_data" pid="${pid}" src="${Tool.sources.get('remove')}" alt="remove.png" style="height: 15px; position: absolute; top: 9px; right: 10px; cursor: pointer;">`
        );
    }).mouseleave(function(){
        $(this).find('>td:last').css('position', '');
        $('#remove_young_data').remove();
    });
    $('#players-table-youngs-history').on('click', '#remove_young_data', function(){
        let pid = $(this).attr('pid');
        let data = Tool.getVal('YoungPlayers',{MessageBox:{},show:[]});
        let players = data.show||[];
        let index = players.findIndex(player=>player.id==pid);
        if(index==-1) return;
        players.splice(index,1);
        data.show = players;
        Tool.setVal('YoungPlayers', data);
        $('#user-team-squad>a')[0].click(); //reload current page
    });

},'#players-table-youngs-history',[
    [
        'main',
        function(){ //Yeni gelen genç oyuncuların geliş tarihlerini bulma
            if(typeof Tool.news.youngPlayer!='object') return !1;

            let yData=Tool.news.youngPlayer; //{"title":'Jugendspieler',"beforeName":"diesen ","afterName":" mal"}
            GetMessagesByTitle(yData.title,(messages)=>{
                let YoungPlayers = Tool.getVal('YoungPlayers',{MessageBox:{}, show:[]}); //Structure: http://prntscr.com/ucg9s3
                if(typeof YoungPlayers.MessageBox != 'object') YoungPlayers.MessageBox = {};
                if(!Array.isArray(YoungPlayers.show)) YoungPlayers.show = [];

                let MessageBox = YoungPlayers.MessageBox,
                    show = YoungPlayers.show,
                    update = 0;

                messages.forEach(message=>{ //message=> element : $('#newscenter-preview-'+id)
                    let html = message.html().trim(),
                        start = html.indexOf(yData.beforeName)+yData.beforeName.length,
                        end = html.indexOf(yData.afterName, start),
                        playerName = html.substring(start, end).trim(),
                        date = message.closest('tr').find('.last-column').text().trim(); //format: 29.08.2021 - dd.mm.Y

                    //update content
                    message.html(html.substring(0,start)+`<font style="cursor:default;" title="${yData.title}" color="#89f4ff">${playerName}</font>`+html.substring(end));

                    if(
                        !MessageBox.hasOwnProperty(playerName) && //MessageBox'a kayıtlı olmamış olacak
                        undefined==show.find(p=> p.name==playerName && p.date==date) //show'a aynı isim ve tarihte kaydedilmiş genç futbolcu olmayacak
                    ){
                        MessageBox[playerName] = date; //Yeni gelen gencin hangi tarihte geldiğinin kaydı alınıyor
                        update++;
                    }
                });

                if(update) Tool.setVal('YoungPlayers', YoungPlayers);
            });
        }
    ],
    [
        'squad',
        function(){
            let tbody = $('#players-table-overview-club >tbody');
            if(!tbody.find('>tr .open-card:first').length) return !1;

            //Datas
            let YoungPlayers = Tool.getVal('YoungPlayers',{MessageBox:{}, show:[]}); //Structure: http://prntscr.com/ucg9s3
            if(typeof YoungPlayers.MessageBox != 'object') YoungPlayers.MessageBox = {};
            if(!Array.isArray(YoungPlayers.show)) YoungPlayers.show = [];

            //Veriables
            let MessageBox = YoungPlayers.MessageBox,
                show = YoungPlayers.show,
                update = 0;

            tbody.find('>tr').each(function(){
                let strength = parseInt($('>td:nth-child(4)', this).attr('sortvalue'));
                if(!IsYoungPlayer($('>td:nth-child(12)', this)) || 90<=strength) return; // limited by strength: https://forum.fussballcup.de/showthread.php?t=417372&page=22#post7485413

                let id = $('.open-card', this).attr('pid').split('-').slice(-1)[0],
                    name = $('.player-name', this).text().trim(), //Format: lastNames, firstNames
                    found = !1;

                for(let i=0; i<show.length; i++){
                    if(id == show[i].id){
                        found = !0;
                        if(show[i].hasOwnProperty('date_') && MessageBox.hasOwnProperty(name)){
                            show[i].date = MessageBox[name];
                            delete MessageBox[name];
                            delete show[i].date_;
                            ++update;
                        }
                        break;
                    }
                }

                if(!found){ //New young is detected!
                    let endJuniorDate = new Date(new Date(2021, 10, 21).getTime() + (parseInt($('>td[sortvalue]:last', this).attr('sortvalue')) - 21637442000)*1e3),
                        startJuniorDate = new Date(endJuniorDate.getTime() - 100*86400000),
                        now = Game.getTime(),
                        toDateString = date=> `${Pad2(date.getDate())}.${date.getMonth()+1}.${date.getFullYear()}`,
                        dateStrToTime = d/*29.08.2021*/=> {
                            d = d.split('.').reverse();
                            d[1] = parseInt(d[1]) - 1;
                            return new Date(...d).getTime();
                        };

                    let ageWhenCame = parseInt($('>td:nth-child(5)', this).text()),
                        pastDates = Tool.aging.pastDates,
                        len = pastDates.length,
                        counter = 0;
                    while(counter<len && Tool.aging.convert2Date(pastDates[counter]) > startJuniorDate){
                        --ageWhenCame;
                        ++counter;
                    }

                    let data = {
                        id, name, strength,
                        position : $('>td:nth-child(3)', this).text().trim(),
                        age      : ageWhenCame
                    };

                    if(MessageBox.hasOwnProperty(name)){
                        data.date = MessageBox[name];
                        delete MessageBox[name];
                    }
                    else data.date = toDateString(startJuniorDate);

                    let added = !1;
                    for(let i=0, l=show.length, d1=dateStrToTime(data.date); i<l; i++){
                        let d2 = dateStrToTime(show[i].date || show[i].date_);
                        if(d1<d2) continue;
                        show.splice(i, 0, data);
                        added = !0;
                        break;
                    }
                    if(!added) show.push(data);
                    ++update;
                }
            });
            if(update) Tool.setVal('YoungPlayers', YoungPlayers);
        }
    ]
]);

Tool.features.add('TrainingGroups', 'training', function(){
    if(Tool.getVal("TrainingGroups")==undefined) return !1;
    let data = Tool.getVal("TrainingGroups");
    $('#training >div.schedule >div.table-container >table >tbody >tr:has(>th:first)').each(function(i){
        let th = $('th:nth-child(2)', this).css({'textAlign': 'left', 'fontSize': '11px'}),
            groupId = i + 1;

        toolTipObj.data.showPlayersInGroups = GetText('NoInformation')+'!';
        if(data[groupId]!==undefined){
            let playersCount = data[groupId].length;
            if(playersCount){
                th.html(GetText('TrainingGroupInformation', {args:[`<strong groupId="${groupId}" style="color:green; font-size:12px; cursor:default;" tooltip="showPlayersInGroups">${playersCount}</strong>`]}));
                $('strong', th).mouseenter(function(){
                    let groups = Tool.getVal("TrainingGroups");
                    if(!$.isPlainObject(groups)){
                        toolTipObj.data.showPlayersInGroups = GetText('NoInformation')+'!';
                        return;
                    }
                    let groupId = $(this).attr('groupId');
                    if(!groups.hasOwnProperty(groupId)){
                        toolTipObj.data.showPlayersInGroups = GetText('NoRecord')+'!';
                        return;
                    }

                    let players = groups[groupId];
                    if(!players.length){
                        toolTipObj.data.showPlayersInGroups = GetText('NoPlayersInTheGroup');
                        return;
                    }

                    let positions = Tool.footballerPositions;
                    players.sort((a,b)=> positions.indexOf(a.position) - positions.indexOf(b.position));

                    toolTipObj.data.showPlayersInGroups =
                        `<span style="display:inline-block; border-bottom:1px solid white; font-weight:bold; color:turquoise; padding-bottom:1px; margin-bottom:3px;">${th.prev('th').text()}</span><br>`+
                        players.map(p=> `[${p.position}] ${p.name}`).join('<br>');
                });
            }
            else th.html(GetText('NoPlayersInTheGroup'));
        }
        else th.html(GetText('NoRecord'));
    });
},null,[
    'training->groups',
    function(){
        let data = {},
            groupLength = $('#players-table-skills >tbody').find('.select-box-container:first >select >option').length;
        for(let i=1 ; i<=groupLength ; i++) data[i] = [];

        $('#players-table-skills >tbody >tr').each(function(){
            data[$('.select-box-container:first >select',this).val()].push({
                name    : $('.player-name', this).text().trim(),
                position: $('>td:nth-child(3)', this).text().trim()
            });
        });
        Tool.setVal('TrainingGroups', data);
    }
]);

Tool.features.add('CampHistory','camp',function(){
    let imagesPos = [-641,-962,-214,-534,-748,-321,0,-107,-427,-854],
        data = Tool.getVal('CampHistory',[]),
        imageWidth = 160,
        imagesPerRow = 5;

    $(`<div id="allCamps" style="width:${Math.min($('#camp').width(), imagesPerRow*imageWidth)}px; margin:0 auto;">`).html(
        imagesPos.reduce((acc,i,idx)=>acc+(idx!=0 && idx%imagesPerRow==0?'<br>'.repeat(7):'')+`<div class="camp-${idx+1}"><div id="camps_${idx+1}" class="image" style="margin-right:4px; float: left; opacity: 0.2;"></div></div>`,'')
    ).appendTo('#camp');

    if(data.length){/*Show*/
        //Tablo oluşturuluyor.
        function dateFormat(a){
            let b = a.split('.');
            b = new Date(b[2],parseInt(b[1])-1,parseInt(b[0])+3);
            return a+' - ' + Pad2(b.getDate())+'.'+Pad2(b.getMonth()+1)+'.'+b.getFullYear();
        }

        let text =
            `<table id="lastCamps">`+
            `   <thead>`+
            `      <tr style="background:url();">`+
            `         <th colspan="7">${GetText('PreviouslyVisitedCamps')}</th>`+
            `      </tr>`+
            `      <tr>`+
            `         <th style="text-align:left;">${GetText('No')}</th>`+
            `         <th style="text-align:left;">${GetText('Camp')}</th>`+
            `         <th style="text-align:left;">${GetText('Country')}</th>`+
            `         <th style="text-align:left;">${GetText('Price')}</th>`+
            `         <th style="text-align:left;">${GetText('_Skills')}</th>`+
            `         <th style="text-align:left;">${GetText('Definition')}</th>`+
            `         <th style="text-align:left;">${GetText('Date')}</th>`+
            `      </tr>`+
            `   </thead>`+
            `   <tbody>`;

        for(let i = 0 ; i < data.length ;i++){
            let camp = data[i];
            $('#camps_'+camp.campNo).css('opacity',1)
            text+=
                `<tr>`+
                `   <td style="color:white;font-weight: bold;text-align:center;">${i+1}</td>`+
                `   <td width="160" style="text-align:left;">`+
                `      <h3 style="margin:0;">${camp.campName}</h3>`+
                `      <div class="image" style="display:none;margin: 1px auto 3px; background-position: 0 ${imagesPos[camp.campNo-1]}px;"></div>`+
                `   </td>`+
                `   <td width="100" style="text-align:left;">`+
                `      <img class="flag" name="__tooltip" tooltip="tt_${camp.country.img}" src="/static/images/countries/${camp.country.img}.gif" alt=""> ${camp.country.name}`+
                `   </td>`+
                `   <td width="80" style="text-align:left;">${camp.price}`+
                `      <span class="icon currency"></span>`+
                `   </td>`+
                `   <td style="text-align:left;">`;
            camp.skills.forEach(skill=>{ //eslint-disable-line no-loop-func
                text+=`<span style="margin-right:3px;" class="icon ${skill}" name="__tooltip" tooltip="tt_${skill}"></span>`;
            });
            text+=
                `   </td>`+
                `   <td style="white-space: pre-wrap;font-Size:10px;line-height: 1.5;text-align:left;">${camp.description}</td>`+
                `   <td>`+
                `      <img src="${Tool.sources.get('clock')}" alt="clock.png" style="margin:0 2px 1px 0;cursor:help;text-align:left;" title="${GetText('ServerDate', {tag:0})}" tool_tt="ServerDate">`+
                `      ${dateFormat(camp.date)}`+
                `   </td>`+
                `</tr>`;
        }
        text+=`</tbody><tfoot><tr></tr></tfoot></table>`;
        $('#allCamps').before(text);
        $('#lastCamps').find('.image').each(function(){
            let image = $(this);
            image.parent('td').mouseenter(function(){
                image.slideDown();
            }).mouseleave(function(){
                image.slideUp();
            });
        });
    }

    if(!$('#camp > div.list-container > ul > li.disabled').length && //Kamp ayarlama inaktif olmayacak.
       !$('#camp > div.list-container > ul > li > p.not-available').length //Kamplar kullanılmıyor olmayacak.
      ){/*Save*/
        //Kamplar açık ve gidilebiliyor!
        $('#camp > div.list-container > ul > li').each(function(){
            let parent = this,
                button = $('div.buttons > span > a',this);
            button.attr('href_',button.attr('href')).removeAttr('href').click(function(){
                $(this).off();
                let skills = $('ul > li',parent),
                    _skills = [];
                skills.each(function(){
                    _skills.push($('span',this).first().attr('class').replace('icon ',''));
                });
                let country = {name:'Berlin',img:'DEU'};
                country.name = $('p',parent).first().text().trim();
                var img = $('p > img',parent).first().attr('src');
                country.img = img.substring(img.lastIndexOf('/')+1,img.lastIndexOf('.'));
                //Yeni kampı en öne ekle!
                data.splice(0,0,{
                    campName   : $('h3',parent).first().text(),
                    campNo     : $(parent).attr('class').replace('camp-',''),
                    date       : $('span',this).first().text().trim().match(/(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})/g)[0],
                    skills     : _skills,
                    price      : $('span.currency-number',parent).text().trim(),
                    country    : country,
                    description: $('p.description',parent).text().trim(),
                });
                Tool.setVal('CampHistory',data);
                location.href = $(this).attr('href_');
            });
        });
    }
});

Tool.features.add('TransferDates','transfermarket',async function(){
    let LeagueData = Tool.getVal('LeagueData'), save = true;
    if(typeof LeagueData=='object' && (LeagueData.lastMatchDate+86400000)>Game.getTime()) save = false;

    if(save){
        let content = await Game.getPage('?w='+worldId+'&area=user&module=statistics&action=games','#content');
        LeagueData = SaveLeagueData(content);
        if(LeagueData==false) return false;
    }

    let aDay = 24*60*60*1e3,
        timeToMs = (t)=> ((t.h*60+t.m)*60+t.s)*1e3,
        fComingTime = timeToMs({h:6, m:0, s:0}),
        tmChangingTime = timeToMs({h:0, m:0, s:0}),
        firstMatchDate = LeagueData.firstMatchDate,
        firstHalfFinalMatchDate= LeagueData.firstHalfFinalMatchDate,
        lastMatchDate= LeagueData.lastMatchDate,
        now = Game.getTime(),
        footballerComing = null,
        tmDateChanging = null;

    if((firstMatchDate-1*aDay+fComingTime)>now)/*Alınan Oyuncu Bir Sonraki Gün Gelecek*/
        footballerComing = new Date(new Date(now).getFullYear(),new Date(now).getMonth(),new Date(now).getDate()+1).getTime()+fComingTime;
    else if((firstHalfFinalMatchDate+fComingTime)>now)/*Alınan Oyuncular Lig Arasında Gelecek*/
        footballerComing = firstHalfFinalMatchDate+aDay+fComingTime;
    else footballerComing = lastMatchDate+aDay+fComingTime; /*Alınan Oyuncu Lig Sonunda Gelecek*/

    if((firstMatchDate-1*aDay+tmChangingTime)>now)/*Transfer Tarihinin Değişeceği Tarih*/
        tmDateChanging = firstMatchDate-1*aDay+tmChangingTime;
    else if((firstHalfFinalMatchDate+tmChangingTime)>now)/*Transfer Tarihinin Değişeceği Tarih*/
        tmDateChanging = firstHalfFinalMatchDate+tmChangingTime;

    let header = $('#content > h2:first'),
        h_content = header.html() +
        GetText('FootballersAreComing')+' : '+
        `<label class="cntDwnTrnsfMrkt" style="color:#17fc17;" intervalName="footballerComing" title="${GetDateText(footballerComing)}" finish="${footballerComing}"></label>`;
    if(tmDateChanging!=null){
        h_content+='             '+
            GetText('TransferDateWillChange')+' : '+
            `<label class="cntDwnTrnsfMrkt" style="color:orange;" intervalName="tmDateChanging" title="${GetDateText(tmDateChanging)}" finish="${tmDateChanging}"></label>`;
    }
    header.html(h_content);
    $('.cntDwnTrnsfMrkt').each(function(){
        let t = $(this);
        t.removeClass('cntDwnTrnsfMrkt');
        Tool.intervals.create(function(){
            let sec = parseInt((parseInt(t.attr('finish'))-Game.getTime())/1000);
            if(sec<1){
                this.delete();
                t.html(GetText('ItIsOver'));
                return;
            }
            t.html(SecToTime(sec));
        },1000,t.attr('intervalName'));
        t.removeAttr('intervalName');
    });
},null,[
    'fixture',
    function(){
        if($('#content').find('.date-selector').length){
            let LeagueData = Tool.getVal('LeagueData'), save = true;
            if(typeof LeagueData=='object' && (LeagueData.lastMatchDate+86400000)>Game.getTime()) save = false;
            if(save) SaveLeagueData($('#content'));
        }
    }
]);
Tool.features.add('GoOffer', ['main', 'transfermarket'], function(){
    if(Game.currentPage.name == 'main'){
        if(typeof Tool.news != 'object') return !1;
        let iData = Tool.news.increaseBid;// {"title":"Transfermarkt","control":"überboten","beforeName":"für ","afterName":" wurde"}
        let rData = Tool.news.rejectedBid;// {"title":"Transfermarkt", "control":"abgelehnt.", "beforeName":"für", "afterName":"abgelehnt"}
        let aData = Tool.news.acceptedBid;// {"title":"Transfermarkt", "control":"angenommen.", "beforeName":"Ablöseangebot für", "afterName":"angenommen."}
        if(typeof iData!='object' && typeof rData!='object' && typeof rData!="object") return !1;

        if(typeof iData=='object')
            GetMessagesByTitle(iData.title, messages=>{
                messages.forEach(message=>{
                    let text = message.text().trim();
                    if(text.indexOf(iData.control) == -1) return;

                    message.closest('tr').click(function(){
                        let max = 50;
                        Tool.intervals.create(function(){
                            let m = $('#readmessage-home');
                            if(!m.length){
                                if(--max<1) this.delete();
                                return;
                            }
                            this.delete();

                            let a = m.clone();
                            a.find('a').remove();
                            let playerName = a.text().trim(),
                                start = playerName.indexOf(iData.beforeName)+iData.beforeName.length,
                                end = playerName.indexOf(iData.afterName,start);
                            playerName = playerName.substring(start,end).trim();
                            m.html(m.html().replace(playerName, `<font style="cursor:default;" color="#89f4ff">${playerName}</font>`));
                            a = m.find('a:last').click(function(){
                                Tool.setVal('goOffer', {playerName, process:'increaseBid'});
                            });
                        }, 50, 'OpeningNew'+message.attr('id').split('-').slice(-1)[0]);
                    });
                });
            });

        if(typeof rData=='object')
            GetMessagesByTitle(rData.title, messages=>{
                messages.forEach(message=>{
                    let text = message.text().trim()
                    if(!text.endsWith(rData.control)) return;

                    message.closest('tr').click(function(){
                        let max = 50;
                        Tool.intervals.create(function(){
                            let m = $('#readmessage-home');
                            if(!m.length){
                                if(--max<1) this.delete();
                                return;
                            }
                            this.delete();

                            let h = m.html(),
                                e = h.lastIndexOf(rData.afterName),
                                s = h.lastIndexOf(rData.beforeName, e);
                            if(s==-1 || e==-1) return;
                            s += rData.beforeName.length;

                            let playerName = h.substring(s, e).trim();
                            m.html(h.substring(0, s) + `<font style="cursor:default;" color="#89f4ff">${playerName}</font> ` + h.substring(e))
                                .append(` <a href="#/index.php?w=${worldId}&area=user&module=transfermarket&action=index">Transfermarkt</a>.`)
                                .find('>a:last').click(function(){
                                let a = $(this).parent().find('>a:first');
                                let clubId = a.attr('clubid'),
                                    clubName = a.text().trim();
                                Tool.setVal('goOffer', {playerName, clubId, clubName, process:'rejectedBid'});
                            });

                        }, 50, 'OpeningNew'+message.attr('id').split('-').slice(-1)[0]);
                    });
                });
            });

        if(typeof aData=='object')
            GetMessagesByTitle(aData.title, messages=>{
                messages.forEach(message=>{
                    let text = message.text().trim()
                    if(text.indexOf(aData.control) == -1) return;

                    message.closest('tr').click(function(){
                        let max = 50;
                        Tool.intervals.create(function(){
                            let m = $('#readmessage-home');
                            if(!m.length){
                                if(--max<1) this.delete();
                                return;
                            }
                            this.delete();

                            let h = m.html(),
                                e = h.lastIndexOf(aData.afterName),
                                s = h.lastIndexOf(aData.beforeName, e);
                            if(s==-1 || e==-1) return;
                            s += aData.beforeName.length;

                            let playerName = h.substring(s, e).trim();
                            m.html(h.substring(0, s) + `<font style="cursor:default;" color="#89f4ff">${playerName}</font> ` + h.substring(e))
                                .append(` <a href="#/index.php?w=${worldId}&area=user&module=transfermarket&action=index">Transfermarkt</a>.`)
                                .find('>a:last').click(function(){
                                let a = $(this).parent().find('>a:first');
                                let clubId = a.attr('clubid'),
                                    clubName = a.text().trim();
                                Tool.setVal('goOffer', {playerName, clubId, clubName, process:'acceptedBid'});
                            });

                        }, 50, 'OpeningNew'+message.attr('id').split('-').slice(-1)[0]);
                    });
                });
            });
    }
    else{
        let data = Tool.getVal('goOffer');
        if(typeof data != 'object') return;

        let row, step;
        switch(data.process){
            case 'increaseBid': case 'rejectedBid':
                step = data.step;
                if(!step){
                    row = findOwnBidRow($('#own-offers >tbody'), data.playerName, data.clubId);
                    if(!row){
                        if(data.process == "increaseBid") Game.giveNotification(!1, GetText('bidIncreasedPlayerNotFound'));
                        Tool.delVal('goOffer');
                        return;
                    }
                    row = $(row);
                    data.clubName = row.find('td.name-column').last().attr('sortvalue');
                    openClubMarket(data.clubName);
                }
                else if(step == 'clubMarket'){
                    if($('#club').val()!=data.clubName){
                        Tool.delVal('goOffer');
                        return;
                    }
                    row = findOwnBidRow($('#content >div.container.transfermarket >div.table-container >table >tbody'), data.playerName);
                    if(!row){
                        Tool.delVal('goOffer');
                        return;
                    }
                    row = $(row);
                    focusToRow(row);
                    Tool.delVal('goOffer');
                }
                else Tool.delVal('goOffer');
                break;
            case 'acceptedBid':
                row = findOwnBidRow($('#own-offers >tbody'), data.playerName, data.clubId);
                if(!row){
                    Tool.delVal('goOffer');
                    return;
                }
                row = $(row);
                focusToRow(row);
                Tool.delVal('goOffer');
                break;
            default:
                Tool.delVal('goOffer');
                break;
        }

        function openClubMarket(clubName){
            $('#age_min').val(16);
            $('#age_max').val(34);
            $('#searchform >ul >li.strength >span:nth-child(2) >input[type="text"]').val(0).parent().next().val(999);
            $('#positions').val(0);
            $('#club').val(clubName);
            Tool.setVal('goOffer', Object.assign(data, {'step':'clubMarket'}));
            $('#searchform >ul >li.transfermarket-search-button >span >a >span').click();
        }

        function findOwnBidRow(tbody, playerName, clubId=null){
            if(!tbody.find('.open-card:first').length) return null;
            return tbody.find('>tr').toArray().find(row=>{
                row = $(row);
                if(playerName != row.find('.name-column').first().text().trim() && (clubId==null || row.find('a[clubid]:first').attr('clubid') != clubId)) return !1;
                return !0;
            });
        }

        function focusToRow(row){
            let pageHeight = $(window).height();
            $('html').animate({ scrollTop: GetOffset(row[0]).top-pageHeight/2 }, 'fast');
            setTimeout(()=>{
                let style = {'background-color':'#fff2ac', 'background-image':'linear-gradient(to right, #ffe359 0%, #fff2ac 100%)'},
                    oldStyle = Object.fromEntries(Object.entries(style).map(s=>{s[1]=row.css(s[0]); return s;}));
                row.css(style);
                setTimeout(()=>{row.css(oldStyle);},2000);
            },200);
        }
    }
});
Tool.features.add('ShowBoughtPlayers','transfermarket',function(){
    //Sattığımız oyunculara gelen teklifleri kabul edersek veya reddedersek PlayersData.AcceptedOffers güncellenmeli
    let updated = 0,
        data = Tool.getVal('PlayersData',{}); //Structure: http://prntscr.com/uc2p4v
    if(typeof data.AcceptedOffers != 'object') data.AcceptedOffers = {};
    let AcceptedOffers = data.AcceptedOffers;

    $('#foreigner-offers >tbody >tr').each(function(){ //Sattığımız oyunculara gelen teklifleri kontrol et
        let accept_button = $(this).find('a.button[href*="do=accept"]');
        if(accept_button.length){ //accept the bid
            accept_button.attr('_href', $(this).find('.button:first >a')[0].href)
                .removeAttr('href')
                .css('cursor','pointer')
                .click(function(){
                $(this).off();
                let data = Tool.getVal('PlayersData',{});
                if(typeof data.AcceptedOffers != 'object') data.AcceptedOffers = {};
                let AcceptedOffers = data.AcceptedOffers,
                    tr = $(this).closest('tr'),
                    playerId = tr.find('.open-card').attr('pid').split('-')[1],
                    a_club = $(`>td.name-column >a[clubid]:not([clubid="${Tool.clubId}"])`,tr).first(),
                    clubId = a_club.attr('clubid');

                if(!AcceptedOffers.hasOwnProperty(playerId)){
                    AcceptedOffers[playerId] = {
                        playerName: tr.find('.player-name').text().trim(),
                        offers:{} //Accepted offers
                    };
                }
                AcceptedOffers[playerId].offers[clubId] = {
                    clubName: a_club.text().trim(),
                    price   : tr.find('.currency-container').last().parent().attr('sortvalue').split('.').join(''),
                    date    : GetDateText(Game.getTime())
                };
                Tool.setVal('PlayersData',data);
                $(this).attr('href',$(this).attr('_href')).click();
            });
        }
        else if($(this).find('>td.last-column a[href*="do=dismissOfferAcceptance"]').length){
            //Oyuncuya gelen teklif daha önceden kabul edilmiş. Eğer verilerde kayıtlı değilse kaydedilecek.
            let a_club = $(`>td.name-column >a[clubid]:not([clubid="${Tool.clubId}"])`,this).first(),
                clubId = a_club.attr('clubid'),
                playerId = $(this).find('.open-card').attr('pid').split('-')[1];

            if(AcceptedOffers.hasOwnProperty(playerId)){
                if(AcceptedOffers[playerId].offers.hasOwnProperty(clubId)) return; //continue
            }
            else{
                AcceptedOffers[playerId] = {
                    playerName: $(this).find('.player-name').text().trim(),
                    offers:{}
                };
            }
            AcceptedOffers[playerId].offers[clubId] = {
                clubName : a_club.text().trim(),
                price    : $(this).find('.currency-container').last().parent().attr('sortvalue').split('.').join(''),
                date     : '-'
            };
            ++updated;
        }
    });

    //Teklifi iptal etmek için butona basıyoruz
    if(Game.link.pr.do=="dismissOfferAcceptance" && ['playerid','clubid'].every(k=>Game.link.pr.hasOwnProperty(k))){
        let playerId = Game.link.pr.playerid,
            clubId = Game.link.pr.clubid,
            offerStillExist = undefined != $('#foreigner-offers >tbody >tr .open-card').toArray().find(e=>{
                return $(e).attr('pid').split('-')[1] == playerId && $(e).closest('tr').find('>td.name-column:last >a').attr('clubid') == clubId;
            });
        if(!offerStillExist){ //Teklif silindi
            if(AcceptedOffers.hasOwnProperty(playerId)){
                let playerData = AcceptedOffers[playerId];
                if(playerData.offers.hasOwnProperty(clubId)){
                    delete playerData.offers[clubId];
                    if($.isEmptyObject(playerData.offers)) delete AcceptedOffers[playerId];
                    ++updated;
                }
            }
        }
    }
    if(updated) Tool.setVal('PlayersData',data);


    //Satın aldığımız oyuncuların listelenmesi. PlayersData.BuyPlayers verisi kullanarak
    if(!Array.isArray(data.BuyPlayers)) data.BuyPlayers = [];
    start(data.BuyPlayers);

    function start(BoughtPlayers){
        if(!BoughtPlayers.length){
            UploadPlayersData();
            return;
        }

        $('#own-offers').after(
            `<h3>${GetText('ListofPurchasedFootballers')}</h3>`+
            `<table id="purchased-players" class="sortable-table sortable">`+
            `   <thead>`+
            `      <tr class="">`+
            `         <th class="nosort">${GetText('Country')}</th>`+
            `         <th class="name-column sortcol">${GetText('Name')}<span class="sort-status"></span></th>`+
            `         <th class="sortcol">${GetText('SortPosition')}<span class="sort-status"></span></th>`+
            `         <th class="sortcol" name="__tooltip" tooltip="tt_strength"> Ø <span class="sort-status"></span></th>`+
            `         <th class="sortcol">${GetText('Age')}<span class="sort-status"></span></th>`+
            `         <th class="sortcol">${GetText('Salary')}<span class="sort-status"></span></th>`+
            `         <th class="sortcol">${GetText('Price')}<span class="sort-status"></span></th>`+
            `         <th class="nosort">${GetText('Contract')}</th>`+
            `         <th class="sortcol">${GetText('Club')}<span class="sort-status"></span> </th>`+
            `         <th class="sortcol">${GetText('Date')}<span class="sort-status"></span></th>`+
            `         <th class="nosort">${GetText('Delete')}</th>`+
            `      </tr>`+
            `   </thead>`+
            `   <tbody></tbody>`+
            `   <tfoot>`+
            `      <tr class="even">`+
            `         <td class="last-column" colspan="9"></td>`+
            `      </tr>`+
            `   </tfoot>`+
            `</table>`
        );
        let h3=$('#purchased-players').prev();
        $(`<img style="float:right;cursor:pointer;margin-Right:5px;" src="${Tool.sources.get('download')}" alt="download.png" width="15px" height="15px" title="${GetText('Download', {tag:0})}" tool_tt="Download">`)
            .appendTo(h3)
            .click(function(){ DownloadAsTextFile(JSON.stringify(BoughtPlayers,null,'\t'), "Bought Players Datas"); });

        $(`<img style="margin-Right:7px;float:right;cursor:pointer" src="${Tool.sources.get('remove2')}" alt="remove2.png" width="15px" height="15px" title="${GetText('Delete', {tag:0})}" tool_tt="Delete">`)
            .appendTo(h3)
            .click(function(){
            if(confirm(GetText('Warning', {tag:0}))){
                let table = $('#purchased-players');
                table.prev().remove();
                table.remove();
                let data = Tool.getVal('PlayersData');
                delete data.BuyPlayers;
                Tool.setVal('PlayersData',data);
                UploadPlayersData();
            }
        });
        h3=undefined;

        let tbody = $('#purchased-players >tbody');
        BoughtPlayers.forEach((a,i)=>{
            tbody.append(
                `<tr>`+
                `   <td>`+
                `      <img name="__tooltip" tooltip="tt_${a.playerCountry}" src="/static/images/countries/${a.playerCountry}.gif">`+
                `   </td>`+
                `   <td style="white-space:pre-wrap; line-height:1.5; width:25%; max-width:30%; text-align:left;">`+
                `      <span pid="player-${a.playerId}" class="icon details open-card"></span>`+
                `      <span class="player-name">${a.playerName}</span>`+
                `   </td>`+
                `   <td>${a.position}</td>`+
                `   <td>${a.strength}</td>`+
                `   <td>${a.age}</td>`+
                `   <td sortvalue="${a.salary}">${a.salary.toLocaleString()}<span class="icon currency"></span></td>`+
                `   <td sortvalue="${a.price}">${a.price.toLocaleString()}<span class="icon currency"></span></td>`+
                `   <td>${a.season+' '+(a.season==1?GetText("Season"):GetText("Seasons"))}</td>`+
                `   <td style="text-align:left; white-space:pre-wrap; line-height:1.5; width:17%; max-width:20%;" sortvalue="${a.club.name}">`+
                `      <a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${a.club.id}" clubid="${a.club.id}">${a.club.name}</a>`+
                `   </td>`+
                `   <td>${a.date}</td>`+
                `   <td class="last-column">`+
                `      <img class="DeletePurchasedPlayerData" playerid="${a.playerId}" src="${Tool.sources.get('remove3')}" alt="remove3.png" heigth="15px" width="15px" style="cursor:pointer">`+
                `   </td>`+
                `</tr>`
            );
        });
        unsafeWindow.jQuery('#purchased-players').jqTableKit({
            'rowEvenClass' : 'odd',
            'rowOddClass' : 'even'
        });

        tbody.find('.DeletePurchasedPlayerData').click(function(){
            let playerId = $(this).attr('playerid'),
                data = Tool.getVal('PlayersData',{});
            BoughtPlayers = data.BuyPlayers; //Structure: http://prntscr.com/uc2p4v
            let idx = BoughtPlayers.findIndex(p=>p.playerId==playerId);
            if(idx==-1) return;
            BoughtPlayers.splice(idx,1);
            data.BuyPlayers = BoughtPlayers;
            Tool.setVal('PlayersData',data);

            let tr = $(this).closest('tr');
            tr.hide(400);
            setTimeout(function(){
                let i = tr.index();
                tr.remove();
                let table = $('#purchased-players'),
                    players = table.find('> tbody > tr');
                if(players.length){
                    for(; i < players.length ; i++)
                        players[i].className = i%2?"even":"odd";
                }
                else{
                    table.prev().remove();
                    table.remove();
                    UploadPlayersData();
                }
            },400);
        });


        //Show Profit
        let elements={p:[],n:[]};
        $('#foreigner-offers >tbody >tr').toArray().map(t=>{
            let td=$(t).find('>td:nth-child(8)'), offer;
            if(!td[0].hasAttribute('sortvalue') || isNaN(offer = parseInt(td.attr('sortvalue')))) return false;
            let id = $(t).find('.open-card').attr('pid').split('-')[1],
                data = BoughtPlayers.find(p=>p.playerId==id);
            if(data === undefined) return false;
            return {
                offer: offer,
                price: data.price,
                e    : $(t).find('>td .currency-number').last()
            };
        }).filter(o=>o!==false).forEach(o=>{
            let price = o.price,
                profit = o.offer - price,
                title_key = profit<0?GetText('Loss', {tag:0}):GetText('Gain', {tag:0});
            o.e.css('color',profit>0?'#20ff63':profit==0?"white":"#a10c00").after(
                `<span title="${title_key} : ${profit.toLocaleString()} €" tool_tt="${title_key}_{X} : ${profit.toLocaleString()} €" style="font-weight:bold; color:#42ead4; display:none; vertical-align:top;">${price.toLocaleString()}</span>`
            );
            elements.p.push(o.e);
            elements.n.push(...[o.e.parent(),o.e.next()]);
        });

        $(elements.p).map($.fn.toArray).mouseenter(function(){
            $(this).hide().next().show();
        });
        $(elements.n).map($.fn.toArray).mouseleave(function(){
            ($(this).hasClass('currency-container')?$('>span:nth-child(2)',this):$(this)).hide().prev().show();
        });
        elements=null;
    }
    function UploadPlayersData(){
        if($('#UploadPlayerData').length) return;

        $('#own-offers').after(
            `<div align="center">`+
            `   <label style="color:#a5e4c6; font-weight:bold;">${GetText('UploadPlayersData')} : </label>`+
            `   <input id="UploadPlayerData" type="file" accept="text/plain">`+
            `</div>`
        ).next().find('>#UploadPlayerData').change(function(e){
            let that = $(this),
                file = this.files[0];
            if(file.type == 'text/plain'){
                let reader = new FileReader();
                reader.onload = function(){
                    let PlayersData = JSON.parse(reader.result),
                        data = Tool.getVal('PlayersData');
                    data.BuyPlayers = PlayersData;
                    Tool.setVal('PlayersData',data);
                    that.parent().remove();
                    start(PlayersData);
                };
                reader.readAsText(file);
            }
            else Game.giveNotification(!1, GetText('ChooseNotebook'));
        });
    }
},null,[
    [
        'main',
        function(){
            //Sattığımız oyuncudan ne kadar kazanç sağladığımızı gösterebilmek için
            if(typeof Tool.news.sellPlayer=='object'){ //{"title":"Assistent: Transfermarkt","control":"ausgehandelt","beforeName":"Spieler ","afterName":" hat"}
                let sData=Tool.news.sellPlayer,
                    PlayersData = Tool.getVal('PlayersData'); //Structure: http://prntscr.com/uc2p4v
                if(PlayersData){
                    GetMessagesByTitle(sData.title,(messages)=>{
                        if(typeof PlayersData.SellPlayers != 'object') PlayersData.SellPlayers = {};
                        let SellPlayers = PlayersData.SellPlayers;

                        let html,message,updated=0;
                        for(let i=0; i<messages.length ; i++){
                            message = messages[i]; // $ element
                            html = message.html().trim();

                            if(html.indexOf(sData.control)==-1) continue;

                            let start = html.indexOf(sData.beforeName)+sData.beforeName.length,
                                end = html.indexOf(sData.afterName,start),
                                a = message.find('a');

                            if(start==-1 || end==-1 || a.length==0) continue;
                            a = a.first();

                            let playerName = html.substring(start,end).trim(),
                                club = {
                                    id   : a.attr('clubid'),
                                    name : a.text().trim()
                                };

                            message.html(html.substring(0,start)+`<font style="cursor:default;" color="#89f4ff">${playerName}</font>`+html.substring(end));

                            if(SellPlayers.hasOwnProperty(playerName)){
                                ShowLabels(message,SellPlayers[playerName].price,SellPlayers[playerName].purchase);
                                continue;
                            }

                            let AcceptedOffers = PlayersData.AcceptedOffers,
                                foundPlayers = [];
                            for(let playerId in AcceptedOffers){
                                let playerData = AcceptedOffers[playerId],
                                    playerName_ = playerData.playerName;
                                if(playerName_.split(',').reverse().join(' ').trim() == playerName){
                                    let offers = playerData.offers;
                                    for(let clubId in offers){
                                        if(clubId == club.id){
                                            playerData.playerId = playerId;
                                            playerData.clubId = clubId;
                                            foundPlayers.push(playerData);
                                            break;
                                        }
                                    }
                                }
                            }

                            if(foundPlayers.length != 1) continue;

                            let playerData = foundPlayers[0],
                                offer = playerData.offers[playerData.clubId];

                            SellPlayers[playerName] = {
                                playerName : playerData.playerName,
                                playerId   : playerData.playerId,
                                clubId     : playerData.clubId,
                                clubName   : offer.clubName,
                                price      : offer.price,
                                date       : message.closest('tr').find('>td.last-column').text().trim(),
                                purchase   : !1
                            };
                            delete AcceptedOffers[playerData.playerId];
                            ++updated;

                            if(!Array.isArray(PlayersData.BuyPlayers)) PlayersData.BuyPlayers = [];
                            let BuyPlayers = PlayersData.BuyPlayers,
                                purchase=!1;

                            for(let i = 0 ; i < BuyPlayers.length ; i++){
                                if(BuyPlayers[i].playerId == playerData.playerId){
                                    SellPlayers[playerName].purchase = purchase = BuyPlayers[i].price;
                                    break;
                                }
                            }
                            ShowLabels(message,offer.price,purchase);
                        }
                        if(updated) Tool.setVal('PlayersData',PlayersData);

                        function ShowLabels(e,sale,purchase=!1){
                            let text = `<p style="text-align:center; font-weight:bold; margin-top:10px;">`;
                            if(purchase!=!1)
                                text+=`<label style="color:#a11717; font-family:'comic sans'; font-size:15px;">${GetText('PurchasePrice')}: ${parseInt(purchase).toLocaleString()}<span class="icon currency"></span></label>`;
                            if(sale)
                                text+=`<label style="color:blue; font-family:'comic sans\; font-size:15px; margin:0 15px;">${GetText('SalePrice')}: ${parseInt(sale).toLocaleString()}<span class="icon currency"></span></label>`;
                            if(purchase!=!1){
                                let profit = parseInt(sale)-parseInt(purchase);
                                text+=`<label style="color:${profit>0?'green':(profit<0?'#9d2527; font-weight:bold':'white')}; font-family:'comic sans'; font-size: 15px;">${GetText('Profit')}: ${profit.toLocaleString()}<span class="icon currency"></span></label>`;
                            }
                            text+=`</p>`;
                            $(e).append(text)
                                .find('>p:last>label:not(:last)').css('margin-right', '10px')
                        }
                    });
                }
            }
        }
    ],
    [
        'squad',
        function(){
            if(Game.link.pr.tf!=undefined &&  Game.link.pr.section=='attributes'){
                let form = unsafeWindow.jQuery('#container >.focus [id^="tfd_"]:first');
                if(!form.length) return;

                let pId = form.attr('id').replace(/^tfd_/,'');
                let pData = (Tool.getVal('PlayersData').BuyPlayers || []).find(p=>p.playerId==pId);
                if(pData == undefined) return;
                pId = undefined;

                let price = pData.price; pData = undefined;
                let input = form.find('#amount-'); form=undefined;
                let minPrice = parseInt(input.val().replaceAll('.',''));
                if(minPrice>price){
                    input.parent().after(`<span style=" vertical-align: middle; color: blanchedalmond; margin-left: 6px; ">${GetText('purchasedPrice')} ${price.toLocaleString()}<span class="icon currency" style="margin-top: -2px; margin-left: -2px;"></span></span>`);
                    return;
                }

                let btn = $(CreateButton('', `${GetText('purchasedPrice')} ${price.toLocaleString()}<div class="icon currency" style="float: right; margin-top: -3px;"></div>`)).css({
                    'float': 'none',
                    'margin-top': '-1px',
                    'margin-left': '4px'
                });
                input.parent().after(btn);
                btn.click(function(){
                    input.val(price).trigger('keyup');
                });
                btn = undefined;
            }
        }
    ]
]);
Tool.features.add('ShowOwnOfferInMarket','transfermarket',function(){
    let players = $('#content >div.container.transfermarket >div.table-container >table >tbody');
    if(!players.find('.open-card').length) return !1;

    let OwnOffers = {};
    if($('#own-offers >tbody').find('.open-card').length){
        $('#own-offers >tbody >tr').each(function(){
            let row = $(this),
                OCard = row.find('.open-card'),
                playerId = OCard.attr('pid').split('-').slice(-1)[0],
                price = parseInt(row.find('>td:nth-child(8)').attr('sortvalue')),
                bidStatus = row.find('>td:nth-child(7)').text().trim();
            OwnOffers[playerId] = { price, bidStatus, row };
        });
    }

    players.find('>tr').each(function(i){
        let row = $(this), playerId = row.find('.open-card').attr('pid').split('-').slice(-1);
        if(!OwnOffers.hasOwnProperty(playerId)) return;
        let offerData = OwnOffers[playerId];

        addOwnOffer(row, playerId, offerData.bidStatus, offerData.price, offerData.row);
    });
    players = undefined;


    Tool.temp.newOffer = (row, playerId, price)=>{
        if(!row.length) return;
        let td = row.find('>td[id="transfermarket-highest-bid"]:first'),
            cn = td.find('.currency-number');
        if(!cn.length){
            td.html(
                `<span class="currency-container">`+
                `   <span class="currency-number" style="color: rgb(255, 255, 255);">${price.toLocaleString().replaceAll(',','.')}</span>`+
                `   <span class="icon currency"></span>`+
                `</span>`
            ).next().html(
                `(`+
                `<div class="club-logo-container">`+
                `   <img src="/avatars/${worldId}/squad/${Tool.clubId.split('').slice(0, -3).join('')}/${Tool.clubId}">`+
                `</div>`+
                `<a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${Tool.clubId}" clubid="${Tool.clubId}" class="self-link">${Tool.clubName}</a>`+
                `)`
            );
        }
        else if(price > parseInt(cn.text().replaceAll('.','')) || td.next().find('>a').hasClass('self-link')){
            cn.html(price.toLocaleString().replaceAll(',','.'));
            td.next().find('>a').attr({
                'href': `#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${Tool.clubId}`,
                'clubid': Tool.clubId
            }).html(Tool.clubName).addClass('self-link')
                .prev().find('>img').attr('src', `/avatars/${worldId}/squad/${Tool.clubId.split('').slice(0, -3).join('')}/${Tool.clubId}`);
        }

        let row2 = $(`#own-offers >tbody >tr:has(>td.name-column >span[pid="player-${playerId}"]):first`),
            bidStatus = Tool.bidTexts.new;
        if(row2.length){
            let now = new Date(Game.getTime());
            row2.find('>td:nth-child(7)').html(bidStatus)
                .next().attr('sortvalue', price)
                .find('.currency-number').html(price.toLocaleString().replaceAll(',','.'))
                .closest('td').next().attr('sortvalue', parseInt(now.getTime()/1000)).html($.datepicker.formatDate('dd.mm.yy', now)+' '+now.toLocaleTimeString('tr'));
            row2.appendTo(row2.parent());
        }
        else row2=undefined;

        addOwnOffer(row, playerId, bidStatus, price, row2);
    };
    function addOwnOffer(row, playerId, bidStatus, price, row2=undefined){
        let club = row.find('>td:nth-child(8) >a'),
            color,
            title = '';
        switch(bidStatus.toLowerCase()){
            case Tool.bidTexts.accept.toLowerCase():
                color = '#20ff63';
                title = GetText('AcceptedOwnOffer', {tag:0});
                break;
            case Tool.bidTexts.reject.toLowerCase():
                color = '#9e0e0e';
                title = GetText('RejectedOwnOffer', {tag:0});
                break;
            case Tool.bidTexts.read.toLowerCase():
                color = '#fcbd0f';
                title = GetText('ReadOwnOffer', {tag:0});
                break;
            default: // Tool.bidTexts.new
                color = '#ffffff82';
                title = GetText('NewOwnOffer', {tag:0});
                break;
        }
        let playerName = row.find('.player-name:first');
        if(club.length){
            if(club.hasClass('self-link')){
                row.find('.currency-number').first().css('color',color);
            }
            else if(bidStatus != Tool.bidTexts.reject){
                //Bu oyuncuya verdiğimiz geçilmiş fakat bizim teklifimiz reddedilmemiş ise
                showMyOffer(playerName, row.find('.currency-number:first') ,club, price, color);
                title += '\u000d'+GetText('PassedOwnOffer', {tag:0});
            }
        }
        playerName[0].style = `background-color:${color}; border-radius:7px; padding:1px 3px;`;
        playerName[0].title = title;

        if(row2) goToMyOffer(playerName, row2);
    };
    function goToMyOffer(playerName, row){
        playerName.click(function(){
            $('html').animate({ scrollTop: GetOffset(row[0]).top-$(window).height()/2 }, 'fast');

            let style = {'background-color':'#fff2ac', 'background-image':'linear-gradient(to right, #ffe359 0%, #fff2ac 100%)'},
                oldStyle = Object.fromEntries(Object.entries(style).map(s=>{s[1]=row.css(s[0]); return s;}));
            row.css(style);
            setTimeout(()=>{row.css(oldStyle);},2000);
        });
    }
    function showMyOffer(e1, e2, club, price, color){
        let temp = {
            price : e2.html(),
            clubId : club.attr('clubid'),
            clubName : club.text().trim()
        };
        e1.add(e2).mouseenter(function(){
            e2.html(`<font color:"${color}">${price.toLocaleString().replaceAll(',','.')}</font>`);
            club.attr('clubid',Tool.clubId);
            club.addClass('self-link');
            club.text(Tool.clubName);
        }).mouseleave(function(){
            e2.html(temp.price);
            club.attr('clubid',temp.clubId);
            club.removeClass('self-link');
            club.text(temp.clubName);
        });
    }
});
Tool.features.add('FilterOwnOffers','transfermarket',function(){
    if(!$('#own-offers > tbody').find('.open-card').length) return false;

    $('#own-offers').parent().before(
        `<div id="divFilterOwnOffers" style="text-align:center;">`+
        `   <label style="color:white; font-size:13px;" title="${new Date(Game.getTime()).toLocaleDateString()}">`+
        `      <input type="checkbox">`+
        `      `+GetText('TodayOffers')+
        `   </label>`+
        `   <label style="color:white; font-size:13px;">`+
        `      <input type="checkbox" style="margin-Left:20px;" checked>`+
        `      `+GetText('AcceptedOffers')+
        `   </label>`+
        `   <label style="color:white; font-size:13px;">`+
        `      <input type="checkbox" style="margin-Left:20px;" checked>`+
        `      `+GetText('ReadingOffers')+
        `   </label>`+
        `   <label style="color:white; font-size:13px;">`+
        `      <input type="checkbox" style="margin-Left:20px;" checked>`+
        `      `+GetText('RejectedOffers')+
        `   </label>`+
        `   <label style="color:white; font-size:13px;">`+
        `      <input type="checkbox" style="margin-Left:20px;" checked>`+
        `      `+GetText('NewOffers')+
        `   </label>`+
        `</div>`
    );
    $('#divFilterOwnOffers > label > input').click(function(){
        $('#divFilterOwnOffers > input').attr('disabled',true);
        let filter = {},
            today;
        {
            let now = new Date(Game.getTime());
            let nPad2 = n=>(n<10?"0":"")+n;
            today = `${nPad2(now.getDate())}.${nPad2(now.getMonth()+1)}.${now.getFullYear()}`;
        }
        $('#divFilterOwnOffers > label > input').each(function(i){
            filter[$(this).next().attr('k')]=this.checked;
        });
        let count = 0;
        $('#own-offers > tbody > tr').each(function(){
            let bidStatus = $(this).find('td:nth-child(7)').text().trim().toLowerCase(),
                date = $(this).find('td:nth-child(9)').text().trim(),
                show =
                (filter.AcceptedOffers && bidStatus==Tool.bidTexts.accept.toLowerCase()) ||
                (filter.ReadingOffers && bidStatus==Tool.bidTexts.read.toLowerCase()) ||
                (filter.RejectedOffers && bidStatus==Tool.bidTexts.reject.toLowerCase()) ||
                (filter.NewOffers && bidStatus==Tool.bidTexts.new.toLowerCase());
            show = show && filter.TodayOffers?date.indexOf(today)!=-1:show;
            if(show){
                $(this).attr('class',(count++)%2==0?"odd":"even");
                $(this).show();
            }
            else $(this).hide();
        });
        $('#divFilterOwnOffers > input').removeAttr('disabled');
    });
});
Tool.features.add('FilterTransferMarket','transfermarket',function(){
    let tbody;
    if($('#club').val()==Tool.clubName || (tbody=$('#content >div.container.transfermarket >div.table-container >table >tbody')).find('.open-card:first').length==0) return !1;

    if(!Tool.hasOwnProperty('transferMarket')){
        Tool.transferMarket = {
            clubs: {},
            values: {"ligaIndex":0,"checkBox":false}
        };
    }

    let players = tbody.find('>tr'),
        count = 0;
    tbody = undefined;

    $('#content').find('.search-container').first().after(
        `<div id="transferMarktMenu" style="clear:both; margin-left:18px; position:relative;">`+
        `   ${GetText('ShowOnlyOneLeague')} : `+
        `   <select id="select_lig" style="-webkit-border-radius:7px; margin-Left:10px; text-align-last:center;">`+
        `      <option value="0" selected="selected">${GetText('SelectLeague')}:</option>`+
        `      ${Tool.leagues.reduce((acc,league,idx)=>acc+`<option value="${idx+1}">${league}</option>`,'')}`+
        `   </select>`+
        `   <label style="display:none; vertical-align:middle;">`+
        `      <input id="only_one_lig" type="checkBox" style="margin-Left:10px;"></input>`+
        `      <label for="only_one_lig">${GetText('ShowOnlyOneLeague')}</label>`+
        `   </label>`+
        `   <p ${$('#positions').val()==0?'':`style="display:none;"`}>`+
        `      <input id="NoKeeperPlayers" type="checkBox" style="margin-left:0;">`+
        `      <label for="NoKeeperPlayers">${GetText('AllExceptGoalkeeper')}</label>`+
        `   </p>`+
        `</div>`
    );

    let myLeague = (Tool.getVal('LeagueData',{league:!1})).league;
    if(myLeague){
        let options = $('#select_lig > option');
        options.each(function(i){
            if($(this).text().toLowerCase()==myLeague.toLowerCase()){
                $(this).attr({'title': GetText('ownLeague', {tag:0}), 'tool_tt':"ownLeague"}).css({
                    'background-color':'#8c0505',
                    'color':'white'
                });
                for(let j=i-3;j>0;j--) $(options[j]).attr('title', GetText('lowerLeague', {tag:0})+'. '+GetText('playerBuyInfo1', {tag:0})).css('background-color','yellow');
                for(let j=i-1,c=0;j>0&&c<2;j--,c++) $(options[j]).attr({'title': GetText('lowerLeague', {tag:0}), 'tool_tt':'lowerLeague'}).css('background-color','orange');
                let len = $('#select_lig > option').length;
                for(let j=i+1,c=0;j<=len&&c<2;j++,c++) $(options[j]).attr({'title': GetText('upperLeague', {tag:0}), 'tool_tt':'upperLeague'}).css('background-color','#17fc17');
                for(let j=i+3;j<=len;j++) $(options[j]).attr('title', GetText('upperLeague', {tag:0})+'. '+GetText('playerBuyInfo2', {tag:0})).css('color','#808080').prop('disabled',true);
                return false;
            }
        });
    }

    $('#content > div.container.transfermarket > div.table-container > h3').after(
        `<p id="filterPlayerInformation" style="background-color:black; color:white; line-height:33px; text-align:center;"></p>`
    );

    unsafeWindow.$('#positions').change(function(){
        $('#NoKeeperPlayers').parent()[this.value=='0'?'slideDown':'slideUp']();
    });
    $('#NoKeeperPlayers').click(function(){
        Tool.transferMarket.values.NoKeeperPlayers = this.checked;
        if(this.checked && $('#positions').val()==0){
            players.each(function(){
                if($(this).css('display')!=='none'){
                    if(this.getElementsByTagName('td')[2].innerHTML === Tool.footballerPositions[0]){
                        $(this).hide();
                    }
                }
            });
        }
        else{
            if($('#only_one_lig')[0].checked){
                var lig = $('#select_lig')[0].options[$('#select_lig')[0].selectedIndex].textContent.trim();
                players.each(function(){
                    var clubId = this.getElementsByClassName('name-column')[1].getElementsByTagName('a')[0].getAttribute('clubid');
                    if(Tool.transferMarket.clubs[clubId].indexOf(lig)!==-1){
                        $(this).show();
                    }
                });
            }
            else{
                players.each(function(){
                    $(this).show();
                });
            }
        }
        showFilterInfo();
    });
    $('#select_lig').change(function(){
        Tool.transferMarket.values.ligaIndex= this.selectedIndex;
        if(this.value==0){
            $('#only_one_lig').parent().slideUp();
            $('#only_one_lig')[0].checked = false;
            Tool.transferMarket.values.checkBox = false;
            players.each(function(i){
                this.className = i%2===0?"odd":"even";
                $(this).show();
            });
        }
        else{
            $('#only_one_lig').parent().slideDown();
            if($('#only_one_lig')[0].checked){
                tablo_oku();
            }
        }
    });
    $('#only_one_lig').click(function(){
        Tool.transferMarket.values.checkBox = this.checked;
        if(this.checked){
            tablo_oku();
        }
        else{
            if($('#NoKeeperPlayers')[0].checked){
                var c = 0;
                players.each(function(i){
                    if(this.getElementsByTagName('td')[2].innerHTML !== Tool.footballerPositions[0]){
                        this.className = c%2===0?"odd":"even";
                        this.style.display='';
                        c++;
                    }
                });
            }
            else{
                players.each(function(i){
                    this.className = i%2===0?"odd":"even";
                    $(this).show();
                });
            }
            showFilterInfo();
        }
    });
    if(Tool.transferMarket.values.NoKeeperPlayers){
        if($('#positions').val()=='0')
            $('#NoKeeperPlayers').click();
        else{
            Tool.transferMarket.values.NoKeeperPlayers = !1;
            $('#NoKeeperPlayers')[0].checked = !1;
        }
    }
    if(Tool.transferMarket.values.ligaIndex!==0){
        document.getElementById('select_lig').selectedIndex = Tool.transferMarket.values.ligaIndex;
        $('#only_one_lig').parent().show();
        if(Tool.transferMarket.values.checkBox){
            $('#only_one_lig')[0].checked=true;
            tablo_oku();
        }
    }

    function tablo_oku(){
        $('#select_lig, #only_one_lig, #NoKeeperPlayers').prop('disabled', true);
        $('#only_one_lig').parent().hide()
            .parent().after(`<img id="LoadingTable" src="/designs/redesign/images/icons/loading/16x16.gif" style="margin-left:10px; vertical-align:middle;">`);
        count = 0;
        players.each(function(){
            var clubId = this.getElementsByClassName('name-column')[1].getElementsByTagName('a')[0].getAttribute('clubid');
            if(!Tool.transferMarket.clubs[clubId]){
                count++;
                kulüp_bilgileri_cek(clubId);
            }
        });
        if(count==0){
            tablo_göster();
        }
    }
    function kulüp_bilgileri_cek(clubId){
        $.get(`index.php?w=${worldId}&area=user&module=club&action=index&complex=0&id=${clubId}`, function(response){
            var a = $('<diV>'+response+'</div>').find('ul > li:first');
            a.find('strong').remove();
            var leuage = a.text().trim();
            Tool.transferMarket.clubs[clubId] = leuage;
            count--;
            if(count===0){
                tablo_göster();
            }
        });
    }
    function tablo_göster(){
        var kl_gösterme = Tool.transferMarket.values.NoKeeperPlayers && $('#positions').val()=="0"?true:false;
        var görüntülenecek_lig = document.getElementById('select_lig').options[document.getElementById('select_lig').selectedIndex].textContent;
        players.each(function(i){
            var clubId = this.getElementsByClassName('name-column')[1].getElementsByTagName('a')[0].getAttribute('clubid');
            var mevki = this.getElementsByTagName('td')[2].innerHTML;
            if(Tool.transferMarket.clubs[clubId].indexOf(görüntülenecek_lig)!==-1 && !(kl_gösterme && mevki===Tool.footballerPositions[0])){
                this.className = i%2==0?"odd":"even";
                $(this).show();
            }
            else{
                $(this).hide();
            }
        });
        $('#select_lig, #only_one_lig, #NoKeeperPlayers').prop('disabled', false);
        $('#LoadingTable').remove();
        $('#only_one_lig').parent().show();
        showFilterInfo();
    }
    function showFilterInfo(){
        var show = 0;
        players.each(function(){
            if($(this).css('display')!=='none'){
                show++;
            }
        });
        if(players.length !== show){
            $('#filterPlayerInformation').html(GetText('FilterPlayerInformation', {args:[players.length, show]}));
        }
        else{
            $('#filterPlayerInformation').html('');
        }
    }
});
Tool.features.add('FootballerAnalyzer', 'transfermarket', function(){
    let tbodies = $('#content >div.container.transfermarket >div.table-container >table >tbody, #own-offers >tbody');
    if(!tbodies.find('.open-card:first').length) return !1;

    let colors = ["#5E3278","#733A85","#894291","#9D4A9B","#A9539B","#B55C9A","#C06598","#C773AA","#CD81BA","#D38FC8","#D99ED5","#DEACDF","#E0BAE5","#E4C9EB"];
    tbodies.find('.open-card[pid]').click(function(){
        let openCard = $(this).off(),
            position = openCard.parent().next().text().trim(),
            TrainingSkills = Tool.trainingPlan[position];
        if(!Array.isArray(TrainingSkills)) return;

        let pid = openCard.attr('pid').split('-').pop(),
            max = 300;
        Tool.intervals.create(function(){
            if(openCard.hasClass('loading')){
                if(--max<1) this.delete();
                return;
            }
            this.delete();

            let lis = $('#info-player-'+pid).find('div.data.skills >ul >li');
            Tool.strengthFactors[position].forEach((sFactor)=>{
                let li = lis.eq(sFactor[0]),
                    val = parseFloat(li.text());
                li.attr('title', sFactor?`${GetText('strengthFactor', {tag:0})}${sFactor[1]} | ${GetText('contOfSkill2Power', {tag:0})}: ${(val*sFactor[1]/28).toFixed(2)}`: null);
            });

            TrainingSkills.forEach((index, i)=>{
                lis.eq(index).css('backgroundColor', colors[i]).append(`<label style="float:left;">${i+1}</label>`);
            });

        }, 50, 'OpenCard_'+pid);
    });
});

Tool.features.add('DownloadTable',['league','statistics','squadstrenght','goalgetter'],function(){
    let table = {'league':'statistics-league-table' ,'statistics':'season-league-table', 'squadstrenght':'squad-strengths', 'goalgetter':'goalgetters'}[Game.currentPage.name];
    if(table==null || (table=$('#'+table)).length==0) return !1;

    if(!table.find('>tbody >tr >td:eq(2)').length) return; //if tbody doesn't have at least 2 rows

    if(!$('#html2canvas').length)
        $('head').append(`<script id="html2canvas" type="text/javascript" src="https://html2canvas.hertzen.com/dist/html2canvas.min.js">`);

    $(`<img src="${Tool.sources.get('printscreen')}" alt="printscreen.png" height="30px" style="cursor:pointer;" title="${GetText('DownloadTable', {tag:0})}" tool_tt="DownloadTable">`)
        .appendTo(table.find('>tfoot >tr >td'))
        .mouseenter(function(){
        table.find('>tbody:first, >thead:first').addClass('animate-flicker');
        table.find('>thead >tr >th.sticky').css('position', 'static');
    })
        .mouseleave(function(){
        table.find('>tbody:first, >thead:first').removeClass('animate-flicker');
        table.find('>thead >tr >th.sticky').css('position', 'sticky');
    })
        .click(function(){
        $(this).hide().after(`<span class="load-icon loading" style="float:none; margin:0 auto;"></span>`);
        table.find('>tbody:first,>thead:first').removeClass('animate-flicker').css('opacity',1);
        let that = $(this);
        let opts = {
            height: table.height()-table.find('>tfoot:first').height(),
            useCORS: !0,
            logging: !1,
            backgroundColor:'#6E9A5A'
        };
        if(Game.currentPage.name == 'league' && Game.currentPage.features.getByName('LeagueStatus').work) opts = Object.assign(opts, {width:table.width()+10, x:-10});
        html2canvas( //eslint-disable-line no-undef
            table[0], opts
        ).then(function(canvas) {
            let fileName = {'league':'LeagueTable' ,'statistics':'MatchResultsTable', 'squadstrenght':'SquadStrengthTable', 'goalgetter':'GoalScorerTable'}[Game.currentPage.name];
            if(typeof fileName=='string') fileName= GetText(fileName, {tag:0});
            canvas.toBlob(function(blob){
                let object_URL = URL.createObjectURL(blob);
                $('<a>').attr({'href':object_URL, 'download':(fileName||'screenshot')+'.png'})[0].click();
                URL.revokeObjectURL(object_URL);
                that.show().next().remove();
            },'image/png');
        });
    });
});

Tool.features.add('CancelFriendlyMatchInvites','friendly',function(){
    let tbody = $('#away-invitations-table >tbody');
    if(tbody.find('.no-invites:first').length) return !1;

    //INPUTS
    let checkInvitesInReservedDay = !0,
        waitBetweenDeletingInvites = 5e2,
        disableDeletingAInvitePerADay = !1;

    //VARS
    let prev_index=undefined, cancelBtns,

        //Event Handlers
        SelectAllInvites = $(`<input id="SelectAllInvites" type="checkbox" class="checkbox_1">`),
        CancelInvites = $(CreateButton('CancelInvites', GetText('CancelSelectedInvites'), 'display:none; float:right;')),

        //Helpfull Functions
        getRowClubId = row=> row.find('>td.name-column >a[clubid]:first').attr('clubid'),
        getRowDateVal = row=> row.find('>td:nth-child(2)').attr('sortvalue'),
        getRowCancelInviteBtn = row=> row.find('>td:last-child .CancelInvite'),
        getSameClubInvites = clubId=> cancelBtns.filter(btn=> getRowClubId($(btn).closest('tr'))==clubId),
        convertBtnToRows = btns=> $(btns.map(btn=>$(btn).closest('tr')[0])),
        onlyOneInviteForTheDay = (row, dateVal)=> (!row.prev().length || getRowDateVal(row.prev())!=dateVal) && (!row.next().length || getRowDateVal(row.next())!=dateVal),
        deactiveBtnForDeleting = btn=> btn.attr('deactiveDeleting', 1).find('+label').css('background-color', 'gray');

    //SelectAllInvites
    tbody.parent().find('>thead >tr >th:last').append(SelectAllInvites).append(
        `<label for="SelectAllInvites" title="${GetText('selectAll', {tag:0})}" tool_tt="selectAll" style="line-height:20px; float:right; margin-top:2.5px;"></label>`
    );
    SelectAllInvites.click(function(){
        $(`#away-invitations-table >tbody .CancelInvite${this.checked?':not(:checked)':':checked'}`).prop('checked', this.checked);
        CancelInvites[this.checked?'slideDown':'slideUp']();
    });

    let reservedDays = $('#friendly-matches >tbody >tr').toArray().map(tr=> getRowDateVal($(tr)));
    cancelBtns = tbody.find('>tr').toArray().map((row, i)=>{
        row = $(row);
        let dateVal = getRowDateVal(row),
            a = row.find('>td:last-child .icon.delete').parent(),
            usp = new URLSearchParams(a.attr('href')),
            decline = usp.get('decline'),
            btn = $(`<input id="cancel_invite_${i}" class="CancelInvite checkbox_2" style="vertical-align:middle; margin:0;" type="checkbox" decline="${decline}">`);
        a.after(`<label for="cancel_invite_${i}" class="disHighlight" style="cursor:pointer;"></label>`).after(btn);
        a.remove();
        if(reservedDays.includes(dateVal)){ if(checkInvitesInReservedDay) btn.prop('checked', !0);}
        else if(disableDeletingAInvitePerADay && onlyOneInviteForTheDay(row) ) deactiveBtnForDeleting(btn);
        return btn[0];
    });
    reservedDays = checkInvitesInReservedDay = undefined;
    if(cancelBtns.find(btn=>btn.checked)) CancelInvites.show();

    // cancelBtns
    $(cancelBtns).click(function(e){
        let btn = $(this), checked = this.checked;
        if(checked && btn.attr('deactiveDeleting') && !e.ctrlKey){
            e.preventDefault();
            return;
        }

        let row = btn.closest('tr'),
            index = row.index();
        if(e.shiftKey && prev_index!=undefined){
            $(cancelBtns.slice(Math.min(prev_index,index), Math.max(prev_index,index)+1).filter(btn=> $(btn).attr('deactiveDeleting')!='1')).prop('checked', checked);
        }
        else if(e.ctrlKey){
            $(getSameClubInvites(getRowClubId(row))).prop('checked', checked);
        }
        prev_index = index;

        let checkedCount = cancelBtns.reduce((acc, btn)=>acc+btn.checked, 0),
            uncheckedCount = cancelBtns.length-checkedCount;
        CancelInvites[checkedCount?'slideDown':'slideUp']();
        if(!checked && SelectAllInvites.prop('checked')) SelectAllInvites.prop('checked',false);
        else if(
            checked
            && !SelectAllInvites.prop('checked')
            && !uncheckedCount
        ) SelectAllInvites.prop('checked',true);
    });
    $(cancelBtns).find('+label').mouseenter(function(e){
        if(e.ctrlKey){
            let btn = $(this),
                row = btn.closest('tr');
            $(convertBtnToRows(getSameClubInvites(getRowClubId(row)))).css('background-color', 'rgb(255, 0, 0)');
        }
    }).mouseleave(function(){
        $(convertBtnToRows(cancelBtns).toArray().filter(row=>$(row).css('background-color')=='rgb(255, 0, 0)')).css('background-color', '');
    });

    //CancelInvites
    tbody.parent().find('tfoot >tr >td').append(CancelInvites);
    CancelInvites.click(function(){
        let checkedBtns = cancelBtns.filter(btn=>btn.checked),
            counter = checkedBtns.length;
        if(!counter) return;

        for(let i=0, l=counter; i<l; i++){
            let btn = checkedBtns[i];
            btn = $(btn);
            setTimeout(cancelInvite.bind(null, {
                btn,
                tr: btn.closest('tr'),
                decline: btn.attr('decline') //668249_1550581200
            }), i*waitBetweenDeletingInvites);
        }

        function cancelInvite(obj,err=0){
            let success = !1;
            $.get(`index.php?w=${worldId}&area=user&module=friendly&action=index&decline=${obj.decline}&layout=none`, function(response){ //Veri alımı başarılı oldu.
                let feedback;
                if(!(feedback=response.feedback).trim() //feedback yoksa
                   || !(feedback = $(feedback)).length //tag bulunamadıysa
                   || (feedback=feedback)[0].tagName!='P' //doğru tak değilse
                   || !feedback.hasClass('notice') //bildirim başarılı değilse
                  ){
                    console.info("feedback isn't exist || length=0 || tagname!='P'");
                    err = 3;
                    return;
                }
                success=!0;
            }).fail(function(){ //Veri alımı başarısız oldu. 3 Kere veri alımını tekrar dene. Eğer 2 kez daha başarısız olursa işlemi sonlandır.
                if(++err<3) cancelInvite(obj,err);
            }).always(function(){
                if(!success && err<3) return;

                let tr = obj.tr, wait = 0;
                if(success){
                    tr.attr('removing','1').fadeOut(1e3, ()=> tr.remove());
                    wait = 1e3;
                }else{
                    obj.btn.prop('checked', !1);
                    BlinkEvent(tr, 1e3);
                }
                if(--counter<1) setTimeout(()=>{
                    cancelBtns = cancelBtns.filter(btn=>$(btn).closest('tr').attr('removing')===undefined);
                    if(!cancelBtns.length){
                        $('#away-invitations-table >tbody').append(`<tr class="odd"> <td class="no-invites last-column" colspan="4"> ${Game.server=='de'?'Es liegen keine Einladungen vor.': '-'} </td> </tr>`);
                        SelectAllInvites.parent().find('label[for=SelectAllInvites]').remove();
                        SelectAllInvites.remove();
                        CancelInvites.remove();
                    }
                    else{
                        convertBtnToRows(cancelBtns).each(function(i){
                            let row = $(this);
                            row.removeClass(i%2?'odd':'even').addClass(i%2?'even':'odd');
                            if(onlyOneInviteForTheDay(row) ) deactiveBtnForDeleting(getRowCancelInviteBtn(row));
                        });
                        CancelInvites.slideUp();
                    }
                }, wait);
            });
        }
    });

    //Unset unnecessary vars
    tbody = undefined;
});

Tool.features.add('QuickBet','betoffice',function(){
    let rows = $('#bet-form >.table-container >table:first >tbody >tr');
    if(!rows.find('.club-logo-container:first').length) return !1;

    rows.find('>td.bet-quote >span.check-box-container').click(function(){
        let checked = $('>input[type="checkbox"]:first', this).prop('checked');
        let s = $(this).closest('tr').find('>td.last-column select[id^="bet_"]:first');
        let text = s.find('~div.button:first >.text');
        if(checked){
            s.prop('selectedIndex', 0);
            text.html(0);
        }
        else{
            let si = s[0].options.length-1;
            s.prop('selectedIndex', si);
            text.html(s[0].options[si].innerHTML);
        }
    });
});

Tool.features.add('ShowAsistantLevelIncrease','assistants',function(){
    let key = 'AsistanLevel',
        data = Tool.getVal(key,{}),
        o = [],
        aLength = $('#assistants >div.list-container.main_assistants >ul >li').length;
    $('#assistants').find('>div.main_assistants, >div.trainee_assistants').each(function(idx){
        let isTrainee = idx==1;
        $('.bar-text', this).each(function(){
            let level = (()=>{
                let t = this.textContent.trim();
                let i = t.indexOf(' ')+1;
                return parseInt(t.substring(i, t.indexOf(' ',i+1)));
            })();

            let val = level*100 +
                parseInt($(this).prev().find('div:first').attr('data_width')),
                aIndex = (isTrainee?aLength:0) + $($(this).parents('li')[1]).index(),
                aName = $(this).closest('ul').find('li:first > span').text();
            // console.log(`[${aIndex}] ${aName}: ${val}${isTrainee?` (trainee)`:''}`);
            if(data[aIndex]!=undefined){
                if(data[aIndex].name == aName){
                    let diff = val - data[aIndex].v;
                    if(diff>0)
                        o.push({type:$(this).parents('li').find('h3').text().trim(), name:aName, diff});
                }
            }
            data[aIndex] = {name:aName, v:val};
        });
    });
    if(o.length){
        let lines = [GetText('SeminarIsOver')];
        o.forEach(a=>{ lines.push(`${a.type} : +${a.diff}%`); })
        Game.giveNotification(!0, lines.join('<br>'));
    }
    Tool.setVal(key,data);
});

Tool.features.add('StadiumProgressCalculator', 'stadium', function(){
    let stadium = { capacities: { standing: 1000, seat: 500, vip: 250 }, floors:{ 1: { blockTypes:{ standing:{ price: 50000, days: 2 }, seat: { price: 1260000, days: 11 }, vip: { price: 1525000, days: 14 }, }, blockSize: 10 }, 2: { blockTypes:{ standing: { price: 150000, days: 4 }, seat: { price: 1780000, days: 20 }, vip: { price: 2570000, days: 26 }, }, blockSize: 16 }, 3: { blockTypes:{ standing: { price: 450000, days: 6 }, seat: { price: 3330000, days: 29 }, vip: { price: 5700000, days: 38 }, }, blockSize: 18 } } };

    let calcBtn = $(CreateButton('', GetText('stadiumProgressCalculatorBtn'))).css({'float': 'none', 'margin': '3px 0 0 -21px'});
    $('#stadium-info >ul:first').append($('<li>').html(calcBtn).css('text-align','center'));

    calcBtn.click(function(){
        let dialog = ShowDialog(
            GetText('stadiumProgressDialogHeader'),
            `<p style="text-align:center; color:#826d49; margin-bottom:10px;">${GetText('staCalcWarning')}</p>`+
            `<p id="basedInput" style="text-align:center;">${GetText('stadiumCalcBasedOn')}`+
            `   <label style="margin: 0 10px;"><input type="radio" name="basedCalc" data="blockType">${GetText('blockTypeBasedCalc')}</label>`+
            `   <label><input type="radio" name="basedCalc" data="floor">${GetText('floorBasedCalc')}</label>`+
            `</p>`
        );

        let blockSize = stadiumObj.areas.length;
        let blockTypes = Object.keys(stadium.capacities);

        let blockTypesStatus = {};
        let floorsStatus;
        {
            let li = $('#stadium-info >ul >li:first');
            { //step 1: create blockTypesStatus
                blockTypes.forEach((blockType, idx)=>{
                    let bs = (parseInt(li.find('>span').text().replace('.',''))-(idx?0:800))/stadium.capacities[blockType];
                    blockTypesStatus[blockType] = {
                        id: idx+1,
                        finished: { blockSize: bs, found: 0 },
                        remaining: { blockSize: blockSize-bs }
                    };
                    li = li.next();
                });
            }

            let types1 = ['st','se','v'];
            let buildings = [];
            let blocks = Object.values(stadiumObj.currentValues).slice(0, blockSize).map((blockDef, idx1)=>{
                let floorIdx = idx1<10?1:idx1<26?2:3;
                if(blockDef == 'build'){
                    buildings.push({
                        floor: floorIdx,
                        //blockIdx: floorIdx==1?idx1: floorIdx==2?idx1-10: idx1-26
                        idx: idx1,
                    });
                    return {};
                }
                else if(blockDef == 'sel') blockDef = stadiumObj.lastBlocks[idx1+1];
                let a = blockDef.split('_');
                let block = {};
                types1.forEach((t1, idx2)=>{
                    if(a.includes(t1)){
                        let bType = blockTypes[idx2];
                        ++blockTypesStatus[bType].finished.found;
                        let b = stadium.floors[floorIdx].blockTypes[bType];
                        block[bType] = {};
                        block[bType].capacities = stadium.capacities[bType];
                        block[bType].price = b.price;
                        block[bType].days = b.days;
                    }
                });
                return block;
            });
            blockTypesStatus = Object.entries(blockTypesStatus).sort((a,b)=>a[1].id-b[1].id).map(a=>{delete a[1].id; return a;});
            types1 = undefined;

            let notFound = blockTypesStatus.map(a=> a[1].finished.blockSize - a[1].finished.found);
            notFound.forEach((num, idx)=>{
                let bType = blockTypes[idx], building, floor, b;
                for(let i=0; i<num; i++){
                    building = buildings[i];
                    let b = stadium.floors[building.floor].blockTypes[bType];
                    blocks[building.idx][bType] = {
                        capacities: stadium.capacities[bType],
                        price: b.price,
                        days: b.days,
                    };
                }
            });

            blockTypes.forEach((bType, idx)=>{
                let spentMoney = blocks.reduce((acc, block)=>{
                    acc += block.hasOwnProperty(bType)?block[bType].price:0;
                    return acc;
                }, 0);
                let finishedDays = blocks.reduce((acc, block)=>{
                    acc += block.hasOwnProperty(bType)?block[bType].days:0;
                    return acc;
                }, 0);

                let totalMoney = 0, totalDays = 0;
                for(let floorIdx in stadium.floors){
                    let floor = stadium.floors[floorIdx];
                    totalMoney += floor.blockSize * floor.blockTypes[bType].price;
                    totalDays += floor.blockSize * floor.blockTypes[bType].days;
                }

                blockTypesStatus[idx][1].finished.totalPrice = spentMoney;
                blockTypesStatus[idx][1].finished.totalDays = finishedDays;
                blockTypesStatus[idx][1].remaining.totalPrice = totalMoney-spentMoney;
                blockTypesStatus[idx][1].remaining.totalDays = totalDays-finishedDays;
            });

            let start = 0;
            floorsStatus = Object.entries(stadium.floors).map(a=> blocks.slice(start, start+=a[1].blockSize)); //eslint-disable-line no-return-assign
            blocks = start =undefined;

            floorsStatus.forEach((f, fIdx)=>{
                let blockSize = stadium.floors[fIdx+1].blockSize;
                blockTypes.forEach((bType, idx) => {
                    let o = {
                        finished: {
                            block: f.reduce((acc, block)=> acc+block.hasOwnProperty(bType), 0),
                            price: f.reduce((acc, block)=> acc+(block[bType]?block[bType].price:0), 0),
                            days : f.reduce((acc, block)=> acc+(block[bType]?block[bType].days:0), 0),
                        },
                        total: {
                            block: blockSize,
                            price: blockSize*stadium.floors[fIdx+1].blockTypes[blockTypesStatus[idx][0]].price,
                            days: blockSize*stadium.floors[fIdx+1].blockTypes[blockTypesStatus[idx][0]].days
                        },
                        remaining:{}
                    };

                    o.remaining.block = blockSize - o.finished.block;
                    o.remaining.price = o.total.price - o.finished.price;
                    o.remaining.days = o.total.days - o.finished.days;

                    f[bType] = o;
                });
            });
        }

        let p = $('>#basedInput', dialog);
        { //create block type based table
            let tableTexts = [
                [GetText('blockCount'), GetText('moneySpent'), GetText('daysGone')],
                [GetText('blockCount'), GetText('money2BeSpent'), GetText('remainingDays')],
                [GetText('developed'), GetText('moneySpent'), GetText('daysGone')],
                [GetText('undeveloped'), GetText('money2BeSpent'), GetText('remainingDays')]
            ];
            let tableGenarator = (tableIdx, blockSize=44, price=121121212, days=535)=>{
                let texts = tableTexts[tableIdx];
                let args = [blockSize, price.toLocaleString()+ " €", days.toLocaleString()+ (days<1?"": ' ' + (days>1?GetText('Days'): GetText('aDay')))]
                return `<table><tbody>`+texts.map((text, i)=>`<tr><td>${text}<span style="float:right">:</span></td><td>${args[i]}</td></tr>`).join('')+`</tbody></table>`;
            };

            p.after(
                `<table style="margin-top:10px;">`+
                `   <thead>`+
                `      <tr>`+
                `         <th style="border-left:#5a8349 1px solid;">${GetText('blockType')}</th>`+
                `         <th>${GetText('finished')}</th>`+
                `         <th style="border-right:#5a8349 1px solid;">${GetText('remaining')}</th>`+
                `      </tr>`+
                `   </thead>`+
                `   <tbody>`+
                blockTypesStatus.map(
                    ([blockType, status])=>
                    `<tr>`+
                    `   <td><b>${blockType}</b></td>`+
                    `   <td>${tableGenarator(0, status.finished.blockSize, status.finished.totalPrice, status.finished.totalDays)}</td>`+
                    `   <td>${tableGenarator(1, status.remaining.blockSize, status.remaining.totalPrice, status.remaining.totalDays)}</td>`+
                    `</tr>`
                ).join('')+
                `   </tbody>`+
                `   <tfoot>`+
                `      <tr style="background-color:crimson; color:white;">`+
                `         <td>${GetText('total').toUpperCase()}</td>`+
                (()=>{
                    let totalDevelopment = blockSize*3,
                        developed = blockTypesStatus.reduce((acc, a)=>acc+a[1].finished.blockSize, 0);
                    return `<td>${tableGenarator(
                        2,
                        `${developed}/${totalDevelopment}`,
                        blockTypesStatus.reduce((acc, a)=> acc+a[1].finished.totalPrice ,0),
                        blockTypesStatus.reduce((acc, a)=> acc+a[1].finished.totalDays ,0)
                    )}</td>`+
                        `<td>${tableGenarator(
                        3,
                        `${totalDevelopment-developed}/${totalDevelopment}`,
                        blockTypesStatus.reduce((acc, a)=> acc+a[1].remaining.totalPrice ,0),
                        blockTypesStatus.reduce((acc, a)=> acc+a[1].remaining.totalDays ,0)
                    )}</td>`;
                })()+
                `      </tr>`+
                `   </tfoot>`+
                `</table>`
            );

            let table = p.next().hide();
            table.find('>thead th').css('text-align', 'center');
            table.find('tr').css('line-height', '20px');
            table.find('table').css({'width': '95%', 'margin': 'auto'})
                .find('>tbody td').css({'border':'none', 'text-align': 'left'});
            table.find('td:nth-child(2) table >tbody td:first-child').css('width', '95px');
            table.find('td:nth-child(3) table >tbody td:first-child').css('width', '125px');
            table.find('>tbody >tr >td, >tfoot >tr> td').css('border-right', '#5a8349 1px solid');
            table.find('>tbody >tr >td:first-child, >tfoot >tr> td:first-child').css('border-left', '#5a8349 1px solid');
        }

        {//create floor based table
            let tableGenarator = (blockSize=44, price=121121212, days=535)=>{
                return `<td class="bl-1 bb-1">${blockSize}</td>`+
                    `<td class="bb-1">${price.toLocaleString()+ " €"}</td>`+
                    `<td class="br-1 bb-1">${days.toLocaleString()+ (days<1?"": " " + (days>1?GetText('Days'): GetText('aDay')) )}</td>`;
            };
            p.next().after(
                `<table style="margin-top:10px;">`+
                `   <thead>`+
                `      <tr>`+
                `         <th rowspan="2" class="b-1">${GetText('floor')}</th>`+
                `         <th rowspan="2" class="b-1">${GetText('state')}</th>`+
                `         <th rowspan="2" class="b-1">${GetText('development')}</th>`+
                `         <th colspan="3" scope="colgroup" class="b-1" style="border: 1px solid black; color: blanchedalmond; font-size: 15px;">${GetText('staBlockTypeStanding')}</th>`+
                `         <th colspan="3" scope="colgroup" class="b-1" style="border: 1px solid black; color: blanchedalmond; font-size: 15px;">${GetText('staBlockTypeSeat')}</th>`+
                `         <th colspan="3" scope="colgroup" class="b-1" style="border: 1px solid black; color: blanchedalmond; font-size: 15px;">${GetText('staBlockTypeVip')}</th>`+
                `      </tr>`+
                `      <tr>`+
                `         <th scope="col" class="bl-1">${GetText('block')}</th><th scope="col">${GetText('money')}</th><th scope="col" class="br-1">${GetText('Days')}</th>`+
                `         <th scope="col" class="bl-1">${GetText('block')}</th><th scope="col">${GetText('money')}</th><th scope="col" class="br-1">${GetText('Days')}</th>`+
                `         <th scope="col" class="bl-1">${GetText('block')}</th><th scope="col">${GetText('money')}</th><th scope="col" class="br-1">${GetText('Days')}</th>`+
                `      </tr>`+
                `   </thead>`+
                `   <tbody>`+
                floorsStatus.map((f, fIdx)=>{
                    let finished = f.reduce((acc, block)=>acc+Object.keys(block).length, 0);
                    return `<tr>`+
                        `   <td rowspan="2" class="b-1">${GetText('floorNo', {args:[fIdx+1]})}</td>`+
                        `   <td class="b-1">${GetText('finished')}</td>`+
                        `   <td class="b-1">${finished}</td>`+
                        `   ${blockTypes.map(bType=> tableGenarator(f[bType].finished.block, f[bType].finished.price, f[bType].finished.days)).join('')}`+
                        `</tr>`+

                        `<tr>`+
                        `   <td class="b-1">${GetText('remaining')}</td>`+
                        `   <td class="b-1">${stadium.floors[fIdx+1].blockSize*blockTypesStatus.length-finished}</td>`+
                        `   ${blockTypes.map(bType=> tableGenarator(f[bType].remaining.block, f[bType].remaining.price, f[bType].remaining.days)).join('')}`+
                        `</tr>`;
                }).join('')+
                `   </tbody>`+
                `   <tfoot>`+
                `      <tr style="background-color:crimson; color:white;">`+
                `         <td rowspan="2" class="b-1">${GetText('total').toUpperCase()}</td>`+
                `         <td class="b-1">${GetText('finished')}</td>`+
                `         <td class="b-1">${blockTypes.reduce((acc, bType)=> acc +floorsStatus.reduce((acc, f)=>acc+ f[bType].finished.block, 0), 0)}</td>`+
                `         ${blockTypes.map(bType=> tableGenarator(
                    floorsStatus.reduce((acc, f)=>acc+f[bType].finished.block, 0),
                    floorsStatus.reduce((acc, f)=>acc+f[bType].finished.price, 0),
                    floorsStatus.reduce((acc, f)=>acc+f[bType].finished.days, 0)
                )).join('')}`+
                `      </tr>`+

                `      <tr style="background-color:crimson; color:white;">`+
                `         <td class="b-1">${GetText('remaining')}</td>`+
                `         <td class="b-1">${blockTypes.reduce((acc, bType)=> acc +floorsStatus.reduce((acc, f)=>acc + f[bType].remaining.block, 0), 0)}</td>`+
                `         ${blockTypes.map(bType=> tableGenarator(
                    floorsStatus.reduce((acc, f)=>acc+f[bType].remaining.block, 0),
                    floorsStatus.reduce((acc, f)=>acc+f[bType].remaining.price, 0),
                    floorsStatus.reduce((acc, f)=>acc+f[bType].remaining.days, 0)
                )).join('')}`+
                `      </tr>`+
                `   </tfoot>`+
                `</table>`
            );

            let table = p.next().next();
            table.find('>thead>tr').css({'background':'darkslateblue'});
            table.find('.b-1').css('border', '1px solid #5a8349');
            table.find('.bl-1').css('border-left', '1px solid #5a8349');
            table.find('.br-1').css('border-right', '1px solid #5a8349');
            table.find('.bb-1').css('border-bottom', '1px solid #5a8349');
            table.find('>tbody >tr:even').css('background-color','aliceblue');
            table.find('>tbody >tr:odd').css('background-color','#ffbfbf');
            table.find('>tbody >tr:even> td:first-child').css('background-color','floralwhite');
        }

        {
            let leftDays = blockTypesStatus.reduce((acc, a)=> acc+a[1].remaining.totalDays, 0);
            let totalDays = leftDays + blockTypesStatus.reduce((acc, a)=> acc+a[1].finished.totalDays, 0);

            let spentMoneys = blockTypesStatus.reduce((acc, a)=> acc+a[1].finished.totalPrice, 0);
            let totalMoneys = spentMoneys + blockTypesStatus.reduce((acc, a)=> acc+a[1].remaining.totalPrice, 0);

            let createPbar = (text, perc)=>
            `<div style="float: none;margin: 10px auto 0;text-align: center;color: maroon;">${text}:`+
                `   <div class="bar-container" style="float:none;">`+
                `      <div class="bar-back">`+
                `         <div style="width: ${perc}%;display: flex;justify-content:center;" class="bar">`+
                `            <div id="bar-value" style="color:white;margin-left: 23px;">${perc}%</div>`+
                `         </div>`+
                `      </div>`+
                `   </div>`+
                `</div>`;

            dialog.append(createPbar(GetText('daysLeftUntilStaEnds'), Math.round((totalDays-leftDays)/totalDays*100)));
            dialog.append(createPbar(GetText('moneySpent'), Math.round(spentMoneys/totalMoneys*100)));
        }

        $('>#basedInput input[name="basedCalc"]',  dialog).change(function(){
            let based = $(this).attr('data');
            if(based == "blockType"){
                dialog.css('width', '580px');
                p.find('+table:first').show().find('+table:first').hide();
            }
            else{
                dialog.css('width', '862px');
                p.find('+table:first').hide().find('+table:first').show();
            }
            dialog.css({
                'top': Math.max(190, ($(window).innerHeight() - dialog.height()) / 2) + 'px', //Center vertically
                'left': ($(window).scrollLeft() + ($(window).innerWidth() / 2) - (dialog.width() / 2 + dialog.parent().offset().left)) + 'px' //Center horizontally
            });
        }).first().click();

    });
})

Tool.features.add('QuickShopping','shop',function(){
    let shops = $('#shop-content > .shop').toArray().filter(shop=>!$(shop).find('.shadow').length)
    if(!shops.length) return !1;
    $(shops).each(function(){
        let shop = this;
        if($(shop).find('.shadow').length) return;

        let e = $('div.table-container',shop)[0].getElementsByClassName('multi');
        for(let i=0,len=e.length ; i<len ; i++){
            let k = e[i].getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            for(var j = 0 ; j<k.length ; j++){
                let t = k[j].getElementsByClassName('last-column order-quantity')[0];
                if(t!==undefined && t.getElementsByClassName('input-container')[0]!==undefined){
                    let tk = t.innerHTML,
                        b = tk.indexOf('</span> / ')+7,
                        b1 = tk.indexOf('<span',b),
                        mi = tk.substring(b+3,b1).trim();
                    t.innerHTML = tk.substring(0,b)+`<span class="TrOk disHighlight" style="cursor:pointer;"> / ${mi}</span>`+tk.substring(b1);
                    ClickTrOk(t.getElementsByClassName('TrOk')[0]);
                }
            }
        }
        $('div.button-container > span.button.button-container-disabled.premium > a > span', shop)
            .attr('k',1)
            .removeAttr('class tooltip name')
            .css('cursor','pointer')
            .html(GetText('FillAll'))
            .click(function(){
            let k = shop.getElementsByClassName('TrOk');
            if($(this).attr('k')==1){
                for(let i = 0 ; i < k.length ; i++)
                    k[i].previousSibling.getElementsByTagName('input')[0].value = k[i].textContent.replace('/','').trim();
                $(this).html(GetText('EmptyAll')).attr('k',0);
            }
            else{
                for(let i = 0 ; i < k.length ; i++)
                    k[i].previousSibling.getElementsByTagName('input')[0].value = 0;
                $(this).html(GetText('FillAll')).attr('k',0);
            }
        })
            .parent().removeAttr('href');
        $('div.button-container > span:nth-child(3) > a > span', shop).html(GetText('Ordering'));
    });
    shops = undefined;
    function ClickTrOk(e){
        $(e).click(function(){
            let va = e.textContent.replace('/','').trim(),
                t = e.previousSibling.getElementsByTagName('input')[0];
            if(e.previousSibling.getElementsByTagName('input')[0].value!==va) t.value = va;
            else t.value=0;
        });
    }
});

Tool.features.add('AddImage',['press->article','club_profile'],function(){
    let elements = {
        'article': { /*press->article*/
            toolbar : $('#Toolbar_designArea > ul'),
            textarea: $('#designArea')[0]
        },
        'club_profile' : {
            toolbar : $('#Toolbar_profile-edit-club-information > ul'),
            textarea: $('#profile-edit-club-information')[0]
        }
    }[Game.currentPage.name];
    $(`<li class="" title="${GetText('AddImage', {tag:0})}" tool_tt="AddImage" style="cursor:pointer;" onmouseenter="$(this).addClass('hover')" onmouseleave="$(this).removeClass('hover')">`+
      `   <img src="${Tool.sources.get('image')}" alt="image.png" width="20px" height="20px">`+
      `</li>`
     ).appendTo(elements.toolbar).click(function(){
        let txt = prompt(GetText('EnterImageLink', {tag:0}) + ' :', "");
        if (!txt || !(txt=txt.trim())) return;
        let intStart = elements.textarea.selectionStart,
            img = new Image();
        img.onload = function() {
            let a = elements.textarea;
            let maxWidth = 950;
            let highWidth = this.width>maxWidth;
            txt = `[color=rgb(255, 255, 255);background-image: url(${txt});width:${!highWidth?this.width:maxWidth}px;height:${!highWidth?this.height:this.height/(this.width/maxWidth)}px;display:block;overflow:visible;margin:0 auto;${highWidth?'background-size: contain;':''}][/color]`;
            a.value = String(a.value).substring(0, intStart) + txt + String(a.value).substring(a.selectionEnd);
            a.selectionStart = intStart;
            a.selectionEnd = intStart+txt.length;
            a.focus();
        };
        img.src = txt;
    });
});

Tool.features.add('InviteSimulationMatch','manager',function(){
    if(isNaN(Game.link.pr.clubId) || Game.link.pr.clubId==Tool.clubId) return;
    let matchId = (new URL(location.origin+'/'+$('#profile-show').find('.button-container-friendly-invite-button > a').attr('href').replace('#/',''))).searchParams.get('invite');
    if(matchId == null) return false;
    $('#profile-show').find('.profile-actions').first().append(
        `<span class="button">`+
        `   <a class='button' href='#/index.php?w=${worldId}&area=user&module=simulation&action=index&squad=${matchId}'>`+
        `      <span>${GetText('InviteSimulation')}</span>`+
        `   </a>`+
        `</span>`
    );
});
Tool.features.add('ShowEloRating','manager',function(){
    $('#profile-show > div.container.profile-trophy > div.profile > ul.profile-box-club').append(
        `<li><strong>${GetText('EloRank')} : </strong> <span id="SpanEloRating" class="icon details loading"></span></li>`
    );
    let clubName = $('#profile-show > h2:nth-child(1)').text().replace(Tool.replaceClubName,'').trim();
    Game.getPage(`index.php?club=${encodeURIComponent(clubName)}&_qf__form=&module=rating&action=index&area=user&league=&path=index.php&layout=none`, null, null, 0, ['content'])
        .then(data=>{
        let odds = $('<div>').html(data.content).find('.odd');
        $('#SpanEloRating').attr('class','');
        if(odds.length) $('#SpanEloRating').html(odds.first().find('>td')[0].textContent);
        else $('#SpanEloRating').css('color','gray').html('-');
    })
        .catch(err=>{
        console.error(err);
        $('#SpanEloRating').html(`<font color="#751b1b">${GetText('error')}</font>`);
    });
});

Tool.features.add('LiveMatchesTable','live->match',function(){
    if(typeof currentLive!='object') return !1;
    if(!currentLive.ownLeague) return !1;
    if(!($('#'+currentLive.matchId).hasClass('league') && $('#match-observer').length)) return !1; //If the match is league match
    if(Tool.goalTrigger!==3) return !1;

    ({
        Initialize: async function(){
            delete this.Initialize;
            $('#match >div.match.ticker').css('height','765px');

            currentLive.homeClubId = $('#'+currentLive.matchId+' >div.home >span >h3 >a').attr('clubid');
            currentLive.awayClubId = $('#'+currentLive.matchId+' >div.away >span >h3 >a').attr('clubid');

            this.InsertHeaderForObserver();
            this.InsertLeagueTable();
            this.InsertHeaderForTable();
            this.CreateAnimation();

            let all_matches_ended = this.AllMatchesEnded(),
                league_table_updated = all_matches_ended && await this.AreScoresUpdated(),
                matches_not_started = !all_matches_ended && new Date(Game.getTime()).getMinutes()>29,
                any_match_is_continue = !all_matches_ended && !matches_not_started;

            console.log('%call_matches_ended: %o\n%cleague_table_updated: %o','color:red;font-weight:bold;',all_matches_ended,'color:red;font-weight:bold;',league_table_updated);
            let result = await this.GetTable();
            this.leagueIndex = result.leagueIndex;
            this.tableRowClass = result.rowClass;

            this.SetMatchIdForClub(result.table);
            this.SetOppenentId(result.table);

            // match hour is x
            if(!league_table_updated){ // (x-1) <-> x:15
                this.old_table = result.table;
                if(!all_matches_ended){ //Before match time or in match hour(x): (x-1):30 <-> x:10
                    if(matches_not_started){ // (x-1):30 <-> x (from when matches appear until when matches start)
                        console.log('1.Area');
                        this.new_table = this.old_table;
                        this.UpdateLiveLeagueTable();

                        //await until matches start
                        await new Promise((res,rej)=>{
                            let d = new Date(Game.getTime()),
                                ms = (3600-(d.getMinutes()*60+d.getSeconds()))*1000-d.getMilliseconds();
                            console.log('Beklenecek milisaniye: ' + ms);
                            Tool.intervals.create(function(){
                                this.delete();
                                res();
                            }, ms);
                        });
                        console.log('Mathces start now');

                        this.new_table = this.CreateTableWithScores(this.GetCurrentScores(), this.old_table);
                        //this.new_table.forEach(club=>{++club.played;});
                    }
                    else{ // x <-> x:10 (from when matches start until when all matches end)
                        console.log('2.Area');
                        this.new_table = this.CreateTableWithScores(this.GetCurrentScores(), this.old_table);
                        //this.new_table.forEach(club=>{++club.played;});
                    }
                    this.StartToCatchNewGoals();
                    this.StartToCatchMatchEnd();
                }
                else{ // x:10 <->x:15 (from when all matches end until league table updated)
                    console.log('3.Area');
                    this.new_table = this.CreateTableWithScores(this.GetCurrentScores(), this.old_table);
                    this.new_table.forEach(club=>{++club.played;});
                }
            }
            else{ // x:15 <-> 24:00 (from when league table updated until when matches result disappear)
                console.log('4.Area');
                this.new_table = result.table;
                this.old_table = this.CreateTableWithScores(this.GetCurrentScores(), this.new_table.slice(0), true);
                this.old_table.forEach(club=>{--club.played;});
            }

            this.UpdateLiveLeagueTable();
        },

        InsertLeagueTable: function(){
            delete this.InsertLeagueTable;

            let table_height=450,
                space_height=188;
            $(`<div id="league-table" style="position:absolute; background:#6e9a5a url(images/layout/box_bg.gif) 0 -200px repeat-x; overflow:auto; box-shadow:1px 1px 5px black;">`+
              `   <table class="table-league">`+
              `      <thead>`+
              `         <tr>`+
              `            <th>${GetText('Rank')}</th>`+
              `            <th>${GetText('Trend')}</th>`+
              `            <th>${GetText('Club')}</th>`+
              `            <th>${GetText('Played')}</th>`+
              `            <th>${GetText('Won')}</th>`+
              `            <th>${GetText('Drawn')}</th>`+
              `            <th>${GetText('Lost')}</th>`+
              `            <th title="${GetText('GoalFor', {tag:0})}" tool_tt="GoalFor">${GetText('SGoalFor')}</th>`+
              `            <th title="${GetText('GoalAgainst',{tag:0})}" tool_tt="GoalAgainst">${GetText('SGoalAgainst')}</th>`+
              `            <th>${GetText('Average')}</th>`+
              `            <th>${GetText('Points')}</th>`+
              `         </tr>`+
              `      </thead>`+
              `      <tbody></tbody>`+
              `   </table>`+
              `</div>`
             ).css({
                'top' :(parseInt($('#match-observer').css('top'))+24)+'px',
                'left' :'0px',
                'width':'0',
                'height':table_height+'px'
            }).insertAfter($('#match-observer')).find('table>thead th').css({position: 'sticky', top: '0','background-color':'black','border-bottom':'1px double white'});
            $('#match > div.match').height($('#match > div.match').height()+table_height-space_height)
        },
        InsertHeaderForTable: function(){
            delete this.InsertHeaderForTable;

            $(`<p id="Toggle_league_table" class="disHighlight">${GetText('LiveLeagueTable')}</p>`).css({
                "position" : "absolute",
                "line-height" : "18px",
                "cursor" : "pointer",
                "text-align" : "center",
                "color" : "black",
                "font-weight" : "bold",
                "font-size" : "15px",
                "background-color" : "#d0cfcf",
                "border-radius" : "0 10px 10px 0",
                'padding':'0 2px',
                "writing-mode" : "vertical-lr",
                "text-orientation" : "unset",
                "top" : (parseInt($('#match-observer').css('top'))+24)+'px',
                "left" : "0px",
                "width" : "18px",
                "height" : $('#league-table').height()+"px"
            }).insertAfter($('#match-observer'));
        },
        InsertHeaderForObserver: function(){
            delete this.InsertHeaderForObserver;

            $(`<p id="Toggle_match_observer" k="close" animate_top="${$('#match-observer').height()}" class="disHighlight">${GetText('LiveMatchScores')}</p>`).css({
                'position' : 'absolute',
                'line-height' : '18px',
                'cursor' : 'pointer',
                'text-align' : 'center',
                'color' : 'black',
                'font-weight' : 'bold',
                'font-size' : '15px',
                'background-color' : '#d0cfcf',
                'border-radius' : '0 0 10px 10px',
                'padding':'2px 0',
                'top' : parseInt($('#match-observer').css('top'))+$('#match-observer').height(),
                'width' : $('#match-observer').width()+parseInt($('#match-observer').css('padding-right'))+parseInt($('#match-observer').css('padding-left'))-2,
                'left' : parseInt($('#match-observer').css('left'))+1
            }).insertAfter($('#match-observer'));
        },
        CreateAnimation: function(){
            delete this.CreateAnimation;

            $('#Toggle_match_observer,#Toggle_league_table').click(function(){
                let k = $('#Toggle_match_observer').attr('k'),
                    animate_left = $('#league-table>table').width() + ($('#league-table')[0].scrollHeight != $('#league-table')[0].offsetHeight?16.8:0),
                    animate_top = $('#Toggle_match_observer').attr('animate_top');
                $('#Toggle_match_observer,#Toggle_league_table').css("pointer-events", "none");

                if(k=='close'){
                    $('#Toggle_match_observer').animate({ "top":'-='+animate_top+"px" }, 500 );
                    $('#match-observer,#match-observer > ul').animate({
                        height : 0,
                        opacity: 0
                    }, 500);
                    setTimeout(function(){
                        $('#Toggle_match_observer').attr('k','open');
                        //Cookies.set('liveLeagueTable', 1, { expires: 365 });

                        $('#Toggle_league_table').animate({ "left": '+='+animate_left+"px" }, 500 );
                        $('#league-table').animate({
                            width : animate_left,
                            opacity: 1
                        }, 500);

                        setTimeout(function(){
                            $('#Toggle_match_observer,#Toggle_league_table').css("pointer-events", "auto");
                        },500);
                    },400);
                }
                else{
                    $('#Toggle_league_table').animate({ "left": '-='+animate_left+"px" }, 500 );
                    $('#league-table').animate({
                        width : 0,
                        opacity: 0
                    }, 500);

                    setTimeout(function(){
                        $('#Toggle_match_observer').attr('k','close');
                        //Cookies.set('liveLeagueTable', 0, { expires: 365 });
                        $('#match-observer,#match-observer > ul').animate({
                            height : animate_top,
                            opacity: "1"
                        }, 500);
                        $('#Toggle_match_observer').animate({ "top": '+='+animate_top+"px" }, 500 );
                        setTimeout(function(){
                            $('#Toggle_match_observer,#Toggle_league_table').css("pointer-events", "auto");
                        },500);
                    },400);
                }
            });

            //if(Cookies.get('liveLeagueTable') == "1") $('#Toggle_match_observer').click();

            unsafeWindow.jQuery('#content').off('mouseenter','#league-table > table > tbody > tr').on('mouseenter','#league-table > table > tbody > tr',function(){
                let opp_idx = parseInt($(this).attr('opp_idx'));
                if(isNaN(opp_idx)||opp_idx<0) return;
                $('#league-table > table > tbody > tr').css('background-color','');
                $(this).add($('#league-table > table > tbody > tr:nth-child('+(opp_idx+1)+')')).css('background-color','#4854a8;');
            });
            unsafeWindow.jQuery('#content').off('mouseleave','#league-table > table > tbody').on('mouseleave','#league-table > table > tbody',function(){
                $('#league-table > table > tbody > tr').css('background-color','');
                [currentLive.homeClubId,currentLive.awayClubId].forEach(id=>{$('#league-table > table > tbody > tr:has(a[clubid="'+id+'"])').css('background-color','#4854a8;');});
            });
        },

        GetTable: function(tryGetPage=0){
            delete this.GetTable;
            return new Promise((res,rej)=>{
                Game.getPage(`index.php?w=${worldId}&area=user&module=statistics&action=table&layout=none`,'#league-table-container').then(table_container=>{
                    let leagueIndex = $(table_container[0].querySelector('#leagueCatalogueForm')).find('select[group="league-selector"]').first().val(),
                        table = [],
                        rowClass = [];
                    $(table_container[0].querySelector('#statistics-league-table')).find('tbody > tr').each(function(i){
                        let tr = this,
                            data = {};
                        rowClass.push(tr.className.replace('odd','').replace('even','').trim());
                        //data.rank = i+1;
                        //data.trend = parseInt($(tr).find('> td:nth-child(2)').attr('sortvalue'));
                        data.clubId = $(tr).find('a[clubid]').attr('clubid');
                        data.clubName = $(tr).find('a[clubid]').text().trim();
                        data.played = parseInt($(tr).find('td:nth-child(4)').text());
                        data.won = parseInt($(tr).find('td:nth-child(5)').text());
                        data.drawn = parseInt($(tr).find('td:nth-child(6)').text());
                        data.lost = parseInt($(tr).find('td:nth-child(7)').text());
                        data.gf = parseInt($(tr).find('td:nth-child(8)').text().split(':')[0]);
                        data.ga = parseInt($(tr).find('td:nth-child(8)').text().split(':')[1]);
                        data.average = parseInt($(tr).find('td:nth-child(9)').text());
                        data.points = parseInt($(tr).find('td:nth-child(10)').text());
                        table.push(data);
                    });
                    res({leagueIndex, table, rowClass});
                }).catch(err=>{rej(err);});
            });
        },
        AllMatchesEnded: function(){
            let match_length = 1 + $('#match-observer >ul >li').length,
                end_match_length = ($('#'+currentLive.matchId).hasClass('ended')?1:0) + $('#match-observer >ul >li.ended').length;
            return match_length == end_match_length;
        },
        AreScoresUpdated: function(tryGetPage=0){
            delete this.AreScoresUpdated;
            return new Promise((res,rej)=>{
                Game.getPage(`index.php?w=${worldId}&area=user&module=main&action=home&layout=none`,'#matches').then(matches=>{
                    let last_matches = $(matches).find('ul.matches.last'),
                        scores_updated = !1
                    if(!last_matches.find('li.no-entry').length){
                        last_matches = last_matches.find('>li');
                        let match_day = new Date(parseInt(currentLive.matchId.split('_')[2])*1000).toLocaleDateString();
                        last_matches.each(function(){
                            let match = $(this);
                            if(match.find('li.type >span.match.league').length){
                                let match_dates = match.find('li.date').text().trim().split(/\s+/g); // return ["23.02.2019", "18:00:00"] or ["Bugün, "18:00:00"] ||  ["Today, "18:00:00"]
                                if(match_dates[0].length != 10 || match_dates[0] == match_day)
                                    scores_updated = !0;
                                return false;
                            }
                        });
                    }
                    res(scores_updated);
                }).catch(err=>{rej(err);});
            });
        },
        SetMatchIdForClub: function(table){
            delete this.SetMatchIdForClub;
            $('#match-observer >ul >li a[clubid]').each(function(){
                let a = $(this);
                table.find(c=>c.clubId==a.attr('clubid')).matchId = a.closest('li').attr('id').split('_')[a.parent().hasClass('squad-home')?0:1];
            });
            table.find(c=>c.clubId==currentLive.homeClubId).matchId = currentLive.homeId;
            table.find(c=>c.clubId==currentLive.awayClubId).matchId = currentLive.awayId;
        },
        SetOppenentId: function(table){
            delete this.SetOppenentId;
            table.forEach(c=>{
                let clubId = c.clubId, oppenent_id;
                if(currentLive.homeClubId == clubId) oppenent_id = currentLive.awayClubId;
                else if(currentLive.awayClubId == clubId) oppenent_id = currentLive.homeClubId
                else{
                    $('#match-observer >ul >li').toArray().forEach(li=>{
                        li = $(li);
                        let a = li.find('a[clubid]');
                        if(a.toArray().find(a=>$(a).attr('clubid')==clubId)==undefined) return;
                        if(a.first().attr('clubid')==clubId) oppenent_id = a.last().attr('clubid')
                        else oppenent_id = a.first().attr('clubid');
                    });
                }
                c.oppenent_id = oppenent_id;
            });
        },

        GetCurrentScores: function(){
            delete this.GetCurrentScores;

            let scores = [];
            //Add current matches scores
            scores.push({
                home: { id: currentLive.homeClubId },
                away: { id: currentLive.awayClubId }
            });

            if($('#'+currentLive.matchId).hasClass('ended') && currentLive.timeElement.html()==1){ //Hükmen galibiyet
                let home_goals = $('#match-messages >li.info').first().find('span.away, span.home').first().attr('class')=="away"?3:0,
                    away_goals = home_goals==3?0:3;
                scores[0].home.goals = home_goals;
                scores[0].away.goals = away_goals;
            }
            else{
                scores[0].home.goals = parseInt($(`#${currentLive.matchId}>span.score >div:first >span.score-home`).text());
                scores[0].away.goals = parseInt($(`#${currentLive.matchId}>span.score >div:first >span.score-away`).text());
            }

            scores.push(...$('#match-observer > ul > li').toArray().map(li=>{
                return {
                    home: {
                        id: $('span.squad-home > a',li).attr('clubid'),
                        goals : parseInt($('> span.score > span.score-home',li).text())
                    },
                    away: {
                        id: $('span.squad-away > a',li).attr('clubid'),
                        goals : parseInt($('> span.score > span.score-away',li).text())
                    }
                };
            }));

            //Add other matches scores
            return scores;
        },
        CreateTableWithScores: function(scores, table, updated_table=false, fill_items=table){
            let factor = updated_table?-1:1,
                len = table.length,
                new_table = new Array(len);
            scores.forEach(score=>{
                let diffGoals = score.home.goals - score.away.goals,
                    points = diffGoals!=0?3:1,
                    idx1 = table.findIndex(c=>c.clubId==score.home.id),
                    idx2 = table.findIndex(c=>c.clubId==score.away.id),
                    home_= table[idx1],
                    away_= table[idx2],
                    home,away;

                new_table[idx1] = home = Object.create(home_);
                new_table[idx2] = away = Object.create(away_);

                home.points = home_.points + factor*points*(diffGoals>-1?1:0);
                away.points = away_.points + factor*points*(diffGoals<1?1:0);
                if(diffGoals!=0){
                    let key = diffGoals>0?'won':'lost';
                    home[key] = home_[key] + factor;
                    away[key = key=="lost"?'won':'lost'] = away_[key] + factor;
                }
                else{
                    home.drawn = home_.drawn + factor;
                    away.drawn = away_.drawn + factor;
                }
                home.gf = home_.gf + factor*score.home.goals;
                away.gf = away_.gf + factor*score.away.goals;
                home.ga = home_.ga + factor*score.away.goals;
                away.ga = away_.ga + factor*score.home.goals;
                home.average = home_.average + factor*diffGoals;
                away.average = away_.average + factor*diffGoals*-1;
            });

            for(let i=0; i<len ;i++){
                if(new_table[i]!==undefined) continue;
                new_table[i] = fill_items.find(c=>c.clubId==table[i].clubId);
            }

            return this.SortTable(new_table);
        },
        SortTable: function(table){
            return table.sort(function(a,b){
                let compare;
                if(compare = b.points - a.points) return compare; //En yüksek puana göre sırala
                else if(compare = b.average - a.average) return compare; //Averajı yüksek olan
                else if(compare = b.gf - a.ga) return compare; //Daha fazla gol atan
                return a.clubId - b.clubId; //Daha önce takım açan
            });
        },
        UpdateLiveLeagueTable: function(){
            console.log('old: %o\n,new: %o',this.old_table,this.new_table);

            $('#league-table >table >tbody').html('')
            let showChanged = diff=> diff!=0?`<span class="changed-property" style="margin-left:2px;">(${(diff>0?'+':'')+diff})</span>`:'';
            this.new_table.forEach((club,i)=>{ //Add Row to Live League Table
                let club_old_index = this.old_table.findIndex(c=>c.clubId==club.clubId),
                    club_old = this.old_table[club_old_index],
                    rank_dif = club_old_index-i,
                    diff = ['played','won','drawn','lost','gf','ga','average','points'].reduce((acc,key)=>{
                        acc[key] = club[key]-club_old[key];
                        return acc;
                    },{}),
                    opp_idx = null;
                if(!isNaN(club.oppenent_id)) opp_idx = this.new_table.findIndex(c=>c.clubId==club.oppenent_id);
                $('#league-table >table >tbody').append(
                    `<tr class="${this.tableRowClass[i]} ${i%2?'even':'odd'}" ${[currentLive.homeId, currentLive.awayId].includes(club.matchId)?`style="background-color:#4854a8;"`:''} ${!isNaN(opp_idx) && opp_idx>-1?`opp_idx="${opp_idx}"`:''}>`+
                    `   <td>${i+1}</td>`+
                    `   <td>`+
                    `      <div class="icon ${rank_dif>0?'advancement':rank_dif<0?'relegation':'remain'}" ${rank_dif!=0?` title="${(rank_dif>0?'+':'')+rank_dif}"`:""}></div>`+
                    `    </td>`+
                    `    <td class="name-column">`+
                    `       <a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${club.clubId}" clubid="${club.clubId}" ${club.clubId==Tool.clubId?'class="self-link"':''}>${club.clubName}</a>`+
                    `    </td>`+
                    `    <td style="color:black;">${club.played+showChanged(diff.played)}</td>`+
                    `    <td style="color:black;">${club.won+showChanged(diff.won)}</td>`+
                    `    <td style="color:black;">${club.drawn+showChanged(diff.drawn)}</td>`+
                    `    <td style="color:black;">${club.lost+showChanged(diff.lost)}</td>`+
                    `    <td style="color:black;">${club.gf+showChanged(diff.gf)}</td>`+
                    `    <td style="color:black;">${club.ga+showChanged(diff.ga)}</td>`+
                    `    <td style="color:black;">${club.average+showChanged(diff.average)}</td>`+
                    `    <td class="last-column" style="color: black;"><b>${club.points}</b>${showChanged(diff.points)}</td>`+
                    `</tr>`
                );
            });
        },
        StartToCatchNewGoals: function(){
            delete this.StartToCatchNewGoals;
            Tool.temp.NewGoalCatcher = matches_status=> {
                // matches_status: { "668262_667855_1550761200_league": { "status": "ended", "home_goals": 0, "away_goals": 3, "min": 1 }, "669559_669389_1550761200_league": { "status": "ended", "home_goals": 0, "away_goals": 1, "min": 93 }, "669599_106135_1550761200_league": { "status": "ended", "home_goals": 5, "away_goals": 0, "min": 92 } }
                if(!matches_status) return;
                let new_scores = [];
                for(let matchId in matches_status){
                    if(matchId.split('_')[3]!='league') continue;
                    let match = matches_status[matchId];
                    new_scores.push({
                        home : {
                            id  : this.new_table.find(c=>c.matchId==matchId.split('_')[0]).clubId,
                            goals: match.home_goals
                        },
                        away : {
                            id  : this.new_table.find(c=>c.matchId==matchId.split('_')[1]).clubId,
                            goals: match.away_goals
                        },
                    });
                }

                this.new_table = this.CreateTableWithScores(
                    new_scores, //updated scores
                    this.old_table, //old scores in old table and new scores use to create a table
                    false, //create next table
                    this.new_table //old scores will not be updated
                );

                this.UpdateLiveLeagueTable();
            };
        },
        StartToCatchMatchEnd: function(){
            delete this.StartToCatchMatchEnd;
            Tool.temp.MatchEndCatcher = matchId=> {
                console.log("Match ended: "+matchId);
            };
        }
    }).Initialize();
});

Tool.features.add('SortTournaments','tournament',function(){
    let sectionIdf = 'upcoming',
        withoutIntersect = !0,
        table = $(`#tournaments >div.container.${sectionIdf} >div >table`);
    if(!table.find('>tbody >tr:first').length) return !1;

    let getDateNum = (date) => parseInt(((date=new Date((date=date.split('.'))[2], parseInt(date[1])-1, date[0]))-date.getTimezoneOffset()*60*1e3)/864e5);

    if(!Tool.temp.hasOwnProperty('tournaments_data')){
        $(CreateButton('BtnSortTournaments', GetText('SortTournaments'),'top:55px;'))
            .insertAfter('#button-container-create-own-tournament')
            .click(function(){
            $(this).remove();
            $('#tournaments-handle-container >li.handle').off();
            let total_tournaments = 0,
                tournaments = [], //except credits tournament
                other_pages = table.find('>tfoot >tr >td >a'),
                page_count = 1 + other_pages.length;
            if(page_count == 1) saveTournament(table.find('>tbody'), !0, toolTipObj.data);/*save current page*/
            else{
                let cur_page_num=-1,
                    e = table.find('>tfoot >tr >td >strong');
                if(e.length){
                    cur_page_num = parseInt(e.first().text());
                    saveTournament(table.find('> tbody'), !1, toolTipObj.data);/*save current page*/
                }
                let get_page_count = 0,
                    success_count = 0,
                    fail_count = 0;
                $('#button-container-create-own-tournament').after(
                    `<span style="position: absolute;top: 55px;right: 52px;">`+
                    `   <img src="/designs/redesign/images/icons/loading/16x16.gif" style="vertical-align:middle;margin-right: 3px;">`+
                    `   ${GetText('gettingPage')}: <span id="get_page_count">0</span>/${page_count-1} | ${GetText('success')}: <span id="success_count">0</span> | ${GetText('fail')}: <span id="fail_count">0</span>`+
                    `</span>`
                );
                let always=(data=null)=>{
                    let finish = get_page_count == page_count-1;
                    if(finish) $('#get_page_count').parent().find('img').first().remove();
                    if(data==null) return;
                    saveTournament(data.content, finish, data.tooltip);
                };
                Array.from({length: page_count}, (_, i) => i + 1).forEach(n=>{
                    if(n==cur_page_num) return;
                    Game.getPage(
                        `?area=user&module=tournament&action=index&section=${sectionIdf}&pos${sectionIdf}=${(n-1)*20}&layout=none`,
                        `#tournaments >div.container.${sectionIdf} >div >table >tbody:first`,
                        null, //callback
                        0, //fail counter
                        ['content','tooltip']
                    ).then(data=>{
                        data.tooltip = JSON.parse(data.tooltip);
                        if(!data.content.length || typeof data.tooltip != 'object') throw new Error("There is an error in the requested data.");
                        $('#get_page_count,#success_count').toArray().forEach(e=>{$(e).html(eval("++"+e.id))})
                        always(data)
                    }).catch(err=>{
                        $('#get_page_count,#fail_count').toArray().forEach(e=>{$(e).html(eval("++"+e.id))})
                        console.error(err);
                        always();
                    });
                });
            }

            function saveTournament(tbody, finish, tooltip){
                tbody.find('>tr').each(function(){
                    ++total_tournaments;
                    let row = $(this);
                    // if(row.find('.first-column >.credits').length) return;

                    let tournament_id = row.find('>.info-column >a >img').attr('tooltip').replace(/^tt_/,''),
                        tournament = {
                            has_psw : row.find('.first-column >.password').length!=0,
                            name : row.find('.name-column:first>a').text().trim(),
                            id : tournament_id,
                            tt : tooltip['tt_'+tournament_id],
                            cs : null, //clubs size
                            cr : row.find('.first-column >.credits').length!=0
                        },
                        et = $(tournament.tt);

                    {
                        let t = et.find('.tournament-tooltip-text:first').text();
                        tournament.cs = parseInt(t.substring(t.lastIndexOf('/')+1));
                    }


                    let getPrice = td=> parseInt(td.find('>span.currency-container >span.currency-number').text().replaceAll('.', '')),
                        totalPrice = 0, koo = !1;
                    et.find('table.tournament-prizes >tbody >tr').each(function(i){
                        let row = $(this),
                            td = row.find('>td:last-child:has(>span.currency-container):first');
                        if(td.length==0){
                            let prev = row.prev(), next = row.next();
                            if(prev.length && next.length){
                                let p1 = getPrice(prev.find('>td:last-child:has(>span.currency-container):first')),
                                    p2 = getPrice(next.find('>td:last-child:has(>span.currency-container):first'));
                                if(p1 == p2){
                                    totalPrice += p1*(parseInt(next.find('>td:first').text())-(i+1));
                                    return;
                                }
                            }
                            koo = !0;
                            return !1;
                        }
                        totalPrice += parseInt(td.find('span.currency-container >span.currency-number').text().replaceAll('.', ''));
                    });
                    if(!koo){
                        let a = row.find('>td:nth-child(4) >a:first'),
                            start = row.find('>td:nth-child(5)').text().trim(),
                            end = row.find('>td:nth-child(6)').text().trim();
                        tournaments.push(Object.assign({
                            totalPrice: totalPrice,
                            type: row.find('>td:nth-child(3) >span')[0].className.replace('icon','').trim(),
                            club: {
                                id  : a.attr('clubid'),
                                name: a.text().trim()
                            },
                            start : start,
                            startK: getDateNum(start),
                            end : end,
                            endK: getDateNum(end),
                        }, tournament));
                    }
                    else{
                        console.info(`The tournament named ${tournament.name}[id=${tournament.id}] is not included in the ranking]`);
                    }
                });

                if(finish){
                    Tool.temp.tournaments_data = {
                        tournaments,
                        total: total_tournaments,
                        except: total_tournaments - tournaments.length //Credit tournaments size
                    };
                    if($('#get_page_count').length){
                        let counters = ['page_count', 'get_page_count', 'fail_count'].reduce((acc, n)=>{acc[n] = parseInt($('#'+n).html()); return acc;}, {});
                        Tool.temp.tournaments_data = Object.assign(Tool.temp.tournaments_data, {page_count: page_count-1}, counters );
                    }
                    sortTournaments('money', 'DESC');
                    showTournaments();
                }
            }
        })[$(`#tournaments-handle-container >li[target=".container.${sectionIdf}"]`).hasClass('active')?'show':'hide']();

        $('#tournaments-handle-container >li.handle').click(function(){
            $('#BtnSortTournaments')[$(this).attr('target')==`.container.${sectionIdf}`?'show':'hide']();
        });
    }
    else{
        if(Tool.temp.tournaments_data.hasOwnProperty('page_count')){
            $('#button-container-create-own-tournament').after(
                '<span style="position: absolute;top: 55px;right: 52px;">'+
                `   ${GetText('gettingPage')}: ${Tool.temp.tournaments_data.get_page_count}/${Tool.temp.tournaments_data.page_count} | ${GetText('success')}: ${Tool.temp.tournaments_data.success_count} | ${GetText('fail')}: ${Tool.temp.tournaments_data.fail_count}`+
                '</span>'
            );
        }
        showTournaments(); /*Show saved tournaments*/
    }

    function showTournaments(){
        let thead_row = $('>thead>tr', table).first();
        thead_row.before(
            `<tr style="background:none;">`+
            `   <th colspan="8" style="background-color: #075971;border-radius: 7px 7px 0 0;padding:5px;"><span id="sorted_tournaments_length" style="line-height: 1.4; white-space: break-spaces;">...</span></th>`+
            `</tr>`
        );

        $('>th:nth-child(5),>th:nth-child(6)',thead_row)
            .addClass('sort_tournaments')
            .attr({'sort_type':'date','order_by':'DESC'})
            .css('cursor','pointer')
            .last().after(
            `<th class="sort_tournaments sticky" sort_type="money" order_by="ASC" style="cursor:pointer;">${GetText('totalprice')}</th>`+
            `<th class="sort_tournaments sticky" sort_type="earningPday" order_by="ASC" style="cursor:pointer;" title="${GetText('earningPerDay', {tag:0})}">${GetText('sEarningPerDay')}</th>`
        );
        $('>.sort_tournaments', thead_row).click(function(){
            let order_by = $(this).attr('order_by');
            sortTournaments($(this).attr('sort_type'), order_by);
            updateTbody();
            $(this).attr('order_by',order_by=='ASC'?'DESC':'ASC');
        });

        $('>tfoot', table).html('');

        let ownTournaments = [],
            own_tbody = $('#tournaments >div.container.own >div >table >tbody');
        if(own_tbody.find('.info-column').length){
            own_tbody.find('tr').each(function(){
                let icon = $(this).find('>td.first-column> span.icon'),
                    tournament = {
                        id: $(this).find('>td.info-column>a>img[tooltip]').attr('tooltip').replace('tt_',''),
                        type:'normal'
                    };
                if(icon.length){
                    if(icon.hasClass('password')) tournament.has_psw = true;
                    if(icon.hasClass('credits')) tournament.type='credits';
                    else if(icon.hasClass('tournament')) tournament.type='special';
                }
                ownTournaments.push(Object.assign({
                    s: getDateNum($(this).find('td:nth-child(4)').text().trim()),
                    e: getDateNum($(this).find('td:nth-child(5)').text().trim())
                },tournament));
            });
        }

        let tbody = $('>tbody', table),
            isTournamentIntersect = ({startK:s, endK:e})=> ownTournaments.filter(t2=>t2.type!='special').find(t => (e>=t.s && e<=t.e) || (s>=t.s && s<=t.e) || (s<t.s && t.e<e) || (t.s<s && e<t.e));
        updateTbody()

        function updateTbody(){
            tbody.html('');
            let intersect=0,
                i=0;
            Tool.temp.tournaments_data.tournaments.forEach((t)=>{
                let bc = "";
                if(sectionIdf=="upcoming" && withoutIntersect && isTournamentIntersect(t)){
                    ++intersect;
                    return;
                    bc = "#0009"; // or set background-color:#00000099
                }
                let icon = [];
                if(t.has_psw) icon.push('password');
                if(t.cr) icon.push('credits');
                tbody.append(
                    `<tr class="${i++%2?"even":"odd"}"${bc==""?"":` style="background-color:${bc}"`}>`+
                    `   <td class="first-column">${icon.length?`<span class="icon ${icon.join(' ')}"></span>`:``}</td>`+
                    `   <td class="name-column">`+
                    `      <a href="#/index.php?w=${worldId}&area=user&module=tournament&action=tournament&tournament=${t.id}">${t.name}</a>`+
                    `   </td>`+
                    `   <td>`+
                    `      <span class="icon ${t.type}" tooltip="tt_tournament_type_${t.type}"></span>`+
                    `   </td>`+
                    `   <td class="name-column">`+
                    `      <div class="club-logo-container"></div>`+
                    `      <a href="#/index.php?w=${worldId}&area=user&module=profile&action=show&clubId=${t.club.id}" clubid="${t.club.id}">${t.club.name}</a>`+
                    `   </td>`+
                    `   <td class="date-column" sortvalue="${t.startK}">${t.start}</td>`+
                    `   <td class="date-column" sortvalue="${t.endK}">${t.end}</td>`+
                    `   <td>${t.totalPrice.toLocaleString()}</td>`+
                    `   <td>${Number2String(t.totalPrice/(t.cs*(t.endK-t.startK+1)), 2)}</td>`+
                    `   <td class="last-column info-column">`+
                    `      <a href="#/index.php?w=${worldId}&area=user&module=tournament&action=tournament&tournament=${t.id}">`+
                    `         <img src="/designs/redesign/images/icons/tooltip.gif" name="__tooltip" tooltip="tt_${t.id}">`+
                    `      </a>`+
                    `   </td>`+
                    `</tr>`
                );
                if(!toolTipObj.data.hasOwnProperty('tt_'+t.id)) toolTipObj.data['tt_'+t.id] = t.tt;
            });
            let total = Tool.temp.tournaments_data.total,
                except = Tool.temp.tournaments_data.except,
                attended = ownTournaments.length,
                shown = tbody.find('>tr').length,
                lines=[GetText('Tournament_total', {args:[`<font color="chartreuse">${total}</font>`]})],
                missing=0;

            if(except){
                lines.push(GetText('Tournament_except', {args:[`<font color="crimson">${except}</font>`]}));
                missing+=except;
            }
            if(intersect){
                if(missing==0){
                    lines.push(GetText('Tournament_intersect_1', {args:[`<font color="crimson">${intersect}</font>`, `<font color="chartreuse">${total}</font>`, `<font color="darkturquoise">${attended}</font>`]}));
                }
                else{
                    lines.push(GetText('Tournament_intersect_2', {args:[`<font color="crimson">${intersect}</font>`, `<font color="chocolate">${total-except}</font>`, `<font color="darkturquoise">${attended}</font>`]}));
                }
                missing+=intersect;
            }
            if(shown<total-missing){
                lines.push(GetText('Tournament_unknown', {args:[`<font color="crimson">${(total-missing)-shown}</font>`]}));
                missing+=(total-missing)-shown;
            }
            if(missing==0) lines[0]+=" "+GetText('Tournament_end_1', {args:[]});
            else{
                lines.push(GetText('Tournament_end_2', {args:[`<font color="mediumspringgreen" style="font-size: 15px;">${shown}</font>`]}));
            }
            $('#sorted_tournaments_length').html(lines.join('<br>'));
        }
    }
    function sortTournaments(type, order_by='DESC'){
        order_by=order_by=='DESC'?1:-1;
        switch(type){
            case "money":
                Tool.temp.tournaments_data.tournaments.sort((a,b)=>order_by*(b.totalPrice-a.totalPrice));
                break;
            case "date":
                Tool.temp.tournaments_data.tournaments.sort((a,b)=>order_by*(a.startK-b.startK));
                break;
            case "earningPday":
                Tool.temp.tournaments_data.tournaments.sort((a,b)=>order_by*((b.totalPrice/(b.cs*(b.endK-b.startK+1)))-(a.totalPrice/(a.cs*(a.endK-a.startK+1)))));
                break;
        }
    }
});
Tool.features.add('PartipicatedTournaments', 'tournament', function(){
    try{
        let getDateNum = (date) => parseInt(((date=new Date((date=date.split('.'))[2],parseInt(date[1])-1,date[0]))-date.getTimezoneOffset()*60*1000)/86400000);
        let partipicatedTournaments = $('#tournaments > div.container.own  tbody:first > tr').toArray()
        .filter(tr=> !$('> td.first-column > span.icon.tournament', tr).length )
        .map(tr => {
            let a = $('>td.name-column>a', tr);
            let u  = new URLSearchParams(a.attr('href'));
            let dates = $('>td.date-column', tr),
                sd = dates[0].textContent.match(/\d{2}\.\d{2}\.\d{4}/)[0],
                ed = dates[1].textContent.match(/\d{2}\.\d{2}\.\d{4}/)[0];
            return {
                i: u.get('tournament'),
                n: a.text().trim(),
                sd,
                ed,
                s: getDateNum(sd),
                e: getDateNum(ed)
            };
        }).filter( t=> !isNaN(t.i));
        let isTournamentIntersect = (s, e)=> partipicatedTournaments.find(t => (e>=t.s && e<=t.e) || (s>=t.s && s<=t.e) || (s<t.s && t.e<e) || (t.s<s && e<t.e));

        $('#tournaments >div.container.upcoming tbody:first >tr').each(function(){
            let u  = new URLSearchParams($('>td.name-column>a', this).first().attr('href')),
                id = u.get('tournament');
            if(!partipicatedTournaments.find(t=> t.i == id)){
                let dates = $('>td.date-column', this),
                    s = getDateNum(dates[0].textContent.match(/\d{2}\.\d{2}\.\d{4}/)[0]),
                    e = getDateNum(dates[1].textContent.match(/\d{2}\.\d{2}\.\d{4}/)[0]), t;
                if(t = isTournamentIntersect(s, e)){
                    $(this).css('background-color', 'rgb(0 0 0 / 50%)').attr('title', GetText('tournamentIntersectWith', {tag:0, args:[t.n, `[${t.sd} - ${t.ed}]`]}) );
                    dates.css('color', '#30acb9');
                }
                return true;
            }

            $(this).css('background-color', 'rgb(0 63 127 / 60%)');
        });

    }
    catch(err){
        console.error(err);
        return false;
    }
});

Tool.features.add('ChatNotifier', 'global', function(){ // to solve the problem of scrolling to the bottom when reading old messages in chat and to adding new features
    console.log('%cChatNotifier RUN', 'font-weight:bold; color:blue; font-size:25px;');
    GM_addStyle(`@keyframes opacityAnimation { 0% { opacity: 0.1; } 50% { opacity: 1; } 100% { opacity: 0.1; } } .opacityAnim{animation: opacityAnimation 2s infinite;}`);

    //DATAS
    let chatFrame = $('#chatFrame');
    let messages =  $('#messages', chatFrame);
    if(!messages.length) return !1;
    let cntrl = /*unsafeWindow.cntrl =*/ Tool.ChatNotifier = {
        unreadMessages : 0, //unread messages count
        scrolledToBottom: !0,
        notifSound : !!Tool.getVal('settings', {notifSound:!0}).notifSound, //notif sound active or deactive
        imgs: { //chat bell images
            chatBell: Tool.sources.get('chatBell'),
            chatBellDeaktive: Tool.sources.get('chatBellDeaktive')
        }
    };

    //OTHERS
    //Audio: Notif Sound
    $('#chatFrame').append($('<audio id="notifSound"></audio>').attr('src', 'https://media1.vocaroo.com/mp3/1ySsXoxDJixl'));

    //ACTIONS
    let unreadmessagesHaveBeenRead = ()=>{
        if(cntrl.unreadMessages == 0 ) return;
        backToOriginalTitle();

        cntrl.unreadMessages = 0;

        console.log('unreadmessagesHaveBeenRead');
        $('#chatBell').fadeOut(500, function(){
            $(this).remove();
        });
        let unreadMessages = messages.find('>li.unread').removeClass('unread').each(function(i){
            setTimeout(()=> $(this).css('background-color',''), 50*i);
        });
        setTimeout(()=>{
            unreadMessages.css('transition', '');
        }, 2000);
    };
    let playNotifSound = ()=>{
        let notifSound = $('#notifSound')[0];
        if(!notifSound) return;
        if(!notifSound.paused) notifSound.pause();
        notifSound.currentTime = 0;
        notifSound.play();
    };
    let writeUnreadCountOnTitle = ()=>{
        if(cntrl.unreadMessages==0) return backToOriginalTitle();

        let title = document.title.trim(), idx = title.lastIndexOf(' ');
        if(idx != -1) title = title.substring(0,  idx);
        title += ` (${cntrl.unreadMessages})`;
        document.title = title;
    };
    let backToOriginalTitle = ()=>{
        let title = document.title.trim(), idx = title.lastIndexOf(' ');
        if(idx != -1) document.title = title.substring(0, idx);
    };

    //LISTENERS
    //Controlling if scrollbar to scroll to bottom
    messages.on('scroll', function() {
        let old = cntrl.scrolledToBottom;
        cntrl.scrolledToBottom = ((this.scrollHeight - (this.scrollTop + this.clientHeight)) < 1)

        if(old != cntrl.scrolledToBottom){
            if(cntrl.scrolledToBottom){
                //scrollbar of message box scrolled to the bottom
                console.log("cntrl.scrolledToBottom = true");
                unreadmessagesHaveBeenRead();
            }
            else console.log("cntrl.scrolledToBottom = false");
        }
    });

    //To active|deactive notification sound
    $('#chatFrame #chat').on('click', '#chatBell', function(){
        let settings = Tool.getVal('settings', {});
        let sound = settings.notifSound = cntrl.notifSound = !cntrl.notifSound;
        Tool.setVal('settings', settings);
        $('>img:first', this).attr('src', cntrl.imgs[sound?'chatBell':'chatBellDeaktive']).css('cursor','pointer');
    });

    try{
        { //chatToggleBtn
            let events = unsafeWindow.jQuery._data($('#chatToggleBtn')[0], "events");
            let clickEvent = events.click[0].handler;
            delete events.click;
            unsafeWindow.jQuery('#chatToggleBtn').click(new unsafeWindow.Function(((codes)=>{
                let idx = codes.indexOf('Cookies.set'); if(idx == -1) throw new Error("idx=-1");
                codes = codes.substring(0, idx) + GetFuncContent(()=>{
                    //chat closing
                    if(toolPipe('Tool').ChatNotifier.unreadMessages>0) $(this).addClass('opacityAnim');
                }) + codes.substring(idx);

                idx = codes.lastIndexOf('Cookies.set'); if(idx == -1) throw new Error("idx=-1");
                codes = codes.substring(0, idx) + GetFuncContent(()=>{
                    //chat opening
                    $(this).removeClass('opacityAnim');
                }) + codes.substring(idx);

                idx = codes.lastIndexOf('messageScrollDown'); if(idx == -1) throw new Error("idx=-1");
                codes = codes.substring(0, idx) + GetFuncContent(()=>{
                    //chat opening and scrolling to down asap
                    toolPipe(Tool=> Tool.chatOpeningHandler());
                }) + codes.substring(idx);
                return codes;
            })(GetFuncContent(clickEvent)))); clickEvent = undefined;
        }

        let chatOpening = !1, channelChanging=!1;

        Tool.chatOpeningHandler = function(){
            console.log('chat openning and scrolling to down..')
            chatOpening = !0;
        };

        { //Channel changing
            let event = unsafeWindow.jQuery._data($('#channels')[0], 'events').click.find(e=>e.selector == 'li');
            let handler = event.handler;
            event.handler = function(){
                channelChanging = !0;

                {//reset
                    $('#chatBell').remove();
                    cntrl.unreadMessages = 0;
                    cntrl.scrolledToBottom = !0;
                }

                handler.apply(this, arguments);

                setTimeout(()=>{
                    channelChanging = !1;
                }, 4000);
            }
        }

        //New item is added into messages list
        (new MutationObserver(e=> {
            let addedNodes = e[0].addedNodes;
            addedNodes.forEach(li=>{
                li = $(li);

                let ownMessage = 0 != li.find('>.msg_own:first').length;
                if(!li.find('>.msg_username_public:first').length){
                    cntrl.scrolledToBottom = !0;
                    return;
                }
                //io.on('chat message') event emitted

                if(Game.server == "tr"){ //To correct the 1 hour difference between chat time and tr time
                    let fc = $(li.contents()[0]);
                    let time = fc[0].textContent.trim().replace(/^\[/,'').replace(/\]$/,'').split(':').map(n=>parseInt(n)); //"[ 13:27:51 ] " -> " 13:27:51 " -> ...
                    time[0] = (time[0]+1)%24;
                    fc.after(`<font>[ ${time.map(n=>(n<10?"0":"")+n).join(':')} ]</font> `);
                    fc.remove();
                }

                if(channelChanging) return;

                let chatVisible = Cookies.get("chatVisible")=="1";
                if(!document.hidden && chatVisible && cntrl.scrolledToBottom){
                    li.css({'background-color':'limegreen', 'transition':'2s'});
                    setTimeout(()=>{
                        li.css('background-color','');
                        setTimeout(()=> li.css('transition', ''), 2000);
                    }, 2000);
                }
                else{
                    cntrl.scrolledToBottom = !1;
                    li.css({'background-color':'limegreen', 'transition':'2s'}).addClass('unread');
                    ++cntrl.unreadMessages;

                    let chatBell = $('#chatBell');
                    if(!chatBell.length){
                        chatBell =  $(
                            `<div id="chatBell" style="position:absolute;right: 16px;bottom: 37px; cursor:pointer;">`+
                            `   <img src="${cntrl.imgs[cntrl.notifSound?'chatBell':'chatBellDeaktive']}" style="height: 24px;">`+
                            `   <span style=" position: absolute; right: -6px; top: 2px; font-size: 8px; color: white; background-color: #ff2d2d; padding: 1px; border-radius: 50%; width: 13px; height: 12px; text-align: center; line-height: 10px; box-sizing: border-box; "></span>`+
                            `</div>`
                        );
                        $('#chatFrame #chat').append(chatBell);
                    }
                    chatBell.find('>span:first').html(cntrl.unreadMessages);

                    if(!chatVisible) $('#chatToggleBtn').addClass('opacityAnim');

                    if(document.hidden) writeUnreadCountOnTitle();
                }

                if(!document.hidden && cntrl.notifSound && !ownMessage) playNotifSound();


            });
        })).observe(messages[0], { childList: !0 });

        //Modify messageScrollDown
        {
            let old_messageScrollDown = unsafeWindow.messageScrollDown;
            unsafeWindow.messageScrollDown = async function(){
                await (function sleep(ms){return new Promise(res=> setTimeout(res, ms))})(10);
                if(chatOpening){
                    chatOpening = !1;
                    if(cntrl.unreadMessages>0) return;
                }
                else if(cntrl.unreadMessages>0) return;

                old_messageScrollDown();
            };
        }

        document.addEventListener("visibilitychange", function() {
            if(document.hidden) writeUnreadCountOnTitle();
            else backToOriginalTitle();
        });

    }
    catch(err){
        console.error(err);
        return !1;
    }
}, null, null, {refreshWhenDeactivate:!0, runOnlyOneTime:!0});

Tool.features.add('LeagueStatus', 'league', function(){
    let leagueVal = $('#leagueCatalogueForm select[name="leagues[0]"]>option[selected]').val(),
        images = {
            advancement: {src:Tool.sources.get('up'), height:14, width:19, left:2, top:9},
            relegation : {src:Tool.sources.get('down'), height:14, width:19, left:2, top:9},
            euroLeague : {src:Tool.sources.get('europaligaCup'), height:26, left:7, top:4},
            championsLeague : {src:Tool.sources.get('championsLeagueCup'), height:26, left:3, top:2},
            bundesliga : {src:Tool.sources.get('bundesligaCup'), height:23, left:0.5, top:4},
            const : {src:Tool.sources.get('const'), height:18, left:0.5, top:7.5}
        },
        tbody = $('#statistics-league-table >tbody'),
        rows = $('>tr', tbody),
        clubCount = rows.length,
        matchCount = (clubCount-1)*2,
        playedMatchCount = parseInt(rows.first().find('>td:nth-child(4)').text()),
        remainingMatchCount = matchCount - playedMatchCount,
        rowPoint = row=> parseInt($('>:last-child', row).text()),
        remainingMatchPoints = remainingMatchCount*3,
        check = (rows2, image, c=!0)=>{
            let comparedClub = { points: rowPoint(c?rows.eq(rows2.index() + rows2.length): rows2.first().prev()) };
            return [
                rows2.filter(function(){
                    let row = $(this);
                    let point = rowPoint(row);
                    let diff = c? point - (comparedClub.points + remainingMatchPoints): comparedClub.points - (point + remainingMatchPoints);
                    if(diff>0 || remainingMatchCount==0){
                        addImage(row, image);
                        return !0;
                    }
                    return !1;
                }),
                rows2
            ];
        },
        addImage = (row, image)=>{
            let img = $(`<img src="${image.src}" style="position: absolute;left: ${image.left}px;top: ${image.top}px;">`).css({
                'height': image.height,
                'width' : image.width
            });
            $('>:first-child', row).css('position','relative').append(img);
            return img;
        },
        defaultClubRow = null,
        ownLeague = rows.toArray().find(row=>{
            row = $(row);
            if(row.find('>td:nth-child(3)>a[clubid].self-link').length==0) return !1;
            defaultClubRow = row;
            return !0;
        }) != undefined,
        notCertain = (a, b)=>{
            let comparedClub = { points: rowPoint(b.first().prev()) };
            a.each(function(){
                let row = $(this);
                let point = rowPoint(row);
                let diff = (point+remainingMatchPoints) - comparedClub.points;
                if(diff>0 || (diff==0 && remainingMatchCount>0)) $('>:first-child >img', row).css('opacity', 0.5);
                else return !1;
            });
        }
    if(defaultClubRow == null){
        rows.each(function(){
            let classes = this.className.split(' ');
            if(classes.length!=1) return;
            if(classes[0] != 'odd' && classes[0] != 'even') return;
            defaultClubRow = $(this);
            return !1;
        });
    }

    if(leagueVal!=8){
        //find clubs that guaranteed league up
        check(tbody.find('>.advancement'), images.advancement);
    }
    else{
        let res;

        //euro-league control
        res = check(tbody.find('>.euro-league'), images.euroLeague);
        if(res[0].length) notCertain(...res);

        //champions-league control
        res = check(tbody.find('>.champions-league'), images.championsLeague);
        if(res[0].length) notCertain(...res);


        //leadership control
        let leaderRow = rows.first(), leaderPoint = rowPoint(leaderRow), secondPoint = rowPoint(leaderRow.next()), thirdPoint = rowPoint(leaderRow.next().next()),
            diff = leaderPoint - (secondPoint+remainingMatchPoints),
            diff2 = leaderPoint - (thirdPoint+remainingMatchPoints);
        if(diff>0 || remainingMatchCount==0) addImage(leaderRow, images.bundesliga);
        else if(diff2>0 || remainingMatchCount==0) addImage(leaderRow, images.bundesliga).css('opacity', .5);
    }

    if(leagueVal!=1) //find clubs that guaranteed league down
        check(tbody.find('>.relegation'), images.relegation, !1);

    {
        let rows = tbody.find('>[class="odd"],>[class="even"]');
        let oppPoint1 = rowPoint(rows.first().prev()),
            oppPoint2 = leagueVal!=1?rowPoint(rows.last().next()):-100;
        rows.each(function(){
            let row = $(this), point = rowPoint(row);
            let diff1 = oppPoint1 - (point + remainingMatchPoints),
                diff2 = point - (oppPoint2 + remainingMatchPoints);
            if((diff1>0 || (diff1==0 && remainingMatchCount==0)) && (diff2>0 || (diff2==0 && remainingMatchCount==0))) addImage(row, images.const);
        });
    }
    tbody = undefined;

    if(remainingMatchCount>0){
        let td;
        rows.mouseenter(function(){
            if(td){ //RESET
                td.css('color', '').find('>.line').remove();
            }

            let row = $(this);
            let point = rowPoint(row);
            let ableToUp = 0, ableToDown = 0, lineHeights1=0, lineHeights2=0;
            let temp = row;
            while((temp=temp.prev()) && (point+remainingMatchPoints)>=rowPoint(temp)){ ++ableToUp; lineHeights1+=temp.height();}
            if(ableToUp) lineHeights1-=rows.eq(row.index()-ableToUp).height()/2;

            temp = row;
            while((temp=temp.next()) && (rowPoint(temp)+remainingMatchPoints)>=point){ ++ableToDown; lineHeights2+=temp.height();}
            if(ableToDown) lineHeights2-=rows.eq(row.index()-ableToDown).height()/2;

            td = row.find('>:first').css({'position':'relative','color':'white'});

            if(ableToUp>0){
                //bottom-horizontal line
                let top = -5+$(row).height()/2;
                td.append(`<span class="line" style="display:block; position:absolute; width:10px; height:5px; background-color:green; left:-10px; top:${top}px;"></span>`);

                //middle-vertical line
                lineHeights1 += $(row).height()/2 - 5/2;
                top = top-lineHeights1;
                td.append(`<span class="line" style="display:block; position:absolute; width:5px; height:${lineHeights1}px; background-color:green; left:-10px; top:${top}px;"></span>`);

                //top-horizontal line
                top -= 5;
                td.append(`<span class="line" style="display:block; position:absolute; width:10px; height:5px; background-color:green; left:-10px; top:${top}px;"></span>`);
            }

            if(ableToDown>0){
                //top-horizontal line
                let top = ($(row).height()-5)/2;
                td.append(`<span class="line" style="display:block; position:absolute; width:10px; height:5px; background-color:maroon; left:-10px; top:${top}px;"></span>`);

                //middle-vertical line
                lineHeights2 += $(row).height()/2 - 5/2;
                td.append(`<span class="line" style="display:block; position:absolute; width:5px; height:${lineHeights2}px; background-color:maroon; left:-10px; top:${top}px;"></span>`);

                //bottom-horizontal line
                top += lineHeights2;
                td.append(`<span class="line" style="display:block; position:absolute; width:10px; height:5px; background-color:maroon; left:-10px; top:${top}px;"></span>`);
            }


        }).mouseleave(function(){
            if(td){ //RESET
                td.css('color', '').find('>.line').remove();
            }
            defaultClubRow.trigger('mouseenter');
        });
        defaultClubRow.trigger('mouseenter');
    }

});



(async ()=>{
    await Tool.updateLayoutModified;
    delete Tool.updateLayoutModified;
    Tool.start().catch(err=>{
        console.error("Tool.start error: %o", err);
    });
})();

//FUNCTIONS
function CatchError(e,where){
    console.log(`%c[FCUP-SCRİPT] %cERROR%c | ${e}%c\tIn${where}: %o`,'color:blue;font-weight:bold;','color:red;','','float:right;color:green;', e);
}

function SecToTime(s){
    //Converts seconds to [d [day|days]] hh:mm:ss
    if(s<0) return '-';
    let m = 0,h = 0,t='';
    if(s>59)
        if((m = parseInt(s/60))>59)
            if((h = parseInt(m/60))>23)
                t = parseInt(h/24)+' '+(h<48?GetText('aDay'):GetText('Days'))+' ';
    return t + Pad2(h%24)+':'+Pad2(m%60)+':'+Pad2(s%60);
}
function GetDateText(ms){
    // Converts milliseconds to d.m.Y H:i:s date format
    let d = new Date(ms);
    return Pad2(d.getDate())+"."+
        Pad2(d.getMonth()+1)+"."+
        d.getFullYear()+' '+
        Pad2(d.getHours())+":"+
        Pad2(d.getMinutes())+":"+
        Pad2(d.getSeconds());
}
function GetDateFromText(text){
    text = text.split(' ');
    text[0] = text[0].split('.');
    text[1] = text[1].split(':');
    return new Date(text[0][2], parseInt(text[0][1])-1, text[0][0], ...text[1]);
}

function Pad2(a){
    return (a<10?"0":"")+a;
}
function Number2String(n, decimal=0){
    let d="";
    if(parseInt(n) != n) {
        n = n.toString().split('.');
        if(decimal>0){
            d = n[1].substr(0, decimal);
            let idx = d.split('').reverse().join('').search(/[1-9]/);
            if(idx!=-1){
                idx = d.length-idx;
                if(idx > 0) d = d.substring(0, idx);
            }
            if(d!="") d=","+d;
        }
        n = n[0];
    }
    else n = n.toString();
    n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return n+d;
}
function GetOffset(el){
    let x = 0,y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {top: y, left: x};
}
function GetFuncContent(func){
    return (func=func.toString()).substring(func.indexOf('{')+1, func.lastIndexOf('}'));
}
function FeatureGetByName(n){ return this.find(f=>f.name==n); }
function PageGetByName(n){
    let names = n.split('->'), l = names.length, page;
    try{
        n = names.shift();
        page = this.find(p=> p.name == n);
        while(--l>0){
            n = names.shift();
            page = page.sub_pages.find(p=> p.name == n); //eslint-disable-line no-loop-func
        }
    }
    catch(e){
        page = undefined;
    }
    return page;
}

function DownloadAsTextFile(text,filename){
    let object_URL = URL.createObjectURL(new Blob([text], {type: "text/plain"}));
    $('<a>').attr({'href':object_URL,'download':(filename||'Fcup Script Datas')+'.txt'})[0].click();
    URL.revokeObjectURL(object_URL);
}
function ReadTextFile(func){
    $('<input type="file" accept="text/plain">').change(function(e){
        let file = this.files[0];
        if(file.type == 'text/plain') {
            let reader = new FileReader();
            reader.onload = ()=> { func(reader.result); };
            reader.readAsText(file);
        }
    }).click();
}

function ShowDialog(header/*or header.content*/, div/*or div.content*/, centerVertically=!0, show=!0){
    if(!$.isPlainObject(div)) div = {content:div};
    if(!$.isPlainObject(header)) header = {content:header};

    let focus = $('<div>').attr('id',div.id || null).css({
        'padding'   : '15px',
        'width'     : '580px',
        'wordWrap'  : 'break-word',
        'textAlign' : 'center!important',
        'box-sizing': 'border-box'
    }).css(div.css || {}).addClass('focus visible').addClass(div.class || "container").html(div.content || '');
    if(!div.hasOwnProperty('footer') || !!div.footer) focus.append('<div class="footer"></div>');
    if(!div.hasOwnProperty('close') || !!div.close) focus.append('<div class="close"></div>');

    let h2 = $('<h2>').css('text-align', 'center').css(header.css || {}).html(header.content || '').css({
        width        : '100%',
        paddingLeft  : '0px',
        paddingRight : '0px',
        top          : '0px',
        transform    : 'translateY(-100%)'
    });
    focus.prepend(h2);

    let parent = $('#container');
    parent.append(focus);

    let minTopOffset = 190, topOffset = minTopOffset;
    $('#container > .shadow').show();
    $('html').animate({ scrollTop: 0 }, 'fast');

    if(centerVertically) topOffset = ($(window).innerHeight() - (focus.innerHeight() + h2.innerHeight())) / 2;
    focus.css({
        'position': 'absolute',
        'top'     : Math.max(minTopOffset, topOffset) + 'px',
        'left'    : ($(window).scrollLeft() + ($(window).innerWidth() / 2) - (focus.width() / 2 + parent.offset().left)) + 'px' //Center horizontally
    });

    return focus;
}
function WaitDialogClosed(dialog){
    return new Promise((res, rej)=>{
        let mo = new MutationObserver(e=> {
            if (e[0].removedNodes[0] == dialog[0]){
                mo.disconnect();
                return res();
            }
        });
        mo.observe(dialog[0].parentElement, { childList: true });
    });
}
function CreateButton(id, value, buttonStyle='', spanStyle=''){
    return `<span${id?` id="${id}"`:''} class="button disHighlight" style="cursor:pointer; ${buttonStyle}">`+
        `   <a class="button" style="text-decoration:none;">`+
        `      <span style="${spanStyle}">${value}</span>`+
        `   </a>`+
        `</span>`;
}
function BlinkEvent(e, duration, duration2=2500, times=5){
    times = Math.max(times,1);
    if(e.attr('BlinkEvent')!=undefined){
        if(e.attr('BlinkEvent')!=0){
            e.attr('BlinkEvent',times);
            return;
        }
        else e.attr('BlinkEvent',times);
    }
    e.attr('BlinkEvent',times);
    e.css('background-color','#910e0ea8');
    f();
    let blink = setInterval(f, duration);
    function f(){
        e.fadeOut(duration/2);
        e.fadeIn(duration/2);
        let times = parseInt(e.attr('BlinkEvent'))||1;
        e.attr('BlinkEvent',--times);
        if(times<1){
            clearInterval(blink);
            setTimeout(()=>{
                if(e.attr('BlinkEvent')==0){
                    e.css('transition','background-color 1s').css('background-color','');
                    setTimeout(()=>{
                        if(e.attr('BlinkEvent')==0){
                            e.css('transition','');
                            e.removeAttr('BlinkEvent');
                        }
                    },1000);
                }
            },duration2);
        }
    }
}
function CreatePager(e, currentPage, pagesCount, contentCount, pageChange=()=>{}){
    let createPageLabel = page=> `<label class="page" style="color:white; cursor:pointer; text-decoration:underline;">${page}</label> | `,
        text = '';

    //left
    if(currentPage>=15){
        for(let i = 1 ; i <=3 ; i++) text+=createPageLabel(i);
        text+='... | ';
        for(let i = currentPage-10 ; i < currentPage ; i++) text+=createPageLabel(i);
    }
    else{
        for(let i = 1 ; i < currentPage ; i++) text+=createPageLabel(i);
    }

    //middle
    text+='<strong>'+currentPage+'</strong>'+(currentPage!=pagesCount?' | ':'');

    //right
    if(currentPage<=pagesCount-14){
        for(let i = currentPage+1 ; i<=currentPage+10; i++) text+=createPageLabel(i);
        text+='... | ';
        for(let i = pagesCount-2 ; i < pagesCount ; i++) text+=createPageLabel(i);
    }
    else{
        for(let i = currentPage+1 ; i < pagesCount ; i++) text+=createPageLabel(i);
    }

    if(currentPage!==pagesCount) text+=`<label class="page" style="color:white; cursor:pointer; text-decoration:underline;">${pagesCount}</label>`;
    text+=' '+GetText('total')+' : '+contentCount;

    //insert pager's
    e.prev('div.pager').add(e.next('div.pager')).remove();
    text = '<div class="pager">' + text + '</div>';
    e.before(text).after(text);

    //listen click the page
    e.prev('div.pager').add(e.next('div.pager')).find('>.page').click(pageChange);
}

function SaveLeagueData(cntnt){
    if(cntnt.find('.date-selector').length==0) return false;
    if(cntnt.find('div.table-container table > tbody a[clubid][class*="self-link"]').length==0) return false;

    let match_weeks = cntnt.find('.date-selector > ul >li.day').length,
        date = $('div > div.table-container > h3',cntnt)[0].textContent, // "Spieltag: 2 - 13.09.2020 18:00:00"
        idx1 = date.indexOf(':');
    if(idx1==-1) return false;
    idx1++;
    let idx2 = date.indexOf('-',idx1+1);
    if(idx2==-1) return false;
    let match_day_number = parseInt(date.substring(idx1,idx2)); //Exp: Return 2
    idx2++;
    let lastMatchDate = date.substring(idx2,date.indexOf(' ',date.indexOf('.',idx2+1)+1)).trim().split('.'),
        addDay = match_weeks-match_day_number,
        aDay = 24*60*60*1000; // ms
    if(match_day_number<match_weeks/2) addDay+=3; //League break days
    lastMatchDate = new Date(lastMatchDate[2],parseInt(lastMatchDate[1])-1,parseInt(lastMatchDate[0])+addDay).getTime();

    if(lastMatchDate+aDay<=Game.getTime()) return false;

    let firstMatchDate = lastMatchDate-(match_weeks-1+3)*aDay,
        firstHalfFinalMatchDate = firstMatchDate+(match_weeks/2-1)*aDay,
        clubs = {};
    cntnt.find('div.table-container table >tbody .name-column').each(function(){
        let a = $(this).find('a:first'),
            clubId = a.attr('clubid');
        if(clubId==Tool.clubId) return;
        clubs[clubId] = a.text().trim();
    });

    let LeagueData = {
        league                 : cntnt.find('select:first > option:selected').text().trim(),
        firstMatchDate         : firstMatchDate,
        firstHalfFinalMatchDate: firstHalfFinalMatchDate,
        lastMatchDate          : lastMatchDate,
        clubs                  : clubs
    };
    Tool.setVal('LeagueData',LeagueData);
    return LeagueData;
}
function GetDecimalPartOfAging(prevAgingTime, nextAgingTime, time){
    if(!Array(...arguments).every(d=>d instanceof Date)) return null;

    let days = parseInt((nextAgingTime.getTime()-prevAgingTime.getTime())/86400000),
        passingDay = parseInt((time.getTime()-prevAgingTime.getTime())/86400000);
    let res = Number2String(passingDay/days, 2);//.toFixed(2).replace(/.00$/,'').replace(/(.[1-9])0$/,'$1');
    if(res == 1) res = '0,99';
    return res==0?',00':res.substring(res.indexOf(','));
}

function IsYoungPlayer(td){
    return $(td).find('[tooltip="tt_extendNotPossibleJunior"]').length;
}
function GetRealStrength(skills,position){
    // skills: Float Array(14), positions: String
    let strengthFactors = Tool.strengthFactors[position];
    if(!Array.isArray(strengthFactors)) return "-";
    return strengthFactors.reduce((acc,i)=>acc+skills[i[0]]/28*i[1], 0);
}
function FindNumberOfTrainings(start,end){
    // start and end are dates ms
    if(end <= start) return {normal: 0, premium: 0};

    let normalTrainingsTimeCycle = [
        [36000, 54000],
        [36000, 54000],
        [25200, 36000, 54000],
        [36000, 54000]
    ],  premiumTrainingsTimeCycle = [[25200],[],[],[]],
        daysPerCyle = normalTrainingsTimeCycle.length,
        normalTrainingsInACycle = normalTrainingsTimeCycle.reduce((acc,v)=>acc+v.length,0),
        premiumTrainingsInACycle = premiumTrainingsTimeCycle.reduce((acc,v)=>acc+v.length,0),
        startDate = new Date(start),
        endDate = new Date(end),
        msInADay = 86400000,
        getDaySeconds = (date)=>(date.getHours()*60 + date.getMinutes())*60+ date.getSeconds(), //Return [0,86400]
        getDayIndex = (date)=>parseInt((date.getTime()-date.getTimezoneOffset()*60*1000)/msInADay)%daysPerCyle,
        normalTrainings = 0,
        premiumTrainings = 0,
        addDayTrainings = (date,dayIndex,after=!0)=>{
            let f=after?1:-1, daySeconds = getDaySeconds(date)*f;
            normalTrainings += normalTrainingsTimeCycle[dayIndex].filter(time=>time*f>daySeconds).length;
            premiumTrainings += premiumTrainingsTimeCycle[dayIndex].filter(time=>time*f>daySeconds).length;
            return dayIndex;
        },
        getDaysBetweenDates = (s,e)=> (new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime() - new Date(s.getFullYear(),s.getMonth(),s.getDate()).getTime())/msInADay-1;

    let days = getDaysBetweenDates(startDate,endDate),
        dayIndex = getDayIndex(startDate);
    if(days!=-1){
        // 1- Calculate the day index using the start date and add trainings in the starting day.
        addDayTrainings(startDate, dayIndex);

        // 2- Başlangıç ve bitiş günleri arasındaki gün sayısını bul. Gün sayısını kullanarak döngü sayısını bul. Döngü kadar antrenman ekle
        let cycle_count = parseInt(days/daysPerCyle);
        normalTrainings += cycle_count*normalTrainingsInACycle;
        premiumTrainings += cycle_count*premiumTrainingsInACycle;

        // 3- Döngüsü tamamlanmamış günleri tek tek ekle
        for(let i=0,len=days%daysPerCyle; i<len; i++){
            dayIndex = (dayIndex+1)%daysPerCyle;
            normalTrainings += normalTrainingsTimeCycle[dayIndex].length;
            premiumTrainings += premiumTrainingsTimeCycle[dayIndex].length;
        }
    }
    else{
        if(dayIndex == getDayIndex(endDate)){
            addDayTrainings(startDate, dayIndex, !1);
            normalTrainings*=-1;
            premiumTrainings*=-1;
        }
    }

    // 4- Bitiş günündeki anrenman sayısını ekle
    addDayTrainings(endDate, getDayIndex(endDate), !1);

    return {normal: normalTrainings, premium: premiumTrainings};
}
function GetPointsPerTraining(isYoung){
    return (!!isYoung?parseInt(Tool.yTrainerLevel): parseInt(Tool.trainerLevel)/4)+.5;
}
function CalculateFutureStrength({
    startTime, youngUntil=null, endTime=null,
    skills,
    position,
    limit=990,
}){
    if(youngUntil==null && endTime==null) throw new Error('Argument exception!');

    let isYoung = typeof youngUntil == 'number',
        trainingRankingOfSkills = Tool.trainingPlan[position],
        applyTrainings = (skills, trainings, pointsPerTraining)=>{
            let nextSkills = skills.slice(0);
            for(let i=0; i<trainingRankingOfSkills.length && trainings>0 ; i++){
                let skillIndex = trainingRankingOfSkills[i],
                    cur_value = nextSkills[skillIndex];
                if(cur_value>=limit) continue;
                let apply_trainings = Math.min(
                    trainings,
                    GetMaxSkill(cur_value, pointsPerTraining, limit).required_trainings
                );
                nextSkills[skillIndex] += apply_trainings*pointsPerTraining;
                trainings -= apply_trainings;
            }
            return nextSkills;
        },
        calcStrength = skills=>{
            let strength = GetRealStrength(skills, position);
            return typeof strength == 'number'? Number2String(strength, 2).replace(',', '.'): strength;
        };

    let r = {
        start: {
            skills,
            strength: calcStrength(skills)
        }
    };

    let trainings = FindNumberOfTrainings(startTime, isYoung?youngUntil:endTime),
        pointsPerTraining = GetPointsPerTraining(isYoung),
        normal  = {trainings: trainings.normal},
        premium = {trainings: trainings.normal + trainings.premium};

    normal.strength = calcStrength(
        normal.skills = applyTrainings(skills, trainings.normal, pointsPerTraining)
    );
    premium.strength = calcStrength(
        premium.skills = applyTrainings(normal.skills, trainings.premium, pointsPerTraining)
    );

    if(!isYoung || typeof endTime != 'number' || youngUntil>=endTime){
        r.end = { normal, premium };
        return r;
    }

    r.endYouth = {normal, premium};

    normal  = {trainings: normal.trainings};
    premium = {trainings: premium.trainings};

    trainings = FindNumberOfTrainings(youngUntil, endTime);
    pointsPerTraining = GetPointsPerTraining(!1);

    normal.trainings += trainings.normal;
    premium.trainings += trainings.normal + trainings.premium;

    normal.strength = calcStrength(
        normal.skills = applyTrainings(r.endYouth.normal.skills, trainings.normal, pointsPerTraining)
    );
    premium.strength = calcStrength(
        premium.skills = applyTrainings(r.endYouth.premium.skills, trainings.normal + trainings.premium, pointsPerTraining)
    );

    r.end = { normal, premium};
    return r;
}
function GetMaxSkill(curVal, pointsPerTraining, limit=990){
    let diff = limit-curVal,
        numberOfTrainings = 0;
    if(diff>0){
        numberOfTrainings = Math.ceil(diff/pointsPerTraining);
        curVal = Math.min(1000,curVal+numberOfTrainings*pointsPerTraining);
    }
    return {max_value:curVal, required_trainings:numberOfTrainings};
}

function GetMessagesByTitle(title,func){
    let id,messages=[],message,_title;
    $('#deleteForm >table >tbody').find('.odd,.even').each(function(){
        id = $(this).attr('id').split('-')[1];
        message = $('#newscenter-preview-'+id);
        _title = message.find('h2').first().text().replace(/\s\s+/g, ' ').trim();
        if(_title == title) messages.push(message);
    });
    if(messages.length) func(messages);
}

function ApplyToolSetting(id, checked){
    switch(id){
        case 'blurSomeInfos':
            {
                let elements = $('#information-balance .currency-number,.credits-number, #clubinfocard > ul > li:nth-child(1) > span.currency-container > span.currency-number')
                .add($('#players-table-overview > tbody> tr:has(.open-card):not(:has([tooltip="tt_extendNotPossibleJunior"]))').find('>td:nth-child(4), >td:nth-child(5)'));
                let css = {'filter': 'blur(7px)'};
                if(checked){
                    elements.css(css);
                }
                else{
                    css = Object.keys(css).reduce((acc,r)=>{acc[r]=''; return acc;}, {});
                    elements.css(css);
                }
            }
            break;
    }
}

function createLeagueNavitagion(selectionOfParent, formBtn){
    let stop = !1;
    Tool.leagueNavigation = function(e){
        if(stop) return;
        stop = !0;
        let kc = e.keyCode;
        if(kc!=38 && kc!=40) return;
        if($(document.body).find('.ui-dialog:visible').length || ['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName)) return;

        e.preventDefault();

        let id, c, parentOfSelects = unsafeWindow.jQuery(selectionOfParent);
        let up = (sel)=>{
            if((sel[0].selectedIndex+1) == sel.find('>option').length) return !1;

            ++sel[0].selectedIndex;
            sel.trigger('change');
            let s = SelectBox.getByElement(sel[0]);
            if(s instanceof SelectBox) s.updateFromBase();

            let m = c?2:3;
            while(++id<3){
                s = SelectBox.instances[(id).toString()];
                if(s instanceof SelectBox) s.updateFromBase();
            }

            return !0;
        };
        let down = (sel)=>{
            if(sel[0].selectedIndex == 0) return !1;

            --sel[0].selectedIndex;
            sel.trigger('change');
            let s = SelectBox.getByElement(sel[0]);
            if(s instanceof SelectBox) s.updateFromBase();

            let t = id, m = c?2:3
            while(++t<3){
                s = parentOfSelects.find(`select[name="leagues[${t}]"]`)
                s[0].selectedIndex = s.find('>option').length-1;
                s.trigger('change');
                s = SelectBox.getByElement(s[0]);
                if(s instanceof SelectBox) s.updateFromBase();
            }

            return !0;
        };

        let sel = parentOfSelects.find('select[name="leagues[2]"]');
        if(!(c=(sel.val()=="0"))) id=2;
        else{
            id = 1;
            sel = parentOfSelects.find('select[name="leagues[1]"]');
        }


        let a = kc==38?up:down;
        if(id==2){
            if(!a(sel))
                if(!a(parentOfSelects.find(`select[name="leagues[${--id}]"]`)))
                    if(a(parentOfSelects.find(`select[name="leagues[${--id}]"]`)));
        }
        else{
            if(!a(sel))
                if(a(parentOfSelects.find(`select[name="leagues[${--id}]"]`)));
        }

        $(document.body).unbind('keyup', Tool.leagueNavigation);
        delete Tool.leagueNavigation;
        formBtn.click();
    };
    $(document.body).keydown(Tool.leagueNavigation);
}
